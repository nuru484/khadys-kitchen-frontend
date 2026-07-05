import { describe, it, expect } from "vitest";
import { getStatusColor } from "@/lib/status-colors";
import { appStatusPill, orderPill } from "@/lib/admin/data";

describe("getStatusColor", () => {
  it("is case-insensitive", () => {
    expect(getStatusColor("approved")).toEqual(getStatusColor("APPROVED"));
    expect(getStatusColor("Ready")).toEqual(getStatusColor("READY"));
  });

  it("returns distinct colors for distinct statuses", () => {
    expect(getStatusColor("Approved").color).toBe("#2E6B3F");
    expect(getStatusColor("Rejected").color).toBe("#A32036");
    expect(getStatusColor("Collected").color).toBe("rgba(36,26,18,0.55)");
  });

  it("falls back to the brand color for unknown statuses", () => {
    expect(getStatusColor("nonsense").color).toBe("#C2185B");
  });

  it("is the single source of truth for the admin pill helpers", () => {
    expect(appStatusPill("Approved")).toEqual(getStatusColor("Approved"));
    expect(orderPill("Confirmed")).toEqual(getStatusColor("Confirmed"));
  });
});
