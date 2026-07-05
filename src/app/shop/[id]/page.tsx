import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { AddToCart } from "@/components/shop/add-to-cart";
import { routes, shopProduct } from "@/lib/routes";
import { getProduct, listPriceLabel, products } from "@/lib/shop-data";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    title: product.name,
    description: product.shortDesc,
    path: shopProduct(product.id),
    keywords: [
      product.name,
      product.catLabel,
      "Kumasi",
      "order online",
      "made to order",
    ],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-[1180px] px-[clamp(20px,5vw,48px)] py-[clamp(36px,5vw,64px)]">
      <Link
        href={routes.shop}
        className="mb-[clamp(24px,3vw,36px)] inline-block text-[14px] font-semibold uppercase tracking-[0.08em] text-ink/65 no-underline transition-colors hover:text-accent"
      >
        ← All bakes
      </Link>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-[clamp(32px,5vw,64px)]">
        <Reveal
          variant="mask-img"
          className="relative block h-[clamp(360px,44vw,540px)] w-full overflow-hidden rounded-b-[20px] rounded-t-[min(220px,34vw)] border border-ink/15"
        >
          <Image
            src={product.img}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>

        <div>
          <p
            className="mb-3.5 text-[13px] font-semibold uppercase tracking-[0.22em] text-accent"
            style={{ animation: "kk-fadein .7s .1s both" }}
          >
            {product.unit}
          </p>
          <h1 className="mb-3.5 font-serif text-[clamp(34px,4.4vw,56px)] font-normal leading-[1.08]">
            <span className="block overflow-hidden">
              <span
                className="inline-block"
                style={{ animation: "kk-lineup .9s .15s cubic-bezier(.16,.84,.28,1) both" }}
              >
                {product.name}
              </span>
            </span>
          </h1>
          <div
            className="mb-2.5 font-serif text-[clamp(22px,2.4vw,28px)]"
            style={{ animation: "kk-fadein .7s .3s both" }}
          >
            {listPriceLabel(product)}
          </div>
          <div
            className="mb-[22px] inline-block rounded-full bg-accent/10 px-3.5 py-[7px] text-[13px] font-semibold uppercase tracking-[0.08em] text-accent"
            style={{ animation: "kk-fadein .7s .35s both" }}
          >
            Made to order · {product.lead}
          </div>
          <p
            className="mb-[26px] text-[16.5px] leading-[1.7] text-ink/75"
            style={{ animation: "kk-fadein .7s .4s both" }}
          >
            {product.desc}
          </p>
          <div
            className="mb-8 grid gap-2.5"
            style={{ animation: "kk-fadein .7s .5s both" }}
          >
            {product.details.map((d) => (
              <div
                key={d}
                className="flex items-baseline gap-3 text-[15px] text-ink/75"
              >
                <span className="text-accent">✦</span>
                <span>{d}</span>
              </div>
            ))}
          </div>

          <AddToCart productId={product.id} />
        </div>
      </div>
    </section>
  );
}
