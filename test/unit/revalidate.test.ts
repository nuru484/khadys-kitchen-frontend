// The on-demand cache-invalidation seam: /api/revalidate only purges known
// cache tags, requires the shared secret the backend sends, and reports
// unknown tags as skipped (the backend broadcasts one tag list; each frontend
// purges what it recognises).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag }));

import { POST } from "@/app/api/revalidate/route";
import { CACHE_TAGS } from "@/lib/cache-tags";

const SECRET = "test-revalidate-secret";

const post = (body: unknown, secret?: string) =>
  POST(
    new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-revalidate-secret": secret } : {}),
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    revalidateTag.mockClear();
    vi.stubEnv("REVALIDATE_SECRET", SECRET);
  });
  afterEach(() => vi.unstubAllEnvs());

  it("purges known tags and reports unknown ones as skipped", async () => {
    const res = await post(
      { tags: [CACHE_TAGS.GALLERY, "not-a-real-tag"] },
      SECRET,
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      revalidated: [CACHE_TAGS.GALLERY],
      skipped: ["not-a-real-tag"],
    });
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith(
      CACHE_TAGS.GALLERY,
      "max",
    );
  });

  it("rejects a missing or wrong secret without touching the cache", async () => {
    expect((await post({ tags: [CACHE_TAGS.PRODUCTS] })).status).toBe(401);
    expect(
      (await post({ tags: [CACHE_TAGS.PRODUCTS] }, "wrong")).status,
    ).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("fails closed when the secret is not configured", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");
    const res = await post({ tags: [CACHE_TAGS.PRODUCTS] }, "");
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("refuses malformed bodies without touching the cache", async () => {
    expect((await post("{not json", SECRET)).status).toBe(400);
    expect((await post({ tags: "products" }, SECRET)).status).toBe(400);
    expect((await post({ tags: [] }, SECRET)).status).toBe(400);
    expect((await post({ tags: [42] }, SECRET)).status).toBe(400);
    expect(
      (await post({ tags: Array<string>(21).fill("products") }, SECRET))
        .status,
    ).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("deduplicates repeated tags into one purge", async () => {
    const res = await post(
      { tags: [CACHE_TAGS.ABOUT, CACHE_TAGS.ABOUT] },
      SECRET,
    );
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledTimes(1);
  });
});
