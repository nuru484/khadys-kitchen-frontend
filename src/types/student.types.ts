import type { IPaginationMeta } from "./training.types";

/** A Bake School student (an admitted applicant), mirroring the backend toStudentDTO. */
export interface IStudent {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string | null;
  location: string | null;
  notes: string | null;
  status: "ACTIVE" | "SUSPENDED" | "GRADUATED" | "WITHDRAWN";
  enrolledAt: string;
  graduatedAt: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
  training?: { id: string; name: string; numeral: string | null; slug: string };
}

export interface IStudentListResponse {
  message: string;
  data: IStudent[];
  meta: IPaginationMeta;
}

export interface IStudentResponse {
  message: string;
  data: IStudent;
}

export interface IStudentPaymentSummary {
  amountDue: number;
  amountPaid: number;
  balance: number;
  currency: string;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
}

export interface IStudentPaymentsResponse {
  message: string;
  data: {
    summary: IStudentPaymentSummary;
    payments: import("./application.types").IPayment[];
  };
}

export interface IStudentListQuery {
  page?: number;
  limit?: number;
  trainingId?: string;
  status?: string;
  search?: string;
}
