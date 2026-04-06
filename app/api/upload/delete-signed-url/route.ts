/**
 * Generate signed URL for Cloudflare R2 file deletion
 * DELETE /api/upload/delete-signed-url?fileKey=key-to-delete
 */

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import {
  createErrorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { checkRateLimit, uploadRateLimiter } from "@/lib/rate-limiter";
import { getR2S3Client } from "@/lib/server/r2-s3-client";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return createErrorResponse(new UnauthorizedError());
    }

    // Rate limiting check
    const rateLimitKey = `delete:${session.user.id}`;
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
    const fileKey = searchParams.get("fileKey");

    if (!fileKey) {
      return createErrorResponse(
        new ValidationError("Missing required parameter: fileKey")
      );
    }

    // Validate that the file key belongs to the user (basic security check)
    // File keys are in format: uploads/{userId}/...
    const keyParts = fileKey.split("/");
    if (
      keyParts.length < 3 ||
      keyParts[0] !== "uploads" ||
      keyParts[1] !== session.user.id
    ) {
      return createErrorResponse(
        new ValidationError("Unauthorized to delete this file")
      );
    }

    const command = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: fileKey,
    });

    // Generate signed URL valid for 5 minutes
    const signedUrl = await getSignedUrl(getR2S3Client(), command, {
      expiresIn: 5 * 60, // 5 minutes
    });

    return Response.json({
      signedUrl,
      fileKey,
    });
  } catch (error) {
    console.error("Error generating delete signed URL:", error);
    return createErrorResponse(error);
  }
}
