"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/admin/ui";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/notify";
import { revalidatePublicPaths } from "@/lib/revalidate-public";
import { extractApiError } from "@/lib/extract-api-error";
import {
  useCreateTrainingMutation,
  useUpdateTrainingMutation,
} from "@/redux/trainings/trainings-api";
import {
  CHARGE_TYPE_LABELS,
  CHARGE_TYPES,
  type ChargeType,
  COURSE_FEE_GROUP,
  FEE_KINDS,
  trainingSchema,
  type TrainingFormValues,
} from "@/validations/training-schema";
import type { ITraining, ITrainingInput } from "@/types/training.types";

const DEFAULTS: TrainingFormValues = {
  name: "",
  summary: "",
  learnOutcomes: [],
  whatToBring: [],
  included: [],
  forWho: [],
  startDate: "",
  endDate: "",
  schedule: "",
  duration: "",
  mode: "",
  hasCertificate: false,
  capacity: "",
  applicationsOpen: false,
  isPublished: false,
  isFeatured: false,
  feeItems: [],
};

type FileUploadChange = { cleared: boolean; file: File | null };

const s = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);
const bullets = (list: { value: string }[]) => list.map((b) => b.value.trim());

function toInput(v: TrainingFormValues): ITrainingInput {
  return {
    name: v.name.trim(),
    summary: v.summary.trim(),
    learnOutcomes: bullets(v.learnOutcomes),
    whatToBring: bullets(v.whatToBring),
    included: bullets(v.included),
    forWho: bullets(v.forWho),
    startDate: s(v.startDate),
    endDate: s(v.endDate),
    schedule: s(v.schedule),
    duration: s(v.duration),
    mode: s(v.mode),
    hasCertificate: v.hasCertificate,
    capacity: v.capacity ? Number(v.capacity) : undefined,
    applicationsOpen: v.applicationsOpen,
    isPublished: v.isPublished,
    isFeatured: v.isFeatured,
    feeItems: v.feeItems.map((f, i) => ({
      name: f.name,
      amount: Math.round(f.amount * 100), // GHS → pesewas
      kind: f.kind,
      // The charge type unfolds into the backend's required + choiceGroup pair.
      required: f.charge !== "OPTIONAL",
      choiceGroup: f.charge === "COURSE_CHOICE" ? COURSE_FEE_GROUP : undefined,
      note: s(f.note),
      suffix: s(f.suffix),
      priceLabel: s(f.priceLabel),
      position: i,
    })),
  };
}

const toRows = (list: string[]) => list.map((value) => ({ value }));

function toForm(t: ITraining): TrainingFormValues {
  return {
    name: t.name,
    summary: t.summary,
    learnOutcomes: toRows(t.learnOutcomes),
    whatToBring: toRows(t.whatToBring),
    included: toRows(t.included),
    forWho: toRows(t.forWho),
    startDate: t.startDate ? t.startDate.slice(0, 10) : "",
    endDate: t.endDate ? t.endDate.slice(0, 10) : "",
    schedule: t.schedule ?? "",
    duration: t.duration ?? "",
    mode: t.mode ?? "",
    hasCertificate: t.hasCertificate,
    capacity: t.capacity != null ? String(t.capacity) : "",
    applicationsOpen: t.applicationsOpen,
    isPublished: t.isPublished,
    isFeatured: t.isFeatured,
    feeItems: (t.feeItems ?? []).map((f) => ({
      name: f.name,
      amount: f.amount / 100, // pesewas → GHS
      kind: f.kind as (typeof FEE_KINDS)[number],
      charge: (f.choiceGroup
        ? "COURSE_CHOICE"
        : f.required
          ? "ALWAYS"
          : "OPTIONAL") satisfies ChargeType,
      note: f.note ?? "",
      suffix: f.suffix ?? "",
      priceLabel: f.priceLabel ?? "",
    })),
  };
}

const labelCls =
  "text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60";
const areaCls =
  "w-full rounded-[12px] border-[1.5px] border-ink/20 bg-cream px-[15px] py-3 font-sans text-[15px] text-ink outline-none transition-colors focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-[7px]">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-[14px] font-medium text-ink">
      <input type="checkbox" className="h-4 w-4 accent-accent" {...props} />
      {label}
    </label>
  );
}

type BulletListName = "learnOutcomes" | "whatToBring" | "included" | "forWho";

