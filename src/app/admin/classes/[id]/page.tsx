"use client";

import { useState } from "react";
import { BackLink } from "@/components/admin/back-link";
import { ClassDetailSkeleton } from "@/components/admin/detail-skeletons";
import { useParams, useRouter } from "next/navigation";
import { Card, detailTitleCls } from "@/components/admin/ui";
import { PageActions } from "@/components/admin/page-actions";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirm } from "@/components/admin/use-confirm";
import { ApplicationsTable } from "@/components/admin/applications-table";
import { StudentsTable } from "@/components/admin/students-table";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDate } from "@/lib/format-date";
import { useAuthRole } from "@/hooks/use-auth-role";
import { TRAINING_CATEGORY_LABELS } from "@/validations/training-schema";
import {
  useDeleteTrainingMutation,
  useGetTrainingByIdQuery,
  usePublishTrainingMutation,
  useUnpublishTrainingMutation,
} from "@/redux/trainings/trainings-api";
import type { ITraining } from "@/types/training.types";

/** The four public bullet lists, rendered as cards only when non-empty. */
const BULLET_SECTIONS: { title: string; pick: (t: ITraining) => string[] }[] = [
  { title: "What you'll learn", pick: (t) => t.learnOutcomes },
  { title: "What's included", pick: (t) => t.included },
  { title: "Who it's for", pick: (t) => t.forWho },
  { title: "What to bring", pick: (t) => t.whatToBring },
];

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
      <div>
        <BackLink href="/admin/classes">
          ← All trainings
        </BackLink>
        <ClassDetailSkeleton />
      </div>
    );
  }
  if (isError || !training) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <BackLink href="/admin/classes" className="mb-0 mt-3">
          ← All trainings
        </BackLink>
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
    ["Runs", dateRange],
    ["Category", TRAINING_CATEGORY_LABELS[training.category]],
    ["Schedule", training.schedule ?? "—"],
    ["Duration", training.duration ?? "—"],
    ["Mode", training.mode ?? "—"],
    ["Certificate", training.hasCertificate ? "Yes" : "No"],
    ["Capacity", training.capacity != null ? `${String(training.capacity)} seats` : "—"],
    ["Applicants", String(training.counts?.applications ?? 0)],
    ["Students", String(training.counts?.students ?? 0)],
    ["Currency", training.currency],
    ["Slug", training.slug],
  ];

  const bulletCards = BULLET_SECTIONS.filter(({ pick }) => pick(training).length > 0);

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <BackLink href="/admin/classes">
        ← All trainings
      </BackLink>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className={detailTitleCls(training.name)}>{training.name}</h1>
        {/* Same action cluster as the other detail pages (consistent sm
            buttons; extras collapse into "More" on phones). */}
        <PageActions
          actions={[
            {
              label: "Edit",
              onClick: () => router.push(`/admin/classes/${id}/edit`),
            },
            {
              label: training.isPublished ? "Unpublish" : "Publish",
              variant: training.isPublished ? "outline" : "primary",
              isLoading: publishing || unpublishing,
              primary: true,
              onClick: () =>
                confirm({
                  title: training.isPublished
                    ? "Unpublish this training?"
                    : "Publish this training?",
                  description: training.isPublished
                    ? "It will no longer be visible on the website."
                    : "It will go live on the website for applicants to see and apply.",
                  confirmText: training.isPublished ? "Unpublish" : "Publish",
                  onConfirm: togglePublish,
                }),
            },
            ...(isAdmin
              ? [
                  {
                    label: "Delete",
                    variant: "danger" as const,
                    onClick: () =>
                      confirm({
                        title: "Delete this training?",
                        description:
                          "This hides the class and its data. This can't be undone from here.",
                        confirmText: "Delete training",
                        isDestructive: true,
                        onConfirm: onDelete,
                      }),
                  },
                ]
              : []),
          ]}
        />
      </div>

      <div className="grid gap-[18px]">
        {/* Overview — summary, key facts, cover + prospectus */}
        <Card className="p-[clamp(20px,3vw,28px)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-[19px]">Overview</h2>
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                status={training.isPublished ? "PUBLISHED" : "DRAFT"}
                label={training.isPublished ? "Published" : "Draft"}
              />
              <StatusBadge
                status={training.applicationsOpen ? "ACTIVE" : "WITHDRAWN"}
                label={training.applicationsOpen ? "Applications open" : "Applications closed"}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            {training.coverImage ? (
              <div className="w-full flex-none overflow-hidden rounded-[14px] border border-ink/10 bg-oat/40 sm:w-[220px]">
                {/* Cover images are pasted URLs from any host, so next/image's
                    remotePatterns allowlist can't serve them. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={training.coverImage}
                  alt={`${training.name} cover`}
                  // Full-bleed banner crop on phones (same height as before);
                  // the compact 4:3 thumbnail from sm up.
                  className="h-[170px] w-full object-cover sm:aspect-[4/3] sm:h-auto"
                />
              </div>
            ) : null}
            <div className="min-w-[min(100%,280px)] flex-1">
              <p className="max-w-[75ch] text-[14.5px] leading-[1.7] text-ink/70">
                {training.summary}
              </p>
              {training.prospectusUrl ? (
                <a
                  href={training.prospectusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-[13.5px] font-semibold text-accent"
                >
                  View prospectus ↗
                </a>
              ) : null}
            </div>
          </div>
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

        {/* Fees */}
        <Card className="p-[clamp(20px,3vw,28px)]">
          <h2 className="mb-4 font-serif text-[19px]">Fees</h2>
          {training.feeItems && training.feeItems.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {training.feeItems.map((f) => (
                <div
                  key={f.id}
                  // Amount below the name on phones; from sm, flex-wrap keeps
                  // the two on one row when the name fits and drops the amount
                  // below only when it can't share the row.
                  className="flex flex-col gap-1 rounded-[12px] border border-ink/10 bg-oat/30 px-4 py-3 text-[14px] sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-3"
                >
                  <span className="text-ink/70">
                    {f.name}
                    {f.choiceGroup
                      ? " (pick one)"
                      : f.required
                        ? ""
                        : " (optional)"}
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
        </Card>

        {/* The public bullet lists, two per row */}
        {bulletCards.length > 0 ? (
          <div className="grid gap-[18px] lg:grid-cols-2">
            {bulletCards.map(({ title, pick }) => (
              <Card key={title} className="p-[clamp(20px,3vw,28px)]">
                <h2 className="mb-3.5 font-serif text-[19px]">{title}</h2>
                <ul className="grid list-none gap-2 p-0">
                  {pick(training).map((item) => (
                    <li
                      key={item}
                      className="rounded-[10px] bg-oat/30 px-3 py-2 text-[13.5px] text-ink/80"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
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
