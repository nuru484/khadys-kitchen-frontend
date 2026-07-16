// src/app/api/revalidate/route.ts
import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { ALL_CACHE_TAGS } from "@/lib/cache-tags";

const SECRET_HEADER = "x-revalidate-secret";

/** Upper bound well above the whole tag vocabulary — rejects abusive payloads. */
const MAX_TAGS_PER_REQUEST = 20;

/**
 * Constant-time secret comparison. Both values are hashed first so the compare
 * is over fixed-length digests — this avoids leaking the secret length and
 * never throws on a length mismatch. Fails closed when the secret is not
 * configured, so an unset env var can never leave the endpoint open.
 */
function isAuthorized(request: Request): boolean {
  const configured = process.env.REVALIDATE_SECRET;
  if (!configured) return false;
  const provided = request.headers.get(SECRET_HEADER);
  if (!provided) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(configured).digest();
  return timingSafeEqual(a, b);
}

/**
 * On-demand cache invalidation, called by the backend after a successful
 * content write so changes go live immediately instead of waiting out the
 * scheduled ISR window (see src/lib/cache-tags.ts for the contract).
 *
 * Tags the caller sends that this app doesn't cache are reported as `skipped`,
 * not errors. Purging never makes a page dynamic; each affected page rebuilds
 * once on its next request.
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { revalidated: [], skipped: [], error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    tags?: unknown;
  } | null;
  const tags = body?.tags;

  if (
    !Array.isArray(tags) ||
    tags.length === 0 ||
    tags.length > MAX_TAGS_PER_REQUEST ||
    !tags.every((tag): tag is string => typeof tag === "string")
  ) {
    return NextResponse.json(
      {
        revalidated: [],
        skipped: [],
        error: "Body must be { tags: string[] } with 1-20 entries",
      },
      { status: 400 },
    );
  }

  const revalidated: string[] = [];
  const skipped: string[] = [];
  for (const tag of new Set(tags)) {
    if (ALL_CACHE_TAGS.has(tag)) {
      // Next 16 requires a cache profile; "max" fully purges the tag.
      revalidateTag(tag, "max");
      revalidated.push(tag);
    } else {
      skipped.push(tag);
    }
  }

  return NextResponse.json({ revalidated, skipped });
}
