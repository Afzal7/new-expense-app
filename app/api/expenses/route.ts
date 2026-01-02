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
import { sanitizeSearchQuery } from "@/lib/sanitize";
import {
  transformExpensesToApiResponse,
  transformExpenseToApiResponse,
  transformLineItemsToDatabase,
} from "@/lib/utils/expense-api-transformers";

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
      const sanitizedSearch = sanitizeSearchQuery(search);

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
      expenses: transformExpensesToApiResponse(expenses),
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

    // Convert line item dates to Date objects
    const lineItemsWithDates = transformLineItemsToDatabase(
      validatedData.lineItems || []
    );

    // Create expense
    const expense = new Expense({
      userId: session.user.id,
      organizationId: null, // For now, all expenses are private. TODO: Add organization support
      managerIds: validatedData.managerIds,
      totalAmount: validatedData.totalAmount || 0,
      state: validatedData.status || EXPENSE_STATES.DRAFT,
      lineItems: lineItemsWithDates,
      auditLog: [],
    });

    // Add audit entry
    const action =
      validatedData.status === EXPENSE_STATES.PRE_APPROVAL_PENDING ||
      validatedData.status === EXPENSE_STATES.APPROVAL_PENDING
        ? "submitted"
        : "created";
    expense.addAuditEntry(action, session.user.id);

    // Save to database
    const savedExpense = await expense.save();

    // Return created expense
    return Response.json(transformExpenseToApiResponse(savedExpense), {
      status: 201,
    });
  } catch (error) {
    console.error("[API] POST /api/expenses error:", error);
    return createErrorResponse(error);
  }
}
