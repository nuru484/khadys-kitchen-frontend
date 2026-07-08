"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import type { IUser } from "@/types/user.types";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Profile picture. In edit mode a chosen photo is only STAGED (the caller gets
 * the File and we show a local preview) — nothing reaches Cloudinary until the
 * profile form is submitted, so cancelling never orphans an upload. The
 * magnifier zooms the current photo in any mode.
 */
export function ProfileAvatar({
  user,
  editable = false,
  preview = null,
  onStage,
  caption,
}: {
  user: IUser | null;
  /** When true, clicking the avatar opens the file picker. */
  editable?: boolean;
  /** Local object-URL of a staged (not yet uploaded) photo. */
  preview?: string | null;
  /** Receives the validated staged file. */
  onStage?: (file: File) => void;
  /** Replaces the default name + hint text beside the avatar. Use when the
   * surrounding page already shows the name (e.g. an admin viewing a teammate),
   * to avoid repeating it. */
  caption?: React.ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoomTitleId = useId();
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const picture = preview ?? user?.profilePicture ?? null;
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_BYTES) {
      notify.error("Image must be under 5MB");
      return;
    }
    onStage?.(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <div className="relative flex-none">
        <button
          type="button"
          onClick={() => editable && inputRef.current?.click()}
          disabled={!editable}
          aria-label={editable ? "Change profile photo" : "Profile photo"}
          className={cn(
            "group relative grid h-[92px] w-[92px] place-items-center overflow-hidden rounded-full border border-ink/15 bg-oat/50 font-serif text-[26px] text-ink/70",
            !editable && "cursor-default",
          )}
        >
          {picture ? (
            <Image
              src={picture}
              alt="Profile"
              fill
              sizes="92px"
              className="object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
          {editable ? (
            <span className="absolute inset-0 grid place-items-center bg-ink/45 text-[11px] font-semibold uppercase tracking-[0.08em] text-cream opacity-0 transition-opacity group-hover:opacity-100">
              Change
            </span>
          ) : null}
        </button>
        {picture ? (
          <button
            type="button"
            onClick={() => {
              setZoomed(false);
              setZoomOpen(true);
            }}
            aria-label="View photo"
            className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border border-ink/15 bg-card text-ink/70 shadow-sm transition-colors hover:text-accent"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="min-w-0">
        {caption !== undefined ? (
          <>
            {caption}
            {editable ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-2 block text-[13.5px] font-semibold text-accent"
              >
                {picture ? "Change photo" : "Upload a photo"}
              </button>
            ) : null}
          </>
        ) : (
          <>
            <div className="break-words text-[15px] font-semibold text-ink">
              {user ? `${user.firstName} ${user.lastName}` : "—"}
            </div>
            {editable ? (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-1 text-[13.5px] font-semibold text-accent"
                >
                  {picture ? "Change photo" : "Upload a photo"}
                </button>
                <p className="mt-1 text-[12px] text-ink/45">
                  JPG, PNG or WebP · max 5MB
                  {preview ? " · uploads when you save" : ""}
                </p>
              </>
            ) : (
              <p className="mt-1 text-[12px] text-ink/45">
                Click Edit to change your photo.
              </p>
            )}
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      <Modal
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        labelledBy={zoomTitleId}
        className="max-w-[min(90vw,520px)] p-3"
      >
        <h2 id={zoomTitleId} className="sr-only">
          Profile photo
        </h2>
        {picture ? (
          <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-[16px] bg-oat/40">
            {/* Square crop that fits the viewport; click zooms into the centre
                (overflow-hidden = no scrollbars). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={picture}
              alt="Profile"
              onClick={() => setZoomed((z) => !z)}
              className={cn(
                "h-full w-full origin-center object-cover transition-transform duration-200",
                zoomed
                  ? "scale-[1.8] cursor-zoom-out"
                  : "scale-100 cursor-zoom-in",
              )}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
