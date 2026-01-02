"use client";

import { useState, useCallback } from "react";
import {
  validateFile,
  validateFileName,
  sanitizeFileName,
} from "@/lib/file-validation";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadState {
  fileKey: string;
  status: "uploading" | "completed" | "error";
  progress: UploadProgress;
  error?: string;
}

export function useOptimizedUpload() {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});

  const uploadFileWithKey = useCallback(
    async (file: File): Promise<{ publicUrl: string; fileKey: string }> => {
      // Validate file name
      validateFileName(file.name);

      // Validate file content and size
      await validateFile(file);

      const sanitizedFileName = sanitizeFileName(file.name);
      const fileKey = `uploads/${Date.now()}-${sanitizedFileName}`;

      // Start upload tracking
      setUploads((prev) => ({
        ...prev,
        [fileKey]: {
          fileKey,
          status: "uploading",
          progress: { loaded: 0, total: file.size, percentage: 0 },
        },
      }));

      try {
        // Get signed URL for upload
        const signedUrlResponse = await fetch("/api/upload/signed-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: sanitizedFileName,
            fileType: file.type,
            fileKey,
          }),
        });

        if (!signedUrlResponse.ok) {
          const error = await signedUrlResponse.json();
          throw new Error(error.error || "Failed to get signed URL");
        }

        const { signedUrl, publicUrl } = await signedUrlResponse.json();

        // Upload file with progress tracking
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress: UploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100),
              };
              setUploads((prev) => ({
                ...prev,
                [fileKey]: {
                  fileKey,
                  status: "uploading",
                  progress,
                },
              }));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploads((prev) => ({
                ...prev,
                [fileKey]: {
                  fileKey,
                  status: "completed",
                  progress: {
                    loaded: file.size,
                    total: file.size,
                    percentage: 100,
                  },
                },
              }));
              resolve({ publicUrl, fileKey });
            } else {
              const error = new Error(
                `Upload failed: ${xhr.status} ${xhr.statusText}`
              );
              setUploads((prev) => ({
                ...prev,
                [fileKey]: {
                  fileKey,
                  status: "error",
                  progress: { loaded: 0, total: file.size, percentage: 0 },
                  error: error.message,
                },
              }));
              reject(error);
            }
          });

          xhr.addEventListener("error", () => {
            const error = new Error("Network error during upload");
            setUploads((prev) => ({
              ...prev,
              [fileKey]: {
                fileKey,
                status: "error",
                progress: { loaded: 0, total: file.size, percentage: 0 },
                error: error.message,
              },
            }));
            reject(error);
          });

          xhr.open("PUT", signedUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setUploads((prev) => ({
          ...prev,
          [fileKey]: {
            fileKey,
            status: "error",
            progress: { loaded: 0, total: file.size, percentage: 0 },
            error: errorMessage,
          },
        }));
        throw error;
      }
    },
    []
  );

  const cancelUpload = useCallback((fileKey: string) => {
    // Note: XMLHttpRequest doesn't have a built-in cancel method
    // In a real implementation, you'd need to track the xhr instance
    // For now, just update the state
    setUploads((prev) => {
      const upload = prev[fileKey];
      if (upload && upload.status === "uploading") {
        return {
          ...prev,
          [fileKey]: {
            ...upload,
            status: "error",
            error: "Upload cancelled",
          },
        };
      }
      return prev;
    });
  }, []);

  return {
    uploadFileWithKey,
    uploads,
    cancelUpload,
  };
}
