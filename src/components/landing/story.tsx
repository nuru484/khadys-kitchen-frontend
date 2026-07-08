"use client";

import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { useGetPublicAboutQuery } from "@/redux/about/about-api";

// Static copy used until an admin saves their own version (and for any field
// they leave blank) — the section never renders half-empty.
const DEFAULTS = {
  eyebrow: "About",
  heading: "Two ovens, one obsession.",
  body: "Khady learned to bake in her grandmother's kitchen and refined her craft in professional pastry rooms. Her counter in Kumasi is where the two meet - classic technique alongside the flavors of home.\n\nEverything is mixed, shaped, and baked on site. No freezers, no shortcuts - and every week, she teaches the next generation of bakers to do the same.",
  pullQuote: "Bread should taste like someone was up early caring about it.",
  founder: "Khady, founder",
  image:
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80&auto=format&fit=crop",
};

/**
 * The editable "About" band. Content comes from the backend's About singleton
 * (admins edit it under Website in the console); each missing field falls back
 * to the static default so the section always reads complete.
 */
export function Story() {
  const { data } = useGetPublicAboutQuery();
  const about = data?.data;

  const eyebrow = about?.storyEyebrow || DEFAULTS.eyebrow;
  const heading = about?.storyHeading || DEFAULTS.heading;
  const body = about?.storyBody || DEFAULTS.body;
  const pullQuote = about?.storyPullQuote || DEFAULTS.pullQuote;
  const founder = about?.storyFounder || DEFAULTS.founder;
  const image = about?.storyImage || DEFAULTS.image;

  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section id="about" className="border-y border-ink/10 bg-oat">
      <Reveal className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-center gap-[clamp(36px,6vw,72px)] px-[clamp(20px,5vw,48px)] py-[clamp(56px,8vw,100px)]">
        <Reveal
          variant="mask-img"
          className="relative block h-[clamp(360px,42vw,520px)] w-full overflow-hidden rounded-b-[min(260px,40vw)] rounded-t-[20px] border border-ink/15"
        >
          <Image
            src={image}
            alt="Hands at work in the kitchen"
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            className="object-cover"
          />
        </Reveal>

        <div>
          <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.22em] text-accent">
            {eyebrow}
          </p>
          <h2 className="mb-6 font-serif text-[clamp(32px,4vw,52px)] font-normal leading-[1.1]">
            {heading}
          </h2>
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={
                i === paragraphs.length - 1
                  ? "mb-8 text-[17px] leading-[1.7] text-ink/75"
                  : "mb-[18px] text-[17px] leading-[1.7] text-ink/75"
              }
            >
              {paragraph}
            </p>
          ))}
          <blockquote className="border-l-[3px] border-accent pl-[22px] font-serif text-[clamp(19px,2vw,23px)] leading-[1.45]">
            &ldquo;{pullQuote}&rdquo;
            <footer className="mt-3.5 font-sans text-[14px] uppercase tracking-[0.12em] text-ink/60">
              - {founder}
            </footer>
          </blockquote>
        </div>
      </Reveal>
    </section>
  );
}
