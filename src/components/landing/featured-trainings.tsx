import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { TrainingCard } from "@/components/trainings/training-card";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { ITraining, TrainingCategory } from "@/types/training.types";

// Fixed tracks (not auto-fit): one or two featured classes keep the same card
// width as a full row of three instead of stretching across the section.
const GRID_CLASS =
  "grid grid-cols-1 gap-[clamp(20px,3vw,32px)] sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-[22px]";

const ROWS: { category: TrainingCategory; label: string }[] = [
  { category: "IN_PERSON", label: "In the kitchen" },
  { category: "ONLINE", label: "Online, from home" },
];

/** A category's featured classes in the order they were featured. */
const rowTrainings = (trainings: ITraining[], category: TrainingCategory) =>
  trainings
    .filter((t) => t.category === category)
    .sort((a, b) => (a.featuredAt ?? "").localeCompare(b.featuredAt ?? ""));

/**
 * Home page teaser for the Bake School: the featured classes (admin picks
 * them with the "Featured on the home page" toggle), one row per delivery
 * category — on-site classes first, then online — up to three cards each,
 * rendered with the catalogue's TrainingCard. Rendered on the server from
 * the page's cached fetch so a reload never shows skeletons; an empty row
 * disappears, and when nothing is featured (or the API couldn't be reached
 * at revalidation time) the whole section disappears. Sits on the oat band
 * (like Story) so it reads as its own section against the dark CTA below.
 */
export function FeaturedTrainings({ trainings }: { trainings: ITraining[] }) {
  const rows = ROWS.map((row) => ({
    ...row,
    trainings: rowTrainings(trainings, row.category),
  })).filter((row) => row.trainings.length > 0);

  if (rows.length === 0) return null;

  return (
    <section className="border-y border-ink/10 bg-oat">
      <div className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] py-[clamp(56px,8vw,100px)]">
      <Reveal className="mb-[clamp(32px,5vw,52px)] flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <h2 className="font-serif text-[clamp(32px,4vw,52px)] font-normal">
          Learn to bake it
        </h2>
        <Link
          href={routes.trainings}
          className="text-[13px] font-semibold uppercase tracking-[0.1em] text-accent no-underline transition-colors hover:text-ink"
        >
          All trainings →
        </Link>
      </Reveal>

      <div className="grid gap-[clamp(36px,5vw,56px)]">
        {rows.map((row) => (
          <div key={row.category}>
            <Reveal>
              <p className="mb-[clamp(16px,2.5vw,24px)] text-[13px] font-semibold uppercase tracking-[0.22em] text-accent">
                {row.label}
              </p>
            </Reveal>
            <div className={GRID_CLASS}>
              {row.trainings.map((training, i) => (
                // In the tablet range the grid is two columns, so a third
                // card would wrap into a lonely 2+1 row — hide it there and
                // show all three again once the row is three-up (lg) or
                // stacked (phones).
                <div
                  key={training.id}
                  className={cn("grid", i === 2 && "sm:max-lg:hidden")}
                >
                  <TrainingCard training={training} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
