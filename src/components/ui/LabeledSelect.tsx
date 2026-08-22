import type { ReactNode } from "react";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

/**
 * Compact labelled dropdown built on the shared `Select`. A dropdown keeps a
 * filter toolbar small and scales to any number of options (e.g. a long
 * category list) without a wall of chips.
 *
 * Shared across the storefront shop browser and trainings catalogue. The admin
 * `filter-bar.tsx` carries its own copy; folding it into this one would leave a
 * single source of truth.
 */
export function LabeledSelect({
  label,
  value,
  active,
  onChange,
  className,
  children,
}: {
  label: string;
  value: string;
  active: boolean;
  onChange: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "grid gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/55",
        className,
      )}
    >
      {label}
      <Select
        value={value}
        active={active}
        onChange={(e) => onChange(e.target.value)}
        className="py-[9px] text-[14px] normal-case tracking-normal"
      >
        {children}
      </Select>
    </label>
  );
}
