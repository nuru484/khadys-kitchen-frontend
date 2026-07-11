import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { FeaturedBakes } from "@/components/landing/featured-bakes";
import { FeaturedTrainings } from "@/components/landing/featured-trainings";
import { Story } from "@/components/landing/story";
import { BakeSchoolCta } from "@/components/landing/bake-school-cta";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  fetchFeaturedProducts,
  fetchFeaturedTrainings,
  fetchPublicAbout,
} from "@/lib/public-api";
import { routes } from "@/lib/routes";

const NAV_LINKS = [
  { label: "Shop", href: routes.shop },
  { label: "About", href: "#about" },
  { label: "Gallery", href: routes.gallery },
  { label: "Contact", href: routes.contact },
];

export default async function LandingPage() {
  // Fetched server-side with a revalidate window (see public-api.ts), so
  // these sections are cached HTML — reloads never show skeletons. Admin
  // saves call /api/revalidate to refresh the cache immediately.
  const [featuredProducts, featuredTrainings, about] = await Promise.all([
    fetchFeaturedProducts(),
    fetchFeaturedTrainings(),
    fetchPublicAbout(),
  ]);
  return (
    <div className="min-h-screen overflow-x-clip bg-cream text-ink">
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
        <FeaturedBakes products={featuredProducts} />
        <Story about={about} />
        <FeaturedTrainings trainings={featuredTrainings} />
        <BakeSchoolCta />
      </main>
      <SiteFooter cta={{ label: "Order custom bakes", href: routes.shop }} />
    </div>
  );
}
