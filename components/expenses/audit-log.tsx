"use client";

import type { AuditEntry } from "@/types/expense";
import { getAuditActionLabel } from "@/lib/utils/audit-labels";

interface AuditLogProps {
  logs: AuditEntry[];
}

/**
 * AuditLog: Visualizes the history of the expense.
 * Vital for trust in financial applications.
 */
export function AuditLog({ logs }: AuditLogProps) {
  // Reverse logs to show most recent first
  const reversedLogs = [...logs].reverse();

  return (
    <div className="relative border-l-2 border-border ml-3 pl-6 space-y-6 py-2">
      {reversedLogs.map((log, i) => (
        <div key={i} className="relative">
          {/* Timeline Node */}
          <div
            className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-card ring-1 ring-border ${
              i === 0 ? "bg-foreground" : "bg-muted-foreground"
            }`}
          />
          <div className="text-xs text-muted-foreground font-bold mb-0.5">
            {new Date(log.date).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-sm">
            <span className="font-bold text-foreground">
              {log.actorName || "Unknown User"}
            </span>{" "}
            {getAuditActionLabel(log.action)}
          </div>
        </div>
      ))}
    </div>
  );
}
