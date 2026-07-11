import { z } from "zod";

/**
 * Admin create/edit training form. Mirrors the backend create schema. Money is
 * entered in GHS and converted to pesewas on submit; the bullet lists (what
 * you'll learn, what to bring, what's included, who it's for) drive the public
 * class page.
 */
export const FEE_KINDS = [
  "REGISTRATION",
  "HOSTEL",
  "UNIFORM",
  "INGREDIENTS",
  "CERTIFICATE",
  "OTHER",
] as const;

/**
 * How a fee item is charged. Maps to the backend's `required` + `choiceGroup`
 * pair on submit:
 * - ALWAYS       → required, standalone (every applicant pays it)
 * - OPTIONAL     → an add-on the applicant may tick when applying
 * - COURSE_CHOICE → one of the class's mutually exclusive course-fee options —
 *   the applicant picks exactly one; the amounts are never summed.
 */
export const CHARGE_TYPES = ["ALWAYS", "OPTIONAL", "COURSE_CHOICE"] as const;
export type ChargeType = (typeof CHARGE_TYPES)[number];

export const CHARGE_TYPE_LABELS: Record<ChargeType, string> = {
  ALWAYS: "Always charged",
  OPTIONAL: "Optional add-on — applicant may add it",
  COURSE_CHOICE: "Course fee option — applicant picks one",
};

/** The single choice group the admin console manages. */
export const COURSE_FEE_GROUP = "course-fee";

const feeItemSchema = z.object({
  name: z.string().trim().min(1, "Required").max(150),
  // GHS (major units, via valueAsNumber); converted to pesewas on submit.
  amount: z.number({ message: "Enter a number" }).min(0, "Must be 0 or more").max(1_000_000),
  kind: z.enum(FEE_KINDS),
  charge: z.enum(CHARGE_TYPES),
  note: z.string().trim().max(300).optional(),
  suffix: z.string().trim().max(60).optional(),
  priceLabel: z.string().trim().max(60).optional(),
});

// Modeled as objects so react-hook-form's useFieldArray has stable ids.
const bulletList = z.array(
  z.object({ value: z.string().trim().min(1, "Required").max(300) }),
);

export const trainingSchema = z.object({
  name: z.string().trim().min(1, "A training name is required").max(150),
  summary: z.string().trim().min(1, "A summary is required").max(2000),
  learnOutcomes: bulletList,
  whatToBring: bulletList,
  included: bulletList,
  forWho: bulletList,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  schedule: z.string().trim().max(200).optional(),
  duration: z.string().trim().max(100).optional(),
  mode: z.string().trim().max(150).optional(),
  hasCertificate: z.boolean(),
  // Kept as a string in the form (no coerce, so form input === output types);
  // parsed + validated on submit / by the backend.
  capacity: z.string().optional(),
  applicationsOpen: z.boolean(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  feeItems: z.array(feeItemSchema),
});

export type TrainingFormValues = z.infer<typeof trainingSchema>;
