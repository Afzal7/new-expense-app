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
        ? "bg-[#121110] text-white border-[#121110] shadow-sm"
        : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
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

  const categories = [
    { label: "Travel", icon: <Plane className="w-3 h-3" /> },
    { label: "Meals", icon: <Utensils className="w-3 h-3" /> },
    { label: "Software", icon: <Laptop className="w-3 h-3" /> },
    { label: "Office", icon: <Paperclip className="w-3 h-3" /> },
    { label: "Transport", icon: <Car className="w-3 h-3" /> },
  ];

  return (
    <div
      className={`bg-white rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${
        expanded
          ? "border-zinc-300 shadow-lg ring-1 ring-zinc-100"
          : "border-zinc-200 shadow-sm"
      }`}
    >
      {/* Collapsed Header (Summary) */}
      <div
        onClick={onExpand}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
              expanded
                ? "bg-[#FF8A65] text-white border-[#FF8A65]"
                : "bg-zinc-100 text-zinc-500 border-zinc-200"
            }`}
          >
            {index + 1}
          </div>
          <div>
            <div className="font-bold text-sm text-[#121110]">
              {item.description || "New Item"}
            </div>
            {!expanded && (
              <div className="text-xs text-zinc-400">
                {item.category || "Uncategorized"} • {item.date}{" "}
                {item.attachments &&
                  item.attachments.length > 0 &&
                  `• 📎 ${item.attachments.length}`}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-[#121110]">
            ${(item.amount || 0).toFixed(2)}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform ${
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
                className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1"
              >
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-zinc-400">
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
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-7 pr-3 font-mono font-bold text-lg focus:outline-none focus:ring-1 focus:ring-[#FF8A65] focus:border-[#FF8A65]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label 
                htmlFor={`date-${index}`}
                className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1"
              >
                Date
              </label>
              <input
                id={`date-${index}`}
                type="date"
                {...register(`lineItems.${index}.date`)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-3 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8A65] focus:border-[#FF8A65]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Merchant name, purpose..."
              {...register(`lineItems.${index}.description`)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-[#FF8A65] focus:border-[#FF8A65]"
            />
          </div>

          {/* Category Quick Select */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <CategoryPill
                  key={cat.label}
                  label={cat.label}
                  icon={cat.icon}
                  active={item.category === cat.label}
                  onClick={() =>
                    setValue(`lineItems.${index}.category`, cat.label)
                  }
                />
              ))}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                Receipts
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-bold text-[#FF8A65] flex items-center gap-1 hover:text-[#E64600]"
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
                className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center text-zinc-300 hover:border-[#FF8A65] hover:text-[#FF8A65] transition-colors"
                disabled={uploadingState}
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Previews */}
              {(item.attachments || []).map((url, i) => (
                <div
                  key={i}
                  className="relative flex-shrink-0 w-16 h-16 rounded-xl border border-zinc-200 overflow-hidden group"
                >
                  {/* Simple image check */}
                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      src={url}
                      alt="Receipt"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-[10px] font-bold text-zinc-500">
                      FILE
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="text-white bg-red-500 rounded-full p-1"
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
          <div className="pt-2 flex justify-between items-center border-t border-zinc-100">
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Remove Item
            </button>
            <button
              type="button"
              onClick={onExpand} // Toggle to close
              className="text-zinc-400 text-xs font-bold hover:text-[#121110]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
