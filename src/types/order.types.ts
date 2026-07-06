import type { IPaginationMeta } from "./training.types";

/** A shop order, mirroring the backend `toOrderDTO`. Amounts are pesewas. */
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY"
  | "COLLECTED"
  | "CANCELLED";

export type OrderPaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface IOrderItem {
  id: string;
  productId: string | null;
  name: string;
  unit: string;
  unitAmount: number;
  quantity: number;
  lineTotal: number;
}

export interface IOrder {
  id: string;
  code: string;
  customerId?: string;
  fullName: string;
  phone: string;
  email: string | null;
  status: OrderStatus;
  source: "PUBLIC" | "ADMIN";
  paymentStatus: OrderPaymentStatus;
  currency: string;
  subtotal: number;
  total: number;
  amountPaid: number;
  balance: number;
  pickupDate: string | null;
  note: string | null;
  confirmedAt: string | null;
  readyAt: string | null;
  collectedAt: string | null;
  cancelledAt: string | null;
  items: IOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IOrderResponse {
  message: string;
  data: IOrder;
}

export interface IOrderListResponse {
  message: string;
  data: IOrder[];
  meta: IPaginationMeta;
}

/** POST /orders response — code + optional Paystack redirect. */
export interface IPlaceOrderResponse {
  message: string;
  data: {
    code: string;
    order: IOrder;
    authorizationUrl?: string;
  };
}

/** Mirrors the backend `placeOrderSchema` (order-validation.ts). */
export interface IPlaceOrderInput {
  fullName: string;
  phone: string;
  email?: string;
  items: { productId: string; quantity: number }[];
  pickupDate?: string;
  note?: string;
  payNow?: boolean;
  /** Honeypot — must stay empty. */
  website?: string;
}

export interface IOrderListQuery {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  customerId?: string;
  search?: string;
}
