"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Pager } from "@/components/admin/ui";
import { FilterBar, LabeledSelect } from "@/components/admin/filter-bar";
import { SkeletonCells } from "@/components/admin/table-bits";
import { ActionMenu } from "@/components/admin/action-menu";
import { useConfirm } from "@/components/admin/use-confirm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TextField } from "@/components/ui/TextField";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-date";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuthRole } from "@/hooks/use-auth-role";
import { useTableQuery } from "@/hooks/use-table-query";
import {
  useChangeUserRoleMutation,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useSetUserActiveMutation,
  useUpdateUserMutation,
} from "@/redux/users/users-api";
import { UserRole, type ITeamUser } from "@/types/user.types";
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  type CreateTeamMemberValues,
  type UpdateTeamMemberValues,
} from "@/validations/user-schema";

const ROLE_FILTERS = ["all", "SUPER_ADMIN", "ADMIN", "STAFF"];
const STATUS_FILTERS = ["all", "active", "inactive"];
const DEFAULTS = { role: "all", status: "all" };
const PAGE_SIZE = 10;

const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 3,
  [UserRole.ADMIN]: 2,
  [UserRole.STAFF]: 1,
};

const roleLabel = (role: string) =>
  role === "SUPER_ADMIN"
    ? "Super admin"
    : role.charAt(0) + role.slice(1).toLowerCase();

/** Applies backend Zod field errors to a react-hook-form instance. */
const applyFieldErrors = <T extends Record<string, unknown>>(
  err: unknown,
  setError: (name: keyof T & string, error: { message: string }) => void,
) => {
  const { message, fieldErrors, hasFieldErrors } = extractApiError(err);
  if (hasFieldErrors && fieldErrors) {
    for (const [field, msg] of Object.entries(fieldErrors)) {
      setError(field as keyof T & string, { message: msg });
    }
  }
  return message;
};

