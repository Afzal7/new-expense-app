"use client";

import { useRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Upload, File } from "lucide-react";
import { toast } from "sonner";
import {
  validateFile,
  validateFileName,
  sanitizeFileName,
} from "@/lib/file-validation";
import { useOptimizedUpload } from "@/hooks/use-optimized-upload";

interface LineItemFormProps {
  index: number;
  onRemove: () => void;
}

export function LineItemForm({ index, onRemove }: LineItemFormProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<any>();
  const { uploadFileWithKey, uploads, cancelUpload } = useOptimizedUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize fileKeyMap with existing attachments
  const [fileKeyMap, setFileKeyMap] = useState<Record<string, string>>(() => {
    const initialAttachments = watch(`lineItems.${index}.attachments`) || [];
    const initialMap: Record<string, string> = {};

    // For existing attachments, extract fileKey from publicUrl
    // publicUrl format: https://bucket.t3.storage.dev/uploads/userId/timestamp-filename
    initialAttachments.forEach((url: string) => {
      try {
        const urlObj = new URL(url);
        const fileKey = urlObj.pathname.substring(1); // Remove leading slash
        initialMap[url] = fileKey;
      } catch (error) {
        console.warn(
          "Could not extract fileKey from existing attachment URL:",
          url
        );
      }
    });

    return initialMap;
  });

  // Cleanup uploaded files when component unmounts
  useEffect(() => {
    const currentFileKeyMap = fileKeyMap;
    const currentUploads = uploads;
    return () => {
      console.log("LineItemForm unmounting, cleaning up files");
      console.log("Current uploads state:", currentUploads);
      console.log("Current fileKeyMap:", currentFileKeyMap);

      // Clean up any uploaded files that are still in the uploads state
      Object.values(currentUploads).forEach(async (upload) => {
        if (upload.status === "completed" && upload.fileKey) {
          try {
            console.log("Cleaning up upload file:", upload.fileKey);
            await deleteFile(upload.fileKey);
          } catch (error) {
            console.error("Error cleaning up upload file on unmount:", error);
          }
        }
      });

      // Clean up any attachments that were added to the form
      // When a line item is removed, we need to delete all its attachments
      Object.values(currentFileKeyMap).forEach(async (fileKey) => {
        try {
          console.log(
            "Cleaning up attachment file on line item removal:",
            fileKey
          );
          await deleteFile(fileKey);
        } catch (error) {
          console.error(
            "Error cleaning up attachment file on line item removal:",
            error
          );
        }
      });
    };
  }, []);

  const handleFileUpload = async (file: File): Promise<void> => {
    try {
      console.log("Starting file upload for:", file.name);
      // Validate file name
      validateFileName(file.name);

      // Validate file content and size
      await validateFile(file);

      const { publicUrl, fileKey } = await uploadFileWithKey(file);
      console.log(
        "Upload successful - publicUrl:",
        publicUrl,
        "fileKey:",
        fileKey
      );

      // Store file key mapping for later deletion
      setFileKeyMap((prev) => ({ ...prev, [publicUrl]: fileKey }));
      console.log("Updated fileKeyMap:", {
        ...fileKeyMap,
        [publicUrl]: fileKey,
      });

      // Update form with new attachment
      const currentAttachments = watch(`lineItems.${index}.attachments`) || [];
      console.log("Current attachments before adding:", currentAttachments);
      setValue(`lineItems.${index}.attachments`, [
        ...currentAttachments,
        publicUrl,
      ]);
      console.log("Updated attachments:", [...currentAttachments, publicUrl]);

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    }
  };

  const deleteFile = async (fileKey: string): Promise<void> => {
    try {
      console.log("deleteFile called with fileKey:", fileKey);
      const response = await fetch(
        `/api/upload/delete-signed-url?fileKey=${encodeURIComponent(fileKey)}`,
        {
          method: "DELETE",
        }
      );
      console.log("Delete signed URL response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to get delete signed URL:", error);
        throw new Error(error.error || "Failed to get delete signed URL");
      }

      const { signedUrl } = await response.json();
      console.log("Got signed URL for deletion:", signedUrl);

      // Delete the file
      const deleteResponse = await fetch(signedUrl, {
        method: "DELETE",
      });
      console.log("File delete response status:", deleteResponse.status);

      if (!deleteResponse.ok) {
        console.error("Failed to delete file from storage");
        throw new Error("Failed to delete file");
      }
      console.log("File successfully deleted from storage");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const removeAttachment = async (attachmentUrl: string) => {
    console.log("removeAttachment called with:", attachmentUrl);
    console.log("Current fileKeyMap:", fileKeyMap);
    const currentAttachments = watch(`lineItems.${index}.attachments`) || [];
    console.log("Current attachments before removal:", currentAttachments);
    setValue(
      `lineItems.${index}.attachments`,
      currentAttachments.filter((url: string) => url !== attachmentUrl)
    );

    // Delete the file from storage
    const fileKey = fileKeyMap[attachmentUrl];
    console.log("FileKey found for attachment:", fileKey);
    if (fileKey) {
      console.log("Calling deleteFile with fileKey:", fileKey);
      await deleteFile(fileKey);
      setFileKeyMap((prev) => {
        const newMap = { ...prev };
        delete newMap[attachmentUrl];
        return newMap;
      });
      console.log("File deleted and fileKeyMap updated");
    } else {
      console.error("No fileKey found for attachment:", attachmentUrl);
    }
  };

  return (
    <div className="border p-4 rounded space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Line Item {index + 1}</h3>
        <Button
          type="button"
          onClick={onRemove}
          variant="destructive"
          size="sm"
        >
          <X className="h-4 w-4 mr-2" />
          Remove
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`lineItems.${index}.amount`}>Amount *</Label>
          <Input
            id={`lineItems.${index}.amount`}
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register(`lineItems.${index}.amount`, { valueAsNumber: true })}
          />
          {(errors.lineItems as any)?.[index]?.amount && (
            <p className="text-red-500 text-sm">
              {(errors.lineItems as any)[index]?.amount?.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor={`lineItems.${index}.date`}>Date *</Label>
          <Input
            id={`lineItems.${index}.date`}
            type="date"
            {...register(`lineItems.${index}.date`)}
          />
          {(errors.lineItems as any)?.[index]?.date && (
            <p className="text-red-500 text-sm">
              {(errors.lineItems as any)[index]?.date?.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor={`lineItems.${index}.description`}>Description</Label>
        <Input
          id={`lineItems.${index}.description`}
          placeholder="Brief description of the expense"
          {...register(`lineItems.${index}.description`)}
        />
      </div>

      <div>
        <Label htmlFor={`lineItems.${index}.category`}>Category</Label>
        <Input
          id={`lineItems.${index}.category`}
          placeholder="e.g., Travel, Office Supplies, Meals"
          {...register(`lineItems.${index}.category`)}
        />
      </div>

      <div>
        <Label>Attachments</Label>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx"
            className="hidden"
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);

              // Limit number of files
              if (files.length > 5) {
                toast.error("Maximum 5 files allowed at once");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                return;
              }

              for (const file of files) {
                try {
                  await handleFileUpload(file);
                } catch (error) {
                  // Error handled in handleFileUpload
                }
              }
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={Object.values(uploads).some(
              (upload) => upload.status === "uploading"
            )}
          >
            <Upload className="h-4 w-4 mr-2" />
            {Object.values(uploads).some(
              (upload) => upload.status === "uploading"
            )
              ? "Uploading..."
              : "Upload Files"}
          </Button>
          {watch(`lineItems.${index}.attachments`)?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
              {(watch(`lineItems.${index}.attachments`) as string[])?.map(
                (attachment: string, attachmentIndex: number) => {
                  const fileName = attachment.split("/").pop() || "";
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                  const isPDF = /\.pdf$/i.test(fileName);

                  return (
                    <div
                      key={attachmentIndex}
                      className="relative group border rounded-lg p-2 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      {/* Preview */}
                      <div className="aspect-square mb-2 bg-muted rounded flex items-center justify-center overflow-hidden">
                        {isImage ? (
                          <img
                            src={attachment}
                            alt={fileName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling?.classList.remove(
                                "hidden"
                              );
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-8 h-8 text-muted-foreground ${isImage ? "hidden" : ""}`}
                        >
                          {isPDF ? (
                            <svg
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-full h-full"
                            >
                              <path d="M8.5 2H15.5L19 5.5V22H5V2H8.5ZM15 3.5V7H18.5L15 3.5ZM7 4V20H17V9H13V4H7ZM9 12H11V18H9V12ZM13 10H15V18H13V10Z" />
                            </svg>
                          ) : (
                            <File className="w-full h-full" />
                          )}
                        </div>
                      </div>

                      {/* File name */}
                      <p
                        className="text-xs text-center text-muted-foreground truncate"
                        title={fileName}
                      >
                        {fileName}
                      </p>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        title="Remove file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
