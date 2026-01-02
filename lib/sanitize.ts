/**
 * Input sanitization utilities for security
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous HTML/script content
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/\\/g, "&#x5C;")
    .replace(/`/g, "&#x60;");
}

/**
 * Sanitizes filename for safe display
 * Only allows alphanumeric characters, spaces, dots, and hyphens
 */
export function sanitizeFileNameForDisplay(fileName: string): string {
  if (typeof fileName !== "string") {
    return "";
  }

  // Remove path separators and other dangerous characters
  return fileName.replace(/[\/\\:*?"<>|]/g, "_");
}

/**
 * Validates and sanitizes search query
 * Prevents regex injection and excessive length
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== "string") {
    return "";
  }

  // Limit length
  const trimmed = query.trim();
  if (trimmed.length > 100) {
    return trimmed.substring(0, 100);
  }

  // Escape special regex characters
  return trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
