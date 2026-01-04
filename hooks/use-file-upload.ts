"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UploadResponse {
  signedUrl: string;
  publicUrl: string;
  fileKey: string;
}

interface DeleteResponse {
  signedUrl: string;
  fileKey: string;
}

interface UseFileUploadOptions {
  onUploadSuccess?: (data: { publicUrl: string; fileKey: string }) => void;
  onUploadError?: (error: Error) => void;
  onDeleteSuccess?: (fileKey: string) => void;
  onDeleteError?: (error: Error) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // 1. Get signed URL
      const params = new URLSearchParams({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size.toString(),
      });

      const response = await fetch(`/api/upload/signed-url?${params.toString()}`, {
        method: "GET",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get signed URL");
      }

      const { signedUrl, publicUrl, fileKey } = (await response.json()) as UploadResponse;

      // 2. Upload file to S3 via signed URL
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      return { publicUrl, fileKey };
    },
    onSuccess: (data) => {
      options.onUploadSuccess?.(data);
    },
    onError: (error) => {
      options.onUploadError?.(error);
      toast.error(error.message || "Failed to upload file");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileKey: string) => {
      // 1. Get signed URL for deletion
      const params = new URLSearchParams({ fileKey });
      const response = await fetch(`/api/upload/delete-signed-url?${params.toString()}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get delete signed URL");
      }

      const { signedUrl } = (await response.json()) as DeleteResponse;

      // 2. Delete file via signed URL
      const deleteResponse = await fetch(signedUrl, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete file from storage");
      }

      return fileKey;
    },
    onSuccess: (fileKey) => {
      options.onDeleteSuccess?.(fileKey);
    },
    onError: (error) => {
      options.onDeleteError?.(error);
      toast.error(error.message || "Failed to delete file");
    },
  });

  return {
    uploadFile: uploadMutation.mutateAsync,
    deleteFile: deleteMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
