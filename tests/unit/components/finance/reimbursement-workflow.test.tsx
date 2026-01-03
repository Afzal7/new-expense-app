import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReimbursementsClient } from "@/app/dashboard/finance/reimbursements/_components/ReimbursementsClient";
import type { Expense } from "@/types/expense";

// Mock the expense mutations hook
const mockReimburseExpense = vi.fn();
vi.mock("@/hooks/use-expense-mutations", () => ({
  useExpenseMutations: vi.fn(() => ({
    reimburseExpense: {
      mutateAsync: mockReimburseExpense,
      isPending: false,
    },
  })),
}));

// Mock ExpenseList component since we're testing the client wrapper
vi.mock("@/components/shared/expense-list", () => ({
  ExpenseList: vi.fn(
    ({ renderActions, additionalFilters, routePrefix, showColumns }) => {
      const mockExpense: Expense = {
        id: "expense-1",
        userId: "user-1",
        organizationId: "org-1",
        managerIds: ["manager-1"],
        totalAmount: 150,
        state: "Approved" as const,
        lineItems: [
          {
            amount: 150,
            date: "2023-12-01T00:00:00.000Z",
            description: "Office supplies",
            category: "Office",
            attachments: [],
          },
        ],
        auditLog: [],
        createdAt: "2023-12-01T00:00:00.000Z",
        updatedAt: "2023-12-01T00:00:00.000Z",
        deletedAt: null,
      };

      return (
        <div data-testid="expense-list">
          <div data-testid="expense-list-props">
            {JSON.stringify({
              routePrefix,
              additionalFilters,
              showColumns,
              hasRenderActions: !!renderActions,
            })}
          </div>
          {/* Simulate rendering actions */}
          {renderActions && (
            <div data-testid="rendered-actions">
              {renderActions(mockExpense)}
            </div>
          )}
        </div>
      );
    }
  ),
}));

describe("ReimbursementsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReimburseExpense.mockResolvedValue({
      id: "expense-1",
      state: "Reimbursed",
    });
  });

  describe("rendering", () => {
    it("renders the page title and description", () => {
      render(<ReimbursementsClient />);

      expect(
        screen.getByRole("heading", { name: /ready for reimbursement/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /process approved expenses that are ready for reimbursement/i
        )
      ).toBeInTheDocument();
    });

    it("renders ExpenseList with correct props", () => {
      render(<ReimbursementsClient />);

      const expenseListProps = JSON.parse(
        screen.getByTestId("expense-list-props").textContent || "{}"
      );

      expect(expenseListProps.routePrefix).toBe(
        "/dashboard/finance/reimbursements"
      );
      expect(expenseListProps.additionalFilters).toEqual({
        state: "Approved",
      });
      expect(expenseListProps.showColumns).toEqual({
        employee: true,
        organization: true,
        actions: true,
      });
      expect(expenseListProps.hasRenderActions).toBe(true);
    });

    it("renders reimburse button in actions", () => {
      render(<ReimbursementsClient />);

      expect(
        screen.getByRole("button", { name: /reimburse/i })
      ).toBeInTheDocument();
      expect(screen.getByText("Reimburse")).toBeInTheDocument();
    });
  });

  describe("reimbursement functionality", () => {
    it("calls reimburseExpense.mutateAsync when reimburse button is clicked", async () => {
      const user = userEvent.setup();

      render(<ReimbursementsClient />);

      const reimburseButton = screen.getByRole("button", {
        name: /reimburse/i,
      });
      await user.click(reimburseButton);

      expect(mockReimburseExpense).toHaveBeenCalledWith("expense-1");
      expect(mockReimburseExpense).toHaveBeenCalledTimes(1);
    });

    it("handles successful reimbursement", async () => {
      const user = userEvent.setup();

      render(<ReimbursementsClient />);

      const reimburseButton = screen.getByRole("button", {
        name: /reimburse/i,
      });
      await user.click(reimburseButton);

      await waitFor(() => {
        expect(mockReimburseExpense).toHaveBeenCalledWith("expense-1");
      });
    });

    it("handles reimbursement error gracefully", async () => {
      const user = userEvent.setup();
      mockReimburseExpense.mockRejectedValueOnce(
        new Error("Reimbursement failed")
      );

      // Mock console.error to avoid test output noise
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ReimbursementsClient />);

      const reimburseButton = screen.getByRole("button", {
        name: /reimburse/i,
      });
      await user.click(reimburseButton);

      await waitFor(() => {
        expect(mockReimburseExpense).toHaveBeenCalledWith("expense-1");
      });

      // Error should be caught and not throw
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("button styling", () => {
    it("applies correct styling to reimburse button", () => {
      render(<ReimbursementsClient />);

      const reimburseButton = screen.getByRole("button", {
        name: /reimburse/i,
      });
      expect(reimburseButton).toHaveClass("bg-green-600", "hover:bg-green-700");
    });

    it("includes check circle icon in button", () => {
      render(<ReimbursementsClient />);

      const reimburseButton = screen.getByRole("button", {
        name: /reimburse/i,
      });
      const icon = reimburseButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("w-4", "h-4", "mr-1");
    });
  });

  describe("expense filtering", () => {
    it("filters expenses to show only approved ones", () => {
      render(<ReimbursementsClient />);

      const expenseListProps = JSON.parse(
        screen.getByTestId("expense-list-props").textContent || "{}"
      );

      expect(expenseListProps.additionalFilters.state).toBe("Approved");
    });
  });

  describe("accessibility", () => {
    it("has proper button role for reimburse action", () => {
      render(<ReimbursementsClient />);

      expect(
        screen.getByRole("button", { name: /reimburse/i })
      ).toBeInTheDocument();
    });

    it("shows descriptive text for screen readers", () => {
      render(<ReimbursementsClient />);

      expect(
        screen.getByText(
          "Process approved expenses that are ready for reimbursement."
        )
      ).toBeInTheDocument();
    });
  });
});
