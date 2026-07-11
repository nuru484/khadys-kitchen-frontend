import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Reveal } from "@/components/reveal";
import { routes } from "@/lib/routes";

const NAV_LINKS = [
  { label: "Home", href: routes.home },
  { label: "Shop", href: routes.shop },
  { label: "Trainings", href: routes.trainings },
  { label: "Contact", href: routes.contact },
];

export interface LegalSection {
  heading: string;
  /** Each string is a paragraph. */
  body: string[];
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Shared shell for the Privacy Policy and Terms pages: standard site chrome
 * plus a readable, on-brand prose column.
 */
export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream text-ink">
      <SiteHeader
        navLinks={NAV_LINKS}
        cta={{ label: "Order now", href: routes.shop }}
        mobileMenu
      />
      <main className="flex-1">
        <article className="mx-auto max-w-[760px] px-[clamp(20px,5vw,48px)] pb-[clamp(56px,8vw,96px)] pt-[clamp(48px,7vw,88px)]">
          <Reveal>
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-accent">
              {eyebrow}
            </p>
            <h1 className="mb-3 font-serif text-[clamp(34px,5vw,60px)] font-normal leading-[1.06]">
              {title}
            </h1>
            <p className="mb-2 text-[13px] uppercase tracking-[0.1em] text-ink/50">
              Last updated {updated}
            </p>
            <p className="mt-6 text-[clamp(16px,1.4vw,18px)] leading-[1.7] text-ink/75">
              {intro}
            </p>
          </Reveal>

          <div className="mt-[clamp(36px,5vw,56px)] grid gap-[clamp(28px,4vw,44px)]">
            {sections.map((section) => (
              <Reveal key={section.heading} as="section" className="grid gap-3.5">
                <h2 className="font-serif text-[clamp(22px,2.6vw,30px)] font-normal">
                  {section.heading}
                </h2>
                {section.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="max-w-[64ch] text-[15.5px] leading-[1.7] text-ink/[0.72]"
                  >
                    {paragraph}
                  </p>
                ))}
              </Reveal>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter cta={{ label: "Order custom bakes", href: routes.shop }} />
    </div>
  );
}
