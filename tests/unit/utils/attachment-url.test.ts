import { describe, expect, it } from "vitest";
import { attachmentUrlToUserScopedStorageKey } from "@/lib/utils/attachment-url";

describe("attachmentUrlToUserScopedStorageKey", () => {
  const userId = "user-abc";

  it("returns null for blob URLs", () => {
    expect(
      attachmentUrlToUserScopedStorageKey("blob:http://localhost/x", userId)
    ).toBeNull();
  });

  it("returns null when path is not scoped to the user", () => {
    expect(
      attachmentUrlToUserScopedStorageKey(
        "https://bucket.t3.storage.dev/uploads/other-user/file.pdf",
        userId
      )
    ).toBeNull();
  });

  it("extracts key for uploads/{userId}/... paths", () => {
    const url =
      "https://my-bucket.t3.storage.dev/uploads/user-abc/123-receipt.pdf";
    expect(attachmentUrlToUserScopedStorageKey(url, userId)).toBe(
      "uploads/user-abc/123-receipt.pdf"
    );
  });

  it("decodes percent-encoded path segments", () => {
    const url =
      "https://x.t3.storage.dev/uploads/user-abc/1-my%20file.pdf";
    expect(attachmentUrlToUserScopedStorageKey(url, userId)).toBe(
      "uploads/user-abc/1-my file.pdf"
    );
  });
});
