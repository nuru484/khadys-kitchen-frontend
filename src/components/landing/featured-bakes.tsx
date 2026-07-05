import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { bakes } from "@/lib/bake-school-data";

export function FeaturedBakes() {
  return (
    <section
      id="bakes"
      className="mx-auto max-w-[1280px] px-[clamp(20px,5vw,48px)] py-[clamp(56px,8vw,100px)]"
    >
      <Reveal className="mb-[clamp(32px,5vw,52px)] flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <h2 className="font-serif text-[clamp(32px,4vw,52px)] font-normal">
          This morning&rsquo;s bakes
        </h2>
        <p className="text-[13px] uppercase tracking-[0.1em] text-ink/55">
          Menu changes daily
        </p>
      </Reveal>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] gap-[clamp(20px,3vw,32px)]">
        {bakes.map((bake) => (
          <Reveal key={bake.name} variant="zoom" className="flex">
            <Link
              href={bake.href}
              className="group flex w-full flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-card no-underline transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/55"
            >
              <div className="relative h-[250px] overflow-hidden">
                <Image
                  src={bake.img}
                  alt={bake.name}
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.16,.84,.28,1)] group-hover:scale-[1.06]"
                />
              </div>
              <div className="flex flex-col gap-2.5 px-[26px] pb-7 pt-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-[23px] font-normal">
                    {bake.name}
                  </h3>
                  <span className="whitespace-nowrap text-[16px] font-semibold text-accent">
                    {bake.price}
                  </span>
                </div>
                <p className="text-[15px] leading-[1.6] text-ink/70">
                  {bake.desc}
                </p>
                <span className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">
                  Order in the shop →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
