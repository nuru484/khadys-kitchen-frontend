"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Pager } from "@/components/admin/ui";
import { SkeletonCells } from "@/components/admin/table-bits";
import { FilterBar, LabeledSelect } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { useTableQuery } from "@/hooks/use-table-query";
import { useGetStudentsQuery } from "@/redux/students/students-api";

const STATUS_FILTERS = ["all", "ACTIVE", "SUSPENDED", "GRADUATED", "WITHDRAWN"];
const DEFAULTS = { status: "all" };
const PAGE_SIZE = 10;

/** Students table — standalone or scoped to a training via `trainingId`. */
export function StudentsTable({
  trainingId,
  prefix,
}: {
  trainingId?: string;
  prefix?: string;
}) {
  const router = useRouter();
  const { page, search, filters, setSearch, setFilter, setPage, queryParams } =
    useTableQuery({ defaults: DEFAULTS, prefix, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetStudentsQuery({
      page,
      limit: PAGE_SIZE,
      trainingId,
      search: (queryParams.search as string | undefined) ?? undefined,
      status: filters.status !== "all" ? filters.status : undefined,
    });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount = filters.status !== "all" ? 1 : 0;
  const hasActiveFilters =
    Boolean(search.trim()) || activeCount > 0 || page > 1;
  // Truly empty (not just filtered to nothing): skip the toolbar entirely.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  if (noDataAtAll) {
    return (
      <EmptyState
        title="No students yet"
        description={
          trainingId
            ? "No one has been admitted to this cohort yet."
            : "Admitted students will appear here."
        }
      />
    );
  }

  return (
    <div>
      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search students…"
        activeCount={activeCount}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
      >
        <LabeledSelect
          label="Status"
          value={filters.status}
          active={filters.status !== "all"}
          onChange={(v) => setFilter("status", v)}
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </option>
          ))}
        </LabeledSelect>
      </FilterBar>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No matching students"
          description="Nothing matches your current search or filters — try clearing them."
        />
      ) : (
        <>
          <Card
            className={cn(
              "overflow-hidden transition-opacity",
              isFetching && !isLoading && "opacity-60",
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/10 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/50">
                    <th className="px-6 py-3.5 font-semibold">Student</th>
                    <th className="px-4 py-3.5 font-semibold">Phone</th>
                    {!trainingId ? (
                      <th className="px-4 py-3.5 font-semibold">Class</th>
                    ) : null}
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells
                      widths={
                        trainingId
                          ? ["w-40", "w-28", "w-20", "w-6"]
                          : ["w-40", "w-28", "w-32", "w-20", "w-6"]
                      }
                    />
                  ) : (
                    rows.map((st) => (
                    <tr
                      key={st.id}
                      onClick={() => router.push(`/admin/students/${st.id}`)}
                      className="cursor-pointer border-b border-ink/[0.08] transition-colors last:border-0 hover:bg-accent/[0.05]"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/students/${st.id}`}
                          onClick={(e) => e.stopPropagation()}
                          title={st.fullName}
                          className="block max-w-[170px] truncate sm:max-w-[260px] text-[15px] font-semibold text-ink no-underline"
                        >
                          {st.fullName}
                        </Link>
                        <div className="mt-0.5 max-w-[170px] truncate sm:max-w-[260px] text-[12.5px] text-ink/55">{st.code}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-ink/70">
                        {st.phone}
                      </td>
                      {!trainingId ? (
                        <td className="whitespace-nowrap px-4 py-4 text-[14px] text-ink/70">
                          <span title={st.training?.name} className="max-w-[170px] truncate sm:max-w-[260px] block">
                            {st.training?.name ?? "—"}
                          </span>
                        </td>
                      ) : null}
                      <td className="px-4 py-4">
                        <StatusBadge status={st.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-ink/40">→</td>
                    </tr>
                    ))
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
