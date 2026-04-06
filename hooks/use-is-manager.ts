"use client";

import { useSession } from "@/lib/auth-client";
import { useActiveMember } from "@/hooks/use-active-member";

/**
 * True when the active org member is admin or owner (same data as sidebar manager section).
 * Uses {@link useActiveMember} so we do not issue a second getActiveMember request.
 */
export function useIsManager() {
  const { data: session } = useSession();
  const activeMemberQuery = useActiveMember();

  const isManager =
    activeMemberQuery.data != null &&
    (activeMemberQuery.data.role === "admin" ||
      activeMemberQuery.data.role === "owner");

  return {
    ...activeMemberQuery,
    data:
      session?.user?.id === undefined
        ? undefined
        : activeMemberQuery.isPending
          ? undefined
          : isManager,
  };
}
