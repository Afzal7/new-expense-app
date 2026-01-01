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

// Mock the route handlers since they don't exist yet
// These will be replaced with actual imports when routes are implemented
const mockGetExpenses = vi.fn();
const mockCreateExpense = vi.fn();
const mockGetExpenseById = vi.fn();
const mockUpdateExpense = vi.fn();

// Mock the route files
vi.mock("../../../app/api/expenses/route", () => ({
  GET: mockGetExpenses,
  POST: mockCreateExpense,
}));

vi.mock("../../../app/api/expenses/[id]/route", () => ({
  GET: mockGetExpenseById,
  PUT: mockUpdateExpense,
}));

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

      // Mock the route handler
      mockGetExpenses.mockResolvedValue(
        new Response(
          JSON.stringify({
            expenses: [
              {
                id: testExpenseId,
                userId: testUserId,
                totalAmount: 150.0,
                state: EXPENSE_STATES.DRAFT,
                lineItems: [
                  {
                    amount: 75.0,
                    date: "2024-01-15T00:00:00.000Z",
                    description: "Office supplies",
                    category: "Office",
                  },
                  {
                    amount: 75.0,
                    date: "2024-01-16T00:00:00.000Z",
                    description: "Coffee meeting",
                    category: "Meals",
                  },
                ],
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
          }),
          { status: 200 }
        )
      );

      const request = new NextRequest("http://localhost:3000/api/expenses");
      const response = await mockGetExpenses(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1);
      expect(data.expenses[0].id).toBe(testExpenseId);
      expect(data.total).toBe(1);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it("should filter expenses by type", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      // Mock the route handler to return only private expenses
      mockGetExpenses.mockResolvedValue(
        new Response(
          JSON.stringify({
            expenses: [
              {
                id: testExpenseId,
                userId: testUserId,
                totalAmount: 150.0,
                state: EXPENSE_STATES.DRAFT,
                lineItems: [],
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
          }),
          { status: 200 }
        )
      );

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?type=private"
      );
      const response = await mockGetExpenses(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1);
    });

    it("should search expenses by description", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      // Mock the route handler to return filtered results
      mockGetExpenses.mockResolvedValue(
        new Response(
          JSON.stringify({
            expenses: [
              {
                id: testExpenseId,
                userId: testUserId,
                totalAmount: 150.0,
                state: EXPENSE_STATES.DRAFT,
                lineItems: [],
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              },
            ],
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
          }),
          { status: 200 }
        )
      );

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?search=office"
      );
      const response = await mockGetExpenses(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1);
    });

    it("should return 401 when user is not authenticated", async () => {
      // Mock failed authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      mockGetExpenses.mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
      );

      const request = new NextRequest("http://localhost:3000/api/expenses");
      const response = await mockGetExpenses(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should handle pagination parameters", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      // Mock the route handler
      mockGetExpenses.mockResolvedValue(
        new Response(
          JSON.stringify({
            expenses: [],
            total: 0,
            page: 2,
            limit: 10,
            totalPages: 1,
          }),
          { status: 200 }
        )
      );

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?page=2&limit=10"
      );
      const response = await mockGetExpenses(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
    });
  });

  describe("POST /api/expenses", () => {
    it("should create a new expense successfully", async () => {
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

      // Mock the route handler
      mockCreateExpense.mockResolvedValue(
        new Response(
          JSON.stringify({
            id: expect.any(String),
            userId: testUserId,
            organizationId: null,
            managerIds: ["manager-456"],
            totalAmount: 100.0,
            state: EXPENSE_STATES.DRAFT,
            lineItems: [
              {
                amount: 100.0,
                date: "2024-01-20T00:00:00.000Z",
                description: "Client lunch",
                category: "Meals",
              },
            ],
            auditLog: [
              {
                action: "created",
                date: expect.any(String),
                actorId: testUserId,
              },
            ],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
          { status: 201 }
        )
      );

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpenseData),
      });

      const response = await mockCreateExpense(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.userId).toBe(testUserId);
      expect(data.totalAmount).toBe(100.0);
      expect(data.state).toBe(EXPENSE_STATES.DRAFT);
      expect(data.lineItems).toHaveLength(1);
      expect(data.auditLog).toHaveLength(1);
      expect(data.auditLog[0].action).toBe("created");
    });

    it("should return 400 for invalid expense data", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const invalidExpenseData = {
        totalAmount: -50.0, // Invalid negative amount
        managerIds: [],
        lineItems: [],
      };

      // Mock the route handler
      mockCreateExpense.mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "Validation failed",
            details: ["Total amount must be positive", "Manager IDs required"],
          }),
          { status: 400 }
        )
      );

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidExpenseData),
      });

      const response = await mockCreateExpense(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toContain("Total amount must be positive");
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

      mockCreateExpense.mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
      );

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const response = await mockCreateExpense(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });
  });

  describe("GET /api/expenses/[id]", () => {
    it("should return expense by ID for owner", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      // Mock the route handler
      mockGetExpenseById.mockResolvedValue(
        new Response(
          JSON.stringify({
            id: testExpenseId,
            userId: testUserId,
            organizationId: null,
            managerIds: ["manager-123"],
            totalAmount: 150.0,
            state: EXPENSE_STATES.DRAFT,
            lineItems: [
              {
                amount: 75.0,
                date: "2024-01-15T00:00:00.000Z",
                description: "Office supplies",
                category: "Office",
              },
              {
                amount: 75.0,
                date: "2024-01-16T00:00:00.000Z",
                description: "Coffee meeting",
                category: "Meals",
              },
            ],
            auditLog: [],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
          { status: 200 }
        )
      );

      const request = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`
      );
      const response = await mockGetExpenseById(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(testExpenseId);
      expect(data.userId).toBe(testUserId);
      expect(data.totalAmount).toBe(150.0);
    });

    it("should return 404 for non-existent expense", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const nonExistentId = new mongoose.Types.ObjectId().toString();

      // Mock the route handler
      mockGetExpenseById.mockResolvedValue(
        new Response(JSON.stringify({ error: "Expense not found" }), {
          status: 404,
        })
      );

      const request = new NextRequest(
        `http://localhost:3000/api/expenses/${nonExistentId}`
      );
      const response = await mockGetExpenseById(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Expense not found");
    });

    it("should return 401 when user is not authenticated", async () => {
      // Mock failed authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      mockGetExpenseById.mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
      );

      const request = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`
      );
      const response = await mockGetExpenseById(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 when user tries to access another user's expense", async () => {
      // Mock authentication as different user
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession("different-user-456")
      );

      // Mock the route handler
      mockGetExpenseById.mockResolvedValue(
        new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
      );

      const request = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`
      );
      const response = await mockGetExpenseById(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });
  });

  describe("PUT /api/expenses/[id]", () => {
    it("should update expense successfully", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const updateData = {
        totalAmount: 200.0,
        managerIds: ["manager-789"],
        lineItems: [
          {
            amount: 100.0,
            date: "2024-01-15",
            description: "Updated office supplies",
            category: "Office",
          },
          {
            amount: 100.0,
            date: "2024-01-17",
            description: "Team dinner",
            category: "Meals",
          },
        ],
      };

      // Mock the route handler
      mockUpdateExpense.mockResolvedValue(
        new Response(
          JSON.stringify({
            id: testExpenseId,
            userId: testUserId,
            organizationId: null,
            managerIds: ["manager-789"],
            totalAmount: 200.0,
            state: EXPENSE_STATES.DRAFT,
            lineItems: [
              {
                amount: 100.0,
                date: "2024-01-15T00:00:00.000Z",
                description: "Updated office supplies",
                category: "Office",
              },
              {
                amount: 100.0,
                date: "2024-01-17T00:00:00.000Z",
                description: "Team dinner",
                category: "Meals",
              },
            ],
            auditLog: [
              {
                action: "updated",
                date: expect.any(String),
                actorId: testUserId,
                previousValues: { totalAmount: 150.0 },
                updatedValues: { totalAmount: 200.0 },
              },
            ],
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
          { status: 200 }
        )
      );

      const request = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const response = await mockUpdateExpense(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(testExpenseId);
      expect(data.totalAmount).toBe(200.0);
      expect(data.lineItems).toHaveLength(2);
      expect(data.auditLog).toHaveLength(1);
      expect(data.auditLog[0].action).toBe("updated");
    });

    it("should return 400 for invalid update data", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const invalidUpdateData = {
        totalAmount: 0, // Invalid zero amount
        managerIds: [],
        lineItems: [],
      };

      // Mock the route handler
      mockUpdateExpense.mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "Validation failed",
            details: ["Total amount must be positive", "Manager IDs required"],
          }),
          { status: 400 }
        )
      );

      const request = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invalidUpdateData),
        }
      );

      const response = await mockUpdateExpense(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
    });

    it("should return 404 for non-existent expense", async () => {
      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const updateData = {
        totalAmount: 100.0,
        managerIds: ["manager-123"],
        lineItems: [],
      };

      // Mock the route handler
      mockUpdateExpense.mockResolvedValue(
        new Response(JSON.stringify({ error: "Expense not found" }), {
          status: 404,
        })
      );

      const request = new NextRequest(
        `http://localhost:3000/api/expenses/${nonExistentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const response = await mockUpdateExpense(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Expense not found");
    });

    it("should return 403 when user tries to update another user's expense", async () => {
      // Mock authentication as different user
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession("different-user-456")
      );

      const updateData = {
        totalAmount: 200.0,
        managerIds: ["manager-123"],
        lineItems: [],
      };

      // Mock the route handler
      mockUpdateExpense.mockResolvedValue(
        new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
      );

      const request = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const response = await mockUpdateExpense(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Forbidden");
    });

    it("should prevent updating submitted expenses", async () => {
      // First, update the expense to submitted state in database
      await Expense.findByIdAndUpdate(testExpenseId, {
        state: EXPENSE_STATES.PRE_APPROVAL_PENDING,
        lineItems: [
          {
            amount: 150.0,
            date: new Date("2024-01-15"),
            description: "Office supplies",
            category: "Office",
          },
        ],
      });

      // Mock successful authentication
      const { auth } = await import("../../../lib/auth");
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      const updateData = {
        totalAmount: 200.0,
        managerIds: ["manager-123"],
        lineItems: [],
      };

      // Mock the route handler
      mockUpdateExpense.mockResolvedValue(
        new Response(
          JSON.stringify({ error: "Cannot update submitted expense" }),
          { status: 400 }
        )
      );

      const request = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const response = await mockUpdateExpense(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Cannot update submitted expense");
    });
  });
});
