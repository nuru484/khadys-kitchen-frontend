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
  page?: number;
  limit?: number;
  category?: string;
  isAvailable?: boolean;
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
  image?: string;
  isAvailable?: boolean;
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
