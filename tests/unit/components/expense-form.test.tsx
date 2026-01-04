import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseForm } from "@/components/expense-form";

// Mock the necessary dependencies
vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(() => ({ data: { user: { id: "test-user-id" } } })),
}));

vi.mock("@/hooks/use-organization-members", () => ({
  useOrganizationMembers: vi.fn(() => ({
    data: {
      members: [
        {
          user: {
            id: "manager-1",
            name: "Manager One",
            email: "manager1@example.com",
          },
        },
        {
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

// Mock fetch for API calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.fetch = vi.fn() as any;

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
      mutateAsync: vi.fn().mockResolvedValue({ id: "submitted-final-expense-id" }),
      isPending: false,
    },
    approveExpense: {
      mutateAsync: vi.fn().mockResolvedValue({ id: "approved-expense-id" }),
      isPending: false,
    },
  })),
}));

describe("ExpenseForm", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockOnSuccess = vi.fn<(data: any) => void>();
  const mockOnCancel = vi.fn<() => void>();

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockReset();
  });

  const defaultProps = {
    onSuccess: mockOnSuccess,
    onCancel: mockOnCancel,
  };

  it("renders form fields correctly", () => {
    render(<ExpenseForm {...defaultProps} />);

    expect(screen.getByText("Approval Manager *")).toBeInTheDocument();
    expect(screen.getByText(/select managers/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add item/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save draft/i })
    ).toBeInTheDocument();
    // Main submit button now shows "Submit Report" with item count
    expect(
      screen.getByRole("button", { name: /submit report \(1\)/i })
    ).toBeInTheDocument();
  });

  describe("form validation", () => {
    it("shows validation error for negative total amount", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      const totalAmountInput = screen.getByPlaceholderText("0.00");
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "-10");

      const submitButton = screen.getByRole("button", {
        name: /save draft/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Total amount must be 0 or greater/i)
        ).toBeInTheDocument();
      });
    });

    it("shows validation error for line item with future date", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Set valid total amount first
      const totalAmountInput = screen.getByPlaceholderText("0.00");
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "100");

      // First line item is always expanded by default in new design
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateInput = screen.getByLabelText(/date/i);
      await user.clear(dateInput);
      await user.type(dateInput, futureDate.toISOString().split("T")[0]);

      const submitButton = screen.getByRole("button", {
        name: /save draft/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Date cannot be in the future/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("form submission", () => {
    it("submits form successfully with valid data", async () => {
      const user = userEvent.setup();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: (): Promise<{ id: string }> =>
          Promise.resolve({ id: "new-expense-id" }),
      });

      render(<ExpenseForm {...defaultProps} />);

      // Fill form with valid data
      const totalAmountInput = screen.getByPlaceholderText("0.00");
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "150");

      // Select manager
      const managerSelect = screen.getByRole("combobox");
      await user.click(managerSelect);
      const managerOption = screen.getByText("Manager One");
      await user.click(managerOption);

      // Line item 1 is already there
      const lineItemAmountInput = screen.getAllByPlaceholderText("0.00")[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "150");

      const descriptionInput = screen.getByPlaceholderText(/merchant name/i);
      await user.type(descriptionInput, "Office supplies");

      const categoryButton = screen.getByRole("button", { name: /office/i });
      await user.click(categoryButton);

      const dateInput = screen.getByLabelText(/date/i);
      await user.clear(dateInput);
      await user.type(dateInput, "2023-12-01");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /save draft/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalAmount: 150,
            managerIds: ["manager-1"],
            lineItems: [
              {
                amount: 150,
                date: "2023-12-01T00:00:00.000Z",
                description: "Office supplies",
                category: "Office",
                attachments: [],
              },
            ],
          }),
        });
        expect(mockOnSuccess).toHaveBeenCalledWith({ id: "new-expense-id" });
      });
    });

    it("handles API error during submission", async () => {
      const user = userEvent.setup();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: (): Promise<{ error: string }> =>
          Promise.resolve({ error: "Validation failed" }),
      });

      render(<ExpenseForm {...defaultProps} />);

      // Fill minimal valid form
      const totalAmountInput = screen.getByPlaceholderText("0.00");
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "100");

      const managerSelect = screen.getByRole("combobox");
      await user.click(managerSelect);
      const managerOption = screen.getByText("Manager One");
      await user.click(managerOption);

      const submitButton = screen.getByRole("button", {
        name: /save draft/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: (): Promise<{ id: string }> =>
                    Promise.resolve({ id: "new-expense-id" }),
                }),
              100
            )
          )
      );

      render(<ExpenseForm {...defaultProps} />);

      // Fill valid form with line item
      const totalAmountInput = screen.getByPlaceholderText("0.00");
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "100");

      const lineItemAmountInput = screen.getAllByPlaceholderText("0.00")[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "100");

      // Select manager
      const managerSelect = screen.getByRole("combobox");
      await user.click(managerSelect);
      const managerOption = screen.getByText("Manager One");
      await user.click(managerOption);

      const submitButton = screen.getByRole("button", {
        name: /save draft/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("user interactions", () => {
    it("adds and removes line items", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Initially 1 line item
      expect(screen.getAllByPlaceholderText("0.00")).toHaveLength(2); // total + 1 item

      // Add second line item
      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

      expect(screen.getAllByPlaceholderText("0.00")).toHaveLength(3);

      // Remove first line item
      const removeButtons = screen.getAllByRole("button", { name: /remove item/i });
      await user.click(removeButtons[0]);

      expect(screen.getAllByPlaceholderText("0.00")).toHaveLength(2);
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /arrow-left/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("pre-fills current date for new line items", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

      // Check second item date (first is index 0)
      const dateInputs = screen.getAllByLabelText(/date/i);
      const today = new Date().toISOString().split("T")[0];
      expect(dateInputs[1]).toHaveValue(today);
    });

    it("calculates and displays total from line items", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Fill line item 1 with amount
      const lineItemAmountInput = screen.getAllByPlaceholderText("0.00")[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "50.25");

      // Should show calculated total in mismatch warning or similar
      // In the new Hero, it shows "Sum is $50.25" if total is different
      await waitFor(() => {
        expect(screen.getByText(/sum is \$50.25/i)).toBeInTheDocument();
      });
    });

    it("auto-fills total amount when 'Auto-fix' button is clicked", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Fill line item with amount
      const lineItemAmountInput = screen.getAllByPlaceholderText("0.00")[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "75.50");

      // Click "Auto-fix" button
      const autoFixButton = await screen.findByRole("button", {
        name: /auto-fix/i,
      });
      await user.click(autoFixButton);

      // Total amount should be auto-filled
      const totalAmountInput = screen.getByPlaceholderText("0.00");
      expect(totalAmountInput).toHaveValue(75.5);
    });
  });

  describe("edit mode", () => {
    const editProps = {
      ...defaultProps,
      initialData: {
        id: "existing-expense-id",
        userId: "test-user-id",
        organizationId: "test-org-id",
        totalAmount: 200,
        managerIds: ["manager-1"],
        lineItems: [
          {
            amount: 100,
            date: "2023-12-01T00:00:00.000Z",
            description: "Office supplies",
            category: "Office",
            attachments: [],
          },
          {
            amount: 100,
            date: "2023-12-02T00:00:00.000Z",
            description: "Travel",
            category: "Transportation",
            attachments: [],
          },
        ],
        state: "Draft" as const,
        auditLog: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      },
    };

    it("renders with pre-filled data in edit mode", () => {
      render(<ExpenseForm {...editProps} />);

      expect(screen.getByText("Edit Expense")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("0.00")).toHaveValue(200);
      expect(screen.getAllByPlaceholderText("0.00")).toHaveLength(3); // total + 2 line items
    });

    it("submits updated data correctly", async () => {
      const user = userEvent.setup();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "existing-expense-id" }),
      });

      render(<ExpenseForm {...editProps} />);

      // Update total amount
      const totalAmountInput = screen.getByPlaceholderText("0.00");
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "250");

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /save draft/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/expenses/existing-expense-id",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              totalAmount: 250,
              managerIds: ["manager-1"],
              lineItems: [
                {
                  amount: 100,
                  date: "2023-12-01T00:00:00.000Z",
                  description: "Office supplies",
                  category: "Office",
                  attachments: [],
                },
                {
                  amount: 100,
                  date: "2023-12-02T00:00:00.000Z",
                  description: "Travel",
                  category: "Transportation",
                  attachments: [],
                },
              ],
            }),
          }
        );
      });
    });
  });

  describe("approval workflows", () => {
    it("submits expense for pre-approval", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Switch to Personal mode (pre-approval uses submitForPreApproval in ExpenseForm)
      const personalButton = screen.getByRole("button", { name: /personal/i });
      await user.click(personalButton);

      // Fill valid form with line item
      const totalAmountInput = screen.getByPlaceholderText("0.00");
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "100");

      const lineItemAmountInput = screen.getAllByPlaceholderText("0.00")[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "100");

      // Submit report (Personal mode uses submitForPreApproval)
      const submitButton = screen.getByRole("button", {
        name: /submit report \(1\)/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalAmount: 100,
            managerIds: [],
            lineItems: [
              {
                amount: 100,
                date: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
                description: "",
                category: "",
                attachments: [],
              },
            ],
            status: "pre-approval",
          }),
        });
      });
    });

    it("submits expense for final approval", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Work mode is default
      // Fill valid form with line item
      const totalAmountInput = screen.getByPlaceholderText("0.00");
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "150");

      const lineItemAmountInput = screen.getAllByPlaceholderText("0.00")[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "150");

      // Select manager
      const managerSelect = screen.getByRole("combobox");
      await user.click(managerSelect);
      const managerOption = screen.getByText("Manager One");
      await user.click(managerOption);

      // Submit report (Work mode uses submitForFinalApproval)
      const submitButton = screen.getByRole("button", {
        name: /submit report \(1\)/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalAmount: 150,
            managerIds: ["manager-1"],
            lineItems: [
              {
                amount: 150,
                date: new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
                description: "",
                category: "",
                attachments: [],
              },
            ],
            status: "approval-pending",
          }),
        });
      });
    });

    it("disables approval buttons when manager not selected in work mode", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Fill valid form
      const totalAmountInput = screen.getByPlaceholderText("0.00");
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "100");

      const submitButton = screen.getByRole("button", {
        name: /submit report \(1\)/i,
      });
      await user.click(submitButton);

      // Should show error toast (mocked indirectly)
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
