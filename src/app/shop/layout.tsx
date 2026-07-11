import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartButton } from "@/components/shop/cart-button";
import { CartProvider } from "@/lib/cart-store";
import { routes } from "@/lib/routes";

const NAV_LINKS = [
  { label: "Home", href: routes.home },
  { label: "Track order", href: routes.shopTrack },
  { label: "Trainings", href: routes.trainings },
  { label: "Contact", href: routes.contact },
];

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col overflow-x-clip bg-cream text-ink">
        <SiteHeader navLinks={NAV_LINKS} action={<CartButton />} mobileMenu />
        <main className="flex-1">{children}</main>
        <SiteFooter cta={{ label: "Order custom bakes", href: routes.shop }} />
      </div>
    </CartProvider>
  );
}
