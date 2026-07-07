"use client";

import { PaymentVerifyClient } from "@/components/shared/payment-verify-client";
import { routes } from "@/lib/routes";
import { APPLY_CODE_KEY } from "./application-form";

/** Paystack return page for bake-school applications. */
export function VerifyClient() {
  return (
    <PaymentVerifyClient
      codeKey={APPLY_CODE_KEY}
      success={(code) => ({
        description: `Thank you! Your application${code ? ` ${code}` : ""} is paid. Khady’s team will be in touch on WhatsApp.`,
        action: { label: "Back to the bakery", href: routes.home },
      })}
      failure={(code, message) => ({
        description: `${message}${code ? ` Your application code is ${code}.` : ""}`,
        action: { label: "Back to apply", href: routes.apply },
      })}
    />
  );
}
