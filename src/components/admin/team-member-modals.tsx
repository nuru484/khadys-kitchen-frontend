"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import {
  useChangeUserRoleMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/redux/users/users-api";
import { UserRole, type ITeamUser } from "@/types/user.types";
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  type CreateTeamMemberValues,
  type UpdateTeamMemberValues,
} from "@/validations/user-schema";

/** Mirrors the backend's role ranks — shared by the team list and detail
 * pages' "who may manage whom" checks. */
export const ROLE_RANK: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 3,
  [UserRole.ADMIN]: 2,
  [UserRole.STAFF]: 1,
};

export const roleLabel = (role: string) =>
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

export function AddMemberModal({
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
            placeholder="e.g. Ama"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <TextField
            label="Last name"
            placeholder="e.g. Mensah"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          placeholder="name@example.com"
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
          placeholder="At least 8 characters"
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

export function EditMemberModal({
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
            placeholder="e.g. Ama"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <TextField
            label="Last name"
            placeholder="e.g. Mensah"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          placeholder="name@example.com"
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

export function ChangeRoleModal({
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
