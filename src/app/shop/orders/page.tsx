import { TrackOrderEntry } from "@/components/shop/track-order-entry";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Track your order",
  description:
    "Enter the order code we texted you to check whether your bake is being made, ready for pickup, or collected.",
  path: "/shop/orders",
});

/** Public "where's my order?" page — the code was texted/emailed at checkout. */
export default function TrackOrderPage() {
  return (
    <section className="mx-auto max-w-[640px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,8vw,96px)]">
      <TrackOrderEntry />
    </section>
  );
}
