/**
 * Shop browse/display helpers. The catalogue itself now lives in the backend
 * (`GET /products` via products-api); what remains here is pure UI vocabulary —
 * category filters, sorting, price bands and lead-time labels.
 */
import type { IProduct, ProductCategory } from "@/types/product.types";

export const FALLBACK_PRODUCT_IMG =
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&q=80&auto=format&fit=crop";

export const categoryFilters: {
  id: "all" | ProductCategory;
  label: string;
}[] = [
  { id: "all", label: "All bakes" },
  { id: "BREAD", label: "Breads" },
  { id: "PASTRY", label: "Pastries" },
  { id: "CAKE", label: "Cakes" },
  { id: "BOFROT", label: "Bofrot" },
  { id: "SAVOURY", label: "Savoury" },
];

export const categoryLabel = (category: ProductCategory): string =>
  ({
    BOFROT: "Bofrot",
    BREAD: "Bread",
    CAKE: "Cake",
    PASTRY: "Pastry",
    SAVOURY: "Savoury",
  })[category];

export type SortKey =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "fastest"
  | "name";

export const sortOptions: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price · low to high" },
  { id: "price-desc", label: "Price · high to low" },
  { id: "fastest", label: "Fastest ready" },
  { id: "name", label: "Name · A-Z" },
];

export type PriceBand = "any" | "u50" | "50-150" | "150-400" | "400+";

export const priceBands: { id: PriceBand; label: string }[] = [
  { id: "any", label: "Any price" },
  { id: "u50", label: "Under 50" },
  { id: "50-150", label: "50 - 150" },
  { id: "150-400", label: "150 - 400" },
  { id: "400+", label: "400 +" },
];

/** Whether a price (in pesewas) falls inside the given GHS band. */
export const matchesPriceBand = (price: number, band: PriceBand) => {
  const ghs = price / 100;
  switch (band) {
    case "any":
      return true;
    case "u50":
      return ghs < 50;
    case "50-150":
      return ghs >= 50 && ghs <= 150;
    case "150-400":
      return ghs > 150 && ghs <= 400;
    case "400+":
      return ghs > 400;
  }
};

/** ISO (yyyy-mm-dd) date `days` from now, used for lead-time maths. */
export const isoDaysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/**
 * Can this bake be ready on or before `byDate` (yyyy-mm-dd)? An empty date
 * means "no constraint", so everything qualifies.
 */
export const readyBy = (leadTimeDays: number, byDate: string) =>
  !byDate || isoDaysFromNow(leadTimeDays) <= byDate;

/** "ready today" / "ready next morning" / "needs N days". */
export const leadLabel = (leadTimeDays: number): string => {
  if (leadTimeDays <= 0) return "ready today";
  if (leadTimeDays === 1) return "ready next morning";
  return `needs ${leadTimeDays} days`;
};

/** "from GHS 350.00" when the unit says so (e.g. "Made to order · from"). */
export const listPriceLabel = (p: Pick<IProduct, "price" | "unit">): string => {
  const price = `GHS ${(p.price / 100).toLocaleString("en-GH", {
    maximumFractionDigits: 2,
    minimumFractionDigits: p.price % 100 === 0 ? 0 : 2,
  })}`;
  return p.unit.toLowerCase().includes("from") ? `from ${price}` : price;
};
