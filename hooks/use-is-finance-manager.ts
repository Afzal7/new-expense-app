"use client";

/**
 * Finance routes use the same admin/owner gate as manager tools today.
 * Reuses {@link useIsManager} / active member so getActiveMember is only fetched once.
 */
export { useIsManager as useIsFinanceManager } from "@/hooks/use-is-manager";