function AddMemberModal({
  open,
  onClose,
  assignableRoles,
}: {
  open: boolean;
  onClose: () => void;
  assignableRoles: UserRole[];
}) {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateTeamMemberValues>({
    resolver: zodResolver(createTeamMemberSchema),
    defaultValues: { role: UserRole.STAFF, phone: "" },
  });

  const onSubmit = async (v: CreateTeamMemberValues) => {
    try {
      await createUser({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        password: v.password,
        phone: v.phone.trim() || undefined,
        role: v.role,
      }).unwrap();
      notify.success("Team member added");
      reset();
      onClose();
    } catch (err) {
      const message = applyFieldErrors<CreateTeamMemberValues>(err, setError);
      notify.error("Couldn't add the team member", { description: message });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-4 font-serif text-[22px]">Add a team member</h2>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <TextField
            label="Last name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Phone (optional)"
          placeholder="+233 24 000 0000"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <TextField
          label="Temporary password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="grid gap-[7px]">
          <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
            Role
          </span>
          <Select {...register("role")}>
            {assignableRoles.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-1 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} loadingText="Adding…">
            Add member
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function EditMemberModal({
  user,
  onClose,
}: {
  user: ITeamUser;
  onClose: () => void;
}) {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateTeamMemberValues>({
    resolver: zodResolver(updateTeamMemberSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? "",
    },
  });

  const onSubmit = async (v: UpdateTeamMemberValues) => {
    try {
      await updateUser({
        id: user.id,
        body: {
          firstName: v.firstName,
          lastName: v.lastName,
          email: v.email,
          phone: v.phone.trim() || null,
        },
      }).unwrap();
      notify.success("Team member updated");
      onClose();
    } catch (err) {
      const message = applyFieldErrors<UpdateTeamMemberValues>(err, setError);
      notify.error("Couldn't save the changes", { description: message });
    }
  };

  return (
    <Modal open onClose={onClose}>
      <h2 className="mb-4 font-serif text-[22px]">Edit team member</h2>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <TextField
            label="Last name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Phone (optional)"
          placeholder="+233 24 000 0000"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <div className="mt-1 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} loadingText="Saving…">
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function ChangeRoleModal({
  user,
  assignableRoles,
  onClose,
}: {
  user: ITeamUser;
  assignableRoles: UserRole[];
  onClose: () => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [changeRole, { isLoading }] = useChangeUserRoleMutation();

  const submit = async () => {
    try {
      await changeRole({ id: user.id, role }).unwrap();
      notify.success("Role updated");
      onClose();
    } catch (err) {
      notify.error("Couldn't change the role", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <Modal open onClose={onClose}>
      <h2 className="mb-1.5 font-serif text-[22px]">Change role</h2>
      <p className="mb-4 text-[14px] text-ink/60">
        {user.firstName} {user.lastName} will be signed out and re-authenticated
        with the new role.
      </p>
      <div className="grid gap-[7px]">
        <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
          Role
        </span>
        <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          {assignableRoles.map((r) => (
            <option key={r} value={r}>
              {roleLabel(r)}
            </option>
          ))}
        </Select>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          isLoading={isLoading}
          loadingText="Updating…"
          disabled={role === user.role}
          onClick={() => void submit()}
        >
          Update role
        </Button>
      </div>
    </Modal>
  );
}

export default function TeamPage() {
  const me = useCurrentUser();
  const { isSuperAdmin } = useAuthRole();
  const { page, search, filters, setSearch, setFilter, setPage, queryParams } =
    useTableQuery({ defaults: DEFAULTS, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetUsersQuery({
      page,
      limit: PAGE_SIZE,
      search: (queryParams.search as string | undefined) ?? undefined,
      role: filters.role !== "all" ? filters.role : undefined,
      isActive:
        filters.status === "all" ? undefined : filters.status === "active",
    });

  const [setActive] = useSetUserActiveMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { confirm, dialog } = useConfirm();

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ITeamUser | null>(null);
  const [changingRole, setChangingRole] = useState<ITeamUser | null>(null);

  const rows = data?.data ?? [];
  const meta = data?.meta;
  const activeCount =
    (filters.role !== "all" ? 1 : 0) + (filters.status !== "all" ? 1 : 0);
  const hasActiveFilters = Boolean(search.trim()) || activeCount > 0 || page > 1;
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

  // Mirrors the backend's canAssignRole: grant up to your OWN rank — an admin
  // can make staff or admins, only a super admin can mint super admins.
  const assignableRoles = isSuperAdmin
    ? [UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN]
    : [UserRole.STAFF, UserRole.ADMIN];

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      notify.success(ok);
    } catch (err) {
      notify.error("Action failed", { description: extractApiError(err).message });
    }
  };

  if (noDataAtAll) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <EmptyState
          title="No team members yet"
          description="Add the people who run the bakery with you — assign roles and manage their access from here."
          action={{ label: "+ Add your first member", onClick: () => setAddOpen(true) }}
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
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search team…"
        activeCount={activeCount}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
        action={
          <Button onClick={() => setAddOpen(true)}>+ Add member</Button>
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
      </FilterBar>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !isLoading && rows.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching team members" : "No team members yet"}
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
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-ink/10 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/50">
                    <th className="px-6 py-3.5 font-semibold">Member</th>
                    <th className="px-4 py-3.5 font-semibold">Phone</th>
                    <th className="px-4 py-3.5 font-semibold">Role</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-4 py-3.5 font-semibold">2FA</th>
                    <th className="px-4 py-3.5 font-semibold">Joined</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <SkeletonCells widths={["w-40", "w-28", "w-24", "w-20", "w-10", "w-24", "w-8"]} />
                  ) : (
                    rows.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-ink/[0.08] last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div
                          title={`${u.firstName} ${u.lastName}`}
                          className="flex max-w-[170px] truncate sm:max-w-[260px] items-baseline gap-2 whitespace-nowrap text-[15px] font-semibold text-ink"
                        >
                          <span className="truncate">
                            {u.firstName} {u.lastName}
                          </span>
                          {me?.id === u.id ? (
                            <span className="flex-none text-[12px] font-medium text-ink/45">
                              (you)
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 max-w-[170px] truncate sm:max-w-[260px] text-[12.5px] text-ink/55">{u.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[14px] text-ink/70">
                        {u.phone ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={u.role} label={roleLabel(u.role)} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge
                          status={u.isActive ? "ACTIVE" : "SUSPENDED"}
                          label={u.isActive ? "Active" : "Deactivated"}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[13.5px] text-ink/70">
                        {u.twoFactorEnabled ? "On" : "Off"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-[13.5px] text-ink/70">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canManage(u) ? (
                          <ActionMenu
                            items={[
                              { label: "Edit profile", onClick: () => setEditing(u) },
                              { label: "Change role", onClick: () => setChangingRole(u) },
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
                                        () =>
                                          setActive({
                                            id: u.id,
                                            active: !u.isActive,
                                          }).unwrap(),
                                        u.isActive
                                          ? "Account deactivated"
                                          : "Account reactivated",
                                      ),
                                  }),
                              },
                              {
                                label: "Delete account",
                                variant: "danger",
                                onClick: () =>
                                  confirm({
                                    title: "Delete this account?",
                                    description:
                                      "They lose access immediately. This can't be undone from here.",
                                    confirmText: "Delete account",
                                    isDestructive: true,
                                    onConfirm: () =>
                                      run(
                                        () => deleteUser(u.id).unwrap(),
                                        "Account deleted",
                                      ),
                                  }),
                              },
                            ]}
                          />
                        ) : null}
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
      {editing ? (
        <EditMemberModal user={editing} onClose={() => setEditing(null)} />
      ) : null}
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
