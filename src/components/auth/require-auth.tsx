"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { useGetMeQuery } from "@/redux/auth/auth-api";
import { useCurrentUser } from "@/hooks/use-current-user";

/**
 * Gates the admin console on a *validated* session — the real protection beyond
 * the proxy's cookie-presence check.
 *
 * The proxy blocks visitors with no `refreshToken` cookie, but it can't tell a
 * live session from a stale or tampered cookie. This guard calls `GET /auth/me`
 * (which flows through the api-slice's silent refresh on a 401): a valid session
 * resolves and renders the console; an invalid one is cleared and bounced to
 * `/login?from=…`. A persisted user renders optimistically while `/me`
 * revalidates in the background, so a genuine session never flashes a spinner.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const cachedUser = useCurrentUser();
  const { data, isError } = useGetMeQuery();

  useEffect(() => {
    if (isError) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isError, pathname, router]);

  // Once the check has failed, hold the loading screen while the redirect fires.
  // (getMe's onQueryStarted also clears the persisted user, so `cachedUser` is
  // null here — we never leak the console to an invalid session.)
  if (isError) return <AuthCheckScreen />;

  // Verified by /me, or optimistic from a persisted user while the check runs.
  if (data || cachedUser) return <>{children}</>;

  // First load with no persisted user: wait for /me before revealing anything.
  return <AuthCheckScreen />;
}

function AuthCheckScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream">
      <Spinner className="h-7 w-7" />
    </div>
  );
}
