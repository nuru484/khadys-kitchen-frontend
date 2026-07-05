import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getStatusColor } from "@/lib/status-colors";

describe("StatusBadge", () => {
  it("defaults its label to the status", () => {
    render(<StatusBadge status="Approved" />);
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("uses a custom label when provided", () => {
    render(<StatusBadge status="Ready" label="Ready for pickup" />);
    expect(screen.getByText("Ready for pickup")).toBeInTheDocument();
  });

  it("applies the mapped color", () => {
    render(<StatusBadge status="Rejected" />);
    const el = screen.getByText("Rejected");
    expect(el).toHaveStyle({ color: getStatusColor("Rejected").color });
  });
});
