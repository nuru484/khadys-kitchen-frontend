import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type { IMessageResponse } from "@/types/auth.types";
import type {
  IStudentListQuery,
  IStudentListResponse,
  IStudentPaymentsResponse,
  IStudentResponse,
} from "@/types/student.types";

export interface IStudentCreateInput {
  trainingId: string;
  fullName: string;
  phone: string;
  email?: string;
  location?: string;
  needsHostel?: boolean;
  notes?: string;
}

export interface IStudentUpdateInput {
  fullName?: string;
  phone?: string;
  email?: string | null;
  location?: string | null;
  notes?: string | null;
}

/** Students (admitted applicants) — list/detail/CRUD, lifecycle (suspend /
 * activate / graduate), and payment details. */
export const studentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<IStudentListResponse, IStudentListQuery | void>({
      query: (params) => ({
        url: `admin/students${toQueryString(params ?? {})}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Student" as const, id })),
              "Students",
            ]
          : ["Students"],
    }),

    getStudentById: builder.query<IStudentResponse, string>({
      query: (id) => ({ url: `admin/students/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Student", id }],
    }),

    getStudentPayments: builder.query<IStudentPaymentsResponse, string>({
      query: (id) => ({ url: `admin/students/${id}/payments`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "Student", id }, "Payments"],
    }),

    createStudent: builder.mutation<IStudentResponse, IStudentCreateInput>({
      query: (body) => ({ url: "admin/students", method: "POST", body }),
      invalidatesTags: ["Students", "Trainings"],
    }),

    updateStudent: builder.mutation<
      IStudentResponse,
      { id: string; body: IStudentUpdateInput }
    >({
      query: ({ id, body }) => ({
        url: `admin/students/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Student", id }, "Students"],
    }),

    setStudentStatus: builder.mutation<
      IStudentResponse,
      { id: string; action: "suspend" | "activate" | "graduate" }
    >({
      query: ({ id, action }) => ({
        url: `admin/students/${id}/${action}`,
        method: "POST",
      }),
      async onQueryStarted({ id, action }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          studentsApi.util.updateQueryData("getStudentById", id, (draft) => {
            draft.data.status =
              action === "suspend"
                ? "SUSPENDED"
                : action === "graduate"
                  ? "GRADUATED"
                  : "ACTIVE";
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: "Student", id }, "Students"],
    }),

    deleteStudent: builder.mutation<IMessageResponse, string>({
      query: (id) => ({ url: `admin/students/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Student", id },
        "Students",
        "Trainings",
      ],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useGetStudentPaymentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useSetStudentStatusMutation,
  useDeleteStudentMutation,
} = studentsApi;
