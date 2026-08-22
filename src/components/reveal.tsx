"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealVariant = "up" | "left" | "right" | "zoom" | "blur" | "mask" | "mask-img";

interface RevealProps {
  children: ReactNode;
  /** Motion style - maps to the `data-reveal` CSS in globals.css. */
  variant?: RevealVariant;
  /** Stagger, in ms, applied as transition-delay. */
  delay?: number;
  className?: string;
  /** Element to render as (e.g. "section", "h2"). Defaults to a div. */
  as?: ElementType;
  id?: string;
}

/**
 * Reveals its children once they scroll into view by toggling the `.kk-in`
 * class the scroll-reveal CSS in globals.css keys off. Each instance observes
 * itself, so the page stays a Server Component and only these leaves ship JS.
 */
export function Reveal({
  children,
  variant = "up",
  delay,
  className,
  as,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("kk-in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("kk-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal={variant === "up" ? "" : variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
