import type { Metadata } from "next";
import { ProductDetail } from "@/components/shop/product-detail";
import { pageMetadata } from "@/lib/seo";
import { fetchPublicProduct } from "@/lib/public-api";
import { shopProduct } from "@/lib/routes";

// The catalogue is dynamic (admin-managed), so the real product is fetched at
// request time (cached with a revalidate window). If the backend is
// unreachable the title falls back to a slug-derived guess rather than
// failing the page.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchPublicProduct(slug);

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
  return <ProductDetail slug={slug} />;
}
