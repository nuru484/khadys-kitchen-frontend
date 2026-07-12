"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Pager } from "@/components/admin/ui";
import { ActionMenu } from "@/components/admin/action-menu";
import { SkeletonCells } from "@/components/admin/table-bits";
import { useConfirm } from "@/components/admin/use-confirm";
import { DateRangeFields, FilterBar, LabeledSelect } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format-money";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import {
  APPLICATION_DELETE_COPY,
  applicationStatusActionsFor,
  applicationStatusCopy,
} from "@/lib/admin/application-actions";
import { useAuthRole } from "@/hooks/use-auth-role";
import { useTableQuery } from "@/hooks/use-table-query";
import {
  useDeleteApplicationMutation,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "@/redux/applications/applications-api";
import type { IApplicationListQuery } from "@/types/application.types";

const STATUS_FILTERS = [
  "all",
  "PENDING",
  "WAITLISTED",
  "RECRUITED",
  "REJECTED",
  "WITHDRAWN",
];
const PAYMENT_FILTERS = ["all", "UNPAID", "PARTIAL", "PAID"];
const DEFAULTS = { status: "all", paymentStatus: "all", from: "", to: "" };
const PAGE_SIZE = 10;
const label = (f: string) =>
  f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase();

/** Applications table — standalone (all) or scoped to a training via `trainingId`.
 * URL-synced state; pass a `prefix` when two tables share a page. */
export function ApplicationsTable({
  trainingId,
  prefix,
}: {
  trainingId?: string;
  prefix?: string;
}) {
  const router = useRouter();
  const {
    page,
    search,
    filters,
    resetFilters,
    setSearch,
    setFilter,
    setPage,
    queryParams,
  } =
    useTableQuery({ defaults: DEFAULTS, prefix, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetApplicationsQuery({ trainingId, ...queryParams } as IApplicationListQuery);
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [deleteApplication] = useDeleteApplicationMutation();
  const { isAdmin } = useAuthRole();
  const { confirm, dialog } = useConfirm();

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      notify.success(ok);
    } catch (err) {
      notify.error("Action failed", { description: extractApiError(err).message });
    }
  };

  const rows = data?.data ?? [];
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
      <EmptyState
        title="No applications yet"
        description={
          trainingId
            ? "No one has applied to this cohort yet."
            : "Applications will appear here as people apply."
        }
      />
    );
  }

  return (
    <div>
      <FilterBar
        collapseFilters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search applicants…"
        activeCount={activeCount}
        onClear={resetFilters}
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
              {label(f)}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Payment"
          value={filters.paymentStatus}
          active={filters.paymentStatus !== "all"}
          onChange={(v) => setFilter("paymentStatus", v)}
        >
          {PAYMENT_FILTERS.map((f) => (
            <option key={f} value={f}>
              {label(f)}
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
          title="No matching applications"
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
                    <th className="px-6 py-3 font-semibold">Applicant</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Balance</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    {/* relative: sr-only text is absolutely positioned, and
                        without a positioned ancestor INSIDE the overflow-x-auto
                        wrapper it escapes the scroll clip and widens the page
                        on small screens. */}
                    <th className="relative px-6 py-3.5 text-right font-semibold">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells
                      widths={["w-40", "w-28", "w-20", "w-20", "w-20", "w-6"]}
                    />
                  ) : (
                    rows.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-ink/[0.08] transition-colors last:border-0 hover:bg-accent/[0.05]"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/applications/${a.id}`}
                          title={a.fullName}
                          className="block max-w-[170px] truncate sm:max-w-[260px] text-[15px] font-semibold text-ink no-underline"
                        >
                          {a.fullName}
                        </Link>
                        <div className="mt-0.5 max-w-[170px] truncate sm:max-w-[260px] text-[12.5px] text-ink/55">
                          {a.code}
                          {a.email ? ` · ${a.email}` : ""}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[14px] text-ink/70">
                        {a.phone}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[14px] text-ink/70">
                        {formatMoney(a.balance, a.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.paymentStatus} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <ActionMenu
                          items={[
                            {
                              label: "View details",
                              onClick: () =>
                                router.push(`/admin/applications/${a.id}`),
                            },
                            ...applicationStatusActionsFor(isAdmin).filter(
                              (act) => act.status !== a.status,
                            ).map((act) => ({
                              label: act.label,
                              variant:
                                act.variant === "danger"
                                  ? ("danger" as const)
                                  : ("default" as const),
                              onClick: () =>
                                confirm({
                                  title: `${act.label} this applicant?`,
                                  description: applicationStatusCopy(act.status),
                                  confirmText: act.label,
                                  isDestructive: act.variant === "danger",
                                  onConfirm: () =>
                                    run(
                                      () =>
                                        updateStatus({
                                          id: a.id,
                                          status: act.status,
                                        }).unwrap(),
                                      "Status updated",
                                    ),
                                }),
                            })),
                            ...(isAdmin
                              ? [
                                  {
                                    label: "Delete",
                                    variant: "danger" as const,
                                    onClick: () =>
                                      confirm({
                                        title: "Delete this application?",
                                        description: APPLICATION_DELETE_COPY,
                                        confirmText: "Delete application",
                                        isDestructive: true,
                                        onConfirm: () =>
                                          run(
                                            () => deleteApplication(a.id).unwrap(),
                                            "Application deleted",
                                          ),
                                      }),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </td>
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
      {dialog}
    </div>
  );
}
