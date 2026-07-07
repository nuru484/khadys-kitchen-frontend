"use client";

import { Card } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

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
            <td key={c} className="px-4 py-4 first:px-6 last:px-6">
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

/** Whole-card placeholder for non-tabular loading areas (detail cards, etc.). */
export function TableSkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-ink/[0.08] px-6 py-4"
        >
          <div className="h-9 flex-[2_1_180px] animate-pulse rounded bg-ink/[0.06]" />
          <div className="h-4 flex-[1_1_120px] animate-pulse rounded bg-ink/[0.06]" />
          <div className="h-5 basis-24 animate-pulse rounded-full bg-ink/[0.06]" />
        </div>
      ))}
    </Card>
  );
}
