"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useUploadTrainingImageMutation } from "@/redux/trainings/trainings-api";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Cover-image picker: validates + uploads the file to the media endpoint on
 * selection, then stores the returned URL in form state. Keeps the training
 * create/update payload as plain JSON (coverImage is just a URL string).
 */
export function CoverImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [upload, { isLoading }] = useUploadTrainingImageMutation();
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_BYTES) {
      notify.error("Image must be under 5MB");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await upload(formData).unwrap();
      onChange(res.data.url);
      notify.success("Cover uploaded");
    } catch (err) {
      notify.error("Upload failed", { description: extractApiError(err).message });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-3">
      <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
        Cover image
      </span>
      {value ? (
        <div className="relative h-44 w-full overflow-hidden rounded-[14px] border border-ink/10">
          <Image src={value} alt="Cover preview" fill className="object-cover" />
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        isLoading={isLoading}
        loadingText="Uploading…"
        onClick={() => inputRef.current?.click()}
        className="border-dashed"
      >
        {value ? "Change cover image" : "Upload cover image"}
      </Button>
      <p className="text-[12px] text-ink/50">JPG, PNG, WebP or GIF · max 5MB</p>
    </div>
  );
}
