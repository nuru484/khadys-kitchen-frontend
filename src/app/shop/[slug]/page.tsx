import type { Metadata } from "next";
import { ProductDetail } from "@/components/shop/product-detail";
import { pageMetadata } from "@/lib/seo";
import { shopProduct } from "@/lib/routes";

// The catalogue is dynamic (admin-managed), so metadata is derived from the
// slug rather than a build-time product list.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return pageMetadata({
    title,
    description: `Order ${title} from Khady's Kitchen - baked to order for pickup in Kumasi.`,
    path: shopProduct(slug),
    keywords: [title, "Kumasi", "order online", "made to order"],
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
