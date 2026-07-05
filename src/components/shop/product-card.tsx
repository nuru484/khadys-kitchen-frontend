import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { shopProduct } from "@/lib/routes";
import { listPriceLabel, type Product } from "@/lib/shop-data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Reveal variant="zoom" className="flex">
      <Link
        href={shopProduct(product.id)}
        className="group flex w-full flex-col overflow-hidden rounded-[18px] border border-ink/10 bg-card no-underline transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent/55"
      >
        <div className="relative h-[240px] overflow-hidden">
          <Image
            src={product.img}
            alt={product.name}
            fill
            sizes="(max-width: 700px) 100vw, 33vw"
            className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(.16,.84,.28,1)] group-hover:scale-[1.06]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-cream">
            {product.catLabel}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-[9px] px-6 pb-[26px] pt-[22px]">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-serif text-[22px] font-normal">{product.name}</h3>
            <span className="whitespace-nowrap text-[15.5px] font-semibold text-accent">
              {listPriceLabel(product)}
            </span>
          </div>
          <p className="flex-1 text-[14.5px] leading-[1.6] text-ink/[0.68]">
            {product.shortDesc}
          </p>
          <span className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-ink">
            {product.lead} · Order →
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
