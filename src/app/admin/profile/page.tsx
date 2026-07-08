"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/admin/ui";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUpdateMeMutation } from "@/redux/auth/auth-api";
import { ProfileAvatar } from "@/components/admin/profile-avatar";

const schema = z.object({
  firstName: z.string().trim().min(1, "Required").max(50),
  lastName: z.string().trim().min(1, "Required").max(50),
  email: z.email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || (v.length >= 6 && v.length <= 20), {
      message: "Enter a valid phone number",
    }),
});
type Values = z.infer<typeof schema>;

const roleLabel = (role: string) =>
  role === "SUPER_ADMIN"
    ? "Super admin"
    : role.charAt(0) + role.slice(1).toLowerCase();

/** Profile — read-only until "Edit" activates the inputs. */
export default function ProfilePage() {
  const user = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  // A new photo is only staged here; it travels WITH the save as multipart and
  // the backend uploads it (cleaning up on failure), so cancelling the edit
  // never leaves an orphaned image in Cloudinary.
  const [stagedPhoto, setStagedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
    setError,
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

  const onSubmit = async (values: Values) => {
    try {
      await updateMe({
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone.trim() || null,
        },
        photo: stagedPhoto ?? undefined,
      }).unwrap();
      notify.success("Profile updated");
      clearStagedPhoto();
      setEditing(false);
    } catch (err) {
      const { message, fieldErrors, hasFieldErrors } = extractApiError(err);
      if (hasFieldErrors && fieldErrors) {
        for (const [field, msg] of Object.entries(fieldErrors)) {
          setError(field as keyof Values, { message: msg });
        }
      }
      notify.error("Couldn't update your profile", { description: message });
    }
  };

  const info: [string, string][] = [
    ["Name", `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "—"],
    ["Email", user?.email ?? "—"],
    ["Phone", user?.phone ?? "—"],
    ["Role", user ? roleLabel(user.role) : "—"],
    ["Two-factor", user?.twoFactorEnabled ? "Enabled" : "Off"],
  ];

  return (
    <div style={{ animation: "kk-rise .5s both" }} className="max-w-[640px]">
      <Card className="p-[clamp(20px,3vw,28px)]">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[20px]">Your profile</h2>
          {editing ? null : (
            <Button size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
        <p className="mb-5 text-[14px] text-ink/55">
          {editing
            ? "Update your photo, name, email and phone. Your role is managed by the system."
            : "Your account details. Click Edit to make changes."}
        </p>
        <div className="mb-6 border-b border-ink/10 pb-6">
          <ProfileAvatar
            user={user}
            editable={editing}
            preview={photoPreview}
            onStage={stagePhoto}
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
              label="Phone"
              placeholder="+233 24 000 0000"
              error={errors.phone?.message}
              {...register("phone")}
            />
            <TextField
              label="Email"
              type="email"
              placeholder="name@example.com"
              hint="This is your sign-in email."
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={stopEditing}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} loadingText="Saving…">
                Save changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-2.5">
            {info.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 text-[14px]">
                <span className="flex-none text-ink/55">{label}</span>
                <span className="min-w-0 break-all text-right font-medium text-ink">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
