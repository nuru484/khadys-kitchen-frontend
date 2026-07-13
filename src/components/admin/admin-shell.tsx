"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  entryIsActive,
  isNavGroup,
  navEntriesFor,
  routeMeta,
  type AdminNavEntry,
} from "@/lib/admin/nav";
import { useTrackNavHistory } from "@/components/admin/back-link";
import { useLogoutMutation } from "@/redux/auth/auth-api";
import { useAuthRole } from "@/hooks/use-auth-role";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { IUser } from "@/types/user.types";
import { UserRole } from "@/types/user.types";

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Owner · Admin",
  [UserRole.ADMIN]: "Administrator",
  [UserRole.STAFF]: "Staff",
};

/** Time-of-day greeting for the dashboard title, e.g. "Good morning, Ama". */
function dashboardGreeting(user: IUser | null, now: Date): string {
  const hour = now.getHours();
  const timeOfDay =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const name = user?.firstName.trim();
  return name ? `Good ${timeOfDay}, ${name}` : `Good ${timeOfDay}`;
}

/** Today, e.g. "Sat 5 Jul 2026". */
function formatToday(now: Date): string {
  return now
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(",", "");
}

function accountFor(user: IUser | null) {
  if (!user)
    return { name: "Admin", meta: "Admin console", initials: "KA", picture: null };
  const name = `${user.firstName} ${user.lastName}`.trim() || "Admin";
  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "A";
  return {
    name,
    meta: ROLE_LABELS[user.role],
    initials,
    picture: user.profilePicture,
  };
}

function Wordmark({ light }: { light?: boolean }) {
  return (
    <span className={cn("font-serif text-[22px]", light && "text-cream")}>
      Khady&rsquo;s{" "}
      <span className="font-sans text-[20px] font-light italic">Kitchen</span>
    </span>
  );
}

function Sidebar({
  pathname,
  items,
  account,
  onLogout,
  loggingOut,
}: {
  pathname: string;
  items: AdminNavEntry[];
  account: { name: string; meta: string; initials: string; picture: string | null };
  onLogout: () => void;
  loggingOut: boolean;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[250px] flex-none flex-col bg-ink text-cream min-[1000px]:flex">
      <div className="border-b border-cream/15 px-[26px] pb-[22px] pt-[26px]">
        <Wordmark />
        <div className="mt-1.5 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-accent-2">
          Admin console
        </div>
      </div>
      <nav className="grid flex-1 content-start gap-0.5 overflow-y-auto p-3.5">
        {items.map((entry) =>
          isNavGroup(entry) ? (
            <NavGroup key={entry.label} entry={entry} pathname={pathname} />
          ) : (
            <Link
              key={entry.label}
              href={entry.href}
              className={cn(
                "flex items-center rounded-[12px] px-3.5 py-[9px] text-[14px] font-semibold no-underline transition-colors",
                entry.isActive(pathname)
                  ? "bg-cream/10 text-cream"
                  : "text-cream/65 hover:bg-cream/10 hover:text-cream",
              )}
            >
              {entry.label}
            </Link>
          ),
        )}
      </nav>
      <AccountMenu account={account} onLogout={onLogout} loggingOut={loggingOut} />
    </aside>
  );
}

/**
 * A collapsible sidebar group (e.g. Trainings → Classes/Applications/Students).
 * Opens automatically when one of its children is the current route.
 */
