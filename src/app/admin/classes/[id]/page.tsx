"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { useConfirm } from "@/components/admin/use-confirm";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { StudentsTable } from "@/components/admin/students-table";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDate } from "@/lib/format-date";
import { useAuthRole } from "@/hooks/use-auth-role";
import {
  useDeleteTrainingMutation,
  useGetTrainingByIdQuery,
  usePublishTrainingMutation,
  useUnpublishTrainingMutation,
} from "@/redux/trainings/trainings-api";

export default function TrainingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const [tab, setTab] = useState<"applications" | "students">("applications");
  const { isAdmin } = useAuthRole();
  const { confirm, dialog } = useConfirm();

  const { data: training, isLoading, isError, error, refetch } =
    useGetTrainingByIdQuery(id);
  const [publish, { isLoading: publishing }] = usePublishTrainingMutation();
  const [unpublish, { isLoading: unpublishing }] = useUnpublishTrainingMutation();
  const [deleteTraining] = useDeleteTrainingMutation();

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }
  if (isError || !training) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <Link href="/admin/classes" className="mt-3 inline-block font-semibold text-accent">
          ← All trainings
        </Link>
      </div>
    );
  }

  const togglePublish = async () => {
    try {
      if (training.isPublished) await unpublish(id).unwrap();
      else await publish(id).unwrap();
      notify.success(training.isPublished ? "Unpublished" : "Published");
    } catch (err) {
      notify.error("Action failed", { description: extractApiError(err).message });
    }
  };

  const onDelete = async () => {
    try {
      await deleteTraining(id).unwrap();
      notify.success("Training deleted");
      router.push("/admin/classes");
    } catch (err) {
      notify.error("Couldn't delete", { description: extractApiError(err).message });
    }
  };

  const dateRange = training.startDate
    ? `${formatDate(training.startDate)}${training.endDate ? ` – ${formatDate(training.endDate)}` : ""}`
    : "—";
  const facts: [string, string][] = [
    ["Status", training.status],
    ["Visibility", training.isPublished ? "Published" : "Unpublished"],
    ["Applications", training.applicationsOpen ? "Open" : "Closed"],
    ["Runs", dateRange],
    ["Capacity", training.capacity != null ? `${String(training.capacity)} seats` : "—"],
    ["Hostel", training.hostelCapacity != null ? `${String(training.hostelCapacity)} places` : "—"],
    ["Currency", training.currency],
    ["Slug", training.slug],
  ];

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <Link href="/admin/classes" className="mb-4 inline-block text-[13.5px] font-semibold text-accent">
        ← All trainings
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          {training.numeral ? (
            <p className="mb-1 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-accent">
              Cohort {training.numeral}
            </p>
          ) : null}
          <h1 className="font-serif text-[clamp(26px,3.4vw,38px)] font-normal">{training.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={`/admin/classes/${id}/edit`}
            className="rounded-full border-[1.5px] border-ink/25 px-5 py-2.5 text-[13.5px] font-semibold text-ink no-underline transition-colors hover:border-ink"
          >
            Edit
          </Link>
          <Button
            variant={training.isPublished ? "outline" : "primary"}
            isLoading={publishing || unpublishing}
            onClick={() =>
              confirm({
                title: training.isPublished
                  ? "Unpublish this training?"
                  : "Publish this training?",
                description: training.isPublished
                  ? "It will no longer be visible on the website."
                  : "It will go live on the website for applicants to see and apply.",
                confirmText: training.isPublished ? "Unpublish" : "Publish",
                onConfirm: togglePublish,
              })
            }
          >
            {training.isPublished ? "Unpublish" : "Publish"}
          </Button>
          {isAdmin ? (
            <Button
              variant="danger"
              onClick={() =>
                confirm({
                  title: "Delete this training?",
                  description:
                    "This hides the cohort and its data. This can't be undone from here.",
                  confirmText: "Delete training",
                  isDestructive: true,
                  onConfirm: onDelete,
                })
              }
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-[18px]">
        <Card className="p-[clamp(20px,3vw,28px)]">
          <h2 className="mb-4 font-serif text-[19px]">Overview</h2>
          <p className="max-w-[75ch] text-[14.5px] leading-[1.7] text-ink/70">
            {training.description}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-ink/10 pt-5 sm:grid-cols-3 lg:grid-cols-4">
            {facts.map(([label, value]) => (
              <div key={label}>
                <div className="text-[11.5px] uppercase tracking-[0.07em] text-ink/45">
                  {label}
                </div>
                <div className="mt-1 text-[14.5px] font-medium text-ink">{value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Fees — full width, two columns */}
        <Card className="p-[clamp(20px,3vw,28px)]">
          <h2 className="mb-1.5 font-serif text-[19px]">Fees</h2>
          {training.costsIntro ? (
            <p className="mb-4 text-[13.5px] leading-[1.6] text-ink/60">
              {training.costsIntro}
            </p>
          ) : (
            <div className="mb-4" />
          )}
          {training.feeItems && training.feeItems.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {training.feeItems.map((f) => (
                <div
                  key={f.id}
                  className="flex items-baseline justify-between gap-3 rounded-[12px] border border-ink/10 bg-oat/30 px-4 py-3 text-[14px]"
                >
                  <span className="text-ink/70">
                    {f.name}
                    {f.required ? "" : " (optional)"}
                  </span>
                  <span className="whitespace-nowrap font-semibold text-ink">
                    {f.priceLabel ?? formatMoney(f.amount, training.currency)}
                    {f.suffix ? ` ${f.suffix}` : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-ink/50">No fees configured.</p>
          )}
          {training.costsNote ? (
            <p className="mt-4 border-t border-ink/10 pt-4 text-[13px] leading-[1.6] text-ink/55">
              {training.costsNote}
            </p>
          ) : null}
        </Card>

        {/* Items to bring + At a glance, side by side */}
        {training.requirements.length > 0 || training.stats.length > 0 ? (
          <div className="grid gap-[18px] lg:grid-cols-2">
            {training.requirements.length > 0 ? (
              <Card className="p-[clamp(20px,3vw,28px)]">
                <h2 className="mb-1.5 font-serif text-[19px]">Items to bring</h2>
                {training.bringIntro ? (
                  <p className="mb-3.5 text-[13.5px] leading-[1.6] text-ink/60">
                    {training.bringIntro}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                  {training.requirements.map((r) => (
                    <div key={r.name} className="rounded-[10px] bg-oat/30 px-3 py-2 text-[13.5px]">
                      <span className="font-medium text-ink/80">{r.name}</span>
                      {r.note ? <span className="text-ink/50"> · {r.note}</span> : null}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
            {training.stats.length > 0 ? (
              <Card className="p-[clamp(20px,3vw,28px)]">
                <h2 className="mb-4 font-serif text-[19px]">At a glance</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {training.stats.map((st) => (
                    <div key={st.label}>
                      <div className="font-serif text-[26px]">{st.value}</div>
                      <div className="mt-0.5 text-[12px] uppercase tracking-[0.06em] text-ink/55">
                        {st.label}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>
        ) : null}

        {/* Prospectus */}
        {training.highlights.length > 0 ? (
          <Card className="p-[clamp(20px,3vw,28px)]">
            <h2 className="mb-4 font-serif text-[19px]">Prospectus</h2>
            <div className="flex flex-wrap gap-2">
              {training.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-full border border-ink/12 bg-oat/40 px-3 py-1.5 text-[13px] text-ink/70"
                >
                  {h}
                </span>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      {/* Applications + Students */}
      <div className="mt-8">
        <div className="mb-4 flex gap-2">
          {(["applications", "students"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={
                "rounded-full px-4 py-2 text-[14px] font-semibold capitalize transition-colors " +
                (tab === t ? "bg-ink text-cream" : "text-ink/60 hover:bg-ink/[0.06]")
              }
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "applications" ? (
          <ApplicationsTable trainingId={id} prefix="apps" />
        ) : (
          <StudentsTable trainingId={id} prefix="students" />
        )}
      </div>

      {dialog}
    </div>
  );
}
