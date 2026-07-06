import { SiteHeader } from "@/components/bake-school/site-header";
import { ApplyContent } from "@/components/bake-school/apply-content";
import { SiteFooter } from "@/components/bake-school/site-footer";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Apply to the Bake School",
  description:
    "Learn to bake the way Khady does. A hands-on programme with weekly practicals, ingredients and tools provided. Apply to the next cohort in Kumasi.",
  path: "/apply",
  keywords: [
    "baking classes Kumasi",
    "bake school Ghana",
    "learn to bake Kumasi",
    "pastry course Ghana",
  ],
});

const NAV_LINKS = [
  { label: "← The Bakery", href: routes.home },
  { label: "Costs", href: "#costs" },
  { label: "What to bring", href: "#bring" },
  { label: "Shop", href: routes.shop },
  { label: "Contact", href: routes.contact },
];

export default function BakeSchoolApplyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream text-ink">
      <SiteHeader
        navLinks={NAV_LINKS}
        cta={{ label: "Apply now", href: "#apply" }}
        mobileMenu
      />
      <main>
        <ApplyContent />
      </main>
      <SiteFooter cta={{ label: "Order custom bakes", href: routes.shop }} />
    </div>
  );
}
