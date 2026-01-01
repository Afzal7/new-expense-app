import { z } from "zod";
import { EXPENSE_STATES } from "../constants/expense-states";

// Line item schema (shared)
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

// Schema for creating new expenses (draft or submission)
export const CreateExpenseSchema = z.object({
  totalAmount: z
    .number()
    .min(0, "Total amount must be 0 or greater")
    .optional(),
  managerIds: z
    .array(z.string())
    .min(1, "At least one manager must be selected"),
  lineItems: z.array(LineItemSchema),
  status: z
    .enum([
      EXPENSE_STATES.PRE_APPROVAL_PENDING,
      EXPENSE_STATES.APPROVAL_PENDING,
    ])
    .optional(), // Only allow submission statuses for creation
});

// Line item schema for form (attachments required for form handling)
const FormLineItemSchema = z.object({
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
  attachments: z.array(z.string()), // Required for form handling
});

// Schema for form validation (frontend - allows editing totalAmount)
export const ExpenseFormSchema = z.object({
  totalAmount: z.number().positive("Total amount must be greater than 0"),
  managerIds: z
    .array(z.string())
    .min(1, "At least one manager must be selected"),
  lineItems: z.array(FormLineItemSchema),
});

// Schema for backend validation (stricter - totalAmount required and positive for non-drafts)
export const ExpenseSubmissionSchema = z.object({
  totalAmount: z.number().positive("Total amount must be greater than 0"),
  managerIds: z
    .array(z.string())
    .min(1, "At least one manager must be selected"),
  lineItems: z.array(LineItemSchema),
  status: z.enum([
    EXPENSE_STATES.DRAFT,
    EXPENSE_STATES.PRE_APPROVAL_PENDING,
    EXPENSE_STATES.PRE_APPROVED,
    EXPENSE_STATES.APPROVAL_PENDING,
    EXPENSE_STATES.APPROVED,
    EXPENSE_STATES.REJECTED,
    EXPENSE_STATES.REIMBURSED,
  ]),
});

// Export types
export type ExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type ExpenseFormData = z.infer<typeof ExpenseFormSchema>;
export type ExpenseSubmissionData = z.infer<typeof ExpenseSubmissionSchema>;
export type LineItemInput = z.infer<typeof LineItemSchema>;

// Database types (for internal use)
export type DatabaseLineItem = {
  amount: number;
  date: Date;
  description?: string;
  category?: string;
  attachments: string[];
};
