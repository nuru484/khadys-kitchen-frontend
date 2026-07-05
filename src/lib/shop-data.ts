/**
 * Shop catalogue for Khady's Kitchen. Everything is made to order, so each
 * product carries a `leadDays` used to compute the earliest pickup date.
 * Mirrors the product data from the Shop design.
 */

export type Category = "bread" | "pastry" | "cake" | "doughnut";

export interface Product {
  id: string;
  name: string;
  price: number;
  cat: Category;
  catLabel: string;
  lead: string;
  leadDays: number;
  unit: string;
  shortDesc: string;
  desc: string;
  details: string[];
  img: string;
}

export const products: Product[] = [
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    price: 25,
    cat: "pastry",
    catLabel: "Pastry",
    lead: "ready next morning",
    leadDays: 1,
    unit: "Baked to order · each",
    shortDesc: "27 layers of cultured butter, laminated over two days.",
    desc: "Our signature croissant — 27 layers of cultured butter, laminated over two days and baked the morning of your pickup. Shatters on cue, tender inside.",
    details: [
      "Laminated fresh for your order",
      "Best eaten within 24 hours",
      "Contains gluten, dairy",
    ],
    img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "country-sourdough",
    name: "Country Sourdough",
    price: 60,
    cat: "bread",
    catLabel: "Bread",
    lead: "needs 2 days",
    leadDays: 2,
    unit: "Per loaf · ~900g",
    shortDesc: "48-hour cold ferment, stone-milled flour, a singing crust.",
    desc: "A 48-hour cold-fermented loaf made with stone-milled flour and our seven-year-old starter. Your loaf starts fermenting the moment you order.",
    details: [
      "48-hour cold ferment — ordered, then started",
      "Keeps 3–4 days wrapped in cloth",
      "Naturally leavened — no commercial yeast",
    ],
    img: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "celebration-cake",
    name: "Celebration Cake",
    price: 350,
    cat: "cake",
    catLabel: "Cake",
    lead: "needs 3 days",
    leadDays: 3,
    unit: "Made to order · from",
    shortDesc:
      "Khady's layer cakes for birthdays, weddings and everything between.",
    desc: "Khady's made-to-order layer cakes — moist sponge, silky buttercream, finished by hand. Tell us the occasion and we'll design around it.",
    details: [
      "Order at least 3 days ahead",
      "Feeds 12–15 (base size)",
      "Custom flavors, colors and toppers available",
    ],
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "pastry-box",
    name: "Morning Pastry Box",
    price: 120,
    cat: "pastry",
    catLabel: "Pastry",
    lead: "ready next morning",
    leadDays: 1,
    unit: "Box of 6 · assorted",
    shortDesc:
      "Six assorted pastries baked fresh for your pickup — baker's choice.",
    desc: "Six assorted pastries baked fresh the morning you collect — croissants, pains au chocolat and whatever Khady bakes best that day. Baker's choice, made for you.",
    details: [
      "Assortment varies by day",
      "Perfect for meetings and gifting",
      "Contains gluten, dairy, may contain nuts",
    ],
    img: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "bofrot",
    name: "Bofrot",
    price: 30,
    cat: "doughnut",
    catLabel: "Bofrot",
    lead: "ready next morning",
    leadDays: 1,
    unit: "Half dozen · warm",
    shortDesc: "Golden, pillowy and lightly spiced — fried for your pickup time.",
    desc: "Golden, pillowy Ghanaian doughnuts with a hint of nutmeg — fried to be warm at your pickup time, not before.",
    details: [
      "Fried fresh for your pickup slot",
      "Lightly spiced with nutmeg",
      "Half dozen per order",
    ],
    img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "cupcake-box",
    name: "Vanilla Cupcakes",
    price: 90,
    cat: "cake",
    catLabel: "Cake",
    lead: "needs 2 days",
    leadDays: 2,
    unit: "Box of 6",
    shortDesc: "Light vanilla sponge with silky buttercream swirls.",
    desc: "Light vanilla sponge topped with silky buttercream swirls — frosted the day you collect so they arrive perfect.",
    details: [
      "Box of 6",
      "Buttercream made with real vanilla",
      "Custom colors on request",
    ],
    img: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&q=80&auto=format&fit=crop",
  },
];

export const categoryFilters: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "All bakes" },
  { id: "bread", label: "Breads" },
  { id: "pastry", label: "Pastries" },
  { id: "cake", label: "Cakes" },
  { id: "doughnut", label: "Bofrot" },
];

export type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export const waitOptions: string[] = [
  "As soon as it's ready",
  "Within 2–3 days",
  "Within a week",
  "Flexible — bake it when it's best",
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const formatPrice = (n: number) => `GHS ${n.toLocaleString()}`;

/** "from GHS 350" for the celebration cake, plain price otherwise. */
export const listPriceLabel = (p: Product) =>
  (p.id === "celebration-cake" ? "from " : "") + formatPrice(p.price);

/** "GHS 350 (base)" for the celebration cake in the cart, plain otherwise. */
export const cartPriceLabel = (p: Product) =>
  formatPrice(p.price) + (p.id === "celebration-cake" ? " (base)" : "");
