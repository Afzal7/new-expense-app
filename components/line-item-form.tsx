"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Upload, File, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  validateFile,
  validateFileName,
} from "@/lib/file-validation";
import { useFileUpload } from "@/hooks/use-file-upload";

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize fileKeyMap with existing attachments
  // Maps publicUrl -> fileKey for deletion
  const [fileKeyMap, setFileKeyMap] = useState<Record<string, string>>(() => {
    const initialAttachments = watch(`lineItems.${index}.attachments`) || [];
    const initialMap: Record<string, string> = {};

    initialAttachments.forEach((url: string) => {
      try {
        const urlObj = new URL(url);
        // Extract fileKey from URL path (remove leading slash)
        // URL format: https://bucket.../uploads/userId/timestamp-filename
        const fileKey = urlObj.pathname.substring(1); 
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

  const { uploadFile, deleteFile, isUploading, isDeleting } = useFileUpload();

  const handleFileUpload = async (file: File): Promise<void> => {
    try {
      validateFileName(file.name);
      await validateFile(file);

      const { publicUrl, fileKey } = await uploadFile(file);

      setFileKeyMap((prev) => ({ ...prev, [publicUrl]: fileKey }));

      const currentAttachments = watch(`lineItems.${index}.attachments`) || [];
      setValue(`lineItems.${index}.attachments`, [
        ...currentAttachments,
        publicUrl,
      ]);

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      // Toast handled by hook
    }
  };

  const removeAttachment = async (attachmentUrl: string) => {
    const fileKey = fileKeyMap[attachmentUrl];
    
    // Remove from UI immediately
    const currentAttachments = watch(`lineItems.${index}.attachments`) || [];
    setValue(
      `lineItems.${index}.attachments`,
      currentAttachments.filter((url: string) => url !== attachmentUrl)
    );

    if (fileKey) {
      try {
        await deleteFile(fileKey);
        setFileKeyMap((prev) => {
          const newMap = { ...prev };
          delete newMap[attachmentUrl];
          return newMap;
        });
        toast.success("File deleted successfully");
      } catch (error) {
        console.error("Error deleting file:", error);
        // Toast handled by hook
        // Ideally we might want to revert the UI change if deletion fails, 
        // but for now we prioritize UI responsiveness.
      }
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

              if (files.length > 5) {
                toast.error("Maximum 5 files allowed at once");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                return;
              }

              for (const file of files) {
                await handleFileUpload(file);
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
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
          {watch(`lineItems.${index}.attachments`)?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
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
                        disabled={isDeleting}
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
