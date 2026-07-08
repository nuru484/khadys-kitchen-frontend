"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Pager } from "@/components/admin/ui";
import {
  DateRangeFields,
  FilterBar,
  LabeledSelect,
} from "@/components/admin/filter-bar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-date";
import { useTableQuery } from "@/hooks/use-table-query";
import { useGetTrainingsQuery } from "@/redux/trainings/trainings-api";
import type { ITrainingListQuery } from "@/types/training.types";

const DEFAULTS = {
  published: "all",
  featured: "all",
  apps: "all",
  from: "",
  to: "",
};
const PAGE_SIZE = 12;

export default function ClassesPage() {
  const { page, search, filters, setSearch, setFilter, setPage, queryParams } =
    useTableQuery({
    defaults: DEFAULTS,
    pageSize: PAGE_SIZE,
  });

  const query: ITrainingListQuery = {
    ...(queryParams as ITrainingListQuery),
    published:
      filters.published === "all" ? undefined : filters.published === "yes",
    featured: filters.featured === "all" ? undefined : filters.featured === "yes",
    applicationsOpen: filters.apps === "all" ? undefined : filters.apps === "open",
  };
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetTrainingsQuery(query);

  const trainings = data?.data ?? [];
  const meta = data?.meta;
  const activeCount = Object.entries(filters).filter(
    ([, v]) => v && v !== "all",
  ).length;
  const hasActiveFilters =
    Boolean(search.trim()) || activeCount > 0 || page > 1;
  // Truly empty (not just filtered to nothing): skip the toolbar entirely.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  if (noDataAtAll) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <EmptyState
          title="No trainings yet"
          description="Create your first Bake School class to start taking applications."
          action={{ label: "+ New training", href: "/admin/classes/new" }}
        />
      </div>
    );
  }

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search trainings…"
        activeCount={activeCount}
        action={
          <ButtonLink href="/admin/classes/new" size="sm">
            + New training
          </ButtonLink>
        }
      >
        <LabeledSelect
          label="Published"
          value={filters.published}
          active={filters.published !== "all"}
          onChange={(v) => setFilter("published", v)}
        >
          <option value="all">All</option>
          <option value="yes">Published</option>
          <option value="no">Draft</option>
        </LabeledSelect>
        <LabeledSelect
          label="Featured"
          value={filters.featured}
          active={filters.featured !== "all"}
          onChange={(v) => setFilter("featured", v)}
        >
          <option value="all">All</option>
          <option value="yes">Featured</option>
          <option value="no">Not featured</option>
        </LabeledSelect>
        <LabeledSelect
          label="Applications"
          value={filters.apps}
          active={filters.apps !== "all"}
          onChange={(v) => setFilter("apps", v)}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </LabeledSelect>
        <DateRangeFields
          from={filters.from}
          to={filters.to}
          onFrom={(v) => setFilter("from", v)}
          onTo={(v) => setFilter("to", v)}
        />
      </FilterBar>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[18px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[264px] animate-pulse rounded-[20px] bg-ink/[0.06]" />
          ))}
        </div>
      ) : trainings.length === 0 ? (
        <EmptyState
          title="No matching trainings"
          description="Nothing matches your current search — try clearing it."
        />
      ) : (
        <>
          <div
            className={cn(
              "grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[18px] transition-opacity",
              // auto-fit stretches a lone card across the whole row — pin two
              // tracks on lg so a single card keeps its two-up width.
              trainings.length === 1 && "lg:grid-cols-2",
              isFetching && "opacity-60",
            )}
          >
            {trainings.map((t) => (
              <Link
                key={t.id}
                href={`/admin/classes/${t.id}`}
                className="group flex min-h-[264px] flex-col gap-3.5 rounded-[20px] border border-ink/10 bg-card p-[clamp(22px,3vw,30px)] no-underline transition-[transform,border-color] hover:-translate-y-[3px] hover:border-accent/50"
              >
                {/* Duration eyebrow on its own line, the state pills on one
                    tidy row beneath — a clear top-down hierarchy at any width. */}
                <div className="grid gap-2.5">
                  <span className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
                    {t.duration ?? "—"}
                    <span aria-hidden="true" className="h-px flex-1 bg-ink/10" />
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge
                      status={t.isPublished ? "PUBLISHED" : "DRAFT"}
                      label={t.isPublished ? "Published" : "Draft"}
                    />
                    <StatusBadge
                      status={t.applicationsOpen ? "ACTIVE" : "WITHDRAWN"}
                      label={t.applicationsOpen ? "Apps open" : "Apps closed"}
                    />
                    {t.isFeatured ? (
                      <StatusBadge status="UPCOMING" label="Featured" />
                    ) : null}
                  </div>
                </div>
                <div>
                  <h3 className="font-serif text-[24px] font-normal">{t.name}</h3>
                  <div className="mt-1 text-[13.5px] text-ink/55">
                    {t.startDate ? formatDate(t.startDate) : "Dates TBC"}
                    {t.endDate ? ` – ${formatDate(t.endDate)}` : ""}
                  </div>
                </div>
                <p className="line-clamp-2 flex-1 text-[14px] leading-[1.6] text-ink/[0.68]">
                  {t.summary}
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/10 pt-3.5">
                  <div>
                    <div className="font-serif text-[22px]">
                      {t.counts?.applications ?? 0}
                    </div>
                    <div className="mt-0.5 text-[11.5px] uppercase tracking-[0.08em] text-ink/50">
                      Applications
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-[22px]">
                      {t.counts?.students ?? 0}
                    </div>
                    <div className="mt-0.5 text-[11.5px] uppercase tracking-[0.08em] text-ink/50">
                      Admitted
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {meta ? (
            <Pager page={page} pageCount={meta.totalPages} onPage={setPage} />
          ) : null}
        </>
      )}
    </div>
  );
}
