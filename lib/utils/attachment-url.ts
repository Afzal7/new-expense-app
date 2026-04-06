/**
 * Parse our R2 public attachment URLs into object keys scoped to a user.
 * Used before delete API calls and server-side orphan cleanup.
 */
export function attachmentUrlToUserScopedStorageKey(
  url: string,
  userId: string
): string | null {
  if (!url || url.startsWith("blob:")) {
    return null;
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return null;
  }
  try {
    const pathname = new URL(url).pathname;
    const raw = pathname.startsWith("/") ? pathname.slice(1) : pathname;
    const key = decodeURIComponent(raw);
    const prefix = `uploads/${userId}/`;
    if (!key.startsWith(prefix) || key.length <= prefix.length) {
      return null;
    }
    return key;
  } catch {
    return null;
  }
}
