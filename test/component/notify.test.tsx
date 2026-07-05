import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import { CustomToaster } from "@/components/ui/CustomToaster";
import { notify } from "@/lib/notify";

describe("notify", () => {
  // react-hot-toast's store is module-level, so clear it between tests.
  beforeEach(() => toast.remove());

  it("renders a toast with title and description", async () => {
    render(<CustomToaster />);
    act(() => {
      notify.success("Added to your order", { description: "Butter Croissant ×2" });
    });
    expect(await screen.findByText("Added to your order")).toBeInTheDocument();
    expect(screen.getByText("Butter Croissant ×2")).toBeInTheDocument();
  });

  it("dismisses via the close button", async () => {
    render(<CustomToaster />);
    act(() => {
      notify.error("Couldn't place the order");
    });
    await screen.findByText("Couldn't place the order");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    await waitFor(
      () => expect(screen.queryByText("Couldn't place the order")).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});
