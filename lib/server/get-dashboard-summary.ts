/**
 * Dashboard summary aggregations for GET /api/dashboard/summary.
 * Personal Vault uses a trailing 12-month window (UTC). Smart context “this month”
 * uses calendar month boundaries (UTC). Documented contract.
 */

import type { PipelineStage } from "mongoose";
import { EXPENSE_STATES } from "@/lib/constants/expense-states";
import { Expense } from "@/lib/models/expense";
import type {
  DashboardSummaryResponse,
  MemberStatusSummary,
  SmartContextFlat,
} from "@/lib/validations/dashboard-summary";

/** Input from the route: session active org + `auth.api.getActiveMember` (same as the client). */
export type DashboardActiveMember =
  | { kind: "no_active_org_in_session" }
  | { kind: "session_org_error"; message: string }
  | { kind: "ok"; role: string; organizationId: string };

function utcMonthRange(reference: Date): {
  startThis: Date;
  endThis: Date;
  startPrev: Date;
  endPrev: Date;
} {
  const y = reference.getUTCFullYear();
  const m = reference.getUTCMonth();
  const startThis = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
  const endThis = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
  const startPrev = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const endPrev = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { startThis, endThis, startPrev, endPrev };
}

function dollarsToCents(amount: number): number {
  return Math.round(amount * 100);
}

function visibilityMatch(userId: string): Record<string, unknown> {
  return {
    deletedAt: null,
    $or: [{ userId }, { managerIds: { $in: [userId] } }],
  };
}

function privateMatch(userId: string): Record<string, unknown> {
  return {
    userId,
    deletedAt: null,
    "managerIds.0": { $exists: false },
  };
}

const BURN_STATES = [
  EXPENSE_STATES.APPROVED,
  EXPENSE_STATES.REIMBURSED,
] as const;

async function sumPrivateVaultCents(
  userId: string,
  start: Date,
  end: Date,
  endBound: "inclusive" | "exclusive" = "inclusive"
): Promise<number> {
  const createdAt =
    endBound === "inclusive"
      ? { $gte: start, $lte: end }
      : { $gte: start, $lt: end };
  const agg = await Expense.aggregate<{ total: number }>([
    {
      $match: {
        ...privateMatch(userId),
        createdAt,
      },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const sum = agg[0]?.total ?? 0;
  return dollarsToCents(sum);
}

async function sparklinePrivateSeries(
  userId: string,
  now: Date,
  days: number
): Promise<number[]> {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);

  const agg = await Expense.aggregate<{ _id: string; total: number }>([
    {
      $match: {
        ...privateMatch(userId),
        createdAt: { $gte: start, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "UTC",
          },
        },
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  const byDay = new Map<string, number>();
  for (const row of agg) {
    byDay.set(row._id, row.total);
  }

  const series: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    series.push(byDay.get(key) ?? 0);
  }

  const max = Math.max(...series, 1e-6);
  return series.map((v) => Math.round((v / max) * 100));
}

/**
 * Splits work across facets: line-item dated amounts vs. expenses with no line
 * items (fallback to createdAt). Same expense is never counted in both facets.
 */
async function buildAnalytics(
  userId: string,
  now: Date
): Promise<DashboardSummaryResponse["analytics"]> {
  const end = new Date(now);
  end.setUTCHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 6);
  start.setUTCHours(0, 0, 0, 0);

  const pipeline: PipelineStage[] = [
    { $match: visibilityMatch(userId) },
    {
      $facet: {
        fromLineItems: [
          { $unwind: { path: "$lineItems" } },
          {
            $match: {
              "lineItems.date": { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$lineItems.date",
                  timezone: "UTC",
                },
              },
              amount: { $sum: "$lineItems.amount" },
            },
          },
        ],
        fallbackCreated: [
          {
            $match: {
              $or: [
                { lineItems: { $exists: false } },
                { lineItems: { $size: 0 } },
              ],
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                  timezone: "UTC",
                },
              },
              amount: { $sum: "$totalAmount" },
            },
          },
        ],
        categories: [
          { $unwind: { path: "$lineItems" } },
          {
            $match: {
              "lineItems.date": { $gte: start, $lte: end },
              "lineItems.category": { $exists: true, $nin: [null, ""] },
            },
          },
          {
            $group: {
              _id: "$lineItems.category",
              amount: { $sum: "$lineItems.amount" },
            },
          },
          { $sort: { amount: -1 } },
          { $limit: 5 },
        ],
      },
    },
  ];

  type FacetResult = {
    fromLineItems: { _id: string; amount: number }[];
    fallbackCreated: { _id: string; amount: number }[];
    categories: { _id: string; amount: number }[];
  };

  const [facet] = await Expense.aggregate<FacetResult>(pipeline);
  const dayTotals = new Map<string, number>();
  for (const row of facet?.fromLineItems ?? []) {
    dayTotals.set(row._id, (dayTotals.get(row._id) ?? 0) + row.amount);
  }
  for (const row of facet?.fallbackCreated ?? []) {
    dayTotals.set(row._id, (dayTotals.get(row._id) ?? 0) + row.amount);
  }

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const days: DashboardSummaryResponse["analytics"]["days"] = [];
  const todayKey = now.toISOString().slice(0, 10);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(12, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    const amount = dayTotals.get(key) ?? 0;
    const dow = d.getUTCDay();
    days.push({
      label: dayLabels[dow] ?? "?",
      amountCents: dollarsToCents(amount),
      isToday: key === todayKey,
    });
  }

  const rawCats = facet?.categories ?? [];
  const catTotal = rawCats.reduce((s, c) => s + c.amount, 0) || 1;
  const topCategories = rawCats.map((c) => ({
    name: c._id,
    amountCents: dollarsToCents(c.amount),
    percentOfTotal: Math.min(100, Math.round((c.amount / catTotal) * 100)),
  }));

  return { days, topCategories };
}

