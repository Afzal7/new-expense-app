"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import { useOptimizedUpload } from "@/hooks/use-optimized-upload";

interface OptimizedFileUploadProps {
  onUploadComplete?: (files: OptimizedUploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
}

interface OptimizedUploadedFile {
  id: string;
  file: File;
  publicUrl: string;
  status: "uploading" | "completed" | "error" | "cancelled" | "pending";
  progress: { loaded: number; total: number; percentage: number };
  error?: string;
}

const DEFAULT_MAX_SIZE = 100 * 1024 * 1024; // 100MB (increased for chunked uploads)
const DEFAULT_ACCEPTED_TYPES = [
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

export function OptimizedFileUpload({
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  className,
}: OptimizedFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [completedUploads, setCompletedUploads] = useState<
    OptimizedUploadedFile[]
  >([]);

  const { uploads, uploadFile, cancelUpload, retryUpload } = useOptimizedUpload(
    {
      onProgress: (uploadId, progress) => {
        // Progress updates are handled through the uploads state
      },
      onComplete: (uploadId, result) => {
        const upload = uploads[uploadId];
        if (upload) {
          const completedFile: OptimizedUploadedFile = {
            id: uploadId,
            file: upload.file,
            publicUrl: result.publicUrl,
            status: "completed",
            progress: upload.progress,
          };

          setCompletedUploads((prev) => [...prev, completedFile]);
          toast.success(`Successfully uploaded ${upload.file.name}`);
        }
      },
      onError: (uploadId, error) => {
        const upload = uploads[uploadId];
        if (upload) {
          toast.error(`Failed to upload ${upload.file.name}: ${error}`);
        }
      },
    }
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);

      try {
        const uploadPromises = acceptedFiles.map((file) => uploadFile(file));
        await Promise.allSettled(uploadPromises);

        const successfulUploads = Object.values(uploads)
          .filter((upload) => upload.status === "completed")
          .map((upload) => ({
            id: upload.id,
            file: upload.file,
            publicUrl: upload.publicUrl!,
            status: upload.status as "completed",
            progress: upload.progress,
          }));

        if (successfulUploads.length > 0) {
          onUploadComplete?.(successfulUploads);
        }

        const failedUploads = Object.values(uploads).filter(
          (upload) => upload.status === "error"
        );

        if (failedUploads.length > 0) {
          const errorMessage = `Failed to upload ${failedUploads.length} file${
            failedUploads.length > 1 ? "s" : ""
          }`;
          onUploadError?.(errorMessage);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        onUploadError?.(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFile, uploads, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce(
      (acc, type) => {
        acc[type] = [];
        return acc;
      },
      {} as Record<string, string[]>
    ),
    disabled: isUploading,
  });

  const removeFile = (uploadId: string) => {
    // For completed uploads, just remove from the list
    setCompletedUploads((prev) => prev.filter((f) => f.id !== uploadId));

    // For active uploads, cancel them
    if (uploads[uploadId]) {
      cancelUpload(uploadId);
    }
  };

  const retryFileUpload = (uploadId: string) => {
    retryUpload(uploadId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getUploadStatusBadge = (upload: any) => {
    switch (upload.status) {
      case "uploading":
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Uploading ({upload.progress.percentage}%)
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline">
            <Pause className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const allUploads = [
    ...Object.values(uploads),
    ...completedUploads.filter(
      (completed) => !Object.keys(uploads).includes(completed.id)
    ),
  ];

  return (
    <div className={className}>
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive
              ? "Drop files here"
              : "Drag & drop files here, or click to select"}
          </p>
          <p className="text-sm text-muted-foreground">
            Supports: {acceptedFileTypes.join(", ")}
          </p>
          <p className="text-sm text-muted-foreground">
            Max {maxFiles} files, up to {formatFileSize(maxSize)} each
          </p>
          <p className="text-xs text-muted-foreground">
            Files are uploaded directly for optimal performance
          </p>
        </div>
        {isUploading && (
          <div className="mt-4">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-2">
              Uploading files...
            </p>
          </div>
        )}
      </Card>

      {allUploads.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Upload Progress</h3>
          {allUploads.map((upload) => (
            <Card key={upload.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{upload.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(upload.file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getUploadStatusBadge(upload)}
                  {upload.status === "error" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryFileUpload(upload.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(upload.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {upload.status === "uploading" && (
                <div className="mt-3">
                  <Progress
                    value={upload.progress.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(upload.progress.loaded)} /{" "}
                    {formatFileSize(upload.progress.total)}
                  </p>
                </div>
              )}
              {upload.status === "error" && upload.error && (
                <Alert className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{upload.error}</AlertDescription>
                </Alert>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
