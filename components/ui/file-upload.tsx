'use client';

import { useState, useEffect, useMemo } from 'react';
import Dashboard from '@uppy/dashboard';
import { Button } from '@/components/ui/button';
import { X, FileImage, FileText, Loader2 } from 'lucide-react';
import { MotionPulse } from '@/components/ddd';
import { createUppy } from '@/lib/uppy/uppy';
import { useSession } from '@/lib/auth-client';

// Uppy CSS
import '@uppy/core/css/style.min.css';
import '@uppy/dashboard/css/style.min.css';
import '@uppy/webcam/css/style.min.css';

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
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const dashboardId = useMemo(() => `file-upload-dashboard-${Math.random().toString(36).substr(2, 9)}`, []);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);

  const [uppy] = useState(() => {
    if (!userId) return null;
    return createUppy({
      userId,
      onComplete: (result) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Transloadit complete result:', result);
        }
        const transloadit = (result as any).transloadit;
        if (transloadit && transloadit.length > 0) {
          const files = transloadit.flatMap((assembly: any) =>
            Object.values(assembly.results || {}).flatMap((stepResults: any) =>
              Array.isArray(stepResults) ? stepResults.map((file: any) => ({
                url: file.ssl_url || file.url,
                name: file.name,
                type: file.type || 'application/octet-stream'
              })) : []
            )
          );
          onUploadComplete(files);
          setUploadProgress(0);
        }
      },
      onError: (error) => {
        const err = error as any;
        let errorMessage = 'Upload failed';
        if (err.assembly) {
          errorMessage = `Transloadit processing failed: ${err.assembly.assembly_id}`;
        } else if (err.message) {
          errorMessage = err.message;
        }
        onUploadError?.(errorMessage);
        setHasError(true);
        setTimeout(() => setHasError(false), 3000);
        setUploadProgress(0);
      },
      onProgress: (progress: number) => setUploadProgress(progress)
    });
  });

  useEffect(() => {
    if (uppy && !uppy.getPlugin(dashboardId)) {
      uppy.use(Dashboard, {
        id: dashboardId,
        target: `#${dashboardId}`,
        inline: true,
        height: 180,
        width: '100%',
        hideProgressDetails: false,
        plugins: ['Webcam']
      });
    }
  }, [uppy, dashboardId]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (!uppy || !userId) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <MotionPulse error={hasError}>
          <div id={dashboardId} className="w-full border rounded" />
        </MotionPulse>
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress * 100}%` }}
            />
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