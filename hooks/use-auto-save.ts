import { useCallback, useEffect, useRef, useState } from "react";
import type { ExpenseInput } from "@/types/expense";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  totalAmount: number;
  managerIds: string[];
  lineItems: Array<{
    amount: number;
    date: string;
    description?: string;
    category?: string;
    attachments: string[];
  }>;
  onSave: (data: ExpenseInput) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave({
  totalAmount,
  managerIds,
  lineItems,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");

  const save = useCallback(
    async (data: ExpenseInput) => {
      if (!enabled) return;

      const dataString = JSON.stringify(data);
      if (dataString === lastSavedDataRef.current) {
        return; // No changes
      }

      setStatus("saving");
      try {
        await onSave(data);
        lastSavedDataRef.current = dataString;
        setStatus("saved");

        // Reset to idle after showing "saved" for a bit
        setTimeout(() => setStatus("idle"), 2000);
      } catch (error) {
        console.error("Auto-save error:", error);
        setStatus("error");
        // Reset to idle after showing error
        setTimeout(() => setStatus("idle"), 3000);
      }
    },
    [onSave, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      // Transform form data to ExpenseInput format
      const expenseInput: ExpenseInput = {
        totalAmount: totalAmount || 0,
        managerIds: managerIds || [],
        lineItems: (lineItems || []).map((item) => ({
          amount: item.amount || 0,
          date: new Date(item.date),
          description: item.description || "",
          category: item.category || "",
        })),
      };

      save(expenseInput);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [totalAmount, managerIds, lineItems, save, debounceMs, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { status };
}
