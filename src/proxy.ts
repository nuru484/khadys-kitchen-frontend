import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Proxy (formerly Middleware) - the server-side gate for the admin
 * console. It runs before the route renders, so an unauthenticated visitor is
 * redirected to /login and the admin bundle is never sent to their browser.
 *
 * The check is presence-only: the backend sets the httpOnly `refreshToken`
 * cookie (7-day session anchor) which we can read here but not forge. A present
 * cookie lets the request through; the real session validation then happens
 * client-side in `RequireAuth`, which calls `GET /auth/me` before the console
 * renders. A stale or tampered cookie passes this cheap gate but fails that
 * check (and every data call), where the reauth flow logs the user out.
 */
const SESSION_COOKIE = "refreshToken";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Guard the admin console.
  if (pathname.startsWith("/admin") && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Signed-in users have no business on the login screen.
  if (pathname === "/login" && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
