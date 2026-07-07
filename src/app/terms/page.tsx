import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms for ordering bakes, enrolling in a class, and using the Khady's Kitchen website.",
  path: "/terms",
});

const SECTIONS: LegalSection[] = [
  {
    heading: "Orders",
    body: [
      "Everything is made to order and baked in small batches, so each item carries a lead time shown at checkout. Your order is confirmed once we agree the details and timing with you.",
      "Prices are in Ghana cedis and may change; the price we confirm with you is the price you pay.",
    ],
  },
  {
    heading: "Payment",
    body: [
      "Payment is arranged directly with us over WhatsApp, mobile money, or in person. For custom cakes and large orders we may ask for a deposit to secure your date.",
    ],
  },
  {
    heading: "Pickup, delivery & freshness",
    body: [
      "Because our bakes are fresh and made to order, please collect or accept delivery at the agreed time. We cannot guarantee the quality of items left uncollected past their ready time.",
    ],
  },
  {
    heading: "Changes & cancellations",
    body: [
      "Need to change or cancel? Tell us as early as you can. Once we have started baking or bought special ingredients for a custom order, a deposit may be non-refundable.",
    ],
  },
  {
    heading: "Baking classes",
    body: [
      "A class place is confirmed once we receive your enrolment and any required deposit. If you cannot attend, let us know ahead of time and we will do our best to move you to another cohort.",
    ],
  },
  {
    heading: "Allergens",
    body: [
      "Our kitchen handles wheat, eggs, dairy, nuts, and other allergens. We cannot guarantee any item is free from traces of these. Tell us about allergies before you order and we will advise honestly.",
    ],
  },
  {
    heading: "Using this website",
    body: [
      "The content on this site is ours and provided for your personal use. Please do not copy or reuse it without permission. We may update these terms from time to time; the current version always lives on this page.",
    ],
  },
  {
    heading: "Contact us",
    body: [
      `Questions about these terms? Email ${siteConfig.email} or message us on WhatsApp.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="6 July 2026"
      intro="These terms cover ordering bakes, enrolling in our classes, and using this website. By ordering from Khady's Kitchen, you agree to them."
      sections={SECTIONS}
    />
  );
}
