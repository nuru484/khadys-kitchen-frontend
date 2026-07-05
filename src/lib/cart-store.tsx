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

export interface CartItem {
  id: string;
  qty: number;
}

interface CartApi {
  items: CartItem[];
  count: number;
  /** False until localStorage has been read on the client. */
  hydrated: boolean;
  qtyOf: (id: string) => number;
  changeQty: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "kk-cart";

const CartContext = createContext<CartApi | null>(null);

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount and stay in sync across tabs.
  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Persist after hydration so we never clobber storage with the empty initial state.
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const changeQty = useCallback((id: string, delta: number) => {
    setItems((prev) => {
      const next = prev.map((x) => ({ ...x }));
      const found = next.find((x) => x.id === id);
      if (found) found.qty += delta;
      else if (delta > 0) next.push({ id, qty: delta });
      return next.filter((x) => x.qty > 0);
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const api = useMemo<CartApi>(() => {
    const count = items.reduce((sum, x) => sum + x.qty, 0);
    return {
      items,
      count,
      hydrated,
      qtyOf: (id) => items.find((x) => x.id === id)?.qty ?? 0,
      changeQty,
      remove,
      clear,
    };
  }, [items, hydrated, changeQty, remove, clear]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
