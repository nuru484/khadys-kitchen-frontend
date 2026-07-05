import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(<EmptyState title="Nothing here yet." description="Pick something." />);
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();
    expect(screen.getByText("Pick something.")).toBeInTheDocument();
  });

  it("fires the action's onClick", async () => {
    const onClick = vi.fn();
    render(<EmptyState title="Empty" action={{ label: "Do it", onClick }} />);
    await userEvent.click(screen.getByRole("button", { name: "Do it" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a link when the action has an href", () => {
    render(<EmptyState title="Empty" action={{ label: "Browse", href: "/shop" }} />);
    expect(screen.getByRole("link", { name: "Browse" })).toHaveAttribute("href", "/shop");
  });

  it("omits the action element when no action is given", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