async function approvalCounts(
  userId: string,
  orgId: string
): Promise<{ pendingPreApproval: number; pendingFinal: number }> {
  const base = {
    organizationId: orgId,
    deletedAt: null,
    managerIds: { $in: [userId] },
  };
  const pendingPreApproval = await Expense.countDocuments({
    ...base,
    state: EXPENSE_STATES.PRE_APPROVAL_PENDING,
  });
  const pendingFinal = await Expense.countDocuments({
    ...base,
    state: EXPENSE_STATES.APPROVAL_PENDING,
  });
  return { pendingPreApproval, pendingFinal };
}

async function financeQueueCount(orgId: string): Promise<number> {
  return Expense.countDocuments({
    organizationId: orgId,
    deletedAt: null,
    state: EXPENSE_STATES.APPROVED,
  });
}

async function orgBurnMonthCents(
  orgId: string,
  start: Date,
  end: Date
): Promise<number> {
  const agg = await Expense.aggregate<{ total: number }>([
    {
      $match: {
        organizationId: orgId,
        deletedAt: null,
        state: { $in: [...BURN_STATES] },
        createdAt: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  return dollarsToCents(agg[0]?.total ?? 0);
}

async function orgBurnLast7DayPercents(
  orgId: string,
  now: Date
): Promise<number[]> {
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 6);
  start.setUTCHours(0, 0, 0, 0);

  const agg = await Expense.aggregate<{ _id: string; total: number }>([
    {
      $match: {
        organizationId: orgId,
        deletedAt: null,
        state: { $in: [...BURN_STATES] },
        createdAt: { $gte: start, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "UTC",
          },
        },
        total: { $sum: "$totalAmount" },
      },
    },
  ]);

  const byDay = new Map<string, number>();
  for (const row of agg) {
    byDay.set(row._id, row.total);
  }

  const amounts: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    amounts.push(byDay.get(key) ?? 0);
  }
  const max = Math.max(...amounts, 1e-6);
  return amounts.map((v) => Math.round((v / max) * 100));
}

async function memberOwedCents(userId: string, orgId: string): Promise<number> {
  const agg = await Expense.aggregate<{ total: number }>([
    {
      $match: {
        userId,
        organizationId: orgId,
        deletedAt: null,
        state: EXPENSE_STATES.APPROVED,
      },
    },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  return dollarsToCents(agg[0]?.total ?? 0);
}

async function resolveMemberStatusSummary(
  userId: string,
  orgId: string
): Promise<MemberStatusSummary> {
  const hasPending = await Expense.exists({
    userId,
    organizationId: orgId,
    deletedAt: null,
    state: {
      $in: [
        EXPENSE_STATES.PRE_APPROVAL_PENDING,
        EXPENSE_STATES.APPROVAL_PENDING,
      ],
    },
  });
  if (hasPending) {
    return "pending_review";
  }
  const hasApproved = await Expense.exists({
    userId,
    organizationId: orgId,
    deletedAt: null,
    state: EXPENSE_STATES.APPROVED,
  });
  if (hasApproved) {
    return "approved_awaiting_pay";
  }
  return "none";
}

async function userHasCreatedExpense(userId: string): Promise<boolean> {
  const doc = await Expense.exists({ userId, deletedAt: null });
  return doc != null;
}

async function receiptsWithAttachmentsThisMonth(
  userId: string,
  start: Date,
  end: Date
): Promise<number> {
  return Expense.countDocuments({
    ...visibilityMatch(userId),
    createdAt: { $gte: start, $lte: end },
    lineItems: {
      $elemMatch: {
        "attachments.0": { $exists: true },
      },
    },
  });
}

export async function getDashboardSummary(
  userId: string,
  activeMember: DashboardActiveMember,
  options: { isPaidTier: boolean }
): Promise<DashboardSummaryResponse> {
  const now = new Date();
  const { startThis, endThis } = utcMonthRange(now);
  const { isPaidTier: paidTier } = options;

  const yearStart = new Date(now);
  yearStart.setUTCFullYear(yearStart.getUTCFullYear() - 1);
  const priorYearStart = new Date(now);
  priorYearStart.setUTCFullYear(priorYearStart.getUTCFullYear() - 2);

  const [
    vaultYear,
    vaultPriorYear,
    sparklineSeries,
    analytics,
    hasCreatedExpense,
  ] = await Promise.all([
    sumPrivateVaultCents(userId, yearStart, now, "inclusive"),
    sumPrivateVaultCents(userId, priorYearStart, yearStart, "exclusive"),
    sparklinePrivateSeries(userId, now, 7),
    buildAnalytics(userId, now),
    userHasCreatedExpense(userId),
  ]);

  let trendPercent: number | null = null;
  if (vaultPriorYear > 0) {
    trendPercent = Math.round(
      ((vaultYear - vaultPriorYear) / vaultPriorYear) * 100
    );
  }
  // When the prior 12-month window was $0, UI shows "new" copy instead of a fake +100%.

  const personalVault: DashboardSummaryResponse["personalVault"] = {
    monthLabel: "This year",
    totalCents: vaultYear,
    trendPercent,
    sparklineSeries,
  };

  const emptySmartContext = (): SmartContextFlat => ({
    sessionOrgError: null,
    receiptsWithAttachmentsThisMonth: null,
    organizationId: null,
    ownerMonthBurnCents: null,
    burnByDayPercent: null,
    pendingApprovalCount: null,
    pendingPreApprovalCount: null,
    financeQueueCount: null,
    memberOwedCents: null,
    memberStatusSummary: null,
  });

  let smartContext: DashboardSummaryResponse["smartContext"];

  if (activeMember.kind === "no_active_org_in_session") {
    smartContext = {
      ...emptySmartContext(),
      ...(paidTier
        ? {
            receiptsWithAttachmentsThisMonth:
              await receiptsWithAttachmentsThisMonth(
                userId,
                startThis,
                endThis
              ),
          }
        : {}),
    };
  } else if (activeMember.kind === "session_org_error") {
    smartContext = {
      ...emptySmartContext(),
      sessionOrgError: activeMember.message,
    };
  } else {
    const activeOrganizationId = activeMember.organizationId;
    if (activeMember.role === "owner") {
      const [monthBurnCents, burnByDayPercent, counts, fq] = await Promise.all([
        orgBurnMonthCents(activeOrganizationId, startThis, endThis),
        orgBurnLast7DayPercents(activeOrganizationId, now),
        approvalCounts(userId, activeOrganizationId),
        financeQueueCount(activeOrganizationId),
      ]);
      smartContext = {
        ...emptySmartContext(),
        organizationId: activeOrganizationId,
        ownerMonthBurnCents: monthBurnCents,
        burnByDayPercent,
        pendingApprovalCount: counts.pendingPreApproval + counts.pendingFinal,
        pendingPreApprovalCount: counts.pendingPreApproval,
        financeQueueCount: fq,
      };
    } else if (activeMember.role === "admin") {
      const [counts, fq] = await Promise.all([
        approvalCounts(userId, activeOrganizationId),
        financeQueueCount(activeOrganizationId),
      ]);
      smartContext = {
        ...emptySmartContext(),
        organizationId: activeOrganizationId,
        pendingApprovalCount: counts.pendingPreApproval + counts.pendingFinal,
        pendingPreApprovalCount: counts.pendingPreApproval,
        financeQueueCount: fq,
      };
    } else {
      const [owedCents, statusSummary, counts] = await Promise.all([
        memberOwedCents(userId, activeOrganizationId),
        resolveMemberStatusSummary(userId, activeOrganizationId),
        approvalCounts(userId, activeOrganizationId),
      ]);
      smartContext = {
        ...emptySmartContext(),
        organizationId: activeOrganizationId,
        memberOwedCents: owedCents,
        memberStatusSummary: statusSummary,
        pendingApprovalCount: counts.pendingPreApproval + counts.pendingFinal,
        pendingPreApprovalCount: counts.pendingPreApproval,
      };
    }
  }

  return {
    hasCreatedExpense,
    personalVault,
    analytics,
    smartContext,
  };
}
