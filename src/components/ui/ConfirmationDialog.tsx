"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export type ConfirmTone = "destructive" | "success" | "brand";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  /** Overrides the tone derived from `isDestructive`. */
  tone?: ConfirmTone;
  /** Type-to-confirm gate: the confirm button stays disabled until this exact
   * phrase is typed (for high-risk actions). */
  requireExactMatch?: string;
  /** Extra content between the description and the actions (e.g. a checkbox). */
  children?: ReactNode;
}

const TONE_STYLES: Record<ConfirmTone, { glyph: string; iconClass: string; confirm: string }> = {
  destructive: {
    glyph: "✕",
    iconClass: "bg-danger/10 text-danger",
    confirm: "bg-danger text-[#FDFAF3] hover:opacity-90",
  },
  success: {
    glyph: "✓",
    iconClass: "bg-[#2E6B3F]/[0.12] text-[#2E6B3F]",
    confirm: "bg-accent text-[#FDFAF3] hover:bg-ink",
  },
  brand: {
    glyph: "✓",
    iconClass: "bg-accent/10 text-accent",
    confirm: "bg-accent text-[#FDFAF3] hover:bg-ink",
  },
};

/** Confirm/cancel modal with an optional destructive tone and type-to-confirm gate. */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  tone,
  requireExactMatch,
  children,
}: ConfirmationDialogProps) {
  const titleId = useId();
  const [typed, setTyped] = useState("");
  const resolvedTone: ConfirmTone = tone ?? (isDestructive ? "destructive" : "success");
  const styles = TONE_STYLES[resolvedTone];

  // Reset the gate whenever the dialog re-opens.
  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const gated = Boolean(requireExactMatch) && typed.trim() !== requireExactMatch;

  const confirm = () => {
    if (gated) return;
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} labelledBy={titleId} centered>
      <span
        className={cn("mx-auto mb-4 grid h-[52px] w-[52px] place-items-center rounded-full text-[20px]", styles.iconClass)}
        aria-hidden="true"
      >
        {styles.glyph}
      </span>
      <h3 id={titleId} className="mb-2 font-serif text-[22px] font-normal">
        {title}
      </h3>
      <div className="mb-[22px] text-[14.5px] leading-[1.6] text-ink/65">{description}</div>

      {children ? <div className="mb-5">{children}</div> : null}

      {requireExactMatch ? (
        <label className="mb-4 grid gap-2 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
          Type &ldquo;{requireExactMatch}&rdquo; to confirm
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className="w-full rounded-[12px] border border-ink/20 bg-cream px-3.5 py-2.5 font-sans text-[15px] font-normal normal-case tracking-normal text-ink outline-none focus:border-accent"
          />
        </label>
      ) : null}

      <div className="flex flex-wrap justify-center gap-2.5">
        <button
          type="button"
          onClick={confirm}
          disabled={gated}
          className={cn(
            "cursor-pointer rounded-full border-none px-6 py-[13px] text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
            styles.confirm,
          )}
        >
          {confirmText}
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="cursor-pointer rounded-full border-[1.5px] border-ink/25 bg-transparent px-6 py-[11.5px] text-[14px] font-semibold text-ink transition-colors hover:border-ink"
        >
          {cancelText}
        </button>
      </div>
    </Modal>
  );
}
