export interface AdminNavItem {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
}

/**
 * Flat admin navigation, ordered by importance: the live Bake School surfaces
 * first, then the shop, then account/administration.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", isActive: (p) => p === "/admin" },
  { label: "Applications", href: "/admin/applications", isActive: (p) => p.startsWith("/admin/applications") },
  { label: "Classes", href: "/admin/classes", isActive: (p) => p.startsWith("/admin/classes") },
  { label: "Orders", href: "/admin/orders", isActive: (p) => p.startsWith("/admin/orders") },
  { label: "Customers", href: "/admin/customers", isActive: (p) => p.startsWith("/admin/customers") },
  { label: "Shop items", href: "/admin/items", isActive: (p) => p.startsWith("/admin/items") },
  { label: "Payments", href: "/admin/payments", isActive: (p) => p.startsWith("/admin/payments") },
  { label: "Team & roles", href: "/admin/team", isActive: (p) => p.startsWith("/admin/team") },
  { label: "Audit log", href: "/admin/audit", isActive: (p) => p.startsWith("/admin/audit") },
  { label: "Profile", href: "/admin/profile", isActive: (p) => p.startsWith("/admin/profile") },
  { label: "Security", href: "/admin/security", isActive: (p) => p.startsWith("/admin/security") },
];

/** Topbar breadcrumb + title for the current route. */
export function routeMeta(pathname: string): { crumb: string; title: string } {
  if (pathname === "/admin") return { crumb: "Overview", title: "Good morning, Khady" };

  if (pathname === "/admin/orders") return { crumb: "Operations", title: "All orders" };
  if (pathname.startsWith("/admin/orders/")) return { crumb: "Shop · Orders", title: "Order" };

  if (pathname === "/admin/customers") return { crumb: "Operations", title: "Customers" };
  if (pathname.startsWith("/admin/customers/")) return { crumb: "Operations · Customers", title: "Customer" };

  if (pathname === "/admin/applications") return { crumb: "Bake School", title: "Student applications" };
  if (pathname.startsWith("/admin/applications/")) return { crumb: "Bake School · Applications", title: "Application" };

  if (pathname === "/admin/classes") return { crumb: "Bake School", title: "Classes & cohorts" };
  if (pathname.startsWith("/admin/classes/")) return { crumb: "Bake School · Classes", title: "Cohort" };

  if (pathname === "/admin/items/new") return { crumb: "Shop · Items", title: "New item" };
  if (pathname.endsWith("/edit")) return { crumb: "Shop · Items", title: "Edit item" };
  if (pathname === "/admin/items") return { crumb: "Shop", title: "Shop items" };
  if (pathname.startsWith("/admin/items/")) return { crumb: "Shop · Items", title: "Item & orders" };

  if (pathname.startsWith("/admin/payments")) return { crumb: "Money", title: "Payments & payouts" };

  if (pathname.startsWith("/admin/team")) return { crumb: "Configuration", title: "Team & roles" };
  if (pathname.startsWith("/admin/audit")) return { crumb: "Configuration", title: "Audit log" };

  if (pathname.startsWith("/admin/profile")) return { crumb: "Account", title: "Admin profile" };
  if (pathname.startsWith("/admin/security")) return { crumb: "Account", title: "Security" };

  return { crumb: "Admin", title: "Admin console" };
}
