/**
 * Central site config - canonical URL, brand strings, and SEO defaults.
 *
 * The base URL comes from `NEXT_PUBLIC_BASE_URL` with a production fallback,
 * mirroring the dms-frontend convention (but centralised here instead of
 * redeclared per file). Trailing slash is stripped so `${siteUrl}/path` is safe.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://khadyskitchen.com"
).replace(/\/$/, "");

export const siteConfig = {
  name: "Khady's Kitchen",
  shortName: "Khady's Kitchen",
  /** Full home-page title (the layout template's `default`). */
  title: "Khady's Kitchen · Kumasi patisserie - the authentic taste",
  description:
    "Small-batch breads, laminated pastries, and celebration cakes - baked by hand every morning in Khady's open kitchen in Kumasi. Plus a hands-on Bake School.",
  locale: "en_GH",
  email: "hello@khadyskitchen.com",
  instagram: "https://instagram.com/khadyskitchen",
  instagramHandle: "@khadyskitchen",
  city: "Kumasi",
  country: "Ghana",
  /** Rose accent - used for theme-color and the OG image. */
  themeColor: "#C2185B",
  /** Cream page background. */
  backgroundColor: "#F6EFE4",
  ink: "#241A12",
  keywords: [
    "Khady's Kitchen",
    "Kumasi bakery",
    "Ghana bakery",
    "artisan bread Kumasi",
    "croissant Kumasi",
    "sourdough Ghana",
    "celebration cakes Kumasi",
    "custom cakes Ghana",
    "birthday cake Kumasi",
    "wedding cake Ghana",
    "baking classes Kumasi",
    "bake school Ghana",
    "bofrot",
    "meat pies Kumasi",
    "patisserie Kumasi",
  ],
} as const;
