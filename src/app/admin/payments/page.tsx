"use client";

import Link from "next/link";
import { Card, Pager } from "@/components/admin/ui";
import { FilterBar, LabeledSelect } from "@/components/admin/filter-bar";
import { SkeletonCells } from "@/components/admin/table-bits";
import { useConfirm } from "@/components/admin/use-confirm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDateTime } from "@/lib/format-date";
import { useAuthRole } from "@/hooks/use-auth-role";
import { useTableQuery } from "@/hooks/use-table-query";
import {
  useGetPaymentsQuery,
  useRefundPaymentMutation,
} from "@/redux/payments/payments-api";

const OWNER_FILTERS = [
  { id: "all", label: "All" },
  { id: "order", label: "Shop orders" },
  { id: "application", label: "Bake school" },
];
const STATUS_FILTERS = ["all", "PENDING", "SUCCESS", "FAILED", "REVERSED"];
const METHOD_FILTERS = ["all", "PAYSTACK", "CASH", "MOMO", "BANK_TRANSFER", "OTHER"];
const DEFAULTS = { owner: "all", status: "all", method: "all" };
const PAGE_SIZE = 15;

const titleCase = (s: string) =>
  s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ");

export default function PaymentsPage() {
  const { page, search, filters, setSearch, setFilter, setPage, queryParams } =
    useTableQuery({ defaults: DEFAULTS, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetPaymentsQuery({
      page,
      limit: PAGE_SIZE,
      search: (queryParams.search as string | undefined) ?? undefined,
      owner:
        filters.owner !== "all"
          ? (filters.owner as "application" | "order")
          : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      method: filters.method !== "all" ? filters.method : undefined,
    });
  const [refund] = useRefundPaymentMutation();
  const { isAdmin } = useAuthRole();
  const { confirm, dialog } = useConfirm();

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount = Object.entries(filters).filter(
    ([, v]) => v !== "all",
  ).length;
  const hasActiveFilters =
    Boolean(search.trim()) || activeCount > 0 || page > 1;
  // Truly empty (not just filtered to nothing): skip the toolbar entirely.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  const doRefund = async (p: {
    id: string;
    order: { id: string } | null;
    application: { id: string } | null;
  }) => {
    try {
      await refund({
        paymentId: p.id,
        orderId: p.order?.id,
        applicationId: p.application?.id,
      }).unwrap();
      notify.success("Payment reversed");
    } catch (err) {
      notify.error("Couldn't reverse", { description: extractApiError(err).message });
    }
  };

  if (noDataAtAll) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <EmptyState
          title="No payments yet"
          description="Every shop and bake-school payment lands in this ledger."
        />
      </div>
    );
  }

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search reference or code…"
        activeCount={activeCount}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
      >
        <LabeledSelect
          label="Source"
          value={filters.owner}
          active={filters.owner !== "all"}
          onChange={(v) => setFilter("owner", v)}
        >
          {OWNER_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Status"
          value={filters.status}
          active={filters.status !== "all"}
          onChange={(v) => setFilter("status", v)}
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All" : titleCase(f)}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Method"
          value={filters.method}
          active={filters.method !== "all"}
          onChange={(v) => setFilter("method", v)}
        >
          {METHOD_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All" : titleCase(f)}
            </option>
          ))}
        </LabeledSelect>
      </FilterBar>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No matching payments"
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
                    <th className="px-6 py-3.5 font-semibold">Payment</th>
                    <th className="px-4 py-3.5 font-semibold">For</th>
                    <th className="px-4 py-3.5 font-semibold">Amount</th>
                    <th className="px-4 py-3.5 font-semibold">Method</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold">Paid</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells widths={["w-40", "w-32", "w-20", "w-20", "w-20", "w-24", "w-16"]} />
                  ) : (
                    rows.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-ink/[0.08] last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-[220px] truncate text-[13px] font-semibold text-ink">
                          {p.reference}
                        </div>
                        {p.note ? (
                          <div className="mt-0.5 max-w-[220px] truncate text-[12px] text-ink/50">
                            {p.note}
                          </div>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[13.5px]">
                        {p.order ? (
                          <Link
                            href={`/admin/orders/${p.order.id}`}
                            className="font-semibold text-accent"
                          >
                            {p.order.code}
                          </Link>
                        ) : p.application ? (
                          <Link
                            href={`/admin/applications/${p.application.id}`}
                            className="font-semibold text-accent"
                          >
                            {p.application.code}
                          </Link>
                        ) : (
                          "—"
                        )}
                        <div className="mt-0.5 text-[12px] text-ink/50">
                          {p.order?.fullName ?? p.application?.fullName ?? ""}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[14px] font-medium">
                        {formatMoney(p.amount, p.currency)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[13.5px] text-ink/70">
                        {titleCase(p.method)}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[13px] text-ink/60">
                        {formatDateTime(p.paidAt ?? null)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAdmin && p.status === "SUCCESS" ? (
                          <button
                            type="button"
                            onClick={() =>
                              confirm({
                                title: "Reverse this payment?",
                                description:
                                  "Paystack payments are refunded via Paystack; cash/MoMo are marked reversed. The owning order or application is re-credited.",
                                confirmText: "Reverse payment",
                                isDestructive: true,
                                onConfirm: () => doRefund(p),
                              })
                            }
                            className="text-[13px] font-semibold text-danger"
                          >
                            Reverse
                          </button>
                        ) : null}
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
