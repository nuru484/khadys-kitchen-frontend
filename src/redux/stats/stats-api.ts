import { apiSlice } from "../api-slice";
import type {
  IDashboardStatsResponse,
  StatsRange,
} from "@/types/stats.types";

/** Admin dashboard numbers, windowed by an optional time range (the backend
 * defaults to "week"). Mutations that change money or orders invalidate the
 * DashboardStats tag so the overview stays honest. */
export const statsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<IDashboardStatsResponse, StatsRange | void>({
      query: (range) => ({
        url: `admin/stats/dashboard${range ? `?range=${range}` : ""}`,
        method: "GET",
      }),
      providesTags: ["DashboardStats"],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = statsApi;
