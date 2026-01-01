import { describe, it, expect, beforeAll } from "vitest";
import mongoose from "mongoose";
import { Expense } from "../../../lib/models";
import { EXPENSE_STATES } from "../../../lib/models";

describe("Expense Model Validation", () => {
  beforeAll(async () => {
    // Ensure models are registered
    await mongoose.connection;
  });

  describe("Line Item Validation", () => {
    it("should reject line item with amount <= 0", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [
          {
            amount: 0, // Should be > 0
            date: new Date(),
            description: "Test item",
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(/amount/);
    });

    it("should accept line item with amount > 0", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [
          {
            amount: 50,
            date: new Date(),
            description: "Test item",
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
    });

    it("should reject line item with future date", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [
          {
            amount: 50,
            date: futureDate,
            description: "Test item",
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(
        "Date cannot be in the future"
      );
    });

    it("should accept line item with past or present date", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [
          {
            amount: 50,
            date: pastDate,
            description: "Test item",
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
    });
  });

  describe("Expense Validation", () => {
    it("should reject submitted expense without line items", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.PRE_APPROVAL_PENDING, // Submitted state
        lineItems: [], // No line items
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(
        "Expense must have at least one line item"
      );
    });

    it("should accept draft expense without line items", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT, // Draft state
        lineItems: [], // No line items allowed for draft
        auditLog: [],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
    });

    it("should accept submitted expense with line items", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.PRE_APPROVAL_PENDING,
        lineItems: [
          {
            amount: 100,
            date: new Date(),
            description: "Test item",
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
    });
  });
});
