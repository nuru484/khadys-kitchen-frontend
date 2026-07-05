import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { routes } from "@/lib/routes";

const PILLS = [
  "Weekly practicals",
  "95% ingredients provided",
  "Hostel for 12 students",
  "CTVET certificate",
];

export function BakeSchoolCta() {
  return (
    <section
      id="school"
      className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] py-[clamp(56px,8vw,100px)]"
    >
      <Reveal className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-center gap-[clamp(32px,5vw,64px)] overflow-hidden rounded-[28px] bg-ink p-[clamp(28px,4.5vw,56px)] text-cream">
        <div>
          <p className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.22em] text-accent-2">
            Khady&rsquo;s Bake School · Kumasi
          </p>
          <h2 className="mb-[22px] text-balance font-serif text-[clamp(30px,3.6vw,48px)] font-normal leading-[1.12]">
            Don&rsquo;t just taste it. Learn to bake it.
          </h2>
          <p className="mb-7 max-w-[48ch] text-[16.5px] leading-[1.7] text-cream/75">
            Hands-on classes with weekly practicals — you bake every week and
            take your cake home. 95% of ingredients and tools provided, hostel
            available, CTVET certificate on completion.
          </p>
          <div className="mb-8 flex flex-wrap gap-2.5">
            {PILLS.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-cream/30 px-4 py-2 text-[13.5px] tracking-[0.04em]"
              >
                {pill}
              </span>
            ))}
          </div>
          <Link
            href={routes.apply}
            className="inline-block rounded-full bg-accent px-[34px] py-4 text-[15px] font-semibold tracking-[0.06em] text-[#FDFAF3] no-underline transition-colors hover:bg-cream hover:text-ink"
          >
            Apply for classes →
          </Link>
        </div>

        <Reveal
          variant="mask-img"
          className="relative block h-[clamp(300px,36vw,460px)] w-full overflow-hidden rounded-[18px]"
        >
          <Image
            src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&q=80&auto=format&fit=crop"
            alt="Freshly baked cupcakes from class practicals"
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            className="object-cover"
          />
        </Reveal>
      </Reveal>
    </section>
  );
}
