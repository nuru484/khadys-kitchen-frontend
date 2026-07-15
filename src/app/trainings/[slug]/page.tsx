import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ApplicationStatus } from "@/components/trainings/application-status";
import { TrainingDetail } from "@/components/trainings/training-detail";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  lookupApplicationByCode,
  lookupPublicTraining,
} from "@/lib/public-api";
import { routes, trainingDetail } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import type { ITraining } from "@/types/training.types";

const NAV_LINKS = [
  { label: "← All trainings", href: routes.trainings },
  { label: "Contact", href: routes.contact },
];

/**
 * Application receipt codes (`KK-A` + unambiguous alphanumerics, e.g.
 * KK-A7F3K9QW2M) share this route: the confirmation email/SMS links to
 * `/trainings/{code}`, so a code-shaped slug renders the application-status
 * panel instead of a class page. Training slugs are lowercase-hyphenated and
 * can never collide with the pattern.
 */
const APPLICATION_CODE = /^KK-A[0-9A-Z]{4,}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (APPLICATION_CODE.test(slug)) {
    return pageMetadata({
      title: "Application status",
      description: "Check the status of your Khady's Kitchen application.",
      path: trainingDetail(slug),
      index: false,
    });
  }

  // Classes are admin-managed, so the real record is fetched at request time
  // (cached with a revalidate window). If the backend is unreachable the title
  // falls back to a slug-derived guess rather than failing the page.
  const lookup = await lookupPublicTraining(slug);
  const training = lookup.kind === "found" ? lookup.data : null;
  const title =
    training?.name ??
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return pageMetadata({
    title,
    description:
      training?.summary ??
      `${title} - a hands-on baking class at Khady's Kitchen in Kumasi.`,
    path: trainingDetail(slug),
    keywords: [title, "baking class Kumasi", "Khady's Kitchen trainings"],
    image: training?.coverImage ?? undefined,
  });
}

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const isCode = APPLICATION_CODE.test(slug);

  // A genuinely unknown slug 404s to the branded not-found page; a backend
  // hiccup falls through to the client island's retry UX instead. On success we
  // keep the record and pass it into the render as initial data (real HTML).
  let initialTraining: ITraining | undefined;
  if (!isCode) {
    const lookup = await lookupPublicTraining(slug);
    if (lookup.kind === "not-found") notFound();
    if (lookup.kind === "found") initialTraining = lookup.data;
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-cream text-ink">
      <SiteHeader
        navLinks={NAV_LINKS}
        cta={
          isCode
            ? { label: "Browse trainings", href: routes.trainings }
            : { label: "Apply now", href: "#apply" }
        }
        mobileMenu
      />
      <main>
        {isCode ? (
          <ApplicationStatusSection code={slug.toUpperCase()} />
        ) : (
          <TrainingDetail slug={slug} initialTraining={initialTraining} />
        )}
      </main>
      <SiteFooter cta={{ label: "Explore our trainings", href: routes.trainings }} />
    </div>
  );
}

/** Fresh (uncached) lookup of the application behind a receipt-code link. */
async function ApplicationStatusSection({ code }: { code: string }) {
  const lookup = await lookupApplicationByCode(code);

  if (lookup.kind === "found") {
    return <ApplicationStatus application={lookup.data} />;
  }

  return (
    <div className="mx-auto max-w-[680px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,7vw,96px)]">
      {lookup.kind === "not-found" ? (
        <EmptyState
          eyebrow="Application status"
          title="We couldn't find that application"
          description={`Nothing matches the code ${code}. Double-check the code from your email or SMS - or message us and we'll look it up for you.`}
          action={{ label: "Contact us", href: routes.contact }}
        />
      ) : (
        <EmptyState
          eyebrow="Application status"
          title="We couldn't check right now"
          description="Something went wrong on our side. Refresh to try again, or message us with your code and we'll confirm your status."
          action={{ label: "Contact us", href: routes.contact }}
        />
      )}
    </div>
  );
}
