import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

const baseProps = {
  title: "Remove item?",
  description: "This cannot be undone.",
  onConfirm: () => {},
  onOpenChange: () => {},
};

describe("ConfirmationDialog", () => {
  it("renders nothing when closed", () => {
    render(<ConfirmationDialog {...baseProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows title and description when open", () => {
    render(<ConfirmationDialog {...baseProps} open />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Remove item?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("confirms and closes on confirm", async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmationDialog {...baseProps} open onConfirm={onConfirm} onOpenChange={onOpenChange} confirmText="Remove" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes without confirming on cancel", async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmationDialog {...baseProps} open onConfirm={onConfirm} onOpenChange={onOpenChange} cancelText="Keep it" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("gates confirm behind an exact-match phrase", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmationDialog {...baseProps} open onConfirm={onConfirm} confirmText="Delete" requireExactMatch="DELETE" />,
    );
    const confirm = screen.getByRole("button", { name: "Delete" });
    expect(confirm).toBeDisabled();

    await userEvent.type(screen.getByRole("textbox"), "DELETE");
    expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
