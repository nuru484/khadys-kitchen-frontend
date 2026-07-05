"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import {
  categoryFilters,
  products,
  type Category,
  type SortKey,
} from "@/lib/shop-data";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price · low to high" },
  { value: "price-desc", label: "Price · high to low" },
  { value: "name", label: "Name · A–Z" },
];

export function ShopBrowser() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | Category>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter(
      (p) =>
        (cat === "all" || p.cat === cat) &&
        (!q ||
          `${p.name} ${p.shortDesc} ${p.desc}`.toLowerCase().includes(q)),
    );
    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [query, cat, sort]);

  const clearFilters = () => {
    setQuery("");
    setCat("all");
    setSort("featured");
  };

  return (
    <>
      <div className="mb-[clamp(26px,3.5vw,38px)] flex flex-wrap items-center gap-x-[18px] gap-y-3.5 border-y border-ink/15 py-[18px]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the bakes…"
          aria-label="Search the bakes"
          className="max-w-[320px] flex-[1_1_220px] rounded-full border-[1.5px] border-ink/20 bg-transparent px-[18px] py-3 font-sans text-[15px] text-ink outline-none transition-colors focus:border-accent"
        />
        <div className="flex flex-[2_1_auto] flex-wrap gap-2">
          {categoryFilters.map((c) => {
            const on = cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => setCat(c.id)}
                className={cn(
                  "cursor-pointer rounded-full border-[1.5px] px-[18px] py-2.5 font-sans text-[13.5px] font-semibold tracking-[0.04em] transition-colors",
                  on
                    ? "border-accent bg-accent text-[#FDFAF3]"
                    : "border-ink/20 bg-transparent text-ink hover:border-ink/40",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink/60">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="cursor-pointer rounded-[12px] border-[1.5px] border-ink/20 bg-transparent px-3.5 py-[11px] font-sans text-[14.5px] text-ink outline-none focus:border-accent"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {list.length === 0 ? (
        <EmptyState
          glyph="⌕"
          tone="neutral"
          title={`Nothing matches “${query}”.`}
          description="Try another word, or clear the filters."
          action={{ label: "Clear search & filters", variant: "dark", onClick: clearFilters }}
          className="my-2"
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] gap-[clamp(20px,3vw,32px)]">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
