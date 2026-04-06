import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

let client: S3Client | null = null;

export function getR2S3Client(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: env.ENDPOINT_URL_S3,
      credentials: {
        accessKeyId: env.ACCESS_KEY_ID,
        secretAccessKey: env.SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}
