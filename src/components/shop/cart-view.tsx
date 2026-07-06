"use client";

import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/lib/cart-store";
import { formatMoney } from "@/lib/format-money";
import { FALLBACK_PRODUCT_IMG, leadLabel } from "@/lib/shop-data";

export function CartView() {
  const { lines, hydrated, subtotal, maxLeadDays, changeQty, remove } =
    useCart();

  const earliestNote =
    maxLeadDays <= 0
      ? "today"
      : maxLeadDays === 1
        ? "tomorrow morning"
        : `in ${maxLeadDays} days${maxLeadDays >= 3 ? " (your cake needs its time)" : ""}`;

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
        Everything below is baked specifically for you. Review it, then check
        out - pay online or when you collect.
      </p>

      {!hydrated ? (
        <div className="py-16 text-center text-[15.5px] text-ink/50">
          Loading your order…
        </div>
      ) : lines.length === 0 ? (
        <EmptyState
          title="Nothing here yet."
          description="Pick something - we'll bake it fresh for your date."
          action={{ label: "Browse the bakes", href: routes.shop }}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-[20px] border border-ink/10 bg-card">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex flex-wrap items-center gap-x-5 gap-y-4 border-b border-ink/[0.09] px-[clamp(18px,3vw,28px)] py-[clamp(16px,2.5vw,24px)]"
              >
                <Image
                  src={line.image ?? FALLBACK_PRODUCT_IMG}
                  alt={line.name}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-[14px] object-cover"
                />
                <div className="min-w-0 flex-[1_1_160px]">
                  <Link
                    href={`/shop/${line.slug}`}
                    className="font-serif text-[19px] text-ink no-underline"
                  >
                    {line.name}
                  </Link>
                  <div className="mt-[3px] text-[14px] text-ink/60">
                    {formatMoney(line.price)} · {leadLabel(line.leadTimeDays)}
                  </div>
                </div>
                <div className="flex items-center overflow-hidden rounded-full border-[1.5px] border-ink/20">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.name} quantity`}
                    onClick={() => changeQty(line.id, -1)}
                    className="h-[42px] w-[42px] cursor-pointer border-none bg-transparent text-[18px] text-ink transition-colors hover:bg-ink/[0.07]"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-[16px] font-semibold">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${line.name} quantity`}
                    onClick={() => changeQty(line.id, 1)}
                    className="h-[42px] w-[42px] cursor-pointer border-none bg-transparent text-[18px] text-ink transition-colors hover:bg-ink/[0.07]"
                  >
                    +
                  </button>
                </div>
                <div className="min-w-24 text-right font-serif text-[18px]">
                  {formatMoney(line.price * line.qty)}
                </div>
                <button
                  type="button"
                  title="Remove"
                  aria-label={`Remove ${line.name}`}
                  onClick={() => remove(line.id)}
                  className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-full border-none bg-transparent text-[18px] text-ink/45 transition-colors hover:bg-accent/10 hover:text-accent"
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3.5 p-[clamp(20px,3vw,28px)]">
              <div>
                <div className="text-[13px] uppercase tracking-[0.1em] text-ink/55">
                  Subtotal
                </div>
                <div className="mt-1 font-serif text-[clamp(24px,3vw,32px)]">
                  {formatMoney(subtotal)}
                </div>
                <div className="mt-1 text-[13px] text-ink/55">
                  Earliest pickup is {earliestNote}.
                </div>
              </div>
              <Link
                href={routes.shopCheckout}
                className="cursor-pointer rounded-full border-none bg-accent px-9 py-[17px] font-sans text-[15.5px] font-semibold tracking-[0.06em] text-[#FDFAF3] no-underline transition-colors hover:bg-ink"
              >
                Checkout →
              </Link>
            </div>
          </div>
          <p className="mt-[18px] text-center text-[13.5px] text-ink/55">
            Pay online (card / MoMo via Paystack) or when you collect - your
            choice at checkout.
          </p>
        </>
      )}
    </section>
  );
}
