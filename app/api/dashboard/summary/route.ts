import { auth } from "@/lib/auth";
import { connectMongoose } from "@/lib/db";
import { createErrorResponse, UnauthorizedError } from "@/lib/errors";
import { checkRateLimit, apiRateLimiter } from "@/lib/rate-limiter";
import {
  getDashboardSummary,
  type DashboardActiveMember,
} from "@/lib/server/get-dashboard-summary";
import { toOrganizationIdString } from "@/lib/utils/organization-id";
import { dashboardSummaryResponseSchema } from "@/lib/validations/dashboard-summary";
import { APIError } from "better-auth/api";
import { NextRequest } from "next/server";

const SESSION_ORG_MISMATCH =
  "Your session lists an organization, but membership was not found. Try signing out and back in.";

async function activeMemberForDashboard(
  headers: Headers,
  sessionActiveOrganizationId: string | null
): Promise<DashboardActiveMember> {
  try {
    const member = await auth.api.getActiveMember({ headers });
    if (!member || typeof member.role !== "string") {
      return { kind: "no_active_org_in_session" };
    }
    const organizationId = toOrganizationIdString(member.organizationId);
    if (!organizationId) {
      return { kind: "no_active_org_in_session" };
    }

    const sessionOrg = sessionActiveOrganizationId?.trim() ?? null;
    if (sessionOrg != null && sessionOrg !== organizationId) {
      return { kind: "session_org_error", message: SESSION_ORG_MISMATCH };
    }

    return {
      kind: "ok",
      role: member.role,
      organizationId,
    };
  } catch (error) {
    if (error instanceof APIError) {
      const msg = error.message ?? "";
      if (
        msg.includes("Member not found") ||
        msg.includes("MEMBER_NOT_FOUND")
      ) {
        return { kind: "session_org_error", message: SESSION_ORG_MISMATCH };
      }
      if (
        msg.includes("No active organization") ||
        msg.includes("NO_ACTIVE_ORGANIZATION")
      ) {
        return { kind: "no_active_org_in_session" };
      }
    }
    throw error;
  }
}

/**
 * Active org for aggregations must match Better Auth (nested `session` first;
 * some adapters may surface the field on the root session payload).
 */
function readActiveOrganizationIdFromAuthSession(
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
): string | null {
  const nested = session.session as
    | { activeOrganizationId?: unknown }
    | undefined;
  const fromNested = toOrganizationIdString(nested?.activeOrganizationId);
  if (fromNested) {
    return fromNested;
  }
  const root = session as { activeOrganizationId?: unknown };
  return toOrganizationIdString(root.activeOrganizationId);
}

/**
 * GET /api/dashboard/summary
 * Session-scoped dashboard aggregates (vault, analytics, smart context).
 * Active org id comes from the session only — never from query params.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return createErrorResponse(new UnauthorizedError());
    }

    const rateKey = `dashboard-summary:${session.user.id}`;
    const rate = checkRateLimit(apiRateLimiter, rateKey);
    if (!rate.allowed) {
      return Response.json(
        {
          error: {
            message: "Too many requests",
            code: "RATE_LIMITED",
          },
        },
        { status: 429, headers: rate.headers }
      );
    }

    await connectMongoose();

    const activeOrganizationId =
      readActiveOrganizationIdFromAuthSession(session);

    const [activeMember, activeSubscriptions] = await Promise.all([
      activeMemberForDashboard(request.headers, activeOrganizationId),
      auth.api.listActiveSubscriptions({ headers: request.headers }),
    ]);

    const isPaidTier = activeSubscriptions.length > 0;

    const body = await getDashboardSummary(session.user.id, activeMember, {
      isPaidTier,
    });
    const validated = dashboardSummaryResponseSchema.parse(body);

    return Response.json(validated, { headers: rate.headers });
  } catch (error) {
    console.error("[API] GET /api/dashboard/summary error:", error);
    return createErrorResponse(error);
  }
}
