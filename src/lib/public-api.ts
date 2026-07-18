// Server-side fetchers for the public API — used by the file-convention SEO
// surfaces (sitemap, generateMetadata) where the RTK Query client isn't
// available. Mirrors dms-frontend's sitemap fetcher: responses are cached with
// a revalidate window and failures are swallowed so a backend hiccup never
// breaks a sitemap or a page render.
import { CACHE_TAGS, type CacheTag } from "@/lib/cache-tags";
import type { IAboutContent } from "@/types/about.types";
import type { IGalleryImage } from "@/types/gallery.types";
import type { IProduct } from "@/types/product.types";
import type { ITraining } from "@/types/training.types";

const serverUri = process.env.NEXT_PUBLIC_SERVER_URI;

// 6h window: content is admin-managed and the backend purges the cache tags
// on every write, so the timer is only a fallback against missed purges.
const REVALIDATE_SECONDS = 21600;

/** The public product DTO fields the SEO surfaces care about. */
export interface PublicProduct {
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  updatedAt?: string;
  createdAt?: string;
}

/**
 * A server-side lookup that keeps "the backend said 404" distinct from "the
 * backend was unreachable" — page shells need the difference to choose between
 * `notFound()` and degrading to the client island's retry UX.
 */
export type PublicLookup<T> =
  | { kind: "found"; data: T }
  | { kind: "not-found" }
  | { kind: "error" };

async function lookupJson<T>(
  path: string,
  tag: CacheTag | null,
  init?: RequestInit,
): Promise<PublicLookup<T>> {
  if (!serverUri) return { kind: "error" };
  try {
    const response = await fetch(`${serverUri}/api/v1${path}`, {
      headers: { "Content-Type": "application/json" },
      // An explicit cache mode (e.g. no-store) replaces the revalidate window —
      // Next rejects a request that specifies both. Tagged entries are purged
      // on-demand by the backend after content writes.
      ...(init?.cache || !tag
        ? {}
        : { next: { revalidate: REVALIDATE_SECONDS, tags: [tag] } }),
      ...init,
    });
    if (response.status === 404) return { kind: "not-found" };
    if (!response.ok) {
      console.error(`Public API: ${path} responded ${String(response.status)}`);
      return { kind: "error" };
    }
    const json = (await response.json()) as { data?: T };
    return json.data !== undefined
      ? { kind: "found", data: json.data }
      : { kind: "error" };
  } catch (error) {
    console.error(`Public API: error fetching ${path}:`, error);
    return { kind: "error" };
  }
}

