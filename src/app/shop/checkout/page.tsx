import Link from "next/link";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

// Transactional, per-visitor page - kept out of the index.
export const metadata = pageMetadata({
  title: "Checkout",
  description:
    "Check out your custom Khady's Kitchen order - pay online or when you collect in Kumasi.",
  path: "/shop/checkout",
  index: false,
});

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-[1080px] px-[clamp(20px,5vw,48px)] py-[clamp(36px,5vw,64px)]">
      <Link
        href={routes.shopCart}
        className="mb-[clamp(24px,3vw,36px)] inline-block text-[14px] font-semibold uppercase tracking-[0.08em] text-ink/65 no-underline transition-colors hover:text-accent"
      >
        ← Back to your order
      </Link>
      <h1 className="mb-2 font-serif text-[clamp(32px,4vw,48px)] font-normal">
        <span className="block overflow-hidden">
          <span
            className="inline-block"
            style={{ animation: "kk-lineup .9s .1s cubic-bezier(.16,.84,.28,1) both" }}
          >
            Checkout
          </span>
        </span>
      </h1>
      <p
        className="mb-[clamp(24px,3vw,36px)] max-w-[52ch] text-[15.5px] leading-[1.6] text-ink/65"
        style={{ animation: "kk-fadein .7s .3s both" }}
      >
        No account needed - just tell us who to bake for. We&rsquo;ll text your
        order code so you can track it and pay any time.
      </p>
      <CheckoutForm />
    </section>
  );
}
