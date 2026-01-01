/**
 * Expense API routes
 * Handles CRUD operations for expenses
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
} from "@/lib/errors";
import { CreateExpenseSchema } from "@/lib/validations/expense";
import type {
  ExpenseInput,
  LineItemInput,
  DatabaseLineItem,
} from "@/lib/validations/expense";
import type { AuditEntry } from "@/types/expense";

// GET /api/expenses - List expenses with pagination and filtering
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all";
    const search = url.searchParams.get("search");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") || "20"))
    );
    const includeDeleted = url.searchParams.get("includeDeleted") === "true";

    // Build query
    const query: Record<string, unknown> = { userId: session.user.id };

    // Filter by type
    if (type === "private") {
      query.organizationId = null;
    } else if (type === "org") {
      query.organizationId = { $ne: null };
    }

    // Exclude soft-deleted expenses by default unless explicitly requested
    if (!includeDeleted) {
      query.deletedAt = null;
    }

    // Search filter with input validation and sanitization
    if (search) {
      // Validate search input length and content
      if (search.length > 100) {
        return createErrorResponse(
          new ValidationError("Search query too long (max 100 characters)")
        );
      }

      // Escape special regex characters to prevent ReDoS
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        { "lineItems.description": { $regex: sanitizedSearch, $options: "i" } },
        { "lineItems.category": { $regex: sanitizedSearch, $options: "i" } },
      ];
    }

    // Get total count
    const total = await Expense.countDocuments(query);

    // Get expenses with pagination
    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return Response.json({
      expenses: expenses.map((expense) => ({
        id: expense._id.toString(),
        userId: expense.userId,
        organizationId: expense.organizationId,
        managerIds: expense.managerIds,
        totalAmount: expense.totalAmount,
        state: expense.state,
        lineItems: expense.lineItems.map((item: DatabaseLineItem) => ({
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
      })),
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("[API] GET /api/expenses error:", error);
    return createErrorResponse(error);
  }
}

// POST /api/expenses - Create new expense
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(new ValidationError("Invalid JSON body"));
    }

    // Validate input
    const validationResult = CreateExpenseSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(
        (err: z.ZodIssue) => err.message
      );
      return createErrorResponse(
        new ValidationError(`Validation failed: ${errorMessages.join(", ")}`)
      );
    }

    const validatedData = validationResult.data;
    const expenseInput: ExpenseInput = {
      totalAmount: validatedData.totalAmount,
      managerIds: validatedData.managerIds,
      lineItems: validatedData.lineItems.map(
        (item): LineItemInput => ({
          amount: item.amount,
          date: item.date, // Keep as string for LineItemInput
          description: item.description,
          category: item.category,
          attachments: item.attachments || [],
        })
      ),
    };

    // Convert line item dates to Date objects
    const lineItemsWithDates = expenseInput.lineItems.map(
      (item: LineItemInput) => ({
        amount: item.amount,
        date: new Date(item.date),
        description: item.description,
        category: item.category,
        attachments: item.attachments || [], // Use provided attachments or empty array
      })
    );

    // Create expense
    const expense = new Expense({
      userId: session.user.id,
      organizationId: null, // For now, all expenses are private. TODO: Add organization support
      managerIds: expenseInput.managerIds,
      totalAmount: expenseInput.totalAmount,
      state:
        expenseInput.status === EXPENSE_STATES.PRE_APPROVAL_PENDING
          ? EXPENSE_STATES.PRE_APPROVAL_PENDING
          : expenseInput.status === EXPENSE_STATES.APPROVAL_PENDING
            ? EXPENSE_STATES.APPROVAL_PENDING
            : EXPENSE_STATES.DRAFT,
      lineItems: lineItemsWithDates,
      auditLog: [],
    });

    // Add audit entry
    const action =
      expenseInput.status === EXPENSE_STATES.PRE_APPROVAL_PENDING
        ? "created_and_submitted"
        : expenseInput.status === EXPENSE_STATES.APPROVAL_PENDING
          ? "created_and_submitted_for_approval"
          : "created";
    expense.addAuditEntry(action, session.user.id);

    // Save to database
    const savedExpense = await expense.save();

    // Return created expense
    return Response.json(
      {
        id: savedExpense._id.toString(),
        userId: savedExpense.userId,
        organizationId: savedExpense.organizationId,
        managerIds: savedExpense.managerIds,
        totalAmount: savedExpense.totalAmount,
        state: savedExpense.state,
        lineItems: savedExpense.lineItems.map((item: DatabaseLineItem) => ({
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/expenses error:", error);
    return createErrorResponse(error);
  }
}
