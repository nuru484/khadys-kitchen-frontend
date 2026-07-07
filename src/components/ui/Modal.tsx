"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** Center the card content (e.g. success confirmations). */
  centered?: boolean;
  /** id of the element that labels the dialog (usually the title). */
  labelledBy?: string;
}

/**
 * Accessible base modal - scrim, centered card, Escape-to-close, click-outside,
 * body scroll-lock, focus-in/restore, and a basic focus trap. Compose product
 * modals (confirmations, forms, success states) on top of it.
 */
export function Modal({
  open,
  onClose,
  children,
  className,
  centered = false,
  labelledBy,
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  // Keep the latest onClose without making it an effect dependency - otherwise
  // an inline `onClose` prop would re-run the effect on every render and steal
  // focus back to the dialog mid-typing.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cardRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusables = cardRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid place-items-center p-[clamp(16px,4vw,44px)]"
      style={{ background: "rgba(24,16,10,0.55)", animation: "kk-fadein .2s both" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        style={{ animation: "kk-toastin .25s both" }}
        className={cn(
          "max-h-[calc(100dvh-32px)] w-full max-w-[400px] overflow-y-auto rounded-[22px] bg-card p-5 outline-none sm:p-7",
          centered && "text-center",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
