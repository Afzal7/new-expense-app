/**
 * Generate signed URL for Cloudflare R2 file upload
 * GET /api/upload/signed-url?fileName=example.jpg&fileType=image/jpeg
 */

import { NextRequest } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";
import { auth } from "@/lib/auth";
import {
  createErrorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { uploadRateLimiter, checkRateLimit } from "@/lib/rate-limiter";
import { sanitizeFileName } from "@/lib/file-validation";

const s3Client = new S3Client({
  region: "auto",
  endpoint: env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

// File validation constants
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max file size

export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return createErrorResponse(new UnauthorizedError());
    }

    // Rate limiting check
    const rateLimitKey = `upload:${session.user.id}`;
    const rateLimitResult = checkRateLimit(uploadRateLimiter, rateLimitKey);

    if (!rateLimitResult.allowed) {
      return Response.json(
        {
          error: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");
    const fileSize = parseInt(searchParams.get("fileSize") || "0");

    if (!fileName || !fileType) {
      return createErrorResponse(
        new ValidationError(
          "Missing required parameters: fileName and fileType are required"
        )
      );
    }

    // Sanitize file name for S3 compatibility
    const sanitizedFileName = sanitizeFileName(fileName);

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(fileType.toLowerCase())) {
      return createErrorResponse(
        new ValidationError(
          "Invalid file type. Only images, PDFs, and documents are allowed"
        )
      );
    }

    // Validate file size
    if (fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
      return createErrorResponse(
        new ValidationError(
          `File size must be between 1 byte and ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        )
      );
    }

    // Generate a unique key for the file with user ID for better organization
    const fileKey = `uploads/${session.user.id}/${Date.now()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: fileKey,
      ContentType: fileType,
      // Add metadata for security tracking
      Metadata: {
        uploadedBy: session.user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate signed URL valid for 15 minutes
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 15 * 60, // 15 minutes
    });

    // Generate public URL for accessing the file after upload
    const publicUrl = `https://${env.S3_BUCKET}.t3.storage.dev/${fileKey}`;

    return Response.json({
      signedUrl,
      publicUrl,
      fileKey, // Include file key for tracking
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return createErrorResponse(error);
  }
}
