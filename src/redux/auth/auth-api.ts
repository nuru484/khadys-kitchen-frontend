import { apiSlice } from "../api-slice";
import { userLoggedIn, userLoggedOut } from "./auth-slice";
import type {
  ILoginResponse,
  IUserLoginInput,
  ITwoFactorVerifyInput,
  IForgotPasswordInput,
  IResetPasswordInput,
  IMessageResponse,
} from "@/types/auth.types";
import { isTwoFactorChallenge } from "@/types/auth.types";
import type { IUserResponse } from "@/types/user.types";

/**
 * Auth endpoints, injected into the single `apiSlice`. These mirror the
 * Khady's Kitchen backend's intended cookie-based contract (base `/api/v1`,
 * httpOnly `accessToken`/`refreshToken`/`twoFactorPending`). No `invalidatesTags`
 * here - session transitions are handled by dispatching auth actions and, on
 * logout, purging the whole cache with `resetApiState`.
 */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ILoginResponse, IUserLoginInput>({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          // A 2FA challenge is not a session - only store a real user.
          if (!isTwoFactorChallenge(data.data)) {
            dispatch(userLoggedIn({ user: data.data.user }));
          }
        } catch {
          // Surfaced to the caller via `unwrap()`.
        }
      },
    }),

    /**
     * The authoritative session check: `GET /auth/me` returns the current user
     * for a valid access cookie (a 401 falls through the api-slice's silent
     * refresh first). The admin guard uses it to validate the session on load
     * rather than trusting the optimistic, localStorage-persisted user. On
     * success we refresh the stored user; on failure we clear it (fail-closed).
     */
    getMe: builder.query<IUserResponse, void>({
      query: () => ({ url: "auth/me", method: "GET" }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.data.user }));
        } catch {
          dispatch(userLoggedOut());
        }
      },
    }),

    /** Update the signed-in user's profile; refreshes the stored user. A new
     * photo travels WITH the save as multipart (payload JSON + file) — the
     * backend uploads it to Cloudinary inside the same request and cleans up
     * on failure, so nothing is ever pre-uploaded or orphaned. */
    updateMe: builder.mutation<
      IUserResponse,
      {
        body: {
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string | null;
        };
        photo?: File;
      }
    >({
      query: ({ body, photo }) => {
        if (photo) {
          const form = new FormData();
          form.append("payload", JSON.stringify(body));
          form.append("profilePicture", photo);
          return { url: "auth/me", method: "PATCH", body: form };
        }
        return { url: "auth/me", method: "PATCH", body };
      },
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.data.user }));
        } catch {
          // Surfaced to the caller via `unwrap()`.
        }
      },
    }),

    /** Change the signed-in user's password (requires the current one). */
    changePassword: builder.mutation<
      IMessageResponse,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "auth/change-password", method: "PATCH", body }),
    }),

    /** Step 2 of a 2FA login: exchanges the emailed code for a session. */
    verifyTwoFactor: builder.mutation<IUserResponse, ITwoFactorVerifyInput>({
      query: (body) => ({ url: "auth/2fa/verify", method: "POST", body }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.data.user }));
        } catch {
          // Surfaced to the caller via `unwrap()`.
        }
      },
    }),

    /** Re-send the 2FA code during a pending challenge. */
    resendTwoFactorCode: builder.mutation<IMessageResponse, void>({
      query: () => ({ url: "auth/2fa/resend", method: "POST" }),
    }),

    /** Emails a confirmation code before enabling 2FA on the account. */
    requestTwoFactorSetup: builder.mutation<IMessageResponse, void>({
      query: () => ({ url: "auth/2fa/enable", method: "POST" }),
    }),

    confirmTwoFactorSetup: builder.mutation<
      IUserResponse,
      ITwoFactorVerifyInput
    >({
      query: (body) => ({ url: "auth/2fa/enable/confirm", method: "POST", body }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.data.user }));
        } catch {
          // Surfaced to the caller via `unwrap()`.
        }
      },
    }),

    disableTwoFactor: builder.mutation<IUserResponse, { password: string }>({
      query: (body) => ({ url: "auth/2fa/disable", method: "POST", body }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.data.user }));
        } catch {
          // Surfaced to the caller via `unwrap()`.
        }
      },
    }),

    forgotPassword: builder.mutation<IMessageResponse, IForgotPasswordInput>({
      query: (body) => ({ url: "auth/forgot-password", method: "POST", body }),
    }),

    resetPassword: builder.mutation<IMessageResponse, IResetPasswordInput>({
      query: (body) => ({ url: "auth/reset-password", method: "POST", body }),
    }),

    logout: builder.mutation<IMessageResponse, void>({
      query: () => ({ url: "auth/logout", method: "POST" }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } finally {
          // Clear client session and purge cached data even if the server call
          // failed - the user intends to be logged out regardless.
          dispatch(userLoggedOut());
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
  useLoginMutation,
  useVerifyTwoFactorMutation,
  useResendTwoFactorCodeMutation,
  useRequestTwoFactorSetupMutation,
  useConfirmTwoFactorSetupMutation,
  useDisableTwoFactorMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
} = authApi;
