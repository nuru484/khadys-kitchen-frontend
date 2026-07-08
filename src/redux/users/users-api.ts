import { apiSlice } from "../api-slice";
import { toQueryString } from "@/lib/to-query-string";
import type { IMessageResponse } from "@/types/auth.types";
import type {
  ITeamUserListQuery,
  ITeamUserListResponse,
  ITeamUserResponse,
  UserRole,
} from "@/types/user.types";

export interface ITeamUserCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface ITeamUserUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  /** null clears the existing photo; a new file is sent separately (multipart). */
  profilePicture?: string | null;
}

/** A new photo travels WITH the save as multipart (a `payload` JSON part + the
 * `profilePicture` file the backend expects); without one we send plain JSON. */
const toMultipart = (body: ITeamUserUpdateInput, photo: File): FormData => {
  const form = new FormData();
  form.append("payload", JSON.stringify(body));
  form.append("profilePicture", photo);
  return form;
};

/** Team management (/admin/users) — list, create, edit, role changes and
 * activate/deactivate/delete. Role changes are super-admin only; the backend
 * enforces the real rank rules (this UI only hides what would be refused). */
export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<ITeamUserListResponse, ITeamUserListQuery | void>({
      query: (params) => ({
        url: `admin/users${toQueryString(params ?? {})}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "User" as const, id })),
              "Users",
            ]
          : ["Users"],
    }),

    getUserById: builder.query<ITeamUserResponse, string>({
      query: (id) => ({ url: `admin/users/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<ITeamUserResponse, ITeamUserCreateInput>({
      query: (body) => ({ url: "admin/users", method: "POST", body }),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation<
      ITeamUserResponse,
      { id: string; body: ITeamUserUpdateInput; photo?: File }
    >({
      query: ({ id, body, photo }) => ({
        url: `admin/users/${id}`,
        method: "PATCH",
        body: photo ? toMultipart(body, photo) : body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "User", id }, "Users"],
    }),

    changeUserRole: builder.mutation<
      ITeamUserResponse,
      { id: string; role: UserRole }
    >({
      query: ({ id, role }) => ({
        url: `admin/users/${id}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "User", id }, "Users"],
    }),

    setUserActive: builder.mutation<
      ITeamUserResponse,
      { id: string; active: boolean }
    >({
      query: ({ id, active }) => ({
        url: `admin/users/${id}/${active ? "activate" : "deactivate"}`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "User", id }, "Users"],
    }),

    deleteUser: builder.mutation<IMessageResponse, string>({
      query: (id) => ({ url: `admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [{ type: "User", id }, "Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserRoleMutation,
  useSetUserActiveMutation,
  useDeleteUserMutation,
} = usersApi;
