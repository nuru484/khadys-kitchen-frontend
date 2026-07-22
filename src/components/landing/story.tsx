import Image from 'next/image';
import { Reveal } from '@/components/reveal';
import type { IAboutContent } from '@/types/about.types';

// Static copy used until an admin saves their own version (and for any field
// they leave blank) — the section never renders half-empty.
const DEFAULTS = {
  eyebrow: 'Our story',
  heading: 'Nine years of cake artistry in Kumasi.',
  body: "For over 9 years, Khady's Kitchen has been at the forefront of cake artistry in Kumasi, building a reputation for excellence, creativity, and unforgettable taste. Today, we are proudly recognized as one of the city's leading cake brands, trusted by thousands of families, businesses, and institutions for life's most important celebrations.\n\nOur impact goes beyond cakes. We have trained thousands of aspiring bakers, many of whom have gone on to build successful baking businesses of their own. Through innovation, consistency, and an uncompromising commitment to quality, Khady's Kitchen continues to raise the standard in the baking industry.\n\nWhether it's a simple birthday cake or an extraordinary custom masterpiece, every creation reflects our passion, craftsmanship, and pursuit of perfection.",
  pullQuote:
    "We don't just bake cakes — we create memories, celebrate milestones, and inspire excellence.",
  founder: "Khady's Kitchen",
  image: '/story-graduation-class.jpg',
};

/**
 * The editable "About" band. Content comes from the backend's About singleton
 * (admins edit it under Website in the console), fetched server-side by the
 * page so a reload never flashes the defaults; each missing field falls back
 * to the static default so the section always reads complete.
 */
export function Story({ about }: { about: IAboutContent | null }) {

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
      {/* Image and text stack as rows up through tablet (an iPad-mini-width
          split reads cramped) and only sit side by side from lg up. */}
      <Reveal className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-[clamp(36px,6vw,72px)] px-[clamp(20px,5vw,48px)] py-[clamp(56px,8vw,100px)] lg:grid-cols-2">
        <Reveal
          variant="mask-img"
          className="relative block h-[clamp(360px,42vw,520px)] w-full overflow-hidden rounded-b-[min(260px,40vw)] rounded-t-[20px] border border-ink/15"
        >
          <Image
            src={image}
            alt="Khady with a graduating class at Khady's Kitchen"
            fill
            sizes="(max-width: 1023px) 100vw, 45vw"
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
                  ? 'mb-8 text-[17px] leading-[1.7] text-ink/75'
                  : 'mb-[18px] text-[17px] leading-[1.7] text-ink/75'
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
