import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { routes } from "@/lib/routes";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { cn } from "@/lib/utils";

export interface NavLink {
  label: string;
  href: string;
}

interface SiteHeaderProps {
  navLinks: NavLink[];
  /** Right-hand call to action. Ignored when `action` is provided. */
  cta?: NavLink;
  /** Custom right-hand element (e.g. the shop cart button); overrides `cta`. */
  action?: ReactNode;
  /** Optional bar shown above the (sticky) header - e.g. the enrolment notice. */
  announcement?: ReactNode;
  /** Collapse the nav into a full-screen hamburger menu below 900px. */
  mobileMenu?: boolean;
}

export function SiteHeader({
  navLinks,
  cta,
  action,
  announcement,
  mobileMenu = false,
}: SiteHeaderProps) {
  const ctaLink = cta ? (
    <Link
      href={cta.href}
      className="rounded-full bg-accent px-[26px] py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#FDFAF3] no-underline transition-colors hover:bg-ink"
    >
      {cta.label}
    </Link>
  ) : null;

  const rightAction = action ?? ctaLink;

  return (
    <>
      {announcement ? <AnnouncementBar>{announcement}</AnnouncementBar> : null}

      <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-x-6 gap-y-3.5 border-b border-ink/10 bg-cream/90 px-[clamp(20px,5vw,48px)] py-[18px] backdrop-blur-[8px]">
        <Link
          href={routes.home}
          className="flex items-center gap-2.5 font-serif text-2xl tracking-[0.02em] text-ink no-underline"
        >
          <Image
            src="/logo.png"
            alt=""
            aria-hidden="true"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-full object-contain"
          />
          <span>
            Khady&rsquo;s{" "}
            <span className="font-sans text-[22px] font-light italic">Kitchen</span>
          </span>
        </Link>

        <nav
          className={cn(
            "flex flex-wrap items-center gap-x-7 gap-y-3.5 text-[13px] uppercase tracking-[0.1em]",
            mobileMenu && "hidden min-[900px]:flex",
          )}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-ink no-underline transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {mobileMenu ? (
          <div className="flex items-center gap-3">
            {/* A custom action (e.g. the cart) stays visible on mobile; a plain
                promo CTA collapses into the overlay menu instead. */}
            {action ? action : <div className="hidden min-[900px]:block">{ctaLink}</div>}
            <MobileNav
              navLinks={navLinks}
              cta={action ? undefined : cta}
              className="min-[900px]:hidden"
            />
          </div>
        ) : (
          rightAction
        )}
      </header>

      {/* Every page with the site header also gets the mobile tab bar. */}
      <MobileTabBar />
    </>
  );
}
