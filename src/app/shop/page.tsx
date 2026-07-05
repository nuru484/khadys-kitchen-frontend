import { ShopHero } from "@/components/shop/shop-hero";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shop · Order custom bakes",
  description:
    "Every order is baked to order for pickup in Kumasi — croissants, sourdough, celebration cakes, bofrot and more. Nothing sits on a shelf.",
  path: "/shop",
  keywords: [
    "order bread Kumasi",
    "custom cakes Kumasi",
    "croissant order Ghana",
    "sourdough Kumasi",
    "celebration cake order",
  ],
});

export default function ShopPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,7vw,80px)]">
      <ShopHero />
      <ShopBrowser />
    </section>
  );
}
