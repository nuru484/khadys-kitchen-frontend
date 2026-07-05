import Link from "next/link";
import { SiteHeader } from "@/components/bake-school/site-header";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { FeaturedBakes } from "@/components/landing/featured-bakes";
import { Story } from "@/components/landing/story";
import { BakeSchoolCta } from "@/components/landing/bake-school-cta";
import { SiteFooter } from "@/components/bake-school/site-footer";
import { routes } from "@/lib/routes";

const NAV_LINKS = [
  { label: "The Bakes", href: "#bakes" },
  { label: "Shop", href: routes.shop },
  { label: "Our Story", href: "#story" },
  { label: "Bake School", href: "#school" },
  { label: "Contact", href: routes.contact },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream text-ink">
      <SiteHeader
        navLinks={NAV_LINKS}
        cta={{ label: "Apply for classes", href: routes.apply }}
        mobileMenu
        announcement={
          <>
            Baking classes now enrolling in Kumasi —{" "}
            <Link
              href={routes.apply}
              className="font-semibold text-accent no-underline"
            >
              apply for the next cohort →
            </Link>
          </>
        }
      />
      <main>
        <Hero />
        <Marquee />
        <FeaturedBakes />
        <Story />
        <BakeSchoolCta />
      </main>
      <SiteFooter cta={{ label: "Apply for classes →", href: routes.apply }} />
    </div>
  );
}
