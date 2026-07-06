import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type { IMessageResponse } from "@/types/auth.types";
import type {
  IProductInput,
  IProductListQuery,
  IProductListResponse,
  IProductResponse,
} from "@/types/product.types";

/** The shop catalogue — public browse (available items only) and admin CRUD
 * with the availability toggle. Prices are pesewas. */
export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Public ────────────────────────────────────────────────
    getPublicProducts: builder.query<
      IProductListResponse,
      IProductListQuery | void
    >({
      query: (params) => ({
        url: `products${toQueryString(params ?? {})}`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),

    getPublicProductBySlug: builder.query<IProductResponse, string>({
      query: (slug) => ({ url: `products/${slug}`, method: "GET" }),
      providesTags: (_r, _e, slug) => [{ type: "Product", id: slug }],
    }),

    // ── Admin ─────────────────────────────────────────────────
    getProducts: builder.query<IProductListResponse, IProductListQuery | void>({
      query: (params) => ({
        url: `admin/products${toQueryString(params ?? {})}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Product" as const, id })),
              "Products",
            ]
          : ["Products"],
    }),

    getProductById: builder.query<IProductResponse, string>({
      query: (id) => ({ url: `admin/products/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation<IProductResponse, IProductInput>({
      query: (body) => ({ url: "admin/products", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<
      IProductResponse,
      { id: string; body: Partial<IProductInput> }
    >({
      query: ({ id, body }) => ({
        url: `admin/products/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Product", id }, "Products"],
    }),

    setProductAvailability: builder.mutation<
      IProductResponse,
      { id: string; isAvailable: boolean }
    >({
      query: ({ id, isAvailable }) => ({
        url: `admin/products/${id}/availability`,
        method: "POST",
        body: { isAvailable },
      }),
      // Optimistically flip the toggle on the detail cache; roll back on error.
      async onQueryStarted({ id, isAvailable }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          productsApi.util.updateQueryData("getProductById", id, (draft) => {
            draft.data.isAvailable = isAvailable;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: "Product", id }, "Products"],
    }),

    deleteProduct: builder.mutation<IMessageResponse, string>({
      query: (id) => ({ url: `admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Product", id }, "Products"],
    }),
  }),
});

export const {
  useGetPublicProductsQuery,
  useGetPublicProductBySlugQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useSetProductAvailabilityMutation,
  useDeleteProductMutation,
} = productsApi;
