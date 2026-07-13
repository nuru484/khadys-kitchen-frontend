"use client";

import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useRecordPaymentMutation } from "@/redux/applications/applications-api";
import { useRecordOrderPaymentMutation } from "@/redux/orders/orders-api";
import type { IRecordPaymentInput } from "@/types/application.types";

const METHODS: IRecordPaymentInput["method"][] = [
  "CASH",
  "MOMO",
  "BANK_TRANSFER",
  "OTHER",
];

const schema = z.object({
  // Kept as a string (matching the raw input) and validated by refine, so the
  // field starts blank and empty/zero/NaN all surface the same friendly error.
  amount: z.string().refine((v) => Number(v) > 0, "Enter a valid amount"),
  method: z.enum(["CASH", "MOMO", "BANK_TRANSFER", "OTHER"]),
  note: z.string().trim().max(300).optional(),
});
type Values = z.infer<typeof schema>;

const BLANK: Values = { amount: "", method: "CASH", note: "" };

/** Which ledger the payment lands in — a bake-school application (pay-later
 * applicants) or a shop order (pay-later customers). */
export type PaymentOwner =
  | { kind: "application"; id: string }
  | { kind: "order"; id: string };

/** Admin modal to record an offline payment (cash / MoMo / bank) against an
 * application or a shop order. Amount entered in GHS. */
export function RecordPaymentModal({
  owner,
  open,
  onClose,
}: {
  owner: PaymentOwner;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const [recordApplication, applicationState] = useRecordPaymentMutation();
  const [recordOrder, orderState] = useRecordOrderPaymentMutation();
  const record = owner.kind === "application" ? recordApplication : recordOrder;
  const isLoading =
    owner.kind === "application"
      ? applicationState.isLoading
      : orderState.isLoading;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: BLANK,
  });

  // Clear the draft whenever the modal closes so it never reopens pre-filled.
  useEffect(() => {
    if (!open) reset(BLANK);
  }, [open, reset]);

  const onSubmit = async (values: Values) => {
    try {
      await record({
        id: owner.id,
        body: {
          amount: Math.round(Number(values.amount) * 100), // GHS → pesewas
          method: values.method,
          note: values.note?.trim() || undefined,
        },
      }).unwrap();
      notify.success("Payment recorded");
      reset(BLANK);
      onClose();
    } catch (err) {
      notify.error("Couldn't record payment", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <h2 id={titleId} className="mb-4 font-serif text-[22px]">
        Record a payment
      </h2>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="grid gap-4">
        <TextField
          label="Amount (GHS)"
          placeholder="e.g. 50.00"
          type="number"
          step="0.01"
          error={errors.amount?.message}
          {...register("amount")}
        />
        <div className="grid gap-[7px]">
          <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
            Method
          </span>
          <Select aria-label="Method" {...register("method")}>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        <TextField
          label="Note (optional)"
          placeholder="e.g. Deposit paid at the counter"
          {...register("note")}
        />
        <div className="mt-1 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} loadingText="Recording…">
            Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}
