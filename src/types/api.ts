/**
 * Central cache-tag registry for the RTK Query slice. Every query declares the
 * tags it `providesTags`; every mutation declares the tags it `invalidatesTags`.
 * Keeping the names here (as a `const` tuple) means tags can't drift and the tag
 * union is inferred by `createApi`.
 *
 * Auth carries no tags (session state lives in the auth slice + `resetApiState`);
 * the resource tags below are ready for the admin feature slices when the
 * backend endpoints land.
 */
export const apiSliceTags = [
  "User",
  "Users",
  "Item",
  "Items",
  "Order",
  "Orders",
  "Application",
  "Applications",
  "Product",
  "Products",
  "DashboardStats",
] as const;

export type ApiTag = (typeof apiSliceTags)[number];
