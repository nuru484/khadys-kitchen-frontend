"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDate } from "@/lib/format-date";
import { routes, shopOrder } from "@/lib/routes";
import {
  usePayOrderByCodeMutation,
  useTrackOrderQuery,
} from "@/redux/orders/orders-api";
import type { IOrder, OrderStatus } from "@/types/order.types";

const STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: "PENDING", label: "Placed", hint: "We have your order" },
  { status: "CONFIRMED", label: "Confirmed", hint: "It's in the baking queue" },
  { status: "READY", label: "Ready", hint: "Waiting at the counter" },
  { status: "COLLECTED", label: "Collected", hint: "Enjoy!" },
];

const STEP_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  READY: 2,
  COLLECTED: 3,
  CANCELLED: -1,
};

/** "Find my order" fallback shown when a code doesn't resolve. */
function FindOrder() {
  const router = useRouter();
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const code = value.trim().toUpperCase();
        if (code) router.push(shopOrder(code));
      }}
      className="mx-auto mt-6 flex w-full max-w-[380px] gap-2.5"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. KK-O7F3K9QW2M"
        aria-label="Your order code"
        className="min-w-0 flex-1 rounded-full border-[1.5px] border-ink/20 bg-cream px-5 py-3 font-sans text-[15px] uppercase tracking-[0.04em] text-ink outline-none transition-colors focus:border-accent"
      />
      <Button type="submit" className="rounded-full">
        Find it
      </Button>
    </form>
  );
}

