"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Pager } from "@/components/admin/ui";
import { ActionMenu } from "@/components/admin/action-menu";
import { EditCustomerModal } from "@/components/admin/edit-customer-modal";
import { DateRangeFields, FilterBar } from "@/components/admin/filter-bar";
import {
  DateTimeCell,
  RowCard,
  RowCardList,
  SkeletonCells,
  SkeletonRowCards,
} from "@/components/admin/table-bits";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format-money";
import { formatDateTime } from "@/lib/format-date";
import { useTableQuery } from "@/hooks/use-table-query";
import type { ICustomer } from "@/types/customer.types";
import { useGetCustomersQuery } from "@/redux/customers/customers-api";

const DEFAULTS = { from: "", to: "" };
const PAGE_SIZE = 12;

export default function CustomersPage() {
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
    useTableQuery({
    defaults: DEFAULTS,
    pageSize: PAGE_SIZE,
  });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetCustomersQuery({
      page,
      limit: PAGE_SIZE,
      search: (queryParams.search as string | undefined) ?? undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    });

  const [editing, setEditing] = useState<ICustomer | null>(null);
  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount = (filters.from ? 1 : 0) + (filters.to ? 1 : 0);
  const hasActiveFilters =
    Boolean(search.trim()) || activeCount > 0 || page > 1;
  // Truly empty (not just searched to nothing): skip the toolbar entirely.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  // One source for a row's actions — the desktop table and the mobile cards
  // render the same menu.
  const menuItemsFor = (c: ICustomer) => [
    {
      label: "View details",
      onClick: () => router.push(`/admin/customers/${c.id}`),
    },
    {
      label: "Edit details",
      onClick: () => setEditing(c),
    },
  ];

  if (noDataAtAll) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <EmptyState
          title="No customers yet"
          description="Customers appear automatically the first time they order."
        />
      </div>
    );
  }

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search name, phone, email…"
        activeCount={activeCount}
        onClear={resetFilters}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
      >
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
          title="No matching customers"
          description="Nothing matches your search — try clearing it."
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
                rows.map((c) => (
                  <RowCard
                    key={c.id}
                    onOpen={() => router.push(`/admin/customers/${c.id}`)}
                    action={<ActionMenu items={menuItemsFor(c)} />}
                  >
                    <div className="truncate text-[15px] font-semibold text-ink">
                      {c.fullName}
                    </div>
                    <div className="mt-0.5 truncate text-[12.5px] text-ink/55">
                      {c.phone}
                      {c.email ? ` · ${c.email}` : ""}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="text-[13.5px] text-ink/70">
                        <span className="font-semibold text-ink">
                          {formatMoney(c.totalSpent)}
                        </span>{" "}
                        · {c.orderCount} order{c.orderCount === 1 ? "" : "s"}
                      </span>
                      <span className="text-[12.5px] text-ink/50">
                        {c.lastOrderAt
                          ? `Last ${formatDateTime(c.lastOrderAt)}`
                          : "No orders yet"}
                      </span>
                    </div>
                  </RowCard>
                ))
              )}
            </RowCardList>

            {/* ≥md: the full table. */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/10 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/50">
                    <th className="px-6 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Orders</th>
                    <th className="px-4 py-3 font-semibold">Total spent</th>
                    <th className="px-4 py-3 font-semibold">Last order</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells widths={["w-40", "w-28", "w-12", "w-24", "w-24", "w-6"]} />
                  ) : (
                    rows.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/admin/customers/${c.id}`)}
                      className="cursor-pointer border-b border-ink/[0.08] transition-colors last:border-0 hover:bg-accent/[0.05]"
                    >
                      <td className="px-6 py-3">
                        <div title={c.fullName} className="max-w-[170px] truncate sm:max-w-[260px] text-[15px] font-semibold text-ink">
                          {c.fullName}
                        </div>
                        <div className="max-w-[170px] truncate sm:max-w-[260px] mt-0.5 text-[12.5px] text-ink/55">
                          {c.email ?? "No email"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[14px] text-ink/70">
                        {c.phone}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[14px] text-ink/70">
                        {c.orderCount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[14px] font-medium">
                        {formatMoney(c.totalSpent)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[13.5px] text-ink/70">
                        <DateTimeCell iso={c.lastOrderAt} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <ActionMenu items={menuItemsFor(c)} />
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
      {editing ? (
        <EditCustomerModal customer={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}
