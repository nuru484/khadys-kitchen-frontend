"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/admin/ui";
import { RecordPaymentModal } from "@/components/admin/record-payment-modal";
import { PageActions } from "@/components/admin/page-actions";
import { useConfirm } from "@/components/admin/use-confirm";
import {
  orderActionsFor,
  ORDER_CONFIRM_COPY as CONFIRM_COPY,
} from "@/lib/admin/order-actions";
import { useAuthRole } from "@/hooks/use-auth-role";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDate, formatDateTime } from "@/lib/format-date";
import {
  useGetOrderByIdQuery,
  useGetOrderPaymentsQuery,
  useSetOrderStatusMutation,
} from "@/redux/orders/orders-api";
import { useRefundPaymentMutation } from "@/redux/payments/payments-api";
import type { OrderStatus } from "@/types/order.types";

/** Which lifecycle buttons each status offers (mirrors the backend's
 * transition table — collection additionally requires a settled balance). */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useGetOrderByIdQuery(id);
  const { data: pay } = useGetOrderPaymentsQuery(id);
  const [setStatus, { isLoading: statusBusy }] = useSetOrderStatusMutation();
  const [refund] = useRefundPaymentMutation();
  const { isAdmin } = useAuthRole();

  const { confirm, dialog } = useConfirm();
  const [recording, setRecording] = useState(false);

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }
  if (isError || !order) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <Link href="/admin/orders" className="mt-3 inline-block font-semibold text-accent">
          ← All orders
        </Link>
      </div>
    );
  }

  const doAction = async (action: "confirm" | "ready" | "collect" | "cancel") => {
    try {
      await setStatus({ id, action }).unwrap();
      notify.success("Order updated");
    } catch (err) {
      notify.error("Couldn't update the order", {
        description: extractApiError(err).message,
      });
    }
  };

  const doRefund = async (paymentId: string) => {
    try {
      await refund({ paymentId, orderId: id }).unwrap();
      notify.success("Payment reversed");
    } catch (err) {
      notify.error("Couldn't reverse", { description: extractApiError(err).message });
    }
  };

  const info: [string, React.ReactNode][] = [
    ["Phone", order.phone],
    ["Email", order.email ?? "—"],
    ["Pickup", order.pickupDate ? formatDate(order.pickupDate) : "—"],
    ["Placed", formatDateTime(order.createdAt)],
    ["Source", order.source === "ADMIN" ? "Walk-in (admin)" : "Online shop"],
  ];

  const timeline: [string, string | null][] = [
    ["Confirmed", order.confirmedAt],
    ["Ready", order.readyAt],
    ["Collected", order.collectedAt],
    ["Cancelled", order.cancelledAt],
  ];

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <Link href="/admin/orders" className="mb-4 inline-block text-[13.5px] font-semibold text-accent">
        ← All orders
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-serif text-[clamp(26px,3.4vw,36px)] font-normal">
            {order.fullName}
          </h1>
          <div className="mt-1 text-[13.5px] text-ink/55">
            {order.code}
            {order.customerId ? (
              <>
                {" · "}
                <Link
                  href={`/admin/customers/${order.customerId}`}
                  className="font-semibold text-accent"
                >
                  Customer history
                </Link>
              </>
            ) : null}
          </div>
        </div>
        <PageActions
          actions={orderActionsFor(order.status, isAdmin).map((a, i) => ({
            label: a.label,
            variant: a.variant,
            isLoading: statusBusy,
            // The natural next transition stays visible on phones.
            primary: i === 0 && a.action !== "cancel",
            onClick: () =>
              confirm({
                title: CONFIRM_COPY[a.action].title,
                description: CONFIRM_COPY[a.action].description,
                confirmText: a.label,
                isDestructive: a.action === "cancel",
                onConfirm: () => doAction(a.action),
              }),
          }))}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[18px]">
        <Card className="p-[clamp(20px,3vw,28px)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-[19px]">Order</h2>
            <StatusBadge status={order.status} />
          </div>
          <div className="grid gap-2.5">
            {info.map(([label, value]) => (
              <div key={label as string} className="flex justify-between gap-4 text-[14px]">
                <span className="text-ink/55">{label}</span>
                <span className="font-medium text-ink">{value}</span>
              </div>
            ))}
          </div>
          {order.note ? (
            <p className="mt-4 border-t border-ink/10 pt-4 text-[14px] leading-[1.6] text-ink/70">
              “{order.note}”
            </p>
          ) : null}
          <div className="mt-4 grid gap-1.5 border-t border-ink/10 pt-4 text-[13px] text-ink/55">
            {timeline
              .filter(([, at]) => at)
              .map(([label, at]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span>{label}</span>
                  <span>{formatDateTime(at)}</span>
                </div>
              ))}
          </div>
        </Card>

        <Card className="p-[clamp(20px,3vw,28px)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-[19px]">Bill</h2>
            <StatusBadge status={order.paymentStatus} />
          </div>
          <div className="grid gap-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-[14px]">
                <span className="text-ink/70">
                  {item.productId ? (
                    <Link
                      href={`/admin/items/${item.productId}`}
                      className="text-ink/70 underline decoration-ink/25 underline-offset-2 hover:text-accent"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    item.name
                  )}
                  <span className="text-ink/45"> × {item.quantity}</span>
                </span>
                <span className="font-medium">
                  {formatMoney(item.lineTotal, order.currency)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-1.5 border-t border-ink/10 pt-3 text-[14px]">
            <Row label="Total" value={formatMoney(order.total, order.currency)} />
            <Row label="Paid" value={formatMoney(order.amountPaid, order.currency)} />
            <Row
              label="Balance"
              value={formatMoney(order.balance, order.currency)}
              strong
            />
          </div>
        </Card>
      </div>

      <Card className="mt-[18px] p-[clamp(20px,3vw,28px)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-[19px]">Payments</h2>
          {order.status !== "CANCELLED" && order.balance > 0 ? (
            <Button size="sm" onClick={() => setRecording(true)}>
              Record payment
            </Button>
          ) : null}
        </div>
        {pay && pay.data.length > 0 ? (
          <div className="grid gap-2">
            {pay.data.map((p) => (
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
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-ink/50">No payments recorded yet.</p>
        )}
      </Card>

      <RecordPaymentModal
        owner={{ kind: "order", id }}
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