function PayBalance({ order }: { order: IOrder }) {
  const [payOrder, { isLoading }] = usePayOrderByCodeMutation();
  const [needEmail, setNeedEmail] = useState(false);
  const [email, setEmail] = useState("");

  const start = async () => {
    if (!order.email && !email.trim()) {
      setNeedEmail(true);
      return;
    }
    try {
      const res = await payOrder({
        code: order.code,
        email: order.email ? undefined : email.trim(),
      }).unwrap();
      window.location.assign(res.data.authorizationUrl);
    } catch (err) {
      notify.error("Couldn't start the payment", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <div className="grid gap-3 border-t border-ink/10 p-[clamp(20px,3vw,28px)]">
      {needEmail && !order.email ? (
        <label className="grid gap-2 text-[13.5px] font-semibold uppercase tracking-[0.06em] text-ink/70">
          Email for your receipt
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-[12px] border border-ink/20 bg-cream px-4 py-3.5 font-sans text-[16px] normal-case tracking-normal text-ink outline-none transition-colors focus:border-accent"
          />
        </label>
      ) : null}
      <Button
        size="lg"
        isLoading={isLoading}
        loadingText="Starting payment…"
        onClick={() => void start()}
        className="w-full rounded-full"
      >
        Pay {formatMoney(order.balance, order.currency)} online
      </Button>
      <p className="text-center text-[13px] text-ink/50">
        Secure card / MoMo payment via Paystack — or pay when you collect.
      </p>
    </div>
  );
}

export function OrderTracker({ code }: { code: string }) {
  const params = useSearchParams();
  const justPlaced = params.get("placed") === "1";
  const { data, isLoading, isError, error, refetch } = useTrackOrderQuery(code);
  const order = data?.data;

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }

  if (isError || !order) {
    const notFound =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 404;
    return notFound ? (
      <div className="text-center">
        <EmptyState
          title="We couldn't find that order."
          description="Double-check the code we texted you - it looks like KK-O followed by letters and numbers."
        />
        <FindOrder />
      </div>
    ) : (
      <ErrorState error={error} onRetry={() => void refetch()} />
    );
  }

  const stepIndex = STEP_INDEX[order.status];
  const cancelled = order.status === "CANCELLED";

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      {justPlaced && !cancelled ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-[#2E6B3F]/25 bg-[#2E6B3F]/10 px-5 py-4 text-[15px] text-[#2E6B3F]">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#2E6B3F] text-[15px] text-white">
            ✓
          </span>
          Order received - we&rsquo;ve texted your code to {order.phone}. Keep it
          safe; you&rsquo;ll quote it at pickup.
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/50">
            Your order code
          </div>
          <h1 className="font-serif text-[clamp(28px,4vw,40px)] tracking-[0.06em] text-accent">
            {order.code}
          </h1>
        </div>
        <StatusBadge
          status={order.status}
          label={order.status.charAt(0) + order.status.slice(1).toLowerCase()}
        />
      </div>

      {/* Status timeline */}
      <div className="mb-6 overflow-hidden rounded-[20px] border border-ink/10 bg-card p-[clamp(20px,3vw,28px)]">
        {cancelled ? (
          <div className="rounded-[12px] border border-danger/25 bg-danger/[0.08] px-4 py-3.5 text-[14.5px] text-danger">
            This order was cancelled
            {order.cancelledAt ? ` on ${formatDate(order.cancelledAt)}` : ""}.
            {order.amountPaid > 0
              ? " Your refund is being processed - contact us with your code if you have questions."
              : ""}
          </div>
        ) : (
          <ol className="grid gap-0 sm:grid-cols-4">
            {STEPS.map((step, i) => {
              const done = i <= stepIndex;
              const current = i === stepIndex;
              return (
                <li key={step.status} className="relative flex gap-3.5 pb-5 sm:block sm:pb-0">
                  {/* Connector: vertical on mobile, horizontal from sm up. */}
                  {i < STEPS.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-[13px] top-8 h-[calc(100%-36px)] w-0.5 sm:left-10 sm:right-2 sm:top-[13px] sm:h-0.5 sm:w-auto",
                        i < stepIndex ? "bg-accent" : "bg-ink/15",
                      )}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative z-10 grid h-7 w-7 flex-none place-items-center rounded-full border-[2px] text-[12px] font-bold",
                      done
                        ? "border-accent bg-accent text-[#FDFAF3]"
                        : "border-ink/25 bg-card text-ink/40",
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <div className="sm:mt-2.5">
                    <div
                      className={cn(
                        "text-[14.5px] font-semibold",
                        current ? "text-accent" : done ? "text-ink" : "text-ink/45",
                      )}
                    >
                      {step.label}
                    </div>
                    <div className="text-[12.5px] text-ink/50">{step.hint}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Items + money */}
      <div className="overflow-hidden rounded-[20px] border border-ink/10 bg-card">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 border-b border-ink/[0.09] px-[clamp(18px,3vw,28px)] py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="font-serif text-[17px]">{item.name}</div>
              <div className="text-[13px] text-ink/55">
                {formatMoney(item.unitAmount, order.currency)} × {item.quantity}
              </div>
            </div>
            <div className="font-serif text-[17px]">
              {formatMoney(item.lineTotal, order.currency)}
            </div>
          </div>
        ))}

        <div className="grid gap-1.5 border-b border-ink/[0.09] px-[clamp(18px,3vw,28px)] py-4 text-[14.5px]">
          <div className="flex justify-between gap-4">
            <span className="text-ink/55">Total</span>
            <span className="font-semibold">
              {formatMoney(order.total, order.currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink/55">Paid</span>
            <span className="font-semibold">
              {formatMoney(order.amountPaid, order.currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-ink/55">Balance</span>
            <span className="font-semibold">
              {formatMoney(order.balance, order.currency)}
            </span>
          </div>
          {order.pickupDate ? (
            <div className="flex justify-between gap-4">
              <span className="text-ink/55">Pickup</span>
              <span className="font-semibold">{formatDate(order.pickupDate)}</span>
            </div>
          ) : null}
        </div>

        {order.balance > 0 && !cancelled ? <PayBalance order={order} /> : null}
      </div>

      <p className="mt-5 text-center text-[13.5px] text-ink/55">
        Questions? Reach us on WhatsApp and quote your order code.{" "}
        <Link href={routes.shop} className="font-semibold text-accent underline">
          Back to the shop
        </Link>
      </p>
    </div>
  );
}
