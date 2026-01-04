import mongoose from "mongoose";
import { NextRequest } from "next/server";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { auth } from "../../lib/auth";
import { Expense, EXPENSE_STATES } from "../../lib/models/expense";
import type { AuditEntry } from "../../types/expense";

// Mock external services and environment
vi.mock("@/lib/env", () => ({
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
    ENDPOINT_URL_S3: "https://test-account.r2.cloudflarestorage.com",
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
    send() {
      return Promise.resolve({
        UploadId: "test-upload-id",
        Location:
          "https://test-account.r2.cloudflarestorage.com/test-bucket/uploads/test-user-integration/1767238596925-test.jpg",
      });
    }
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
    beforeEach(async () => {
      // Mock auth to return our test session
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(testUserId)
      );
    });

    it("should generate signed URL for file upload", async () => {
      const { GET } = await import("../../app/api/upload/signed-url/route");

      const request = new NextRequest(
        "http://localhost:3000/api/upload/signed-url?fileName=test.jpg&fileType=image/jpeg&fileSize=1024"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.signedUrl).toBeTruthy();
      expect(typeof data.signedUrl).toBe("string");
      expect(data.publicUrl).toBeTruthy();
      expect(typeof data.publicUrl).toBe("string");
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
      expect(data.error.message).toContain("Invalid file type");
    });

    it("should require fileName and fileType parameters", async () => {
      const { GET } = await import("../../app/api/upload/signed-url/route");

      const request = new NextRequest(
        "http://localhost:3000/api/upload/signed-url"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.message).toContain("Missing required parameters");
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

    it("should use provided total amount", async () => {
      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: 200.0, // Custom total amount
        managerIds: ["manager-1"],
        lineItems: [
          {
            amount: 100,
            date: "2023-12-01",
            description: "Office supplies",
            category: "Office",
          },
          {
            amount: 50,
            date: "2023-12-02",
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
      expect(data.totalAmount).toBe(200.0); // Should use provided total
    });

    it("should require at least one manager when submitting", async () => {
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
        status: EXPENSE_STATES.PRE_APPROVAL_PENDING, // Submit for validation
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
        "Please fix the validation errors below"
      );
      expect(data.error.details.fields.managerIds).toBeDefined();
    });

    it("should reject future dates in line items when submitting", async () => {
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
        status: EXPENSE_STATES.PRE_APPROVAL_PENDING, // Submit for validation
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
        "Please fix the validation errors below"
      );
    });

    it("should reject negative amounts when submitting", async () => {
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
        status: EXPENSE_STATES.PRE_APPROVAL_PENDING, // Submit for validation
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
        "Please fix the validation errors below"
      );
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
      expect(data.totalAmount).toBe(100.0); // Should use provided total
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

  describe("Complete Expense Workflow Integration (T014)", () => {
    let employeeId: string;
    let managerId: string;
    let testExpenseId: string;

    beforeEach(async () => {
      // Set up test users
      employeeId = "employee-test-user";
      managerId = "manager-test-user";
    });

    it("should complete the full expense workflow from creation to reimbursement", async () => {
      // Step 1: Employee creates expense (DRAFT state)
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(employeeId)
      );

      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: 200.0,
        managerIds: [managerId],
        lineItems: [
          {
            amount: 100.0,
            date: new Date("2024-01-15").toISOString(),
            description: "Client meeting lunch",
            category: "Meals",
          },
          {
            amount: 100.0,
            date: new Date("2024-01-16").toISOString(),
            description: "Office supplies",
            category: "Office",
          },
        ],
      };

      const createRequest = new NextRequest(
        "http://localhost:3000/api/expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        }
      );

      const createResponse = await POST(createRequest);
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData.state).toBe(EXPENSE_STATES.DRAFT);
      expect(createData.auditLog).toHaveLength(1);
      expect(createData.auditLog[0].action).toBe("created");

      testExpenseId = createData.id;

      // Step 2: Employee submits for pre-approval (DRAFT -> PRE_APPROVAL_PENDING)
      const { PATCH } = await import("../../app/api/expenses/[id]/route");

      const submitRequest = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "submit" }),
        }
      );

      const submitResponse = await PATCH(submitRequest, {
        params: Promise.resolve({ id: testExpenseId }),
      });
      const submitData = await submitResponse.json();

      expect(submitResponse.status).toBe(200);
      expect(submitData.state).toBe(EXPENSE_STATES.PRE_APPROVAL_PENDING);
      expect(submitData.auditLog).toHaveLength(2);
      expect(submitData.auditLog[1].action).toBe("submitted");
      expect(submitData.auditLog[1].previousValues.state).toBe(
        EXPENSE_STATES.DRAFT
      );
      expect(submitData.auditLog[1].updatedValues.state).toBe(
        EXPENSE_STATES.PRE_APPROVAL_PENDING
      );

      // Step 3: Manager approves pre-approval (PRE_APPROVAL_PENDING -> PRE_APPROVED)
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(managerId)
      );

      const approvePreApprovalRequest = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "approve" }),
        }
      );

      const approvePreApprovalResponse = await PATCH(
        approvePreApprovalRequest,
        { params: Promise.resolve({ id: testExpenseId }) }
      );
      const approvePreApprovalData = await approvePreApprovalResponse.json();

      expect(approvePreApprovalResponse.status).toBe(200);
      expect(approvePreApprovalData.state).toBe(EXPENSE_STATES.PRE_APPROVED);
      expect(approvePreApprovalData.auditLog).toHaveLength(3);
      expect(approvePreApprovalData.auditLog[2].action).toBe("approved");
      expect(approvePreApprovalData.auditLog[2].previousValues.state).toBe(
        EXPENSE_STATES.PRE_APPROVAL_PENDING
      );
      expect(approvePreApprovalData.auditLog[2].updatedValues.state).toBe(
        EXPENSE_STATES.PRE_APPROVED
      );

      // Step 4: Employee submits for final approval (PRE_APPROVED -> APPROVAL_PENDING)
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(employeeId)
      );

      const submitFinalRequest = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "submit" }),
        }
      );

      const submitFinalResponse = await PATCH(submitFinalRequest, {
        params: Promise.resolve({ id: testExpenseId }),
      });
      const submitFinalData = await submitFinalResponse.json();

      expect(submitFinalResponse.status).toBe(200);
      expect(submitFinalData.state).toBe(EXPENSE_STATES.APPROVAL_PENDING);
      expect(submitFinalData.auditLog).toHaveLength(4);
      expect(submitFinalData.auditLog[3].action).toBe("submitted");
      expect(submitFinalData.auditLog[3].previousValues.state).toBe(
        EXPENSE_STATES.PRE_APPROVED
      );
      expect(submitFinalData.auditLog[3].updatedValues.state).toBe(
        EXPENSE_STATES.APPROVAL_PENDING
      );

      // Step 5: Manager approves for reimbursement (APPROVAL_PENDING -> APPROVED)
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(managerId)
      );

      const approveFinalRequest = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "approve" }),
        }
      );

      const approveFinalResponse = await PATCH(approveFinalRequest, {
        params: Promise.resolve({ id: testExpenseId }),
      });
      const approveFinalData = await approveFinalResponse.json();

      expect(approveFinalResponse.status).toBe(200);
      expect(approveFinalData.state).toBe(EXPENSE_STATES.APPROVED);
      expect(approveFinalData.auditLog).toHaveLength(5);
      expect(approveFinalData.auditLog[4].action).toBe("approved");
      expect(approveFinalData.auditLog[4].previousValues.state).toBe(
        EXPENSE_STATES.APPROVAL_PENDING
      );
      expect(approveFinalData.auditLog[4].updatedValues.state).toBe(
        EXPENSE_STATES.APPROVED
      );

      // Step 6: Manager reimburses (APPROVED -> REIMBURSED)
      // Note: Current implementation requires manager role for reimbursement
      // TODO: Add finance role logic for reimbursement
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(managerId)
      );

      const reimburseRequest = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "reimburse" }),
        }
      );

      const reimburseResponse = await PATCH(reimburseRequest, {
        params: Promise.resolve({ id: testExpenseId }),
      });
      const reimburseData = await reimburseResponse.json();

      expect(reimburseResponse.status).toBe(200);
      expect(reimburseData.state).toBe(EXPENSE_STATES.REIMBURSED);
      expect(reimburseData.auditLog).toHaveLength(6);
      expect(reimburseData.auditLog[5].action).toBe("reimbursed");
      expect(reimburseData.auditLog[5].previousValues.state).toBe(
        EXPENSE_STATES.APPROVED
      );
      expect(reimburseData.auditLog[5].updatedValues.state).toBe(
        EXPENSE_STATES.REIMBURSED
      );

      // Step 7: Verify final state in database
      const finalExpense = await Expense.findById(testExpenseId);
      expect(finalExpense?.state).toBe(EXPENSE_STATES.REIMBURSED);
      expect(finalExpense?.auditLog).toHaveLength(6);
      expect(
        finalExpense?.auditLog.map((entry: AuditEntry) => entry.action)
      ).toEqual([
        "created",
        "submitted",
        "approved",
        "submitted",
        "approved",
        "reimbursed",
      ]);
    });

    it("should handle rejection workflow", async () => {
      // Step 1: Employee creates and submits expense
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(employeeId)
      );

      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: 50.0,
        managerIds: [managerId],
        lineItems: [
          {
            amount: 50.0,
            date: new Date("2024-01-15").toISOString(),
            description: "Rejected expense",
            category: "Meals",
          },
        ],
      };

      const createRequest = new NextRequest(
        "http://localhost:3000/api/expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        }
      );

      const createResponse = await POST(createRequest);
      const createData = await createResponse.json();
      testExpenseId = createData.id;

      // Submit for pre-approval
      const { PATCH } = await import("../../app/api/expenses/[id]/route");

      const submitRequest = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "submit" }),
        }
      );

      await PATCH(submitRequest, {
        params: Promise.resolve({ id: testExpenseId }),
      });

      // Step 2: Manager rejects the expense
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(managerId)
      );

      const rejectRequest = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "reject" }),
        }
      );

      const rejectResponse = await PATCH(rejectRequest, {
        params: Promise.resolve({ id: testExpenseId }),
      });
      const rejectData = await rejectResponse.json();

      expect(rejectResponse.status).toBe(200);
      expect(rejectData.state).toBe(EXPENSE_STATES.REJECTED);
      expect(rejectData.auditLog).toHaveLength(3);
      expect(rejectData.auditLog[2].action).toBe("rejected");

      // Verify final state
      const rejectedExpense = await Expense.findById(testExpenseId);
      expect(rejectedExpense?.state).toBe(EXPENSE_STATES.REJECTED);
    });

    it("should prevent unauthorized state transitions", async () => {
      // Create expense as employee
      vi.mocked(auth.api.getSession).mockResolvedValue(
        createMockSession(employeeId)
      );

      const { POST } = await import("../../app/api/expenses/route");

      const expenseData = {
        totalAmount: 100.0,
        managerIds: [managerId],
        lineItems: [
          {
            amount: 100.0,
            date: new Date("2024-01-15").toISOString(),
            description: "Test expense",
            category: "Office",
          },
        ],
      };

      const createRequest = new NextRequest(
        "http://localhost:3000/api/expenses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        }
      );

      const createResponse = await POST(createRequest);
      const createData = await createResponse.json();
      testExpenseId = createData.id;

      // Try to approve own expense (should fail)
      const { PATCH } = await import("../../app/api/expenses/[id]/route");

      const selfApproveRequest = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "submit" }),
        }
      );

      await PATCH(selfApproveRequest, {
        params: Promise.resolve({ id: testExpenseId }),
      });

      // Now try to approve as the same user
      const invalidApproveRequest = new NextRequest(
        `http://localhost:3000/api/expenses/${testExpenseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "approve" }),
        }
      );

      const invalidApproveResponse = await PATCH(invalidApproveRequest, {
        params: Promise.resolve({ id: testExpenseId }),
      });
      const invalidApproveData = await invalidApproveResponse.json();

      expect(invalidApproveResponse.status).toBe(403);
      expect(invalidApproveData.error.message).toContain(
        "Only managers can approve"
      );
    });
  });
});
