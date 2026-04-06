import { z } from "zod";

const daySchema = z.object({
  label: z.string(),
  amountCents: z.number().int().nonnegative(),
  isToday: z.boolean(),
});

const categorySchema = z.object({
  name: z.string(),
  amountCents: z.number().int().nonnegative(),
  percentOfTotal: z.number().min(0).max(100),
});

export const memberStatusSummarySchema = z.enum([
  "none",
  "pending_review",
  "approved_awaiting_pay",
]);

export type MemberStatusSummary = z.infer<typeof memberStatusSummarySchema>;

/**
 * Flat metrics for the secondary dashboard card. The server only populates
 * fields the current user is allowed to see; the client chooses presentation
 * using org + subscription hooks (no variant enum).
 */
export const smartContextFlatSchema = z.object({
  sessionOrgError: z.string().nullable(),
  receiptsWithAttachmentsThisMonth: z.number().int().nonnegative().nullable(),
  organizationId: z.string().nullable(),
  ownerMonthBurnCents: z.number().int().nonnegative().nullable(),
  burnByDayPercent: z.array(z.number().min(0).max(100)).length(7).nullable(),
  pendingApprovalCount: z.number().int().nonnegative().nullable(),
  pendingPreApprovalCount: z.number().int().nonnegative().nullable(),
  financeQueueCount: z.number().int().nonnegative().nullable(),
  memberOwedCents: z.number().int().nonnegative().nullable(),
  memberStatusSummary: memberStatusSummarySchema.nullable(),
});

export type SmartContextFlat = z.infer<typeof smartContextFlatSchema>;

export const dashboardSummaryResponseSchema = z.object({
  /** True if the user has at least one non-deleted expense they created (any state). */
  hasCreatedExpense: z.boolean(),
  personalVault: z.object({
    /** Vault period label (trailing 12 months), e.g. UTC range "Apr 5, '25–Apr 5, '26". */
    monthLabel: z.string(),
    totalCents: z.number().int().nonnegative(),
    trendPercent: z.number().nullable(),
    sparklineSeries: z.array(z.number()).max(14),
  }),
  analytics: z.object({
    days: z.array(daySchema).length(7),
    topCategories: z.array(categorySchema).max(5),
  }),
  smartContext: smartContextFlatSchema,
});

export type DashboardSummaryResponse = z.infer<
  typeof dashboardSummaryResponseSchema
>;
