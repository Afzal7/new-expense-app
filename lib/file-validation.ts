/**
 * File validation utilities for security
 */

import { ValidationError } from "./errors";

// File type signatures (magic bytes)
const FILE_SIGNATURES = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  gif: [0x47, 0x49, 0x46],
  pdf: [0x25, 0x50, 0x44, 0x46],
  zip: [0x50, 0x4b, 0x03, 0x04],
  rar: [0x52, 0x61, 0x72, 0x21],
} as const;

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
] as const;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Validates file type based on both MIME type and file content
 */
export async function validateFile(file: File): Promise<void> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  if (file.size === 0) {
    throw new ValidationError("File is empty");
  }

  // Check MIME type
  if (
    !ALLOWED_FILE_TYPES.includes(
      file.type as (typeof ALLOWED_FILE_TYPES)[number]
    )
  ) {
    throw new ValidationError(
      "Invalid file type. Only images, PDFs, and documents are allowed"
    );
  }

  // Check file content for known signatures (first 8 bytes)
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Validate based on declared MIME type
  switch (file.type) {
    case "image/jpeg":
    case "image/jpg":
      if (!matchesSignature(bytes, FILE_SIGNATURES.jpeg)) {
        throw new ValidationError("File content does not match JPEG format");
      }
      break;
    case "image/png":
      if (!matchesSignature(bytes, FILE_SIGNATURES.png)) {
        throw new ValidationError("File content does not match PNG format");
      }
      break;
    case "image/gif":
      if (!matchesSignature(bytes, FILE_SIGNATURES.gif)) {
        throw new ValidationError("File content does not match GIF format");
      }
      break;
    case "application/pdf":
      if (!matchesSignature(bytes, FILE_SIGNATURES.pdf)) {
        throw new ValidationError("File content does not match PDF format");
      }
      break;
    // For other file types, we rely on MIME type validation for now
    // In production, you might want to add more content validation
  }
}

/**
 * Checks if file bytes match expected signature
 */
function matchesSignature(
  bytes: Uint8Array,
  signature: readonly number[]
): boolean {
  if (bytes.length < signature.length) {
    return false;
  }

  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitizes filename for S3 compatibility while preserving file extension
 * Replaces invalid characters with safe alternatives
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and other dangerous characters
  let sanitized = fileName.replace(/[\/\\:*?"<>|]/g, "_");

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, "");

  // Split filename and extension
  const lastDotIndex = sanitized.lastIndexOf(".");
  let name = sanitized;
  let extension = "";

  if (lastDotIndex > 0 && lastDotIndex < sanitized.length - 1) {
    name = sanitized.substring(0, lastDotIndex);
    extension = sanitized.substring(lastDotIndex);
  }

  // Replace spaces and other invalid S3 characters with hyphens
  // S3 allows: a-z A-Z 0-9 ! - _ . * ' ( )
  // Replace anything not in this set with hyphens
  name = name.replace(/[^a-zA-Z0-9!_.*'()]/g, "-");

  // Remove multiple consecutive hyphens
  name = name.replace(/-+/g, "-");

  // Remove leading/trailing hyphens
  name = name.replace(/^-+|-+$/g, "");

  // Recombine name and extension
  let result = name + extension;

  // Limit length (ensure extension is preserved)
  if (result.length > 100) {
    const maxNameLength = 100 - extension.length;
    if (maxNameLength > 0) {
      name = name.substring(0, maxNameLength);
      result = name + extension;
    } else {
      result = result.substring(0, 100);
    }
  }

  // Ensure it's not empty
  if (!result.trim()) {
    result = "file";
  }

  return result;
}

/**
 * Validates filename
 */
export function validateFileName(fileName: string): void {
  if (!fileName || fileName.trim().length === 0) {
    throw new ValidationError("Filename cannot be empty");
  }

  if (fileName.length > 100) {
    throw new ValidationError("Filename too long (max 100 characters)");
  }

  // Check for dangerous patterns
  if (
    fileName.includes("..") ||
    fileName.includes("./") ||
    fileName.includes("\\")
  ) {
    throw new ValidationError("Invalid filename");
  }
}
