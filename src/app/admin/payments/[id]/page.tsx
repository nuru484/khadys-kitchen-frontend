"use client";

import Link from "next/link";
import { BackLink } from "@/components/admin/back-link";
import { useParams } from "next/navigation";
import { Card } from "@/components/admin/ui";
import { useConfirm } from "@/components/admin/use-confirm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDateTime } from "@/lib/format-date";
import { useAuthRole } from "@/hooks/use-auth-role";
import {
  useGetPaymentByIdQuery,
  useRefundPaymentMutation,
} from "@/redux/payments/payments-api";

const titleCase = (s: string) =>
  s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ");

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-4 border-b border-ink/[0.08] py-3 last:border-0 min-[480px]:items-start">
      <span className="flex-none text-[13.5px] text-ink/55">{label}</span>
      <span className="min-w-0 text-[14.5px] font-medium text-ink [overflow-wrap:anywhere] min-[480px]:text-right">
        {children}
      </span>
    </div>
  );
}

/** The full record behind a ledger row: what it paid for, amounts, method,
 * and the paid/reversed dates — with the reverse action for admins. */
export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } =
    useGetPaymentByIdQuery(id);
  const [refund, { isLoading: reversing }] = useRefundPaymentMutation();
  const { isAdmin } = useAuthRole();
  const { confirm, dialog } = useConfirm();

  const payment = data?.data;

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }
  if (isError || !payment) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <BackLink href="/admin/payments" className="mt-3">
          ← All payments
        </BackLink>
      </div>
    );
  }

  const doRefund = async () => {
    try {
      await refund({
        paymentId: payment.id,
        orderId: payment.order?.id,
        applicationId: payment.application?.id,
      }).unwrap();
      notify.success("Payment reversed");
    } catch (err) {
      notify.error("Couldn't reverse", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <div style={{ animation: "kk-rise .5s both" }} className="max-w-[640px]">
      <BackLink href="/admin/payments">
        ← All payments
      </BackLink>

      <div className="mb-5 min-w-0">
        <h1 className="font-serif text-[clamp(26px,3.4vw,36px)] font-normal">
          {formatMoney(payment.amount, payment.currency)}
        </h1>
        <div className="mt-1 break-all text-[13.5px] text-ink/55">
          {payment.reference}
        </div>
      </div>

      <Card className="p-[clamp(20px,3vw,28px)]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[19px]">Payment</h2>
          <div className="flex items-center gap-3">
            <StatusBadge status={payment.status} />
            {isAdmin && payment.status === "SUCCESS" ? (
              <Button
                variant="danger"
                size="sm"
                isLoading={reversing}
                loadingText="Reversing…"
                onClick={() =>
                  confirm({
                    title: "Reverse this payment?",
                    description:
                      "Paystack payments are refunded via Paystack; cash/MoMo are marked reversed. The owning order or application is re-credited.",
                    confirmText: "Reverse payment",
                    isDestructive: true,
                    onConfirm: doRefund,
                  })
                }
              >
                Reverse
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid">
          <Row label="For">
            {payment.order ? (
              <Link
                href={`/admin/orders/${payment.order.id}`}
                className="font-semibold text-accent"
              >
                Order {payment.order.code} · {payment.order.fullName}
              </Link>
            ) : payment.application ? (
              <Link
                href={`/admin/applications/${payment.application.id}`}
                className="font-semibold text-accent"
              >
                {payment.application.code} · {payment.application.fullName} ·{" "}
                {payment.application.trainingName}
              </Link>
            ) : (
              "—"
            )}
          </Row>
          <Row label="Method">{titleCase(payment.method)}</Row>
          <Row label="Paid">{formatDateTime(payment.paidAt ?? null)}</Row>
          {payment.reversedAt ? (
            <Row label="Reversed">{formatDateTime(payment.reversedAt)}</Row>
          ) : null}
          <Row label="Recorded">{formatDateTime(payment.createdAt)}</Row>
          {payment.note ? <Row label="Note">{payment.note}</Row> : null}
        </div>
      </Card>
      {dialog}
    </div>
  );
}
