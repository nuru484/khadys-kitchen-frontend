"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextField } from "@/components/ui/TextField";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useUpdateCustomerMutation } from "@/redux/customers/customers-api";
import type { ICustomer } from "@/types/customer.types";

/** Edit a customer's contact details and notes — used from the customer
 * detail page and the customers table's row menu. */
export function EditCustomerModal({
  customer,
  onClose,
}: {
  customer: ICustomer;
  onClose: () => void;
}) {
  const titleId = useId();
  const [fullName, setFullName] = useState(customer.fullName);
  const [email, setEmail] = useState(customer.email ?? "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [update, { isLoading }] = useUpdateCustomerMutation();

  const submit = async () => {
    if (!fullName.trim()) {
      notify.error("Enter the customer's name");
      return;
    }
    try {
      await update({
        id: customer.id,
        body: {
          fullName: fullName.trim(),
          email: email.trim() || null,
          notes: notes.trim() || null,
        },
      }).unwrap();
      notify.success("Customer updated");
      onClose();
    } catch (err) {
      notify.error("Couldn't save the changes", {
        description: extractApiError(err).message,
      });
    }
  };

  return (
    <Modal open onClose={onClose} labelledBy={titleId}>
      <h2 id={titleId} className="mb-4 font-serif text-[22px]">
        Edit customer
      </h2>
      <div className="grid gap-4">
        <TextField
          label="Name"
          placeholder="e.g. Ama Mensah"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <TextField
          label="Email (optional)"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="grid gap-[7px]">
          <span className="text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60">
            Notes
          </span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Preferences, allergies, how they like to be contacted…"
            className="w-full rounded-[12px] border-[1.5px] border-ink/20 bg-cream px-[15px] py-3 font-sans text-[15px] text-ink outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button isLoading={isLoading} loadingText="Saving…" onClick={submit}>
          Save changes
        </Button>
      </div>
    </Modal>
  );
}
