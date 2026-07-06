/**
 * Bake School applications + the pay-now/pay-later flow, mirroring the backend
 * `apply` / payment contracts.
 */
export interface IApplyInput {
  trainingId: string;
  fullName: string;
  phone: string;
  email?: string;
  location?: string;
  needsHostel: boolean;
  message?: string;
  /** When true (and a balance is owed), the backend returns a Paystack URL. */
  payNow?: boolean;
}

export interface IFeeLine {
  id: string;
  name: string;
  amount: number;
  kind: string;
}

export interface IApplication {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string | null;
  location: string | null;
  message?: string | null;
  needsHostel: boolean;
  amountDue: number;
  amountPaid: number;
  balance: number;
  currency: string;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  status: string;
  source?: string;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  // Present on the admin detail view.
  feeLines?: IFeeLine[];
  payments?: IPayment[];
  student?: { id: string; code: string; status: string } | null;
  training?: { id: string; name: string; numeral: string | null; slug: string };
}

export interface IApplicationListResponse {
  message: string;
  data: IApplication[];
  meta: import("./training.types").IPaginationMeta;
}

export interface IApplicationResponse {
  message: string;
  data: IApplication;
}

export interface IApplicationListQuery {
  page?: number;
  limit?: number;
  trainingId?: string;
  status?: string;
  paymentStatus?: string;
  search?: string;
}

/** `POST /applications` — application created; `authorizationUrl` present when paying now. */
export interface IApplyResponse {
  message: string;
  data: {
    application: IApplication;
    authorizationUrl?: string;
    code: string;
  };
}

export interface IPayment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REVERSED";
  reference: string;
  paidAt: string | null;
}

/** `POST /payments/verify`. */
export interface IVerifyResponse {
  message: string;
  data: IPayment;
}

/** `GET /admin/applications/:id/payments`. */
export interface IPaymentsListResponse {
  message: string;
  data: IPayment[];
}

export interface IRecordPaymentInput {
  amount: number;
  method: "CASH" | "MOMO" | "BANK_TRANSFER" | "OTHER";
  note?: string;
  paidAt?: string;
}
