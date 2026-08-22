import { apiSlice } from "../api-slice";
import type { ApiEnvelope } from "@/types/api";
import { toMultipart } from "@/lib/to-multipart";
import { toQueryString } from "@/lib/to-query-string";
import type { IMessageResponse } from "@/types/auth.types";
import type {
  IFeeItem,
  IFeeItemInput,
  ITrainingInput,
  ITrainingListQuery,
  ITrainingListResponse,
  ITrainingResponse,
} from "@/types/training.types";

/** Files an admin selects on the form. Present ones travel WITH the save as
 * multipart (a `payload` JSON part + the file fields the backend expects). */
export type TrainingFiles = {
  coverImage?: File;
  prospectus?: File;
};

const hasFile = (f?: TrainingFiles) => Boolean(f?.coverImage || f?.prospectus);

/**
 * Trainings, injected into the single `apiSlice`. The public surface lists
 * published classes; the admin surface is full CRUD (with multipart cover
 * image + prospectus uploads). Tag-based cache invalidation keeps list + detail
 * fresh after any mutation (no manual refetch).
 */
export const trainingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Public ──────────────────────────────────────────────────────────────
    getPublicTrainings: builder.query<
      ITrainingListResponse,
      ITrainingListQuery | void
    >({
      query: (params) => ({
        url: `trainings${toQueryString(params ?? {})}`,
        method: "GET",
      }),
      providesTags: ["Trainings"],
    }),

    // Returns the standard `{ message, data }` envelope like every other
    // slice - consumers read `data.data`.
    getPublicTrainingBySlug: builder.query<ITrainingResponse, string>({
      query: (slug) => ({ url: `trainings/${slug}`, method: "GET" }),
      // Slug-keyed detail also carries the list tag so list-level
      // invalidations (publish/edit) refresh it too.
      providesTags: (_r, _e, slug) => [{ type: "Training", id: slug }, "Trainings"],
    }),

    // ── Admin: trainings ────────────────────────────────────────────────────
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

    getTrainingById: builder.query<ITrainingResponse, string>({
      query: (id) => ({ url: `admin/trainings/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Training", id }],
    }),

    createTraining: builder.mutation<
      ITrainingResponse,
      { body: ITrainingInput; files?: TrainingFiles }
    >({
      query: ({ body, files }) => ({
        url: "admin/trainings",
        method: "POST",
        body: hasFile(files) ? toMultipart(body, files!) : body,
      }),
      invalidatesTags: ["Trainings"],
    }),

    updateTraining: builder.mutation<
      ITrainingResponse,
      { id: string; body: Partial<ITrainingInput>; files?: TrainingFiles }
    >({
      query: ({ id, body, files }) => ({
        url: `admin/trainings/${id}`,
        method: "PATCH",
        body: hasFile(files) ? toMultipart(body, files!) : body,
      }),
      // DashboardStats: edits can change the open cohort's capacity card.
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Training", id },
        "Trainings",
        "DashboardStats",
      ],
    }),

    publishTraining: builder.mutation<ITrainingResponse, string>({
      query: (id) => ({ url: `admin/trainings/${id}/publish`, method: "POST" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          trainingsApi.util.updateQueryData("getTrainingById", id, (draft) => {
            draft.data.isPublished = true;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_r, _e, id) => [
        { type: "Training", id },
        "Trainings",
        "DashboardStats",
      ],
    }),

    unpublishTraining: builder.mutation<ITrainingResponse, string>({
      query: (id) => ({ url: `admin/trainings/${id}/unpublish`, method: "POST" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          trainingsApi.util.updateQueryData("getTrainingById", id, (draft) => {
            draft.data.isPublished = false;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_r, _e, id) => [
        { type: "Training", id },
        "Trainings",
        "DashboardStats",
      ],
    }),

    deleteTraining: builder.mutation<IMessageResponse, string>({
      query: (id) => ({ url: `admin/trainings/${id}`, method: "DELETE" }),
      // DashboardStats: deleting the open cohort clears its dashboard card.
      invalidatesTags: (_r, _e, id) => [
        { type: "Training", id },
        "Trainings",
        "DashboardStats",
      ],
    }),

    // Fee items on an existing training (the create form sends feeItems inline).
    addFeeItem: builder.mutation<
      ApiEnvelope<IFeeItem>,
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
      ApiEnvelope<IFeeItem>,
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
  useGetPublicTrainingsQuery,
  useGetPublicTrainingBySlugQuery,
  useGetTrainingsQuery,
  useGetTrainingByIdQuery,
  useCreateTrainingMutation,
  useUpdateTrainingMutation,
  usePublishTrainingMutation,
  useUnpublishTrainingMutation,
  useDeleteTrainingMutation,
  useAddFeeItemMutation,
  useUpdateFeeItemMutation,
  useRemoveFeeItemMutation,
} = trainingsApi;
