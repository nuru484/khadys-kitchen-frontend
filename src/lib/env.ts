/**
 * Typed, fail-fast access to the public env vars. Importing this module
 * validates that the required `NEXT_PUBLIC_*` vars are present, so a
 * misconfigured deployment fails at load rather than silently issuing requests
 * to `undefined/api/v1`.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  /** Base URL of the Khady's Kitchen API (e.g. http://localhost:4050). */
  SERVER_URI: required(
    "NEXT_PUBLIC_SERVER_URI",
    process.env.NEXT_PUBLIC_SERVER_URI,
  ),
  /** Canonical site origin, used for metadata/links. */
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "",
  /**
   * Cloudflare Turnstile site key for the public forms. Optional on purpose:
   * left unset in dev, the widget renders nothing and forms submit normally
   * (the backend also skips verification when its secret is unset). When set,
   * the widget challenges and the token is sent with each submission.
   */
  TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
} as const;

// Deliberate fail-open, but never a SILENT one: a production build without a
// Turnstile site key ships every public form bot-unprotected (the backend
// mirrors this when its secret is unset). Loud in the build/server logs so a
// forgotten env var is caught at deploy, not discovered via spam.
if (process.env.NODE_ENV === "production" && !env.TURNSTILE_SITE_KEY) {
  console.error(
    "[env] NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset - public forms will submit without bot protection.",
  );
}
