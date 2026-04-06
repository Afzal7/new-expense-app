import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseForm } from "@/components/expense-form";
import type { Expense } from "@/types/expense";

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(() => ({ data: { user: { id: "test-user-id" } } })),
}));

vi.mock("@/hooks/use-organization-members", () => ({
  useOrganizationMembers: vi.fn(() => ({
    data: {
      members: [
        {
          role: "owner",
          user: {
            id: "manager-1",
            name: "Manager One",
            email: "manager1@example.com",
          },
        },
        {
          role: "admin",
          user: {
            id: "manager-2",
            name: "Manager Two",
            email: "manager2@example.com",
          },
        },
      ],
    },
    isLoading: false,
    error: null,
  })),
}));

global.fetch = vi.fn() as typeof fetch;

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: "new-expense-id" }),
    isPending: false,
  })),
  useQueryClient: vi.fn(() => ({})),
}));

vi.mock("@/hooks/use-expense-mutations", () => ({
  useExpenseMutations: vi.fn(() => ({
    createExpense: {
      mutateAsync: vi.fn().mockResolvedValue({ id: "new-expense-id" }),
      isPending: false,
    },
    updateExpense: {
      mutateAsync: vi.fn().mockResolvedValue({ id: "updated-expense-id" }),
      isPending: false,
    },
    submitExpense: {
      mutateAsync: vi.fn().mockResolvedValue({ id: "submitted-expense-id" }),
      isPending: false,
    },
    submitExpenseForFinalApproval: {
      mutateAsync: vi
        .fn()
        .mockResolvedValue({ id: "submitted-final-expense-id" }),
      isPending: false,
    },
    approveExpense: {
      mutateAsync: vi.fn().mockResolvedValue({ id: "approved-expense-id" }),
      isPending: false,
    },
  })),
}));

vi.mock("@/hooks/use-file-upload", () => ({
  useFileUpload: () => ({
    uploadFile: vi.fn().mockResolvedValue({ publicUrl: "https://example.com/f" }),
    deleteFile: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("ExpenseForm", () => {
  const mockOnSuccess = vi.fn<(data: Expense) => void>();
  const mockOnCancel = vi.fn<() => void>();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockReset();
  });

  const defaultProps = {
    organizationId: "org-1",
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };

  it("shows entry choices when there are no line items", () => {
    render(<ExpenseForm {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /scan receipt to add expense/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Manual Entry")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add manual expense entry/i })
    ).toBeInTheDocument();
  });

  it("shows compact save and submit actions after adding a line item", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm {...defaultProps} />);

    await user.click(
      screen.getByRole("button", { name: /add manual expense entry/i })
    );

    expect(
      screen.getByRole("button", { name: /save expense to vault/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit expense to organization/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add another line from a receipt photo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add another manual line item/i })
    ).toBeInTheDocument();
  });

  it("opens shared submit sheet with reimbursement and pre-approval options", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm {...defaultProps} />);

    await user.click(
      screen.getByRole("button", { name: /add manual expense entry/i })
    );
    await user.click(
      screen.getByRole("button", { name: /submit expense to organization/i })
    );

    expect(screen.getByText("Submit to Organization")).toBeInTheDocument();
    expect(screen.getByText("Reimbursement")).toBeInTheDocument();
    expect(screen.getByText("Pre-approval")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send request/i })
    ).toBeInTheDocument();
  });

  it("calls onCancel when back is pressed", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("renders edit header when initialData is provided", async () => {
    const user = userEvent.setup();
    const initialData: Expense = {
      id: "existing-expense-id",
      userId: "test-user-id",
      organizationId: "org-1",
      totalAmount: 200,
      managerIds: ["manager-1"],
      lineItems: [
        {
          amount: 100,
          date: new Date("2023-12-01"),
          description: "Office supplies",
          category: "Office",
          attachments: [],
        },
      ],
      state: "Draft",
      auditLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    render(
      <ExpenseForm
        {...defaultProps}
        initialData={initialData}
      />
    );

    expect(screen.getByText("Edit Expense")).toBeInTheDocument();
    expect(screen.getByText("Approver")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /save expense to vault/i })
    );

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});
