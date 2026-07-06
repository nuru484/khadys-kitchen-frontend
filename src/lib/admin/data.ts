/**
 * Mock data + helpers for the admin console. This is UI-only demo data - it will
 * be replaced by real API calls when the backend is wired up. Shapes are kept
 * close to what a backend would return so the swap is mechanical.
 */

export type AppStatus = "New" | "Approved" | "Waitlist" | "Rejected";
export type OrderStatus = "Pending" | "Confirmed" | "Ready" | "Collected";
export type ItemCategory = "Bread" | "Pastry" | "Cake" | "Bofrot" | "Savoury";

export interface Application {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  hostel: boolean;
  date: string;
  status: AppStatus;
  message: string;
}

export interface AdminItem {
  id: string;
  name: string;
  unit: string;
  cat: ItemCategory;
  price: number;
  lead: string;
  desc: string;
  img: string;
}

export interface Order {
  id: string; // e.g. "#1041"
  itemId: string;
  customer: string;
  phone: string;
  email: string;
  qty: number;
  needBy: string;
  placed: string;
  wait: string;
  status: OrderStatus;
  note: string;
}

export interface CohortMember {
  name: string;
  location: string;
  note: string;
}

export interface Cohort {
  id: string;
  name: string;
  numeral: string;
  dates: string;
  status: "Graduated" | "Enrolling";
  desc: string;
  admittedCount: number | null;
  applicantsCount: number | null;
  admitted: CohortMember[] | null;
  applicants: [] | null;
}

// ── Pill palettes ───────────────────────────────────────────────
// Colors live in the shared `getStatusColor` map so the site, admin, and the
// StatusBadge component all agree. These thin wrappers keep the typed call sites.
import { getStatusColor, type StatusColor } from "@/lib/status-colors";

export type Pill = StatusColor;

export const appStatusPill = (status: AppStatus): Pill => getStatusColor(status);
export const orderPill = (status: OrderStatus): Pill => getStatusColor(status);

// ── Formatting helpers ──────────────────────────────────────────
export const fmt = (n: number) => `GHS ${n.toLocaleString()}`;

export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

// ── Seed data ───────────────────────────────────────────────────
export const applications: Application[] = [
  { id: "a1", name: "Akosua Mensah", phone: "+233 24 111 2233", email: "akosua.m@gmail.com", location: "Kumasi · Bantama", hostel: true, date: "28 Jun", status: "New", message: "I sell bread part-time at Bantama market and want to add cakes and pastries. I can attend every weekday and I would need a hostel place since I close late." },
  { id: "a2", name: "Kofi Owusu", phone: "+233 20 445 8890", email: "kofiowusu@yahoo.com", location: "Accra · Madina", hostel: true, date: "25 Jun", status: "Approved", message: "Coming from Accra for the full programme - I plan to open a small bakery in Madina after the course. Hostel place needed for the two months." },
  { id: "a3", name: "Ama Serwaa", phone: "+233 55 902 1144", email: "ama.serwaa@gmail.com", location: "Kumasi · Asokwa", hostel: false, date: "22 Jun", status: "Approved", message: "I bake at home for friends and church events. I want to learn proper lamination and cake decoration so I can start taking paid orders." },
  { id: "a4", name: "Yaw Darko", phone: "+233 24 778 3321", email: "yawdarko1@gmail.com", location: "Sunyani", hostel: true, date: "20 Jun", status: "Waitlist", message: "Recently finished SHS and I want a trade. My aunt recommended Khady's - I am hardworking and ready to start immediately if a hostel spot opens." },
  { id: "a5", name: "Efua Baah", phone: "+233 26 334 7788", email: "efua.baah@outlook.com", location: "Kumasi · Tafo", hostel: false, date: "18 Jun", status: "New", message: "I run a small chop bar and want to add meat pies and bofrot to the menu. Mostly interested in the savoury and frying practicals." },
  { id: "a6", name: "Kwame Boateng", phone: "+233 54 210 9987", email: "kboateng@gmail.com", location: "Obuasi", hostel: true, date: "15 Jun", status: "Rejected", message: "I would like to join the class but I can only attend on weekends due to my mining shift schedule." },
  { id: "a7", name: "Adjoa Nyarko", phone: "+233 24 667 5510", email: "adjoa.nyarko@gmail.com", location: "Kumasi · Ahodwo", hostel: false, date: "12 Jun", status: "Approved", message: "I have baked for two years self-taught. I want the CTVET certificate so I can apply for a bakery job at a hotel." },
  { id: "a8", name: "Abena Frimpong", phone: "+233 50 118 2244", email: "abenafrim@gmail.com", location: "Techiman", hostel: true, date: "10 Jun", status: "New", message: "My mother sells tea bread in Techiman and we want to grow the business together. I will need the hostel for the full two months." },
];

