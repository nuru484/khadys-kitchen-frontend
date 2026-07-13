"use client";

import { Card, Pager } from "@/components/admin/ui";
import { DateRangeFields, FilterBar, LabeledSelect } from "@/components/admin/filter-bar";
import {
  DateTimeCell,
  RowCard,
  RowCardList,
  SkeletonCells,
  SkeletonRowCards,
} from "@/components/admin/table-bits";
import { formatDateTime } from "@/lib/format-date";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { useTableQuery } from "@/hooks/use-table-query";
import { useGetAuditLogsQuery } from "@/redux/audit/audit-api";
import type { IAuditListQuery } from "@/types/audit.types";

const ENTITY_FILTERS = [
  "all",
  "Training",
  "Application",
  "Student",
  "Payment",
  "SiteSetting",
];
const ACTION_FILTERS = [
  "all",
  "training.created",
  "training.updated",
  "training.deleted",
  "training.published",
  "training.unpublished",
  "application.status_changed",
  "application.deleted",
  "payment.recorded",
  "payment.refunded",
  "student.status_changed",
  "student.deleted",
  "settings.updated",
];
const DEFAULTS = { entity: "all", action: "all", from: "", to: "" };
const PAGE_SIZE = 20;

const humanize = (action: string) =>
  action.replace(/\./g, " · ").replace(/_/g, " ");

export default function AuditPage() {
  const { page, filters, resetFilters, setFilter, setPage, queryParams } =
    useTableQuery({
    defaults: DEFAULTS,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetAuditLogsQuery(queryParams as IAuditListQuery);

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount = Object.entries(filters).filter(
    ([, v]) => v && v !== "all",
  ).length;
  const hasActiveFilters = activeCount > 0 || page > 1;
  // Truly empty (not just filtered to nothing): skip the toolbar entirely.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  if (noDataAtAll) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <EmptyState
          title="No activity yet"
          description="Admin actions will be recorded here as they happen."
        />
      </div>
    );
  }

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <FilterBar
        collapseFilters
        activeCount={activeCount}
        onClear={resetFilters}
        resultLabel={meta ? `${String(meta.total)} events` : undefined}
        action={
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Refresh
          </Button>
        }
      >
        <LabeledSelect
          label="Entity"
          value={filters.entity}
          active={filters.entity !== "all"}
          onChange={(v) => setFilter("entity", v)}
        >
          {ENTITY_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All" : f}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Action"
          value={filters.action}
          active={filters.action !== "all"}
          onChange={(v) => setFilter("action", v)}
        >
          {ACTION_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All" : humanize(f)}
            </option>
          ))}
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
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No matching events"
          description="Nothing matches these filters — try clearing them."
        />
      ) : (
        <>
          <Card
            className={cn("overflow-hidden transition-opacity", isFetching && !isLoading && "opacity-60")}
          >
            {/* Phones: row cards — every column's data visible, no side-scroll. */}
            <RowCardList>
              {isLoading ? (
                <SkeletonRowCards />
              ) : (
                rows.map((log) => {
                  const metaStr =
                    log.metadata && typeof log.metadata === "object"
                      ? JSON.stringify(log.metadata)
                      : null;
                  return (
                    <RowCard key={log.id}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                        <span className="rounded-full bg-ink/[0.06] px-2.5 py-1 text-[12.5px] font-medium text-ink/75">
                          {humanize(log.action)}
                        </span>
                        <span className="text-[12px] text-ink/50">
                          {log.entity}
                          {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <span className="truncate text-[13.5px] font-medium text-ink">
                          {log.actor ? log.actor.name : "System"}
                        </span>
                        <span className="text-[12px] text-ink/50">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      {metaStr ? (
                        <div className="mt-1.5 truncate font-mono text-[11.5px] text-ink/45">
                          {metaStr}
                        </div>
                      ) : null}
                    </RowCard>
                  );
                })
              )}
            </RowCardList>

            {/* ≥md: the full table. */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/10 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/50">
                    <th className="px-6 py-3 font-semibold">When</th>
                    <th className="px-4 py-3 font-semibold">Actor</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">Entity</th>
                    <th className="px-6 py-3 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells widths={["w-32", "w-32", "w-48", "w-24", "w-24"]} />
                  ) : (
                    rows.map((log) => {
                    const metaStr =
                      log.metadata && typeof log.metadata === "object"
                        ? JSON.stringify(log.metadata)
                        : null;
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-ink/[0.08] align-top last:border-0"
                      >
                        <td className="whitespace-nowrap px-6 py-3.5 text-[13px] text-ink/70">
                          <DateTimeCell iso={log.createdAt} />
                        </td>
                        <td className="px-4 py-3.5 text-[13.5px]">
                          {log.actor ? (
                            <>
                              <div title={log.actor.name} className="max-w-[170px] truncate sm:max-w-[260px] font-medium text-ink">
                                {log.actor.name}
                              </div>
                              <div className="max-w-[170px] truncate sm:max-w-[260px] text-[12px] text-ink/50">
                                {log.actor.email}
                              </div>
                            </>
                          ) : (
                            <span className="text-ink/50">System</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="rounded-full bg-ink/[0.06] px-2.5 py-1 text-[12.5px] font-medium text-ink/75">
                            {humanize(log.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-ink/70">
                          <div className="font-medium text-ink/80">{log.entity}</div>
                          {log.entityId ? (
                            <div className="text-[11.5px] text-ink/40">
                              {log.entityId.slice(0, 8)}
                            </div>
                          ) : null}
                        </td>
                        <td className="max-w-[280px] px-6 py-3.5">
                          {metaStr ? (
                            <span
                              title={metaStr}
                              className="block truncate font-mono text-[12px] text-ink/50"
                            >
                              {metaStr}
                            </span>
                          ) : (
                            <span className="text-ink/30">—</span>
                          )}
                        </td>
                      </tr>
                    );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          {meta ? (
            <Pager page={page} pageCount={meta.totalPages} onPage={setPage} />
          ) : null}
        </>
      )}
    </div>
  );
}
