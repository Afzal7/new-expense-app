"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";

interface ExpenseFormHeaderProps {
  isEdit: boolean;
  totalAmount: number;
  expenseState?: string;
  errors?: any;
  register?: any;
  calculatedTotal: number;
  onAutoFill?: () => void;
}

export function ExpenseFormHeader({
  isEdit,
  totalAmount,
  expenseState,
  errors,
  register,
  calculatedTotal,
  onAutoFill,
}: ExpenseFormHeaderProps) {
  // Total amount is read-only when expense is Pre-Approved or Approved
  const isReadOnly =
    expenseState === EXPENSE_STATES.PRE_APPROVED ||
    expenseState === EXPENSE_STATES.APPROVED;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isEdit ? "Edit Expense" : "Expense Details"}
        </h2>
        <p className="text-muted-foreground">
          {isEdit
            ? "Update your expense information"
            : "Enter the details for your expense"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalAmount" className="text-sm font-medium">
          Total Amount
        </Label>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            {isReadOnly ? (
              <div className="relative">
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={totalAmount.toFixed(2)}
                  readOnly
                  className="bg-muted/50 h-11"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Locked
                  </span>
                </div>
              </div>
            ) : register ? (
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                {...register("totalAmount", { valueAsNumber: true })}
                className="h-11"
                placeholder="0.00"
              />
            ) : (
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={totalAmount.toFixed(2)}
                className="h-11"
              />
            )}
          </div>
          {!isReadOnly && onAutoFill && calculatedTotal > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={onAutoFill}
              className="h-11 px-4 whitespace-nowrap"
            >
              Auto Fill
            </Button>
          )}
        </div>
        {errors?.totalAmount && (
          <p className="text-sm text-destructive">
            {errors.totalAmount.message}
          </p>
        )}
        {isReadOnly ? (
          <p className="text-sm text-muted-foreground">
            This expense has been approved and the total cannot be changed
          </p>
        ) : (calculatedTotal ?? 0) > 0 ? (
          <p className="text-sm text-muted-foreground">
            Line items total: ${calculatedTotal.toFixed(2)}
            {(calculatedTotal ?? 0) !== totalAmount && (
              <span className="ml-2 text-primary font-medium">
                Click Auto Fill to match
              </span>
            )}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add line items to calculate the total automatically
          </p>
        )}
      </div>
    </div>
  );
}
