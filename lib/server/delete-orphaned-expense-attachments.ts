import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import { attachmentUrlToUserScopedStorageKey } from "@/lib/utils/attachment-url";
import { getR2S3Client } from "@/lib/server/r2-s3-client";

function collectAttachmentUrls(
  lineItems: { attachments?: string[] }[]
): string[] {
  const seen = new Set<string>();
  for (const item of lineItems) {
    for (const url of item.attachments || []) {
      if (url) {
        seen.add(url);
      }
    }
  }
  return [...seen];
}

/**
 * Deletes R2 objects for attachment URLs that appeared on the previous line items
 * but are not present on the next snapshot (e.g. removed line item or cleared attachment).
 */
export async function deleteOrphanedExpenseAttachments(params: {
  ownerUserId: string;
  previousLineItems: { attachments?: string[] }[];
  nextLineItems: { attachments?: string[] }[];
}): Promise<void> {
  const previous = collectAttachmentUrls(params.previousLineItems);
  const nextSet = new Set(collectAttachmentUrls(params.nextLineItems));
  const orphaned = previous.filter((url) => !nextSet.has(url));

  if (orphaned.length === 0) {
    return;
  }

  const client = getR2S3Client();
  for (const url of orphaned) {
    const key = attachmentUrlToUserScopedStorageKey(url, params.ownerUserId);
    if (!key) {
      continue;
    }
    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: key,
        })
      );
    } catch (error) {
      console.error(
        "[expense] Failed to delete orphaned attachment from storage:",
        key,
        error
      );
    }
  }
}
