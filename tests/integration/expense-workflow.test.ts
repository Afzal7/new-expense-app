import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterEach,
} from "vitest";
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { Expense, EXPENSE_STATES } from "../../lib/models/expense";
import { auth } from "../../lib/auth";

// Mock external services and environment
vi.mock("../../lib/env", () => ({
  env: {
    MONGODB_URI: "mongodb://localhost:27017/test",
    BETTER_AUTH_SECRET: "test-secret-key-that-is-at-least-32-characters-long",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    STRIPE_SECRET_KEY: "sk_test_1234567890123456789012345678901234567890",
    STRIPE_WEBHOOK_SECRET: "whsec_test_123456789012345678901234567890",
    STRIPE_PRO_MONTHLY_PRICE_ID: "price_test_monthly",
    RESEND_API_KEY: "test-resend-key",
    CLOUDFLARE_R2_ACCESS_KEY_ID: "test-key",
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: "test-secret",
    CLOUDFLARE_R2_ACCOUNT_ID: "test-account",
    CLOUDFLARE_R2_BUCKET_NAME: "test-bucket",
    NODE_ENV: "test",
    isDevelopment: true,
    isProduction: false,
  },
}));

// Mock S3 client for file uploads
vi.mock("@aws-sdk/client-s3", () => ({
  PutObjectCommand: class PutObjectCommand {},
  S3Client: class S3Client {
    constructor() {}
    send() {}
  },
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://test-signed-url.com"),
}));

// Mock the database connection
vi.mock("../../lib/db", () => ({
  connectMongoose: vi.fn().mockResolvedValue(undefined),
  db: {},
}));

// Mock auth module
vi.mock("../../lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

let testUserId: string;

beforeAll(async () => {
  // Database is already set up by tests/setup.ts
  // Create test user in database
  testUserId = "test-user-integration";
});

// Note: cleanup is handled by tests/setup.ts

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  vi.clearAllMocks();
});

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

// Since auth is mocked at module level, we don't need special request handling

