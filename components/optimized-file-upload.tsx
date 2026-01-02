"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useOptimizedUpload } from "@/hooks/use-optimized-upload";

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
}

interface UploadedFile {
  file: File;
  publicUrl: string;
  status: "uploading" | "completed" | "error";
  progress: { loaded: number; total: number; percentage: number };
  error?: string;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
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
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { uploadFileWithKey, uploads, cancelUpload } = useOptimizedUpload();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length + uploadedFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      for (const file of acceptedFiles) {
        if (file.size > maxSize) {
          toast.error(
            `File ${file.name} is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`
          );
          continue;
        }

        try {
          const { publicUrl, fileKey } = await uploadFileWithKey(file);

          const uploadedFile: UploadedFile = {
            file,
            publicUrl,
            status: "completed",
            progress: { loaded: file.size, total: file.size, percentage: 100 },
          };

          setUploadedFiles((prev) => [...prev, uploadedFile]);
          toast.success(`File ${file.name} uploaded successfully`);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
          const failedFile: UploadedFile = {
            file,
            publicUrl: "",
            status: "error",
            progress: { loaded: 0, total: file.size, percentage: 0 },
            error: errorMessage,
          };

          setUploadedFiles((prev) => [...prev, failedFile]);
          onUploadError?.(errorMessage);
        }
      }
    },
    [maxFiles, maxSize, uploadedFiles.length, uploadFileWithKey, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxSize,
    multiple: true,
  });

  const removeFile = useCallback(
    (index: number) => {
      const file = uploadedFiles[index];
      if (file.status === "uploading") {
        // Find the fileKey in uploads state
        const fileKey = Object.keys(uploads).find(
          (key) => uploads[key].status === "uploading"
        );
        if (fileKey) {
          cancelUpload(fileKey);
        }
      }
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [uploadedFiles, uploads, cancelUpload]
  );

  const completedFiles = uploadedFiles.filter((f) => f.status === "completed");
  if (completedFiles.length > 0) {
    onUploadComplete?.(completedFiles);
  }

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? "Drop files here..." : "Drag & drop files here"}
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          or click to browse (max {Math.round(maxSize / 1024 / 1024)}MB per
          file)
        </p>
        <Button type="button" variant="outline">
          Select Files
        </Button>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {uploadedFile.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {uploadedFile.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  {uploadedFile.status === "uploading" && (
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedFile.file.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    {uploadedFile.status === "uploading" && (
                      <Progress
                        value={uploadedFile.progress.percentage}
                        className="flex-1 h-2"
                      />
                    )}
                    <Badge
                      variant={
                        uploadedFile.status === "completed"
                          ? "default"
                          : uploadedFile.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {uploadedFile.status}
                    </Badge>
                  </div>
                  {uploadedFile.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Show current uploads from the hook */}
      {Object.keys(uploads).length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Current Uploads</h4>
          {Object.values(uploads).map((upload) => (
            <div key={upload.fileKey} className="flex items-center space-x-2">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Uploading...</span>
              <Progress
                value={upload.progress.percentage}
                className="flex-1 h-2"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
