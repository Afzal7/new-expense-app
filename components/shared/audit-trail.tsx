"use client";

import {
  Clock,
  User,
  ArrowRight,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Expense } from "@/types/expense";

interface AuditTrailProps {
  expense: Expense;
  className?: string;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "created":
      return <FileText className="w-4 h-4 text-blue-600" />;
    case "submitted":
      return <ArrowRight className="w-4 h-4 text-yellow-600" />;
    case "approved":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-red-600" />;
    case "reimbursed":
      return <DollarSign className="w-4 h-4 text-purple-600" />;
    case "deleted":
      return <Trash2 className="w-4 h-4 text-red-600" />;
    case "restored":
      return <RotateCcw className="w-4 h-4 text-green-600" />;
    case "updated":
      return <FileText className="w-4 h-4 text-orange-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "created":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "submitted":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "reimbursed":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "deleted":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "restored":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "updated":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const formatAction = (action: string) => {
  switch (action) {
    case "created":
      return "Created";
    case "submitted":
      return "Submitted for approval";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "reimbursed":
      return "Reimbursed";
    case "deleted":
      return "Deleted";
    case "restored":
      return "Restored";
    case "updated":
      return "Updated";
    default:
      return action.charAt(0).toUpperCase() + action.slice(1);
  }
};

export function AuditTrail({ expense, className = "" }: AuditTrailProps) {
  if (!expense.auditLog || expense.auditLog.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No audit history available.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort audit log by date (most recent first)
  const sortedAuditLog = [...expense.auditLog].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Audit Trail
          <Badge variant="secondary" className="ml-auto">
            {sortedAuditLog.length} entries
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAuditLog.map((entry, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Action Icon */}
              <div className="flex-shrink-0 mt-1">
                {getActionIcon(entry.action)}
              </div>

              {/* Timeline line (except for last item) */}
              {index < sortedAuditLog.length - 1 && (
                <div className="w-px bg-gray-200 dark:bg-gray-700 h-8 ml-2" />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={getActionColor(entry.action)}>
                    {formatAction(entry.action)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>Actor ID: {entry.actorId}</span>
                </div>

                {/* Show changes if available */}
                {(entry.previousValues || entry.updatedValues) && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                    {entry.previousValues && entry.updatedValues && (
                      <div className="space-y-1">
                        {Object.keys(entry.updatedValues).map((key) => {
                          const prev = entry.previousValues?.[key];
                          const curr = entry.updatedValues?.[key];
                          if (JSON.stringify(prev) !== JSON.stringify(curr)) {
                            return (
                              <div
                                key={key}
                                className="flex items-center gap-2"
                              >
                                <span className="font-medium capitalize">
                                  {key}:
                                </span>
                                <span className="line-through text-red-600">
                                  {JSON.stringify(prev)}
                                </span>
                                <ArrowRight className="w-3 h-3" />
                                <span className="text-green-600">
                                  {JSON.stringify(curr)}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {sortedAuditLog.length > 5 && (
          <>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground text-center">
              Showing last {sortedAuditLog.length} audit entries
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
