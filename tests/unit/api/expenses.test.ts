import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { Expense, EXPENSE_STATES } from "../../../lib/models";

// Mock the auth module to avoid authentication issues in tests
vi.mock("../../../lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock the database connection
vi.mock("../../../lib/db", () => ({
  connectMongoose: vi.fn().mockResolvedValue(mongoose),
}));

// Import the actual route handlers
import { GET, POST } from "../../../app/api/expenses/route";

// Helper function to create a mock session
const createMockSession = (userId: string) => ({
  user: {
    id: userId,
    email: "test@example.com",
    emailVerified: true,
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: {
    id: "session-123",
    userId,
    token: "token-123",
    expiresAt: new Date(Date.now() + 3600000),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
});

// Helper function to create mock request headers
const createMockHeaders = (headers: Record<string, string> = {}) => {
  const headersObj = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    headersObj.set(key, value);
  });
  return headersObj;
};

describe("Expense API Routes", () => {
  let testUserId: string;
  let testExpenseId: string;

  beforeEach(async () => {
    // Create test data
    testUserId = "test-user-123";

    // Create a test expense in the database
    const testExpense = new Expense({
      userId: testUserId,
      organizationId: null,
      managerIds: ["manager-123"],
      totalAmount: 150.0,
      state: EXPENSE_STATES.DRAFT,
      lineItems: [
        {
          amount: 75.0,
          date: new Date("2024-01-15"),
          description: "Office supplies",
          category: "Office",
        },
        {
          amount: 75.0,
          date: new Date("2024-01-16"),
          description: "Coffee meeting",
          category: "Meals",
        },
      ],
      auditLog: [],
    });

    const savedExpense = await testExpense.save();
    testExpenseId = savedExpense._id.toString();
  });

  afterEach(async () => {
    // Clean up test data
    await Expense.deleteMany({});
    vi.clearAllMocks();
  });

  describe("GET /api/expenses", () => {
    it("should return paginated expenses for authenticated user", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        headers: createMockHeaders(),
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1);
      expect(data.expenses[0].id).toBe(testExpenseId);
      expect(data.expenses[0].userId).toBe(testUserId);
      expect(data.expenses[0].totalAmount).toBe(150.0);
      expect(data.expenses[0].state).toBe(EXPENSE_STATES.DRAFT);
      expect(data.expenses[0].lineItems).toHaveLength(2);
      expect(data.total).toBe(1);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
      expect(data.totalPages).toBe(1);
    });

    it("should filter expenses by type", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?type=private",
        {
          headers: createMockHeaders(),
        }
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1);
      expect(data.expenses[0].organizationId).toBeNull();
    });

    it("should search expenses by description", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?search=office",
        {
          headers: createMockHeaders(),
        }
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1);
    });

    it("should handle pagination parameters", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?page=2&limit=10",
        {
          headers: createMockHeaders(),
        }
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
      expect(data.expenses).toHaveLength(0); // No expenses on page 2
    });

    it("should exclude soft-deleted expenses by default", async () => {
      // Create a soft-deleted expense
      const deletedExpense = new Expense({
        userId: testUserId,
        organizationId: null,
        managerIds: ["manager-456"],
        totalAmount: 50.0,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
        deletedAt: new Date(),
      });
      await deletedExpense.save();

      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        headers: createMockHeaders(),
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1); // Only the non-deleted expense
      expect(data.total).toBe(1);
    });

    it("should include soft-deleted expenses when requested", async () => {
      // Create a soft-deleted expense
      const deletedExpense = new Expense({
        userId: testUserId,
        organizationId: null,
        managerIds: ["manager-456"],
        totalAmount: 50.0,
        state: EXPENSE_STATES.DRAFT,
        lineItems: [],
        auditLog: [],
        deletedAt: new Date(),
      });
      await deletedExpense.save();

      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?includeDeleted=true",
        {
          headers: createMockHeaders(),
        }
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(2); // Both expenses
      expect(data.total).toBe(2);
    });

    it("should return 401 when user is not authenticated", async () => {
      // Mock failed authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        headers: createMockHeaders(),
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should sanitize search input to prevent ReDoS", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?search=.*+?^${}()|[]\\",
        {
          headers: createMockHeaders(),
        }
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should not crash and should return results
    });

    it("should truncate search queries longer than 100 characters", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const longSearch = "a".repeat(101); // 101 characters
      const request = new NextRequest(
        `http://localhost:3000/api/expenses?search=${longSearch}`,
        {
          headers: createMockHeaders(),
        }
      );
      const response = await GET(request);
      const data = await response.json();

      // Should succeed with truncated search
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("expenses");
      expect(data).toHaveProperty("total");
    });

    it("should handle invalid pagination parameters", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?page=0&limit=200",
        {
          headers: createMockHeaders(),
        }
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.page).toBe(1); // Should default to 1
      expect(data.limit).toBe(100); // Should cap at 100
    });
  });

  describe("POST /api/expenses", () => {
    it("should create a new draft expense successfully", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const newExpenseData = {
        totalAmount: 100.0,
        managerIds: ["manager-456"],
        lineItems: [
          {
            amount: 100.0,
            date: "2024-01-20",
            description: "Client lunch",
            category: "Meals",
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: createMockHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(newExpenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.userId).toBe(testUserId);
      expect(data.organizationId).toBeNull();
      expect(data.totalAmount).toBe(100.0);
      expect(data.state).toBe(EXPENSE_STATES.DRAFT);
      expect(data.lineItems).toHaveLength(1);
      expect(data.auditLog).toHaveLength(1);
      expect(data.auditLog[0].action).toBe("created");
    });

    it("should create and submit an expense for pre-approval", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const newExpenseData = {
        totalAmount: 250.0,
        managerIds: ["manager-456"],
        status: EXPENSE_STATES.PRE_APPROVAL_PENDING,
        lineItems: [
          {
            amount: 250.0,
            date: "2024-01-20",
            description: "Conference registration",
            category: "Training",
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: createMockHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(newExpenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.state).toBe(EXPENSE_STATES.PRE_APPROVAL_PENDING);
      expect(data.auditLog[0].action).toBe("submitted");
    });

    it("should return 400 for invalid expense data - negative amount", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const invalidExpenseData = {
        totalAmount: -50.0,
        managerIds: [],
        status: EXPENSE_STATES.APPROVAL_PENDING,
        lineItems: [],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: createMockHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(invalidExpenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe("Please fix the validation errors below");
      expect(data.error.details.fields.totalAmount).toBeDefined();
    });

    it("should return 400 for submitted expense without manager", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const invalidExpenseData = {
        totalAmount: 100.0,
        managerIds: [], // No managers
        status: EXPENSE_STATES.APPROVAL_PENDING,
        lineItems: [],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: createMockHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(invalidExpenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details.fields.managerIds).toBeDefined();
    });

    it("should return 400 for invalid JSON body", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: createMockHeaders({
          "Content-Type": "application/json",
        }),
        body: "invalid json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe("Invalid JSON body");
    });

    it("should return 400 for future dated line items", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidExpenseData = {
        totalAmount: 100.0,
        managerIds: ["manager-123"],
        status: EXPENSE_STATES.APPROVAL_PENDING,
        lineItems: [
          {
            amount: 100.0,
            date: futureDate.toISOString(),
            description: "Future expense",
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: createMockHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(invalidExpenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details.fields["lineItems.0.date"]).toBeDefined();
    });

    it("should return 400 for line items with zero amount", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const invalidExpenseData = {
        totalAmount: 100.0,
        managerIds: ["manager-123"],
        status: EXPENSE_STATES.APPROVAL_PENDING,
        lineItems: [
          {
            amount: 0, // Zero amount
            date: "2024-01-20",
            description: "Zero amount expense",
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: createMockHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(invalidExpenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.details.fields["lineItems.0.amount"]).toBeDefined();
    });

    it("should return 401 when user is not authenticated", async () => {
      // Mock failed authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const expenseData = {
        totalAmount: 100.0,
        managerIds: ["manager-123"],
        lineItems: [],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: createMockHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(expenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe("Unauthorized");
    });
  });
});