function NavGroup({
  entry,
  pathname,
}: {
  entry: Extract<AdminNavEntry, { children: unknown }>;
  pathname: string;
}) {
  const active = entryIsActive(entry, pathname);
  const [open, setOpen] = useState(active);

  // Navigating into a child (e.g. via a cross-link) re-opens the group —
  // adjusted during render (React's derive-from-props pattern), not an effect.
  const [prevActive, setPrevActive] = useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    if (active) setOpen(true);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between rounded-[12px] px-3.5 py-[9px] text-[14px] font-semibold transition-colors",
          active && !open
            ? "bg-cream/10 text-cream"
            : "text-cream/65 hover:bg-cream/10 hover:text-cream",
        )}
      >
        {entry.label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180",
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div className="mt-0.5 grid gap-0.5 border-l border-cream/15 pl-2.5 ml-3.5">
          {entry.children.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={cn(
                "flex items-center rounded-[10px] px-3 py-2 text-[13.5px] font-semibold no-underline transition-colors",
                c.isActive(pathname)
                  ? "bg-cream/10 text-cream"
                  : "text-cream/60 hover:bg-cream/10 hover:text-cream",
              )}
            >
              {c.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Sidebar footer: the signed-in account row is a button that opens a small
 * menu (upward, since it sits at the bottom) with Back to site and Sign out —
 * the footer itself stays a single tidy row.
 */
function AccountMenu({
  account,
  onLogout,
  loggingOut,
}: {
  account: { name: string; meta: string; initials: string; picture: string | null };
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const [open, setOpen] = useState(false);

  // Close on Escape or any click outside the footer block.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-account-menu]")) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div data-account-menu className="relative border-t border-cream/15 px-3.5 py-3.5">
      {open ? (
        <div className="absolute inset-x-3.5 bottom-full mb-1.5 grid overflow-hidden rounded-[14px] border border-cream/20 bg-[#3a2b1e] shadow-[0_-8px_28px_rgba(0,0,0,0.45)]">
          <Link
            href="/admin/profile"
            onClick={() => setOpen(false)}
            className="px-4 py-3 text-[13.5px] font-semibold text-cream/80 no-underline transition-colors hover:bg-cream/10 hover:text-cream"
          >
            My profile
          </Link>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="border-t border-cream/10 px-4 py-3 text-[13.5px] font-semibold text-cream/80 no-underline transition-colors hover:bg-cream/10 hover:text-cream"
          >
            ← Back to site
          </Link>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="cursor-pointer border-t border-cream/10 px-4 py-3 text-left text-[13.5px] font-semibold text-accent-2 transition-colors hover:bg-cream/10 hover:text-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] px-1.5 py-1.5 text-left transition-colors hover:bg-cream/10"
      >
        {account.picture ? (
          <Image
            src={account.picture}
            alt={account.name}
            width={38}
            height={38}
            className="h-[38px] w-[38px] flex-none rounded-full object-cover"
          />
        ) : (
          <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-full bg-accent font-serif text-[15px] text-[#FDFAF3]">
            {account.initials}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold text-cream">
            {account.name}
          </span>
          <span className="block text-[12px] text-cream/55">{account.meta}</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            "h-4 w-4 flex-none text-cream/55 transition-transform",
            open && "rotate-180",
          )}
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  pathname,
  items,
  onLogout,
  loggingOut,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  items: AdminNavEntry[];
  onLogout: () => void;
  loggingOut: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-ink text-cream"
      style={{ animation: "kk-fadein .3s both" }}
      role="dialog"
      aria-modal="true"
      aria-label="Admin menu"
    >
      <div className="flex items-center justify-between border-b border-cream/15 px-[clamp(18px,5vw,32px)] py-4">
        <div>
          <Wordmark />
          <span className="mt-[3px] block text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-2">
            Admin console
          </span>
        </div>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border-[1.5px] border-cream/35 bg-transparent text-[17px] text-cream transition-colors hover:border-cream"
        >
          ✕
        </button>
      </div>
      <nav className="grid flex-1 content-start gap-0.5 overflow-y-auto px-[clamp(22px,7vw,48px)] py-6">
        {items.map((entry) =>
          isNavGroup(entry) ? (
            <div key={entry.label} className="py-1">
              <div className="mb-1 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-cream/45">
                {entry.label}
              </div>
              <div className="grid gap-0.5 border-l border-cream/15 pl-4">
                {entry.children.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    onClick={onClose}
                    className={cn(
                      "py-0.5 font-serif text-[clamp(19px,5vw,24px)] leading-[1.25] no-underline",
                      c.isActive(pathname) ? "text-accent-2" : "text-cream",
                    )}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={entry.label}
              href={entry.href}
              onClick={onClose}
              className={cn(
                "py-1 font-serif text-[clamp(20px,5.5vw,26px)] leading-[1.25] no-underline",
                entry.isActive(pathname) ? "text-accent-2" : "text-cream",
              )}
            >
              {entry.label}
            </Link>
          ),
        )}
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-cream/15 px-[clamp(22px,7vw,48px)] pb-9 pt-5">
        <Link
          href="/admin/profile"
          onClick={onClose}
          className="text-[14px] font-semibold text-cream/80 no-underline transition-colors hover:text-cream"
        >
          My profile
        </Link>
        <Link
          href="/"
          onClick={onClose}
          className="text-[14px] text-cream/65 no-underline transition-colors hover:text-cream"
        >
          ← Back to site
        </Link>
        <button
          type="button"
          onClick={() => {
            onClose();
            onLogout();
          }}
          disabled={loggingOut}
          className="cursor-pointer text-[14px] font-semibold text-accent-2 transition-colors hover:text-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { crumb, title: metaTitle } = routeMeta(pathname);

  // Counts route changes so BackLink knows real history exists (vs deep link).
  useTrackNavHistory();

  const user = useCurrentUser();
  const account = accountFor(user);
  const { isAdmin } = useAuthRole();
  // Staff never see the surfaces the backend 403s them on.
  const navItems = navEntriesFor(isAdmin);
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  // AdminShell renders client-side behind RequireAuth, so local time is safe.
  // A minute-tick keeps the header clock current without chatty re-renders.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(tick);
  }, []);
  const title = pathname === "/admin" ? dashboardGreeting(user, now) : metaTitle;

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // The session is cleared client-side regardless (see logout onQueryStarted).
    }
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-cream text-ink">
        <Sidebar
          pathname={pathname}
          items={navItems}
          account={account}
          onLogout={onLogout}
          loggingOut={loggingOut}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3.5 border-b border-ink/10 bg-cream/95 px-[clamp(18px,3.5vw,36px)] py-4 backdrop-blur-[8px]">
            <div className="flex min-w-0 items-center gap-3.5">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
                className="grid h-11 w-11 flex-none cursor-pointer place-items-center rounded-full border-[1.5px] border-ink/[0.28] bg-transparent transition-colors hover:border-accent min-[1000px]:hidden"
              >
                <span className="grid gap-[5px]">
                  <span className="block h-0.5 w-[18px] rounded-sm bg-ink" />
                  <span className="block h-0.5 w-[18px] rounded-sm bg-ink" />
                </span>
              </button>
              <div className="min-w-0">
                <div className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-accent">
                  {crumb}
                </div>
                {/* Phones: clamp to two lines instead of truncating — titles
                    like "Student applications" stay readable at 280px. */}
                <h1 className="mt-0.5 line-clamp-2 font-serif text-[clamp(19px,2.4vw,26px)] font-normal leading-snug min-[1000px]:truncate">
                  {title}
                </h1>
              </div>
            </div>
            <span className="hidden whitespace-nowrap text-right text-[12.5px] leading-tight text-ink/55 min-[1000px]:inline">
              {formatToday(now)}
              <span className="block text-[11.5px] text-ink/40">
                {now.toLocaleTimeString("en-GB", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </span>
          </header>

          <MobileMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            pathname={pathname}
            items={navItems}
            onLogout={onLogout}
            loggingOut={loggingOut}
          />

          <main className="mx-auto w-full max-w-[1180px] flex-1 p-[clamp(20px,3.5vw,36px)]">
            {children}
          </main>
      </div>
    </div>
  );
}
