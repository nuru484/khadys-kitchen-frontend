/**
 * Static content for the Khady's Kitchen site (landing + Bake School application).
 * Mirrors the copy from the designs so the pages stay data-driven rather than
 * hard-coding rows in the markup.
 */
import { shopProduct } from "@/lib/routes";

export interface Bake {
  name: string;
  price: string;
  href: string;
  desc: string;
  img: string;
}

/** "This morning's bakes" cards on the landing page. */
export const bakes: Bake[] = [
  {
    name: "Butter Croissant",
    price: "GHS 25",
    href: shopProduct("butter-croissant"),
    desc: "27 layers of cultured butter, laminated over two days. Shatters on cue.",
    img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Country Sourdough",
    price: "GHS 60",
    href: shopProduct("country-sourdough"),
    desc: "48-hour cold ferment, stone-milled flour, a crust that sings when it cools.",
    img: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=900&q=80&auto=format&fit=crop",
  },
  {
    name: "Celebration Cake",
    price: "from GHS 350",
    href: shopProduct("celebration-cake"),
    desc: "Khady's signature layer cakes - made to order for birthdays and weddings.",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80&auto=format&fit=crop",
  },
];

/** Rotating word marquee under the hero. */
export const marqueeItems: string[] = [
  "SOURDOUGH",
  "CROISSANTS",
  "MEAT PIES",
  "CELEBRATION CAKES",
  "BOFROT",
  "BAGUETTES",
];

export interface Fee {
  num: string;
  name: string;
  note?: string;
  price: string;
  suffix?: string;
}

export interface Tool {
  name: string;
  price: string;
}

export const fees: Fee[] = [
  { num: "1", name: "Registration and school fees", price: "GHS 2,000" },
  {
    num: "2",
    name: "Hostel fee",
    note: "Optional. Indicate early - the hostel can take only 12 students.",
    price: "GHS 700",
    suffix: "for 2 months",
  },
  {
    num: "3",
    name: "School uniform",
    note: "2 T-shirts + branded apron.",
    price: "GHS 250",
  },
  {
    num: "4",
    name: "95% of ingredients provided",
    note: "We bake and do practicals every week - and after every practical, you take your cake home.",
    price: "GHS 2,900",
    suffix: "each",
  },
  {
    num: "5",
    name: "95% of tools provided",
    note: "Note: the tools belong to the school.",
    price: "Free",
  },
  {
    num: "6",
    name: "Your 5% of ingredients",
    note: "Margarine, your cake box, cake board and icing sugar. All remaining ingredients are provided.",
    price: "-",
  },
  {
    num: "7",
    name: "Your 5% of tools",
    note: "Hand mixer, extension board, napkin and tissue.",
    price: "-",
  },
];

export const tools: Tool[] = [
  { name: "Extension board", price: "bring your own" },
  { name: "Hand mixer", price: "≈ GHS 250" },
  { name: "Margarine", price: "≈ GHS 240" },
  { name: "Cake board", price: "bring your own" },
  { name: "Cake box", price: "bring your own" },
  { name: "Icing sugar (box)", price: "≈ GHS 360" },
];

export const prospectus: string[] = [
  "Uniform · GHS 250",
  "Recipe book · GHS 50",
  "Storage bowl",
  "Washing powder · 5 kg",
  "Dettol · 1 big",
  "Power Zone · 1 litre (liquid)",
  "Long broom / mop stick · 1",
  "Soap (Geisha/Sunlight) · 2",
  "Napkins · 2",
  "Toilet roll · 1 pack",
];
