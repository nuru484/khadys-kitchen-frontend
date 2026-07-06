import { z } from "zod";

/**
 * Guest checkout form. Mirrors the backend `placeOrderSchema`
 * (order-validation.ts) — items are sent from the cart, so only the contact +
 * fulfilment fields are validated here. Email stays lenient (optional) and is
 * enforced at submit time when paying online, matching the backend's
 * EMAIL_REQUIRED rule.
 */
export const checkoutSchema = z.object({
  fullName: z.string().trim().min(1, "Your name is required").max(150),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .max(255)
    .refine((v) => v === "" || /^\S+@\S+\.\S+$/.test(v), {
      message: "Enter a valid email",
    }),
  pickupDate: z.string(),
  note: z.string().trim().max(1000).optional(),
  payNow: z.boolean(),
  /** Honeypot — humans never see it; bots that fill it are rejected. */
  website: z.string().max(0, "Something went wrong").optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
