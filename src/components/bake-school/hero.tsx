import Image from "next/image";
import { Reveal } from "@/components/reveal";

// The bake-school hero is static brand content — the specific cohort details
// render in the class-info section below it.
const EYEBROW = "Khady’s Bake School · Kumasi";
const SUBTEXT =
  "A hands-on programme with practicals every week - you bake, you learn, and you take your cake home. Finish with the confidence to run your own oven.";
const IMAGE =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80&auto=format&fit=crop";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,5vw,72px)] px-[clamp(20px,5vw,48px)] py-[clamp(48px,7vw,88px)]">
      <div style={{ animation: "kk-rise 0.8s ease both" }}>
        <p className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.24em] text-accent">
          {EYEBROW}
        </p>
        <h1 className="mb-6 font-serif text-[clamp(40px,5.4vw,74px)] font-normal leading-[1.05]">
          <span className="block overflow-hidden">
            <span
              className="inline-block"
              style={{
                animation: "kk-lineup 1s .15s cubic-bezier(.16,.84,.28,1) both",
              }}
            >
              Learn to bake the
            </span>
          </span>
          <span className="block overflow-hidden">
            <span
              className="inline-block"
              style={{
                animation: "kk-lineup 1s .32s cubic-bezier(.16,.84,.28,1) both",
              }}
            >
              way{" "}
              <em className="font-serif not-italic text-accent">Khady</em> does.
            </span>
          </span>
        </h1>
        <p
          className="mb-9 max-w-[54ch] text-[clamp(16px,1.5vw,19px)] leading-[1.65] text-ink/70"
          style={{ animation: "kk-fadein .8s .5s both" }}
        >
          {SUBTEXT}
        </p>
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-3.5"
          style={{ animation: "kk-fadein .8s .6s both" }}
        >
          <a
            href="#apply"
            className="rounded-full bg-accent px-[34px] py-4 text-[15px] font-semibold tracking-[0.06em] text-[#FDFAF3] no-underline transition-colors hover:bg-ink"
          >
            Start your application
          </a>
          <a
            href="#costs"
            className="border-b-[1.5px] border-ink/35 px-2 py-4 text-[15px] font-semibold tracking-[0.06em] text-ink no-underline transition-colors hover:border-ink"
          >
            See full costs ↓
          </a>
        </div>
      </div>

      <div className="relative">
        <Reveal
          variant="mask-img"
          className="relative block h-[clamp(380px,44vw,560px)] w-full overflow-hidden rounded-b-[20px] rounded-t-[min(260px,40vw)] border border-ink/15"
        >
          <Image
            src={IMAGE}
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
