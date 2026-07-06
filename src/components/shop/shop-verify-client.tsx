"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { RippleLoader } from "@/components/ui/Loader";
import { useVerifyPaymentMutation } from "@/redux/applications/applications-api";
import { extractApiError } from "@/lib/extract-api-error";
import { routes, shopOrder } from "@/lib/routes";
import { useCart } from "@/lib/cart-store";
import { ORDER_CODE_KEY } from "./checkout-form";

type State = "verifying" | "success" | "failed";

/** Paystack return page for shop orders — mirrors the bake school's
 * verify-client; POST /payments/verify is shared across both ledgers. */
export function ShopVerifyClient() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const [verify] = useVerifyPaymentMutation();
  const { clear } = useCart();
  // Seed from the reference so the "no reference" case needs no effect-setState.
  const [state, setState] = useState<State>(reference ? "verifying" : "failed");
  const [message, setMessage] = useState(
    reference ? "" : "No payment reference was found in the link.",
  );
  // Read the stashed code once at mount (client-only; guarded for SSR).
  const [code] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (sessionStorage.getItem(ORDER_CODE_KEY) ?? ""),
  );
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !reference) return;
    ran.current = true;

    verify({ reference })
      .unwrap()
      .then((res) => {
        if (res.data.status === "SUCCESS") {
          setState("success");
          clear();
          sessionStorage.removeItem(ORDER_CODE_KEY);
        } else {
          setState("failed");
          setMessage("This payment hasn’t been confirmed yet.");
        }
      })
      .catch((err) => {
        setState("failed");
        setMessage(extractApiError(err).message);
      });
  }, [reference, verify, clear]);

  if (state === "verifying") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <RippleLoader />
        <p className="text-[15px] text-ink/55">Confirming your payment…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <EmptyState
        title="Payment confirmed"
        description={`Thank you! Your order${code ? ` ${code}` : ""} is paid. We'll text you when it's ready for pickup.`}
        action={
          code
            ? { label: "View your order", href: shopOrder(code) }
            : { label: "Back to the shop", href: routes.shop }
        }
        className="w-full max-w-[520px]"
      />
    );
  }

  return (
    <EmptyState
      title="We couldn’t confirm this payment"
      description={`${message || "Please try again, or contact us and we’ll sort it out."}${code ? ` Your order code is ${code}.` : ""}`}
      action={
        code
          ? { label: "View your order", href: shopOrder(code) }
          : { label: "Back to the shop", href: routes.shop }
      }
      className="w-full max-w-[520px]"
    />
  );
}
