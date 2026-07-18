import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/shop/product-detail";
import { pageMetadata } from "@/lib/seo";
import { fetchPublicProducts, lookupPublicProduct } from "@/lib/public-api";
import { shopProduct } from "@/lib/routes";

// The same lookup feeds the metadata and the page; Next memoizes the identical
// fetch within a request, so this is one round-trip.

/**
 * Prerender every published product so the detail pages ship as static HTML
 * (revalidate window + PRODUCTS tag purge keep them fresh). Unknown slugs
 * still render on demand and fill the cache on first hit.
 */
export async function generateStaticParams() {
  const products = await fetchPublicProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lookup = await lookupPublicProduct(slug);
  const product = lookup.kind === "found" ? lookup.data : null;

  // If the backend is unreachable the title falls back to a slug-derived guess
  // rather than failing the page.
  const title =
    product?.name ??
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return pageMetadata({
    title,
    description:
      product?.description ??
      `Order ${title} from Khady's Kitchen - baked to order for pickup in Kumasi.`,
    path: shopProduct(slug),
    keywords: [title, "Kumasi", "order online", "made to order"],
    image: product?.image ?? undefined,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // A genuinely retired slug 404s (stops returning HTTP 200); a backend hiccup
  // falls through to the client island's retry UX instead.
  const lookup = await lookupPublicProduct(slug);
  if (lookup.kind === "not-found") notFound();
  const initialProduct = lookup.kind === "found" ? lookup.data : undefined;

  return <ProductDetail slug={slug} initialProduct={initialProduct} />;
}
