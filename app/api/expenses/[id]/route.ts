/**
 * Expense Item API routes
 * Handles operations on individual expenses
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/db";
import { Expense, EXPENSE_STATES } from "@/lib/models/expense";
import {
  createErrorResponse,
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "@/lib/errors";
import type {
  ExpenseInput,
  LineItemInput,
  LineItem,
  AuditEntry,
} from "@/types/expense";
import {
  UpdateExpenseSchema,
  type ExpenseUpdateData,
} from "@/lib/validations/expense";

// Zod schema for action validation
const ExpenseActionSchema = z.object({
  action: z.enum([
    "submit",
    "approve",
    "reject",
    "reimburse",
    "delete",
    "restore",
  ]),
});

// Zod schemas for validation (reuse from main route)
const LineItemInputSchema = z.object({
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
});

const ExpenseInputSchema = z.object({
  totalAmount: z.number().min(0, "Total amount must be non-negative"),
  managerIds: z.array(z.string()).min(1, "At least one manager ID is required"),
  lineItems: z.array(LineItemInputSchema).optional().default([]),
});

// GET /api/expenses/[id] - Get expense by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure database connection
    await connectMongoose();

    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return createErrorResponse(new UnauthorizedError());
    }

    const { id } = await params;

    // Find expense
    const expense = await Expense.findById(id).lean();

    if (!expense) {
      return createErrorResponse(new NotFoundError("Expense not found"));
    }

    // Check authorization - user can access their own expenses, managers can access expenses they manage
    const isOwner = expense.userId === session.user.id;
    const isManager = expense.managerIds.includes(session.user.id);

    if (!isOwner && !isManager) {
      return createErrorResponse(new ForbiddenError());
    }

    // Return expense
    return Response.json({
      id: expense._id.toString(),
      userId: expense.userId,
      organizationId: expense.organizationId,
      managerIds: expense.managerIds,
      totalAmount: expense.totalAmount,
      state: expense.state,
      lineItems: expense.lineItems.map((item: LineItem) => ({
        amount: item.amount,
        date: item.date.toISOString(),
        description: item.description,
        category: item.category,
        attachments: item.attachments,
      })),
      auditLog: expense.auditLog.map((entry: AuditEntry) => ({
        action: entry.action,
        date: entry.date.toISOString(),
        actorId: entry.actorId,
        previousValues: entry.previousValues,
        updatedValues: entry.updatedValues,
      })),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
      deletedAt: expense.deletedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("[API] GET /api/expenses/[id] error:", error);
    return createErrorResponse(error);
  }
}

// PUT /api/expenses/[id] - Update expense draft
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure database connection
    await connectMongoose();

    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return createErrorResponse(new UnauthorizedError());
    }

    const { id } = await params;

    // Find expense
    const expense = await Expense.findById(id);

    if (!expense) {
      return createErrorResponse(new NotFoundError("Expense not found"));
    }

    // Check authorization - user can only update their own expenses
    if (expense.userId !== session.user.id) {
      return createErrorResponse(new ForbiddenError());
    }

    // Prevent updates on submitted expenses (only allow updates on draft)
    if (expense.state !== EXPENSE_STATES.DRAFT) {
      return createErrorResponse(
        new ForbiddenError("Only draft expenses can be updated")
      );
    }

    // Prevent updates on deleted expenses
    if (expense.deletedAt) {
      return createErrorResponse(
        new ForbiddenError("Cannot update deleted expenses")
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(new ValidationError("Invalid JSON body"));
    }

    // Validate input
    const validationResult = UpdateExpenseSchema.safeParse(body);
    if (!validationResult.success) {
      // Group errors by field for better toast display
      const fieldErrors: Record<string, string[]> = {};
      const generalErrors: string[] = [];

      validationResult.error.issues.forEach((issue: z.ZodIssue) => {
        const fieldPath = issue.path.join(".");
        if (fieldPath) {
          if (!fieldErrors[fieldPath]) {
            fieldErrors[fieldPath] = [];
          }
          fieldErrors[fieldPath].push(issue.message);
        } else {
          generalErrors.push(issue.message);
        }
      });

      // Return structured error format for toast
      const errorResponse = {
        error: {
          message: "Please fix the validation errors below",
          details: {
            general: generalErrors,
            fields: fieldErrors,
          },
        },
      };

      return Response.json(errorResponse, { status: 400 });
    }

    const validatedData = validationResult.data;
    const expenseInput: ExpenseInput = {
      totalAmount: validatedData.totalAmount || 0, // Provide default if undefined
      managerIds: validatedData.managerIds || [], // Provide default if undefined
      lineItems: (validatedData.lineItems || []).map(
        (item): LineItemInput => ({
          amount: item.amount || 0, // Provide default if undefined
          date: new Date(item.date),
          description: item.description,
          category: item.category,
        })
      ),
    };

    // Convert line item dates to Date objects
    const lineItemsWithDates = expenseInput.lineItems.map((item) => ({
      amount: item.amount,
      date: new Date(item.date),
      description: item.description,
      category: item.category,
      attachments: [], // Attachments will be added via separate upload
    }));

    // Store previous values for audit log
    const previousValues = {
      totalAmount: expense.totalAmount,
      managerIds: [...expense.managerIds],
      lineItems: expense.lineItems.map((item: LineItem) => ({
        amount: item.amount,
        date: item.date.toISOString(),
        description: item.description,
        category: item.category,
        attachments: [...item.attachments],
      })),
    };

    // Update expense fields
    expense.totalAmount = expenseInput.totalAmount;
    expense.managerIds = expenseInput.managerIds;
    expense.lineItems = lineItemsWithDates;

    // Store updated values for audit log
    const updatedValues = {
      totalAmount: expense.totalAmount,
      managerIds: [...expense.managerIds],
      lineItems: expense.lineItems.map((item: LineItem) => ({
        amount: item.amount,
        date: item.date.toISOString(),
        description: item.description,
        category: item.category,
        attachments: [...item.attachments],
      })),
    };

    // Add audit entry
    expense.addAuditEntry(
      "updated",
      session.user.id,
      previousValues,
      updatedValues
    );

    // Save to database
    const savedExpense = await expense.save();

    // Return updated expense
    return Response.json({
      id: savedExpense._id.toString(),
      userId: savedExpense.userId,
      organizationId: savedExpense.organizationId,
      managerIds: savedExpense.managerIds,
      totalAmount: savedExpense.totalAmount,
      state: savedExpense.state,
      lineItems: savedExpense.lineItems.map((item: LineItem) => ({
        amount: item.amount,
        date: item.date.toISOString(),
        description: item.description,
        category: item.category,
        attachments: item.attachments,
      })),
      auditLog: savedExpense.auditLog.map((entry: AuditEntry) => ({
        action: entry.action,
        date: entry.date.toISOString(),
        actorId: entry.actorId,
        previousValues: entry.previousValues,
        updatedValues: entry.updatedValues,
      })),
      createdAt: savedExpense.createdAt.toISOString(),
      updatedAt: savedExpense.updatedAt.toISOString(),
      deletedAt: savedExpense.deletedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("[API] PUT /api/expenses/[id] error:", error);
    return createErrorResponse(error);
  }
}

// PATCH /api/expenses/[id] - Submit expense for pre-approval
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure database connection
    await connectMongoose();

    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return createErrorResponse(new UnauthorizedError());
    }

    const { id } = await params;

    // Find expense
    const expense = await Expense.findById(id);

    if (!expense) {
      return createErrorResponse(new NotFoundError("Expense not found"));
    }

    // Check authorization - user can submit their own expenses, managers can perform approval actions
    const isOwner = expense.userId === session.user.id;
    const isManager = expense.managerIds.includes(session.user.id);

    if (!isOwner && !isManager) {
      return createErrorResponse(new ForbiddenError());
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(new ValidationError("Invalid JSON body"));
    }

    // Validate action
    const validationResult = ExpenseActionSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (err: z.ZodIssue) => err.message
      );
      return createErrorResponse(
        new ValidationError(`Validation failed: ${errorMessages.join(", ")}`)
      );
    }

    const { action } = validationResult.data;

    if (action === "submit") {
      // Only owners can submit their own expenses
      if (!isOwner) {
        return createErrorResponse(
          new ForbiddenError("Only expense owners can submit expenses")
        );
      }

      // Only allow submission from draft state
      if (expense.state !== EXPENSE_STATES.DRAFT) {
        return createErrorResponse(
          new ForbiddenError("Only draft expenses can be submitted")
        );
      }

      // Business validation: must have line items to submit
      if (expense.lineItems.length === 0) {
        return createErrorResponse(
          new ValidationError("Cannot submit expense without line items")
        );
      }

      // Store previous values for audit log
      const previousValues = {
        state: expense.state,
      };

      // Update state to pre-approval pending
      expense.state = EXPENSE_STATES.PRE_APPROVAL_PENDING;

      // Store updated values for audit log
      const updatedValues = {
        state: expense.state,
      };

      // Add audit entry
      expense.addAuditEntry(
        "submitted",
        session.user.id,
        previousValues,
        updatedValues
      );
    } else if (action === "approve") {
      // Only managers can approve expenses
      if (!isManager) {
        return createErrorResponse(
          new ForbiddenError("Only managers can approve expenses")
        );
      }

      // Can only approve from pre-approval pending state
      if (expense.state !== EXPENSE_STATES.PRE_APPROVAL_PENDING) {
        return createErrorResponse(
          new ForbiddenError(
            "Only pre-approval pending expenses can be approved"
          )
        );
      }

      // Store previous values for audit log
      const previousValues = {
        state: expense.state,
      };

      // Update state to pre-approved
      expense.state = EXPENSE_STATES.PRE_APPROVED;

      // Store updated values for audit log
      const updatedValues = {
        state: expense.state,
      };

      // Add audit entry
      expense.addAuditEntry(
        "approved",
        session.user.id,
        previousValues,
        updatedValues
      );
    } else if (action === "reject") {
      // Only managers can reject expenses
      if (!isManager) {
        return createErrorResponse(
          new ForbiddenError("Only managers can reject expenses")
        );
      }

      // Can reject from various states
      if (
        ![
          EXPENSE_STATES.PRE_APPROVAL_PENDING,
          EXPENSE_STATES.PRE_APPROVED,
        ].includes(expense.state)
      ) {
        return createErrorResponse(
          new ForbiddenError(
            "Expense cannot be rejected from its current state"
          )
        );
      }

      // Store previous values for audit log
      const previousValues = {
        state: expense.state,
      };

      // Update state to rejected
      expense.state = EXPENSE_STATES.REJECTED;

      // Store updated values for audit log
      const updatedValues = {
        state: expense.state,
      };

      // Add audit entry
      expense.addAuditEntry(
        "rejected",
        session.user.id,
        previousValues,
        updatedValues
      );
    } else if (action === "reimburse") {
      // Only managers can reimburse expenses
      if (!isManager) {
        return createErrorResponse(
          new ForbiddenError("Only managers can reimburse expenses")
        );
      }

      // Can only reimburse approved expenses
      if (expense.state !== EXPENSE_STATES.APPROVED) {
        return createErrorResponse(
          new ForbiddenError("Only approved expenses can be reimbursed")
        );
      }

      // Store previous values for audit log
      const previousValues = {
        state: expense.state,
      };

      // Update state to reimbursed
      expense.state = EXPENSE_STATES.REIMBURSED;

      // Store updated values for audit log
      const updatedValues = {
        state: expense.state,
      };

      // Add audit entry
      expense.addAuditEntry(
        "reimbursed",
        session.user.id,
        previousValues,
        updatedValues
      );
    } else if (action === "delete") {
      // Only owners can delete their own expenses
      if (!isOwner) {
        return createErrorResponse(
          new ForbiddenError("Only expense owners can delete expenses")
        );
      }

      // Cannot delete already deleted expenses
      if (expense.deletedAt) {
        return createErrorResponse(
          new ForbiddenError("Expense is already deleted")
        );
      }

      // Store previous values for audit log
      const previousValues = {
        deletedAt: expense.deletedAt,
      };

      // Set deleted timestamp
      expense.deletedAt = new Date();

      // Store updated values for audit log
      const updatedValues = {
        deletedAt: expense.deletedAt,
      };

      // Add audit entry
      expense.addAuditEntry(
        "deleted",
        session.user.id,
        previousValues,
        updatedValues
      );
    } else if (action === "restore") {
      // Only owners can restore their own expenses
      if (!isOwner) {
        return createErrorResponse(
          new ForbiddenError("Only expense owners can restore expenses")
        );
      }

      // Cannot restore expenses that are not deleted
      if (!expense.deletedAt) {
        return createErrorResponse(
          new ForbiddenError("Expense is not deleted")
        );
      }

      // Store previous values for audit log
      const previousValues = {
        deletedAt: expense.deletedAt,
      };

      // Clear deleted timestamp
      expense.deletedAt = null;

      // Store updated values for audit log
      const updatedValues = {
        deletedAt: expense.deletedAt,
      };

      // Add audit entry
      expense.addAuditEntry(
        "restored",
        session.user.id,
        previousValues,
        updatedValues
      );
    }

    // Save to database
    const savedExpense = await expense.save();

    // Return updated expense
    return Response.json({
      id: savedExpense._id.toString(),
      userId: savedExpense.userId,
      organizationId: savedExpense.organizationId,
      managerIds: savedExpense.managerIds,
      totalAmount: savedExpense.totalAmount,
      state: savedExpense.state,
      lineItems: savedExpense.lineItems.map((item: LineItem) => ({
        amount: item.amount,
        date: item.date.toISOString(),
        description: item.description,
        category: item.category,
        attachments: item.attachments,
      })),
      auditLog: savedExpense.auditLog.map((entry: AuditEntry) => ({
        action: entry.action,
        date: entry.date.toISOString(),
        actorId: entry.actorId,
        previousValues: entry.previousValues,
        updatedValues: entry.updatedValues,
      })),
      createdAt: savedExpense.createdAt.toISOString(),
      updatedAt: savedExpense.updatedAt.toISOString(),
      deletedAt: savedExpense.deletedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("[API] PATCH /api/expenses/[id] error:", error);
    return createErrorResponse(error);
  }
}
