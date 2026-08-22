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
 * Compact dropdown for row/detail actions, behind a "⋯" trigger. Keeps
 * tables tidy when a row has many actions and collapses gracefully on small
 * screens. Closes on outside click, Escape, and after an action runs; clicks
 * never bubble to the row (rows navigate on click).
 */
export function ActionMenu({
  items,
  label,
  align = "right",
  className,
  trigger,
  triggerClassName,
  triggerStyle,
  triggerAriaLabel,
}: {
  items: ActionItem[];
  /** Labelled pill trigger ("More", "Actions"); omit for the ⋯ icon button. */
  label?: string;
  align?: "left" | "right";
  className?: string;
  /** Fully custom trigger content (wins over `label`) - rendered inside the
   * menu button so the portal/flip/keyboard logic stays shared. Receives the
   * open state (e.g. to rotate a chevron). */
  trigger?: (open: boolean) => React.ReactNode;
  /** Classes for the custom trigger's button (replaces the default styling). */
  triggerClassName?: string;
  /** Inline styles for the custom trigger's button (e.g. status colours). */
  triggerStyle?: React.CSSProperties;
  /** Accessible name for a custom trigger whose content isn't self-describing. */
  triggerAriaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);
  const [pos, setPos] = useState<{
    left: number;
    /** Set when opening downward. */
    top?: number;
    /** Set when flipped upward (distance from the viewport bottom) - anchoring
     * by `bottom` keeps the flip exact whatever the menu's real height. */
    bottom?: number;
    maxHeight?: number;
  } | null>(null);

  const closeAndRestore = () => {
    setOpen(false);
    // Return focus to the trigger - it's the element the menu belongs to.
    rootRef.current?.querySelector<HTMLButtonElement>(":scope > button")?.focus();
  };

  // Roving focus: the menu is portaled, so the browser's Tab order would walk
  // straight past it. We move focus in on open and keep it inside until close.
  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const buttons = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        'button[role="menuitem"]:not([disabled])',
      ) ?? [],
    );
    if (buttons.length === 0) return;
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const focusAt = (i: number) =>
      buttons[(i + buttons.length) % buttons.length]?.focus();

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusAt(current + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusAt(current - 1);
        break;
      case "Home":
        e.preventDefault();
        buttons[0].focus();
        break;
      case "End":
        e.preventDefault();
        buttons[buttons.length - 1].focus();
        break;
      case "Tab":
        e.preventDefault();
        focusAt(e.shiftKey ? current - 1 : current + 1);
        break;
      case "Escape":
        e.preventDefault();
        closeAndRestore();
        break;
    }
  };

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

    // Flip above the trigger when the menu wouldn't fit below (a row near the
    // viewport bottom) - a fixed-position menu can't be scrolled into view.
    // Measure the real menu when it's mounted; estimate from the item count on
    // first open (~41px per item + container padding).
    const menuHeight =
      menuRef.current?.offsetHeight ?? items.length * 41 + 14;
    const margin = 6;
    const spaceBelow = window.innerHeight - rect.bottom - margin - 8;
    const spaceAbove = rect.top - margin - 8;
    if (menuHeight > spaceBelow && spaceAbove > spaceBelow) {
      setPos({
        left,
        bottom: window.innerHeight - rect.top + margin,
        // Ultra-short viewports: cap and let the menu scroll internally.
        maxHeight: menuHeight > spaceAbove ? spaceAbove : undefined,
      });
    } else {
      setPos({
        left,
        top: rect.bottom + margin,
        maxHeight: menuHeight > spaceBelow ? spaceBelow : undefined,
      });
    }
  };

  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Second pass once the menu exists in the DOM: re-place using its measured
  // height, so the flip/clamp decision doesn't rest on the estimate.
  useLayoutEffect(() => {
    if (open && pos && menuRef.current) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pos !== null]);

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

  // Move focus onto the first item once the menu has mounted and positioned.
  useEffect(() => {
    if (!open) {
      focusedRef.current = false;
      return;
    }
    if (pos && !focusedRef.current && menuRef.current) {
      focusedRef.current = true;
      menuRef.current
        .querySelector<HTMLButtonElement>('button[role="menuitem"]:not([disabled])')
        ?.focus();
    }
  }, [open, pos]);

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-block", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {trigger ? (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={triggerAriaLabel}
          onClick={() => setOpen((o) => !o)}
          className={triggerClassName}
          style={triggerStyle}
        >
          {trigger(open)}
        </button>
      ) : label ? (
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
              aria-orientation="vertical"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={onMenuKeyDown}
              className={cn(
                "fixed z-[120] w-[190px] rounded-[14px] border border-ink/15 bg-card p-1.5",
                pos.maxHeight !== undefined && "overflow-y-auto",
              )}
              style={{
                animation: "kk-rise .15s ease both",
                left: pos.left,
                top: pos.top,
                bottom: pos.bottom,
                maxHeight: pos.maxHeight,
              }}
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
                      ? "text-danger hover:bg-danger/[0.08]"
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
