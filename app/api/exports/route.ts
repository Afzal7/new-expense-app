/**
 * Expense Export API Route
 * GET /api/exports?format=csv|pdf&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&userId=user123&status=Approved
 */

import { NextRequest } from "next/server";
import { stringify } from "csv-stringify/sync";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/db";
import { Expense } from "@/lib/models/expense";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import {
  createErrorResponse,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";

// Validation schema for export filters
const ExportFiltersSchema = z.object({
  format: z.enum(["csv", "pdf"]).default("csv"),
  startDate: z
    .string()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      "Invalid startDate format"
    ),
  endDate: z
    .string()
    .optional()
    .refine(
      (date) => !date || !isNaN(Date.parse(date)),
      "Invalid endDate format"
    ),
  userId: z.string().optional(),
  status: z
    .enum(Object.values(EXPENSE_STATES) as [string, ...string[]])
    .optional(),
});

// Type for the parsed filters
type ExportFilters = z.infer<typeof ExportFiltersSchema>;

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

    // Parse and validate query parameters
    const url = new URL(request.url);
    const filters: ExportFilters = ExportFiltersSchema.parse({
      format: url.searchParams.get("format") || "csv",
      startDate: url.searchParams.get("startDate"),
      endDate: url.searchParams.get("endDate"),
      userId: url.searchParams.get("userId"),
      status: url.searchParams.get("status"),
    });

    // Build query - user can export their own expenses or expenses they manage
    const query: Record<string, unknown> = {
      $or: [{ userId: session.user.id }, { managerIds: session.user.id }],
      deletedAt: null, // Exclude soft-deleted expenses
    };

    // Apply date range filter (based on line item dates)
    if (filters.startDate || filters.endDate) {
      const dateFilter: Record<string, unknown> = {};

      if (filters.startDate) {
        dateFilter.$gte = new Date(filters.startDate);
      }

      if (filters.endDate) {
        // Set end date to end of day
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
      }

      if (Object.keys(dateFilter).length > 0) {
        query["lineItems.date"] = dateFilter;
      }
    }

    // Apply user filter (if provided)
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Apply status filter
    if (filters.status) {
      query.state = filters.status;
    }

    // Fetch expenses with all related data
    const expenses = await Expense.find(query).sort({ createdAt: -1 }).lean();

    if (expenses.length === 0) {
      return createErrorResponse(
        new ValidationError("No expenses found matching the specified filters")
      );
    }

    // Generate file based on format
    if (filters.format === "csv") {
      return generateCSVResponse(expenses);
    } else {
      return generatePDFResponse(expenses);
    }
  } catch (error) {
    console.error("[API] GET /api/exports error:", error);

    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      const generalErrors: string[] = [];

      error.issues.forEach((issue) => {
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

      return Response.json(
        {
          error: {
            message: "Invalid export parameters",
            details: {
              general: generalErrors,
              fields: fieldErrors,
            },
          },
        },
        { status: 400 }
      );
    }

    return createErrorResponse(error);
  }
}

// Type for database line item
type DatabaseLineItem = {
  amount: number;
  date: Date;
  description?: string;
  category?: string;
  attachments: string[];
};

// Type for database expense (lean query result)
type DatabaseExpense = {
  _id: string;
  userId: string;
  organizationId?: string;
  managerIds: string[];
  totalAmount: number;
  state: string;
  lineItems: DatabaseLineItem[];
  auditLog: Array<{
    action: string;
    date: Date;
    actorId: string;
    previousValues?: Record<string, unknown>;
    updatedValues?: Record<string, unknown>;
  }>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

function generateCSVResponse(expenses: DatabaseExpense[]): Response {
  // Prepare CSV data
  const csvData: string[][] = [];

  // Add header row
  csvData.push([
    "Expense ID",
    "Status",
    "Total Amount",
    "User ID",
    "Organization ID",
    "Manager IDs",
    "Created Date",
    "Updated Date",
    "Line Item Date",
    "Line Item Amount",
    "Line Item Description",
    "Line Item Category",
    "Line Item Attachments",
  ]);

  // Add expense data (flatten line items to multiple rows)
  expenses.forEach((expense) => {
    const baseData = [
      expense._id.toString(),
      expense.state,
      expense.totalAmount.toString(),
      expense.userId,
      expense.organizationId || "",
      expense.managerIds.join(";"),
      expense.createdAt.toISOString(),
      expense.updatedAt.toISOString(),
    ];

    if (expense.lineItems && expense.lineItems.length > 0) {
      expense.lineItems.forEach((item: DatabaseLineItem) => {
        csvData.push([
          ...baseData,
          item.date.toISOString(),
          item.amount.toString(),
          item.description || "",
          item.category || "",
          item.attachments.join(";"),
        ]);
      });
    } else {
      // Expense with no line items
      csvData.push([...baseData, "", "", "", "", ""]);
    }
  });

  // Generate CSV string
  const csvString = stringify(csvData);

  // Return response with appropriate headers
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `expenses_export_${timestamp}.csv`;

  return new Response(csvString, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function generatePDFResponse(expenses: DatabaseExpense[]): Response {
  // Create PDF document
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text("Expense Report", 20, 20);

  // Add export date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

  // Prepare table data
  const tableData: string[][] = [];

  // Add header row
  tableData.push(["ID", "Status", "Amount", "User", "Date", "Line Items"]);

  // Add expense data
  expenses.forEach((expense) => {
    const lineItemsCount = expense.lineItems ? expense.lineItems.length : 0;
    const firstLineItem =
      expense.lineItems && expense.lineItems.length > 0
        ? `${expense.lineItems[0].description || "No description"} (${expense.lineItems[0].amount})`
        : "No line items";

    tableData.push([
      expense._id.toString().substring(0, 8) + "...",
      expense.state,
      `$${expense.totalAmount.toFixed(2)}`,
      expense.userId.substring(0, 8) + "...",
      new Date(expense.createdAt).toLocaleDateString(),
      lineItemsCount > 1
        ? `${firstLineItem} (+${lineItemsCount - 1} more)`
        : firstLineItem,
    ]);
  });

  // Add table to PDF
  autoTable(doc, {
    head: [tableData[0]],
    body: tableData.slice(1),
    startY: 45,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // ID
      1: { cellWidth: 30 }, // Status
      2: { cellWidth: 25 }, // Amount
      3: { cellWidth: 25 }, // User
      4: { cellWidth: 25 }, // Date
      5: { cellWidth: "auto" }, // Line Items
    },
  });

  // Add summary
  const pageHeight = doc.internal.pageSize.height;
  const finalY =
    (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY || 45;

  if (finalY + 40 < pageHeight) {
    doc.setFontSize(10);
    doc.text(`Total Expenses: ${expenses.length}`, 20, finalY + 20);
    doc.text(
      `Total Amount: $${expenses.reduce((sum, exp) => sum + exp.totalAmount, 0).toFixed(2)}`,
      20,
      finalY + 30
    );
  }

  // Generate PDF buffer
  const pdfBuffer = doc.output("arraybuffer");

  // Return response with appropriate headers
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `expenses_export_${timestamp}.pdf`;

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
