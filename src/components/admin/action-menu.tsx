"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface ActionItem {
  label: string;
  onClick: () => void;
  /** Renders in the danger colour (delete, cancel, …). */
  variant?: "default" | "danger";
  disabled?: boolean;
}

/**
 * Compact dropdown for row/detail actions — the dms-style "⋯" menu. Keeps
 * tables tidy when a row has many actions and collapses gracefully on small
 * screens. Closes on outside click, Escape, and after an action runs; clicks
 * never bubble to the row (rows navigate on click).
 */
export function ActionMenu({
  items,
  label,
  align = "right",
  className,
}: {
  items: ActionItem[];
  /** Labelled pill trigger ("More", "Actions"); omit for the ⋯ icon button. */
  label?: string;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  // The menu renders in a body portal with fixed positioning, so it overlays
  // the page instead of being clipped by a table's overflow container (which
  // would force a two-row table to scroll just to reveal the menu).
  const place = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = 190;
    const left =
      align === "right"
        ? Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))
        : Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    setPos({ left, top: rect.bottom + 6 });
  };

  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onMove = () => place();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {label ? (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-ink/25 bg-transparent px-3.5 py-2 text-[12.5px] font-semibold text-ink transition-colors hover:border-ink/50 lg:px-4 lg:text-[13px]"
        >
          {label}
          <svg
            viewBox="0 0 24 24"
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Actions"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "grid h-8 w-8 cursor-pointer place-items-center rounded-full border-[1.5px] bg-transparent text-ink/70 transition-colors",
            open ? "border-accent text-accent" : "border-ink/20 hover:border-ink/45 hover:text-ink",
          )}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>
      )}

      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              onClick={(e) => e.stopPropagation()}
              className="fixed z-[120] w-[190px] rounded-[14px] border border-ink/15 bg-card p-1.5"
              style={{ animation: "kk-rise .15s ease both", left: pos.left, top: pos.top }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  className={cn(
                    "block w-full cursor-pointer rounded-[10px] px-3.5 py-2.5 text-left text-[13.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                    item.variant === "danger"
                      ? "text-[#A32036] hover:bg-[rgba(163,32,54,0.08)]"
                      : "text-ink hover:bg-accent/[0.07]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
