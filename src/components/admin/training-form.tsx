"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/admin/ui";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import {
  useCreateTrainingMutation,
  useUpdateTrainingMutation,
} from "@/redux/trainings/trainings-api";
import {
  FEE_KINDS,
  TRAINING_STATUSES,
  trainingSchema,
  type TrainingFormValues,
} from "@/validations/training-schema";
import type { ITraining, ITrainingInput } from "@/types/training.types";

const DEFAULTS: TrainingFormValues = {
  name: "",
  numeral: "",
  description: "",
  status: "DRAFT",
  applicationsOpen: false,
  isPublished: false,
  startDate: "",
  endDate: "",
  capacity: "",
  hostelCapacity: "",
  costsIntro: "",
  costsNote: "",
  bringIntro: "",
  feeItems: [],
  requirements: [],
  stats: [],
  highlights: [],
};

const s = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

function toInput(v: TrainingFormValues): ITrainingInput {
  return {
    name: v.name.trim(),
    numeral: s(v.numeral),
    description: v.description.trim(),
    status: v.status,
    applicationsOpen: v.applicationsOpen,
    isPublished: v.isPublished,
    startDate: s(v.startDate),
    endDate: s(v.endDate),
    capacity: v.capacity ? Number(v.capacity) : undefined,
    hostelCapacity: v.hostelCapacity ? Number(v.hostelCapacity) : undefined,
    costsIntro: s(v.costsIntro),
    costsNote: s(v.costsNote),
    bringIntro: s(v.bringIntro),
    stats: v.stats,
    requirements: v.requirements.map((r) => ({ name: r.name, note: s(r.note) })),
    highlights: v.highlights.map((h) => h.value),
    feeItems: v.feeItems.map((f, i) => ({
      name: f.name,
      amount: Math.round(f.amount * 100), // GHS → pesewas
      kind: f.kind,
      required: f.required,
      note: s(f.note),
      suffix: s(f.suffix),
      priceLabel: s(f.priceLabel),
      position: i,
    })),
  };
}

function toForm(t: ITraining): TrainingFormValues {
  return {
    name: t.name,
    numeral: t.numeral ?? "",
    description: t.description,
    status: t.status as TrainingFormValues["status"],
    applicationsOpen: t.applicationsOpen,
    isPublished: t.isPublished,
    startDate: t.startDate ? t.startDate.slice(0, 10) : "",
    endDate: t.endDate ? t.endDate.slice(0, 10) : "",
    capacity: t.capacity != null ? String(t.capacity) : "",
    hostelCapacity: t.hostelCapacity != null ? String(t.hostelCapacity) : "",
    costsIntro: t.costsIntro ?? "",
    costsNote: t.costsNote ?? "",
    bringIntro: t.bringIntro ?? "",
    stats: t.stats ?? [],
    requirements: (t.requirements ?? []).map((r) => ({
      name: r.name,
      note: r.note ?? "",
    })),
    highlights: (t.highlights ?? []).map((v) => ({ value: v })),
    feeItems: (t.feeItems ?? []).map((f) => ({
      name: f.name,
      amount: f.amount / 100,
      kind: f.kind as (typeof FEE_KINDS)[number],
      required: f.required,
      note: f.note ?? "",
      suffix: f.suffix ?? "",
      priceLabel: f.priceLabel ?? "",
    })),
  };
}

const STEPS: { key: string; label: string; fields: Path<TrainingFormValues>[] }[] =
  [
    {
      key: "details",
      label: "Details",
      fields: [
        "name",
        "numeral",
        "description",
        "status",
        "startDate",
        "endDate",
        "capacity",
        "hostelCapacity",
        "stats",
      ],
    },
    {
      key: "pricing",
      label: "Pricing",
      fields: ["costsIntro", "costsNote", "feeItems"],
    },
    { key: "tools", label: "Tools to bring", fields: ["bringIntro", "requirements"] },
    { key: "prospectus", label: "Prospectus", fields: ["highlights"] },
  ];

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

