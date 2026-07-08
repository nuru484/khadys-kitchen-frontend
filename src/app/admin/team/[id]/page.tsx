"use client";

import { useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/admin/back-link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/admin/ui";
import { ProfileAvatar } from "@/components/admin/profile-avatar";
import { ROLE_RANK, roleLabel } from "@/components/admin/team-member-modals";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatDateTime } from "@/lib/format-date";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuthRole } from "@/hooks/use-auth-role";
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "@/redux/users/users-api";

const schema = z.object({
  firstName: z.string().trim().min(1, "Required").max(50),
  lastName: z.string().trim().min(1, "Required").max(50),
  email: z.email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || v.replace(/\D/g, "").length >= 6, {
      message: "Enter a valid phone number",
    }),
});
type Values = z.infer<typeof schema>;

/**
 * A teammate's profile — the same layout an admin sees for their OWN profile,
 * just for someone else and read-only until Edit. Role changes, deactivation
 * and deletion live in the team table's row menu; this page is purely
 * "view/edit this person's profile" so the two never duplicate each other.
 */
export default function TeamMemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const me = useCurrentUser();
  const { isSuperAdmin } = useAuthRole();
  const { data, isLoading, isError, error, refetch } = useGetUserByIdQuery(id);
  const [updateUser, { isLoading: saving }] = useUpdateUserMutation();

  const [editing, setEditing] = useState(false);

  // A new photo is only staged here; it travels WITH the save as multipart and
  // the backend uploads it (cleaning up on failure), so cancelling never leaves
  // an orphaned image in Cloudinary.
  const [stagedPhoto, setStagedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const user = data?.data;

  const stagePhoto = (file: File) => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setStagedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  const clearStagedPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setStagedPhoto(null);
    setPhotoPreview(null);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const stopEditing = () => {
    reset();
    clearStagedPhoto();
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }
  if (isError || !user) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <BackLink href="/admin/team" className="mt-3">
          ← Team & roles
        </BackLink>
      </div>
    );
  }

  const isMe = me?.id === user.id;
  // Mirrors the backend rank rules: a super-admin manages anyone (incl. peers);
  // everyone else only strictly-lower roles. Never yourself (use Profile).
  const canEdit =
    !!me &&
    !isMe &&
    (isSuperAdmin || ROLE_RANK[me.role] > ROLE_RANK[user.role]);

  const onSubmit = async (values: Values) => {
    try {
      await updateUser({
        id: user.id,
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone?.trim() || null,
        },
        photo: stagedPhoto ?? undefined,
      }).unwrap();
      notify.success("Profile updated");
      clearStagedPhoto();
      setEditing(false);
    } catch (err) {
      notify.error("Couldn't update the profile", {
        description: extractApiError(err).message,
      });
    }
  };

  const info: [string, string][] = [
    ["Email", user.email],
    ["Phone", user.phone ?? "—"],
    ["Two-factor", user.twoFactorEnabled ? "Enabled" : "Off"],
    ["Joined", formatDateTime(user.createdAt)],
    ["Last updated", formatDateTime(user.updatedAt)],
  ];

  return (
    <div style={{ animation: "kk-rise .5s both" }} className="max-w-[640px]">
      <BackLink href="/admin/team">
        ← Team & roles
      </BackLink>

      <Card className="p-[clamp(20px,3vw,28px)]">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[20px]">
            {isMe ? "Your profile" : "Team member profile"}
          </h2>
          {canEdit && !editing ? (
            <Button size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          ) : null}
        </div>
        <p className="mb-5 text-[14px] text-ink/55">
          {editing
            ? "Update their photo, name and contact details."
            : "Their account profile. Role, access and removal are managed from the team table."}
        </p>

        <div className="mb-6 border-b border-ink/10 pb-6">
          {/* Name + badges sit beside the photo, like a profile header. */}
          <ProfileAvatar
            user={user}
            editable={editing}
            preview={photoPreview}
            onStage={stagePhoto}
            caption={
              <div className="min-w-0">
                <div className="break-words text-[16px] font-semibold text-ink">
                  {user.firstName} {user.lastName}
                  {isMe ? (
                    <span className="ml-1.5 text-[13px] font-medium text-ink/45">
                      (you)
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={user.role}
                    label={roleLabel(user.role)}
                  />
                  <StatusBadge
                    status={user.isActive ? "ACTIVE" : "SUSPENDED"}
                    label={user.isActive ? "Active" : "Deactivated"}
                  />
                </div>
              </div>
            }
          />
        </div>

        {editing ? (
          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            noValidate
            className="grid gap-[18px]"
          >
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[18px]">
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
              label="Phone"
              placeholder="+233 24 000 0000"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={stopEditing}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving} loadingText="Saving…">
                Save changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-2.5">
            {info.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-4 text-[14px]"
              >
                <span className="flex-none text-ink/55">{label}</span>
                <span className="min-w-0 break-all font-medium text-ink min-[480px]:text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {isMe ? (
          <p className="mt-4 border-t border-ink/10 pt-4 text-[13.5px] text-ink/55">
            This is your account — manage it from{" "}
            <Link href="/admin/profile" className="font-semibold text-accent">
              your profile
            </Link>
            .
          </p>
        ) : null}
      </Card>
    </div>
  );
}
