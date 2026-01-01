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
    expect(screen.getByText(/managers/i)).toBeInTheDocument();
    expect(screen.getByText(/add a manager/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add line item/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create expense/i })
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
        name: /create expense/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
      });
    });

    it("shows validation error for zero total amount", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      const totalAmountInput = screen.getByLabelText(/total amount/i);
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "0");

      const submitButton = screen.getByRole("button", {
        name: /create expense/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/total amount must be greater than 0/i)
        ).toBeInTheDocument();
      });
    });

    it("shows validation error for line item with future date", async () => {
      const user = userEvent.setup();
      render(<ExpenseForm {...defaultProps} />);

      const addLineItemButton = screen.getByRole("button", {
        name: /add line item/i,
      });
      await user.click(addLineItemButton);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateInput = screen.getByLabelText(/date/i);
      await user.clear(dateInput);
      await user.type(dateInput, futureDate.toISOString().split("T")[0]);

      const submitButton = screen.getByRole("button", {
        name: /create expense/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/date cannot be in the future/i)
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
        name: /add line item/i,
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
        name: /create expense/i,
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
        name: /create expense/i,
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

      // Fill valid form with line item to match total
      const totalAmountInput = screen.getByLabelText(/total amount/i);
      await user.clear(totalAmountInput);
      await user.type(totalAmountInput, "100");

      // Add line item first
      const addLineItemButton = screen.getByRole("button", {
        name: /add line item/i,
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
        name: /create expense/i,
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
        name: /add line item/i,
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
        name: /add line item/i,
      });
      await user.click(addLineItemButton);

      const dateInput = screen.getByLabelText(/date/i);
      const today = new Date().toISOString().split("T")[0];
      expect(dateInput).toHaveValue(today);
    });
  });
});
