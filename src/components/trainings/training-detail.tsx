"use client";

import Image from "next/image";
import { useRef } from "react";
import { ApplicationForm } from "@/components/bake-school/application-form";
import { FeesTable } from "@/components/trainings/fees-table";
import { StickyApplyBar } from "@/components/trainings/sticky-apply-bar";
import { fromPriceLabel } from "@/components/trainings/training-price";
import { Reveal } from "@/components/reveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Check } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-date";
import { routes } from "@/lib/routes";
import { useGetPublicTrainingBySlugQuery } from "@/redux/trainings/trainings-api";
import { TRAINING_CATEGORY_LABELS } from "@/validations/training-schema";
import type { ITraining } from "@/types/training.types";

/* ── Hero ─────────────────────────────────────────────────────────────────── */

function HeroContent({ training, dark }: { training: ITraining; dark: boolean }) {
  const price = fromPriceLabel(training);
  return (
    <div className="max-w-[760px]">
      <div
        className="mb-5 flex flex-wrap items-center gap-2.5"
        style={{ animation: "kk-fadein .7s .05s both" }}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em]",
            training.applicationsOpen
              ? "bg-success/90 text-cream"
              : dark
                ? "bg-cream/15 text-cream/80"
                : "bg-ink/[0.07] text-ink/55",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              training.applicationsOpen
                ? "bg-cream"
                : dark
                  ? "bg-cream/50"
                  : "bg-ink/40",
            )}
          />
          {training.applicationsOpen ? "Enrolling now" : "Applications closed"}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em]",
            dark ? "bg-cream/15 text-cream/85" : "bg-ink/[0.07] text-ink/60",
          )}
        >
          {TRAINING_CATEGORY_LABELS[training.category]}
        </span>
      </div>

      <h1 className="mb-4 font-serif text-[clamp(36px,5vw,64px)] font-normal leading-[1.06] text-balance">
        <span className="block overflow-hidden">
          <span
            className="inline-block"
            style={{ animation: "kk-lineup 1s .12s cubic-bezier(.16,.84,.28,1) both" }}
          >
            {training.name}
          </span>
        </span>
      </h1>

      <p
        className={cn(
          "mb-8 max-w-[58ch] text-[clamp(16px,1.5vw,18.5px)] leading-[1.65]",
          dark ? "text-cream/85" : "text-ink/70",
        )}
        style={{ animation: "kk-fadein .8s .35s both" }}
      >
        {training.summary}
      </p>

      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-3.5"
        style={{ animation: "kk-fadein .8s .5s both" }}
      >
        {training.applicationsOpen ? (
          <a
            href="#apply"
            className="rounded-full bg-accent px-[34px] py-4 text-[15px] font-semibold tracking-[0.06em] text-card no-underline transition-colors hover:bg-ink"
          >
            Apply now{price ? ` · ${price}` : ""}
          </a>
        ) : null}
        {training.prospectusUrl ? (
          <a
            href={training.prospectusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "rounded-full border-[1.5px] px-[30px] py-[14.5px] text-[15px] font-semibold tracking-[0.06em] no-underline transition-colors",
              dark
                ? "border-cream/45 text-cream hover:border-cream hover:bg-cream/10"
                : "border-ink/30 text-ink hover:border-ink",
            )}
          >
            Download prospectus ↓
          </a>
        ) : null}
      </div>
    </div>
  );
}

/* ── Quick facts ──────────────────────────────────────────────────────────── */

