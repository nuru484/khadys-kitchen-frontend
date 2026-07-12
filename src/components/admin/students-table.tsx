"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Pager } from "@/components/admin/ui";
import { ActionMenu } from "@/components/admin/action-menu";
import { EditStudentModal } from "@/components/admin/edit-student-modal";
import { SkeletonCells } from "@/components/admin/table-bits";
import { useConfirm } from "@/components/admin/use-confirm";
import { DateRangeFields, FilterBar, LabeledSelect } from "@/components/admin/filter-bar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useAuthRole } from "@/hooks/use-auth-role";
import { useTableQuery } from "@/hooks/use-table-query";
import {
  useDeleteStudentMutation,
  useGetStudentsQuery,
  useSetStudentStatusMutation,
} from "@/redux/students/students-api";
import type { IStudent } from "@/types/student.types";

const STATUS_FILTERS = ["all", "ACTIVE", "SUSPENDED", "GRADUATED", "WITHDRAWN"];
const DEFAULTS = { status: "all", from: "", to: "" };
const PAGE_SIZE = 10;

/** Students table — standalone or scoped to a training via `trainingId`. */
export function StudentsTable({
  trainingId,
  prefix,
}: {
  trainingId?: string;
  prefix?: string;
}) {
  const router = useRouter();
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
    useTableQuery({ defaults: DEFAULTS, prefix, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetStudentsQuery({
      page,
      limit: PAGE_SIZE,
      trainingId,
      search: (queryParams.search as string | undefined) ?? undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
    });

  const [setStatus] = useSetStudentStatusMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const [editing, setEditing] = useState<IStudent | null>(null);
  const { isAdmin } = useAuthRole();
  const { confirm, dialog } = useConfirm();

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      notify.success(ok);
    } catch (err) {
      notify.error("Action failed", { description: extractApiError(err).message });
    }
  };

  const statusItems = (st: IStudent) => [
    ...(st.status !== "ACTIVE"
      ? [
          {
            label: "Reactivate",
            onClick: () =>
              confirm({
                title: "Reactivate this student?",
                description: "They will be marked active again.",
                confirmText: "Reactivate",
                onConfirm: () =>
                  run(
                    () => setStatus({ id: st.id, action: "activate" }).unwrap(),
                    "Status updated",
                  ),
              }),
          },
        ]
      : [
          {
            label: "Suspend",
            onClick: () =>
              confirm({
                title: "Suspend this student?",
                description: "They will be marked suspended.",
                confirmText: "Suspend",
                onConfirm: () =>
                  run(
                    () => setStatus({ id: st.id, action: "suspend" }).unwrap(),
                    "Status updated",
                  ),
              }),
          },
        ]),
    ...(st.status !== "GRADUATED"
      ? [
          {
            label: "Graduate",
            onClick: () =>
              confirm({
                title: "Graduate this student?",
                description: "This marks the student as graduated.",
                confirmText: "Graduate",
                onConfirm: () =>
                  run(
                    () => setStatus({ id: st.id, action: "graduate" }).unwrap(),
                    "Status updated",
                  ),
              }),
          },
        ]
      : []),
  ];

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount = Object.entries(filters).filter(
    ([, v]) => v && v !== "all",
  ).length;
  const hasActiveFilters =
    Boolean(search.trim()) || activeCount > 0 || page > 1;
  // Truly empty (not just filtered to nothing): skip the toolbar entirely.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  if (noDataAtAll) {
    return (
      <EmptyState
        title="No students yet"
        description={
          trainingId
            ? "No one has been admitted to this cohort yet."
            : "Admitted students will appear here."
        }
      />
    );
  }

  return (
    <div>
      <FilterBar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search students…"
        activeCount={activeCount}
        onClear={resetFilters}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
      >
        <LabeledSelect
          label="Status"
          value={filters.status}
          active={filters.status !== "all"}
          onChange={(v) => setFilter("status", v)}
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
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
          title="No matching students"
          description="Nothing matches your current search or filters — try clearing them."
        />
      ) : (
        <>
          <Card
            className={cn(
              "overflow-hidden transition-opacity",
              isFetching && !isLoading && "opacity-60",
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/10 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/50">
                    <th className="px-6 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    {!trainingId ? (
                      <th className="px-4 py-3 font-semibold">Class</th>
                    ) : null}
                    <th className="px-4 py-3 font-semibold">Status</th>
                    {/* relative: sr-only text is absolutely positioned, and
                        without a positioned ancestor INSIDE the overflow-x-auto
                        wrapper it escapes the scroll clip and widens the page
                        on small screens. */}
                    <th className="relative px-6 py-3.5 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells
                      widths={
                        trainingId
                          ? ["w-40", "w-28", "w-20", "w-6"]
                          : ["w-40", "w-28", "w-32", "w-20", "w-6"]
                      }
                    />
                  ) : (
                    rows.map((st) => (
                    <tr
                      key={st.id}
                      className="border-b border-ink/[0.08] transition-colors last:border-0 hover:bg-accent/[0.05]"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/students/${st.id}`}
                          title={st.fullName}
                          className="block max-w-[170px] truncate sm:max-w-[260px] text-[15px] font-semibold text-ink no-underline"
                        >
                          {st.fullName}
                        </Link>
                        <div className="mt-0.5 max-w-[170px] truncate sm:max-w-[260px] text-[12.5px] text-ink/55">{st.code}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[14px] text-ink/70">
                        {st.phone}
                      </td>
                      {!trainingId ? (
                        <td className="whitespace-nowrap px-4 py-3 text-[14px] text-ink/70">
                          <span title={st.training?.name} className="max-w-[170px] truncate sm:max-w-[260px] block">
                            {st.training?.name ?? "—"}
                          </span>
                        </td>
                      ) : null}
                      <td className="px-4 py-3">
                        <StatusBadge status={st.status} />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <ActionMenu
                          items={[
                            {
                              label: "View details",
                              onClick: () =>
                                router.push(`/admin/students/${st.id}`),
                            },
                            { label: "Edit", onClick: () => setEditing(st) },
                            ...statusItems(st),
                            ...(isAdmin
                              ? [
                                  {
                                    label: "Delete",
                                    variant: "danger" as const,
                                    onClick: () =>
                                      confirm({
                                        title: "Delete this student?",
                                        description:
                                          "This removes the student record. This can't be undone from here.",
                                        confirmText: "Delete student",
                                        isDestructive: true,
                                        onConfirm: () =>
                                          run(
                                            () => deleteStudent(st.id).unwrap(),
                                            "Student deleted",
                                          ),
                                      }),
                                  },
                                ]
                              : []),
                          ]}
                        />
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
      {editing ? (
        <EditStudentModal student={editing} onClose={() => setEditing(null)} />
      ) : null}
      {dialog}
    </div>
  );
}
