"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatDate, formatTime } from "@/lib/format-date";

/**
 * Pulsing placeholder rows for a loading table, designed to sit INSIDE the
 * real `<tbody>` — the toolbar and the actual column headers stay visible and
 * only the data area shimmers. `widths` are Tailwind width classes, one per
 * column (their count defines the column count).
 */
export function SkeletonCells({
  rows = 6,
  widths,
}: {
  rows?: number;
  widths: string[];
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-ink/[0.08] last:border-0">
          {widths.map((w, c) => (
            <td key={c} className="px-4 py-3 first:px-6 last:px-6">
              <div
                className={cn(
                  "animate-pulse rounded bg-ink/[0.06]",
                  c === 0 ? "h-6" : "h-4",
                  w,
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * The mobile half of a list page. Data tables hide their columns behind a
 * horizontal scroll on phones, so below `md` every list renders as a stack of
 * row cards instead — same data, thumb-sized targets, nothing cut off. Pair
 * with `hidden md:block` on the table's scroll wrapper.
 */
export function RowCardList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul role="list" className={cn("md:hidden", className)}>
      {children}
    </ul>
  );
}

/**
 * One row of a RowCardList. `onOpen` makes the whole card tappable (mirroring
 * the table row's click-to-open); `action` pins an ActionMenu (or any control)
 * to the top-right corner, above the tap target, so the menu never triggers
 * navigation.
 */
export function RowCard({
  onOpen,
  action,
  className,
  children,
}: {
  onOpen?: () => void;
  /** Control pinned top-right (typically an ActionMenu). */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <li
      onClick={onOpen}
      className={cn(
        "relative border-b border-ink/[0.08] px-4 py-4 transition-colors last:border-0",
        onOpen && "cursor-pointer active:bg-accent/[0.06]",
        action && "pr-[52px]",
        className,
      )}
    >
      {children}
      {action ? (
        <div className="absolute right-3 top-3.5">{action}</div>
      ) : null}
    </li>
  );
}

/**
 * A small labelled value inside a RowCard — the card equivalent of a table
 * column: uppercase micro-label over the value, laid out in a 2-up grid.
 */
export function RowCardKV({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink/45">
        {label}
      </div>
      <div className="mt-0.5 truncate text-[13.5px] text-ink/80">{children}</div>
    </div>
  );
}

/** Pulsing placeholder cards — the RowCardList counterpart of SkeletonCells. */
export function SkeletonRowCards({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <li key={r} className="border-b border-ink/[0.08] px-4 py-4 last:border-0">
          <div className="animate-pulse space-y-2.5">
            <div className="h-5 w-2/3 rounded bg-ink/[0.06]" />
            <div className="h-3.5 w-1/2 rounded bg-ink/[0.06]" />
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-ink/[0.06]" />
              <div className="h-6 w-20 rounded-full bg-ink/[0.06]" />
            </div>
          </div>
        </li>
      ))}
    </>
  );
}

/**
 * A timestamp in a data table: the date on one line with the time as small
 * muted text beneath — keeps rows narrow instead of one long date-time string.
 */
export function DateTimeCell({ iso }: { iso: string | null | undefined }) {
  if (!iso) return <>—</>;
  return (
    <div className="whitespace-nowrap leading-tight">
      <div>{formatDate(iso)}</div>
      <div className="mt-0.5 text-[11.5px] text-ink/45">{formatTime(iso)}</div>
    </div>
  );
}
