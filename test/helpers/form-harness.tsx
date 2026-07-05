import type { ReactNode } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";

/**
 * Wires a real react-hook-form + zodResolver around a presentational field or
 * form, so tests can drive validation without re-implementing the form each
 * time. Mirrors dms-frontend's `FormHarness`.
 *
 * The casts bridge zod v4 ↔ resolver/RHF generic variance; the runtime wiring
 * is exactly what the app uses.
 */
export function FormHarness<T extends FieldValues>({
  schema,
  defaultValues,
  render,
}: {
  schema: ZodType<T>;
  defaultValues: DefaultValues<T>;
  render: (form: UseFormReturn<T>) => ReactNode;
}) {
  const form = useForm<T>({
    resolver: zodResolver(schema as never) as Resolver<T>,
    defaultValues,
  });
  return <>{render(form)}</>;
}
