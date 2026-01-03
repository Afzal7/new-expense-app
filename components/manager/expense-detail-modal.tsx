import React, { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpense } from "@/hooks/use-expenses";
import { useExpenseMutations } from "@/hooks/use-expense-mutations";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import type { Expense } from "@/types/expense";

interface ExpenseDetailModalProps {
  expenseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseDetailModal({
  expenseId,
  open,
  onOpenChange,
}: ExpenseDetailModalProps) {
  const { data: expense, isLoading, error } = useExpense(expenseId);
  const { approveExpense, rejectExpense } = useExpenseMutations();
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);

  const handleAction = async (action: "approve" | "reject") => {
    if (!expense) return;

    try {
      if (action === "approve") {
        await approveExpense.mutateAsync(expense.id);
      } else {
        await rejectExpense.mutateAsync(expense.id);
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hook (toast)
    }
  };

  const canApproveReject = expense?.state === EXPENSE_STATES.APPROVAL_PENDING;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Expense Details...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !expense) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-destructive">
            {error?.message || "Failed to load expense details"}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              Review and manage expense #{expense.id}
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Expense ID
                    </label>
                    <p className="text-sm">{expense.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          expense.state === EXPENSE_STATES.APPROVED
                            ? "default"
                            : expense.state === EXPENSE_STATES.REJECTED
                              ? "destructive"
                              : expense.state ===
                                  EXPENSE_STATES.APPROVAL_PENDING
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {expense.state}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Total Amount
                    </label>
                    <p className="text-lg font-semibold">
                      ${expense.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Created At
                    </label>
                    <p className="text-sm">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expense.lineItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Date
                          </label>
                          <p className="text-sm">
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Description
                          </label>
                          <p className="text-sm">{item.description || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Category
                          </label>
                          <p className="text-sm">{item.category || "N/A"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Amount
                          </label>
                          <p className="text-sm font-semibold">
                            ${item.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {item.attachments.length > 0 && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-muted-foreground">
                            Attachments
                          </label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.attachments.map((attachment, attIndex) => (
                              <div key={attIndex} className="relative">
                                <Image
                                  src={attachment}
                                  alt={`Attachment ${attIndex + 1}`}
                                  width={80}
                                  height={80}
                                  className="object-cover rounded border"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audit Log */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expense.auditLog.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start gap-3 p-3 border rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleString()} by{" "}
                          {entry.actorId}
                        </p>
                        {entry.previousValues && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Previous: {JSON.stringify(entry.previousValues)}
                          </p>
                        )}
                        {entry.updatedValues && (
                          <p className="text-xs text-muted-foreground">
                            Updated: {JSON.stringify(entry.updatedValues)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {canApproveReject && (
              <>
                <Separator />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmAction("reject")}
                    disabled={rejectExpense.isPending}
                  >
                    {rejectExpense.isPending ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => setConfirmAction("approve")}
                    disabled={approveExpense.isPending}
                  >
                    {approveExpense.isPending ? "Approving..." : "Approve"}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approve"
                ? "Approve Expense"
                : "Reject Expense"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction} this expense? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) {
                  handleAction(confirmAction);
                  setConfirmAction(null);
                }
              }}
            >
              {confirmAction === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
