import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { trainingDetail } from "@/lib/routes";
import { fromPriceLabel, metaLine } from "@/components/trainings/training-price";
import type { ITraining } from "@/types/training.types";

/**
 * Catalogue card for one class. Mirrors the shop's ProductCard idiom: cover
 * image (or a warm serif-initial block when the class has none), name,
 * one-line summary, duration · mode, and the entry price.
 */
export function TrainingCard({ training }: { training: ITraining }) {
  const price = fromPriceLabel(training);
  const meta = metaLine(training);

  return (
    <Reveal variant="zoom" className="flex">
      <Link
        href={trainingDetail(training.slug)}
        className="group flex w-full flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-card no-underline transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/55"
      >
        <div className="relative h-[240px] overflow-hidden">
          {training.coverImage ? (
            <Image
              src={training.coverImage}
              alt={training.name}
              fill
              sizes="(max-width: 700px) 100vw, 33vw"
              className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.16,.84,.28,1)] group-hover:scale-[1.06]"
            />
          ) : (
            // No cover yet — a warm oat block with the class's serif initial
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
          {training.applicationsOpen ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#2E6B3F]/90 px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-cream">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cream" />
              Enrolling now
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-[9px] px-6 pb-[26px] pt-[22px]">
          {/* Every text block clamps AND reserves its space, so all cards in
              the grid share one height — the detail page carries full copy. */}
          <h3
            title={training.name}
            className="line-clamp-2 min-h-[2.4em] break-words font-serif text-[22px] font-normal leading-[1.2]"
          >
            {training.name}
          </h3>
          <p className="line-clamp-2 min-h-[3.2em] text-[14.5px] leading-[1.6] text-ink/[0.68]">
            {training.summary}
          </p>
          <p className="min-h-[1.3em] truncate text-[13px] font-semibold uppercase tracking-[0.08em] text-ink/55">
            {meta ?? ""}
          </p>
          <span className="mt-auto flex items-baseline justify-between gap-4 pt-1.5">
            {price ? (
              <span className="text-[15px] font-semibold text-accent">{price}</span>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
              View class →
            </span>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
