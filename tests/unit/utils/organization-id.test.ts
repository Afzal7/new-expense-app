import { ObjectId } from "mongodb";
import { describe, expect, it } from "vitest";
import { toOrganizationIdString } from "@/lib/utils/organization-id";

describe("toOrganizationIdString", () => {
  it("returns trimmed string ids", () => {
    expect(toOrganizationIdString(" 694889425049eeb589c811c5 ")).toBe(
      "694889425049eeb589c811c5"
    );
  });

  it("stringifies ObjectId", () => {
    const id = new ObjectId("694889425049eeb589c811c5");
    expect(toOrganizationIdString(id)).toBe("694889425049eeb589c811c5");
  });

  it("reads extended JSON $oid", () => {
    expect(
      toOrganizationIdString({ $oid: "694889425049eeb589c811c5" })
    ).toBe("694889425049eeb589c811c5");
  });

  it("returns null for empty", () => {
    expect(toOrganizationIdString("")).toBeNull();
    expect(toOrganizationIdString(null)).toBeNull();
  });
});
