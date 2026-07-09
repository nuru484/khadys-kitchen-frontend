/**
 * Central site config - canonical URL, brand strings, and SEO defaults.
 *
 * The base URL comes from `NEXT_PUBLIC_BASE_URL` with a production fallback,
 * mirroring the dms-frontend convention (but centralised here instead of
 * redeclared per file). Trailing slash is stripped so `${siteUrl}/path` is safe.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_BASE_URL || 'https://khadyskitchen.com'
).replace(/\/$/, '');

export const siteConfig = {
  name: "Khady's Kitchen",
  shortName: "Khady's Kitchen",
  /** Full home-page title (the layout template's `default`). */
  title: "Khady's Kitchen · Kumasi patisserie & bake school",
  description:
    "Small-batch breads, pastries and celebration cakes, baked daily in Khady's Kumasi kitchen. Plus a hands-on Bake School.",
  locale: 'en_GH',
  email: 'hello@khadyskitchen.com',
  socials: {
    instagram:
      'https://www.instagram.com/khadys_kitchen?igsh=MXFkOHBpczNvajR1dA==',
    facebook: 'https://www.facebook.com/share/1D656H7Qxv/',
    tiktok: 'https://www.tiktok.com/@khadyskitchen?_r=1&_t=ZS-97t2TzV0oVx',
  },
  instagramHandle: '@khadyskitchen',
  city: 'Kumasi',
  country: 'Ghana',
  /** Rose accent - used for theme-color and the OG image. */
  themeColor: '#C2185B',
  /** Cream page background. */
  backgroundColor: '#F6EFE4',
  ink: '#241A12',
  keywords: [
    "Khady's Kitchen",
    'Kumasi bakery',
    'Ghana bakery',
    'artisan bread Kumasi',
    'croissant Kumasi',
    'sourdough Ghana',
    'celebration cakes Kumasi',
    'custom cakes Ghana',
    'birthday cake Kumasi',
    'wedding cake Ghana',
    'baking classes Kumasi',
    'bake school Ghana',
    'bofrot',
    'meat pies Kumasi',
    'patisserie Kumasi',
  ],
} as const;
