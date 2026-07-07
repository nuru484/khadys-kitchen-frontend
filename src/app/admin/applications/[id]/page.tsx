"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { RecordPaymentModal } from "@/components/admin/record-payment-modal";
import { PageActions } from "@/components/admin/page-actions";
import { useConfirm } from "@/components/admin/use-confirm";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDate, formatDateTime } from "@/lib/format-date";
import {
  useDeleteApplicationMutation,
  useGetApplicationByIdQuery,
  useRefundPaymentMutation,
  useRemindApplicantMutation,
  useUpdateApplicationStatusMutation,
} from "@/redux/applications/applications-api";

const STATUS_ACTIONS = [
  { status: "RECRUITED", label: "Admit", variant: "primary" as const },
  { status: "WAITLISTED", label: "Waitlist", variant: "outline" as const },
  { status: "REJECTED", label: "Reject", variant: "danger" as const },
  { status: "WITHDRAWN", label: "Withdraw", variant: "outline" as const },
];

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } =
    useGetApplicationByIdQuery(id);
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [remind, { isLoading: reminding }] = useRemindApplicantMutation();
  const [refund] = useRefundPaymentMutation();
  const [deleteApplication] = useDeleteApplicationMutation();

  const { confirm, dialog } = useConfirm();
  const [recording, setRecording] = useState(false);

  const app = data?.data;

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }
  if (isError || !app) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <Link href="/admin/applications" className="mt-3 inline-block font-semibold text-accent">
          ← All applications
        </Link>
      </div>
    );
  }

  const doStatus = async (status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      notify.success("Status updated");
    } catch (err) {
      notify.error("Couldn't update status", { description: extractApiError(err).message });
    }
  };

  const doRefund = async (paymentId: string) => {
    try {
      await refund({ paymentId, applicationId: id }).unwrap();
      notify.success("Payment reversed");
    } catch (err) {
      notify.error("Couldn't reverse", { description: extractApiError(err).message });
    }
  };

  const sendReminder = async () => {
    try {
      await remind(id).unwrap();
      notify.success("Reminder sent");
    } catch (err) {
      notify.error("Couldn't send reminder", { description: extractApiError(err).message });
    }
  };

  const onDelete = async () => {
    try {
      await deleteApplication(id).unwrap();
      notify.success("Application deleted");
      router.push("/admin/applications");
    } catch (err) {
      notify.error("Couldn't delete", { description: extractApiError(err).message });
    }
  };

  const info: [string, string][] = [
    ["Phone", app.phone],
    ["Email", app.email ?? "—"],
    ["Location", app.location ?? "—"],
    ["Needs hostel", app.needsHostel ? "Yes" : "No"],
    ["Applied", formatDate(app.createdAt)],
  ];

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <Link href="/admin/applications" className="mb-4 inline-block text-[13.5px] font-semibold text-accent">
        ← All applications
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-serif text-[clamp(26px,3.4vw,36px)] font-normal">{app.fullName}</h1>
          <div className="mt-1 text-[13.5px] text-ink/55">
            {app.code}
            {app.training ? (
              <>
                {" · "}
                <Link href={`/admin/classes/${app.training.id}`} className="font-semibold text-accent">
                  {app.training.name}
                </Link>
              </>
            ) : null}
          </div>
        </div>
        <PageActions
          actions={[
            ...STATUS_ACTIONS.filter((a) => a.status !== app.status).map(
              (a, i) => ({
                label: a.label,
                variant: a.variant,
                // Admit (or the first sensible transition) stays visible on phones.
                primary: i === 0 && a.variant !== "danger",
                onClick: () =>
                  confirm({
                    title: `${a.label} this applicant?`,
                    description:
                      a.status === "RECRUITED"
                        ? "This admits the applicant and creates their student record."
                        : a.status === "REJECTED"
                          ? "This rejects the applicant — any admission is reversed and paid fees refunded."
                          : `This sets the application to ${a.status.toLowerCase()}.`,
                    confirmText: a.label,
                    isDestructive: a.variant === "danger",
                    onConfirm: () => doStatus(a.status),
                  }),
              }),
            ),
            {
              label: "Delete",
              variant: "danger" as const,
              onClick: () =>
                confirm({
                  title: "Delete this application?",
                  description:
                    "This removes the application. Applicants who have paid or been admitted can't be deleted.",
                  confirmText: "Delete application",
                  isDestructive: true,
                  onConfirm: onDelete,
                }),
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[18px]">
        <Card className="p-[clamp(20px,3vw,28px)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-[19px]">Applicant</h2>
            <StatusBadge status={app.status} />
          </div>
          <div className="grid gap-2.5">
            {info.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 text-[14px]">
                <span className="text-ink/55">{label}</span>
                <span className="font-medium text-ink">{value}</span>
              </div>
            ))}
          </div>
          {app.message ? (
            <p className="mt-4 border-t border-ink/10 pt-4 text-[14px] leading-[1.6] text-ink/70">
              “{app.message}”
            </p>
          ) : null}
          {app.student ? (
            <Link
              href={`/admin/students/${app.student.id}`}
              className="mt-4 inline-block text-[14px] font-semibold text-accent"
            >
              View student record ({app.student.code}) →
            </Link>
          ) : null}
        </Card>

        {/* Bill */}
        <Card className="p-[clamp(20px,3vw,28px)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-[19px]">Bill</h2>
            <StatusBadge status={app.paymentStatus} />
          </div>
          <div className="grid gap-2">
            {(app.feeLines ?? []).map((f) => (
              <div key={f.id} className="flex justify-between gap-4 text-[14px]">
                <span className="text-ink/70">{f.name}</span>
                <span className="font-medium">{formatMoney(f.amount, app.currency)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-1.5 border-t border-ink/10 pt-3 text-[14px]">
            <Row label="Total due" value={formatMoney(app.amountDue, app.currency)} />
            <Row label="Paid" value={formatMoney(app.amountPaid, app.currency)} />
            <Row label="Balance" value={formatMoney(app.balance, app.currency)} strong />
          </div>
        </Card>
      </div>

      {/* Payments */}
      <Card className="mt-[18px] p-[clamp(20px,3vw,28px)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[19px]">Payments</h2>
          <div className="flex gap-2.5">
            {app.balance > 0 ? (
              <Button
                variant="outline"
                size="sm"
                isLoading={reminding}
                onClick={() =>
                  confirm({
                    title: "Send a payment reminder?",
                    description: `We'll notify ${app.fullName} of their outstanding balance of ${formatMoney(app.balance, app.currency)}.`,
                    confirmText: "Send reminder",
                    onConfirm: sendReminder,
                  })
                }
              >
                Send reminder
              </Button>
            ) : null}
            <Button size="sm" onClick={() => setRecording(true)}>
              Record payment
            </Button>
          </div>
        </div>
        {app.payments && app.payments.length > 0 ? (
          <div className="grid gap-2">
            {app.payments.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-ink/10 px-4 py-3 text-[14px]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatMoney(p.amount, p.currency)}</span>
                  <span className="text-ink/55">{p.method.replace("_", " ")}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] text-ink/50">
                    {formatDateTime(p.paidAt ?? null)}
                  </span>
                  {p.status === "SUCCESS" ? (
                    <button
                      type="button"
                      onClick={() =>
                        confirm({
                          title: "Reverse this payment?",
                          description:
                            "Paystack payments are refunded via Paystack; cash/MoMo are marked reversed.",
                          confirmText: "Reverse payment",
                          isDestructive: true,
                          onConfirm: () => doRefund(p.id),
                        })
                      }
                      className="text-[13px] font-semibold text-danger"
                    >
                      Reverse
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-ink/50">No payments recorded yet.</p>
        )}
      </Card>

      <RecordPaymentModal
        applicationId={id}
        open={recording}
        onClose={() => setRecording(false)}
      />
      {dialog}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink/55">{label}</span>
      <span className={strong ? "font-semibold text-ink" : "font-medium text-ink"}>
        {value}
      </span>
    </div>
  );
}
