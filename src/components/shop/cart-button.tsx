"use client";

import Link from "next/link";
import { routes } from "@/lib/routes";
import { useCart } from "@/lib/cart-store";

export function CartButton() {
  const { count, hydrated } = useCart();

  return (
    <Link
      href={`${routes.shop}/cart`}
      className="flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-cream no-underline transition-colors hover:bg-accent"
    >
      Cart
      <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-accent px-1.5 text-[12.5px] text-[#FDFAF3]">
        {hydrated ? count : 0}
      </span>
    </Link>
  );
}
