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
  calculatedTotal?: number;
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
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit Expense" : "Create Expense"}
        </h2>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor="totalAmount">Total Amount</Label>
            {isReadOnly ? (
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={totalAmount.toFixed(2)}
                readOnly
                className="bg-muted"
              />
            ) : register ? (
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                {...register("totalAmount", { valueAsNumber: true })}
              />
            ) : (
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={totalAmount.toFixed(2)}
              />
            )}
          </div>
          {!isReadOnly && onAutoFill && (
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAutoFill}
                className="whitespace-nowrap"
              >
                Auto Fill
              </Button>
            </div>
          )}
        </div>
        {errors?.totalAmount && (
          <p className="text-red-500 text-sm">{errors.totalAmount.message}</p>
        )}
        {isReadOnly ? (
          <p className="text-sm text-muted-foreground">
            Total amount is locked for approved expenses
          </p>
        ) : calculatedTotal !== undefined && calculatedTotal !== totalAmount ? (
          <p className="text-sm text-muted-foreground">
            Click "Auto Fill" to set total to ${calculatedTotal.toFixed(2)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sum of line item amounts
          </p>
        )}
      </div>
    </>
  );
}
