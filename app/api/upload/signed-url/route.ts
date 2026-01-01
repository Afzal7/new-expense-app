/**
 * Generate signed URL for Cloudflare R2 file upload
 * GET /api/upload/signed-url?fileName=example.jpg&fileType=image/jpeg
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

const s3Client = new S3Client({
  region: "auto",
  endpoint: env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("fileName");
    const fileType = searchParams.get("fileType");

    if (!fileName || !fileType) {
      return Response.json(
        {
          error:
            "Missing required parameters: fileName and fileType are required",
        },
        { status: 400 }
      );
    }

    // Validate file type (basic check for common file types)
    const allowedTypes = [
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

    if (!allowedTypes.includes(fileType.toLowerCase())) {
      return Response.json(
        {
          error:
            "Invalid file type. Only images, PDFs, and documents are allowed",
        },
        { status: 400 }
      );
    }

    // Generate a unique key for the file
    const fileKey = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: fileKey,
      ContentType: fileType,
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
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return Response.json(
      {
        error: "Failed to generate signed URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
