import Uppy from '@uppy/core';
import Transloadit from '@uppy/transloadit';

export interface CreateUppyOptions {
  userId: string;
  onComplete?: (result: unknown) => void;
  onError?: (error: unknown) => void;
}

export function createUppy({ userId, onComplete, onError }: CreateUppyOptions) {
  const uppy = new Uppy({
    autoProceed: true,
    restrictions: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['image/*', '.pdf'],
    },
  });

  uppy.use(Transloadit, {
    waitForEncoding: true,
    async assemblyOptions() {
      const response = await fetch('/api/transloadit-params', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Transloadit params');
      }

      return response.json();
    },
  });

  if (onComplete) {
    uppy.on('complete', onComplete);
  }

  if (onError) {
    uppy.on('error', onError);
  }

  return uppy;
}