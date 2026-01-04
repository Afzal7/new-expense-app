"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useFileUpload } from "@/hooks/use-file-upload";

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

export function FileUpload({
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  className,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { uploadFile, deleteFile } = useFileUpload();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true);

      const newUploads: UploadedFile[] = acceptedFiles.map(file => ({
        file,
        publicUrl: "",
        status: "uploading"
      }));

      setUploadedFiles(prev => [...prev, ...newUploads]);

      const successfulUploads: UploadedFile[] = [];

      for (const file of acceptedFiles) {
        try {
          const { publicUrl } = await uploadFile(file);
          
          setUploadedFiles(prev => prev.map(u => 
            u.file === file ? { ...u, status: "completed", publicUrl } : u
          ));

          successfulUploads.push({
            file,
            publicUrl,
            status: "completed"
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Upload failed";
          setUploadedFiles(prev => prev.map(u => 
            u.file === file ? { ...u, status: "error", error: errorMessage } : u
          ));
        }
      }

      if (successfulUploads.length > 0) {
        onUploadComplete?.(successfulUploads);
        toast.success(`Uploaded ${successfulUploads.length} files`);
      }
      
      setIsUploading(false);
    },
    [uploadFile, onUploadComplete]
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

  const removeFile = async (fileToRemove: File, publicUrl?: string) => {
    // If it has a publicUrl, try to delete from server
    if (publicUrl) {
      try {
        const urlObj = new URL(publicUrl);
        const fileKey = urlObj.pathname.substring(1);
        await deleteFile(fileKey);
      } catch (error) {
        console.error("Failed to delete file from server:", error);
      }
    }
    setUploadedFiles((prev) => prev.filter((f) => f.file !== fileToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Uploaded Files</h3>
          {uploadedFiles.map((upload, index) => (
            <Card key={index} className="p-4">
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
                  {upload.status === "uploading" && (
                    <Badge variant="secondary">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Uploading
                    </Badge>
                  )}
                  {upload.status === "completed" && (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  {upload.status === "error" && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(upload.file, upload.publicUrl)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
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
