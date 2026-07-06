"use client";

import { useState, type ReactNode } from "react";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

interface ConfirmOptions {
  title: string;
  description: ReactNode;
  confirmText?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * One confirmation dialog per page, opened imperatively. Every admin action
 * routes through `confirm({...})`; render `dialog` once. Keeps each page from
 * juggling a separate dialog + pending-state per action.
 */
export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);

  const confirm = (options: ConfirmOptions) => setOpts(options);

  const dialog = (
    <ConfirmationDialog
      open={opts !== null}
      onOpenChange={(open) => {
        if (!open) setOpts(null);
      }}
      title={opts?.title ?? ""}
      description={opts?.description ?? ""}
      confirmText={opts?.confirmText}
      isDestructive={opts?.isDestructive}
      onConfirm={() => {
        void opts?.onConfirm();
      }}
    />
  );

  return { confirm, dialog };
}
