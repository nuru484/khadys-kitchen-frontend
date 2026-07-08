"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Counts in-app route changes for this tab. More than one distinct pathname
// means there IS app history to go back to; a deep link (detail page opened
// directly) has none, so BackLink falls back to a plain navigation.
let internalNavs = 0;

/** Mount once in a layout-level component (AdminShell) so every route change
 * is counted, whether or not the page renders a BackLink. */
export function useTrackNavHistory() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (last.current !== pathname) {
      last.current = pathname;
      internalNavs += 1;
    }
  }, [pathname]);
}

/**
 * "← All orders"-style back link. When the user arrived from inside the app
 * it goes BACK in history — returning to the list exactly as they left it
 * (page 2, active filters, scroll). Opened as a deep link, it simply navigates
 * to `href`, so it never dumps the user out of the site.
 */
export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={(e) => {
        // Let modified clicks (new tab etc.) behave like a normal link.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (internalNavs > 1) {
          e.preventDefault();
          router.back();
        }
      }}
      className={cn(
        "mb-4 inline-block text-[13.5px] font-semibold text-accent",
        className,
      )}
    >
      {children}
    </Link>
  );
}
