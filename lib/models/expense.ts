/**
 * Expense Mongoose Model
 *
 * Based on data-model.md and types/expense.ts
 */

import mongoose from "mongoose";
import { EXPENSE_STATES } from "../constants/expense-states";
import type { ExpenseState } from "../constants/expense-states";
import { getChangedFields } from "../utils";

// Re-export for convenience
export { EXPENSE_STATES };
export type { ExpenseState };

// Line Item Schema (embedded)
const LineItemSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      validate: {
        validator: (value: number) => value > 0,
        message: "Amount must be greater than 0",
      },
    },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          return value <= new Date();
        },
        message: "Date cannot be in the future",
      },
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: String, // file URLs
        validate: {
          validator: function (url: string) {
            // Basic URL validation
            return /^https?:\/\/.+/.test(url);
          },
          message: "Invalid attachment URL format",
        },
      },
    ],
  },
  { _id: false }
);

// Audit Log Schema (embedded)
const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "created",
        "updated",
        "submitted",
        "approved",
        "rejected",
        "reimbursed",
        "deleted",
        "restored",
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    actorId: {
      type: String,
      required: true,
    },
    previousValues: {
      type: mongoose.Schema.Types.Mixed,
    },
    updatedValues: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: false }
);

// Expense Schema
const ExpenseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    organizationId: {
      type: String,
      default: null,
      index: true,
    },
    managerIds: [
      {
        type: String,
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    state: {
      type: String,
      required: true,
      enum: Object.values(EXPENSE_STATES),
      default: EXPENSE_STATES.DRAFT,
    },
    lineItems: {
      type: [LineItemSchema],
      validate: {
        validator: function (this: mongoose.Document, lineItems: unknown[]) {
          // Only require line items if expense is submitted (not draft)
          if (this.get("state") === EXPENSE_STATES.DRAFT) {
            return true; // Draft can have no line items
          }
          return lineItems.length > 0;
        },
        message: "Expense must have at least one line item when submitted",
      },
    },
    auditLog: [AuditLogSchema],
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for performance
ExpenseSchema.index({ userId: 1, createdAt: -1 });
ExpenseSchema.index({ organizationId: 1, state: 1 });
ExpenseSchema.index({ state: 1 });

// Virtual for checking if expense is private (null organizationId)
ExpenseSchema.virtual("isPrivate").get(function () {
  return this.organizationId === null;
});

// Instance method to add audit entry
ExpenseSchema.methods.addAuditEntry = function (
  action: string,
  actorId: string,
  previousValues?: Record<string, unknown>,
  updatedValues?: Record<string, unknown>
) {
  // Only store fields that actually changed
  const changedFields = getChangedFields(previousValues, updatedValues);

  if (changedFields && Object.keys(changedFields).length > 0) {
    // Filter previousValues and updatedValues to only include changed fields
    const filteredPreviousValues: Record<string, unknown> = {};
    const filteredUpdatedValues: Record<string, unknown> = {};

    for (const key of Object.keys(changedFields)) {
      if (previousValues && key in previousValues) {
        filteredPreviousValues[key] = previousValues[key];
      }
      if (updatedValues && key in updatedValues) {
        filteredUpdatedValues[key] = updatedValues[key];
      }
    }

    this.auditLog.push({
      action,
      actorId,
      previousValues:
        Object.keys(filteredPreviousValues).length > 0
          ? filteredPreviousValues
          : undefined,
      updatedValues:
        Object.keys(filteredUpdatedValues).length > 0
          ? filteredUpdatedValues
          : undefined,
    });
  } else {
    // No changes, still add the entry but with undefined values
    this.auditLog.push({
      action,
      actorId,
      previousValues: undefined,
      updatedValues: undefined,
    });
  }
};

// Static method to find expenses by user
ExpenseSchema.statics.findByUser = function (
  userId: string,
  organizationId?: string | null
) {
  const query: Record<string, unknown> = { userId };
  if (organizationId !== undefined) {
    query.organizationId = organizationId;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Export the model
export const Expense =
  mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
