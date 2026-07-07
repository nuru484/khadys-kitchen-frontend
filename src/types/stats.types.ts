/** Time window the dashboard's revenue + best-seller figures cover,
 * mirroring the backend `StatsRange` (stats.service.ts). */
export type StatsRange = "today" | "week" | "month" | "year" | "all";

/** Pill label + inline noun ("Received this week", "Best sellers · today")
 * for each range, in display order. */
export const STATS_RANGE_OPTIONS: {
  id: StatsRange;
  label: string;
  noun: string;
}[] = [
  { id: "today", label: "Today", noun: "today" },
  { id: "week", label: "This week", noun: "this week" },
  { id: "month", label: "This month", noun: "this month" },
  { id: "year", label: "This year", noun: "this year" },
  { id: "all", label: "All time", noun: "all time" },
];

export const rangeNoun = (range: StatsRange): string =>
  STATS_RANGE_OPTIONS.find((o) => o.id === range)?.noun ?? "this week";

/** GET /admin/stats/dashboard payload, mirroring the backend `DashboardStats`.
 * Money is minor units (pesewas). Series labels depend on the range: hours
 * ("06:00") for today, ISO dates for week/month, "YYYY-MM" for year, and
 * "YYYY" for all time. */
export interface IDashboardStats {
  range: StatsRange;
  shop: {
    ordersToday: number;
    pendingOrders: number;
    readyOrders: number;
    outstandingBalance: number;
    revenue: {
      total: number;
      series: { label: string; total: number }[];
    };
    bestSellers: { name: string; productId: string | null; quantity: number }[];
  };
  bakeSchool: {
    pendingApplications: number;
    activeStudents: number;
    openCohort: {
      id: string;
      name: string;
      capacity: number | null;
      applications: number;
      students: number;
    } | null;
  };
}

export interface IDashboardStatsResponse {
  message: string;
  data: IDashboardStats;
}
