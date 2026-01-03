import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApprovalButtonGroup from "@/components/approval-button-group";

describe("ApprovalButtonGroup", () => {
  const mockOnAction = vi.fn();

  const defaultOptions = [
    {
      label: "Approve",
      description: "Approve this expense for further processing.",
      action: "approve",
      variant: "default" as const,
    },
    {
      label: "Reject",
      description: "Reject this expense submission.",
      action: "reject",
      variant: "destructive" as const,
    },
    {
      label: "Reimburse",
      description: "Mark this expense as reimbursed.",
      action: "reimburse",
      variant: "default" as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders with default selected option", () => {
      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      expect(
        screen.getByRole("button", { name: /approve/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /select option/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });

    it("displays correct default option label", () => {
      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      expect(
        screen.getByRole("button", { name: /approve/i })
      ).toBeInTheDocument();
    });

    it("applies correct variant to default option", () => {
      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      expect(approveButton).toHaveClass("bg-primary");
    });

    it("renders destructive variant correctly", () => {
      const destructiveOptions = [
        {
          label: "Reject",
          description: "Reject this expense submission.",
          action: "reject",
          variant: "destructive" as const,
        },
      ];

      render(
        <ApprovalButtonGroup
          options={destructiveOptions}
          onAction={mockOnAction}
        />
      );

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      expect(rejectButton).toHaveClass("bg-destructive");
    });
  });

  describe("dropdown functionality", () => {
    it("opens dropdown when trigger is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      const dropdownTrigger = screen.getByRole("button", {
        name: /select option/i,
      });
      await user.click(dropdownTrigger);

      expect(
        screen.getByText("Approve this expense for further processing.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Reject this expense submission.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Mark this expense as reimbursed.")
      ).toBeInTheDocument();
    });

    it("changes selected option when dropdown item is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      // Open dropdown
      const dropdownTrigger = screen.getByRole("button", {
        name: /select option/i,
      });
      await user.click(dropdownTrigger);

      // Select Reject option
      const rejectOption = screen.getByText("Reject this expense submission.");
      await user.click(rejectOption);

      // Check that Reject is now the selected option
      expect(
        screen.getByRole("button", { name: /reject/i })
      ).toBeInTheDocument();
    });

    it("applies destructive variant when reject is selected", async () => {
      const user = userEvent.setup();

      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      // Open dropdown and select Reject
      const dropdownTrigger = screen.getByRole("button", {
        name: /select option/i,
      });
      await user.click(dropdownTrigger);

      const rejectOption = screen.getByText("Reject this expense submission.");
      await user.click(rejectOption);

      const rejectButton = screen.getByRole("button", { name: /reject/i });
      expect(rejectButton).toHaveClass("bg-destructive");
    });

    it("displays option descriptions correctly", async () => {
      const user = userEvent.setup();

      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      const dropdownTrigger = screen.getByRole("button", {
        name: /select option/i,
      });
      await user.click(dropdownTrigger);

      expect(
        screen.getByText("Approve this expense for further processing.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Reject this expense submission.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Mark this expense as reimbursed.")
      ).toBeInTheDocument();
    });
  });

  describe("action handling", () => {
    it("calls onAction with correct action when submit is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await user.click(submitButton);

      expect(mockOnAction).toHaveBeenCalledWith("approve");
      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });

    it("calls onAction with selected option action", async () => {
      const user = userEvent.setup();

      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      // Change to reject option
      const dropdownTrigger = screen.getByRole("button", {
        name: /select option/i,
      });
      await user.click(dropdownTrigger);

      const rejectOption = screen.getByText("Reject this expense submission.");
      await user.click(rejectOption);

      // Submit
      const submitButton = screen.getByRole("button", { name: /submit/i });
      await user.click(submitButton);

      expect(mockOnAction).toHaveBeenCalledWith("reject");
    });

    it("calls onAction with reimburse action when selected", async () => {
      const user = userEvent.setup();

      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      // Change to reimburse option
      const dropdownTrigger = screen.getByRole("button", {
        name: /select option/i,
      });
      await user.click(dropdownTrigger);

      const reimburseOption = screen.getByText(
        "Mark this expense as reimbursed."
      );
      await user.click(reimburseOption);

      // Submit
      const submitButton = screen.getByRole("button", { name: /submit/i });
      await user.click(submitButton);

      expect(mockOnAction).toHaveBeenCalledWith("reimburse");
    });
  });

  describe("disabled state", () => {
    it("disables all buttons when disabled prop is true", () => {
      render(
        <ApprovalButtonGroup
          options={defaultOptions}
          onAction={mockOnAction}
          disabled={true}
        />
      );

      const approveButton = screen.getByRole("button", { name: /approve/i });
      const dropdownTrigger = screen.getByRole("button", {
        name: /select option/i,
      });
      const submitButton = screen.getByRole("button", { name: /submit/i });

      expect(approveButton).toBeDisabled();
      expect(dropdownTrigger).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it("does not call onAction when disabled", async () => {
      const user = userEvent.setup();

      render(
        <ApprovalButtonGroup
          options={defaultOptions}
          onAction={mockOnAction}
          disabled={true}
        />
      );

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await user.click(submitButton);

      expect(mockOnAction).not.toHaveBeenCalled();
    });
  });

  describe("single option", () => {
    it("works with single option", async () => {
      const user = userEvent.setup();
      const singleOption = [
        {
          label: "Approve",
          description: "Approve this expense.",
          action: "approve",
          variant: "default" as const,
        },
      ];

      render(
        <ApprovalButtonGroup options={singleOption} onAction={mockOnAction} />
      );

      const submitButton = screen.getByRole("button", { name: /submit/i });
      await user.click(submitButton);

      expect(mockOnAction).toHaveBeenCalledWith("approve");
    });
  });

  describe("approval workflow states", () => {
    it("handles pre-approval pending state options", () => {
      const preApprovalOptions = [
        {
          label: "Approve",
          description: "Approve this expense for further processing.",
          action: "approve",
          variant: "default" as const,
        },
        {
          label: "Reject",
          description: "Reject this expense submission.",
          action: "reject",
          variant: "destructive" as const,
        },
      ];

      render(
        <ApprovalButtonGroup
          options={preApprovalOptions}
          onAction={mockOnAction}
        />
      );

      expect(
        screen.getByRole("button", { name: /approve/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /select option/i })
      ).toBeInTheDocument();
    });

    it("handles approved state options", () => {
      const approvedOptions = [
        {
          label: "Reimburse",
          description: "Mark this expense as reimbursed.",
          action: "reimburse",
          variant: "default" as const,
        },
      ];

      render(
        <ApprovalButtonGroup
          options={approvedOptions}
          onAction={mockOnAction}
        />
      );

      expect(
        screen.getByRole("button", { name: /reimburse/i })
      ).toBeInTheDocument();
    });

    it("handles rejected state options", () => {
      const rejectedOptions = [
        {
          label: "Approve",
          description: "Approve this previously rejected expense.",
          action: "approve",
          variant: "default" as const,
        },
      ];

      render(
        <ApprovalButtonGroup
          options={rejectedOptions}
          onAction={mockOnAction}
        />
      );

      expect(
        screen.getByRole("button", { name: /approve/i })
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has proper screen reader text for dropdown trigger", () => {
      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      expect(screen.getByText("Select option")).toHaveClass("sr-only");
    });

    it("has proper button roles", () => {
      render(
        <ApprovalButtonGroup options={defaultOptions} onAction={mockOnAction} />
      );

      expect(
        screen.getByRole("button", { name: /approve/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /select option/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });
  });
});
