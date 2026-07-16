"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, Pager } from "@/components/admin/ui";
import {
  DateRangeFields,
  FilterBar,
  LabeledSelect,
} from "@/components/admin/filter-bar";
import { ActionMenu } from "@/components/admin/action-menu";
import { useConfirm } from "@/components/admin/use-confirm";
import { GalleryPhotoModal } from "@/components/admin/gallery-photo-modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatDate } from "@/lib/format-date";
import { useAuthRole } from "@/hooks/use-auth-role";
import { useTableQuery } from "@/hooks/use-table-query";
import {
  useDeleteGalleryImageMutation,
  useGetGalleryImagesQuery,
  useSetGalleryImagePublishedMutation,
} from "@/redux/gallery/gallery-api";
import type { IGalleryImage } from "@/types/gallery.types";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "hidden", label: "Hidden" },
];
const DEFAULTS = { status: "all", from: "", to: "" };
const PAGE_SIZE = 12;

export default function GalleryPage() {
  const {
    page,
    search,
    filters,
    resetFilters,
    setSearch,
    setFilter,
    setPage,
    queryParams,
  } = useTableQuery({ defaults: DEFAULTS, pageSize: PAGE_SIZE });

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetGalleryImagesQuery({
      page,
      limit: PAGE_SIZE,
      search: (queryParams.search as string | undefined) ?? undefined,
      published:
        filters.status === "all" ? undefined : filters.status === "published",
      from: filters.from || undefined,
      to: filters.to || undefined,
    });
  const [setPublished] = useSetGalleryImagePublishedMutation();
  const [deletePhoto] = useDeleteGalleryImageMutation();
  const { isAdmin } = useAuthRole();
  const { confirm, dialog } = useConfirm();

  // One modal instance each; `editing` doubles as the edit target.
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<IGalleryImage | null>(null);
  const [viewing, setViewing] = useState<IGalleryImage | null>(null);

  const photos = data?.data ?? [];
  const meta = data?.meta;
  const activeCount = Object.entries(filters).filter(
    ([, v]) => v && v !== "all",
  ).length;
  const hasActiveFilters =
    Boolean(search.trim()) || activeCount > 0 || page > 1;
  // Truly empty (not just filtered to nothing): skip the toolbar entirely.
  const noDataAtAll =
    !isLoading && !isError && (meta?.total ?? 0) === 0 && !hasActiveFilters;

  const toggle = (photo: IGalleryImage) => {
    const next = !photo.isPublished;
    confirm({
      title: next ? "Publish this photo?" : "Hide this photo?",
      description: next
        ? "It appears in the gallery on the website immediately."
        : "It disappears from the website's gallery immediately. You can publish it again any time.",
      confirmText: next ? "Publish" : "Hide photo",
      isDestructive: !next,
      onConfirm: async () => {
        try {
          await setPublished({ id: photo.id, isPublished: next }).unwrap();
          notify.success(next ? "Photo published" : "Photo hidden");
        } catch (err) {
          notify.error("Couldn't update photo", {
            description: extractApiError(err).message,
          });
        }
      },
    });
  };

  const remove = (photo: IGalleryImage) =>
    confirm({
      title: "Delete this photo?",
      description: photo.isPublished
        ? "This photo is still published — hide it first, then delete."
        : "It's removed from the gallery admin. This can't be undone from here.",
      confirmText: "Delete photo",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deletePhoto(photo.id).unwrap();
          notify.success("Photo deleted");
        } catch (err) {
          notify.error("Couldn't delete", {
            description: extractApiError(err).message,
          });
        }
      },
    });

  if (noDataAtAll) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <EmptyState
          title="No photos yet"
          description="Share what's happening in the kitchen — add your first photo and publish it to the website."
          action={{ label: "+ Add photo", onClick: () => setAdding(true) }}
        />
        <GalleryPhotoModal open={adding} onClose={() => setAdding(false)} />
      </div>
    );
  }

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <FilterBar
        collapseFilters
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search captions…"
        activeCount={activeCount}
        onClear={resetFilters}
        resultLabel={meta ? `${String(meta.total)} total` : undefined}
        action={
          <Button size="sm" onClick={() => setAdding(true)}>
            + Add photo
          </Button>
        }
      >
        <LabeledSelect
          label="Status"
          value={filters.status}
          active={filters.status !== "all"}
          onChange={(v) => setFilter("status", v)}
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </LabeledSelect>
        <DateRangeFields
          from={filters.from}
          to={filters.to}
          onFrom={(v) => setFilter("from", v)}
          onTo={(v) => setFilter("to", v)}
        />
      </FilterBar>

      {isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !isLoading && photos.length === 0 ? (
        <EmptyState
          title="No matching photos"
          description="Nothing matches your current search or filters — try clearing them."
        />
      ) : (
        <>
          <div
            aria-busy={isLoading}
            className={cn(
              // Single column on narrow phones — 2-up at <420px leaves no room
              // for the caption/badge footer.
              "grid grid-cols-1 gap-[clamp(12px,2vw,20px)] transition-opacity min-[420px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4",
              isFetching && !isLoading && "opacity-60",
            )}
          >
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-square w-full rounded-none" />
                    <div className="grid gap-2 p-3">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </Card>
                ))
              : photos.map((p) => (
                  <Card key={p.id} className="group overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setViewing(p)}
                      title="View full size"
                      className="relative block aspect-square w-full cursor-zoom-in overflow-hidden"
                    >
                      <Image
                        src={p.image}
                        alt={p.caption ?? "Kitchen photo"}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.16,.84,.28,1)] group-hover:scale-[1.06]"
                      />
                    </button>
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <div
                          title={p.caption ?? undefined}
                          className={cn(
                            "truncate text-[13.5px] font-semibold",
                            p.caption ? "text-ink" : "text-ink/40",
                          )}
                        >
                          {p.caption ?? "No caption"}
                        </div>
                        <div className="mt-0.5 text-[12px] text-ink/50">
                          {formatDate(p.createdAt)}
                        </div>
                      </div>
                      <div className="flex flex-none items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggle(p)}
                          className="cursor-pointer"
                          title={p.isPublished ? "Hide from the site" : "Publish to the site"}
                        >
                          <StatusBadge
                            status={p.isPublished ? "PUBLISHED" : "DRAFT"}
                            label={p.isPublished ? "Published" : "Hidden"}
                          />
                        </button>
                        <ActionMenu
                          items={[
                            { label: "View full size", onClick: () => setViewing(p) },
                            { label: "Edit", onClick: () => setEditing(p) },
                            {
                              label: p.isPublished ? "Hide" : "Publish",
                              onClick: () => toggle(p),
                            },
                            ...(isAdmin
                              ? [
                                  {
                                    label: "Delete",
                                    variant: "danger" as const,
                                    onClick: () => remove(p),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
          </div>
          {meta ? (
            <Pager page={page} pageCount={meta.totalPages} onPage={setPage} />
          ) : null}
        </>
      )}

      <GalleryPhotoModal open={adding} onClose={() => setAdding(false)} />
      <GalleryPhotoModal
        open={Boolean(editing)}
        photo={editing}
        onClose={() => setEditing(null)}
      />

      {/* Full-size viewer — the photo at its natural aspect, caption below. */}
      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        labelledBy="gallery-viewer-caption"
        className="max-w-[920px] p-3 sm:p-4"
      >
        {viewing ? (
          <figure className="m-0">
            <Image
              src={viewing.image}
              alt={viewing.caption ?? "Kitchen photo"}
              width={1600}
              height={1200}
              sizes="(max-width: 1000px) 92vw, 900px"
              className="h-auto max-h-[74dvh] w-full rounded-[14px] object-contain"
            />
            <figcaption
              id="gallery-viewer-caption"
              className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1 pt-3"
            >
              <span className="text-[14.5px] text-ink/80">
                {viewing.caption ?? "No caption"}
              </span>
              <span className="text-[12.5px] text-ink/50">
                Added {formatDate(viewing.createdAt)}
              </span>
            </figcaption>
          </figure>
        ) : null}
      </Modal>

      {dialog}
    </div>
  );
}
