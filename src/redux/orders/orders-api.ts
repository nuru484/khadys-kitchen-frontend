import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type { IPayment, IRecordPaymentInput } from "@/types/application.types";
import type {
  IOrderListQuery,
  IOrderListResponse,
  IOrderResponse,
  IPlaceOrderInput,
  IPlaceOrderResponse,
} from "@/types/order.types";

/** Shop orders — the public guest checkout/tracking/pay surface and the admin
 * list/detail/lifecycle/payments surface. Amounts are pesewas. */
export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Public ────────────────────────────────────────────────
    placeOrder: builder.mutation<
      IPlaceOrderResponse,
      { body: IPlaceOrderInput; idempotencyKey?: string }
    >({
      query: ({ body, idempotencyKey }) => ({
        url: "orders",
        method: "POST",
        body,
        headers: idempotencyKey
          ? { "Idempotency-Key": idempotencyKey }
          : undefined,
      }),
      invalidatesTags: ["Orders", "Products"],
    }),

    trackOrder: builder.query<IOrderResponse, string>({
      query: (code) => ({ url: `orders/${code}`, method: "GET" }),
      providesTags: (_r, _e, code) => [{ type: "Order", id: code }],
    }),

    payOrderByCode: builder.mutation<
      { message: string; data: { authorizationUrl: string; balance: number } },
      { code: string; email?: string }
    >({
      query: ({ code, email }) => ({
        url: `orders/${code}/pay`,
        method: "POST",
        body: { email },
      }),
    }),

    // ── Admin ─────────────────────────────────────────────────
    getOrders: builder.query<IOrderListResponse, IOrderListQuery | void>({
      query: (params) => ({
        url: `admin/orders${toQueryString(params ?? {})}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Order" as const, id })),
              "Orders",
            ]
          : ["Orders"],
    }),

    getOrderById: builder.query<IOrderResponse, string>({
      query: (id) => ({ url: `admin/orders/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Order", id }],
    }),

    /** Walk-in order recorded at the counter. */
    createOrder: builder.mutation<IOrderResponse, IPlaceOrderInput>({
      query: (body) => ({ url: "admin/orders", method: "POST", body }),
      invalidatesTags: ["Orders", "Products", "DashboardStats"],
    }),

    setOrderStatus: builder.mutation<
      IOrderResponse,
      { id: string; action: "confirm" | "ready" | "collect" | "cancel" }
    >({
      query: ({ id, action }) => ({
        url: `admin/orders/${id}/${action}`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Order", id },
        "Orders",
        "Products",
        "DashboardStats",
      ],
    }),

    getOrderPayments: builder.query<
      { message: string; data: IPayment[] },
      string
    >({
      query: (id) => ({ url: `admin/orders/${id}/payments`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Order", id }, "Payments"],
    }),

    recordOrderPayment: builder.mutation<
      { message: string; data: IPayment },
      { id: string; body: IRecordPaymentInput }
    >({
      query: ({ id, body }) => ({
        url: `admin/orders/${id}/payments`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Order", id },
        "Orders",
        "Payments",
        "DashboardStats",
      ],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useTrackOrderQuery,
  usePayOrderByCodeMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useSetOrderStatusMutation,
  useGetOrderPaymentsQuery,
  useRecordOrderPaymentMutation,
} = ordersApi;
