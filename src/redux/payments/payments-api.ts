import { apiSlice } from "../api-slice";
import type { ApiEnvelope } from "@/types/api";
import { toQueryString } from "@/lib/to-query-string";
import type { IPayment } from "@/types/application.types";
import type {
  ILedgerListQuery,
  ILedgerListResponse,
  ILedgerPayment,
} from "@/types/payment.types";

/** The unified admin payments ledger - every payment across shop orders and
 * bake-school applications, with owner references. */
export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<ILedgerListResponse, ILedgerListQuery | void>({
      query: (params) => ({
        url: `admin/payments${toQueryString(params ?? {})}`,
        method: "GET",
      }),
      providesTags: ["Payments"],
    }),

    getPaymentById: builder.query<
      ApiEnvelope<ILedgerPayment>,
      string
    >({
      query: (id) => ({ url: `admin/payments/${id}`, method: "GET" }),
      // The list tag is enough: refunds invalidate "Payments", which refetches
      // this detail too.
      providesTags: ["Payments"],
    }),

    /**
     * The one refund/reverse mutation for both ledgers (`POST
     * admin/payments/:id/refund`). Pass the owning `orderId`/`applicationId`
     * when it is known - detail pages provide only per-id tags, so without it
     * an open order/application detail would keep showing the stale balance.
     */
    refundPayment: builder.mutation<
      ApiEnvelope<IPayment>,
      {
        paymentId: string;
        orderId?: string;
        applicationId?: string;
        reason?: string;
      }
    >({
      query: ({ paymentId, reason }) => ({
        url: `admin/payments/${paymentId}/refund`,
        method: "POST",
        body: { reason },
      }),
      // "Customers": a reversal moves the owning customer's totalSpent.
      invalidatesTags: (_r, _e, { orderId, applicationId }) => [
        "Payments",
        "Orders",
        "Applications",
        "DashboardStats",
        "Customers",
        ...(orderId ? [{ type: "Order" as const, id: orderId }] : []),
        ...(applicationId
          ? [{ type: "Application" as const, id: applicationId }]
          : []),
      ],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useRefundPaymentMutation,
} = paymentsApi;
