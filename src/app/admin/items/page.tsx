"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useTableQuery } from "@/hooks/use-table-query";
import {
  useGetProductsQuery,
  useSetProductAvailabilityMutation,
} from "@/redux/products/products-api";
import { PRODUCT_CATEGORIES } from "@/types/product.types";

const AVAILABILITY_FILTERS = ["all", "available", "unavailable"];
const DEFAULTS = { category: "all", availability: "all" };
const PAGE_SIZE = 12;

export default function ItemsPage() {
  const router = useRouter();
  const { page, search, filters, setSearch, setFilter, setPage, queryParams } =
    useTableQuery({ defaults: DEFAULTS, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetProductsQuery({
      page,
      limit: PAGE_SIZE,
      search: (queryParams.search as string | undefined) ?? undefined,
      category: filters.category !== "all" ? filters.category : undefined,
      isAvailable:
        filters.availability === "all"
          ? undefined
          : filters.availability === "available",
    });
  const [setAvailability] = useSetProductAvailabilityMutation();
  const { confirm, dialog } = useConfirm();

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount =
    (filters.category !== "all" ? 1 : 0) +
    (filters.availability !== "all" ? 1 : 0);
  const hasActiveFilters =
    Boolean(search.trim()) || activeCount > 0 || page > 1;
  // Truly empty (not just filtered to nothing): skip the toolbar entirely.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  if (noDataAtAll) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <EmptyState
          title="No items yet"
          description="Add your first bake to open the shop."
          action={{ label: "+ New item", href: "/admin/items/new" }}
        />
      </div>
    );
  }

  const toggle = (id: string, name: string, next: boolean) =>
    confirm({
      title: next ? "Put this item on sale?" : "Take this item off sale?",
      description: next
        ? `"${name}" will show in the shop and be orderable again.`
        : `"${name}" disappears from the shop immediately. Existing orders are unaffected.`,
      confirmText: next ? "Make available" : "Make unavailable",
      isDestructive: !next,
      onConfirm: async () => {
        try {
          await setAvailability({ id, isAvailable: next }).unwrap();
          notify.success(next ? "Item is on sale" : "Item taken off sale");
        } catch (err) {
          notify.error("Couldn't update availability", {
            description: extractApiError(err).message,
          });
        }
      },
    });

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search items…"
        activeCount={activeCount}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
        action={
          <Link
            href="/admin/items/new"
            className="inline-block rounded-full bg-accent px-4 py-2.5 text-[13px] font-semibold text-[#FDFAF3] no-underline transition-colors hover:bg-ink lg:px-5 lg:text-[13.5px]"
          >
            + New item
          </Link>
        }
      >
        <LabeledSelect
          label="Category"
          value={filters.category}
          active={filters.category !== "all"}
          onChange={(v) => setFilter("category", v)}
        >
          <option value="all">All</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Availability"
          value={filters.availability}
          active={filters.availability !== "all"}
          onChange={(v) => setFilter("availability", v)}
        >
          {AVAILABILITY_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </LabeledSelect>
      </FilterBar>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title="No matching items"
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
                    <th className="px-6 py-3.5 font-semibold">Item</th>
                    <th className="px-4 py-3.5 font-semibold">Category</th>
                    <th className="px-4 py-3.5 font-semibold">Price</th>
                    <th className="px-4 py-3.5 font-semibold">Stock</th>
                    <th className="px-4 py-3.5 font-semibold">Lead time</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells widths={["w-44", "w-20", "w-20", "w-24", "w-20", "w-24", "w-6"]} />
                  ) : (
                    rows.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/admin/items/${p.id}`)}
                      className="cursor-pointer border-b border-ink/[0.08] transition-colors last:border-0 hover:bg-accent/[0.05]"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt=""
                              width={44}
                              height={44}
                              className="h-11 w-11 flex-none rounded-[10px] object-cover"
                            />
                          ) : (
                            <span className="grid h-11 w-11 flex-none place-items-center rounded-[10px] bg-ink/[0.06] text-[15px]">
                              🍞
                            </span>
                          )}
                          <div className="min-w-0">
                            <div title={p.name} className="max-w-[170px] truncate sm:max-w-[260px] text-[15px] font-semibold text-ink">
                              {p.name}
                            </div>
                            <div className="max-w-[170px] truncate sm:max-w-[260px] mt-0.5 text-[12.5px] text-ink/55">
                              {p.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-ink/70">
                        {PRODUCT_CATEGORIES.find((c) => c.id === p.category)?.label ??
                          p.category}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[14px] font-medium">
                        {formatMoney(p.price, p.currency)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-ink/70">
                        {p.stock === null ? "Made to order" : p.stock}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[14px] text-ink/70">
                        {p.leadTimeDays === 0
                          ? "Same day"
                          : `${String(p.leadTimeDays)} day${p.leadTimeDays === 1 ? "" : "s"}`}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(p.id, p.name, !p.isAvailable);
                          }}
                          className="cursor-pointer"
                          title={p.isAvailable ? "Take off sale" : "Put on sale"}
                        >
                          <StatusBadge
                            status={p.isAvailable ? "PUBLISHED" : "DRAFT"}
                            label={p.isAvailable ? "Available" : "Unavailable"}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-3.5 text-right text-ink/40">→</td>
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
