/**
 * Better Auth and Mongo may expose organizationId as a string, ObjectId, or
 * extended JSON shape. Expense documents store organizationId as a string;
 * normalize before querying or comparing.
 */
export function toOrganizationIdString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "string") {
    const t = value.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof value === "object" && value !== null) {
    const withOid = value as { $oid?: unknown };
    if (typeof withOid.$oid === "string") {
      const t = withOid.$oid.trim();
      return t.length > 0 ? t : null;
    }
    const withHex = value as { toHexString?: () => string };
    if (typeof withHex.toHexString === "function") {
      return withHex.toHexString();
    }
  }
  const s = String(value).trim();
  if (s.length === 24 && /^[a-f0-9]+$/i.test(s)) {
    return s;
  }
  return null;
}
