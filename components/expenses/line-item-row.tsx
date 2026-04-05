"use client";

import { Eye, Receipt } from "lucide-react";
import type { LineItem } from "@/types/expense";

interface LineItemRowProps {
  item: LineItem;
  onAttachmentClick?: (url: string) => void;
}

/**
 * LineItemRow: Displays a single receipt/item within the expense report.
 * Handles the "Attachment vs No Attachment" visual logic.
 */
export function LineItemRow({
  item,
  onAttachmentClick,
}: LineItemRowProps) {
  const hasAttachment = item.attachments && item.attachments.length > 0;
  const firstAttachment = hasAttachment ? item.attachments[0] : null;
  const isImage =
    firstAttachment &&
    /\.(jpg|jpeg|png|gif|webp)$/i.test(firstAttachment);

  const handleAttachmentClick = () => {
    if (firstAttachment && onAttachmentClick) {
      onAttachmentClick(firstAttachment);
    } else if (firstAttachment) {
      window.open(firstAttachment, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="group flex flex-col md:flex-row gap-4 p-4 border border-border bg-card rounded-2xl shadow-sm hover:border-border/60 transition-all">
      {/* Thumbnail Area */}
      <div className="w-full md:w-16 h-32 md:h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0 relative">
        {firstAttachment ? (
          <>
            {isImage ? (
              <img
                src={firstAttachment}
                alt="Receipt"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <span className="text-xs font-bold">PDF</span>
              </div>
            )}
            {/* Hover overlay for 'View' action */}
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer"
              onClick={handleAttachmentClick}
            >
              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Receipt className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-foreground text-lg">
              {item.description || "No description"}
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-1">
              {new Date(item.date).toLocaleDateString()} •{" "}
              <span className="bg-muted px-2 py-0.5 rounded text-foreground">
                {item.category || "Uncategorized"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-xl text-foreground">
              ${item.amount.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