function QuickFacts({ training }: { training: ITraining }) {
  const facts: { label: string; value: string }[] = [];

  if (training.startDate) {
    facts.push({
      label: "Dates",
      value: `${formatDate(training.startDate)}${
        training.endDate ? ` – ${formatDate(training.endDate)}` : ""
      }`,
    });
  }
  if (training.schedule) facts.push({ label: "Schedule", value: training.schedule });
  if (training.duration) facts.push({ label: "Duration", value: training.duration });
  if (training.mode) facts.push({ label: "Format", value: training.mode });
  if (training.hasCertificate)
    facts.push({ label: "Certificate", value: "Awarded on completion" });
  if (training.capacity != null) {
    const left = training.counts
      ? Math.max(training.capacity - training.counts.students, 0)
      : null;
    facts.push({
      label: "Class size",
      value:
        left === null
          ? `${String(training.capacity)} seats`
          : left === 0
            ? "Class full"
            : `${String(left)} seats left`,
    });
  }
  if (facts.length === 0) return null;

  return (
    <section className="border-y border-ink/10 bg-oat/40">
      <div className="mx-auto flex max-w-[1280px] flex-wrap gap-x-[clamp(32px,5vw,72px)] gap-y-6 px-[clamp(20px,5vw,48px)] py-[clamp(28px,4vw,44px)]">
        {facts.map((fact) => (
          <div key={fact.label}>
            <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/50">
              {fact.label}
            </div>
            <div className="mt-1.5 font-serif text-[clamp(17px,1.8vw,21px)] leading-snug">
              {fact.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Content lists ────────────────────────────────────────────────────────── */

function SideCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Reveal className="rounded-[20px] border border-ink/10 bg-card p-[clamp(22px,3vw,32px)]">
      <h3 className="mb-4 font-serif text-[22px] font-normal">{title}</h3>
      <ul className="m-0 grid list-none gap-2.5 p-0">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-baseline gap-3 text-[15px] leading-[1.6] text-ink/75"
          >
            <span aria-hidden="true" className="text-[13px] text-accent">
              ●
            </span>
            {item}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function ContentSections({ training }: { training: ITraining }) {
  const sideCards = [
    { title: "What's included", items: training.included },
    { title: "Who it's for", items: training.forWho },
    { title: "What to bring", items: training.whatToBring },
  ].filter((card) => card.items.length > 0);
  const hasLearn = training.learnOutcomes.length > 0;

  if (!hasLearn && sideCards.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1180px] px-[clamp(20px,5vw,48px)] py-[clamp(56px,8vw,100px)]">
      <div
        className={cn(
          "grid items-start gap-[clamp(28px,4vw,56px)]",
          hasLearn && sideCards.length > 0 && "lg:grid-cols-[7fr_5fr]",
        )}
      >
        {hasLearn ? (
          <div>
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-accent">
              The curriculum
            </p>
            <Reveal variant="mask">
              <h2 className="mb-[clamp(24px,3vw,36px)] font-serif text-[clamp(30px,3.6vw,46px)] font-normal leading-[1.12]">
                What you&rsquo;ll learn
              </h2>
            </Reveal>
            <ul className="m-0 grid list-none gap-3.5 p-0">
              {training.learnOutcomes.map((outcome, i) => (
                <Reveal
                  as="li"
                  key={outcome}
                  delay={Math.min(i * 60, 360)}
                  className="flex items-start gap-4 rounded-[16px] border border-ink/10 bg-card px-[clamp(18px,2.5vw,26px)] py-[16px]"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[2px] grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/10 text-[13px] font-bold text-accent"
                  >
                    <Check className="h-[13px] w-[13px]" />
                  </span>
                  <span className="text-[15.5px] leading-[1.6] text-ink/85">
                    {outcome}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        ) : null}

        {sideCards.length > 0 ? (
          <div
            className={cn(
              "grid gap-[clamp(18px,2.5vw,26px)]",
              !hasLearn && "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {sideCards.map((card) => (
              <SideCard key={card.title} title={card.title} items={card.items} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* ── Page island ──────────────────────────────────────────────────────────── */

/**
 * The class detail page body - hero, quick facts, curriculum, fees, and the
 * application section. The `/trainings/[slug]` page fetches the record
 * server-side and passes it as `initialTraining`, so the primary content is
 * real HTML on first paint; RTK Query hydrates over it so seats/fees/enrolment
 * state stay live. The server shell has already 404'd genuinely unknown slugs.
 */
export function TrainingDetail({
  slug,
  initialTraining,
}: {
  slug: string;
  initialTraining?: ITraining;
}) {
  const { data, isLoading, error, refetch } =
    useGetPublicTrainingBySlugQuery(slug);
  const training = data?.data ?? initialTraining;
  const heroRef = useRef<HTMLElement>(null);

  // Only block on the skeleton when there's no server-rendered class to show.
  if (isLoading && !training) {
    return (
      <div aria-busy="true">
        <div className="h-[clamp(380px,50vw,520px)] animate-pulse bg-ink/[0.06]" />
        <div className="mx-auto max-w-[1180px] px-[clamp(20px,5vw,48px)] py-[clamp(36px,5vw,64px)]">
          <div className="mb-5 h-8 w-2/3 animate-pulse rounded-[10px] bg-ink/[0.06]" />
          <div className="mb-3 h-4 w-full animate-pulse rounded-[8px] bg-ink/[0.06]" />
          <div className="h-4 w-4/5 animate-pulse rounded-[8px] bg-ink/[0.06]" />
        </div>
      </div>
    );
  }

  if (!training) {
    // A 404 here means the class was unpublished after the shell rendered -
    // a stale link, not a failure.
    const notFound =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 404;
    return (
      <div className="mx-auto max-w-[760px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,7vw,96px)]">
        {notFound ? (
          <EmptyState
            eyebrow="Khady's Kitchen Trainings"
            title="That class isn't on the list"
            description="It may have closed or been renamed - browse the classes currently enrolling."
            action={{ label: "Browse all trainings", href: routes.trainings }}
          />
        ) : (
          <ErrorState error={error} onRetry={() => void refetch()} />
        )}
      </div>
    );
  }

  const price = fromPriceLabel(training);

  return (
    <>
      {training.coverImage ? (
        <section ref={heroRef} className="relative overflow-hidden bg-ink text-cream">
          <Image
            src={training.coverImage}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/25"
          />
          <div className="relative mx-auto flex min-h-[clamp(420px,55vw,580px)] max-w-[1280px] items-end px-[clamp(20px,5vw,48px)] pb-[clamp(36px,5vw,64px)] pt-[clamp(48px,7vw,96px)]">
            <HeroContent training={training} dark />
          </div>
        </section>
      ) : (
        // No cover yet - a warm oat hero keeps the page composed.
        <section ref={heroRef} className="border-b border-ink/10 bg-oat">
          <div className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,7vw,96px)]">
            <HeroContent training={training} dark={false} />
          </div>
        </section>
      )}

      <QuickFacts training={training} />
      <ContentSections training={training} />
      <FeesTable training={training} />

      {training.applicationsOpen ? (
        <ApplicationForm training={training} />
      ) : (
        <section
          id="apply"
          className="mx-auto max-w-[760px] px-[clamp(20px,5vw,48px)] py-[clamp(56px,8vw,100px)]"
        >
          <div className="rounded-[22px] border border-ink/10 bg-card p-[clamp(28px,4vw,44px)]">
            <EmptyState
              eyebrow="Applications closed"
              title="Applications are closed for this class"
              description="Enrolment isn't open right now. Message us and we'll tell you the moment it reopens - places fill fast."
              action={{ label: "Ask about the next intake", href: routes.contact }}
              className="p-0 py-2"
            />
          </div>
        </section>
      )}

      {training.applicationsOpen ? (
        <StickyApplyBar heroRef={heroRef} priceLabel={price} />
      ) : null}
    </>
  );
}
