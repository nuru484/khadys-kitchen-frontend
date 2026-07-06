import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = {
  title: "Admin console",
  // The admin area is private - keep it out of search indexes.
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // RequireAuth validates the session against GET /auth/me before the console
  // renders; the proxy's cookie gate is only the first, cheap line of defence.
  return (
    <RequireAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
