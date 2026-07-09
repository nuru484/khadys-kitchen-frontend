import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/reveal';
import { routes } from '@/lib/routes';

/**
 * Compact trainings banner at the foot of the landing page — one cover-style
 * card (image under an ink wash) with a headline, a single line, and one
 * button to the trainings catalogue. Deliberately short on mobile.
 */
export function BakeSchoolCta() {
  return (
    <section className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,7vw,96px)]">
      <Reveal className="relative overflow-hidden rounded-[28px] bg-ink text-cream">
        <Image
          src="/trainings-cta-backdrop.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover opacity-40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/30"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-x-12 gap-y-7 px-[clamp(24px,4.5vw,56px)] py-[clamp(36px,5vw,64px)]">
          <div className="max-w-[52ch]">
            <p className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.22em] text-accent-2">
              Khady&rsquo;s Kitchen Trainings · Kumasi
            </p>
            <h2 className="mb-3.5 text-balance font-serif text-[clamp(28px,3.4vw,44px)] font-normal leading-[1.12]">
              Don&rsquo;t just taste it. Learn to bake it.
            </h2>
            <p className="text-[16px] leading-[1.65] text-cream/80">
              Hands-on classes for every level - from your first loaf to wedding
              cakes - taught in Khady&rsquo;s own kitchen.
            </p>
          </div>
          <Link
            href={routes.trainings}
            className="inline-block rounded-full bg-accent px-[34px] py-4 text-[15px] font-semibold tracking-[0.06em] text-[#FDFAF3] no-underline transition-colors hover:bg-cream hover:text-ink"
          >
            Explore trainings →
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
