import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

/**
 * Shared per-page metadata builder - the Khady's Kitchen counterpart to
 * dms-frontend's `donateMetadata`.
 *
 * - `title` gets the brand suffix and is set `absolute` so it bypasses the root
 *   layout's title template.
 * - `path` is used as the self-referential canonical and the OG url (relative,
 *   resolved against `metadataBase`).
 * - The OG/Twitter image is provided site-wide by `app/opengraph-image.tsx`, so
 *   it is intentionally not set here (Next merges the file-convention image in).
 */
interface PageMetaInput {
  title: string;
  description: string;
  /** Absolute path, e.g. "/apply" - canonical + OG url. */
  path: string;
  keywords?: string[];
  /** Set false for transactional/no-value pages (e.g. the cart). */
  index?: boolean;
  /**
   * Page-specific OG/Twitter image (absolute URL, e.g. a product's Cloudinary
   * shot). Omit to inherit the site-wide `app/opengraph-image.tsx` card.
   */
  image?: string;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  index = true,
  image,
}: PageMetaInput): Metadata {
  const fullTitle = `${title} · ${siteConfig.name}`;
  const ogImage = image
    ? { url: image, width: 1200, height: 630, alt: fullTitle }
    : undefined;
  return {
    title: { absolute: fullTitle },
    description,
    keywords,
    alternates: { canonical: path },
    robots: index ? undefined : { index: false, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
