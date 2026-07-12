"use client";

import { useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/admin/back-link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { RecordPaymentModal } from "@/components/admin/record-payment-modal";
import { PageActions } from "@/components/admin/page-actions";
import { StatusPicker } from "@/components/admin/status-picker";
import { useConfirm } from "@/components/admin/use-confirm";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDateTime } from "@/lib/format-date";
import {
  useDeleteApplicationMutation,
  useGetApplicationByIdQuery,
  useRemindApplicantMutation,
  useUpdateApplicationStatusMutation,
} from "@/redux/applications/applications-api";
import { useRefundPaymentMutation } from "@/redux/payments/payments-api";
import {
  APPLICATION_DELETE_COPY,
  applicationStatusActionsFor,
  applicationStatusCopy,
} from "@/lib/admin/application-actions";
import type { ApplicationStatus } from "@/types/application.types";
import { useAuthRole } from "@/hooks/use-auth-role";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } =
    useGetApplicationByIdQuery(id);
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [remind, { isLoading: reminding }] = useRemindApplicantMutation();
  const [refund] = useRefundPaymentMutation();
  const [deleteApplication] = useDeleteApplicationMutation();
  const { isAdmin } = useAuthRole();

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
        <BackLink href="/admin/applications" className="mt-3">
          ← All applications
        </BackLink>
      </div>
    );
  }

  const doStatus = async (status: ApplicationStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
      notify.success("Status updated");
    } catch (err) {
      notify.error("Couldn't update status", {
        description: extractApiError(err).message,
      });
    }
  };

  const doRefund = async (paymentId: string) => {
    try {
      await refund({ paymentId, applicationId: id }).unwrap();
      notify.success("Payment reversed");
    } catch (err) {
      notify.error("Couldn't reverse", {
        description: extractApiError(err).message,
      });
    }
  };

  const sendReminder = async () => {
    try {
      await remind(id).unwrap();
      notify.success("Reminder sent");
    } catch (err) {
      notify.error("Couldn't send reminder", {
        description: extractApiError(err).message,
      });
    }
  };

  const onDelete = async () => {
    try {
      await deleteApplication(id).unwrap();
      notify.success("Application deleted");
      router.push("/admin/applications");
    } catch (err) {
      notify.error("Couldn't delete", {
        description: extractApiError(err).message,
      });
    }
  };

  const info: [string, string][] = [
    ["Phone", app.phone],
    ["Email", app.email ?? "—"],
    ["Location", app.location ?? "—"],
    ["Needs hostel", app.needsHostel ? "Yes" : "No"],
    ["Applied", formatDateTime(app.createdAt)],
  ];

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <BackLink href="/admin/applications">
        ← All applications
      </BackLink>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-serif text-[clamp(26px,3.4vw,36px)] font-normal">
            {app.fullName}
          </h1>
          <div className="mt-1 text-[13.5px] text-ink/55">
            {app.code}
            {app.training ? (
              <>
                {" · "}
                <Link
                  href={`/admin/classes/${app.training.id}`}
                  className="font-semibold text-accent"
                >
                  {app.training.name}
                </Link>
              </>
            ) : null}
          </div>
        </div>
        <PageActions
          actions={
            isAdmin
              ? [
                  {
                    label: "Delete",
                    variant: "danger" as const,
                    onClick: () =>
                      confirm({
                        title: "Delete this application?",
                        description: APPLICATION_DELETE_COPY,
                        confirmText: "Delete application",
                        isDestructive: true,
                        onConfirm: onDelete,
                      }),
                  },
                ]
              : []
          }
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[18px]">
        <Card className="p-[clamp(20px,3vw,28px)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-[19px]">Applicant</h2>
            {/* Current status doubles as the transition picker — the same
                confirmations (and staff can't reject) as the old buttons. */}
            <StatusPicker
              status={app.status}
              options={applicationStatusActionsFor(isAdmin)
                .filter((a) => a.status !== app.status)
                .map((a) => ({
                  value: a.status,
                  label: a.label,
                  danger: a.variant === "danger",
                }))}
              onSelect={(status) => {
                const action = applicationStatusActionsFor(isAdmin).find(
                  (a) => a.status === status,
                );
                if (!action) return;
                confirm({
                  title: `${action.label} this applicant?`,
                  description: applicationStatusCopy(status),
                  confirmText: action.label,
                  isDestructive: action.variant === "danger",
                  onConfirm: () => doStatus(status),
                });
              }}
            />
          </div>
          <div className="grid gap-2.5">
            {info.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-0.5 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-4 text-[14px]"
              >
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
              <div
                key={f.id}
                className="flex flex-col gap-0.5 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-4 text-[14px]"
              >
                <span className="text-ink/70">{f.name}</span>
                <span className="font-medium">
                  {formatMoney(f.amount, app.currency)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-1.5 border-t border-ink/10 pt-3 text-[14px]">
            <Row
              label="Total due"
              value={formatMoney(app.amountDue, app.currency)}
            />
            <Row
              label="Paid"
              value={formatMoney(app.amountPaid, app.currency)}
            />
            <Row
              label="Balance"
              value={formatMoney(app.balance, app.currency)}
              strong
            />
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
                className="flex flex-col gap-2 rounded-[12px] border border-ink/10 px-4 py-3 text-[14px] min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:justify-between min-[480px]:gap-3"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold">
                    {formatMoney(p.amount, p.currency)}
                  </span>
                  <span className="text-ink/55">
                    {p.method.replace("_", " ")}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-4 min-[480px]:justify-end">
                  <span className="text-[13px] text-ink/50 min-[480px]:text-right">
                    {formatDateTime(p.paidAt ?? null)}
                    {p.reversedAt ? (
                      <span className="block text-[12px] text-ink/45">
                        Reversed {formatDateTime(p.reversedAt)}
                      </span>
                    ) : null}
                  </span>
                  {isAdmin && p.status === "SUCCESS" ? (
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
                {p.note ? (
                  <p className="w-full text-[13px] text-ink/55">{p.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-ink/50">No payments recorded yet.</p>
        )}
      </Card>

      <RecordPaymentModal
        owner={{ kind: "application", id }}
        open={recording}
        onClose={() => setRecording(false)}
      />
      {dialog}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-4">
      <span className="text-ink/55">{label}</span>
      <span
        className={strong ? "font-semibold text-ink" : "font-medium text-ink"}
      >
        {value}
      </span>
    </div>
  );
}
