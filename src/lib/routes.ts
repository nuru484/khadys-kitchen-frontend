/**
 * Central route map. Pages that exist in the design but aren't built yet
 * resolve to "#" so links never 404 - swap them in when those pages land.
 */
export const routes = {
  home: "/",
  apply: "/apply",
  shop: "/shop",
  shopCart: "/shop/cart",
  shopCheckout: "/shop/checkout",
  shopTrack: "/shop/orders",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
} as const;

/** Detail route for a single shop product. */
export const shopProduct = (slug: string) => `/shop/${slug}`;

/** Public tracking page for a placed order. */
export const shopOrder = (code: string) => `/shop/orders/${code}`;
