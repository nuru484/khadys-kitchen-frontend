import { Suspense } from "react";
import { OrderTracker } from "@/components/shop/order-tracker";
import { RippleLoader } from "@/components/ui/Loader";
import { pageMetadata } from "@/lib/seo";

// Transactional, per-visitor page - kept out of the index.
export const metadata = pageMetadata({
  title: "Track your order",
  description:
    "Track your Khady's Kitchen order, see what you owe, and pay online.",
  path: "/shop/orders",
  index: false,
});

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <section className="mx-auto max-w-[720px] px-[clamp(20px,5vw,48px)] py-[clamp(36px,5vw,64px)]">
      <Suspense
        fallback={
          <div className="grid min-h-[40vh] place-items-center">
            <RippleLoader />
          </div>
        }
      >
        <OrderTracker code={code} />
      </Suspense>
    </section>
  );
}
