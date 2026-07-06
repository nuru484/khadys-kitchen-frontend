import { Suspense } from "react";
import { ShopVerifyClient } from "@/components/shop/shop-verify-client";
import { RippleLoader } from "@/components/ui/Loader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Confirming your payment",
  description: "Confirming your Khady's Kitchen order payment.",
  path: "/shop/verify",
  index: false,
});

export default function ShopVerifyPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 py-16">
      <Suspense fallback={<RippleLoader />}>
        <ShopVerifyClient />
      </Suspense>
    </div>
  );
}
