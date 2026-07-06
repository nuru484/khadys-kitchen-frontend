"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { IProduct } from "@/types/product.types";

/**
 * A cart line carries a display snapshot of the product (name/price/image…)
 * so the cart and checkout render instantly without refetching. Prices are
 * pesewas and display-only — the server reprices everything at checkout.
 */
export interface CartLine {
  id: string;
  slug: string;
  name: string;
  /** Minor units (pesewas) at the time it was added. */
  price: number;
  unit: string;
  image: string | null;
  leadTimeDays: number;
  qty: number;
}

interface CartApi {
  lines: CartLine[];
  count: number;
  /** Display subtotal in pesewas (server reprices at checkout). */
  subtotal: number;
  /** The longest lead time in the cart — earliest possible pickup. */
  maxLeadDays: number;
  /** False until localStorage has been read on the client. */
  hydrated: boolean;
  qtyOf: (id: string) => number;
  add: (product: IProduct, qty: number) => void;
  changeQty: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

// v2: lines carry a product snapshot (v1 stored bare {id, qty} against the
// static catalogue). A key bump silently retires stale v1 carts.
const STORAGE_KEY = "kk-cart-v2";

const CartContext = createContext<CartApi | null>(null);

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as CartLine).id === "string" &&
        typeof (l as CartLine).name === "string" &&
        typeof (l as CartLine).price === "number" &&
        typeof (l as CartLine).qty === "number" &&
        (l as CartLine).qty > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount and stay in sync across tabs.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional client-only hydration from localStorage
    setLines(readCart());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(readCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist after hydration so we never clobber storage with the empty initial state.
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((product: IProduct, qty: number) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.id === product.id
            ? {
                ...l,
                // Refresh the snapshot — the price/image may have changed.
                image: product.image,
                leadTimeDays: product.leadTimeDays,
                name: product.name,
                price: product.price,
                qty: l.qty + qty,
                slug: product.slug,
                unit: product.unit,
              }
            : l,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          image: product.image,
          leadTimeDays: product.leadTimeDays,
          name: product.name,
          price: product.price,
          qty,
          slug: product.slug,
          unit: product.unit,
        },
      ];
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const api = useMemo<CartApi>(() => {
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const maxLeadDays = lines.reduce((m, l) => Math.max(m, l.leadTimeDays), 0);
    return {
      lines,
      count,
      subtotal,
      maxLeadDays,
      hydrated,
      qtyOf: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
      add,
      changeQty,
      remove,
      clear,
    };
  }, [lines, hydrated, add, changeQty, remove, clear]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
