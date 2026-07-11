import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactHero } from "@/components/contact/contact-hero";
import { ContactChannels } from "@/components/contact/contact-channels";
import { ContactForm } from "@/components/contact/contact-form";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Reach Khady's Kitchen in Kumasi - WhatsApp, email, or drop by. Orders, custom cakes, and class enrolment all reach a human.",
  path: "/contact",
  keywords: ["contact Khady's Kitchen", "Kumasi bakery contact", "order custom cake Kumasi"],
});

const NAV_LINKS = [
  { label: "Home", href: routes.home },
  { label: "Shop", href: routes.shop },
  { label: "Trainings", href: routes.trainings },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream text-ink">
      <SiteHeader
        navLinks={NAV_LINKS}
        cta={{ label: "Order now", href: routes.shop }}
        mobileMenu
      />
      <main className="flex-1">
        <ContactHero />
        <ContactChannels />
        <ContactForm />
      </main>
      <SiteFooter cta={{ label: "Order custom bakes", href: routes.shop }} />
    </div>
  );
}
