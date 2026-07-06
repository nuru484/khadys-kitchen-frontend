"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { AddToCart } from "@/components/shop/add-to-cart";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { routes } from "@/lib/routes";
import {
  FALLBACK_PRODUCT_IMG,
  leadLabel,
  listPriceLabel,
} from "@/lib/shop-data";
import { useGetPublicProductBySlugQuery } from "@/redux/products/products-api";

export function ProductDetail({ slug }: { slug: string }) {
  const { data, isLoading, isError, error, refetch } =
    useGetPublicProductBySlugQuery(slug);
  const product = data?.data;

  const back = (
    <Link
      href={routes.shop}
      className="mb-[clamp(24px,3vw,36px)] inline-block text-[14px] font-semibold uppercase tracking-[0.08em] text-ink/65 no-underline transition-colors hover:text-accent"
    >
      ← All bakes
    </Link>
  );

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1180px] px-[clamp(20px,5vw,48px)] py-[clamp(36px,5vw,64px)]">
        {back}
        <div className="grid min-h-[40vh] place-items-center">
          <RippleLoader />
        </div>
      </section>
    );
  }

  if (isError || !product) {
    // A 404 means the bake was retired or the link is stale — not an error.
    const notFound =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 404;
    return (
      <section className="mx-auto max-w-[1180px] px-[clamp(20px,5vw,48px)] py-[clamp(36px,5vw,64px)]">
        {back}
        {notFound ? (
          <EmptyState
            title="That bake isn't on the counter."
            description="It may have been retired or renamed - browse what's baking now."
            action={{ label: "Browse the bakes", href: routes.shop }}
          />
        ) : (
          <ErrorState error={error} onRetry={() => void refetch()} />
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1180px] px-[clamp(20px,5vw,48px)] py-[clamp(36px,5vw,64px)]">
      {back}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-[clamp(32px,5vw,64px)]">
        <Reveal
          variant="mask-img"
          className="relative block h-[clamp(360px,44vw,540px)] w-full overflow-hidden rounded-b-[20px] rounded-t-[min(220px,34vw)] border border-ink/15"
        >
          <Image
            src={product.image ?? FALLBACK_PRODUCT_IMG}
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
            Made to order · {leadLabel(product.leadTimeDays)}
          </div>
          {product.description ? (
            <p
              className="mb-[26px] text-[16.5px] leading-[1.7] text-ink/75"
              style={{ animation: "kk-fadein .7s .4s both" }}
            >
              {product.description}
            </p>
          ) : null}
          {product.stock !== null ? (
            <p
              className="mb-6 text-[14px] font-semibold text-ink/60"
              style={{ animation: "kk-fadein .7s .5s both" }}
            >
              {product.stock > 0
                ? `${product.stock} left at this price`
                : "Sold out for now - check back soon."}
            </p>
          ) : null}

          <AddToCart product={product} />
        </div>
      </div>
    </section>
  );
}
