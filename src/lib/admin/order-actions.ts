import type { OrderStatus } from "@/types/order.types";

/**
 * The order lifecycle transitions per status, shared by the detail page's
 * action cluster and the table's per-row menu so the two can never drift.
 * Mirrors the backend's NEXT_STATUSES table.
 */
export type OrderAction = "confirm" | "ready" | "collect" | "cancel";

export const ORDER_ACTIONS: Record<
  OrderStatus,
  { action: OrderAction; label: string; variant: "primary" | "outline" | "danger" }[]
> = {
  PENDING: [
    { action: "confirm", label: "Confirm", variant: "primary" },
    { action: "ready", label: "Mark ready", variant: "outline" },
    { action: "cancel", label: "Cancel order", variant: "danger" },
  ],
  CONFIRMED: [
    { action: "ready", label: "Mark ready", variant: "primary" },
    { action: "collect", label: "Mark collected", variant: "outline" },
    { action: "cancel", label: "Cancel order", variant: "danger" },
  ],
  READY: [
    { action: "collect", label: "Mark collected", variant: "primary" },
    { action: "cancel", label: "Cancel order", variant: "danger" },
  ],
  COLLECTED: [],
  CANCELLED: [],
};

/**
 * The transitions the current user may take. Cancelling returns stock and is
 * admin-and-above on the backend, so staff never see it.
 */
export const orderActionsFor = (
  status: OrderStatus,
  isAdmin: boolean,
): (typeof ORDER_ACTIONS)[OrderStatus] =>
  isAdmin
    ? ORDER_ACTIONS[status]
    : ORDER_ACTIONS[status].filter((a) => a.action !== "cancel");

export const ORDER_CONFIRM_COPY: Record<
  OrderAction,
  { title: string; description: string }
> = {
  confirm: {
    title: "Confirm this order?",
    description: "This accepts the order — baking starts on schedule.",
  },
  ready: {
    title: "Mark this order ready?",
    description: "The customer is notified their order is ready for pickup.",
  },
  collect: {
    title: "Mark this order collected?",
    description:
      "This settles the order. Any outstanding balance must be recorded first.",
  },
  cancel: {
    title: "Cancel this order?",
    description:
      "Reserved stock returns to the shelf and the customer is notified. Paid amounts should be refunded from the order's payments.",
  },
};
