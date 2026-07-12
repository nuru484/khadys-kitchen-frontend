import { z } from "zod";

/**
 * Bake School application form. Mirrors the backend `applySchema`: name +
 * phone required, `selectedFeeItemIds` carries the fee picks, and payment is
 * part of applying — `payMode` chooses between the full bill and a part
 * payment (`partAmount`, GHS). Amount bounds and the email requirement depend
 * on the applicant's live fee total, so the form validates those at submit;
 * this schema owns shape and formats.
 */
const REQUIRED_MESSAGE =
  "Please add your full name and a phone number we can reach you on.";

export const applicationSchema = z.object({
  name: z.string().trim().min(1, REQUIRED_MESSAGE),
  phone: z.string().trim().min(1, REQUIRED_MESSAGE),
  email: z
    .union([z.literal(""), z.string().email("Please enter a valid email.")])
    .optional(),
  location: z.string().trim().optional(),
  selectedFeeItemIds: z.array(z.string()),
  message: z.string().trim().optional(),
  /** full = the whole bill now; part = any amount now, balance later. */
  payMode: z.enum(["full", "part"]),
  /** GHS (major units) — only read when payMode is "part". */
  partAmount: z.string().trim().optional(),
});

export type ApplicationValues = z.infer<typeof applicationSchema>;
