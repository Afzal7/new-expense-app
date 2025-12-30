'use client';

import { useState, useEffect } from 'react';
import { UploadDropzone } from '@uploadthing/react';
import { Button } from '@/components/ui/button';
import { X, FileImage, FileText, Loader2 } from 'lucide-react';
import { ourFileRouter, type OurFileRouter } from '@/lib/uploadthing/uploadthing';

interface FileUploadProps {
  onUploadComplete: (files: { url: string; name: string; type: string }[]) => void;
  onUploadError?: (error: string) => void;
  uploadedFiles?: { url: string; name: string; type: string }[];
  onRemoveFile?: (index: number) => void;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  uploadedFiles = [],
  onRemoveFile,
  className
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, []);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="relative">
          <UploadDropzone<OurFileRouter, "expenseReceiptUploader">
            endpoint="expenseReceiptUploader"
            onBeforeUploadBegin={(files) => {
              setSelectedFiles(files);
              return files;
            }}
            onClientUploadComplete={(res: any[]) => {
              setIsUploading(false);
              setSelectedFiles([]);
              if (res) {
                const files = res.map((file: any) => ({
                  url: file.url,
                  name: file.name,
                  type: file.type || 'application/octet-stream'
                }));
                onUploadComplete(files);
              }
            }}
            onUploadError={(error: Error) => {
              setIsUploading(false);
              setSelectedFiles([]);
              onUploadError?.(error.message);
            }}
            onUploadBegin={() => {
              setIsUploading(true);
            }}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-md">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-20 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-full h-20 bg-muted rounded border flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <p className="text-xs mt-1 truncate" title={file.name}>{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Attached Files ({uploadedFiles.length})</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {getFileIcon(file.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.type.startsWith('image/') ? 'Image' :
                         file.type === 'application/pdf' ? 'PDF' : 'Document'}
                      </p>
                    </div>
                  </div>
                  {onRemoveFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFile(index)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}