"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import type { Expense } from "@/types/expense";

interface ExpenseStatusDropdownProps {
  expense: Expense;
  isAdmin?: boolean;
  isPending?: boolean;
  onStatusChange: (status: string, comment?: string) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
}

export function ExpenseStatusDropdown({
  expense,
  isAdmin = false,
  isPending = false,
  onStatusChange,
  comment,
  onCommentChange,
}: ExpenseStatusDropdownProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between font-medium ${
            isPending ? "opacity-50" : ""
          }`}
          disabled={isPending}
        >
          <span className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                expense.state === EXPENSE_STATES.APPROVED
                  ? "bg-green-500"
                  : expense.state === EXPENSE_STATES.REJECTED
                    ? "bg-red-500"
                    : expense.state === EXPENSE_STATES.REIMBURSED
                      ? "bg-indigo-500"
                      : "bg-current opacity-60"
              }`}
            />
            {expense.state
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
          <svg
            className="w-4 h-4 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-gray-500 border-b">
          Change Status
        </div>
        {/* Comment input for approve/reject */}
        <div className="p-2 border-b">
          <textarea
            placeholder="Add optional comment..."
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full text-sm p-2 border border-zinc-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-zinc-900"
            rows={2}
            onKeyDown={handleKeyDown}
          />
        </div>
        {isAdmin &&
          Object.values(EXPENSE_STATES)
            .filter((status) => status !== expense.state)
            .map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onStatusChange(status, comment)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      status === EXPENSE_STATES.APPROVED
                        ? "bg-green-500"
                        : status === EXPENSE_STATES.REJECTED
                          ? "bg-red-500"
                          : status === EXPENSE_STATES.REIMBURSED
                            ? "bg-indigo-500"
                            : "bg-gray-400"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span
                      className={`text-sm ${
                        status === EXPENSE_STATES.DRAFT
                          ? "text-zinc-400 italic"
                          : ""
                      }`}
                    >
                      {status
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    {/* Show admin-only badge for non-workflow states */}
                    {[
                      EXPENSE_STATES.DRAFT,
                      EXPENSE_STATES.PRE_APPROVAL_PENDING,
                      EXPENSE_STATES.PRE_APPROVED,
                    ].includes(status as any) && (
                      <span className="text-[10px] text-zinc-400 font-normal">
                        Admin override
                      </span>
                    )}
                  </div>
                </span>
              </DropdownMenuItem>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