async function fetchJson<T>(path: string, tag: CacheTag): Promise<T | null> {
  if (!serverUri) return null;
  try {
    const response = await fetch(`${serverUri}/api/v1${path}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: REVALIDATE_SECONDS, tags: [tag] },
    });
    if (!response.ok) {
      console.error(`Public API: ${path} responded ${String(response.status)}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Public API: error fetching ${path}:`, error);
    return null;
  }
}

/** The whole public catalogue (one generous page — a small bakery's worth).
 * The backend caps `limit` at 100 (paginationQuery in common-validation.ts);
 * asking for more is a 400 that `fetchJson` would swallow into an empty
 * sitemap, so we request exactly the cap. */
export async function fetchPublicProducts(): Promise<PublicProduct[]> {
  const json = await fetchJson<{ data?: PublicProduct[] }>(
    "/products?limit=100",
    CACHE_TAGS.PRODUCTS,
  );
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * The full published catalogue as `IProduct[]`, for server-rendering the shop
 * list page (real HTML for crawlers). The client `ShopBrowser` island takes
 * this as its initial data and RTK Query hydrates/refetches over it.
 */
export async function fetchPublicProductList(): Promise<IProduct[]> {
  const json = await fetchJson<{ data?: IProduct[] }>("/products?limit=100", CACHE_TAGS.PRODUCTS);
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * A single full product by slug, keeping "backend said 404" distinct from
 * "backend unreachable" so `/shop/[slug]` can `notFound()` on a retired product
 * yet degrade to the client island's retry UX on a hiccup.
 */
export async function lookupPublicProduct(
  slug: string,
): Promise<PublicLookup<IProduct>> {
  return lookupJson<IProduct>(
    `/products/${encodeURIComponent(slug)}`,
    CACHE_TAGS.PRODUCTS,
  );
}

/** The public training DTO fields the SEO surfaces care about. */
export interface PublicTraining {
  name: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  updatedAt?: string;
  createdAt?: string;
}

/** All published trainings (one page at the backend's `limit` cap of 100). */
export async function fetchPublicTrainings(): Promise<PublicTraining[]> {
  const json = await fetchJson<{ data?: PublicTraining[] }>(
    "/trainings?limit=100",
    CACHE_TAGS.TRAININGS,
  );
  return Array.isArray(json?.data) ? json.data : [];
}

/**
 * The full published trainings as `ITraining[]`, for server-rendering the
 * trainings list page. The client `TrainingsCatalogue` island takes this as its
 * initial data and RTK Query hydrates/refetches over it.
 */
export async function fetchPublicTrainingList(): Promise<ITraining[]> {
  const json = await fetchJson<{ data?: ITraining[] }>(
    "/trainings?limit=100",
    CACHE_TAGS.TRAININGS,
  );
  return Array.isArray(json?.data) ? json.data : [];
}

/** The home page's featured shop items (admin's "Featured" toggle, max 3).
 * Fetched server-side so the section is real cached HTML — /api/revalidate
 * refreshes it the moment an admin changes what's featured. */
export async function fetchFeaturedProducts(): Promise<IProduct[]> {
  const json = await fetchJson<{ data?: IProduct[] }>(
    "/products?featured=true&limit=3",
    CACHE_TAGS.PRODUCTS,
  );
  return Array.isArray(json?.data) ? json.data : [];
}

/** The home page's featured classes (same treatment as featured products). */
export async function fetchFeaturedTrainings(): Promise<ITraining[]> {
  const json = await fetchJson<{ data?: ITraining[] }>(
    "/trainings?featured=true&limit=3",
    CACHE_TAGS.TRAININGS,
  );
  return Array.isArray(json?.data) ? json.data : [];
}

/** The editable "Our Story" content (null when never saved — the section's
 * static defaults apply). Server-side so the band renders without a flash. */
export async function fetchPublicAbout(): Promise<IAboutContent | null> {
  const json = await fetchJson<{ data?: IAboutContent | null }>("/about", CACHE_TAGS.ABOUT);
  return json?.data ?? null;
}

/**
 * The published kitchen gallery (newest first, one page at the backend's
 * `limit` cap of 100). The `/gallery` page server-renders this and the client
 * `GalleryShowcase` island takes it as initial data, RTK Query hydrating over it.
 */
export async function fetchPublicGalleryList(): Promise<IGalleryImage[]> {
  const json = await fetchJson<{ data?: IGalleryImage[] }>(
    "/gallery?limit=100",
    CACHE_TAGS.GALLERY,
  );
  return Array.isArray(json?.data) ? json.data : [];
}

/** A single full training by slug — the `/trainings/[slug]` shell needs 404 vs
 * unreachable kept apart (real 404 → `notFound()`, hiccup → client island). The
 * returned `ITraining` is passed into the detail render as initial data. */
export async function lookupPublicTraining(
  slug: string,
): Promise<PublicLookup<ITraining>> {
  return lookupJson<ITraining>(
    `/trainings/${encodeURIComponent(slug)}`,
    CACHE_TAGS.TRAININGS,
  );
}

/** The public application DTO (`GET /applications/:code`) — enough for the
 * status panel a receipt-code link renders. */
export interface PublicApplication {
  code: string;
  fullName: string;
  email: string | null;
  status:
    | "PENDING"
    | "WAITLISTED"
    | "RECRUITED"
    | "REJECTED"
    | "WITHDRAWN";
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID";
  amountDue: number;
  amountPaid: number;
  balance: number;
  currency: string;
  createdAt: string;
  training?: { id: string; name: string; slug: string };
}

/** An application by receipt code. Payment state must be fresh (the applicant
 * lands here straight after paying), so this bypasses the revalidate cache. */
export async function lookupApplicationByCode(
  code: string,
): Promise<PublicLookup<PublicApplication>> {
  return lookupJson<PublicApplication>(
    `/applications/${encodeURIComponent(code)}`,
    null,
    { cache: "no-store" },
  );
}
