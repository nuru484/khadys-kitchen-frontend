"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The dark notice strip above the header. When its content fits on one line it
 * sits static and centred; when it can't (narrower screens), it turns into a
 * seamless marquee like the strip below the hero. Users who prefer reduced
 * motion get the static, wrapping version instead of the slide.
 *
 * A persistent off-screen single-line clone is measured against the bar width,
 * so the fits/doesn't-fit decision is stable in both directions.
 */
export function AnnouncementBar({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const check = () =>
      setOverflow(measure.scrollWidth > container.clientWidth + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const sliding = overflow && !reduceMotion;

  return (
    <div
      ref={containerRef}
      className="overflow-hidden bg-ink text-[13px] uppercase tracking-[0.12em] text-cream"
    >
      {/* Persistent single-line clone, measured only; never visible. */}
      <span aria-hidden className="pointer-events-none block h-0 overflow-hidden">
        <span ref={measureRef} className="inline-block whitespace-nowrap px-5">
          {children}
        </span>
      </span>

      {sliding ? (
        <div className="flex w-max whitespace-nowrap py-[9px] [animation:kk-marquee_18s_linear_infinite] hover:[animation-play-state:paused]">
          <span className="flex shrink-0 items-center px-8">{children}</span>
          <span aria-hidden className="flex shrink-0 items-center px-8">
            {children}
          </span>
        </div>
      ) : (
        <div className="px-5 py-[9px] text-center">
          <span className={reduceMotion ? "" : "whitespace-nowrap"}>
            {children}
          </span>
        </div>
      )}
    </div>
  );
}
