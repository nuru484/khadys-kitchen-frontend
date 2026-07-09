import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { FeaturedBakes } from "@/components/landing/featured-bakes";
import { FeaturedTrainings } from "@/components/landing/featured-trainings";
import { Story } from "@/components/landing/story";
import { BakeSchoolCta } from "@/components/landing/bake-school-cta";
import { SiteFooter } from "@/components/layout/site-footer";
import { routes } from "@/lib/routes";

const NAV_LINKS = [
  { label: "Shop", href: routes.shop },
  { label: "About", href: "#about" },
  { label: "Contact", href: routes.contact },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream text-ink">
      <SiteHeader
        navLinks={NAV_LINKS}
        cta={{ label: "Trainings", href: routes.trainings }}
        mobileMenu
        announcement={
          <>
            Baking classes now enrolling in Kumasi -{" "}
            <Link
              href={routes.trainings}
              className="font-semibold text-accent no-underline"
            >
              explore our trainings →
            </Link>
          </>
        }
      />
      <main>
        <Hero />
        <Marquee />
        <FeaturedBakes />
        <Story />
        <FeaturedTrainings />
        <BakeSchoolCta />
      </main>
      <SiteFooter cta={{ label: "Order custom bakes", href: routes.shop }} />
    </div>
  );
}
