"use client";

import { useMemo, useState, type ReactNode } from "react";
import { TrainingCard } from "@/components/trainings/training-card";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { useGetPublicTrainingsQuery } from "@/redux/trainings/trainings-api";
import type { ITraining } from "@/types/training.types";

const PAGE_SIZE = 9;

type StatusKey = "all" | "open" | "closed";
type SortKey = "featured" | "soonest" | "newest";

/** Compact labelled dropdown — same toolbar idiom as the shop browser. */
function LabeledSelect({
  label,
  value,
  active,
  onChange,
  children,
}: {
  label: string;
  value: string;
  active: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/55">
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

const sortTrainings = (list: ITraining[], sort: SortKey): ITraining[] => {
  const sorted = [...list];
  if (sort === "soonest") {
    // Dated classes first (nearest start), date-TBC ones at the end.
    sorted.sort((a, b) => {
      if (!a.startDate) return b.startDate ? 1 : 0;
      if (!b.startDate) return -1;
      return a.startDate.localeCompare(b.startDate);
    });
  } else if (sort === "newest") {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else {
    // Featured picks first, then the API's default order.
    sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }
  return sorted;
};

/**
 * The catalogue: every published class, with the same instant client-side
 * search/filter/sort toolbar and pagination the shop browser uses (one fetch —
 * the list is a bakery school's worth).
 */
export function TrainingsCatalogue() {
  const { data, isLoading, isError, error, refetch } =
    useGetPublicTrainingsQuery({ limit: 100 });
  const trainings = useMemo(() => data?.data ?? [], [data]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusKey>("all");
  const [startsFrom, setStartsFrom] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = trainings.filter(
      (t) =>
        (status === "all" ||
          (status === "open" ? t.applicationsOpen : !t.applicationsOpen)) &&
        // A start-date floor keeps only classes beginning on/after that day
        // (date-TBC classes stay visible — they may still be announced later).
        (!startsFrom ||
          !t.startDate ||
          t.startDate.slice(0, 10) >= startsFrom) &&
        (!q || `${t.name} ${t.summary}`.toLowerCase().includes(q)),
    );
    return sortTrainings(filtered, sort);
  }, [trainings, query, status, startsFrom, sort]);

  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = list.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToPage = (n: number) => {
    setPage(Math.min(Math.max(1, n), pageCount));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Every filter change returns to the first page.
  const changeQuery = (v: string) => {
    setQuery(v);
    setPage(1);
  };
  const pickStatus = (v: string) => {
    setStatus(v as StatusKey);
    setPage(1);
  };
  const pickSort = (v: string) => {
    setSort(v as SortKey);
    setPage(1);
  };
  const changeStartsFrom = (v: string) => {
    setStartsFrom(v);
    setPage(1);
  };

  const activeCount = [
    status !== "all",
    startsFrom !== "",
    sort !== "featured",
    query.trim().length > 0,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setStartsFrom("");
    setSort("featured");
    setPage(1);
  };

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-[clamp(20px,3vw,32px)] sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[420px] animate-pulse rounded-[18px] bg-ink/[0.06]"
          />
        ))}
      </div>
    );
  }

  if (trainings.length === 0) {
    return (
      <EmptyState
        eyebrow="Khady's Kitchen Trainings"
        title="No classes are published just yet"
        description="New trainings are announced here first. Message us and we'll tell you the moment enrolment opens - places fill fast."
        action={{ label: "Ask about upcoming classes", href: routes.contact }}
        className="my-2"
      />
    );
  }

  const resultCount =
    list.length === trainings.length
      ? `${trainings.length} classes`
      : `${list.length} of ${trainings.length} classes`;

  return (
    <>
      <div className="mb-[clamp(22px,3vw,32px)] border-y border-ink/15 py-[18px]">
        {/* Mobile / tablet: the toolbar collapses behind one toggle. */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="trainings-filters"
            className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink/25 px-4 py-[10px] font-sans text-[13.5px] font-semibold text-ink transition-colors hover:border-accent"
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
            Search &amp; filters
            {activeCount > 0 ? (
              <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-[#FDFAF3]">
                {activeCount}
              </span>
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "text-[11px] transition-transform",
                filtersOpen && "rotate-180",
              )}
            >
              ▾
            </span>
          </button>
          <span className="whitespace-nowrap text-[13.5px] text-ink/55">
            {resultCount}
          </span>
        </div>

        <div
          id="trainings-filters"
          className={cn(
            "mt-3 gap-3 lg:mt-0",
            filtersOpen ? "grid grid-cols-2" : "hidden",
            "lg:flex lg:flex-wrap lg:items-end lg:gap-2.5",
          )}
        >
          <div className="relative col-span-2 w-full lg:col-span-1 lg:w-auto lg:min-w-[180px] lg:max-w-[340px] lg:flex-[1_1_200px]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-[16px] top-1/2 -translate-y-1/2 text-[15px] text-ink/45"
            >
              ⌕
            </span>
            <input
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              placeholder="Search classes…"
              aria-label="Search the classes"
              className="w-full rounded-full border-[1.5px] border-ink/20 bg-transparent py-[11px] pl-[40px] pr-[16px] font-sans text-[15px] text-ink outline-none transition-colors focus:border-accent"
            />
          </div>

          <LabeledSelect
            label="Applications"
            value={status}
            active={status !== "all"}
            onChange={pickStatus}
          >
            <option value="all">All classes</option>
            <option value="open">Open for applications</option>
            <option value="closed">Closed</option>
          </LabeledSelect>

          <label className="grid gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/55">
            Starts from
            <input
              type="date"
              value={startsFrom}
              onChange={(e) => changeStartsFrom(e.target.value)}
              className={cn(
                "w-full min-w-0 cursor-pointer rounded-[10px] border-[1.5px] bg-transparent px-3 py-[9px] font-sans text-[14px] font-medium normal-case tracking-normal text-ink outline-none transition-colors focus:border-accent lg:w-auto",
                startsFrom ? "border-accent text-accent" : "border-ink/20",
              )}
            />
          </label>

          <LabeledSelect
            label="Sort"
            value={sort}
            active={sort !== "featured"}
            onChange={pickSort}
          >
            <option value="featured">Featured first</option>
            <option value="soonest">Soonest start</option>
            <option value="newest">Newest</option>
          </LabeledSelect>

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="col-span-2 cursor-pointer justify-self-start text-[13px] font-semibold text-accent lg:col-span-1 lg:self-center"
            >
              Clear filters
            </button>
          ) : null}

          <span className="hidden text-[13.5px] text-ink/55 lg:ml-auto lg:block lg:self-center">
            {resultCount}
          </span>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={
            query.trim()
              ? `Nothing matches “${query}”.`
              : "Nothing fits those filters."
          }
          description="Try another word or a different date, or clear the filters."
          className="my-2"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-[clamp(20px,3vw,32px)] sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((training) => (
              <TrainingCard key={training.id} training={training} />
            ))}
          </div>

          {pageCount > 1 ? (
            <nav
              aria-label="Catalogue pages"
              className="mt-[clamp(28px,4vw,44px)] flex flex-wrap items-center justify-center gap-2"
            >
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={cn(
                    "grid h-10 w-10 cursor-pointer place-items-center rounded-full border-[1.5px] font-sans text-[14px] font-semibold transition-colors",
                    n === currentPage
                      ? "border-accent bg-accent text-[#FDFAF3]"
                      : "border-ink/20 bg-transparent text-ink hover:border-accent",
                  )}
                >
                  {n}
                </button>
              ))}
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}
