import type { IPaginationMeta } from "./training.types";

/** A shop product, mirroring the backend `toProductDTO`. Prices are minor
 * units (pesewas); `stock` null = made to order (no cap). */
export type ProductCategory = "BREAD" | "PASTRY" | "CAKE" | "BOFROT" | "SAVOURY";

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  description: string | null;
  price: number;
  currency: string;
  unit: string;
  leadTimeDays: number;
  image: string | null;
  isAvailable: boolean;
  /** Shows in the home page's "This morning's bakes" section. */
  isFeatured: boolean;
  stock: number | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProductResponse {
  message: string;
  data: IProduct;
}

export interface IProductListResponse {
  message: string;
  data: IProduct[];
  meta: IPaginationMeta;
}

export interface IProductListQuery {
  /** Created-date window, YYYY-MM-DD (inclusive). */
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  category?: string;
  isAvailable?: boolean;
  /** `true` = only home-page-featured items. */
  featured?: boolean;
  search?: string;
}

/** Mirrors the backend `createProductSchema` (product-validation.ts). */
export interface IProductInput {
  name: string;
  category: ProductCategory;
  description?: string;
  price: number;
  unit?: string;
  leadTimeDays?: number;
  /**
   * Clears the existing photo on update. The backend never accepts an image
   * URL from the client — a new photo travels only as the multipart file.
   */
  removeImage?: boolean;
  isAvailable?: boolean;
  isFeatured?: boolean;
  stock?: number | null;
  position?: number;
}

export const PRODUCT_CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: "BREAD", label: "Breads" },
  { id: "PASTRY", label: "Pastries" },
  { id: "CAKE", label: "Cakes" },
  { id: "BOFROT", label: "Bofrot" },
  { id: "SAVOURY", label: "Savoury" },
];