export function TrainingForm({ training }: { training?: ITraining }) {
  const router = useRouter();
  const isEdit = Boolean(training);
  const [step, setStep] = useState(0);
  const [createTraining, { isLoading: creating }] = useCreateTrainingMutation();
  const [updateTraining, { isLoading: updating }] = useUpdateTrainingMutation();
  const submitting = creating || updating;

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: training ? toForm(training) : DEFAULTS,
  });

  const fees = useFieldArray({ control, name: "feeItems" });
  const reqs = useFieldArray({ control, name: "requirements" });
  const stats = useFieldArray({ control, name: "stats" });
  const highlights = useFieldArray({ control, name: "highlights" });

  const isLast = step === STEPS.length - 1;

  const goNext = async () => {
    const ok = await trigger(STEPS[step].fields);
    if (ok) setStep((v) => Math.min(v + 1, STEPS.length - 1));
  };

  const onSubmit = async (values: TrainingFormValues) => {
    try {
      if (training) {
        await updateTraining({ id: training.id, body: toInput(values) }).unwrap();
        notify.success("Training updated");
        router.push(`/admin/classes/${training.id}`);
      } else {
        const res = await createTraining(toInput(values)).unwrap();
        notify.success("Training created");
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
      // Keep Enter from submitting mid-wizard (textareas still allow newlines).
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }}
      className="grid max-w-[820px] gap-[18px]"
    >
      {/* Stepper */}
      <div className="flex flex-wrap gap-2">
        {STEPS.map((st, i) => (
          <button
            key={st.key}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
              i === step
                ? "bg-ink text-cream"
                : "bg-ink/[0.06] text-ink/60 hover:bg-ink/10",
            )}
          >
            {i + 1}. {st.label}
          </button>
        ))}
      </div>

      {/* Step 1 — Details */}
      <Card className={cn("p-[clamp(20px,3vw,28px)]", step !== 0 && "hidden")}>
        <h2 className="mb-4 font-serif text-[20px]">Details</h2>
        <div className="grid gap-[18px]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[18px]">
            <TextField
              label="Cohort name"
              placeholder="e.g. Bake School — August 2026 Cohort"
              error={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Numeral"
              placeholder="e.g. 01"
              error={errors.numeral?.message}
              {...register("numeral")}
            />
          </div>
          <Field label="Description">
            <textarea
              rows={3}
              className={areaCls}
              placeholder="What the programme is about, what students achieve…"
              {...register("description")}
            />
            {errors.description ? (
              <span className="text-[13px] text-danger">
                {errors.description.message}
              </span>
            ) : null}
          </Field>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-[18px]">
            <Field label="Status">
              <Select className="py-3" {...register("status")}>
                {TRAINING_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </Select>
            </Field>
            <TextField label="Start date" type="date" {...register("startDate")} />
            <TextField label="End date" type="date" {...register("endDate")} />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-[18px]">
            <TextField
              label="Capacity"
              type="number"
              placeholder="e.g. 40"
              error={errors.capacity?.message}
              {...register("capacity")}
            />
            <TextField
              label="Hostel capacity"
              type="number"
              placeholder="e.g. 12"
              error={errors.hostelCapacity?.message}
              {...register("hostelCapacity")}
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <Toggle label="Accepting applications" {...register("applicationsOpen")} />
            <Toggle label="Published (visible on the website)" {...register("isPublished")} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className={labelCls}>At-a-glance stats (max 4)</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={stats.fields.length >= 4}
                onClick={() => stats.append({ value: "", label: "" })}
              >
                + Add stat
              </Button>
            </div>
            <div className="grid gap-3">
              {stats.fields.map((field, i) => (
                <div key={field.id} className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[120px] flex-1">
                    <TextField
                      label="Value"
                      placeholder="e.g. Weekly"
                      {...register(`stats.${i}.value`)}
                    />
                  </div>
                  <div className="min-w-[160px] flex-[2]">
                    <TextField
                      label="Label"
                      placeholder="e.g. Practicals"
                      {...register(`stats.${i}.label`)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => stats.remove(i)}
                    className="pb-3 text-[13px] font-semibold text-danger"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Step 2 — Pricing */}
      <Card className={cn("p-[clamp(20px,3vw,28px)]", step !== 1 && "hidden")}>
        <h2 className="mb-4 font-serif text-[20px]">Pricing</h2>
        <div className="grid gap-[18px]">
          <Field label="Costs intro">
            <textarea
              rows={2}
              className={areaCls}
              placeholder="Short line above the fee table…"
              {...register("costsIntro")}
            />
          </Field>
          <Field label="Costs note (hostel reminder etc.)">
            <textarea
              rows={2}
              className={areaCls}
              placeholder="e.g. Indicate early — the hostel takes only 12 students."
              {...register("costsNote")}
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className={labelCls}>Fee table</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  fees.append({
                    name: "",
                    amount: 0,
                    kind: "OTHER",
                    required: true,
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
                  No fees yet. Add registration, hostel, ingredients, etc.
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
                  <div className="flex items-center justify-between">
                    <Toggle
                      label="Charged (part of the bill)"
                      {...register(`feeItems.${i}.required`)}
                    />
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
          </div>
        </div>
      </Card>

      {/* Step 3 — Tools to bring */}
      <Card className={cn("p-[clamp(20px,3vw,28px)]", step !== 2 && "hidden")}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[20px]">Tools to bring</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => reqs.append({ name: "", note: "" })}
          >
            + Add item
          </Button>
        </div>
        <Field label="Intro">
          <textarea
            rows={2}
            className={cn(areaCls, "mb-4")}
            placeholder="Short line above the items-to-bring…"
            {...register("bringIntro")}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          {reqs.fields.map((field, i) => (
            <div key={field.id} className="flex items-end gap-2">
              <div className="flex-1">
                <TextField
                  label="Item"
                  placeholder="e.g. Hand mixer"
                  {...register(`requirements.${i}.name`)}
                />
              </div>
              <div className="flex-1">
                <TextField
                  label="Note / price"
                  placeholder="e.g. ≈ GHS 250"
                  {...register(`requirements.${i}.note`)}
                />
              </div>
              <button
                type="button"
                aria-label="Remove item"
                onClick={() => reqs.remove(i)}
                className="pb-3 text-[15px] font-semibold text-danger"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Step 4 — Prospectus */}
      <Card className={cn("p-[clamp(20px,3vw,28px)]", step !== 3 && "hidden")}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[20px]">Prospectus / highlights</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => highlights.append({ value: "" })}
          >
            + Add
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {highlights.fields.map((field, i) => (
            <div key={field.id} className="flex items-end gap-2">
              <div className="flex-1">
                <TextField
                  label={`Item ${String(i + 1)}`}
                  placeholder="e.g. Recipe book · GHS 50"
                  {...register(`highlights.${i}.value`)}
                />
              </div>
              <button
                type="button"
                onClick={() => highlights.remove(i)}
                className="pb-3 text-[13px] font-semibold text-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <div className="flex gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep((v) => v - 1)}>
              Back
            </Button>
          ) : null}
          {isLast ? (
            <Button
              type="submit"
              isLoading={submitting}
              loadingText={isEdit ? "Saving…" : "Creating…"}
            >
              {isEdit ? "Save changes" : "Create training"}
            </Button>
          ) : (
            <Button type="button" onClick={goNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
