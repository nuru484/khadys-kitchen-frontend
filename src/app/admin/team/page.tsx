"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Pager } from "@/components/admin/ui";
import { DateRangeFields, FilterBar, LabeledSelect } from "@/components/admin/filter-bar";
import {
  DateTimeCell,
  RowCard,
  RowCardList,
  SkeletonCells,
  SkeletonRowCards,
} from "@/components/admin/table-bits";
import { ActionMenu } from "@/components/admin/action-menu";
import { useConfirm } from "@/components/admin/use-confirm";
import {
  AddMemberModal,
  ChangeRoleModal,
  ROLE_RANK,
  roleLabel,
} from "@/components/admin/team-member-modals";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatDate } from "@/lib/format-date";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuthRole } from "@/hooks/use-auth-role";
import { useTableQuery } from "@/hooks/use-table-query";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useSetUserActiveMutation,
} from "@/redux/users/users-api";
import { UserRole, type ITeamUser } from "@/types/user.types";

const ROLE_FILTERS = ["all", "SUPER_ADMIN", "ADMIN", "STAFF"];
const STATUS_FILTERS = ["all", "active", "inactive"];
const DEFAULTS = { role: "all", status: "all", from: "", to: "" };
const PAGE_SIZE = 10;

export default function TeamPage() {
  const router = useRouter();
  const me = useCurrentUser();
  const { isSuperAdmin } = useAuthRole();
  const {
    page,
    search,
    filters,
    resetFilters,
    setSearch,
    setFilter,
    setPage,
    queryParams,
  } =
    useTableQuery({ defaults: DEFAULTS, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetUsersQuery({
      page,
      limit: PAGE_SIZE,
      search: (queryParams.search as string | undefined) ?? undefined,
      role: filters.role !== "all" ? filters.role : undefined,
      isActive:
        filters.status === "all" ? undefined : filters.status === "active",
      from: filters.from || undefined,
      to: filters.to || undefined,
    });

  const [setActive] = useSetUserActiveMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { confirm, dialog } = useConfirm();

  const [addOpen, setAddOpen] = useState(false);
  const [changingRole, setChangingRole] = useState<ITeamUser | null>(null);

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount = Object.entries(filters).filter(
    ([, v]) => v && v !== "all",
  ).length;
  const hasActiveFilters =
    Boolean(search.trim()) || activeCount > 0 || page > 1;
  // Truly empty (no rows, nothing filtered): show only the empty state — a
  // search box and filters over nothing is noise.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  // Mirrors the backend rank rules: a super-admin manages anyone (incl. peers);
  // everyone else only strictly-lower roles. Never yourself (use Profile).
  const canManage = (target: ITeamUser) =>
    !!me &&
    target.id !== me.id &&
    (isSuperAdmin || ROLE_RANK[me.role] > ROLE_RANK[target.role]);

  // Mirrors the backend's canAssignRole: a super admin grants up to their own
  // rank; everyone else only strictly below — an admin can make staff, and
  // only a super admin can mint admins or super admins.
  const assignableRoles = isSuperAdmin
    ? [UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN]
    : [UserRole.STAFF];

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      notify.success(ok);
    } catch (err) {
      notify.error("Action failed", {
        description: extractApiError(err).message,
      });
    }
  };

  // One source for a row's actions — the desktop table and the mobile cards
  // render the same menu.
  const menuItemsFor = (u: ITeamUser) => [
    {
      label: "View details",
      onClick: () => router.push(`/admin/team/${u.id}`),
    },
    ...(canManage(u)
      ? [
          // Editing (photo, name, contact) lives on the profile detail page —
          // reached via "View details". Everything else stays here.
          {
            label: "Change role",
            onClick: () => setChangingRole(u),
          },
          {
            label: u.isActive ? "Deactivate" : "Reactivate",
            onClick: () =>
              confirm({
                title: u.isActive
                  ? "Deactivate this account?"
                  : "Reactivate this account?",
                description: u.isActive
                  ? "They will be signed out and unable to sign in until reactivated."
                  : "They will be able to sign in again.",
                confirmText: u.isActive ? "Deactivate" : "Reactivate",
                isDestructive: u.isActive,
                onConfirm: () =>
                  run(
                    () => setActive({ id: u.id, active: !u.isActive }).unwrap(),
                    u.isActive ? "Account deactivated" : "Account reactivated",
                  ),
              }),
          },
          {
            label: "Delete account",
            variant: "danger" as const,
            onClick: () =>
              confirm({
                title: "Delete this account?",
                description:
                  "They lose access immediately. This can't be undone from here.",
                confirmText: "Delete account",
                isDestructive: true,
                onConfirm: () =>
                  run(() => deleteUser(u.id).unwrap(), "Account deleted"),
              }),
          },
        ]
      : []),
  ];

  if (noDataAtAll) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <EmptyState
          title="No team members yet"
          description="Add the people who run the bakery with you — assign roles and manage their access from here."
          action={{
            label: "+ Add your first member",
            onClick: () => setAddOpen(true),
          }}
        />
        <AddMemberModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          assignableRoles={assignableRoles}
        />
      </div>
    );
  }

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <FilterBar
        collapseFilters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search team…"
        activeCount={activeCount}
        onClear={resetFilters}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
        action={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            + Add member
          </Button>
        }
      >
        <LabeledSelect
          label="Role"
          value={filters.role}
          active={filters.role !== "all"}
          onChange={(v) => setFilter("role", v)}
        >
          {ROLE_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All" : roleLabel(f)}
            </option>
          ))}
        </LabeledSelect>
        <LabeledSelect
          label="Status"
          value={filters.status}
          active={filters.status !== "all"}
          onChange={(v) => setFilter("status", v)}
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </LabeledSelect>
        <DateRangeFields
          from={filters.from}
          to={filters.to}
          onFrom={(v) => setFilter("from", v)}
          onTo={(v) => setFilter("to", v)}
        />
      </FilterBar>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title={
            hasActiveFilters
              ? "No matching team members"
              : "No team members yet"
          }
          description={
            hasActiveFilters
              ? "Nothing matches your current search or filters — try clearing them."
              : "Add your first team member to share the console."
          }
        />
      ) : (
        <>
          <Card
            className={cn(
              "overflow-hidden transition-opacity",
              isFetching && !isLoading && "opacity-60",
            )}
          >
            {/* Phones: row cards — every column's data visible, no side-scroll. */}
            <RowCardList>
              {isLoading ? (
                <SkeletonRowCards />
              ) : (
                rows.map((u) => (
                  <RowCard
                    key={u.id}
                    onOpen={() => router.push(`/admin/team/${u.id}`)}
                    action={<ActionMenu items={menuItemsFor(u)} />}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="truncate text-[15px] font-semibold text-ink">
                        {u.firstName} {u.lastName}
                      </span>
                      {me?.id === u.id ? (
                        <span className="flex-none text-[12px] font-medium text-ink/45">
                          (you)
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 truncate text-[12.5px] text-ink/55">
                      {u.email}
                      {u.phone ? ` · ${u.phone}` : ""}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={u.role} label={roleLabel(u.role)} />
                      <StatusBadge
                        status={u.isActive ? "ACTIVE" : "SUSPENDED"}
                        label={u.isActive ? "Active" : "Deactivated"}
                      />
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[12.5px] text-ink/50">
                      <span>2FA {u.twoFactorEnabled ? "on" : "off"}</span>
                      <span>Joined {formatDate(u.createdAt)}</span>
                    </div>
                  </RowCard>
                ))
              )}
            </RowCardList>

            {/* ≥md: the full table. */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/10 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/50">
                    <th className="px-6 py-3 font-semibold">Member</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">2FA</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells
                      widths={[
                        "w-40",
                        "w-28",
                        "w-24",
                        "w-20",
                        "w-10",
                        "w-24",
                        "w-8",
                      ]}
                    />
                  ) : (
                    rows.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-ink/[0.08] transition-colors last:border-0 hover:bg-accent/[0.05]"
                      >
                        <td className="px-6 py-3">
                          <Link
                            href={`/admin/team/${u.id}`}
                            title={`${u.firstName} ${u.lastName}`}
                            className="flex max-w-[170px] truncate sm:max-w-[260px] items-baseline gap-2 whitespace-nowrap text-[15px] font-semibold text-ink no-underline"
                          >
                            <span className="truncate">
                              {u.firstName} {u.lastName}
                            </span>
                            {me?.id === u.id ? (
                              <span className="flex-none text-[12px] font-medium text-ink/45">
                                (you)
                              </span>
                            ) : null}
                          </Link>
                          <div className="mt-0.5 max-w-[170px] truncate sm:max-w-[260px] text-[12.5px] text-ink/55">
                            {u.email}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[14px] text-ink/70">
                          {u.phone ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={u.role}
                            label={roleLabel(u.role)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={u.isActive ? "ACTIVE" : "SUSPENDED"}
                            label={u.isActive ? "Active" : "Deactivated"}
                          />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[13.5px] text-ink/70">
                          {u.twoFactorEnabled ? "On" : "Off"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[13.5px] text-ink/70">
                          <DateTimeCell iso={u.createdAt} />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <ActionMenu items={menuItemsFor(u)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          {meta ? (
            <Pager page={page} pageCount={meta.totalPages} onPage={setPage} />
          ) : null}
        </>
      )}

      <AddMemberModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        assignableRoles={assignableRoles}
      />
      {changingRole ? (
        <ChangeRoleModal
          user={changingRole}
          assignableRoles={assignableRoles}
          onClose={() => setChangingRole(null)}
        />
      ) : null}
      {dialog}
    </div>
  );
}
