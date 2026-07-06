import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { TitlePriceRow } from "@/components/ui/title-price-row";
import { shopProduct } from "@/lib/routes";
import {
  categoryLabel,
  FALLBACK_PRODUCT_IMG,
  leadLabel,
  listPriceLabel,
} from "@/lib/shop-data";
import type { IProduct } from "@/types/product.types";

export function ProductCard({ product }: { product: IProduct }) {
  return (
    <Reveal variant="zoom" className="flex">
      <Link
        href={shopProduct(product.slug)}
        className="group flex w-full flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-card no-underline transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/55"
      >
        <div className="relative h-[280px] overflow-hidden">
          <Image
            src={product.image ?? FALLBACK_PRODUCT_IMG}
            alt={product.name}
            fill
            sizes="(max-width: 700px) 100vw, 33vw"
            className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.16,.84,.28,1)] group-hover:scale-[1.06]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-cream">
            {categoryLabel(product.category)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-[9px] px-6 pb-[26px] pt-[22px]">
          <TitlePriceRow
            name={product.name}
            price={listPriceLabel(product)}
            nameClassName="font-serif text-[22px] font-normal line-clamp-2"
            priceClassName="text-[15.5px] font-semibold text-accent"
          />
          {/* Fixed two-line block so the card's height is set by the layout, not
              the copy: short blurbs still reserve the space, long ones truncate. */}
          <p className="line-clamp-2 min-h-[3.2em] text-[14.5px] leading-[1.6] text-ink/[0.68]">
            {product.description}
          </p>
          <span className="mt-auto pt-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
            {leadLabel(product.leadTimeDays)} · Order →
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
