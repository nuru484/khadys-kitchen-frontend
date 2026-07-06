"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { useConfirm } from "@/components/admin/use-confirm";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDate, formatDateTime } from "@/lib/format-date";
import {
  useDeleteStudentMutation,
  useGetStudentByIdQuery,
  useGetStudentPaymentsQuery,
  useSetStudentStatusMutation,
} from "@/redux/students/students-api";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useGetStudentByIdQuery(id);
  const { data: pay } = useGetStudentPaymentsQuery(id);
  const [setStatus, { isLoading: statusBusy }] = useSetStudentStatusMutation();
  const [deleteStudent] = useDeleteStudentMutation();

  const { confirm, dialog } = useConfirm();

  const student = data?.data;

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }
  if (isError || !student) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <Link href="/admin/classes" className="mt-3 inline-block font-semibold text-accent">
          ← Back
        </Link>
      </div>
    );
  }

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      notify.success(ok);
    } catch (err) {
      notify.error("Action failed", { description: extractApiError(err).message });
    }
  };

  const changeStatus = (action: "suspend" | "activate" | "graduate") =>
    run(() => setStatus({ id, action }).unwrap(), "Status updated");

  const onDelete = async () => {
    await run(() => deleteStudent(id).unwrap(), "Student deleted");
    router.push("/admin/classes");
  };

  const info: [string, string][] = [
    ["Phone", student.phone],
    ["Email", student.email ?? "—"],
    ["Location", student.location ?? "—"],
    ["Enrolled", formatDate(student.enrolledAt)],
    ["Graduated", formatDate(student.graduatedAt)],
    ["Suspended", formatDate(student.suspendedAt)],
  ];

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <Link href="/admin/classes" className="mb-4 inline-block text-[13.5px] font-semibold text-accent">
        ← Back
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(26px,3.4vw,36px)] font-normal">{student.fullName}</h1>
          <div className="mt-1 text-[13.5px] text-ink/55">
            {student.code}
            {student.training ? (
              <>
                {" · "}
                <Link href={`/admin/classes/${student.training.id}`} className="font-semibold text-accent">
                  {student.training.name}
                </Link>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {student.status !== "ACTIVE" ? (
            <Button
              variant="outline"
              isLoading={statusBusy}
              onClick={() =>
                confirm({
                  title: "Reactivate this student?",
                  description: "They will be marked active again.",
                  confirmText: "Reactivate",
                  onConfirm: () => changeStatus("activate"),
                })
              }
            >
              Reactivate
            </Button>
          ) : null}
          {student.status === "ACTIVE" ? (
            <Button
              variant="outline"
              isLoading={statusBusy}
              onClick={() =>
                confirm({
                  title: "Suspend this student?",
                  description: "They will be marked suspended.",
                  confirmText: "Suspend",
                  onConfirm: () => changeStatus("suspend"),
                })
              }
            >
              Suspend
            </Button>
          ) : null}
          {student.status !== "GRADUATED" ? (
            <Button
              variant="outline"
              isLoading={statusBusy}
              onClick={() =>
                confirm({
                  title: "Graduate this student?",
                  description: "This marks the student as graduated.",
                  confirmText: "Graduate",
                  onConfirm: () => changeStatus("graduate"),
                })
              }
            >
              Graduate
            </Button>
          ) : null}
          <Button
            variant="danger"
            onClick={() =>
              confirm({
                title: "Delete this student?",
                description: "This removes the student record. This can't be undone from here.",
                confirmText: "Delete student",
                isDestructive: true,
                onConfirm: onDelete,
              })
            }
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[18px]">
        <Card className="p-[clamp(20px,3vw,28px)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-[19px]">Details</h2>
            <StatusBadge status={student.status} />
          </div>
          <div className="grid gap-2.5">
            {info.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 text-[14px]">
                <span className="text-ink/55">{label}</span>
                <span className="font-medium text-ink">{value}</span>
              </div>
            ))}
          </div>
          {student.notes ? (
            <p className="mt-4 border-t border-ink/10 pt-4 text-[14px] leading-[1.6] text-ink/70">
              {student.notes}
            </p>
          ) : null}
        </Card>

        <Card className="p-[clamp(20px,3vw,28px)]">
          <h2 className="mb-4 font-serif text-[19px]">Payments</h2>
          {pay ? (
            <>
              <div className="grid gap-1.5 text-[14px]">
                <div className="flex justify-between gap-4">
                  <span className="text-ink/55">Due</span>
                  <span className="font-medium">{formatMoney(pay.data.summary.amountDue, pay.data.summary.currency)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-ink/55">Paid</span>
                  <span className="font-medium">{formatMoney(pay.data.summary.amountPaid, pay.data.summary.currency)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-ink/55">Balance</span>
                  <span className="font-semibold">{formatMoney(pay.data.summary.balance, pay.data.summary.currency)}</span>
                </div>
                <div className="mt-1">
                  <StatusBadge status={pay.data.summary.paymentStatus} />
                </div>
              </div>
              <div className="mt-4 grid gap-2 border-t border-ink/10 pt-4">
                {pay.data.payments.length === 0 ? (
                  <p className="text-[13.5px] text-ink/50">No payments yet.</p>
                ) : (
                  pay.data.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 text-[13.5px]">
                      <span className="font-medium">{formatMoney(p.amount, p.currency)}</span>
                      <span className="text-ink/55">{p.method.replace("_", " ")}</span>
                      <StatusBadge status={p.status} />
                      <span className="text-ink/45">{formatDateTime(p.paidAt ?? null)}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p className="text-[14px] text-ink/50">Loading…</p>
          )}
        </Card>
      </div>

      {dialog}
    </div>
  );
}
