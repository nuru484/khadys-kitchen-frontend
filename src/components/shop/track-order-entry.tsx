"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { shopOrder } from "@/lib/routes";

/** Code-entry form for the public tracking page. Codes look like KK-O7F3K9…;
 * we normalise case/whitespace and let the tracking page do the real lookup. */
export function TrackOrderEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (cleaned.length < 4) {
      setError("Enter the order code from your text or email — it starts with KK-O.");
      return;
    }
    router.push(shopOrder(cleaned));
  };

  return (
    <div style={{ animation: "kk-rise .6s both" }}>
      <p className="mb-3 text-[12.5px] font-semibold uppercase tracking-[0.22em] text-accent">
        Track your order
      </p>
      <h1 className="mb-3 text-balance font-serif text-[clamp(28px,4.5vw,44px)] font-normal leading-[1.12]">
        Where&rsquo;s my bake?
      </h1>
      <p className="mb-7 max-w-[52ch] text-[15.5px] leading-[1.7] text-ink/70">
        Enter the order code we texted you when you placed your order. You can
        check its status any time — and pay any outstanding balance online.
      </p>
      <form onSubmit={submit} noValidate className="flex flex-wrap items-start gap-3">
        <div className="min-w-[220px] flex-[1_1_260px]">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="e.g. KK-O7F3K9QW2M"
            aria-label="Order code"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-[14px] border-[1.5px] border-ink/20 bg-card px-[16px] py-[13px] font-sans text-[15.5px] uppercase tracking-[0.06em] text-ink outline-none transition-colors placeholder:normal-case placeholder:tracking-normal focus:border-accent"
          />
          {error ? (
            <p className="mt-2 text-[13px] font-semibold text-danger">{error}</p>
          ) : null}
        </div>
        <Button type="submit">Track order</Button>
      </form>
      <p className="mt-6 text-[13.5px] text-ink/55">
        Can&rsquo;t find your code? It was sent by SMS
        {" "}(and email, if you gave one) the moment you ordered — search for
        &ldquo;Khady&rsquo;s Kitchen&rdquo;.
      </p>
    </div>
  );
}
