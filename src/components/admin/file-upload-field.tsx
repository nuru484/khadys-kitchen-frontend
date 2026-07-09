"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024; // matches the backend's 10MB cap

export interface FileUploadValue {
  /** The staged File to upload on submit, or null when none is staged. */
  file: File | null;
  /**
   * What the form should persist for the existing asset:
   * - `undefined` → unchanged (keep whatever's saved)
   * - `""`        → cleared (send null to delete it)
   * - the current URL when a new file is staged (server overwrites it on upload)
   */
  clear: boolean;
}

/**
 * A reusable "select a file from your system" field — image or document. The
 * chosen file is only STAGED locally (object-URL preview); nothing reaches
 * Cloudinary until the parent form submits it as multipart, so cancelling never
 * orphans an upload. Supports choose / replace / remove, and shows the existing
 * asset when editing. DRY across the product, training, and profile forms.
 */
export function FileUploadField({
  label,
  hint,
  accept = "image/*",
  kind = "image",
  currentUrl,
  onChange,
}: {
  label: string;
  hint?: string;
  /** input `accept`, e.g. "image/*" or "application/pdf". */
  accept?: string;
  /** Controls the preview shape: an image thumbnail or a document chip. */
  kind?: "image" | "document";
  /** Existing saved asset URL when editing (null/"" when none). */
  currentUrl?: string | null;
  /** Reports the staged file and whether the asset was cleared. */
  onChange: (value: { file: File | null; cleared: boolean }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  // Once the user removes the asset, stop falling back to currentUrl — the
  // preview must reflect the pending "cleared" state, not the saved one.
  const [cleared, setCleared] = useState(false);

  const shownUrl = previewUrl || (file || cleared ? "" : (currentUrl ?? ""));
  const hasAsset = Boolean(file || shownUrl);

  const revoke = () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  };

  const pick = (chosen: File | undefined) => {
    if (!chosen) return;
    const okType =
      accept === "image/*"
        ? chosen.type.startsWith("image/")
        : accept
            .split(",")
            .some((a) => chosen.type === a.trim() || a.trim() === "*/*");
    if (!okType) {
      notify.error(
        kind === "image" ? "Please choose an image file" : "Please choose a valid file",
      );
      return;
    }
    if (chosen.size > MAX_BYTES) {
      notify.error("File must be under 10MB");
      return;
    }
    revoke();
    setFile(chosen);
    setCleared(false);
    setPreviewUrl(kind === "image" ? URL.createObjectURL(chosen) : "");
    if (inputRef.current) inputRef.current.value = "";
    onChange({ cleared: false, file: chosen });
  };

  const remove = () => {
    revoke();
    setFile(null);
    setCleared(true);
    setPreviewUrl("");
    if (inputRef.current) inputRef.current.value = "";
    // Cleared: staged file dropped AND any existing saved asset removed.
    onChange({ cleared: true, file: null });
  };

  return (
    <div className="grid gap-[7px]">
      <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-4">
        {kind === "image" && shownUrl ? (
          <Image
            src={shownUrl}
            alt={label}
            width={120}
            height={120}
            className="h-[104px] w-[104px] flex-none rounded-[14px] border border-ink/10 object-cover"
          />
        ) : (
          <div
            className={cn(
              "grid h-[104px] w-[104px] flex-none place-items-center rounded-[14px] border-[1.5px] border-dashed text-center text-[11px]",
              hasAsset ? "border-accent/40 text-accent" : "border-ink/25 text-ink/45",
            )}
          >
            {kind === "document" && hasAsset ? (
              <span className="px-2 font-semibold leading-tight">
                {file ? file.name : "Document attached"}
              </span>
            ) : (
              "None yet"
            )}
          </div>
        )}
        <div className="grid min-w-0 gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              {hasAsset ? "Replace" : "Choose file"}
            </Button>
            {hasAsset ? (
              <Button type="button" variant="ghost" size="sm" onClick={remove}>
                Remove
              </Button>
            ) : null}
          </div>
          {kind === "document" && shownUrl && !file ? (
            <a
              href={shownUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-[240px] truncate text-[12.5px] font-semibold text-accent"
            >
              View current file ↗
            </a>
          ) : null}
          {hint ? <span className="text-[12px] text-ink/50">{hint}</span> : null}
          {file ? (
            <span className="text-[12px] text-ink/50">Uploads when you save.</span>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
