"use client";

import { useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { useGetProductsQuery } from "@/redux/products/products-api";
import { useCreateOrderMutation } from "@/redux/orders/orders-api";

// Mirrors the backend walk-in order contract — items are priced/snapshotted
// server-side; here we only validate the customer + line selections.
const schema = z.object({
  fullName: z.string().trim().min(1, "Enter the customer's name").max(150),
  phone: z.string().trim().min(6, "Enter a valid phone").max(20),
  note: z.string().trim().max(1000).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Choose an item"),
        quantity: z.number().int().min(1, "Min 1").max(500, "Max 500"),
      }),
    )
    .min(1, "Add at least one item"),
});
type Values = z.infer<typeof schema>;

const EMPTY_LINE = { productId: "", quantity: 1 };
const DEFAULTS: Values = { fullName: "", phone: "", note: "", items: [EMPTY_LINE] };

/** Records a counter/phone order on a customer's behalf. Items come from the
 * live catalogue (available only); the backend prices and snapshots them. */
export function WalkInOrderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const titleId = useId();
  const { data } = useGetProductsQuery({ isAvailable: true, limit: 100 });
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Start each session fresh — reopening should never show a stale draft.
  useEffect(() => {
    if (!open) reset(DEFAULTS);
  }, [open, reset]);

  const products = data?.data ?? [];
  const priceOf = (id: string) => products.find((p) => p.id === id)?.price ?? 0;
  const watchedItems = useWatch({ control, name: "items" });
  const total = (watchedItems ?? []).reduce(
    (sum, l) => sum + priceOf(l?.productId ?? "") * (l?.quantity || 0),
    0,
  );

  const onSubmit = async (values: Values) => {
    try {
      const res = await createOrder({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        note: values.note?.trim() || undefined,
        items: values.items,
      }).unwrap();
      notify.success(`Order recorded — ${res.data.code}`);
      reset(DEFAULTS);
      onClose();
      router.push(`/admin/orders/${res.data.id}`);
    } catch (err) {
      notify.error("Couldn't record the order", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <h2 id={titleId} className="mb-4 font-serif text-[22px]">
        Record a walk-in order
      </h2>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Customer name"
            placeholder="e.g. Ama Mensah"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <TextField
            label="Phone"
            placeholder="+233 24 000 0000"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        <div className="grid gap-2.5">
          <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
            Items
          </span>
          {fields.map((field, i) => (
            <div key={field.id} className="grid gap-1.5">
              <div className="flex items-center gap-2">
                <Select
                  aria-label="Item"
                  aria-invalid={errors.items?.[i]?.productId ? true : undefined}
                  wrapperClassName="flex-1"
                  {...register(`items.${i}.productId`)}
                >
                  <option value="">Choose an item…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatMoney(p.price, p.currency)}
                    </option>
                  ))}
                </Select>
                <input
                  type="number"
                  min={1}
                  max={500}
                  placeholder="Qty"
                  aria-label="Quantity"
                  aria-invalid={errors.items?.[i]?.quantity ? true : undefined}
                  {...register(`items.${i}.quantity`, { valueAsNumber: true })}
                  className="w-[76px] rounded-[12px] border-[1.5px] border-ink/20 bg-cream px-3 py-[11px] text-center font-sans text-[15px] outline-none transition-colors focus:border-accent"
                />
                {fields.length > 1 ? (
                  <button
                    type="button"
                    aria-label="Remove line"
                    onClick={() => remove(i)}
                    className="text-[15px] font-semibold text-danger"
                  >
                    ✕
                  </button>
                ) : null}
              </div>
              <FieldError
                id={`${titleId}-item-${i}`}
                message={
                  errors.items?.[i]?.productId?.message ??
                  errors.items?.[i]?.quantity?.message
                }
              />
            </div>
          ))}
          <FieldError
            id={`${titleId}-items`}
            message={errors.items?.root?.message ?? errors.items?.message}
          />
          <button
            type="button"
            onClick={() => append(EMPTY_LINE)}
            className="justify-self-start text-[13.5px] font-semibold text-accent"
          >
            + Add another item
          </button>
        </div>

        <TextField
          label="Note (optional)"
          placeholder="Cake message, allergies, pickup time…"
          {...register("note")}
        />

        <div className="flex justify-between border-t border-ink/10 pt-3 text-[15px]">
          <span className="text-ink/55">Total</span>
          <span className="font-semibold">{formatMoney(total)}</span>
        </div>

        <div className="mt-1 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            loadingText="Recording…"
          >
            Record order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
