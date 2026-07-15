export interface AdminNavItem {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
  /** Hidden from STAFF — the backend 403s them on this surface. */
  adminOnly?: boolean;
}

/** A collapsible sidebar group holding related surfaces. */
export interface AdminNavGroup {
  label: string;
  children: AdminNavItem[];
  adminOnly?: boolean;
}

export type AdminNavEntry = AdminNavGroup | AdminNavItem;

export const isNavGroup = (entry: AdminNavEntry): entry is AdminNavGroup =>
  "children" in entry;

/**
 * Admin navigation, ordered by importance: the live Bake School surfaces
 * first (grouped under Trainings), then administration. The shop surfaces are
 * currently hidden (see below). Profile lives in the sidebar's account menu.
 */
export const ADMIN_NAV_ITEMS: AdminNavEntry[] = [
  { label: "Dashboard", href: "/admin", isActive: (p) => p === "/admin" },
  {
    label: "Trainings",
    children: [
      { label: "Classes", href: "/admin/classes", isActive: (p) => p.startsWith("/admin/classes") },
      { label: "Applications", href: "/admin/applications", isActive: (p) => p.startsWith("/admin/applications") },
      { label: "Students", href: "/admin/students", isActive: (p) => p.startsWith("/admin/students") },
    ],
  },
  // Shop surfaces (Orders, Customers, Shop items) are intentionally hidden from
  // the sidebar for now — the pages still exist and work when navigated to
  // directly, but the shop is not surfaced anywhere in the admin nav.
  { label: "Payments", href: "/admin/payments", isActive: (p) => p.startsWith("/admin/payments") },
  { label: "Gallery", href: "/admin/gallery", isActive: (p) => p.startsWith("/admin/gallery") },
  { label: "Website", href: "/admin/website", isActive: (p) => p.startsWith("/admin/website"), adminOnly: true },
  { label: "Team & roles", href: "/admin/team", isActive: (p) => p.startsWith("/admin/team"), adminOnly: true },
  {
    label: "Security & logs",
    children: [
      { label: "Audit log", href: "/admin/audit", isActive: (p) => p.startsWith("/admin/audit") },
      { label: "Security", href: "/admin/security", isActive: (p) => p.startsWith("/admin/security") },
    ],
  },
];

/** The entries a role may see: groups filter their children and disappear
 * entirely when nothing inside remains. */
export function navEntriesFor(isAdmin: boolean): AdminNavEntry[] {
  return ADMIN_NAV_ITEMS.flatMap((entry): AdminNavEntry[] => {
    if (!isNavGroup(entry)) {
      return !entry.adminOnly || isAdmin ? [entry] : [];
    }
    if (entry.adminOnly && !isAdmin) return [];
    const children = entry.children.filter((c) => !c.adminOnly || isAdmin);
    return children.length > 0 ? [{ ...entry, children }] : [];
  });
}

/** True when any leaf inside the entry matches the current route. */
export function entryIsActive(entry: AdminNavEntry, pathname: string): boolean {
  return isNavGroup(entry)
    ? entry.children.some((c) => c.isActive(pathname))
    : entry.isActive(pathname);
}

/**
 * Topbar breadcrumb + title for the current route. The dashboard title is a
 * fallback — AdminShell replaces it with a time-of-day greeting for the
 * signed-in user.
 */
export function routeMeta(pathname: string): { crumb: string; title: string } {
  if (pathname === "/admin") return { crumb: "Overview", title: "Dashboard" };

  if (pathname === "/admin/orders") return { crumb: "Operations", title: "All orders" };
  if (pathname.startsWith("/admin/orders/")) return { crumb: "Shop · Orders", title: "Order" };

  if (pathname === "/admin/customers") return { crumb: "Operations", title: "Customers" };
  if (pathname.startsWith("/admin/customers/")) return { crumb: "Operations · Customers", title: "Customer" };

  if (pathname === "/admin/applications") return { crumb: "Trainings", title: "Student applications" };
  if (pathname.startsWith("/admin/applications/")) return { crumb: "Trainings · Applications", title: "Application" };

  if (pathname === "/admin/classes") return { crumb: "Trainings", title: "Classes" };
  if (pathname.startsWith("/admin/classes/")) return { crumb: "Trainings · Classes", title: "Class" };

  if (pathname === "/admin/students") return { crumb: "Trainings", title: "Students" };
  if (pathname.startsWith("/admin/students/")) return { crumb: "Trainings · Students", title: "Student" };

  if (pathname === "/admin/items/new") return { crumb: "Shop · Items", title: "New item" };
  if (pathname.endsWith("/edit")) return { crumb: "Shop · Items", title: "Edit item" };
  if (pathname === "/admin/items") return { crumb: "Shop", title: "Shop items" };
  if (pathname.startsWith("/admin/items/")) return { crumb: "Shop · Items", title: "Item & orders" };

  if (pathname.startsWith("/admin/payments")) return { crumb: "Money", title: "Payments & payouts" };

  if (pathname.startsWith("/admin/gallery")) return { crumb: "Configuration", title: "Kitchen gallery" };

  if (pathname.startsWith("/admin/website")) return { crumb: "Configuration", title: "Website content" };

  if (pathname === "/admin/team") return { crumb: "Configuration", title: "Team & roles" };
  if (pathname.startsWith("/admin/team/")) return { crumb: "Configuration · Team", title: "Team member" };
  if (pathname.startsWith("/admin/audit")) return { crumb: "Security & logs", title: "Audit log" };

  if (pathname.startsWith("/admin/profile")) return { crumb: "Account", title: "Admin profile" };
  if (pathname.startsWith("/admin/security")) return { crumb: "Security & logs", title: "Security" };

  return { crumb: "Admin", title: "Admin console" };
}
