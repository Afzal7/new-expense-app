import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { Expense } from "../../../lib/models";
import { EXPENSE_STATES } from "../../../lib/models";
import { getChangedFields } from "../../../lib/utils";

describe("Expense Model Validation (T010)", () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/test"
      );
    }
  });

  afterAll(async () => {
    // Clean up
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections
    await Expense.deleteMany({});
  });

  describe("Required Fields Validation", () => {
    it("should require userId", async () => {
      const expense = new Expense({
        // userId missing
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(/userId.*required/);
    });

    it("should require totalAmount", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        // totalAmount missing
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(/totalAmount.*required/);
    });

    it("should have default state when not provided", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        // state missing - should default to DRAFT
        lineItems: [],
        auditLog: [],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
      expect(expense.state).toBe(EXPENSE_STATES.DRAFT);
    });

    it("should require managerIds array elements", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: [""], // Empty string should be invalid
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(/managerIds.*required/);
    });
  });

  describe("Data Types Validation", () => {
    it("should accept valid data types", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: "org123",
        managerIds: ["manager123"],
        totalAmount: 100.5,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [
          {
            amount: 50.25,
            date: new Date(),
            description: "Test item",
            category: "Travel",
            attachments: ["https://example.com/file.pdf"],
          },
        ],
        auditLog: [
          {
            action: "created",
            actorId: "user123",
            date: new Date(),
          },
        ],
        deletedAt: null,
      });

      await expect(expense.validate()).resolves.toBeUndefined();
    });

    it("should convert string totalAmount to number", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: "100", // Should be converted to number
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
      expect(typeof expense.totalAmount).toBe("number");
      expect(expense.totalAmount).toBe(100);
    });
  });

  describe("Amount Validation", () => {
    it("should reject totalAmount < 0", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: -1, // Should be >= 0
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(/totalAmount.*0/);
    });

    it("should accept totalAmount = 0", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 0,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
    });

    it("should accept totalAmount > 0", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
    });
  });

  describe("State Validation", () => {
    it("should accept all valid expense states", async () => {
      const validStates = Object.values(EXPENSE_STATES);

      for (const state of validStates) {
        const expense = new Expense({
          userId: "user123",
          organizationId: null,
          managerIds: ["manager123"],
          totalAmount: 100,
          state,
          lineItems:
            state === EXPENSE_STATES.DRAFT
              ? []
              : [
                  {
                    amount: 100,
                    date: new Date(),
                    description: "Test item",
                  },
                ],
          auditLog: [],
        });

        await expect(expense.validate()).resolves.toBeUndefined();
      }
    });

    it("should reject invalid state", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: "Invalid State",
        lineItems: [],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(/state.*enum/);
    });
  });

  describe("Line Item Validation", () => {
    it("should require line item amount", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [
          {
            // amount missing
            date: new Date(),
            description: "Test item",
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(/amount.*required/);
    });

    it("should require line item date", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [
          {
            amount: 50,
            // date missing
            description: "Test item",
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(/date.*required/);
    });

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

    it("should reject line item with amount < 0.01", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [
          {
            amount: 0.005, // Should be >= 0.01
            date: new Date(),
            description: "Test item",
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(/amount.*0\.01/);
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

    it("should accept line item with current date", async () => {
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
  });

  describe("Attachment Validation", () => {
    it("should accept valid attachment URLs", async () => {
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
            attachments: [
              "https://example.com/file.pdf",
              "http://example.com/image.jpg",
            ],
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
    });

    it("should reject invalid attachment URLs", async () => {
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
            attachments: ["invalid-url"],
          },
        ],
        auditLog: [],
      });

      await expect(expense.validate()).rejects.toThrow(
        "Invalid attachment URL format"
      );
    });
  });

  describe("Expense State Business Rules", () => {
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

  describe("Audit Log Validation", () => {
    it("should require audit log action", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [
          {
            // action missing
            actorId: "user123",
            date: new Date(),
          },
        ],
      });

      await expect(expense.validate()).rejects.toThrow(/action.*required/);
    });

    it("should require audit log actorId", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [
          {
            action: "created",
            // actorId missing
            date: new Date(),
          },
        ],
      });

      await expect(expense.validate()).rejects.toThrow(/actorId.*required/);
    });

    it("should accept valid audit log entry", async () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [
          {
            action: "created",
            actorId: "user123",
            date: new Date(),
            previousValues: undefined,
            updatedValues: { state: EXPENSE_STATES.DRAFT },
          },
        ],
      });

      await expect(expense.validate()).resolves.toBeUndefined();
    });
  });

  describe("Virtual Properties", () => {
    it("should return true for isPrivate when organizationId is null", () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: null,
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
      });

      expect(expense.isPrivate).toBe(true);
    });

    it("should return false for isPrivate when organizationId is set", () => {
      const expense = new Expense({
        userId: "user123",
        organizationId: "org123",
        managerIds: ["manager123"],
        totalAmount: 100,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
      });

      expect(expense.isPrivate).toBe(false);
    });
  });

  describe("Instance Methods", () => {
    describe("addAuditEntry", () => {
      it("should add audit entry with changed fields", () => {
        const expense = new Expense({
          userId: "user123",
          organizationId: null,
          managerIds: ["manager123"],
          totalAmount: 100,
          state: EXPENSE_STATES.DRAFT,
          lineItems: [],
          auditLog: [],
        });

        const previousValues = { totalAmount: 50 };
        const updatedValues = { totalAmount: 100 };

        expense.addAuditEntry(
          "updated",
          "user123",
          previousValues,
          updatedValues
        );

        expect(expense.auditLog).toHaveLength(1);
        expect(expense.auditLog[0].action).toBe("updated");
        expect(expense.auditLog[0].actorId).toBe("user123");
        expect(expense.auditLog[0].previousValues).toEqual({ totalAmount: 50 });
        expect(expense.auditLog[0].updatedValues).toEqual({ totalAmount: 100 });
      });

      it("should add audit entry without changed fields when no changes", () => {
        const expense = new Expense({
          userId: "user123",
          organizationId: null,
          managerIds: ["manager123"],
          totalAmount: 100,
          state: EXPENSE_STATES.DRAFT,
          lineItems: [],
          auditLog: [],
        });

        expense.addAuditEntry("created", "user123");

        expect(expense.auditLog).toHaveLength(1);
        expect(expense.auditLog[0].action).toBe("created");
        expect(expense.auditLog[0].actorId).toBe("user123");
        expect(expense.auditLog[0].previousValues).toBeUndefined();
        expect(expense.auditLog[0].updatedValues).toBeUndefined();
      });
    });
  });

  describe("Static Methods", () => {
    describe("findByUser", () => {
      it("should find expenses by userId", async () => {
        const _expense1 = await Expense.create({
          userId: "user123",
          organizationId: null,
          managerIds: ["manager1"],
          totalAmount: 100,
          state: EXPENSE_STATES.DRAFT,
          lineItems: [],
          auditLog: [],
        });

        await Expense.create({
          userId: "user456",
          organizationId: null,
          managerIds: ["manager2"],
          totalAmount: 200,
          state: EXPENSE_STATES.DRAFT,
          lineItems: [],
          auditLog: [],
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = await (Expense as any).findByUser("user123");
        expect(results).toHaveLength(1);
        expect(results[0]._id.toString()).toBe(_expense1._id.toString());
      });

      it("should filter by organizationId when provided", async () => {
        const _expense1 = await Expense.create({
          userId: "user123",
          organizationId: "org1",
          managerIds: ["manager1"],
          totalAmount: 100,
          state: EXPENSE_STATES.DRAFT,
          lineItems: [],
          auditLog: [],
        });

        await Expense.create({
          userId: "user123",
          organizationId: "org2",
          managerIds: ["manager2"],
          totalAmount: 200,
          state: EXPENSE_STATES.DRAFT,
          lineItems: [],
          auditLog: [],
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = await (Expense as any).findByUser("user123", "org1");
        expect(results).toHaveLength(1);
        expect(results[0].organizationId).toBe("org1");
      });

      it("should return expenses sorted by createdAt descending", async () => {
        const expense1 = await Expense.create({
          userId: "user123",
          organizationId: null,
          managerIds: ["manager1"],
          totalAmount: 100,
          state: EXPENSE_STATES.DRAFT,
          lineItems: [],
          auditLog: [],
        });

        await new Promise((resolve) => setTimeout(resolve, 10));

        const expense2 = await Expense.create({
          userId: "user123",
          organizationId: null,
          managerIds: ["manager2"],
          totalAmount: 200,
          state: EXPENSE_STATES.DRAFT,
          lineItems: [],
          auditLog: [],
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = await (Expense as any).findByUser("user123");
        expect(results).toHaveLength(2);
        expect(results[0]._id.toString()).toBe(expense2._id.toString());
        expect(results[1]._id.toString()).toBe(expense1._id.toString());
      });
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
