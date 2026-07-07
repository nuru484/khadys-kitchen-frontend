"use client";

import { Button, type ButtonProps } from "@/components/ui/Button";
import { ActionMenu, type ActionItem } from "@/components/admin/action-menu";

export interface PageAction {
  label: string;
  onClick: () => void;
  /** Button look on wide screens; danger also colours the menu item. */
  variant?: ButtonProps["variant"];
  isLoading?: boolean;
  /** Stays a visible button on small screens (default: only the first). */
  primary?: boolean;
  disabled?: boolean;
}

/**
 * A detail page's action cluster, responsive by design: every action is a
 * button on md+ screens; on smaller screens only the primary action(s) stay
 * visible and the rest collapse into a "More" menu, so five actions never
 * wrap into a cluttered stack on a phone.
 */
export function PageActions({ actions }: { actions: PageAction[] }) {
  if (actions.length === 0) return null;

  const primaries = actions.filter((a, i) => a.primary ?? i === 0);
  const rest = actions.filter((a) => !primaries.includes(a));

  const asButton = (a: PageAction) => (
    <Button
      key={a.label}
      size="sm"
      variant={a.variant ?? "outline"}
      isLoading={a.isLoading}
      disabled={a.disabled}
      onClick={a.onClick}
    >
      {a.label}
    </Button>
  );

  const asMenuItem = (a: PageAction): ActionItem => ({
    label: a.label,
    onClick: a.onClick,
    variant: a.variant === "danger" ? "danger" : "default",
    disabled: a.disabled,
  });

  return (
    <>
      {/* Wide screens: the full row of buttons. */}
      <div className="hidden flex-wrap items-center gap-2.5 md:flex">
        {actions.map(asButton)}
      </div>
      {/* Small screens: primary action(s) + everything else behind "More". */}
      <div className="flex flex-wrap items-center gap-2.5 md:hidden">
        {primaries.map(asButton)}
        {rest.length > 0 ? (
          <ActionMenu label="More" items={rest.map(asMenuItem)} />
        ) : null}
      </div>
    </>
  );
}
