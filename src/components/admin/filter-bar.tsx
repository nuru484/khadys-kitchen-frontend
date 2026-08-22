"use client";

import { Fragment, useState, type ReactNode } from "react";
import { DateInput } from "@/components/ui/DateInput";
import { X } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// One source of truth for the labelled dropdown - re-exported here so the
// admin pages keep their import path.
export { LabeledSelect } from "@/components/ui/LabeledSelect";

/** Shared pill styling for the Filters / Actions disclosure toggles. */
function TogglePill({
  open,
  onToggle,
  controls,
  badge,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  controls: string;
  badge?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-ink/25 px-4 py-2.5 font-sans text-[13px] font-semibold text-ink transition-colors hover:border-accent"
    >
      {children}
      {badge ? (
        <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-card">
          {badge}
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
}

/**
 * Admin filter toolbar, mobile-first:
 *
 * - Phones/tablets (below lg): the search field is always visible and spans the
 *   full width; beneath it the Filters toggle sits on the left with the result
 *   count and action button(s) on the right. More than two actions collapse
 *   behind an "Actions" toggle that expands a stacked panel, just like the
 *   filters do. The filters themselves always live behind the Filters toggle.
 * - Desktop (lg up): the search sits inline; filters are inline too, unless
 *   `collapseFilters` keeps them behind the toggle (pages with four-plus
 *   filters). Actions render as a plain button row on the right.
 */
export function FilterBar({
  search = "",
  onSearch,
  searchPlaceholder = "Search…",
  activeCount = 0,
  resultLabel,
  action,
  actions,
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
  /** Single persistent action (e.g. a "New" button). */
  action?: ReactNode;
  /** Several persistent actions - more than two collapse behind an "Actions"
   * toggle on phones. Wins over `action` when both are given. */
  actions?: ReactNode[];
  /** Keep the filters behind the toggle on desktop too - for toolbars with
   * four or more filters that would otherwise crowd the row. */
  collapseFilters?: boolean;
  /** Resets every filter to its default; renders "Clear filters" when any
   * filter is active. */
  onClear?: () => void;
  /** The LabeledSelect filters. */
  children?: ReactNode;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const hasSearch = Boolean(onSearch);
  const actionItems = actions ?? (action !== undefined && action !== null ? [action] : []);
  const collapseActions = actionItems.length > 2;

  const searchField = hasSearch ? (
    <div className="relative w-full lg:w-auto lg:min-w-[180px] lg:max-w-[320px] lg:flex-[1_1_200px]">
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
          <X className="h-[11px] w-[11px]" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  ) : null;

  const filtersToggle = (
    <TogglePill
      open={filtersOpen}
      onToggle={() => setFiltersOpen((o) => !o)}
      controls="admin-filters"
      badge={activeCount}
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
      Filters
    </TogglePill>
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

  const resultText = resultLabel ? (
    <span className="whitespace-nowrap text-[13px] text-ink/55">
      {resultLabel}
    </span>
  ) : null;

  return (
    <div className="mb-[18px]">
      <div className="flex flex-wrap items-center gap-3 lg:items-end">
        {/* Row 1 on phones: the search, full width, always visible. */}
        {searchField}

        {/* Row 2 on phones: Filters toggle left; count + actions right. When
            the right side doesn't fit it wraps onto its own right-aligned
            line instead of squeezing. */}
        <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 lg:hidden">
          <div className="flex items-center gap-3">
            {filtersToggle}
            {!filtersOpen ? clearButton : null}
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
            {resultText}
            {collapseActions ? (
              <TogglePill
                open={actionsOpen}
                onToggle={() => setActionsOpen((o) => !o)}
                controls="admin-actions"
              >
                Actions
              </TogglePill>
            ) : (
              actionItems.map((a, i) => <Fragment key={i}>{a}</Fragment>)
            )}
          </div>
        </div>

        {/* Desktop: Filters toggle only in collapse mode (otherwise the
            filters render inline), then count + the full action row. */}
        <div className="hidden lg:flex lg:items-center lg:gap-3">
          {collapseFilters ? filtersToggle : null}
          {!collapseFilters || !filtersOpen ? clearButton : null}
        </div>
        <div className="hidden lg:ml-auto lg:flex lg:items-center lg:gap-2.5 lg:self-center">
          {resultText}
          {actionItems.map((a, i) => (
            <Fragment key={i}>{a}</Fragment>
          ))}
        </div>

        {/* Collapsed actions panel (phones): the buttons stack full-width,
            revealed like the filters. */}
        {collapseActions ? (
          <div
            id="admin-actions"
            className={cn(
              "order-[98] w-full gap-2.5 lg:hidden [&>*]:w-full",
              actionsOpen ? "grid" : "hidden",
            )}
          >
            {actionItems.map((a, i) => (
              <Fragment key={i}>{a}</Fragment>
            ))}
          </div>
        ) : null}

        {/* The filters. Phones: a 2-col panel behind the toggle. Desktop:
            inline in the toolbar row (`lg:contents`) - or the same panel
            behind the toggle when `collapseFilters` is set. */}
        <div
          id="admin-filters"
          className={cn(
            "order-last w-full",
            filtersOpen
              ? "grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]"
              : "hidden",
            !collapseFilters &&
              "lg:contents",
          )}
        >
          {children}
          {filtersOpen ? (
            <div
              className={cn(
                "col-span-full flex items-center",
                !collapseFilters && "lg:hidden",
              )}
            >
              {clearButton}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * From/To created-date window, sent to the API as YYYY-MM-DD. Same labelled
 * styling as the dropdowns; either side may be empty. DateInput overlays an
 * "Any date" hint while empty - mobile browsers otherwise render an empty
 * date input as a bare box.
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
        <DateInput
          value={from}
          max={to || undefined}
          onChange={(e) => onFrom(e.target.value)}
          placeholder="Any date"
          className={cn(cls, from ? "border-accent/60" : "border-ink/20")}
        />
      </label>
      <label className="grid gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/55">
        To
        <DateInput
          value={to}
          min={from || undefined}
          onChange={(e) => onTo(e.target.value)}
          placeholder="Any date"
          className={cn(cls, to ? "border-accent/60" : "border-ink/20")}
        />
      </label>
    </div>
  );
}
