"use client";

import { Button } from "@/components/ui/button";
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
    <>
      <div>
        <Button type="button" onClick={onAddLineItem} variant="outline">
          Add Line Item
        </Button>
      </div>

      {fields.map((field, index) => (
        <LineItemForm
          key={field.id}
          index={index}
          onRemove={() => onRemoveLineItem(index)}
        />
      ))}
    </>
  );
}
