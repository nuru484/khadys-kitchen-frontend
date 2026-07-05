import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders its children and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Place order</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Place order" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows a spinner, disables, and blocks clicks while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button isLoading loadingText="Placing…" onClick={onClick}>
        Place order
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Placing…")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("respects the disabled prop", () => {
    render(<Button disabled>Place order</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("defaults to type=button", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
