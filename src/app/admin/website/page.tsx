"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/admin/ui";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ErrorState } from "@/components/ui/ErrorState";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatDateTime } from "@/lib/format-date";
import {
  useGetAdminAboutQuery,
  useUpdateAboutMutation,
} from "@/redux/about/about-api";

const schema = z.object({
  storyEyebrow: z.string().trim().max(200),
  storyHeading: z.string().trim().max(300),
  storyBody: z.string().trim().max(4000),
  storyPullQuote: z.string().trim().max(500),
  storyFounder: z.string().trim().max(150),
});
type Values = z.infer<typeof schema>;

const labelCls =
  "text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60";
const areaCls =
  "w-full rounded-[12px] border-[1.5px] border-ink/20 bg-cream px-[15px] py-3 font-sans text-[15px] text-ink outline-none transition-colors focus:border-accent";

/**
 * The only editable website content: the home page's About (Our Story)
 * section. Blank fields fall back to the site's built-in copy, so partial
 * edits are safe. The photo is staged locally and uploads with the save.
 */
export default function WebsitePage() {
  const { data, isLoading, isError, error, refetch } = useGetAdminAboutQuery();
  const [updateAbout, { isLoading: saving }] = useUpdateAboutMutation();

  const about = data?.data;

  const [photo, setPhoto] = useState<{ cleared: boolean; file: File | null }>({
    cleared: false,
    file: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    values: {
      storyEyebrow: about?.storyEyebrow ?? "",
      storyHeading: about?.storyHeading ?? "",
      storyBody: about?.storyBody ?? "",
      storyPullQuote: about?.storyPullQuote ?? "",
      storyFounder: about?.storyFounder ?? "",
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-[720px]" aria-busy="true">
        <Card className="grid gap-4 p-[clamp(20px,3vw,28px)]">
          <Skeleton className="h-5 w-2/5" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="grid gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-[12px]" />
            </div>
          ))}
          <Skeleton className="h-28 w-full rounded-[12px]" />
        </Card>
      </div>
    );
  }
  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  const onSubmit = async (v: Values) => {
    try {
      await updateAbout({
        body: {
          // Blank = cleared (null): the public page then uses its default copy.
          storyEyebrow: v.storyEyebrow || null,
          storyHeading: v.storyHeading || null,
          storyBody: v.storyBody || null,
          storyPullQuote: v.storyPullQuote || null,
          storyFounder: v.storyFounder || null,
          storyImage: photo.cleared ? null : (about?.storyImage ?? undefined),
        },
        image: photo.file ?? undefined,
      }).unwrap();
      notify.success("About section updated");
    } catch (err) {
      notify.error("Couldn't save the About section", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <div style={{ animation: "kk-rise .5s both" }} className="max-w-[720px]">
      <form
        noValidate
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className="grid gap-[18px]"
      >
        <Card className="grid gap-4 p-[clamp(20px,3vw,28px)]">
          <div>
            <h2 className="font-serif text-[20px]">Home page · About section</h2>
            <p className="mt-1 text-[14px] text-ink/55">
              What visitors read in the “About” band on the home page. Leave a
              field blank to use the site&rsquo;s built-in copy.
              {about?.updatedAt
                ? ` Last saved ${formatDateTime(about.updatedAt)}.`
                : ""}
            </p>
          </div>

          <TextField
            label="Eyebrow"
            placeholder="e.g. About"
            hint="The small label above the heading."
            error={errors.storyEyebrow?.message}
            {...register("storyEyebrow")}
          />
          <TextField
            label="Heading"
            placeholder="e.g. Two ovens, one obsession."
            error={errors.storyHeading?.message}
            {...register("storyHeading")}
          />
          <div className="grid gap-[7px]">
            <span className={labelCls}>Body</span>
            <textarea
              rows={6}
              placeholder="The story itself. Separate paragraphs with a blank line."
              {...register("storyBody")}
              className={areaCls}
            />
            {errors.storyBody ? (
              <span className="text-[12.5px] font-semibold text-danger">
                {errors.storyBody.message}
              </span>
            ) : null}
          </div>
          <TextField
            label="Pull quote"
            placeholder="e.g. Bread should taste like someone was up early caring about it."
            error={errors.storyPullQuote?.message}
            {...register("storyPullQuote")}
          />
          <TextField
            label="Quote credit"
            placeholder="e.g. Khady, founder"
            error={errors.storyFounder?.message}
            {...register("storyFounder")}
          />
          <FileUploadField
            label="Section photo"
            kind="image"
            accept="image/*"
            hint="JPG, PNG or WebP, up to 10MB. Blank = the default photo."
            currentUrl={about?.storyImage}
            onChange={setPhoto}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={saving} loadingText="Saving…">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
