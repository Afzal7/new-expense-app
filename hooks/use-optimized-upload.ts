"use client";

import { useState, useCallback, useRef } from "react";

const MAX_RETRIES = 3; // Maximum retry attempts
const RETRY_DELAY_BASE = 1000; // Base delay for exponential backoff (1 second)

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadState {
  id: string;
  file: File;
  status: "pending" | "uploading" | "completed" | "error" | "cancelled";
  progress: UploadProgress;
  publicUrl?: string;
  fileKey?: string;
  error?: string;
}

interface UseOptimizedUploadOptions {
  onProgress?: (fileId: string, progress: UploadProgress) => void;
  onComplete?: (fileId: string, result: { publicUrl: string }) => void;
  onError?: (fileId: string, error: string) => void;
  onFormCancel?: () => void;
}

export function useOptimizedUpload(options: UseOptimizedUploadOptions = {}) {
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const abortControllers = useRef<Record<string, AbortController>>({});

  const createUploadId = () =>
    `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const uploadFile = useCallback(
    async (file: File, _signal?: AbortSignal): Promise<string> => {
      const uploadId = createUploadId();
      const abortController = new AbortController();
      abortControllers.current[uploadId] = abortController;

      try {
        // Get signed URL for upload
        const response = await fetch(
          `/api/upload/signed-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&fileSize=${file.size}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get signed URL");
        }

        const { signedUrl, publicUrl, fileKey } = await response.json();

        // Initialize upload state
        const initialState: UploadState = {
          id: uploadId,
          file,
          status: "uploading",
          progress: { loaded: 0, total: file.size, percentage: 0 },
          fileKey,
        };

        setUploads((prev) => ({ ...prev, [uploadId]: initialState }));

        // Upload file with progress tracking and retries
        await new Promise<void>((resolve, reject) => {
          let lastError: Error | null = null;

          const attemptUpload = (attempt: number) => {
            if (attempt > MAX_RETRIES) {
              reject(lastError || new Error("Upload failed after all retries"));
              return;
            }

            if (abortController.signal.aborted) {
              reject(new Error("Upload cancelled"));
              return;
            }

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const progress: UploadProgress = {
                  loaded: event.loaded,
                  total: event.total,
                  percentage: Math.round((event.loaded / event.total) * 100),
                };

                setUploads((prev) => ({
                  ...prev,
                  [uploadId]: {
                    ...prev[uploadId],
                    progress,
                  },
                }));

                options.onProgress?.(uploadId, progress);
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status === 200) {
                setUploads((prev) => ({
                  ...prev,
                  [uploadId]: {
                    ...prev[uploadId],
                    status: "completed",
                    progress: {
                      loaded: file.size,
                      total: file.size,
                      percentage: 100,
                    },
                    publicUrl,
                  },
                }));

                options.onComplete?.(uploadId, { publicUrl });
                resolve();
              } else {
                lastError = new Error(
                  `Upload failed with status ${xhr.status}`
                );
                // Retry with exponential backoff
                const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
                setTimeout(() => attemptUpload(attempt + 1), delay);
              }
            });

            xhr.addEventListener("error", () => {
              lastError = new Error("Upload failed");
              // Retry with exponential backoff
              const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
              setTimeout(() => attemptUpload(attempt + 1), delay);
            });

            xhr.addEventListener("abort", () => {
              reject(new Error("Upload cancelled"));
            });

            xhr.open("PUT", signedUrl);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
          };

          attemptUpload(0);
        });

        return publicUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";

        setUploads((prev) => ({
          ...prev,
          [uploadId]: {
            ...prev[uploadId],
            status: "error",
            error: errorMessage,
          },
        }));

        options.onError?.(uploadId, errorMessage);
        throw error;
      } finally {
        delete abortControllers.current[uploadId];
      }
    },
    [options]
  );

  const uploadFileWithKey = useCallback(
    async (
      file: File,
      _signal?: AbortSignal
    ): Promise<{ publicUrl: string; fileKey: string }> => {
      const uploadId = createUploadId();
      const abortController = new AbortController();
      abortControllers.current[uploadId] = abortController;

      try {
        // Get signed URL for upload
        const response = await fetch(
          `/api/upload/signed-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&fileSize=${file.size}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get signed URL");
        }

        const { signedUrl, publicUrl, fileKey } = await response.json();

        // Initialize upload state
        const initialState: UploadState = {
          id: uploadId,
          file,
          status: "uploading",
          progress: { loaded: 0, total: file.size, percentage: 0 },
          fileKey,
        };

        setUploads((prev) => ({ ...prev, [uploadId]: initialState }));

        // Upload file with progress tracking and retries
        await new Promise<void>((resolve, reject) => {
          let lastError: Error | null = null;

          const attemptUpload = (attempt: number) => {
            if (attempt > MAX_RETRIES) {
              reject(lastError || new Error("Upload failed after all retries"));
              return;
            }

            if (abortController.signal.aborted) {
              reject(new Error("Upload cancelled"));
              return;
            }

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const progress: UploadProgress = {
                  loaded: event.loaded,
                  total: event.total,
                  percentage: Math.round((event.loaded / event.total) * 100),
                };

                setUploads((prev) => ({
                  ...prev,
                  [uploadId]: {
                    ...prev[uploadId],
                    progress,
                  },
                }));

                options.onProgress?.(uploadId, progress);
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status === 200) {
                setUploads((prev) => ({
                  ...prev,
                  [uploadId]: {
                    ...prev[uploadId],
                    status: "completed",
                    progress: {
                      loaded: file.size,
                      total: file.size,
                      percentage: 100,
                    },
                    publicUrl,
                  },
                }));

                options.onComplete?.(uploadId, { publicUrl });
                resolve();
              } else {
                lastError = new Error(
                  `Upload failed with status ${xhr.status}`
                );
                // Retry with exponential backoff
                const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
                setTimeout(() => attemptUpload(attempt + 1), delay);
              }
            });

            xhr.addEventListener("error", () => {
              lastError = new Error("Upload failed");
              // Retry with exponential backoff
              const delay = RETRY_DELAY_BASE * Math.pow(2, attempt);
              setTimeout(() => attemptUpload(attempt + 1), delay);
            });

            xhr.addEventListener("abort", () => {
              reject(new Error("Upload cancelled"));
            });

            xhr.open("PUT", signedUrl);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
          };

          attemptUpload(0);
        });

        return { publicUrl, fileKey };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";

        setUploads((prev) => ({
          ...prev,
          [uploadId]: {
            ...prev[uploadId],
            status: "error",
            error: errorMessage,
          },
        }));

        options.onError?.(uploadId, errorMessage);
        throw error;
      } finally {
        delete abortControllers.current[uploadId];
      }
    },
    [options]
  );

  const deleteFile = useCallback(async (fileKey: string): Promise<void> => {
    try {
      const response = await fetch(
        `/api/upload/delete-signed-url?fileKey=${encodeURIComponent(fileKey)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get delete signed URL");
      }

      const { signedUrl } = await response.json();

      // Delete the file
      const deleteResponse = await fetch(signedUrl, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      // Don't throw - cleanup failures shouldn't break the user flow
    }
  }, []);

  const cancelUpload = useCallback(
    async (uploadId: string) => {
      const abortController = abortControllers.current[uploadId];
      const upload = uploads[uploadId];

      if (abortController) {
        abortController.abort();
      }

      setUploads((prev) => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          status: "cancelled",
        },
      }));

      // Delete the uploaded file if it was completed
      if (upload?.status === "completed" && upload.fileKey) {
        await deleteFile(upload.fileKey);
      }
    },
    [uploads, deleteFile]
  );

  const retryUpload = useCallback(
    (uploadId: string) => {
      const upload = uploads[uploadId];
      if (!upload || upload.status !== "error") {
        return;
      }

      // Reset upload state and retry
      setUploads((prev) => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          status: "pending",
          error: undefined,
        },
      }));

      uploadFile(upload.file);
    },
    [uploads, uploadFile]
  );

  const cleanupUploadedFiles = useCallback(async () => {
    const completedUploads = Object.values(uploads).filter(
      (upload) => upload.status === "completed" && upload.fileKey
    );

    await Promise.all(
      completedUploads.map((upload) => deleteFile(upload.fileKey!))
    );
  }, [uploads, deleteFile]);

  // Cleanup function specifically for form cancellation
  const cancelAllUploads = useCallback(async () => {
    // Cancel any in-progress uploads
    Object.keys(abortControllers.current).forEach((uploadId) => {
      const abortController = abortControllers.current[uploadId];
      if (abortController) {
        abortController.abort();
      }
    });

    // Delete any completed uploads
    await cleanupUploadedFiles();

    // Clear all uploads state
    setUploads({});
    abortControllers.current = {};
  }, [cleanupUploadedFiles]);

  return {
    uploads,
    uploadFile,
    uploadFileWithKey,
    cancelUpload,
    retryUpload,
    cleanupUploadedFiles,
    cancelAllUploads,
  };
}
