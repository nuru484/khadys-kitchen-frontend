import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Khady's Kitchen collects, uses, and protects the information you share when you order, enrol in a class, or get in touch.",
  path: "/privacy",
});

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    body: [
      "When you place an order, enrol in a baking class, or send us a message, we collect the details you give us - your name, phone number or email, delivery or pickup preferences, and anything you tell us about your order.",
      "We do not collect payment card details on this site. Payments are arranged directly over WhatsApp, mobile money, or in person.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "We use your information only to bake and fulfil your order, run the class you signed up for, answer your questions, and let you know about your order's status.",
      "With your consent, we may occasionally send you news about new bakes, class dates, or seasonal offers. You can ask us to stop at any time.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We do not sell your information. We share it only with the people who help us serve you - for example a delivery rider - and only what they need to complete the task.",
      "We may disclose information if the law requires it, or to protect the safety of our customers and staff.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep order and enrolment records for as long as needed to run the business and meet our record-keeping obligations, then delete or anonymise them.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can ask to see, correct, or delete the information we hold about you, and you can opt out of any updates we send. Just get in touch and we will sort it out.",
    ],
  },
  {
    heading: "Contact us",
    body: [
      `Questions about this policy? Email ${siteConfig.email} or reach us on WhatsApp - we are happy to help.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="6 July 2026"
      intro="Khady's Kitchen is a small bakery and bake school in Kumasi. We keep this simple: we only collect what we need to serve you, and we look after it carefully. This page explains what that means."
      sections={SECTIONS}
    />
  );
}
