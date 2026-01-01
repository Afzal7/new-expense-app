"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Upload, File } from "lucide-react";
import { toast } from "sonner";

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
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const fileKey = `upload-${Date.now()}-${file.name}`;
    setUploadingFiles((prev) => new Set(prev).add(fileKey));

    try {
      // Get signed URL
      const signedUrlResponse = await fetch(
        `/api/upload/signed-url?fileName=${encodeURIComponent(file.name)}&fileType=${file.type}`
      );

      if (!signedUrlResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { signedUrl, publicUrl } = await signedUrlResponse.json();

      // Upload file
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // Update form with new attachment
      const currentAttachments = watch(`lineItems.${index}.attachments`) || [];
      setValue(`lineItems.${index}.attachments`, [
        ...currentAttachments,
        publicUrl,
      ]);

      toast.success("File uploaded successfully");
      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      throw error;
    } finally {
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
    }
  };

  const removeAttachment = (attachmentUrl: string) => {
    const currentAttachments = watch(`lineItems.${index}.attachments`) || [];
    setValue(
      `lineItems.${index}.attachments`,
      currentAttachments.filter((url: string) => url !== attachmentUrl)
    );
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
            {...register(`lineItems.${index}.amount`, {
              valueAsNumber: true,
            })}
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
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              for (const file of files) {
                try {
                  await uploadFile(file);
                } catch (error) {
                  // Error handled in uploadFile
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
            disabled={uploadingFiles.size > 0}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadingFiles.size > 0 ? "Uploading..." : "Upload Files"}
          </Button>
          {watch(`lineItems.${index}.attachments`)?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(watch(`lineItems.${index}.attachments`) as string[])?.map(
                (attachment: string, attachmentIndex: number) => (
                  <Badge
                    key={attachmentIndex}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <File className="h-3 w-3" />
                    <span className="truncate max-w-32">
                      {attachment.split("/").pop()}
                    </span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeAttachment(attachment)}
                    />
                  </Badge>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
