import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Pill } from "@/lib/status-colors";

/** Small status chip rendered with the computed pill palette. */
export function StatusPill({
  pill,
  children,
  className,
}: {
  pill: Pill;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-3 py-[5px] text-[11.5px] font-semibold uppercase tracking-[0.06em]",
        className,
      )}
      style={{ background: pill.bg, color: pill.color }}
    >
      {children}
    </span>
  );
}

/** Pill-style toggle switch (settings + security). */
export function ToggleSwitch({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="relative h-[31px] w-[54px] flex-none cursor-pointer rounded-full border-none transition-colors"
      style={{ background: on ? "var(--color-accent)" : "rgba(36,26,18,0.25)" }}
    >
      <span
        className="absolute top-[3.5px] h-6 w-6 rounded-full bg-[#FDFAF3] transition-[left] duration-[250ms] ease"
        style={{ left: on ? "26px" : "3.5px" }}
      />
    </button>
  );
}

/** Rounded search field with a leading glyph. */
export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative max-w-[380px] flex-[1_1_220px]">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink/45">
        ⌕
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border-[1.5px] border-ink/20 bg-transparent py-3 pl-10 pr-4 font-sans text-[14.5px] text-ink outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}

/** Prev / numbered-pages (desktop) or Page x of y (mobile) pagination. */
export function Pager({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (n: number) => void;
}) {
  if (pageCount <= 1) return null;
  const arrow =
    "grid h-[42px] w-[42px] place-items-center rounded-full border-[1.5px] border-ink/25 bg-transparent text-[16px] text-ink transition-colors enabled:cursor-pointer enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-35";

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPage(Math.max(1, page - 1))}
        className={arrow}
      >
        ←
      </button>

      <div className="hidden gap-2 min-[1000px]:flex">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => {
          const on = n === page;
          return (
            <button
              key={n}
              type="button"
              aria-current={on ? "page" : undefined}
              onClick={() => onPage(n)}
              className={cn(
                "grid h-[42px] w-[42px] cursor-pointer place-items-center rounded-full border-[1.5px] text-[14px] font-semibold",
                on
                  ? "border-accent bg-accent text-[#FDFAF3]"
                  : "border-ink/25 bg-transparent text-ink",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      <span className="px-3 text-[13.5px] font-semibold tracking-[0.06em] text-ink/70 min-[1000px]:hidden">
        Page {page} of {pageCount}
      </span>

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPage(Math.min(pageCount, page + 1))}
        className={arrow}
      >
        →
      </button>
    </div>
  );
}

/** KPI stat tile: uppercase label, serif value, optional accent sub-note. */
export function StatTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="min-w-0 rounded-[18px] border border-ink/10 bg-card px-[22px] py-5">
      <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/50">
        {label}
      </div>
      <div className="mt-2 font-serif text-[clamp(24px,2.6vw,30px)]">{value}</div>
      {note ? (
        <div className="mt-1 text-[12.5px] font-semibold text-accent">{note}</div>
      ) : null}
    </div>
  );
}

/** Standard raised admin card. */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // min-w-0: a card's intrinsic content (e.g. a dense chart) must never
        // widen the grids it sits in — grid items default to min-width:auto.
        "min-w-0 rounded-[18px] border border-ink/10 bg-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
