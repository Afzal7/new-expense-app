/**
 * Expense Item API routes
 * Handles operations on individual expenses
 */

import { auth } from "@/lib/auth";
import { connectMongoose, db } from "@/lib/db";
import {
  createErrorResponse,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { Expense, EXPENSE_STATES } from "@/lib/models/expense";
import {
  createLineItemsSnapshot,
  transformExpenseToApiResponse,
  transformLineItemsToDatabase,
} from "@/lib/utils/expense-api-transformers";
import { UpdateExpenseSchema } from "@/lib/validations/expense";
import type {
  AuditEntry,
  ExpenseInput,
  Expense as ExpenseType,
} from "@/types/expense";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import { z } from "zod";

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
    const expense: ExpenseType | null = await Expense.findById(id).lean();

    if (!expense) {
      return createErrorResponse(new NotFoundError("Expense not found"));
    }

    // Check authorization - user can access their own expenses, managers can access expenses they manage
    const isOwner = expense.userId === session.user.id;
    const isManager = expense.managerIds.includes(session.user.id);

    if (!isOwner && !isManager) {
      return createErrorResponse(new ForbiddenError());
    }

    // Get unique actor IDs from audit log
    const actorIds = [
      ...new Set(expense.auditLog.map((log: AuditEntry) => log.actorId)),
    ];

    // Fetch user information for all actors
    const users = await db
      .collection("user")
      .find(
        { _id: { $in: actorIds.map((id) => new ObjectId(id)) } },
        { projection: { name: 1, email: 1 } }
      )
      .toArray();

    // Create a map of userId to user info
    const userMap = new Map<string, { name: string; email: string }>();
    users.forEach((user) => {
      userMap.set(user._id.toString(), {
        name: user.name || "Unknown User",
        email: user.email || "",
      });
    });

    // Enhance audit log with user information
    const enhancedAuditLog = expense.auditLog.map((log: AuditEntry) => ({
      ...log,
      actorName: userMap.get(log.actorId.toString())?.name || "Unknown User",
      actorEmail: userMap.get(log.actorId.toString())?.email || "",
    }));

    // Create enhanced expense object
    const enhancedExpense = {
      ...expense,
      auditLog: enhancedAuditLog,
    };

    // Return expense
    return Response.json(transformExpenseToApiResponse(enhancedExpense));
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
      totalAmount: validatedData.totalAmount || 0,
      managerIds: validatedData.managerIds || [],
      lineItems: transformLineItemsToDatabase(validatedData.lineItems || []),
    };

    // Convert line item dates to Date objects
    const lineItemsWithDates = transformLineItemsToDatabase(
      validatedData.lineItems || []
    );

    // Store previous values for audit log
    const previousValues = {
      totalAmount: expense.totalAmount,
      managerIds: [...expense.managerIds],
      lineItems: createLineItemsSnapshot(expense.lineItems),
    };

    // Update expense fields
    expense.totalAmount = expenseInput.totalAmount;
    expense.managerIds = expenseInput.managerIds;
    expense.lineItems = lineItemsWithDates;

    // Store updated values for audit log
    const updatedValues = {
      totalAmount: expense.totalAmount,
      managerIds: [...expense.managerIds],
      lineItems: createLineItemsSnapshot(expense.lineItems),
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
    return Response.json(transformExpenseToApiResponse(savedExpense));
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

      // Allow submission from draft or pre-approved states
      if (
        expense.state !== EXPENSE_STATES.DRAFT &&
        expense.state !== EXPENSE_STATES.PRE_APPROVED
      ) {
        return createErrorResponse(
          new ForbiddenError(
            "Only draft or pre-approved expenses can be submitted"
          )
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

      // Update state based on current state
      if (expense.state === EXPENSE_STATES.DRAFT) {
        expense.state = EXPENSE_STATES.PRE_APPROVAL_PENDING;
      } else if (expense.state === EXPENSE_STATES.PRE_APPROVED) {
        expense.state = EXPENSE_STATES.APPROVAL_PENDING;
      }

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

      // For organization expenses, validate that the manager is an organization member
      if (expense.organizationId) {
        const member = await db.collection("member").findOne({
          organizationId: expense.organizationId,
          userId: session.user.id,
        });

        if (!member) {
          return createErrorResponse(
            new ForbiddenError(
              "Only organization members assigned as managers can approve expenses"
            )
          );
        }
      }

      // Can approve from pre-approval pending or approval pending states
      if (
        expense.state !== EXPENSE_STATES.PRE_APPROVAL_PENDING &&
        expense.state !== EXPENSE_STATES.APPROVAL_PENDING
      ) {
        return createErrorResponse(
          new ForbiddenError(
            "Only pre-approval pending or approval pending expenses can be approved"
          )
        );
      }

      // Store previous values for audit log
      const previousValues = {
        state: expense.state,
      };

      // Update state based on current state
      if (expense.state === EXPENSE_STATES.PRE_APPROVAL_PENDING) {
        expense.state = EXPENSE_STATES.PRE_APPROVED;
      } else if (expense.state === EXPENSE_STATES.APPROVAL_PENDING) {
        expense.state = EXPENSE_STATES.APPROVED;
      }

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

      // For organization expenses, validate that the manager is an organization member
      if (expense.organizationId) {
        const member = await db.collection("member").findOne({
          organizationId: expense.organizationId,
          userId: session.user.id,
        });

        if (!member) {
          return createErrorResponse(
            new ForbiddenError(
              "Only organization members assigned as managers can reject expenses"
            )
          );
        }
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
      // Determine if user can reimburse: managers or organization admins/owners
      let canReimburse = isManager;
      if (expense.organizationId) {
        const member = await db.collection("member").findOne({
          organizationId: expense.organizationId,
          userId: session.user.id,
        });

        if (member && (member.role === "admin" || member.role === "owner")) {
          canReimburse = true;
        }
      }

      if (!canReimburse) {
        return createErrorResponse(
          new ForbiddenError(
            "Only managers or organization admins/owners can reimburse expenses"
          )
        );
      }

      // For organization expenses, validate that the user is an organization member (for managers)
      if (expense.organizationId) {
        const member = await db.collection("member").findOne({
          organizationId: expense.organizationId,
          userId: session.user.id,
        });

        if (!member) {
          return createErrorResponse(
            new ForbiddenError(
              "Only organization members can reimburse expenses"
            )
          );
        }
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
    return Response.json(transformExpenseToApiResponse(savedExpense));
  } catch (error) {
    console.error("[API] PATCH /api/expenses/[id] error:", error);
    return createErrorResponse(error);
  }
}
