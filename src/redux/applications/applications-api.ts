import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type {
  IApplicationListQuery,
  IApplicationListResponse,
  IApplicationResponse,
  IApplyInput,
  IApplyResponse,
  IPayment,
  IPaymentsListResponse,
  IRecordPaymentInput,
  IVerifyResponse,
} from "@/types/application.types";

/**
 * Applications + payments — the public apply/pay flow and the admin console
 * (list, detail, status transitions, payment ledger, reminders). Admitting an
 * applicant creates a Student server-side, so status changes also invalidate
 * Students + Trainings (counts).
 */
export const applicationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Public ──────────────────────────────────────────────────────────────
    createApplication: builder.mutation<IApplyResponse, IApplyInput>({
      query: (body) => ({ url: "applications", method: "POST", body }),
      invalidatesTags: ["Applications"],
    }),

    verifyPayment: builder.mutation<IVerifyResponse, { reference: string }>({
      query: (body) => ({ url: "payments/verify", method: "POST", body }),
    }),

    // ── Admin ───────────────────────────────────────────────────────────────
    getApplications: builder.query<
      IApplicationListResponse,
      IApplicationListQuery | void
    >({
      query: (params) => ({
        url: `admin/applications${toQueryString(params ?? {})}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Application" as const,
                id,
              })),
              "Applications",
            ]
          : ["Applications"],
    }),

    getApplicationById: builder.query<IApplicationResponse, string>({
      query: (id) => ({ url: `admin/applications/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Application", id }],
    }),

    updateApplicationStatus: builder.mutation<
      IApplicationResponse,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `admin/applications/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Application", id },
        "Applications",
        "Students",
        "Trainings",
      ],
    }),

    getApplicationPayments: builder.query<IPaymentsListResponse, string>({
      query: (id) => ({ url: `admin/applications/${id}/payments`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Application", id }, "Payments"],
    }),

    recordPayment: builder.mutation<
      { message: string; data: IPayment },
      { id: string; body: IRecordPaymentInput }
    >({
      query: ({ id, body }) => ({
        url: `admin/applications/${id}/payments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Application", id },
        "Applications",
        "Payments",
      ],
    }),

    remindApplicant: builder.mutation<
      { message: string; data: { balance: number; code: string } },
      string
    >({
      query: (id) => ({ url: `admin/applications/${id}/remind`, method: "POST" }),
    }),

    refundPayment: builder.mutation<
      { message: string; data: IPayment },
      { paymentId: string; applicationId: string; reason?: string }
    >({
      query: ({ paymentId, reason }) => ({
        url: `admin/payments/${paymentId}/refund`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: "Application", id: applicationId },
        "Applications",
        "Payments",
      ],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useVerifyPaymentMutation,
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useUpdateApplicationStatusMutation,
  useGetApplicationPaymentsQuery,
  useRecordPaymentMutation,
  useRemindApplicantMutation,
  useRefundPaymentMutation,
} = applicationsApi;
