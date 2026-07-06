"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, routeMeta } from "@/lib/admin/nav";
import { AdminProvider } from "@/lib/admin/store";
import { useLogoutMutation } from "@/redux/auth/auth-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { IUser } from "@/types/user.types";
import { UserRole } from "@/types/user.types";

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Owner · Admin",
  [UserRole.ADMIN]: "Administrator",
  [UserRole.STAFF]: "Staff",
};

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
  account,
  onLogout,
  loggingOut,
}: {
  pathname: string;
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
        {ADMIN_NAV_ITEMS.map((n) => {
          const active = n.isActive(pathname);
          return (
            <Link
              key={n.label}
              href={n.href}
              className={cn(
                "flex items-center rounded-[12px] px-3.5 py-[9px] text-[14px] font-semibold no-underline transition-colors",
                active
                  ? "bg-cream/10 text-cream"
                  : "text-cream/65 hover:bg-cream/10 hover:text-cream",
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="grid gap-3 border-t border-cream/15 px-5 py-[18px]">
        <div className="flex items-center gap-3">
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
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold">{account.name}</div>
            <div className="text-[12px] text-cream/55">{account.meta}</div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[13px] text-cream/65 no-underline transition-colors hover:text-cream"
          >
            ← Back to site
          </Link>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="cursor-pointer text-[13px] font-semibold text-accent-2 transition-colors hover:text-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileMenu({
  open,
  onClose,
  pathname,
  onLogout,
  loggingOut,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
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
        {ADMIN_NAV_ITEMS.map((n) => {
          const active = n.isActive(pathname);
          return (
            <Link
              key={n.label}
              href={n.href}
              onClick={onClose}
              className={cn(
                "py-1 font-serif text-[clamp(20px,5.5vw,26px)] leading-[1.25] no-underline",
                active ? "text-accent-2" : "text-cream",
              )}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-t border-cream/15 px-[clamp(22px,7vw,48px)] pb-9 pt-5">
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
  const { crumb, title } = routeMeta(pathname);

  const user = useCurrentUser();
  const account = accountFor(user);
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // The session is cleared client-side regardless (see logout onQueryStarted).
    }
    router.replace("/login");
  };

  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-cream text-ink">
        <Sidebar
          pathname={pathname}
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
                <h1 className="mt-0.5 truncate font-serif text-[clamp(20px,2.4vw,26px)] font-normal">
                  {title}
                </h1>
              </div>
            </div>
            <span className="hidden whitespace-nowrap text-[12.5px] text-ink/55 min-[1000px]:inline">
              Sat 5 Jul 2026
            </span>
          </header>

          <MobileMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            pathname={pathname}
            onLogout={onLogout}
            loggingOut={loggingOut}
          />

          <main className="mx-auto w-full max-w-[1180px] flex-1 p-[clamp(20px,3.5vw,36px)]">
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
