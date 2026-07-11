"use client";

import { useEffect, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

/**
 * Mobile-only bottom bar for the class detail page: once the hero scrolls out
 * of view it slides up with the entry price and an "Apply now" shortcut, and
 * slides away again while the #apply section itself is on screen. Rendered
 * only when applications are open.
 */
export function StickyApplyBar({
  heroRef,
  priceLabel,
}: {
  heroRef: RefObject<HTMLElement | null>;
  priceLabel: string | null;
}) {
  const [pastHero, setPastHero] = useState(false);
  const [applyInView, setApplyInView] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === "undefined") return;

    const heroObserver = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 },
    );
    heroObserver.observe(hero);

    const apply = document.getElementById("apply");
    let applyObserver: IntersectionObserver | undefined;
    if (apply) {
      applyObserver = new IntersectionObserver(
        ([entry]) => setApplyInView(entry.isIntersecting),
        { threshold: 0.1 },
      );
      applyObserver.observe(apply);
    }

    return () => {
      heroObserver.disconnect();
      applyObserver?.disconnect();
    };
  }, [heroRef]);

  const visible = pastHero && !applyInView;

  return (
    <div
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-[60px] z-40 transition-transform duration-300 ease-out md:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="flex items-center justify-between gap-4 border-t border-ink/10 bg-card/95 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3.5 backdrop-blur-[8px]">
        <div className="min-w-0">
          {priceLabel ? (
            <div className="truncate font-serif text-[18px] leading-tight">
              {priceLabel}
            </div>
          ) : null}
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink/55">
            Applications open
          </div>
        </div>
        <a
          href="#apply"
          className="shrink-0 rounded-full bg-accent px-6 py-3 text-[14px] font-semibold tracking-[0.04em] text-[#FDFAF3] no-underline transition-colors hover:bg-ink"
        >
          Apply now
        </a>
      </div>
    </div>
  );
}