/** One "What students see" bullet list: rows of text + remove, plus "+ Add". */
function BulletListField({
  name,
  title,
  placeholder,
  control,
  register,
  errors,
}: {
  name: BulletListName;
  title: string;
  placeholder: string;
  control: Control<TrainingFormValues>;
  register: UseFormRegister<TrainingFormValues>;
  errors: FieldErrors<TrainingFormValues>;
}) {
  const list = useFieldArray({ control, name });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className={labelCls}>{title}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => list.append({ value: "" })}
        >
          + Add
        </Button>
      </div>
      {list.fields.length === 0 ? (
        <p className="text-[13.5px] text-ink/50">
          No items yet — this section stays hidden on the class page.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.fields.map((field, i) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <TextField
                  label={`Item ${String(i + 1)}`}
                  placeholder={placeholder}
                  error={errors[name]?.[i]?.value?.message}
                  {...register(`${name}.${i}.value`)}
                />
              </div>
              <button
                type="button"
                aria-label="Remove item"
                onClick={() => list.remove(i)}
                className="mt-[34px] text-[15px] font-semibold text-danger"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TrainingForm({ training }: { training?: ITraining }) {
  const router = useRouter();
  const isEdit = Boolean(training);
  const [createTraining, { isLoading: creating }] = useCreateTrainingMutation();
  const [updateTraining, { isLoading: updating }] = useUpdateTrainingMutation();
  const submitting = creating || updating;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: training ? toForm(training) : DEFAULTS,
  });

  const fees = useFieldArray({ control, name: "feeItems" });

  // Cover image + prospectus are staged locally and travel with the save as
  // multipart; `cleared` removes the existing asset (sends null).
  const [cover, setCover] = useState<FileUploadChange>({ cleared: false, file: null });
  const [prospectus, setProspectus] = useState<FileUploadChange>({
    cleared: false,
    file: null,
  });

  const onSubmit = async (values: TrainingFormValues) => {
    const body: ITrainingInput = {
      ...toInput(values),
      // undefined = unchanged, null = cleared; a new file overwrites on upload.
      coverImage: cover.cleared ? null : (training?.coverImage ?? undefined),
      prospectusUrl: prospectus.cleared
        ? null
        : (training?.prospectusUrl ?? undefined),
    };
    const files = {
      coverImage: cover.file ?? undefined,
      prospectus: prospectus.file ?? undefined,
    };
    try {
      if (training) {
        await updateTraining({ id: training.id, body, files }).unwrap();
        notify.success("Training updated");
        void revalidatePublicPaths("/", "/trainings");
        router.push(`/admin/classes/${training.id}`);
      } else {
        const res = await createTraining({ body, files }).unwrap();
        notify.success("Training created");
        void revalidatePublicPaths("/", "/trainings");
        router.push(`/admin/classes/${res.data.id}`);
      }
    } catch (err) {
      notify.error(
        isEdit ? "Couldn't update the training" : "Couldn't create the training",
        { description: extractApiError(err).message },
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      // Enter in a bullet/fee row shouldn't submit the whole form (textareas
      // still allow newlines); submit is the explicit button at the bottom.
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }}
      className="grid max-w-[820px] gap-[18px]"
    >
      {/* Basics */}
      <Card className="p-[clamp(20px,3vw,28px)]">
        <h2 className="mb-4 font-serif text-[20px]">Basics</h2>
        <div className="grid gap-[18px]">
          <TextField
            label="Class name"
            placeholder="e.g. Bread & Pastry Masterclass"
            error={errors.name?.message}
            {...register("name")}
          />
          <Field label="Summary">
            <textarea
              rows={3}
              className={areaCls}
              placeholder="One short paragraph shown on cards and at the top of the class page…"
              {...register("summary")}
            />
            {errors.summary ? (
              <span className="text-[13px] text-danger">
                {errors.summary.message}
              </span>
            ) : null}
          </Field>
          <div className="grid gap-[18px] sm:grid-cols-2">
            <FileUploadField
              label="Cover image"
              kind="image"
              accept="image/*"
              hint="JPG, PNG or WebP, up to 10MB."
              currentUrl={training?.coverImage}
              onChange={setCover}
            />
            <FileUploadField
              label="Prospectus (PDF)"
              kind="document"
              accept="application/pdf"
              hint="A downloadable PDF for prospective students."
              currentUrl={training?.prospectusUrl}
              onChange={setProspectus}
            />
          </div>
        </div>
      </Card>

      {/* What students see */}
      <Card className="p-[clamp(20px,3vw,28px)]">
        <h2 className="mb-1.5 font-serif text-[20px]">What students see</h2>
        <p className="mb-5 text-[13.5px] text-ink/55">
          The bullet lists on the public class page. Empty lists are simply not
          shown.
        </p>
        <div className="grid gap-7">
          <BulletListField
            name="learnOutcomes"
            title="What you'll learn"
            placeholder="e.g. Shaping and scoring artisan loaves"
            control={control}
            register={register}
            errors={errors}
          />
          <BulletListField
            name="included"
            title="What's included"
            placeholder="e.g. All ingredients for practicals"
            control={control}
            register={register}
            errors={errors}
          />
          <BulletListField
            name="forWho"
            title="Who it's for"
            placeholder="e.g. Beginners — no experience needed"
            control={control}
            register={register}
            errors={errors}
          />
          <BulletListField
            name="whatToBring"
            title="What to bring"
            placeholder="e.g. Hand mixer · ≈ GHS 250"
            control={control}
            register={register}
            errors={errors}
          />
        </div>
      </Card>

      {/* Logistics */}
      <Card className="p-[clamp(20px,3vw,28px)]">
        <h2 className="mb-4 font-serif text-[20px]">Logistics</h2>
        <div className="grid gap-[18px]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-[18px]">
            <TextField label="Start date" type="date" {...register("startDate")} />
            <TextField label="End date" type="date" {...register("endDate")} />
            <TextField
              label="Capacity"
              type="number"
              placeholder="e.g. 40"
              error={errors.capacity?.message}
              {...register("capacity")}
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-[18px]">
            <TextField
              label="Schedule"
              placeholder="e.g. Saturdays, 9am–1pm"
              error={errors.schedule?.message}
              {...register("schedule")}
            />
            <TextField
              label="Duration"
              placeholder="e.g. 2 months"
              error={errors.duration?.message}
              {...register("duration")}
            />
            <TextField
              label="Mode"
              placeholder="e.g. In-person · Kumasi studio"
              error={errors.mode?.message}
              {...register("mode")}
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <Toggle label="Certificate awarded" {...register("hasCertificate")} />
            <Toggle label="Accepting applications" {...register("applicationsOpen")} />
            <Toggle label="Published (visible on the website)" {...register("isPublished")} />
            <Toggle label="Featured on the home page" {...register("isFeatured")} />
          </div>
        </div>
      </Card>

      {/* Fees */}
      <Card className="p-[clamp(20px,3vw,28px)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[20px]">Fees</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              fees.append({
                name: "",
                amount: 0,
                kind: "OTHER",
                charge: "ALWAYS",
                note: "",
                suffix: "",
                priceLabel: "",
              })
            }
          >
            + Add fee
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {fees.fields.length === 0 ? (
            <p className="text-[14px] text-ink/50">
              No fees yet. Add registration, ingredients, certificate, etc.
            </p>
          ) : null}
          {fees.fields.map((field, i) => (
            <div
              key={field.id}
              className="grid content-start gap-3 rounded-[14px] border border-ink/10 bg-oat/40 p-4"
            >
              <TextField
                label="Name"
                placeholder="e.g. Registration and school fees"
                error={errors.feeItems?.[i]?.name?.message}
                {...register(`feeItems.${i}.name`)}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Amount (GHS)"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  error={errors.feeItems?.[i]?.amount?.message}
                  {...register(`feeItems.${i}.amount`, { valueAsNumber: true })}
                />
                <Field label="Kind">
                  <Select className="py-3" {...register(`feeItems.${i}.kind`)}>
                    {FEE_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Note"
                  placeholder="Optional note"
                  {...register(`feeItems.${i}.note`)}
                />
                <TextField
                  label="Suffix"
                  placeholder="e.g. for 2 months"
                  {...register(`feeItems.${i}.suffix`)}
                />
              </div>
              <TextField
                label="Price label"
                placeholder="e.g. Free or —"
                {...register(`feeItems.${i}.priceLabel`)}
              />
              <Field label="How it's charged">
                <Select className="py-3" {...register(`feeItems.${i}.charge`)}>
                  {CHARGE_TYPES.map((c) => (
                    <option key={c} value={c}>
                      {CHARGE_TYPE_LABELS[c]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => fees.remove(i)}
                  className="text-[13px] font-semibold text-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={submitting}
          loadingText={isEdit ? "Saving…" : "Creating…"}
        >
          {isEdit ? "Save changes" : "Create training"}
        </Button>
      </div>
    </form>
  );
}
