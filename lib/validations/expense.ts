import { z } from "zod";
import { EXPENSE_STATES } from "../constants/expense-states";

// Line item schema - for validated/complete line items
export const LineItemSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .refine(
      (date) => new Date(date) <= new Date(),
      "Date cannot be in the future"
    ),
  description: z.string().optional(),
  category: z.string().optional(),
  attachments: z.array(z.string()).optional().default([]),
});

// Line item schema for forms - allows incomplete data during editing
const FormLineItemSchema = z.object({
  amount: z.number().min(0, "Amount must be 0 or greater").optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .refine(
      (date) => new Date(date) <= new Date(),
      "Date cannot be in the future"
    ),
  description: z.string().optional(),
  category: z.string().optional(),
  attachments: z.array(z.string()).default([]),
});

// Schema for creating expenses - supports both drafts and submissions
export const CreateExpenseSchema = z.union([
  // For draft creation (no validations required)
  z.object({
    totalAmount: z.number().min(0).optional(),
    managerIds: z.array(z.string()).optional(),
    lineItems: z.array(FormLineItemSchema).optional(),
    status: z.literal(EXPENSE_STATES.DRAFT).optional(),
  }),
  // For submission creation (strict validations required)
  z.object({
    totalAmount: z.number().positive("Total amount must be greater than 0"),
    managerIds: z
      .array(z.string())
      .min(1, "At least one manager must be selected"),
    lineItems: z.array(LineItemSchema).optional().default([]),
    status: z.enum([
      EXPENSE_STATES.PRE_APPROVAL_PENDING,
      EXPENSE_STATES.APPROVAL_PENDING,
    ]),
  }),
]);

// Schema for form validation during editing (flexible for drafts)
export const ExpenseFormSchema = z.object({
  totalAmount: z
    .number()
    .min(0, "Total amount must be 0 or greater")
    .optional(),
  managerIds: z.array(z.string()).optional(),
  lineItems: z.array(FormLineItemSchema).optional(),
});

// Schema for backend validation of expense updates (flexible for drafts)
export const UpdateExpenseSchema = z.object({
  totalAmount: z
    .number()
    .min(0, "Total amount must be 0 or greater")
    .optional(),
  managerIds: z.array(z.string()).optional(),
  lineItems: z.array(FormLineItemSchema).optional(),
});

// Schema for backend validation of submissions (status-based validation)
export const ExpenseSubmissionSchema = z.union([
  // Draft status - no validations
  z.object({
    totalAmount: z.number().min(0).optional(),
    managerIds: z.array(z.string()).optional(),
    lineItems: z.array(FormLineItemSchema).optional(),
    status: z.literal(EXPENSE_STATES.DRAFT),
  }),
  // Submission statuses - strict validations
  z.object({
    totalAmount: z.number().positive("Total amount must be greater than 0"),
    managerIds: z
      .array(z.string())
      .min(1, "At least one manager must be selected"),
    lineItems: z.array(LineItemSchema).optional().default([]),
    status: z.enum([
      EXPENSE_STATES.PRE_APPROVAL_PENDING,
      EXPENSE_STATES.APPROVAL_PENDING,
      EXPENSE_STATES.PRE_APPROVED,
      EXPENSE_STATES.APPROVED,
      EXPENSE_STATES.REJECTED,
      EXPENSE_STATES.REIMBURSED,
    ]),
  }),
]);

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
