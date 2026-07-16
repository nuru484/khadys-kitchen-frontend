// src/lib/cache-tags.ts
//
// Cache-tag vocabulary shared with the backend. Every public server fetch
// labels its Data Cache entry with one of these tags, and the backend purges
// by tag via POST /api/revalidate after a successful content write — so admin
// changes go live immediately instead of waiting out the ISR window.
//
// The names form a cross-repo contract with
// khadys-kitchen-backend/src/config/cache-tags.ts.

export const CACHE_TAGS = {
  /** Shop catalogue, /shop/[slug] details, featured bakes, sitemap. */
  PRODUCTS: "products",
  /** Class catalogue, /trainings/[slug] details, featured classes, sitemap. */
  TRAININGS: "trainings",
  /** Kitchen photo gallery. */
  GALLERY: "gallery",
  /** The editable "Our Story" content. */
  ABOUT: "about",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/** Every tag /api/revalidate will accept. */
export const ALL_CACHE_TAGS: ReadonlySet<string> = new Set(
  Object.values(CACHE_TAGS),
);
