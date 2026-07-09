import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { TrainingsCatalogue } from "@/components/trainings/trainings-catalogue";
import { fetchPublicTrainingList } from "@/lib/public-api";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Trainings",
  description:
    "Hands-on baking classes in Kumasi - bread, pastry and cake courses taught in a working kitchen. See dates, fees and apply.",
  path: "/trainings",
  keywords: [
    "baking classes Kumasi",
    "bakery training Ghana",
    "wedding cake classes Kumasi",
    "pastry course Ghana",
    "learn to bake Kumasi",
  ],
});

const NAV_LINKS = [
  { label: "← Home", href: routes.home },
  { label: "Shop", href: routes.shop },
  { label: "Contact", href: routes.contact },
];

export default async function TrainingsPage() {
  // Fetch the catalogue server-side so the list is real HTML for crawlers; the
  // client catalogue hydrates over it and keeps filtering/apply behaviour.
  const initialTrainings = await fetchPublicTrainingList();
  return (
    <div className="min-h-screen overflow-x-hidden bg-cream text-ink">
      <SiteHeader
        navLinks={NAV_LINKS}
        cta={{ label: "Contact us", href: routes.contact }}
        mobileMenu
      />
      <main>
        {/* Compact hero — the catalogue below is the point of the page. */}
        <section className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] pb-[clamp(28px,4vw,48px)] pt-[clamp(40px,6vw,72px)]">
          <div style={{ animation: "kk-rise 0.8s ease both" }}>
            <p className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.24em] text-accent">
              Khady&rsquo;s Kitchen Trainings
            </p>
            <h1 className="mb-5 max-w-[16ch] font-serif text-[clamp(38px,5vw,68px)] font-normal leading-[1.06]">
              Learn to bake the way{" "}
              <em className="not-italic text-accent">Khady</em> does.
            </h1>
            <p className="max-w-[56ch] text-[clamp(16px,1.5vw,18px)] leading-[1.65] text-ink/70">
              Hands-on classes in Kumasi for every level - pick a class below,
              see exactly what it covers and costs, and apply in minutes.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] pb-[clamp(56px,8vw,100px)]">
          <TrainingsCatalogue initialTrainings={initialTrainings} />
        </section>
      </main>
      <SiteFooter cta={{ label: "Order custom bakes", href: routes.shop }} />
    </div>
  );
}
