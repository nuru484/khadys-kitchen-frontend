"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Pager } from "@/components/admin/ui";
import { FilterBar, LabeledSelect } from "@/components/admin/filter-bar";
import { SkeletonCells } from "@/components/admin/table-bits";
import { WalkInOrderModal } from "@/components/admin/walk-in-order-modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format-money";
import { formatDate } from "@/lib/format-date";
import { useTableQuery } from "@/hooks/use-table-query";
import { useGetOrdersQuery } from "@/redux/orders/orders-api";

const STATUS_FILTERS = [
  "all",
  "PENDING",
  "CONFIRMED",
  "READY",
  "COLLECTED",
  "CANCELLED",
];
const PAYMENT_FILTERS = ["all", "UNPAID", "PARTIAL", "PAID"];
const DEFAULTS = { status: "all", payment: "all" };
const PAGE_SIZE = 12;

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function OrdersPage() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  // Deep-linked from an item's "View orders" — narrows the list to orders
  // containing that product; cleared with its chip.
  const productId = useSearchParams().get("productId") ?? undefined;
  const { page, search, filters, setSearch, setFilter, setPage, queryParams } =
    useTableQuery({ defaults: DEFAULTS, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetOrdersQuery({
      page,
      limit: PAGE_SIZE,
      productId,
      search: (queryParams.search as string | undefined) ?? undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      paymentStatus: filters.payment !== "all" ? filters.payment : undefined,
    });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.payment !== "all" ? 1 : 0) +
    (productId ? 1 : 0);
  const hasActiveFilters =
    Boolean(search.trim()) || activeCount > 0 || page > 1;
  // Truly empty (not just filtered to nothing): skip the toolbar entirely.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  if (noDataAtAll) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <EmptyState
          title="No orders yet"
          description="Shop orders land here the moment a customer checks out — or record a walk-in from the counter."
          action={{ label: "+ Walk-in order", onClick: () => setRecording(true) }}
        />
        <WalkInOrderModal open={recording} onClose={() => setRecording(false)} />
      </div>
    );
  }

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search code, name, phone…"
        activeCount={activeCount}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
        action={<Button onClick={() => setRecording(true)}>+ Walk-in order</Button>}
      >
        {productId ? (
          <button
            type="button"
            onClick={() => router.replace("/admin/orders")}
            className="inline-flex cursor-pointer items-center gap-1.5 self-center rounded-full bg-accent/10 px-3.5 py-2 text-[12.5px] font-semibold text-accent transition-colors hover:bg-accent/15"
          >
            Filtered by item ✕
          </button>
        ) : null}
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
          label="Payment"
          value={filters.payment}
          active={filters.payment !== "all"}
          onChange={(v) => setFilter("payment", v)}
        >
          {PAYMENT_FILTERS.map((f) => (
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
          title="No matching orders"
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
                    <th className="px-6 py-3.5 font-semibold">Order</th>
                    <th className="px-4 py-3.5 font-semibold">Items</th>
                    <th className="px-4 py-3.5 font-semibold">Total</th>
                    <th className="px-4 py-3.5 font-semibold">Payment</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold">Placed</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells widths={["w-40", "w-12", "w-20", "w-20", "w-24", "w-24", "w-6"]} />
                  ) : (
                    rows.map((o) => {
                    const itemCount = o.items.reduce((n, i) => n + i.quantity, 0);
                    return (
                      <tr
                        key={o.id}
                        onClick={() => router.push(`/admin/orders/${o.id}`)}
                        className="cursor-pointer border-b border-ink/[0.08] transition-colors last:border-0 hover:bg-accent/[0.05]"
                      >
                        <td className="px-6 py-4">
                          <div title={o.fullName} className="max-w-[170px] truncate sm:max-w-[260px] text-[15px] font-semibold text-ink">
                            {o.fullName}
                          </div>
                          <div className="max-w-[170px] truncate sm:max-w-[260px] mt-0.5 text-[12.5px] text-ink/55">{o.code}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-[14px] text-ink/70">
                          {itemCount} item{itemCount === 1 ? "" : "s"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-[14px] font-medium">
                          {formatMoney(o.total, o.currency)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={o.paymentStatus} />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-[13.5px] text-ink/70">
                          {formatDate(o.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right text-ink/40">→</td>
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

      <WalkInOrderModal open={recording} onClose={() => setRecording(false)} />
    </div>
  );
}
