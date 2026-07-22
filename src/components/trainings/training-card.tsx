import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { trainingDetail } from "@/lib/routes";
import { fromPriceLabel, metaLine } from "@/components/trainings/training-price";
import { TRAINING_CATEGORY_LABELS } from "@/validations/training-schema";
import type { ITraining } from "@/types/training.types";

/**
 * Catalogue card for one class: cover image (or a warm serif-initial block
 * when the class has none), schedule eyebrow, name, one-line summary, and a
 * hairline footer with the entry price. The card itself never moves - hover
 * is carried by color only (accent seam under the cover, border tint, and
 * the arrow nudging), so nothing zooms or shakes.
 */
export function TrainingCard({ training }: { training: ITraining }) {
  const price = fromPriceLabel(training);
  const meta = metaLine(training);

  return (
    // min-w-0: without it, the truncated meta line's nowrap min-content
    // escapes up through the flex/grid chain and pushes the whole card wider
    // than its track on very narrow screens (e.g. a 280px Galaxy Fold),
    // clipping the card instead of ellipsizing the line.
    <Reveal className="flex min-w-0">
      <Link
        href={trainingDetail(training.slug)}
        className="group flex w-full flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-card no-underline transition-colors duration-300 hover:border-accent/45"
      >
        <div className="relative h-[240px] overflow-hidden">
          {training.coverImage ? (
            <Image
              src={training.coverImage}
              alt={training.name}
              fill
              sizes="(max-width: 700px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            // No cover yet - a warm oat block with the class's serif initial
            // keeps the grid intact (same idiom as the shop's fallback image).
            <div
              aria-hidden="true"
              className="grid h-full w-full place-items-center bg-oat"
            >
              <span className="font-serif text-[96px] leading-none text-accent/35">
                {training.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-ink/75 px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-cream backdrop-blur-[2px]">
            {TRAINING_CATEGORY_LABELS[training.category]}
          </span>
          {training.applicationsOpen ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#2E6B3F]/90 px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-cream">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cream" />
              Enrolling now
            </span>
          ) : null}
        </div>

        {/* Accent seam between cover and body: draws left to right on hover. */}
        <span
          aria-hidden="true"
          className="block h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-accent via-accent/60 to-accent-2/40 transition-transform duration-500 ease-out group-hover:scale-x-100"
        />

        <div className="flex flex-1 flex-col gap-[9px] px-6 pb-[26px] pt-[22px]">
          {/* Every text block clamps AND reserves its space, so all cards in
              the grid share one height - the detail page carries full copy. */}
          <p className="min-h-[1.3em] truncate text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/50">
            {meta ?? ""}
          </p>
          <h3
            title={training.name}
            className="line-clamp-2 min-h-[2.4em] break-words font-serif text-[22px] font-normal leading-[1.2] transition-colors duration-300 group-hover:text-accent"
          >
            {training.name}
          </h3>
          <p className="line-clamp-2 min-h-[3.2em] text-[14.5px] leading-[1.6] text-ink/[0.68]">
            {training.summary}
          </p>
          {/* On narrow cards a long price + the link can't share a line —
              wrap the whole link under the price (kept right-aligned by
              ml-auto) instead of breaking "View class" mid-phrase. */}
          <span className="mt-auto flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-ink/10 pt-3.5">
            {price ? (
              <span className="whitespace-nowrap text-[15px] font-semibold text-accent">{price}</span>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="ml-auto inline-flex items-baseline gap-1.5 whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
              View class
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