export const adminItems: AdminItem[] = [
  { id: "butter-croissant", name: "Butter Croissant", unit: "Each", cat: "Pastry", price: 25, lead: "Ready next morning", desc: "27 layers of cultured butter, laminated over two days and baked the morning of pickup.", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80&auto=format&fit=crop" },
  { id: "country-sourdough", name: "Country Sourdough", unit: "Loaf · ~900g", cat: "Bread", price: 60, lead: "Needs 2 days", desc: "48-hour cold-fermented loaf with stone-milled flour and the seven-year starter.", img: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80&auto=format&fit=crop" },
  { id: "celebration-cake", name: "Celebration Cake", unit: "From · feeds 12-15", cat: "Cake", price: 350, lead: "Needs 3 days", desc: "Made-to-order layer cakes - sponge, buttercream and finish designed around the occasion.", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&auto=format&fit=crop" },
  { id: "pastry-box", name: "Morning Pastry Box", unit: "Box of 6", cat: "Pastry", price: 120, lead: "Ready next morning", desc: "Six assorted pastries baked fresh for the pickup morning - baker's choice.", img: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80&auto=format&fit=crop" },
  { id: "bofrot", name: "Bofrot", unit: "Half dozen", cat: "Bofrot", price: 30, lead: "Ready next morning", desc: "Golden Ghanaian doughnuts with nutmeg, fried to be warm at pickup time.", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80&auto=format&fit=crop" },
  { id: "chocolate-fudge-cake", name: "Chocolate Fudge Cake", unit: "8-inch", cat: "Cake", price: 280, lead: "Needs 3 days", desc: "Three dark layers under silky fudge ganache - made entirely to order.", img: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80&auto=format&fit=crop" },
  { id: "cupcake-box", name: "Vanilla Cupcakes", unit: "Box of 6", cat: "Cake", price: 90, lead: "Needs 2 days", desc: "Light vanilla sponge, silky buttercream - frosted the day of collection.", img: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&q=80&auto=format&fit=crop" },
  { id: "meat-pies", name: "Meat Pies", unit: "Box of 4", cat: "Savoury", price: 48, lead: "Ready next morning", desc: "Flaky hand-crimped pies with spiced minced-beef filling, baked for the pickup slot.", img: "https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=600&q=80&auto=format&fit=crop" },
];

export const orders: Order[] = [
  { id: "#1041", itemId: "celebration-cake", customer: "Gifty Appiah", phone: "+233 24 555 0192", email: "gifty.appiah@gmail.com", qty: 1, needBy: "12 Jul", placed: "03 Jul", wait: "As soon as it's ready", status: "Confirmed", note: "Birthday cake for her daughter - asked for pink and gold, 'Maame Efua turns 8' on top." },
  { id: "#1040", itemId: "butter-croissant", customer: "Daniel Tetteh", phone: "+233 20 118 4471", email: "d.tetteh@yahoo.com", qty: 6, needBy: "07 Jul", placed: "04 Jul", wait: "Within 2-3 days", status: "Pending", note: "Office breakfast - will collect at 7:30 am sharp." },
  { id: "#1039", itemId: "chocolate-fudge-cake", customer: "Naana Osei", phone: "+233 55 660 2318", email: "naanaosei@gmail.com", qty: 1, needBy: "10 Jul", placed: "02 Jul", wait: "Flexible - bake it when it's best", status: "Confirmed", note: "" },
  { id: "#1038", itemId: "pastry-box", customer: "Selorm Agbeko", phone: "+233 26 909 5540", email: "selorm.a@outlook.com", qty: 2, needBy: "06 Jul", placed: "04 Jul", wait: "As soon as it's ready", status: "Ready", note: "Client meeting - no nuts please." },
  { id: "#1037", itemId: "celebration-cake", customer: "Mariam Alhassan", phone: "+233 54 313 8802", email: "mariam.alh@gmail.com", qty: 1, needBy: "18 Jul", placed: "01 Jul", wait: "Within a week", status: "Pending", note: "Wedding anniversary - wants to discuss flavours on WhatsApp first." },
  { id: "#1036", itemId: "bofrot", customer: "Kojo Antwi", phone: "+233 24 771 6653", email: "kojoantwi55@gmail.com", qty: 3, needBy: "06 Jul", placed: "05 Jul", wait: "As soon as it's ready", status: "Ready", note: "" },
  { id: "#1035", itemId: "country-sourdough", customer: "Esi Quartey", phone: "+233 50 442 1937", email: "esi.quartey@gmail.com", qty: 2, needBy: "08 Jul", placed: "03 Jul", wait: "Within 2-3 days", status: "Confirmed", note: "One loaf sliced, one whole." },
  { id: "#1034", itemId: "cupcake-box", customer: "Linda Adjei", phone: "+233 27 205 8814", email: "linda.adjei@gmail.com", qty: 2, needBy: "09 Jul", placed: "02 Jul", wait: "Within a week", status: "Pending", note: "Baby shower - pastel colours if possible." },
  { id: "#1033", itemId: "meat-pies", customer: "Fred Amankwah", phone: "+233 24 660 7345", email: "framankwah@gmail.com", qty: 4, needBy: "07 Jul", placed: "04 Jul", wait: "As soon as it's ready", status: "Confirmed", note: "" },
  { id: "#1032", itemId: "butter-croissant", customer: "Awo Danso", phone: "+233 55 921 4460", email: "awo.danso@gmail.com", qty: 12, needBy: "11 Jul", placed: "28 Jun", wait: "Within a week", status: "Collected", note: "Collected and paid - MoMo." },
];

export const cohorts: Cohort[] = [
  { id: "c1", name: "Cohort One", numeral: "I", dates: "Jan - Feb 2026", status: "Graduated", desc: "The founding class - 14 bakers, all CTVET certified.", admittedCount: 14, applicantsCount: 21, admitted: [
    { name: "Abena Owusu", location: "Kumasi · Suame", note: "Certificate issued · now sells at Suame market" },
    { name: "Yaa Pokua", location: "Kumasi · Oforikrom", note: "Certificate issued · opened home bakery" },
    { name: "Kwabena Asare", location: "Ejisu", note: "Certificate issued" },
    { name: "Akua Boakye", location: "Kumasi · Santasi", note: "Certificate issued · hotel pastry role" },
  ], applicants: [] },
  { id: "c2", name: "Cohort Two", numeral: "II", dates: "Apr - May 2026", status: "Graduated", desc: "12 bakers graduated; three now supply the shop's bofrot.", admittedCount: 12, applicantsCount: 19, admitted: [
    { name: "Esi Mensima", location: "Kumasi · Tafo", note: "Certificate issued" },
    { name: "Kofi Adjei", location: "Konongo", note: "Certificate issued · supplies bofrot" },
    { name: "Afia Serwah", location: "Kumasi · Bantama", note: "Certificate issued" },
  ], applicants: [] },
  { id: "c3", name: "Cohort Three", numeral: "III", dates: "Jul - Aug 2026", status: "Enrolling", desc: "Current intake - applications open, 12 hostel places.", admittedCount: null, applicantsCount: null, admitted: null, applicants: null },
];

export interface ActivityEvent {
  dot: string;
  text: string;
  time: string;
  href: string;
}

export const activity: ActivityEvent[] = [
  { dot: "#C2185B", text: "New order #1036 - Kojo Antwi, 3× Bofrot for 06 Jul", time: "18 min ago", href: "/admin/orders/1036" },
  { dot: "#2E6B3F", text: "Order #1038 marked Ready - Selorm Agbeko, Morning Pastry Box", time: "1 h ago", href: "/admin/orders/1038" },
  { dot: "#C2185B", text: "New application - Akosua Mensah (Kumasi · Bantama, hostel)", time: "3 h ago", href: "/admin/applications/a1" },
  { dot: "#8A5F14", text: "Order #1040 awaiting confirmation - 6× Butter Croissant", time: "5 h ago", href: "/admin/orders/1040" },
  { dot: "rgba(36,26,18,0.4)", text: "Order #1032 collected & paid - Awo Danso, MoMo", time: "Yesterday", href: "/admin/orders/1032" },
  { dot: "#2E6B3F", text: "Kofi Owusu approved for the July intake (hostel place held)", time: "Yesterday", href: "/admin/applications/a2" },
];

export interface Chat {
  initials: string;
  name: string;
  snippet: string;
  time: string;
  unread: boolean;
}

export const chats: Chat[] = [
  { initials: "GA", name: "Gifty Appiah", snippet: "Perfect - pink and gold it is. Can you write “Maame Efua turns 8”?", time: "09:42", unread: true },
  { initials: "MA", name: "Mariam Alhassan", snippet: "Which flavours do you recommend for an anniversary cake?", time: "08:15", unread: true },
  { initials: "DT", name: "Daniel Tetteh", snippet: "I'll be there 7:30 sharp. Thank you!", time: "Yesterday", unread: false },
  { initials: "LA", name: "Linda Adjei", snippet: "Pastel colours confirmed - see you on the 9th", time: "Yesterday", unread: false },
  { initials: "EQ", name: "Esi Quartey", snippet: "One sliced, one whole please.", time: "Thu", unread: false },
];

export const weekTotal = "GHS 6,560";
export const weekSales: { day: string; value: number }[] = [
  { day: "Mon", value: 720 },
  { day: "Tue", value: 540 },
  { day: "Wed", value: 980 },
  { day: "Thu", value: 860 },
  { day: "Fri", value: 1240 },
  { day: "Sat", value: 1580 },
  { day: "Sun", value: 640 },
];

export const bestSellers: { name: string; value: number }[] = [
  { name: "Celebration Cake", value: 700 },
  { name: "Butter Croissant", value: 450 },
  { name: "Chocolate Fudge Cake", value: 280 },
  { name: "Morning Pastry Box", value: 240 },
  { name: "Country Sourdough", value: 120 },
];

export const ITEM_CATEGORIES: ItemCategory[] = [
  "Bread",
  "Pastry",
  "Cake",
  "Bofrot",
  "Savoury",
];

export const LEAD_TIMES = [
  "Ready next morning",
  "Needs 2 days",
  "Needs 3 days",
  "Needs 5 days",
];

export const FALLBACK_ITEM_IMG =
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80&auto=format&fit=crop";

// ── Payments ────────────────────────────────────────────────────
export type PaymentMethod = "Paystack" | "MoMo";

/** Paid orders and their method; anything absent collects at pickup (Unpaid). */
export const orderPayments: Record<string, PaymentMethod> = {
  "#1041": "Paystack",
  "#1039": "MoMo",
  "#1036": "MoMo",
  "#1035": "Paystack",
  "#1033": "MoMo",
  "#1032": "MoMo",
};

export const isOrderPaid = (orderId: string): boolean => orderId in orderPayments;
export const orderMethod = (orderId: string): PaymentMethod | null =>
  orderPayments[orderId] ?? null;

const priceOf = (itemId: string): number =>
  adminItems.find((it) => it.id === itemId)?.price ?? 0;

/** Order total in GHS (unit price × quantity). */
export const orderTotal = (order: Order): number => priceOf(order.itemId) * order.qty;

/** The order has been handed over (design shows "Delivered" vs "In queue"). */
export const isDelivered = (order: Order): boolean => order.status === "Collected";

export const paymentPill = (paid: boolean): Pill =>
  getStatusColor(paid ? "Paid" : "Unpaid");

// ── Customers (derived from the orders ledger) ──────────────────
export interface Customer {
  name: string;
  phone: string;
  email: string;
  slug: string;
  initials: string;
  orderIds: string[];
  orderCount: number;
  totalSpend: number;
  unpaidCount: number;
}

export const customerSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function deriveCustomers(): Customer[] {
  const byName = new Map<string, Customer>();
  for (const o of orders) {
    const total = orderTotal(o);
    const unpaid = isOrderPaid(o.id) ? 0 : 1;
    const existing = byName.get(o.customer);
    if (existing) {
      existing.orderIds.push(o.id);
      existing.orderCount += 1;
      existing.totalSpend += total;
      existing.unpaidCount += unpaid;
    } else {
      byName.set(o.customer, {
        name: o.customer,
        phone: o.phone,
        email: o.email,
        slug: customerSlug(o.customer),
        initials: initials(o.customer),
        orderIds: [o.id],
        orderCount: 1,
        totalSpend: total,
        unpaidCount: unpaid,
      });
    }
  }
  // Highest spenders first (stable, so ties keep ledger order).
  return [...byName.values()].sort((a, b) => b.totalSpend - a.totalSpend);
}

export const customers: Customer[] = deriveCustomers();
export const getCustomer = (slug: string): Customer | undefined =>
  customers.find((c) => c.slug === slug);

