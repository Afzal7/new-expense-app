"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LineItemForm } from "../line-item-form";

interface LineItemsSectionProps {
  fields: any[];
  onAddLineItem: () => void;
  onRemoveLineItem: (index: number) => void;
}

export function LineItemsSection({
  fields,
  onAddLineItem,
  onRemoveLineItem,
}: LineItemsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Line Items</h3>
          <p className="text-sm text-muted-foreground">
            Add the individual expenses that make up this expense report
          </p>
        </div>
        <Button type="button" onClick={onAddLineItem} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="space-y-2">
              <p className="text-muted-foreground">No line items yet</p>
              <p className="text-sm text-muted-foreground">
                Click "Add Item" to start building your expense
              </p>
            </div>
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-card rounded-lg border p-6 relative group"
            >
              <div className="absolute -top-2 -left-2 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium shadow-sm">
                {index + 1}
              </div>
              <LineItemForm
                index={index}
                onRemove={() => onRemoveLineItem(index)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
