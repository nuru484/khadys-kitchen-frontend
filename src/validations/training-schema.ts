import { z } from "zod";

/**
 * Admin create/edit training form. Mirrors the backend create schema. Money is
 * entered in GHS and converted to pesewas on submit; the list arrays (fee items,
 * requirements, stats, highlights) drive the public class page.
 */
export const FEE_KINDS = [
  "REGISTRATION",
  "HOSTEL",
  "UNIFORM",
  "INGREDIENTS",
  "CERTIFICATE",
  "OTHER",
] as const;

export const TRAINING_STATUSES = [
  "DRAFT",
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
] as const;

const feeItemSchema = z.object({
  name: z.string().trim().min(1, "Required").max(150),
  // GHS (major units, via valueAsNumber); converted to pesewas on submit.
  amount: z.number({ message: "Enter a number" }).min(0, "Must be 0 or more").max(1_000_000),
  kind: z.enum(FEE_KINDS),
  required: z.boolean(),
  note: z.string().trim().max(300).optional(),
  suffix: z.string().trim().max(60).optional(),
  priceLabel: z.string().trim().max(60).optional(),
});

const requirementSchema = z.object({
  name: z.string().trim().min(1, "Required").max(200),
  note: z.string().trim().max(200).optional(),
});

const statSchema = z.object({
  value: z.string().trim().min(1, "Required").max(40),
  label: z.string().trim().min(1, "Required").max(60),
});

// Kept as strings in the form (no coerce, so form input === output types);
// parsed + validated on submit / by the backend.
const optionalCount = z.string().optional();

export const trainingSchema = z.object({
  name: z.string().trim().min(1, "A cohort name is required").max(150),
  numeral: z.string().trim().max(20).optional(),
  description: z.string().trim().min(1, "A description is required").max(5000),
  coverImage: z
    .union([z.literal(""), z.string().url("Enter a valid image URL")])
    .optional(),
  status: z.enum(TRAINING_STATUSES),
  applicationsOpen: z.boolean(),
  isPublished: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  capacity: optionalCount,
  hostelCapacity: optionalCount,
  tagline: z.string().trim().max(200).optional(),
  heroHeading: z.string().trim().max(200).optional(),
  heroSubtext: z.string().trim().max(1000).optional(),
  costsIntro: z.string().trim().max(1000).optional(),
  costsNote: z.string().trim().max(1000).optional(),
  bringIntro: z.string().trim().max(1000).optional(),
  feeItems: z.array(feeItemSchema),
  requirements: z.array(requirementSchema),
  stats: z.array(statSchema).max(4, "At most 4 hero stats"),
  // Modeled as objects so react-hook-form's useFieldArray has stable ids.
  highlights: z.array(z.object({ value: z.string().trim().min(1).max(300) })),
});

export type TrainingFormValues = z.infer<typeof trainingSchema>;
