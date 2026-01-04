"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  Trash2,
  Camera,
  Plus,
  X,
  Plane,
  Utensils,
  Laptop,
  Car,
  Paperclip,
  Loader2,
} from "lucide-react";
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
  expanded: boolean;
  onExpand: () => void;
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
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
      active
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
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
      try {
        const { publicUrl } = await uploadFile(file);
        const currentAttachments = item.attachments || [];
        setValue(`lineItems.${index}.attachments`, [
          ...currentAttachments,
          publicUrl,
        ]);
        toast.success("Receipt uploaded");
      } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload receipt");
      } finally {
        setUploadingState(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = async (attIndex: number) => {
    const url = (item.attachments || [])[attIndex];
    if (!url) return;

    // Remove from UI first for responsiveness
    const newAtts = (item.attachments || []).filter((_, i) => i !== attIndex);
    setValue(`lineItems.${index}.attachments`, newAtts);

    // Try to delete from storage
    try {
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

  return (
    <div
      className={`bg-card rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${
        expanded
          ? "border-muted-foreground/30 shadow-lg ring-1 ring-muted"
          : "border-border shadow-sm"
      }`}
    >
      {/* Collapsed Header (Summary) */}
      <div
        onClick={onExpand}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
              expanded
                ? "bg-secondary text-secondary-foreground border-secondary"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {index + 1}
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">
              {item.description || "New Item"}
            </div>
            {!expanded && (
              <div className="text-xs text-muted-foreground">
                {item.category || "Uncategorized"} • {item.date}{" "}
                {item.attachments &&
                  item.attachments.length > 0 &&
                  `• 📎 ${item.attachments.length}`}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-foreground">
            ${(item.amount || 0).toFixed(2)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded Form */}
      {expanded && (
        <div className="p-4 pt-0 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {/* Amount & Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label 
                htmlFor={`amount-${index}`}
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1"
              >
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                  $
                </span>
                <input
                  id={`amount-${index}`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register(`lineItems.${index}.amount`, {
                    valueAsNumber: true,
                  })}
                  className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-7 pr-3 font-mono font-bold text-lg focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label 
                htmlFor={`date-${index}`}
                className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1"
              >
                Date
              </label>
              <input
                id={`date-${index}`}
                type="date"
                {...register(`lineItems.${index}.date`)}
                className="w-full bg-muted/50 border border-border rounded-xl py-3 px-3 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Merchant name, purpose..."
              {...register(`lineItems.${index}.description`)}
              className="w-full bg-muted/50 border border-border rounded-xl p-3 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
            />
          </div>

          {/* Category Quick Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  label={cat.label}
                  icon={<CategoryIcon category={cat.id} size={12} />}
                  active={item.category === cat.id}
                  onClick={() =>
                    setValue(`lineItems.${index}.category`, cat.id)
                  }
                />
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                Receipts
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-secondary flex items-center gap-1 hover:text-secondary/80 transition-colors"
                disabled={uploadingState}
              >
                {uploadingState ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                Add File
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {/* Add Button Box */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground/50 hover:border-secondary hover:text-secondary transition-colors"
                disabled={uploadingState}
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Previews */}
              {(item.attachments || []).map((url, i) => (
                <div
                  key={i}
                  className="relative flex-shrink-0 w-16 h-16 rounded-xl border border-border overflow-hidden group"
                >
                  {/* Simple image check */}
                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={url}
                      alt="Receipt"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-[10px] font-bold text-muted-foreground">
                      FILE
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="text-white bg-destructive rounded-full p-1 hover:bg-destructive/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-between items-center border-t border-border">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-destructive/70 hover:text-destructive text-xs font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Remove Item
            </button>
            <button
              type="button"
              onClick={onExpand} // Toggle to close
              className="text-muted-foreground text-xs font-bold hover:text-foreground transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
