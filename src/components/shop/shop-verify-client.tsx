"use client";

import { PaymentVerifyClient } from "@/components/shared/payment-verify-client";
import { routes, shopOrder } from "@/lib/routes";
import { useCart } from "@/lib/cart-store";
import { ORDER_CODE_KEY } from "./checkout-form";

/** Paystack return page for shop orders. */
export function ShopVerifyClient() {
  const { clear } = useCart();

  const orderAction = (code: string) =>
    code
      ? { label: "View your order", href: shopOrder(code) }
      : { label: "Back to the shop", href: routes.shop };

  return (
    <PaymentVerifyClient
      codeKey={ORDER_CODE_KEY}
      onConfirmed={clear}
      success={(code) => ({
        description: `Thank you! Your order${code ? ` ${code}` : ""} is paid. We'll text you when it's ready for pickup.`,
        action: orderAction(code),
      })}
      failure={(code, message) => ({
        description: `${message}${code ? ` Your order code is ${code}.` : ""}`,
        action: orderAction(code),
      })}
    />
  );
}
