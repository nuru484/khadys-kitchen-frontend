"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/admin/ui";
import {
  BestSellersMeters,
  RevenueChart,
} from "@/components/admin/dashboard-viz";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format-money";
import { formatDateTime } from "@/lib/format-date";
import { Select } from "@/components/ui/Select";
import { useGetAuditLogsQuery } from "@/redux/audit/audit-api";
import type { IAuditLog } from "@/types/audit.types";
import { useGetDashboardStatsQuery } from "@/redux/stats/stats-api";
import {
  type IDashboardStats,
  rangeNoun,
  STATS_RANGE_OPTIONS,
  type StatsRange,
} from "@/types/stats.types";

const humanize = (action: string) =>
  action.replace(/\./g, " · ").replace(/_/g, " ");

function TileLink({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: string;
  note?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block min-w-0 rounded-[18px] border border-ink/10 bg-card px-[22px] py-5 no-underline transition-colors hover:border-accent/50"
    >
      <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/50">
        {label}
      </div>
      <div className="mt-2 font-serif text-[clamp(24px,2.6vw,30px)]">{value}</div>
      {note ? (
        <div className="mt-1 text-[12.5px] font-semibold text-accent">{note}</div>
      ) : null}
    </Link>
  );
}

/** Time-range control: a segmented pill row on tablets and up, a compact
 * dropdown on phones (pills would crowd a small screen). */
function RangePicker({
  range,
  onChange,
}: {
  range: StatsRange;
  onChange: (r: StatsRange) => void;
}) {
  return (
    <>
      <div className="sm:hidden">
        <Select
          value={range}
          onChange={(e) => onChange(e.target.value as StatsRange)}
          aria-label="Time range"
          wrapperClassName="max-w-[200px]"
        >
          {STATS_RANGE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="-mx-1 hidden gap-1.5 overflow-x-auto px-1 pb-0.5 sm:flex">
      {STATS_RANGE_OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={range === o.id}
          className={cn(
            "flex-none cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
            range === o.id
              ? "bg-ink text-cream"
              : "border-[1.5px] border-ink/20 bg-transparent text-ink/60 hover:border-ink/45 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
      </div>
    </>
  );
}

export default function DashboardPage() {
  const [range, setRange] = useState<StatsRange>("week");
  // Each section fetches independently — the activity feed erroring (or being
  // slow) never takes the stat cards down with it, and vice versa.
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetDashboardStatsQuery(range);
  const activity = useGetAuditLogsQuery({ limit: 8 });

  const stats = data?.data;
  const noun = rangeNoun(range);

  return (
    <div className="grid gap-5" style={{ animation: "kk-rise .5s both" }}>
      <RangePicker range={range} onChange={setRange} />

      {isLoading ? (
        <div className="grid gap-5">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[118px] animate-pulse rounded-[18px] bg-ink/[0.06]" />
            ))}
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[18px]">
            <div className="h-[260px] animate-pulse rounded-[18px] bg-ink/[0.06]" />
            <div className="h-[260px] animate-pulse rounded-[18px] bg-ink/[0.06]" />
          </div>
        </div>
      ) : isError || !stats ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <AggregatesSection
          shop={stats.shop}
          range={range}
          noun={noun}
          isFetching={isFetching}
        />
      )}

      {/* Side by side only on large screens; tablets and phones keep each
          on its own row. */}
      <div className="grid items-start gap-5 lg:grid-cols-2">
        {stats && !isError ? (
          <BakeSchoolCard bakeSchool={stats.bakeSchool} />
        ) : isLoading ? (
          <div className="h-[220px] animate-pulse rounded-[18px] bg-ink/[0.06]" />
        ) : null}
        <ActivitySection activity={activity} />
      </div>
    </div>
  );
}

