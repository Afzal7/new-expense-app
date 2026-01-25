import { z } from "zod";
import { EXPENSE_STATES } from "../constants/expense-states";

// Line item schema - minimal validation
export const LineItemSchema = z.object({
  amount: z.number().default(0),
  date: z.string().default(() => new Date().toISOString().split("T")[0]),
  description: z.string().default(""),
  category: z.string().default("Others"),
  attachments: z.array(z.string()).default([]),
});

// For forms and updates - everything optional with defaults
const FormLineItemSchema = z.object({
  amount: z.number().optional().default(0),
  date: z.string().optional().default(() => new Date().toISOString().split("T")[0]),
  description: z.string().optional().default(""),
  category: z.string().optional().default("Others"),
  attachments: z.array(z.string()).optional().default([]),
});

// Schema for creating expenses
export const CreateExpenseSchema = z.object({
  totalAmount: z.number().default(0),
  managerIds: z.array(z.string()).default([]),
  lineItems: z.array(FormLineItemSchema).default([]),
  status: z.string().optional().default(EXPENSE_STATES.DRAFT),
}).refine(data => {
  // Rule: Can only be pending if manager is added
  if (data.status === EXPENSE_STATES.PRE_APPROVAL_PENDING || data.status === EXPENSE_STATES.APPROVAL_PENDING) {
    return data.managerIds.length > 0;
  }
  return true;
}, {
  message: "At least one manager is required to submit for approval",
  path: ["managerIds"],
});

// Schema for form validation during editing
export const ExpenseFormSchema = z.object({
  totalAmount: z.number().default(0),
  managerIds: z.array(z.string()).default([]),
  lineItems: z.array(FormLineItemSchema).default([]),
});

// Schema for updating expenses
export const UpdateExpenseSchema = z.object({
  totalAmount: z.number().optional(),
  managerIds: z.array(z.string()).optional(),
  lineItems: z.array(FormLineItemSchema).optional(),
});

// Schema for submissions (status-based validation)
export const ExpenseSubmissionSchema = z.object({
  totalAmount: z.number().default(0),
  managerIds: z.array(z.string()).default([]),
  lineItems: z.array(FormLineItemSchema).default([]),
  status: z.string(),
}).refine(data => {
  if (data.status === EXPENSE_STATES.PRE_APPROVAL_PENDING || data.status === EXPENSE_STATES.APPROVAL_PENDING) {
    return data.managerIds.length > 0;
  }
  return true;
}, {
  message: "Manager required for approval",
  path: ["managerIds"],
});

// Export types
export type ExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type ExpenseFormData = z.infer<typeof ExpenseFormSchema>;
export type ExpenseUpdateData = z.infer<typeof UpdateExpenseSchema>;
export type ExpenseSubmissionData = z.infer<typeof ExpenseSubmissionSchema>;
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
