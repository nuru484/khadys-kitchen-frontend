"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Pager } from "@/components/admin/ui";
import { ActionMenu } from "@/components/admin/action-menu";
import { useConfirm } from "@/components/admin/use-confirm";
import { RecordPaymentModal } from "@/components/admin/record-payment-modal";
import {
  orderActionsFor,
  ORDER_CONFIRM_COPY,
} from "@/lib/admin/order-actions";
import { useAuthRole } from "@/hooks/use-auth-role";
import { DateRangeFields, FilterBar, LabeledSelect } from "@/components/admin/filter-bar";
import {
  DateTimeCell,
  RowCard,
  RowCardList,
  SkeletonCells,
  SkeletonRowCards,
} from "@/components/admin/table-bits";
import { WalkInOrderModal } from "@/components/admin/walk-in-order-modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format-money";
import { formatDateTime } from "@/lib/format-date";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useTableQuery } from "@/hooks/use-table-query";
import {
  useGetOrdersQuery,
  useSetOrderStatusMutation,
} from "@/redux/orders/orders-api";
import type { IOrder } from "@/types/order.types";

const STATUS_FILTERS = [
  "all",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY",
  "COLLECTED",
  "CANCELLED",
];
const PAYMENT_FILTERS = ["all", "UNPAID", "PARTIAL", "PAID"];
const DEFAULTS = { status: "all", payment: "all", from: "", to: "" };
const PAGE_SIZE = 12;

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function OrdersPage() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [payingOrder, setPayingOrder] = useState<IOrder | null>(null);
  const [setOrderStatus] = useSetOrderStatusMutation();
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

  // One source for a row's actions — the desktop table and the mobile cards
  // render the same menu.
  const menuItemsFor = (o: IOrder) => [
    {
      label: "View details",
      onClick: () => router.push(`/admin/orders/${o.id}`),
    },
    ...orderActionsFor(o.status, isAdmin).map((a) => ({
      label: a.label,
      variant:
        a.action === "cancel" ? ("danger" as const) : ("default" as const),
      onClick: () =>
        confirm({
          title: ORDER_CONFIRM_COPY[a.action].title,
          description: ORDER_CONFIRM_COPY[a.action].description,
          confirmText: a.label,
          isDestructive: a.action === "cancel",
          onConfirm: () =>
            run(
              () => setOrderStatus({ id: o.id, action: a.action }).unwrap(),
              "Order updated",
            ),
        }),
    })),
    ...(o.balance > 0 && o.status !== "CANCELLED"
      ? [
          {
            label: "Record payment",
            onClick: () => setPayingOrder(o),
          },
        ]
      : []),
  ];
  // Deep-linked from an item's "View orders" — narrows the list to orders
  // containing that product; cleared with its chip.
  const productId = useSearchParams().get("productId") ?? undefined;
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
    useTableQuery({ defaults: DEFAULTS, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetOrdersQuery({
      page,
      limit: PAGE_SIZE,
      productId,
      search: (queryParams.search as string | undefined) ?? undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      paymentStatus: filters.payment !== "all" ? filters.payment : undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    });

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount =
    Object.entries(filters).filter(([, v]) => v && v !== "all").length +
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
        collapseFilters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search code, name, phone…"
        activeCount={activeCount}
        onClear={resetFilters}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
        action={<Button size="sm" onClick={() => setRecording(true)}>+ Walk-in order</Button>}
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
            {/* Phones: row cards — every column's data visible, no side-scroll. */}
            <RowCardList>
              {isLoading ? (
                <SkeletonRowCards />
              ) : (
                rows.map((o) => {
                  const itemCount = o.items.reduce((n, i) => n + i.quantity, 0);
                  return (
                    <RowCard
                      key={o.id}
                      onOpen={() => router.push(`/admin/orders/${o.id}`)}
                      action={<ActionMenu items={menuItemsFor(o)} />}
                    >
                      <div className="truncate text-[15px] font-semibold text-ink">
                        {o.fullName}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-ink/55">
                        {o.code}
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={o.status} />
                        <StatusBadge status={o.paymentStatus} />
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="text-[14px] font-semibold text-ink">
                          {formatMoney(o.total, o.currency)}
                          <span className="font-normal text-ink/55">
                            {" "}
                            · {itemCount} item{itemCount === 1 ? "" : "s"}
                          </span>
                        </span>
                        <span className="text-[12.5px] text-ink/50">
                          {formatDateTime(o.createdAt)}
                        </span>
                      </div>
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
                    <th className="px-6 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Items</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Placed</th>
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
                        <td className="px-6 py-3">
                          <div title={o.fullName} className="max-w-[170px] truncate sm:max-w-[260px] text-[15px] font-semibold text-ink">
                            {o.fullName}
                          </div>
                          <div className="max-w-[170px] truncate sm:max-w-[260px] mt-0.5 text-[12.5px] text-ink/55">{o.code}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[14px] text-ink/70">
                          {itemCount} item{itemCount === 1 ? "" : "s"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[14px] font-medium">
                          {formatMoney(o.total, o.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={o.paymentStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[13.5px] text-ink/70">
                          <DateTimeCell iso={o.createdAt} />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <ActionMenu items={menuItemsFor(o)} />
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

      <WalkInOrderModal open={recording} onClose={() => setRecording(false)} />
      {payingOrder ? (
        <RecordPaymentModal
          owner={{ kind: "order", id: payingOrder.id }}
          open
          onClose={() => setPayingOrder(null)}
        />
      ) : null}
      {dialog}
    </div>
  );
}
