"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Stroke icons sized for the tab bar (no icon library on the public site). */
const ICONS = {
  home: (
    <path d="M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9.5 20v-6h5v6" />
  ),
  classes: (
    // A graduation cap — the bake school.
    <path d="M2.5 9.5 12 5l9.5 4.5L12 14 2.5 9.5zm4 2.8V16c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-3.7M21 10v4.5" />
  ),
  gallery: (
    <path d="M4 5.5h16v13H4v-13zm3.5 9 3-3.5 2.5 2.5 2.5-3 3.5 4M8.75 9.5a.75.75 0 1 1 0 .01" />
  ),
  contact: (
    <path d="M4 5.5h16v11H9l-4 3.5v-14.5zm4 4h8m-8 3.5h5" />
  ),
} as const;

const TABS = [
  { label: "Home", href: routes.home, icon: ICONS.home, exact: true },
  { label: "Classes", href: routes.trainings, icon: ICONS.classes },
  { label: "Gallery", href: routes.gallery, icon: ICONS.gallery },
  { label: "Contact", href: routes.contact, icon: ICONS.contact },
];

/**
 * Facebook-style bottom tab navigation, mobile only (< 900px — the same
 * breakpoint where the header nav collapses). The canonical destinations;
 * contextual extras (the About anchor, promo CTAs) stay in the header's
 * overlay menu.
 *
 * The bar auto-hides: scrolling down slides it away (reclaiming the height
 * on content-dense pages, where the header already stacks), scrolling up —
 * or being near the top — brings it back. Its current height is published
 * as --kk-tab-offset so anything else pinned to the bottom (the trainings
 * apply bar) can ride along instead of floating over a gap.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      // Ignore sub-4px jitter (elastic scrolling, address-bar resizes).
      if (Math.abs(y - lastY) > 4) {
        setHidden(y > lastY && y > 80);
        lastY = y;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--kk-tab-offset",
      hidden ? "0px" : "60px",
    );
  }, [hidden]);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 grid h-[60px] grid-cols-4 border-t border-ink/10 bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-[8px] transition-transform duration-300 ease-out min-[900px]:hidden",
        hidden && "translate-y-full",
      )}
    >
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 no-underline transition-colors",
              active ? "text-accent" : "text-ink/60",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={active ? 2 : 1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[22px] w-[22px]"
              aria-hidden="true"
            >
              {tab.icon}
            </svg>
            <span
              className={cn(
                "text-[10px] uppercase tracking-[0.08em]",
                active ? "font-semibold" : "font-medium",
              )}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
