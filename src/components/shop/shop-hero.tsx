import Image from "next/image";
import { Reveal } from "@/components/reveal";

export function ShopHero() {
  return (
    <div className="mb-[clamp(30px,4vw,44px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-[clamp(32px,5vw,72px)]">
      <div>
        <p
          className="mb-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-accent"
          style={{ animation: "kk-fadein .8s .1s both" }}
        >
          Made to order · Pickup in Kumasi
        </p>
        <h1 className="mb-[18px] font-serif text-[clamp(36px,5vw,64px)] font-normal leading-[1.06]">
          <span className="block overflow-hidden">
            <span
              className="inline-block"
              style={{ animation: "kk-lineup .9s .15s cubic-bezier(.16,.84,.28,1) both" }}
            >
              Nothing sits on a shelf.
            </span>
          </span>
          <span className="block overflow-hidden">
            <span
              className="inline-block"
              style={{ animation: "kk-lineup .9s .3s cubic-bezier(.16,.84,.28,1) both" }}
            >
              Everything is baked{" "}
              <em className="font-serif not-italic text-accent">for you.</em>
            </span>
          </span>
        </h1>
        <p
          className="max-w-[54ch] text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-ink/70"
          style={{ animation: "kk-fadein .8s .5s both" }}
        >
          Every order is made custom for its owner. Tell us when you need it, and
          it comes out of the oven on time — never before.
        </p>
      </div>
      <Reveal
        variant="mask-img"
        className="relative block h-[clamp(300px,36vw,440px)] w-full overflow-hidden rounded-b-[20px] rounded-t-[min(220px,36vw)] border border-ink/15"
      >
        <Image
          src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&q=80&auto=format&fit=crop"
          alt="Freshly baked pastries on display"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 45vw"
          className="object-cover"
        />
      </Reveal>
    </div>
  );
}