function AggregatesSection({
  shop,
  range,
  noun,
  isFetching,
}: {
  shop: IDashboardStats["shop"];
  range: StatsRange;
  noun: string;
  isFetching: boolean;
}) {
  return (
    <>
      {/* Range switches keep the previous numbers on screen, dimmed, until the
          new window arrives — the section never blanks. */}
      <div
        className={cn(
          "grid gap-5 transition-opacity",
          isFetching && "opacity-60",
        )}
      >
        {/* Shop stats — the first three tiles are live/now, the fourth follows the range. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3.5">
          <TileLink
            label="Orders today"
            value={String(shop.ordersToday)}
            note={`${String(shop.pendingOrders)} pending`}
            href="/admin/orders"
          />
          <TileLink
            label="Ready for pickup"
            value={String(shop.readyOrders)}
            note="awaiting collection"
            href="/admin/orders?status=READY"
          />
          <TileLink
            label="Outstanding balance"
            value={formatMoney(shop.outstandingBalance)}
            note="on open orders"
            href="/admin/orders?payment=UNPAID"
          />
          <TileLink
            label={`Received ${noun}`}
            value={formatMoney(shop.revenue.total)}
            note="shop + bake school"
            href="/admin/payments"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-[18px]">
          <RevenueChart series={shop.revenue.series} range={range} />
          <BestSellersMeters data={shop.bestSellers} range={range} />
        </div>

      </div>
    </>
  );
}


/** Bake School snapshot — pairs with Recent activity on large screens; each
 * sits on its own row on tablets and phones. */
function BakeSchoolCard({
  bakeSchool,
}: {
  bakeSchool: IDashboardStats["bakeSchool"];
}) {
  return (
    <Card className="p-[clamp(18px,2.8vw,24px)]">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-[19px] font-normal">Bake School</h3>
          <Link
            href="/admin/applications"
            className="whitespace-nowrap text-[13px] font-semibold text-accent no-underline hover:underline"
          >
            Applications →
          </Link>
        </div>
        <div className="grid gap-2.5 text-[14.5px]">
          <div className="flex justify-between gap-4">
            <span className="text-ink/55">Pending applications</span>
            <span className="font-semibold">{bakeSchool.pendingApplications}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink/55">Active students</span>
            <span className="font-semibold">{bakeSchool.activeStudents}</span>
          </div>
        </div>
        {bakeSchool.openCohort ? (
          <Link
            href={`/admin/classes/${bakeSchool.openCohort.id}`}
            className="mt-4 block rounded-[14px] border border-ink/10 bg-oat/40 px-4 py-3.5 no-underline transition-colors hover:border-accent/50"
          >
            <div className="text-[12px] font-semibold uppercase tracking-[0.1em] text-accent">
              Enrolling now
            </div>
            <div className="mt-1 text-[15px] font-semibold text-ink">
              {bakeSchool.openCohort.name}
            </div>
            <div className="mt-0.5 text-[13px] text-ink/60">
              {bakeSchool.openCohort.students}
              {bakeSchool.openCohort.capacity
                ? ` of ${String(bakeSchool.openCohort.capacity)}`
                : ""}{" "}
              admitted · {bakeSchool.openCohort.applications} application
              {bakeSchool.openCohort.applications === 1 ? "" : "s"}
            </div>
          </Link>
        ) : (
          <p className="mt-4 text-[13.5px] text-ink/50">
            No cohort is currently open for applications.
          </p>
        )}
    </Card>
  );
}

/** Recent activity — fetched from the audit log on its own, with its own
 * loading and error states, on a full row of its own. */
function ActivitySection({
  activity,
}: {
  activity: {
    data?: { data: IAuditLog[] };
    error?: unknown;
    isError: boolean;
    isLoading: boolean;
    refetch: () => unknown;
  };
}) {
  const rows = activity.data?.data ?? [];
  return (
    <Card className="p-[clamp(18px,2.8vw,24px)]">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-[19px] font-normal">Recent activity</h3>
        <Link
          href="/admin/audit"
          className="whitespace-nowrap text-[13px] font-semibold text-accent no-underline hover:underline"
        >
          Audit log →
        </Link>
      </div>
      {activity.isLoading ? (
        <div className="grid gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse rounded bg-ink/[0.06]" />
          ))}
        </div>
      ) : activity.isError ? (
        <ErrorState
          error={activity.error}
          onRetry={() => void activity.refetch()}
        />
      ) : rows.length === 0 ? (
        <p className="text-[14px] text-ink/50">Nothing yet.</p>
      ) : (
        <div className="grid">
          {rows.map((ev: IAuditLog) => (
            <div
              key={ev.id}
              className="flex items-start gap-3.5 border-b border-ink/[0.07] py-[11px] last:border-0"
            >
              <span className="mt-1.5 h-[9px] w-[9px] flex-none rounded-full bg-accent" />
              <span className="min-w-0 flex-1 truncate text-[14px] leading-[1.5] text-ink/[0.82]">
                <span className="capitalize">{humanize(ev.action)}</span>
                {ev.actor ? (
                  <span className="text-ink/50"> — {ev.actor.name}</span>
                ) : null}
              </span>
              <span className="mt-0.5 whitespace-nowrap text-[12px] text-ink/45">
                {formatDateTime(ev.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
