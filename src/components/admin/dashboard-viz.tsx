import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/admin/ui";
import { formatMoney } from "@/lib/format-money";
import { rangeNoun, type StatsRange } from "@/types/stats.types";

/** Short weekday label ("Mon") from an ISO yyyy-mm-dd day key. */
const weekdayLabel = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GH", {
    weekday: "short",
    timeZone: "UTC",
  });

/** Short month label ("Jan") from a yyyy-mm key. */
const monthLabel = (ym: string): string =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-GH", {
    month: "short",
    timeZone: "UTC",
  });

/** Day-of-month ("5") from an ISO yyyy-mm-dd key. */
const dayOfMonthLabel = (iso: string): string => String(Number(iso.slice(8, 10)));

/** Compact hour ("6am") from an "HH:00" key. */
const hourLabel = (hh: string): string => {
  const h = Number(hh.slice(0, 2));
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${String(twelve)}${h < 12 ? "am" : "pm"}`;
};

/** Human label for a bucket, used in the aria summary and (sparsely) as ticks. */
const bucketLabel = (range: StatsRange, label: string): string => {
  switch (range) {
    case "today":
      return hourLabel(label);
    case "month":
      return dayOfMonthLabel(label);
    case "year":
      return monthLabel(label);
    case "all":
      return label;
    case "week":
    default:
      return weekdayLabel(label);
  }
};

/** Dense ranges only label some buckets so the axis stays legible. */
const showTick = (range: StatsRange, idx: number, len: number): boolean => {
  if (range === "month") return idx % 5 === 0 || idx === len - 1;
  if (range === "today") return idx % 4 === 0;
  return true;
};

/**
 * Vertical CSS bar chart of receipts (pesewas) for the selected range —
 * hours for today, days for week/month, months for year, years for all time.
 * The peak bucket renders in accent. Handles 7–30+ bars: dense series drop
 * the per-bar value labels and tighten the gaps so nothing overlaps.
 */
export function RevenueChart({
  series,
  range,
}: {
  series: { label: string; total: number }[];
  range: StatsRange;
}) {
  const total = series.reduce((sum, d) => sum + d.total, 0);
  const max = Math.max(...series.map((d) => d.total), 1);
  const peak =
    series.length > 0
      ? series.reduce((hi, d) => (d.total > hi.total ? d : hi), series[0])
      : null;
  const dense = series.length > 12;
  const summary = `Money received ${rangeNoun(range)}, total ${formatMoney(total)}.${
    peak && peak.total > 0
      ? ` Best: ${bucketLabel(range, peak.label)} at ${formatMoney(peak.total)}.`
      : ""
  }`;

  return (
    <Card className="p-[clamp(18px,2.8vw,24px)]">
      {/* flex-wrap: on narrow phones the total drops onto its own line instead
          of squeezing the title into a broken three-line wrap. */}
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h3 className="whitespace-nowrap font-serif text-[19px] font-normal">
          Received · {rangeNoun(range)}
        </h3>
        <span className="whitespace-nowrap font-serif text-[18px]">
          {formatMoney(total)}
        </span>
      </div>
      <div
        role="img"
        aria-label={summary}
        className={cn("flex h-[168px] items-end", dense ? "gap-[3px]" : "gap-2.5")}
      >
        {series.map((d, i) => (
          <div
            key={d.label}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
          >
            {!dense ? (
              <span aria-hidden className="text-[11.5px] font-semibold text-ink/55">
                {d.total >= 100_000
                  ? `${(d.total / 100_000).toFixed(1)}k`
                  : Math.round(d.total / 100)}
              </span>
            ) : null}
            <div
              className={cn(
                "w-full max-w-[38px]",
                dense ? "rounded-t-[3px]" : "rounded-t-lg rounded-b-[3px]",
                d === peak && d.total > 0 ? "bg-accent" : "bg-ink/[0.18]",
              )}
              style={{
                height: `${String(Math.max(dense ? 3 : 8, Math.round((d.total / max) * 128)))}px`,
              }}
            />
            <span
              aria-hidden
              className={cn(
                "h-[15px] text-[11px] uppercase tracking-[0.04em] text-ink/50",
                dense && "text-[10.5px] tracking-normal",
              )}
            >
              {showTick(range, i, series.length) ? bucketLabel(range, d.label) : ""}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Horizontal meters ranking the selected range's best-selling items by quantity. */
export function BestSellersMeters({
  data,
  range,
}: {
  data: { name: string; productId: string | null; quantity: number }[];
  range: StatsRange;
}) {
  const max = Math.max(...data.map((d) => d.quantity), 1);

  return (
    <Card className="p-[clamp(18px,2.8vw,24px)]">
      <h3 className="mb-5 font-serif text-[19px] font-normal">
        Best sellers · {rangeNoun(range)}
      </h3>
      {data.length === 0 ? (
        <p className="text-[14px] text-ink/50">No shop sales in this period.</p>
      ) : (
        <div className="grid gap-4">
          {data.map((b) => (
            <div key={b.name} className="grid gap-[7px]">
              <div className="flex justify-between gap-3 text-[13.5px]">
                {b.productId ? (
                  <Link
                    href={`/admin/items/${b.productId}`}
                    className="min-w-0 truncate font-semibold text-ink no-underline hover:text-accent"
                  >
                    {b.name}
                  </Link>
                ) : (
                  <span className="min-w-0 truncate font-semibold">{b.name}</span>
                )}
                <span className="whitespace-nowrap text-ink/55">
                  {b.quantity} sold
                </span>
              </div>
              <div
                role="meter"
                aria-label={`${b.name} sales`}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={b.quantity}
                aria-valuetext={`${String(b.quantity)} sold`}
                className="h-2 overflow-hidden rounded-full bg-ink/[0.08]"
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${String(Math.round((b.quantity / max) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
