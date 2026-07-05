"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/lib/cart-store";
import {
  cartPriceLabel,
  formatPrice,
  getProduct,
  waitOptions,
} from "@/lib/shop-data";

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function CartView() {
  const { items, hydrated, changeQty, remove, clear } = useCart();
  const [needDate, setNeedDate] = useState("");
  const [wait, setWait] = useState<string | null>(null);
  const [orderError, setOrderError] = useState("");
  const [done, setDone] = useState(false);
  const [doneSummary, setDoneSummary] = useState("");

  const rows = useMemo(
    () =>
      items
        .map((ci) => {
          const p = getProduct(ci.id);
          return p ? { product: p, qty: ci.qty } : null;
        })
        .filter((r): r is { product: NonNullable<ReturnType<typeof getProduct>>; qty: number } => r !== null),
    [items],
  );

  const subtotal = rows.reduce((sum, r) => sum + r.product.price * r.qty, 0);
  const maxLead = rows.reduce((m, r) => Math.max(m, r.product.leadDays), 1);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + maxLead);
    return toDateStr(d);
  }, [maxLead]);

  const earliestNote =
    maxLead === 1
      ? "tomorrow morning"
      : `in ${maxLead} days${maxLead >= 3 ? " (your cake needs its time)" : ""}`;

  const checkout = () => {
    if (!needDate) {
      setOrderError(
        "Please choose the date you need your order — every bake is made custom.",
      );
      return;
    }
    if (needDate < minDate) {
      setOrderError(
        `That date is too soon — the longest bake in your order needs ${maxLead} day${maxLead > 1 ? "s" : ""}. Earliest is ${minDate}.`,
      );
      return;
    }
    if (!wait) {
      setOrderError(
        "Please choose how long you can wait, so we can slot you into the baking queue.",
      );
      return;
    }
    const when = new Date(`${needDate}T12:00:00`).toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    setDoneSummary(`Scheduled for ${when} · “${wait}”.`);
    clear();
    setNeedDate("");
    setWait(null);
    setOrderError("");
    setDone(true);
  };

  // ── Order placed ────────────────────────────────────────────────
  if (done) {
    return (
      <section className="mx-auto max-w-[640px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,7vw,88px)]">
        <div
          className="rounded-[22px] border border-ink/10 bg-card p-[clamp(36px,5vw,56px)] text-center"
          style={{ animation: "kk-fadein .7s both" }}
        >
          <div className="mx-auto mb-[22px] grid h-16 w-16 place-items-center rounded-full bg-accent text-[28px] text-[#FDFAF3]">
            ✓
          </div>
          <h1 className="mb-3 font-serif text-[clamp(26px,3vw,34px)] font-normal">
            Order received — it&rsquo;s in the queue.
          </h1>
          <p className="mb-2 text-[16px] leading-[1.65] text-ink/70">
            {doneSummary}
          </p>
          <p className="mb-7 text-[14.5px] text-ink/55">
            We&rsquo;ll confirm on WhatsApp before we bake. Pay when you collect —
            cash or MoMo.
          </p>
          <Link
            href={routes.shop}
            className="inline-block cursor-pointer rounded-full border-none bg-ink px-[30px] py-3.5 font-sans text-[15px] font-semibold text-cream no-underline transition-colors hover:bg-accent"
          >
            Back to the shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[820px] px-[clamp(20px,5vw,48px)] py-[clamp(36px,5vw,64px)]">
      <Link
        href={routes.shop}
        className="mb-[clamp(24px,3vw,36px)] inline-block text-[14px] font-semibold uppercase tracking-[0.08em] text-ink/65 no-underline transition-colors hover:text-accent"
      >
        ← Keep browsing
      </Link>
      <h1 className="mb-2 font-serif text-[clamp(32px,4vw,48px)] font-normal">
        <span className="block overflow-hidden">
          <span
            className="inline-block"
            style={{ animation: "kk-lineup .9s .1s cubic-bezier(.16,.84,.28,1) both" }}
          >
            Your custom order
          </span>
        </span>
      </h1>
      <p
        className="mb-[clamp(24px,3vw,36px)] text-[15.5px] leading-[1.6] text-ink/65"
        style={{ animation: "kk-fadein .7s .3s both" }}
      >
        Everything below is baked specifically for you — so we need to know when
        you need it.
      </p>

      {!hydrated ? (
        <div className="py-16 text-center text-[15.5px] text-ink/50">
          Loading your order…
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          dashed
          title="Nothing here yet."
          description="Pick something — we'll bake it fresh for your date."
          action={{ label: "Browse the bakes", href: routes.shop }}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-[20px] border border-ink/10 bg-card">
            {rows.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center gap-x-5 gap-y-4 border-b border-ink/[0.09] px-[clamp(18px,3vw,28px)] py-[clamp(16px,2.5vw,24px)]"
              >
                <Image
                  src={product.img}
                  alt={product.name}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-[14px] object-cover"
                />
                <div className="min-w-0 flex-[1_1_160px]">
                  <div className="font-serif text-[19px]">{product.name}</div>
                  <div className="mt-[3px] text-[14px] text-ink/60">
                    {cartPriceLabel(product)} · {product.lead}
                  </div>
                </div>
                <div className="flex items-center overflow-hidden rounded-full border-[1.5px] border-ink/20">
                  <button
                    type="button"
                    aria-label={`Decrease ${product.name} quantity`}
                    onClick={() => changeQty(product.id, -1)}
                    className="h-[42px] w-[42px] cursor-pointer border-none bg-transparent text-[18px] text-ink transition-colors hover:bg-ink/[0.07]"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-[16px] font-semibold">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${product.name} quantity`}
                    onClick={() => changeQty(product.id, 1)}
                    className="h-[42px] w-[42px] cursor-pointer border-none bg-transparent text-[18px] text-ink transition-colors hover:bg-ink/[0.07]"
                  >
                    +
                  </button>
                </div>
                <div className="min-w-24 text-right font-serif text-[18px]">
                  {formatPrice(product.price * qty)}
                </div>
                <button
                  type="button"
                  title="Remove"
                  aria-label={`Remove ${product.name}`}
                  onClick={() => remove(product.id)}
                  className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-full border-none bg-transparent text-[18px] text-ink/45 transition-colors hover:bg-accent/10 hover:text-accent"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Scheduling */}
            <div className="grid gap-5 border-b border-ink/[0.09] bg-cream p-[clamp(20px,3vw,28px)]">
              <div className="grid gap-2">
                <span className="text-[13.5px] font-semibold uppercase tracking-[0.06em] text-ink/70">
                  When do you need it?
                </span>
                <input
                  type="date"
                  value={needDate}
                  min={minDate}
                  onChange={(e) => {
                    setNeedDate(e.target.value);
                    setOrderError("");
                  }}
                  className="max-w-[260px] rounded-[12px] border-[1.5px] border-ink/20 bg-card px-4 py-[13px] font-sans text-[16px] text-ink outline-none focus:border-accent"
                />
                <span className="text-[13px] text-ink/55">
                  Earliest pickup is {earliestNote} — custom bakes need their time
                  in the oven.
                </span>
              </div>
              <div className="grid gap-2.5">
                <span className="text-[13.5px] font-semibold uppercase tracking-[0.06em] text-ink/70">
                  How long can you wait?
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {waitOptions.map((w) => {
                    const on = wait === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setWait(w);
                          setOrderError("");
                        }}
                        className={cn(
                          "cursor-pointer rounded-full border-[1.5px] px-5 py-[11px] text-left font-sans text-[14px] font-semibold transition-colors",
                          on
                            ? "border-accent bg-accent text-[#FDFAF3]"
                            : "border-ink/20 bg-transparent text-ink hover:border-ink/40",
                        )}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {orderError ? (
              <div className="mx-[clamp(18px,3vw,28px)] mt-4 rounded-[12px] border border-danger/25 bg-danger/[0.08] px-4 py-3 text-[14.5px] text-danger">
                {orderError}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3.5 p-[clamp(20px,3vw,28px)]">
              <div>
                <div className="text-[13px] uppercase tracking-[0.1em] text-ink/55">
                  Subtotal · pay at pickup
                </div>
                <div className="mt-1 font-serif text-[clamp(24px,3vw,32px)]">
                  {formatPrice(subtotal)}
                </div>
              </div>
              <button
                type="button"
                onClick={checkout}
                className="cursor-pointer rounded-full border-none bg-accent px-9 py-[17px] font-sans text-[15.5px] font-semibold tracking-[0.06em] text-[#FDFAF3] transition-colors hover:bg-ink"
              >
                Place custom order →
              </button>
            </div>
          </div>
          <p className="mt-[18px] text-center text-[13.5px] text-ink/55">
            We confirm every custom order on WhatsApp before baking. No payment is
            taken online.
          </p>
        </>
      )}
    </section>
  );
}
