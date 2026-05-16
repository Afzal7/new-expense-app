import { z } from "zod";
import { EXPENSE_STATES } from "../constants/expense-states";

/** Coerce form/API amount input to a number; non-finite becomes NaN. */
function toLineAmountNumber(val: unknown): number {
  if (val === undefined || val === null || val === "") {
    return Number.NaN;
  }
  if (typeof val === "number") {
    return Number.isFinite(val) ? val : Number.NaN;
  }
  const n = Number(val);
  return Number.isFinite(n) ? n : Number.NaN;
}

/** Shared line-item amount: positive finite number after coercion. */
const lineItemAmountField = z
  .union([z.number(), z.string(), z.undefined()])
  .transform(toLineAmountNumber)
  .refine((n) => Number.isFinite(n) && n > 0, {
    message: "Amount must be greater than 0",
  });

/** Shared total amount: positive finite number after coercion. */
const totalAmountField = z
  .union([z.number(), z.string(), z.undefined()])
  .transform(toLineAmountNumber)
  .refine((n) => Number.isFinite(n) && n > 0, {
    message: "Total amount must be greater than 0",
  });

/** Line item shape shared by form, create, and update (output has amount: number). */
export const FormLineItemSchema = z.object({
  amount: lineItemAmountField,
  date: z
    .string()
    .optional()
    .default(() => new Date().toISOString().split("T")[0]),
  description: z.string().optional().default(""),
  category: z.string().optional().default("Others"),
  attachments: z.array(z.string()).optional().default([]),
});

/** Draft expense body: at least one line, positive total (aligned across FE/API). */
const expenseDraftBodySchema = z.object({
  totalAmount: totalAmountField,
  managerIds: z.array(z.string()).default([]),
  lineItems: z
    .array(FormLineItemSchema)
    .min(1, { message: "At least one line item is required" }),
});

// Line item schema (API/transform compatibility; minimal defaults)
export const LineItemSchema = z.object({
  amount: z.number().default(0),
  date: z.string().default(() => new Date().toISOString().split("T")[0]),
  description: z.string().default(""),
  category: z.string().default("Others"),
  attachments: z.array(z.string()).default([]),
});

// Schema for creating expenses
export const CreateExpenseSchema = expenseDraftBodySchema
  .extend({
    status: z.string().optional().default(EXPENSE_STATES.DRAFT),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === EXPENSE_STATES.PRE_APPROVAL_PENDING ||
      data.status === EXPENSE_STATES.APPROVAL_PENDING
    ) {
      if (data.managerIds.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "At least one manager is required to submit for approval",
          path: ["managerIds"],
        });
      }
    }
  });

// Schema for form validation during editing (same draft rules as API)
export const ExpenseFormSchema = expenseDraftBodySchema;

// Schema for updating expenses (full payload; same draft rules as create minus status)
export const UpdateExpenseSchema = expenseDraftBodySchema;

// Export types
/** Parsed create body (includes defaulted `status`). */
export type ExpenseCreateParsed = z.infer<typeof CreateExpenseSchema>;
/** JSON body for POST `/api/expenses` (may omit `status` for draft). */
export type ExpenseCreatePayload = z.input<typeof CreateExpenseSchema>;
/** JSON body for PUT `/api/expenses/[id]`. */
export type ExpenseUpdatePayload = z.input<typeof UpdateExpenseSchema>;
/** Alias for create payload (used by mutations and forms). */
export type ExpenseInput = ExpenseCreatePayload;
export type ExpenseFormData = z.input<typeof ExpenseFormSchema>;
export type ExpenseFormValues = z.infer<typeof ExpenseFormSchema>;
export type ExpenseUpdateData = z.infer<typeof UpdateExpenseSchema>;
export type LineItemInput = z.infer<typeof LineItemSchema>;
export type FormLineItemInput = z.infer<typeof FormLineItemSchema>;

// Database types (for internal use)
export type DatabaseLineItem = {
  amount: number;
  date: Date;
  description?: string;
  category?: string;
  attachments: string[];
};
