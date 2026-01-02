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

    expect(screen.getByLabelText(/total amount/i)).toBeInTheDocument();
    expect(screen.getByText("Approval Manager *")).toBeInTheDocument();
    expect(screen.getByText(/select managers/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add item/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save draft/i })
    ).toBeInTheDocument();
    // Main submit button that shows selected option (defaults to "Submit for Pre-approval")
    expect(
      screen.getByRole("button", { name: /submit for pre-approval/i })
    ).toBeInTheDocument();
    // Dropdown trigger for selecting different approval options
    expect(
      screen.getByRole("button", { name: /select submit option/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  describe("form validation", () => {
    it("shows validation error for invalid total amount", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      const totalAmountInput = screen.getByLabelText(/total amount/i);
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "abc");

      const submitButton = screen.getByRole("button", {
        name: /save draft/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid input: expected number, received NaN/i)
        ).toBeInTheDocument();
      });
    });

    it("shows validation error for negative total amount", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      const totalAmountInput = screen.getByLabelText(/total amount/i);
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
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "100");

      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

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
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "150");

      // Select manager
      const managerSelect = screen.getByRole("combobox");
      await user.click(managerSelect);
      const managerOption = screen.getByText("Manager One");
      await user.click(managerOption);

      // Add line item
      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

      const lineItemAmountInputs = screen.getAllByLabelText(/amount/i);
      const lineItemAmountInput = lineItemAmountInputs[1]; // Second amount input (line item)
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "150");

      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, "Office supplies");

      const categoryInput = screen.getByLabelText(/category/i);
      await user.type(categoryInput, "Office");

      const dateInput = screen.getByLabelText(/date \*/i);
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
      const totalAmountInput = screen.getByLabelText(/total amount/i);
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
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "100");

      // Add line item first
      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

      const lineItemAmountInputs = screen.getAllByLabelText(/amount/i);
      const lineItemAmountInput = lineItemAmountInputs[1]; // Second amount input (line item)
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

      // Initially no line items (only total amount)
      expect(screen.getByLabelText(/total amount/i)).toBeInTheDocument();

      // Add first line item
      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

      expect(screen.getAllByLabelText(/amount/i)).toHaveLength(2);
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();

      // Add second line item
      await user.click(addLineItemButton);

      expect(screen.getAllByLabelText(/amount/i)).toHaveLength(3);

      // Remove first line item
      const removeButtons = screen.getAllByRole("button", { name: /remove/i });
      await user.click(removeButtons[0]);

      expect(screen.getAllByLabelText(/amount/i)).toHaveLength(2);
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
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

      const dateInput = screen.getByLabelText(/date/i);
      const today = new Date().toISOString().split("T")[0];
      expect(dateInput).toHaveValue(today);
    });

    it("calculates and displays total from line items", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Add line item
      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

      // Fill line item with amount
      const lineItemAmountInput = screen.getAllByLabelText(/amount/i)[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "50.25");

      // Should show calculated total
      await waitFor(() => {
        expect(screen.getByText("$50.25")).toBeInTheDocument();
      });
      expect(screen.getByText(/based on 1 line item/i)).toBeInTheDocument();
    });

    it("auto-fills total amount when 'Use This Amount' button is clicked", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Add line item
      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

      // Fill line item with amount
      const lineItemAmountInput = screen.getAllByLabelText(/amount/i)[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "75.50");

      // Click "Use This Amount" button
      const useAmountButton = screen.getByRole("button", {
        name: /use this amount/i,
      });
      await user.click(useAmountButton);

      // Total amount should be auto-filled
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      expect(totalAmountInput).toHaveValue(75.5);
    });

    it("shows calculated total summary with multiple line items", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      // Add multiple line items
      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);
      await user.click(addLineItemButton);

      // Fill amounts
      const lineItemInputs = screen.getAllByLabelText(/amount/i);
      await user.clear(lineItemInputs[1]);
      await user.type(lineItemInputs[1], "25.00");
      await user.clear(lineItemInputs[2]);
      await user.type(lineItemInputs[2], "30.50");

      // Should show total of 55.50
      await waitFor(() => {
        expect(screen.getByText("$55.50")).toBeInTheDocument();
      });
      expect(screen.getByText(/based on 2 line items/i)).toBeInTheDocument();
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
            date: new Date("2023-12-01"),
            description: "Office supplies",
            category: "Office",
            attachments: [],
          },
          {
            amount: 100,
            date: new Date("2023-12-02"),
            description: "Travel",
            category: "Transportation",
            attachments: [],
          },
        ],
        state: "Draft" as const,
        auditLog: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    };

    it("renders with pre-filled data in edit mode", () => {
      render(<ExpenseForm {...editProps} />);

      expect(screen.getByText("Edit Expense")).toBeInTheDocument();
      expect(screen.getByLabelText(/total amount/i)).toHaveValue(200);
      expect(screen.getAllByLabelText(/amount/i)).toHaveLength(3); // total + 2 line items
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
      const totalAmountInput = screen.getByLabelText(/total amount/i);
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

      // Fill valid form with line item
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "100");

      // Add line item
      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

      const lineItemAmountInput = screen.getAllByLabelText(/amount/i)[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "100");

      // Select manager
      const managerSelect = screen.getByRole("combobox");
      await user.click(managerSelect);
      const managerOption = screen.getByText("Manager One");
      await user.click(managerOption);

      // Submit for pre-approval
      const submitButton = screen.getByRole("button", {
        name: /submit for pre-approval/i,
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
            managerIds: ["manager-1"],
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

      // Fill valid form with line item
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "150");

      // Add line item
      const addLineItemButton = screen.getByRole("button", {
        name: /add item/i,
      });
      await user.click(addLineItemButton);

      const lineItemAmountInput = screen.getAllByLabelText(/amount/i)[1];
      await user.clear(lineItemAmountInput);
      await user.type(lineItemAmountInput, "150");

      // Select manager
      const managerSelect = screen.getByRole("combobox");
      await user.click(managerSelect);
      const managerOption = screen.getByText("Manager One");
      await user.click(managerOption);

      // Change to final approval
      const dropdownTrigger = screen.getByRole("button", {
        name: /select submit option/i,
      });
      await user.click(dropdownTrigger);

      const finalApprovalOption = screen.getByText("Submit for Final Approval");
      await user.click(finalApprovalOption);

      // Submit for final approval
      const submitButton = screen.getByRole("button", {
        name: /submit for final approval/i,
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

    it("disables approval buttons when no line items", () => {
      render(<ExpenseForm {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: /submit for pre-approval/i,
      });
      expect(submitButton).toBeDisabled();
    });
  });
});
