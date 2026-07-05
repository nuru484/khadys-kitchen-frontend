import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextField } from "@/components/ui/TextField";

describe("TextField", () => {
  it("associates the label with the input", () => {
    render(<TextField label="Phone" defaultValue="024" />);
    expect(screen.getByLabelText("Phone")).toHaveValue("024");
  });

  it("marks the field invalid and shows the error message", () => {
    render(<TextField label="Phone" error="Enter a full number" defaultValue="024" />);
    const input = screen.getByLabelText("Phone");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Enter a full number")).toBeInTheDocument();
  });

  it("shows a hint when there is no error", () => {
    render(<TextField label="Phone" hint="We'll only WhatsApp you" />);
    expect(screen.getByText("We'll only WhatsApp you")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).not.toHaveAttribute("aria-invalid");
  });
});
