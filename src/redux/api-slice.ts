import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { Mutex } from "async-mutex";
import { env } from "@/lib/env";
import { apiSliceTags } from "@/types/api";
import type { IUser, IUserResponse } from "@/types/user.types";
import { userLoggedIn, userLoggedOut } from "./auth/auth-slice";

// A single in-flight refresh at a time: concurrent 401s wait on this mutex
// instead of each firing their own `refresh-token` call (a refresh stampede).
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  // `/api/v1` is appended here; NEXT_PUBLIC_SERVER_URI is just the origin.
  baseUrl: `${env.SERVER_URI}/api/v1`,
  // Send the httpOnly access/refresh cookies on every request (incl. refresh).
  credentials: "include",
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        // The refresh reads the httpOnly `refreshToken` cookie — no body.
        const refreshResult = (await baseQuery(
          { url: "auth/refresh-token", method: "POST" },
          api,
          extraOptions,
        )) as { data?: IUserResponse; error?: unknown };

        if (refreshResult.data) {
          api.dispatch(userLoggedIn({ user: refreshResult.data.data as IUser }));
          result = await baseQuery(args, api, extraOptions); // retry original
        } else {
          api.dispatch(userLoggedOut()); // refresh failed → end the session
        }
      } finally {
        release();
      }
    } else {
      // Another call is already refreshing — wait for it, then retry.
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

/**
 * The one and only `createApi`. Feature endpoints attach via
 * `apiSlice.injectEndpoints` — never create a second slice. Auth-refresh and
 * the tag registry live here so nothing else reimplements 401 handling.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: apiSliceTags,
  endpoints: (builder) => ({
    refreshToken: builder.mutation<IUserResponse, void>({
      query: () => ({ url: "auth/refresh-token", method: "POST" }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(userLoggedIn({ user: data.data }));
        } catch {
          dispatch(userLoggedOut());
        }
      },
    }),
  }),
});

export const { useRefreshTokenMutation } = apiSlice;
