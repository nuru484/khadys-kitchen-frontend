import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { GalleryShowcase } from "@/components/gallery/gallery-showcase";
import { fetchPublicGalleryList } from "@/lib/public-api";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gallery",
  description:
    "A look inside Khady's Kitchen - fresh bakes, the ovens at work and our bake-school classes in Kumasi, in photos.",
  path: "/gallery",
  keywords: [
    "Khady's Kitchen photos",
    "bakery Kumasi",
    "fresh bread Kumasi",
    "baking classes Ghana photos",
  ],
});

const NAV_LINKS = [
  { label: "← Home", href: routes.home },
  { label: "Shop", href: routes.shop },
  { label: "Trainings", href: routes.trainings },
  { label: "Contact", href: routes.contact },
];

export default async function GalleryPage() {
  // Fetch the photos server-side so the page is real HTML for crawlers; the
  // client showcase hydrates over it and adds the slideshow behaviour.
  const initialImages = await fetchPublicGalleryList();
  return (
    <div className="min-h-screen overflow-x-clip bg-cream text-ink">
      <SiteHeader
        navLinks={NAV_LINKS}
        cta={{ label: "Order custom bakes", href: routes.shop }}
        mobileMenu
      />
      <main>
        {/* Compact hero — the photos below are the point of the page. */}
        <section className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] pb-[clamp(28px,4vw,48px)] pt-[clamp(40px,6vw,72px)]">
          <div style={{ animation: "kk-rise 0.8s ease both" }}>
            <p className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.24em] text-accent">
              Inside the kitchen
            </p>
            <h1 className="mb-5 max-w-[18ch] font-serif text-[clamp(38px,5vw,68px)] font-normal leading-[1.06]">
              Fresh from <em className="not-italic text-accent">Khady&rsquo;s</em>{" "}
              ovens.
            </h1>
            <p className="max-w-[56ch] text-[clamp(16px,1.5vw,18px)] leading-[1.65] text-ink/70">
              The bakes, the bakers and the busy mornings - a running photo
              diary of what&rsquo;s happening in our Kumasi kitchen.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] pb-[clamp(56px,8vw,100px)]">
          <GalleryShowcase initialImages={initialImages} />
        </section>
      </main>
      <SiteFooter cta={{ label: "Order custom bakes", href: routes.shop }} />
    </div>
  );
}
