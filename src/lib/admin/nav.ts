export interface AdminNavItem {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
}

export interface AdminNavGroup {
  heading: string;
  items: AdminNavItem[];
}

/**
 * Grouped admin navigation (matches the "Admin - Dashboard" design). Every item
 * links to a built route.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    heading: "Operations",
    items: [
      { label: "Dashboard", href: "/admin", isActive: (p) => p === "/admin" },
      { label: "Orders", href: "/admin/orders", isActive: (p) => p.startsWith("/admin/orders") },
      { label: "Customers", href: "/admin/customers", isActive: (p) => p.startsWith("/admin/customers") },
    ],
  },
  {
    heading: "Bake School",
    items: [
      { label: "Applications", href: "/admin/applications", isActive: (p) => p.startsWith("/admin/applications") },
      { label: "Classes", href: "/admin/classes", isActive: (p) => p.startsWith("/admin/classes") },
      { label: "Schedule", href: "/admin/schedule", isActive: (p) => p.startsWith("/admin/schedule") },
      { label: "Certificates", href: "/admin/certificates", isActive: (p) => p.startsWith("/admin/certificates") },
    ],
  },
  {
    heading: "Shop",
    items: [
      { label: "Shop items", href: "/admin/items", isActive: (p) => p.startsWith("/admin/items") },
    ],
  },
  {
    heading: "Money",
    items: [
      { label: "Payments", href: "/admin/payments", isActive: (p) => p.startsWith("/admin/payments") },
      { label: "Reports", href: "/admin/reports", isActive: (p) => p.startsWith("/admin/reports") },
    ],
  },
  {
    heading: "Admin",
    items: [
      { label: "Site content", href: "/admin/content", isActive: (p) => p.startsWith("/admin/content") },
      { label: "Team & roles", href: "/admin/team", isActive: (p) => p.startsWith("/admin/team") },
      { label: "Audit log", href: "/admin/audit", isActive: (p) => p.startsWith("/admin/audit") },
      { label: "Profile", href: "/admin/profile", isActive: (p) => p.startsWith("/admin/profile") },
      { label: "Security", href: "/admin/security", isActive: (p) => p.startsWith("/admin/security") },
      { label: "System settings", href: "/admin/system", isActive: (p) => p.startsWith("/admin/system") },
    ],
  },
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

  if (pathname.startsWith("/admin/schedule")) return { crumb: "Bake School", title: "Weekly schedule" };
  if (pathname.startsWith("/admin/certificates")) return { crumb: "Bake School", title: "Certificates" };

  if (pathname === "/admin/items/new") return { crumb: "Shop · Items", title: "New item" };
  if (pathname.endsWith("/edit")) return { crumb: "Shop · Items", title: "Edit item" };
  if (pathname === "/admin/items") return { crumb: "Shop", title: "Shop items" };
  if (pathname.startsWith("/admin/items/")) return { crumb: "Shop · Items", title: "Item & orders" };

  if (pathname.startsWith("/admin/payments")) return { crumb: "Money", title: "Payments & payouts" };
  if (pathname.startsWith("/admin/reports")) return { crumb: "Money", title: "Reports & analytics" };

  if (pathname.startsWith("/admin/content")) return { crumb: "Configuration", title: "Site content" };
  if (pathname.startsWith("/admin/team")) return { crumb: "Configuration", title: "Team & roles" };
  if (pathname.startsWith("/admin/audit")) return { crumb: "Configuration", title: "Audit log" };

  if (pathname.startsWith("/admin/profile")) return { crumb: "Account", title: "Admin profile" };
  if (pathname.startsWith("/admin/security")) return { crumb: "Account", title: "Security" };
  if (pathname.startsWith("/admin/system")) return { crumb: "Configuration", title: "System settings" };

  return { crumb: "Admin", title: "Admin console" };
}
