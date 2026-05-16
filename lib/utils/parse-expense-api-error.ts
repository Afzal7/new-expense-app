/**
 * Builds user-visible messages from POST/PUT/PATCH expense API error JSON.
 * Format: "Failed to {action} because {reason}."
 */

export const EXPENSE_VALIDATION_SUMMARY_MESSAGE =
  "Please fix the validation errors below";

type ApiErrorBody = {
  error?: {
    message?: string;
    details?: {
      fields?: Record<string, string[]>;
      general?: string[];
    };
  };
};

export type ParseExpenseApiErrorOptions = {
  /** Short verb phrase after "Failed to", e.g. "save the new expense" */
  action: string;
  /** Used when the body is missing or no reason can be extracted */
  fallbackReason?: string;
};

function stripTrailingPeriods(s: string): string {
  return s.replace(/\.+$/u, "").trim();
}

/**
 * Turns `lineItems.0.amount` into "Line 1 amount", `totalAmount` into "Total amount", etc.
 */
export function humanizeExpenseFieldPath(path: string): string {
  const lineMatch = /^lineItems\.(\d+)\.(\w+)$/u.exec(path);
  if (lineMatch) {
    const lineNumber = Number(lineMatch[1]) + 1;
    const field = lineMatch[2];
    const fieldLabels: Record<string, string> = {
      amount: "amount",
      date: "date",
      description: "description",
      category: "category",
      attachments: "attachments",
    };
    const label = fieldLabels[field] ?? field;
    return `Line ${lineNumber} ${label}`;
  }

  const topLabels: Record<string, string> = {
    totalAmount: "Total amount",
    managerIds: "Approvers",
    lineItems: "Line items",
    status: "Status",
  };

  if (path in topLabels) {
    return topLabels[path] ?? path;
  }

  return path
    .replace(/([A-Z])/gu, " $1")
    .replace(/_/gu, " ")
    .replace(/^\s+/u, "")
    .replace(/\s+/gu, " ")
    .replace(/^./u, (c) => c.toUpperCase());
}

function joinFieldErrors(
  fields: Record<string, string[]>
): string | undefined {
  const parts: string[] = [];
  for (const [path, messages] of Object.entries(fields)) {
    const detail = messages?.filter((m) => m.trim() !== "").join("; ");
    if (!detail) {
      continue;
    }
    const label = humanizeExpenseFieldPath(path);
    parts.push(`${label}: ${detail}`);
  }
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join(" ");
}

/**
 * Returns a full sentence: `Failed to {action} because {reason}.`
 */
export function parseExpenseApiErrorMessage(
  body: unknown,
  options: ParseExpenseApiErrorOptions
): string {
  const action = options.action.trim();
  const fallbackReason =
    options.fallbackReason ?? "the server did not return details";

  const format = (reason: string): string => {
    const r = stripTrailingPeriods(reason);
    return `Failed to ${action} because ${r}.`;
  };

  if (!body || typeof body !== "object") {
    return format(fallbackReason);
  }

  const err = (body as ApiErrorBody).error;
  let apiMsg = err?.message?.trim() ?? "";
  if (
    apiMsg === "" &&
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
  ) {
    apiMsg = String((body as { message: string }).message).trim();
  }

  const fieldText = err?.details?.fields
    ? joinFieldErrors(err.details.fields)
    : undefined;
  if (fieldText) {
    return format(fieldText);
  }

  const general = err?.details?.general?.filter((g) => g.trim() !== "") ?? [];
  if (general.length > 0) {
    return format(general.join("; "));
  }

  if (apiMsg && apiMsg !== EXPENSE_VALIDATION_SUMMARY_MESSAGE) {
    return format(apiMsg);
  }

  if (apiMsg === EXPENSE_VALIDATION_SUMMARY_MESSAGE) {
    return format(
      options.fallbackReason ??
        "validation failed but no field details were returned"
    );
  }

  return format(fallbackReason);
}
