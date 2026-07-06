/**
 * Typed, fail-fast access to the public env vars. Importing this module
 * validates that the required `NEXT_PUBLIC_*` vars are present, so a
 * misconfigured deployment fails at load rather than silently issuing requests
 * to `undefined/api/v1`. Mirrors the backend's `ENV` pattern.
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
} as const;
