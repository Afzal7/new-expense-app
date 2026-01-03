"use client";

import { ArrowRight, Circle, CheckCircle, Clock, XCircle } from "lucide-react";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";

interface ExpenseWorkflowProps {
  currentState?: string;
  className?: string;
}

const workflowSteps = [
  {
    key: EXPENSE_STATES.DRAFT,
    label: "Draft",
    description: "Expense being created",
  },
  {
    key: EXPENSE_STATES.PRE_APPROVAL_PENDING,
    label: "Pre-Approval Pending",
    description: "Waiting for manager pre-approval",
  },
  {
    key: EXPENSE_STATES.PRE_APPROVED,
    label: "Pre-Approved",
    description: "Pre-approved, ready for final approval",
  },
  {
    key: EXPENSE_STATES.APPROVAL_PENDING,
    label: "Approval Pending",
    description: "Waiting for final approval",
  },
  {
    key: EXPENSE_STATES.APPROVED,
    label: "Approved",
    description: "Approved, ready for reimbursement",
  },
  {
    key: EXPENSE_STATES.REIMBURSED,
    label: "Reimbursed",
    description: "Payment processed",
  },
];

export function ExpenseWorkflow({
  currentState,
  className = "",
}: ExpenseWorkflowProps) {
  const getCurrentStepIndex = () => {
    return workflowSteps.findIndex((step) => step.key === currentState);
  };

  const getStepIcon = (stepIndex: number, currentIndex: number) => {
    if (stepIndex < currentIndex) {
      // Completed step
      return (
        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
      );
    } else if (stepIndex === currentIndex) {
      // Current step
      return <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    } else {
      // Future step
      return <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />;
    }
  };

  const getStepStatus = (stepIndex: number, currentIndex: number) => {
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
        Expense Approval Workflow
      </h3>

      <div className="flex items-center justify-between">
        {workflowSteps.map((step, index) => {
          const status = getStepStatus(index, currentIndex);
          const isLast = index === workflowSteps.length - 1;

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                <div className="flex flex-col items-center mb-2">
                  {getStepIcon(index, currentIndex)}
                  <div className="text-center mt-2">
                    <div
                      className={`text-sm font-medium ${
                        status === "completed"
                          ? "text-green-700 dark:text-green-300"
                          : status === "current"
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-24">
                      {step.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              {!isLast && (
                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-600 mx-2 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Completed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Current Step
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Pending
          </span>
        </div>
      </div>
    </div>
  );
}
