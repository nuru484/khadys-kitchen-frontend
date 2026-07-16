"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import {
  useCreateGalleryImageMutation,
  useUpdateGalleryImageMutation,
} from "@/redux/gallery/gallery-api";
import type { IGalleryImage } from "@/types/gallery.types";

const MAX_CAPTION = 300; // matches the backend createGalleryImageSchema cap

/**
 * Add / edit dialog for a gallery photo. Uploads are deliberately one photo
 * per save — the file travels WITH the request as multipart, so there is no
 * background job to queue and a cancelled dialog never orphans an upload.
 * Editing changes the caption and/or replaces the photo (never clears it —
 * the photo IS the record).
 */
export function GalleryPhotoModal({
  open,
  onClose,
  photo,
}: {
  open: boolean;
  onClose: () => void;
  /** Set when editing; omitted when adding a new photo. */
  photo?: IGalleryImage | null;
}) {
  const editing = Boolean(photo);
  const [caption, setCaption] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const [staged, setStaged] = useState<{ file: File | null; cleared: boolean }>(
    { file: null, cleared: false },
  );
  const [createPhoto, { isLoading: creating }] =
    useCreateGalleryImageMutation();
  const [updatePhoto, { isLoading: updating }] =
    useUpdateGalleryImageMutation();
  const saving = creating || updating;

  // Re-seed the form each time the dialog opens (or targets another photo).
  // FileUploadField owns its staged state, so remount it via `key` below.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset when the dialog (re)opens for a different photo
    setCaption(photo?.caption ?? "");
    setPublishNow(false);
    setStaged({ file: null, cleared: false });
  }, [open, photo]);

  const submit = async () => {
    const trimmed = caption.trim();
    if (trimmed.length > MAX_CAPTION) {
      notify.error(`Caption must be ${MAX_CAPTION} characters or fewer`);
      return;
    }
    try {
      if (!editing) {
        if (!staged.file) {
          notify.error("Choose a photo first");
          return;
        }
        await createPhoto({
          body: {
            ...(trimmed ? { caption: trimmed } : {}),
            ...(publishNow ? { isPublished: true } : {}),
          },
          photo: staged.file,
        }).unwrap();
        notify.success(
          publishNow ? "Photo added and published" : "Photo added",
          publishNow
            ? undefined
            : { description: "It stays hidden until you publish it." },
        );
      } else if (photo) {
        await updatePhoto({
          id: photo.id,
          // Empty caption clears it server-side (null), per the backend schema.
          body: { caption: trimmed ? trimmed : null },
          photo: staged.file ?? undefined,
        }).unwrap();
        notify.success("Photo updated");
      }
      onClose();
    } catch (err) {
      notify.error(editing ? "Couldn't update photo" : "Couldn't add photo", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="gallery-photo-title"
      className="max-w-[480px]"
    >
      <h2
        id="gallery-photo-title"
        className="mb-4 font-serif text-[21px] font-normal"
      >
        {editing ? "Edit photo" : "Add a photo"}
      </h2>

      <div className="grid gap-[18px]">
        <FileUploadField
          key={`${String(open)}-${photo?.id ?? "new"}`}
          label={editing ? "Replace photo" : "Photo"}
          hint="JPG, PNG or WebP, up to 10MB."
          currentUrl={photo?.image}
          onChange={setStaged}
        />

        <label className="grid gap-[7px]">
          <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
            Caption <span className="font-normal normal-case">(optional)</span>
          </span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            maxLength={MAX_CAPTION}
            placeholder="e.g. Saturday's sourdough coming out of the oven"
            className="w-full resize-none rounded-[12px] border-[1.5px] border-ink/20 bg-cream px-[15px] py-3 font-sans text-[15px] text-ink outline-none transition-colors focus:border-accent"
          />
          <span className="text-[12px] text-ink/50">
            Shown under the photo on the site and read aloud by screen readers.
          </span>
        </label>

        {!editing ? (
          <label className="flex cursor-pointer items-center gap-2.5 text-[14.5px] text-ink/80">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
              className="h-4 w-4 accent-[--color-accent]"
            />
            Publish to the site right away
          </label>
        ) : null}

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            isLoading={saving}
            loadingText="Saving…"
            onClick={() => void submit()}
          >
            {editing ? "Save changes" : "Add photo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
