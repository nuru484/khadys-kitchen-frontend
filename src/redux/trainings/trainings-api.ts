import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type { IMessageResponse } from "@/types/auth.types";
import type {
  IFeeItem,
  IFeeItemInput,
  ITraining,
  ITrainingInput,
  ITrainingListQuery,
  ITrainingListResponse,
  ITrainingResponse,
} from "@/types/training.types";

/**
 * Trainings — public (`getCurrentTraining`) + the admin console CRUD, all
 * injected into the single `apiSlice`. Tag-based cache invalidation keeps the
 * list + detail fresh after any mutation (no manual refetch).
 */
export const trainingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentTraining: builder.query<ITraining | null, void>({
      query: () => ({ url: "trainings?limit=1", method: "GET" }),
      transformResponse: (res: ITrainingListResponse) => res.data[0] ?? null,
      providesTags: ["Trainings"],
    }),

    // ── Admin ───────────────────────────────────────────────────────────────
    getTrainings: builder.query<ITrainingListResponse, ITrainingListQuery | void>(
      {
        query: (params) => ({
          url: `admin/trainings${toQueryString(params ?? {})}`,
          method: "GET",
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.data.map(({ id }) => ({
                  type: "Training" as const,
                  id,
                })),
                "Trainings",
              ]
            : ["Trainings"],
      },
    ),

    getTrainingById: builder.query<ITraining, string>({
      query: (id) => ({ url: `admin/trainings/${id}`, method: "GET" }),
      transformResponse: (res: ITrainingResponse) => res.data,
      providesTags: (_r, _e, id) => [{ type: "Training", id }],
    }),

    createTraining: builder.mutation<ITrainingResponse, ITrainingInput>({
      query: (body) => ({ url: "admin/trainings", method: "POST", body }),
      invalidatesTags: ["Trainings"],
    }),

    // Uploads a single image (multipart) and returns its hosted URL. The create/
    // update endpoints stay JSON — the form uploads the cover here first.
    uploadTrainingImage: builder.mutation<
      { message: string; data: { url: string } },
      FormData
    >({
      query: (body) => ({ url: "admin/uploads/image", method: "POST", body }),
    }),

    updateTraining: builder.mutation<
      ITrainingResponse,
      { id: string; body: Partial<ITrainingInput> }
    >({
      query: ({ id, body }) => ({
        url: `admin/trainings/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Training", id }, "Trainings"],
    }),

    publishTraining: builder.mutation<ITrainingResponse, string>({
      query: (id) => ({ url: `admin/trainings/${id}/publish`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Training", id }, "Trainings"],
    }),

    unpublishTraining: builder.mutation<ITrainingResponse, string>({
      query: (id) => ({ url: `admin/trainings/${id}/unpublish`, method: "POST" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Training", id }, "Trainings"],
    }),

    deleteTraining: builder.mutation<IMessageResponse, string>({
      query: (id) => ({ url: `admin/trainings/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "Training", id }, "Trainings"],
    }),

    // Fee items on an existing training (the create form sends feeItems inline).
    addFeeItem: builder.mutation<
      { message: string; data: IFeeItem },
      { trainingId: string; body: IFeeItemInput }
    >({
      query: ({ trainingId, body }) => ({
        url: `admin/trainings/${trainingId}/fee-items`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { trainingId }) => [
        { type: "Training", id: trainingId },
      ],
    }),

    updateFeeItem: builder.mutation<
      { message: string; data: IFeeItem },
      { trainingId: string; feeItemId: string; body: Partial<IFeeItemInput> }
    >({
      query: ({ trainingId, feeItemId, body }) => ({
        url: `admin/trainings/${trainingId}/fee-items/${feeItemId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { trainingId }) => [
        { type: "Training", id: trainingId },
      ],
    }),

    removeFeeItem: builder.mutation<
      IMessageResponse,
      { trainingId: string; feeItemId: string }
    >({
      query: ({ trainingId, feeItemId }) => ({
        url: `admin/trainings/${trainingId}/fee-items/${feeItemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { trainingId }) => [
        { type: "Training", id: trainingId },
      ],
    }),
  }),
});

export const {
  useGetCurrentTrainingQuery,
  useGetTrainingsQuery,
  useGetTrainingByIdQuery,
  useCreateTrainingMutation,
  useUploadTrainingImageMutation,
  useUpdateTrainingMutation,
  usePublishTrainingMutation,
  useUnpublishTrainingMutation,
  useDeleteTrainingMutation,
  useAddFeeItemMutation,
  useUpdateFeeItemMutation,
  useRemoveFeeItemMutation,
} = trainingsApi;
