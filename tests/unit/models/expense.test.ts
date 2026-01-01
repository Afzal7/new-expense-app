import { describe, it, expect, beforeAll } from "vitest";
import mongoose from "mongoose";
import { Expense } from "../../../lib/models";
import { EXPENSE_STATES } from "../../../lib/models";
import { getChangedFields } from "../../../lib/utils";

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

  describe("getChangedFields utility", () => {
    it("should return undefined when both objects are undefined", () => {
      expect(getChangedFields(undefined, undefined)).toBeUndefined();
    });

    it("should return the new object when previous is undefined", () => {
      const updated = { a: 1, b: 2 };
      expect(getChangedFields(undefined, updated)).toEqual(updated);
    });

    it("should return undefined when updated is undefined", () => {
      const previous = { a: 1, b: 2 };
      expect(getChangedFields(previous, undefined)).toBeUndefined();
    });

    it("should return undefined when objects are identical", () => {
      const obj = { a: 1, b: 2, c: { d: 3 } };
      expect(getChangedFields(obj, obj)).toBeUndefined();
    });

    it("should return only changed primitive fields", () => {
      const previous = { a: 1, b: 2, c: 3 };
      const updated = { a: 1, b: 4, c: 3 };
      expect(getChangedFields(previous, updated)).toEqual({ b: 4 });
    });

    it("should return changed arrays as complete arrays", () => {
      const previous = { items: [1, 2, 3] };
      const updated = { items: [1, 2, 4] };
      expect(getChangedFields(previous, updated)).toEqual({ items: [1, 2, 4] });
    });

    it("should handle nested objects", () => {
      const previous = { config: { a: 1, b: 2 } };
      const updated = { config: { a: 1, b: 3 } };
      expect(getChangedFields(previous, updated)).toEqual({
        config: { a: 1, b: 3 },
      });
    });

    it("should handle mixed changes", () => {
      const previous = {
        name: "test",
        count: 5,
        items: [1, 2],
        config: { enabled: true },
      };
      const updated = {
        name: "changed",
        count: 5,
        items: [1, 2],
        config: { enabled: true },
      };
      expect(getChangedFields(previous, updated)).toEqual({ name: "changed" });
    });
  });
});
