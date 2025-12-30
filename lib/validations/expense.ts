import { z } from 'zod';
import { ExpenseStatus } from '../../types/expense';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const lineItemSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    description: z.string().optional(),
    date: z.date().or(z.string().pipe(z.coerce.date())),
    attachments: z.array(z.string()).default([]),
});

export const createExpenseSchema = z.object({
    userId: z.string().regex(objectIdRegex, 'Invalid User ID format'),
    organizationId: z.string().regex(objectIdRegex, 'Invalid Organization ID format').optional(),
    managerId: z.string().regex(objectIdRegex, 'Invalid Manager ID format').optional(),
    status: z.nativeEnum(ExpenseStatus).default(ExpenseStatus.DRAFT),
    isPersonal: z.boolean().default(true),
    lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

export const updateExpenseStatusSchema = z.object({
    status: z.nativeEnum(ExpenseStatus),
    managerId: z.string().regex(objectIdRegex, 'Invalid Manager ID format').optional(), // Required when moving out of DRAFT for org expenses
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;
