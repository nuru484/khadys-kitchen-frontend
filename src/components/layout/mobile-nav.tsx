"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { NavLink } from "@/components/layout/site-header";
import { isNavActive, useActivePathname } from "@/components/layout/header-nav";
import { useModalFocus } from "@/hooks/use-modal-focus";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  navLinks: NavLink[];
  cta?: NavLink;
  className?: string;
}

/**
 * Hamburger button (shown below the 900px breakpoint by the parent) that opens
 * a full-screen overlay menu: a numbered, animated nav.
 */
export function MobileNav({ navLinks, cta, className }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = useActivePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  // The overlay claims aria-modal, so it must behave modally: focus moves in,
  // Tab is trapped, Escape closes, focus restores to the hamburger, and body
  // scroll locks - all via the shared hook the Modal uses.
  useModalFocus(open, overlayRef, { onEscape: () => setOpen(false) });

  return (
    <div className={className}>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid h-[46px] w-[46px] cursor-pointer place-items-center rounded-full border-[1.5px] border-ink/[0.28] bg-transparent transition-colors hover:border-accent"
      >
        <span className="grid gap-[5px]">
          <span className="block h-0.5 w-5 rounded-sm bg-ink" />
          <span className="block h-0.5 w-5 rounded-sm bg-ink" />
        </span>
      </button>

      {open
        ? createPortal(
            <div
              ref={overlayRef}
              tabIndex={-1}
              className="fixed inset-0 z-[100] flex flex-col bg-ink text-cream outline-none"
              style={{ animation: "kk-fadein .35s both" }}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
          <div className="flex items-center justify-between border-b border-cream/15 px-[clamp(20px,5vw,48px)] py-[18px]">
            <span className="font-serif text-2xl tracking-[0.02em]">
              Khady&rsquo;s{" "}
              <span className="font-sans text-[22px] font-light italic">
                Kitchen
              </span>
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="grid h-[46px] w-[46px] cursor-pointer place-items-center rounded-full border-[1.5px] border-cream/35 bg-transparent text-[18px] text-cream transition-colors hover:border-cream"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-1 px-[clamp(24px,8vw,56px)] py-7">
            {navLinks.map((link, i) => {
              const active = isNavActive(pathname, link.href);
              return (
                <div key={link.label} className="overflow-hidden">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex items-baseline gap-4 py-1 font-serif text-[clamp(32px,8.5vw,44px)] leading-[1.25] no-underline",
                      active ? "text-accent-2" : "text-cream",
                    )}
                    style={{
                      animation: `kk-lineup .7s ${0.12 + i * 0.08}s cubic-bezier(.16,.84,.28,1) both`,
                    }}
                  >
                    <span className="font-sans text-[13px] tracking-[0.15em] text-accent-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div
            className="grid gap-[18px] border-t border-cream/15 px-[clamp(24px,8vw,56px)] pb-10 pt-6"
            style={{ animation: "kk-fadein .6s .5s both" }}
          >
            {cta ? (
              <Link
                href={cta.href}
                onClick={() => setOpen(false)}
                className="rounded-full bg-accent px-[34px] py-[17px] text-center text-[15px] font-semibold tracking-[0.06em] text-card no-underline transition-colors hover:bg-cream hover:text-ink"
              >
                {cta.label}
              </Link>
            ) : null}
            <span className="text-center text-[13px] tracking-[0.1em] text-cream/55">
              Kumasi, Ghana · @khadyskitchen
            </span>
          </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
