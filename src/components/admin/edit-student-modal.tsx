"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useUpdateStudentMutation } from "@/redux/students/students-api";
import type { IStudent } from "@/types/student.types";

// Mirrors the backend `updateStudentSchema` (student-validation.ts).
const schema = z.object({
  fullName: z.string().trim().min(1, "A name is required").max(150),
  phone: z.string().trim().min(6, "Enter a valid phone").max(20),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Enter a valid email",
    }),
  location: z.string().trim().max(150),
  notes: z.string().trim().max(2000),
});
type Values = z.infer<typeof schema>;

/** Edit a student's contact details and notes. Status/lifecycle actions stay
 * on the detail page's action buttons. */
export function EditStudentModal({
  student,
  onClose,
}: {
  student: IStudent;
  onClose: () => void;
}) {
  const titleId = useId();
  const [updateStudent, { isLoading }] = useUpdateStudentMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: student.fullName,
      phone: student.phone,
      email: student.email ?? "",
      location: student.location ?? "",
      notes: student.notes ?? "",
    },
  });

  const onSubmit = async (v: Values) => {
    try {
      await updateStudent({
        id: student.id,
        body: {
          fullName: v.fullName,
          phone: v.phone,
          email: v.email.trim() || null,
          location: v.location.trim() || null,
          notes: v.notes.trim() || null,
        },
      }).unwrap();
      notify.success("Student updated");
      onClose();
    } catch (err) {
      const { message, fieldErrors, hasFieldErrors } = extractApiError(err);
      if (hasFieldErrors && fieldErrors) {
        for (const [field, msg] of Object.entries(fieldErrors)) {
          setError(field as keyof Values, { message: msg });
        }
      }
      notify.error("Couldn't save the changes", { description: message });
    }
  };

  return (
    <Modal open onClose={onClose} labelledBy={titleId}>
      <h2 id={titleId} className="mb-4 font-serif text-[22px]">
        Edit student
      </h2>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="grid gap-4">
        <TextField
          label="Full name"
          placeholder="e.g. Ama Mensah"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Phone"
            placeholder="+233 24 000 0000"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <TextField
            label="Email (optional)"
            type="email"
            placeholder="student@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
        <TextField
          label="Location (optional)"
          placeholder="e.g. Kumasi"
          error={errors.location?.message}
          {...register("location")}
        />
        <div className="grid gap-[7px]">
          <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
            Notes (optional)
          </span>
          <textarea
            rows={3}
            placeholder="Any notes about this student…"
            className="w-full rounded-[12px] border-[1.5px] border-ink/20 bg-cream px-[15px] py-3 font-sans text-[15px] text-ink outline-none transition-colors focus:border-accent"
            {...register("notes")}
          />
          {errors.notes ? (
            <span className="text-[12.5px] font-semibold text-danger">
              {errors.notes.message}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto">
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
