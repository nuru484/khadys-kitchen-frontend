import { CartView } from "@/components/shop/cart-view";
import { pageMetadata } from "@/lib/seo";

// Transactional, per-visitor page — kept out of the index (also disallowed in robots).
export const metadata = pageMetadata({
  title: "Your order",
  description:
    "Review your custom Khady's Kitchen order, pick your pickup date, and place it — we confirm on WhatsApp before baking.",
  path: "/shop/cart",
  index: false,
});

export default function CartPage() {
  return <CartView />;
}
