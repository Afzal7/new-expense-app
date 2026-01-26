"use client";

import { useRef, useState } from "react";
import {
  Camera,
  X,
  Receipt,
  Loader2,
} from "lucide-react";

const ACCENT_COLOR = "#D0FC42";
import { UseFormReturn } from "react-hook-form";
import { useFileUpload } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import type { ExpenseFormData } from "@/lib/utils/expense-form";
import { EXPENSE_CATEGORIES } from "@/lib/constants/categories";
import { CategoryIcon } from "@/components/shared/category-icon";

interface LineItemCardProps {
  index: number;
  form: UseFormReturn<ExpenseFormData>;
  remove: (index: number) => void;
  expanded?: boolean; // Not used - items are always fully visible
  onExpand?: () => void; // Not used - items are always fully visible
}

const CategoryPill = ({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
      active
        ? "bg-primary text-primary-foreground border-primary shadow-md"
        : "bg-card text-muted-foreground border-border hover:border-muted-foreground/30"
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

export function LineItemCard({
  index,
  form,
  remove,
  expanded,
  onExpand,
}: LineItemCardProps) {
  const { register, watch, setValue } = form;
  const item = watch(`lineItems.${index}`);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, deleteFile, isUploading } = useFileUpload();
  const [uploadingState, setUploadingState] = useState(false);

  // Fallback if item is undefined (e.g. during deletion/render cycles)
  if (!item) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingState(true);
      
      // Delete existing attachment if any (singular attachment)
      const currentAttachments = item.attachments || [];
      if (currentAttachments.length > 0) {
        const existingUrl = currentAttachments[0];
        // If it's a blob URL, just revoke it
        if (existingUrl.startsWith('blob:')) {
          URL.revokeObjectURL(existingUrl);
        } else {
          // Delete from server
          try {
            const urlObj = new URL(existingUrl);
            const fileKey = urlObj.pathname.startsWith("/") 
              ? urlObj.pathname.substring(1) 
              : urlObj.pathname;
            await deleteFile(fileKey);
          } catch (error) {
            console.error("Failed to delete existing attachment:", error);
          }
        }
      }
      
      // Create preview URL immediately for optimistic UI
      const previewUrl = URL.createObjectURL(file);
      
      // Replace with new preview URL (singular attachment)
      setValue(`lineItems.${index}.attachments`, [previewUrl]);
      
      try {
        // Upload file in background
        const { publicUrl } = await uploadFile(file);
        
        // Replace preview URL with actual URL
        setValue(`lineItems.${index}.attachments`, [publicUrl]);
        
        // Clean up preview URL
        URL.revokeObjectURL(previewUrl);
        
        toast.success("Receipt uploaded");
      } catch (error) {
        console.error("Upload failed", error);
        // Remove preview URL on error
        setValue(`lineItems.${index}.attachments`, []);
        URL.revokeObjectURL(previewUrl);
        toast.error("Failed to upload receipt");
      } finally {
        setUploadingState(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = async () => {
    const url = (item.attachments || [])[0];
    if (!url) return;

    // Remove from UI first for responsiveness (singular attachment)
    setValue(`lineItems.${index}.attachments`, []);

    // Try to delete from storage
    try {
      // If it's a blob URL, just revoke it
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
        return;
      }
      
      const urlObj = new URL(url);
      // Remove leading slash if present
      const fileKey = urlObj.pathname.startsWith("/") 
        ? urlObj.pathname.substring(1) 
        : urlObj.pathname;
      
      await deleteFile(fileKey);
    } catch (error) {
      // We don't necessarily want to block the UI if delete fails, 
      // but we should log it
      console.error("Failed to delete file from storage:", error);
    }
  };

  const hasAttachment = (item.attachments || []).length > 0;
  const attachment = hasAttachment ? item.attachments?.[0] : null;
  const isPreviewUrl = attachment?.startsWith('blob:');

  return (
    <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative group">
      {/* Remove Button */}
      <button
        onClick={() => remove(index)}
        className={`absolute top-3 right-3 z-20 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 ${
          hasAttachment
            ? "bg-card/80 backdrop-blur text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
            : "bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
        }`}
        aria-label={`Remove line item ${index + 1}`}
        type="button"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Attachment Preview or No Attachment Header */}
      {attachment ? (
        <div className="relative h-32 bg-zinc-100 flex items-center justify-center overflow-hidden">
          {(uploadingState || isPreviewUrl) ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              <span className="text-xs font-bold text-muted-foreground">
                {isPreviewUrl ? "Uploading..." : "Processing..."}
              </span>
            </div>
          ) : attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img
              src={attachment}
              alt="Receipt"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-[10px] font-bold text-muted-foreground">
              FILE
            </div>
          )}
          {!uploadingState && !isPreviewUrl && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 bg-[#D0FC42] text-primary text-[10px] font-bold px-2 py-1 rounded-lg">
                Attachment Added
              </div>
              <button
                onClick={removeAttachment}
                className="absolute top-3 left-3 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove attachment"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="relative h-12 bg-[#F7F7F7] border-b border-border flex items-center px-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Receipt className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              No Attachment
            </span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="p-5 space-y-5">
        {/* Description */}
        <div className="space-y-1">
          <input
            type="text"
            value={item.description || ""}
            onChange={(e) =>
              setValue(`lineItems.${index}.description`, e.target.value)
            }
            placeholder="Merchant / Title"
            className="w-full font-bold text-xl text-foreground placeholder:text-muted-foreground/30 focus:outline-none bg-transparent"
            autoFocus={!hasAttachment}
          />
          <p className="text-[10px] text-muted-foreground font-medium ml-0.5">
            e.g. Starbucks, Uber, Team Lunch
          </p>
        </div>

        {/* Amount & Date Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Amount
            </label>
            <div className="relative flex items-center h-10 border-b border-border focus-within:border-secondary transition-colors">
              <span className="font-bold text-muted-foreground mr-1">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register(`lineItems.${index}.amount`, {
                  valueAsNumber: true,
                })}
                className="w-full font-mono font-bold text-lg text-foreground bg-transparent focus:outline-none placeholder:text-muted-foreground/30 h-full"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Date <span className="text-secondary">*</span>
            </label>
            <div className="relative flex items-center h-10 border-b border-border focus-within:border-secondary transition-colors">
              <input
                type="date"
                {...register(`lineItems.${index}.date`)}
                className="w-full font-bold text-sm text-foreground bg-transparent focus:outline-none h-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Category Picker */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {EXPENSE_CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat.id}
                label={cat.label}
                icon={<CategoryIcon category={cat.id} size={12} />}
                active={item.category === cat.id}
                onClick={() => setValue(`lineItems.${index}.category`, cat.id)}
              />
            ))}
          </div>
        </div>

        {/* File Upload Button (if no attachment) */}
        {!hasAttachment && (
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingState || isUploading}
              className="w-full text-[10px] font-bold text-secondary flex items-center justify-center gap-1 hover:text-secondary/80 transition-colors disabled:opacity-50"
              aria-label="Add receipt attachment"
            >
              {uploadingState ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="w-3 h-3" />
                  Add Receipt
                </>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