describe("Expense Creation Workflow Integration", () => {
  describe("File Upload Integration", () => {
    it("should generate signed URL for file upload", async () => {
      const { GET } = await import("../../app/api/upload/signed-url/route");

      const request = new NextRequest(
        "http://localhost:3000/api/upload/signed-url?fileName=test.jpg&fileType=image/jpeg"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.signedUrl).toBe("https://test-signed-url.com");
      expect(data.publicUrl).toContain("test-account");
      expect(data.publicUrl).toContain("test-bucket");
      expect(data.publicUrl).toContain("uploads/");
    });

    it("should reject invalid file types", async () => {
      const { GET } = await import("../../app/api/upload/signed-url/route");

      const request = new NextRequest(
        "http://localhost:3000/api/upload/signed-url?fileName=test.exe&fileType=application/x-msdownload"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Invalid file type");
    });

    it("should require fileName and fileType parameters", async () => {
      const { GET } = await import("../../app/api/upload/signed-url/route");

      const request = new NextRequest(
        "http://localhost:3000/api/upload/signed-url"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Missing required parameters");
    });
  });

  describe("Expense API Integration", () => {
    beforeEach(async () => {
      // Mock auth to return our test session
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );
    });

    it("should create expense with valid data", async () => {
      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: 150.0,
        managerIds: ["manager-123", "manager-456"],
        lineItems: [
          {
            amount: 75.0,
            date: new Date("2024-01-15").toISOString(),
            description: "Office supplies",
            category: "Office",
          },
          {
            amount: 75.0,
            date: new Date("2024-01-16").toISOString(),
            description: "Coffee meeting",
            category: "Meals",
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.userId).toBe(testUserId);
      expect(data.totalAmount).toBe(150.0);
      expect(data.state).toBe(EXPENSE_STATES.DRAFT);
      expect(data.lineItems).toHaveLength(2);
      expect(data.lineItems[0].attachments).toEqual([]);
      expect(data.lineItems[1].attachments).toEqual([]);
      expect(data.auditLog).toHaveLength(1);
      expect(data.auditLog[0].action).toBe("created");

      // Verify expense was saved to database
      const savedExpense = await Expense.findById(data.id);
      expect(savedExpense).toBeTruthy();
      expect(savedExpense?.userId).toBe(testUserId);
      expect(savedExpense?.totalAmount).toBe(150.0);
    });

    it("should validate total amount matches line item sum", async () => {
      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: 200.0, // Doesn't match line item sum of 150
        managerIds: ["manager-123"],
        lineItems: [
          {
            amount: 75.0,
            date: new Date("2024-01-15").toISOString(),
            description: "Office supplies",
            category: "Office",
          },
          {
            amount: 75.0,
            date: new Date("2024-01-16").toISOString(),
            description: "Coffee meeting",
            category: "Meals",
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain(
        "Total amount must match sum of line item amounts"
      );
    });

    it("should require at least one manager", async () => {
      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: 100.0,
        managerIds: [], // Empty managers
        lineItems: [
          {
            amount: 100.0,
            date: new Date("2024-01-15").toISOString(),
            description: "Test expense",
            category: "Office",
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toBe(
        "Validation failed: At least one manager ID is required"
      );
    });

    it("should reject future dates in line items", async () => {
      const { POST } = await import("../../app/api/expenses/route");

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

      const expenseData = {
        totalAmount: 100.0,
        managerIds: ["manager-123"],
        lineItems: [
          {
            amount: 100.0,
            date: futureDate.toISOString(),
            description: "Future expense",
            category: "Office",
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("Validation failed");
    });

    it("should reject negative amounts", async () => {
      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: -50.0,
        managerIds: ["manager-123"],
        lineItems: [
          {
            amount: -50.0,
            date: new Date("2024-01-15").toISOString(),
            description: "Negative expense",
            category: "Office",
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("Validation failed");
    });

    it("should handle unauthenticated requests", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: 100.0,
        managerIds: ["manager-123"],
        lineItems: [],
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.message).toBe("Unauthorized");
    });

    it("should create expense without line items", async () => {
      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: 100.0,
        managerIds: ["manager-123"],
        lineItems: [], // No line items
      };

      const request = new NextRequest("http://localhost:3000/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.userId).toBe(testUserId);
      expect(data.totalAmount).toBe(100.0);
      expect(data.lineItems).toEqual([]);
      expect(data.state).toBe(EXPENSE_STATES.DRAFT);
    });
  });

  describe("Expense Retrieval Integration", () => {
    let testExpenseId: string;

    beforeEach(async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );

      // Create a test expense
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
            attachments: ["https://example.com/receipt1.jpg"],
          },
          {
            amount: 75.0,
            date: new Date("2024-01-16"),
            description: "Coffee meeting",
            category: "Meals",
            attachments: [],
          },
        ],
        auditLog: [],
      });

      const savedExpense = await testExpense.save();
      testExpenseId = savedExpense._id.toString();
    });

    it("should retrieve user's expenses with pagination", async () => {
      const { GET } = await import("../../app/api/expenses/route");

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?page=1&limit=10"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1);
      expect(data.expenses[0].id).toBe(testExpenseId);
      expect(data.expenses[0].totalAmount).toBe(150.0);
      expect(data.expenses[0].lineItems).toHaveLength(2);
      expect(data.expenses[0].lineItems[0].attachments).toEqual([
        "https://example.com/receipt1.jpg",
      ]);
      expect(data.total).toBe(1);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(10);
      expect(data.totalPages).toBe(1);
    });

    it("should filter expenses by search term", async () => {
      const { GET } = await import("../../app/api/expenses/route");

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?search=office"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1);
      expect(data.expenses[0].lineItems[0].description).toBe("Office supplies");
    });

    it("should filter private expenses", async () => {
      const { GET } = await import("../../app/api/expenses/route");

      const request = new NextRequest(
        "http://localhost:3000/api/expenses?type=private"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.expenses).toHaveLength(1);
      expect(data.expenses[0].organizationId).toBeNull();
    });
  });
});
