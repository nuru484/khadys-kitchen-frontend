"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { useCart } from "@/lib/cart-store";

export function AddToCart({ productId }: { productId: string }) {
  const { changeQty, qtyOf } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const alreadyInCart = qtyOf(productId) > 0;

  const add = () => {
    changeQty(productId, qty);
    setQty(1);
    setJustAdded(true);
  };

  return (
    <div style={{ animation: "kk-fadein .7s .6s both" }}>
      <div className="flex flex-wrap items-center gap-4 border-t border-ink/15 pt-[26px]">
        <div className="flex items-center overflow-hidden rounded-full border-[1.5px] border-ink/25">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-12 w-12 cursor-pointer border-none bg-transparent text-[20px] text-ink transition-colors hover:bg-ink/[0.07]"
          >
            −
          </button>
          <span className="min-w-[40px] text-center text-[17px] font-semibold">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="h-12 w-12 cursor-pointer border-none bg-transparent text-[20px] text-ink transition-colors hover:bg-ink/[0.07]"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={add}
          className="min-h-12 flex-[1_1_auto] cursor-pointer rounded-full border-none bg-accent px-8 py-4 font-sans text-[15px] font-semibold tracking-[0.06em] text-[#FDFAF3] transition-colors hover:bg-ink"
        >
          {alreadyInCart ? "Add more to order" : "Add to order"}
        </button>
      </div>

      {justAdded ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[12px] border border-[#2E6B3F]/25 bg-[#2E6B3F]/10 px-4 py-3 text-[14.5px] text-[#2E6B3F]">
          <span>Added to your order ✓</span>
          <Link
            href={`${routes.shop}/cart`}
            className="font-semibold text-[#2E6B3F] underline"
          >
            Review order →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
