import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format-date";
import type { ITraining } from "@/types/training.types";

// The hero is the only section with a fallback — it must always render well.
const DEFAULT_EYEBROW = "Khady’s Bake School · Kumasi";
const DEFAULT_SUBTEXT =
  "A hands-on programme with practicals every week - you bake, you learn, and you take your cake home. Finish with a CTVET certificate and the confidence to run your own oven.";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80&auto=format&fit=crop";

export function Hero({ training }: { training: ITraining }) {
  const eyebrow = training.tagline || DEFAULT_EYEBROW;
  const subtext = training.heroSubtext || DEFAULT_SUBTEXT;
  const image = training.coverImage || DEFAULT_IMAGE;
  const heading = training.heroHeading?.trim();
  // Stats are class data — shown only when the cohort defines them.
  const stats = training.stats;
  const open = training.applicationsOpen;

  // Concrete cohort facts — each rendered only when the field is set.
  const dateRange = training.startDate
    ? `${formatDate(training.startDate)}${training.endDate ? ` – ${formatDate(training.endDate)}` : ""}`
    : null;
  const facts: { label: string; value: string }[] = [];
  if (dateRange) facts.push({ label: "Runs", value: dateRange });
  if (training.capacity != null)
    facts.push({ label: "Places", value: `${String(training.capacity)} seats` });
  if (training.hostelCapacity != null)
    facts.push({
      label: "Hostel",
      value: `${String(training.hostelCapacity)} places`,
    });

  return (
    <section className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,5vw,72px)] px-[clamp(20px,5vw,48px)] py-[clamp(48px,7vw,88px)]">
      <div style={{ animation: "kk-rise 0.8s ease both" }}>
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.24em] text-accent">
          {eyebrow}
        </p>
        {/* Cohort identity: number + live application status */}
        <div className="mb-[22px] flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] font-semibold">
          {training.numeral ? (
            <span className="uppercase tracking-[0.16em] text-ink/70">
              Cohort {training.numeral}
            </span>
          ) : null}
          {training.numeral ? <span className="text-ink/25">·</span> : null}
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                open ? "bg-[#2E6B3F]" : "bg-ink/35",
              )}
            />
            <span className="text-ink/60">
              {open ? "Applications open" : "Applications closed"}
            </span>
          </span>
        </div>
        {heading ? (
          <h1
            className="mb-6 font-serif text-[clamp(40px,5.4vw,74px)] font-normal leading-[1.05]"
            style={{ animation: "kk-fadein .8s .15s both" }}
          >
            {heading}
          </h1>
        ) : (
          <h1 className="mb-6 font-serif text-[clamp(40px,5.4vw,74px)] font-normal leading-[1.05]">
            <span className="block overflow-hidden">
              <span
                className="inline-block"
                style={{
                  animation:
                    "kk-lineup 1s .15s cubic-bezier(.16,.84,.28,1) both",
                }}
              >
                Learn to bake the
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="inline-block"
                style={{
                  animation:
                    "kk-lineup 1s .32s cubic-bezier(.16,.84,.28,1) both",
                }}
              >
                way{" "}
                <em className="font-serif not-italic text-accent">Khady</em>{" "}
                does.
              </span>
            </span>
          </h1>
        )}
        {training.name ? (
          <p
            className="mb-4 font-serif text-[clamp(19px,2vw,26px)] font-normal leading-[1.25] text-ink/85"
            style={{ animation: "kk-fadein .8s .4s both" }}
          >
            {training.name}
          </p>
        ) : null}
        <p
          className="mb-8 max-w-[54ch] text-[clamp(16px,1.5vw,19px)] leading-[1.65] text-ink/70"
          style={{ animation: "kk-fadein .8s .5s both" }}
        >
          {subtext}
        </p>
        {facts.length > 0 ? (
          <div
            className="mb-9 flex flex-wrap gap-x-6 gap-y-1.5 text-[14px] text-ink/65"
            style={{ animation: "kk-fadein .8s .55s both" }}
          >
            {facts.map((f) => (
              <span key={f.label}>
                <span className="font-semibold text-ink/80">{f.label}</span>{" "}
                {f.value}
              </span>
            ))}
          </div>
        ) : null}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-3.5"
          style={{ animation: "kk-fadein .8s .6s both" }}
        >
          <a
            href="#apply"
            className="rounded-full bg-accent px-[34px] py-4 text-[15px] font-semibold tracking-[0.06em] text-[#FDFAF3] no-underline transition-colors hover:bg-ink"
          >
            {open ? "Start your application" : "Join the waitlist"}
          </a>
          <a
            href="#costs"
            className="border-b-[1.5px] border-ink/35 px-2 py-4 text-[15px] font-semibold tracking-[0.06em] text-ink no-underline transition-colors hover:border-ink"
          >
            See full costs ↓
          </a>
        </div>
        {stats.length > 0 ? (
          <div
            className="mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-ink/15 pt-[26px]"
            style={{ animation: "kk-fadein .8s .7s both" }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-[26px]">{stat.value}</div>
                <div className="mt-1 text-[12.5px] uppercase tracking-[0.08em] text-ink/55">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="relative">
        <Reveal
          variant="mask-img"
          className="relative block h-[clamp(380px,44vw,560px)] w-full overflow-hidden rounded-b-[20px] rounded-t-[min(260px,40vw)] border border-ink/15"
        >
          <Image
            src={image}
            alt="Hands preparing dough in a kitchen"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 45vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
