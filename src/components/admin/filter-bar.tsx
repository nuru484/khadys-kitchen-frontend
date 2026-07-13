"use client";

import { useState, type ReactNode } from "react";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

/**
 * Labelled dropdown — mirrors the storefront shop filters. A dropdown keeps the
 * toolbar compact and scales to any number of options without a wall of chips.
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

/**
 * Admin filter toolbar, styled like the storefront shop: a rounded search field
 * plus labelled dropdowns. On mobile/tablet everything collapses behind a
 * toggle; from lg up it's an inline toolbar — unless `collapseFilters` is set
 * (pages with four-plus filters), where the search stays inline and only the
 * filters sit behind the toggle at every width.
 */
export function FilterBar({
  search = "",
  onSearch,
  searchPlaceholder = "Search…",
  activeCount = 0,
  resultLabel,
  action,
  collapseFilters = false,
  onClear,
  children,
}: {
  search?: string;
  /** Provide to render a search field; omit for a filters-only toolbar. */
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  activeCount?: number;
  resultLabel?: string;
  /** Persistent action (e.g. a "New" button) — stays visible when collapsed. */
  action?: ReactNode;
  /** Keep the filters behind the toggle on desktop too — for toolbars with
   * four or more filters that would otherwise crowd the row. */
  collapseFilters?: boolean;
  /** Resets every filter to its default; renders "Clear filters" when any
   * filter is active. */
  onClear?: () => void;
  /** The LabeledSelect filters. */
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const hasSearch = Boolean(onSearch);

  const searchField = hasSearch ? (
    <div
      className={cn(
        "relative",
        collapseFilters
          ? "min-w-0 flex-[1_1_180px] lg:max-w-[320px]"
          : "col-span-full lg:col-span-1 lg:min-w-[180px] lg:max-w-[320px] lg:flex-[1_1_200px]",
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink/45"
      >
        ⌕
      </span>
      <input
        value={search}
        onChange={(e) => onSearch?.(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="w-full rounded-full border-[1.5px] border-ink/20 bg-transparent py-[10px] pl-10 pr-10 font-sans text-[14.5px] text-ink outline-none transition-colors focus:border-accent"
      />
      {search ? (
        <button
          type="button"
          onClick={() => onSearch?.("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full bg-ink/10 text-[11px] font-bold text-ink/55 transition-colors hover:bg-ink/20 hover:text-ink"
        >
          ✕
        </button>
      ) : null}
    </div>
  ) : null;

  const toggle = (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      aria-controls="admin-filters"
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-ink/25 px-4 py-2.5 font-sans text-[13px] font-semibold text-ink transition-colors hover:border-accent"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="h-4 w-4"
      >
        <path d="M4 6h16M7 12h10M10 18h4" />
      </svg>
      {hasSearch && !collapseFilters ? "Search & filters" : "Filters"}
      {activeCount > 0 ? (
        <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-[#FDFAF3]">
          {activeCount}
        </span>
      ) : null}
      <span
        aria-hidden="true"
        className={cn("text-[11px] transition-transform", open && "rotate-180")}
      >
        ▾
      </span>
    </button>
  );

  const clearButton =
    onClear && activeCount > 0 ? (
      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer justify-self-start whitespace-nowrap text-[13px] font-semibold text-accent transition-colors hover:text-ink"
      >
        Clear filters
      </button>
    ) : null;

  const panelGrid =
    "grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]";

  if (collapseFilters) {
    // Search stays inline at every width; only the filters live behind the
    // toggle, so a five-filter toolbar never crowds the row. On phones the
    // persistent action gets its own full-width row (with the result count
    // opposite) instead of floating awkwardly beside wrapped controls.
    return (
      <div className="mb-[18px]">
        <div className="flex flex-wrap items-center gap-3">
          {searchField}
          {toggle}
          {!open ? clearButton : null}
          {action || resultLabel ? (
            <div className="flex w-full items-center justify-end gap-3 sm:ml-auto sm:w-auto">
              {resultLabel ? (
                <span className="mr-auto whitespace-nowrap text-[13px] text-ink/55 sm:mr-0">
                  {resultLabel}
                </span>
              ) : null}
              {action}
            </div>
          ) : null}
        </div>
        <div id="admin-filters" className={cn("mt-3", open ? panelGrid : "hidden")}>
          {children}
          <div className="col-span-full flex items-center">{clearButton}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-[18px]">
      {/* Mobile / tablet: collapse the toolbar behind a toggle. A persistent
          action wraps onto its own full-width row on very narrow screens
          (e.g. a Galaxy Fold) instead of squeezing the button text. */}
      <div className="flex flex-wrap items-center gap-3 lg:hidden">
        <div className="mr-auto flex items-center gap-3">
          {toggle}
          {!open ? clearButton : null}
        </div>
        {action ??
          (resultLabel ? (
            <span className="whitespace-nowrap text-[13px] text-ink/55">
              {resultLabel}
            </span>
          ) : null)}
      </div>

      {/* Controls: stacked column on mobile (revealed by the toggle), inline
          toolbar from lg up. */}
      <div
        id="admin-filters"
        className={cn(
          "mt-3 gap-3 lg:mt-0",
          // Phones: two columns. Tablets: auto-fit tracks, so up to four
          // compact filters share a row and wrap only when they'd overflow.
          open
            ? "grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]"
            : "hidden",
          "lg:flex lg:flex-wrap lg:items-end lg:gap-2.5",
        )}
      >
        {searchField}

        {children}

        {clearButton ? (
          <div className="col-span-full flex items-center lg:col-span-1 lg:self-center">
            {clearButton}
          </div>
        ) : null}

        <div className="col-span-2 hidden items-center justify-end gap-3 lg:ml-auto lg:flex">
          {resultLabel ? (
            <span className="whitespace-nowrap text-[13px] text-ink/55">
              {resultLabel}
            </span>
          ) : null}
          {action}
        </div>
      </div>
    </div>
  );
}

/**
 * From/To created-date window, sent to the API as YYYY-MM-DD (native date
 * inputs). Same labelled styling as the dropdowns; either side may be empty.
 */
export function DateRangeFields({
  from,
  to,
  onFrom,
  onTo,
}: {
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
}) {
  const cls =
    "w-full min-w-0 rounded-[12px] border-[1.5px] bg-cream px-3 py-[8px] font-sans text-[13.5px] normal-case tracking-normal text-ink outline-none transition-colors focus:border-accent";
  // `contents` dissolves the wrapper: From/To become direct grid/flex items of
  // the toolbar, so they flow with the other filters.
  return (
    <div className="contents">
      <label className="grid gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/55">
        From
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(e) => onFrom(e.target.value)}
          className={cn(cls, from ? "border-accent/60" : "border-ink/20")}
        />
      </label>
      <label className="grid gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/55">
        To
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(e) => onTo(e.target.value)}
          className={cn(cls, to ? "border-accent/60" : "border-ink/20")}
        />
      </label>
    </div>
  );
}
