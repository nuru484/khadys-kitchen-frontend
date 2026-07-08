"use client";

import { useState } from "react";
import Link from "next/link";
import { BackLink } from "@/components/admin/back-link";
import { useParams } from "next/navigation";
import { Card } from "@/components/admin/ui";
import { RecordPaymentModal } from "@/components/admin/record-payment-modal";
import { useConfirm } from "@/components/admin/use-confirm";
import { StatusPicker } from "@/components/admin/status-picker";
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

/** Which lifecycle buttons each status offers (mirrors the backend's
 * transition table — collection additionally requires a settled balance). */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useGetOrderByIdQuery(id);
  const { data: pay } = useGetOrderPaymentsQuery(id);
  const [setStatus] = useSetOrderStatusMutation();
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
        <BackLink href="/admin/orders" className="mt-3">
          ← All orders
        </BackLink>
      </div>
    );
  }

  const doAction = async (
    action: "confirm" | "process" | "ready" | "collect" | "cancel",
  ) => {
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
      notify.error("Couldn't reverse", {
        description: extractApiError(err).message,
      });
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
    ["Processing", order.processingAt],
    ["Ready", order.readyAt],
    ["Collected", order.collectedAt],
    ["Cancelled", order.cancelledAt],
  ];

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <BackLink href="/admin/orders">
        ← All orders
      </BackLink>

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
      </div>

      {/* Order details on the left; Bill + Payments stack in the right column
          so both sides carry weight — no tall card beside a short, empty one. */}
      <div className="grid items-start gap-[18px] lg:grid-cols-2">
        <Card className="p-[clamp(20px,3vw,28px)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-[19px]">Order</h2>
            <StatusPicker
              status={order.status}
              options={orderActionsFor(order.status, isAdmin).map((a) => ({
                value: a.action,
                label: a.label,
                danger: a.action === "cancel",
              }))}
              onSelect={(action) => {
                const t = orderActionsFor(order.status, isAdmin).find(
                  (a) => a.action === action,
                );
                confirm({
                  title: CONFIRM_COPY[action].title,
                  description: CONFIRM_COPY[action].description,
                  confirmText: t?.label ?? "Confirm",
                  isDestructive: action === "cancel",
                  onConfirm: () => doAction(action),
                });
              }}
            />
          </div>
          <div className="grid gap-2.5">
            {info.map(([label, value]) => (
              <div
                key={label as string}
                className="flex flex-col gap-0.5 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-4 text-[14px]"
              >
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
                <div key={label} className="flex flex-col gap-0.5 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-4">
                  <span>{label}</span>
                  <span>{formatDateTime(at)}</span>
                </div>
              ))}
          </div>
        </Card>

        <div className="grid content-start gap-[18px]">
          <Card className="p-[clamp(20px,3vw,28px)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-serif text-[19px]">Bill</h2>
              <StatusBadge status={order.paymentStatus} />
            </div>
            <div className="grid gap-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-0.5 min-[480px]:flex-row min-[480px]:justify-between min-[480px]:gap-4 text-[14px]"
                >
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
              <Row
                label="Total"
                value={formatMoney(order.total, order.currency)}
              />
              <Row
                label="Paid"
                value={formatMoney(order.amountPaid, order.currency)}
              />
              <Row
                label="Balance"
                value={formatMoney(order.balance, order.currency)}
                strong
              />
            </div>
          </Card>

          <Card className="p-[clamp(20px,3vw,28px)]">
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
                      <span className="font-semibold">
                        {formatMoney(p.amount, p.currency)}
                      </span>
                      <span className="text-ink/55">
                        {p.method.replace("_", " ")}
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-right text-[13px] text-ink/50">
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
              <p className="text-[14px] text-ink/50">
                No payments recorded yet.
              </p>
            )}
          </Card>
        </div>
      </div>

      <RecordPaymentModal
        owner={{ kind: "order", id }}
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
    <div className="flex justify-between gap-4">
      <span className="text-ink/55">{label}</span>
      <span
        className={strong ? "font-semibold text-ink" : "font-medium text-ink"}
      >
        {value}
      </span>
    </div>
  );
}
