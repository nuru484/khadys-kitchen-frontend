"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, StatTile } from "@/components/admin/ui";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { PageActions } from "@/components/admin/page-actions";
import { TextField } from "@/components/ui/TextField";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDate } from "@/lib/format-date";
import {
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
} from "@/redux/customers/customers-api";
import { useGetOrdersQuery } from "@/redux/orders/orders-api";
import type { ICustomer } from "@/types/customer.types";

function EditCustomerModal({
  customer,
  onClose,
}: {
  customer: ICustomer;
  onClose: () => void;
}) {
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
    <Modal open onClose={onClose}>
      <h2 className="mb-4 font-serif text-[22px]">Edit customer</h2>
      <div className="grid gap-4">
        <TextField
          label="Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <TextField
          label="Email (optional)"
          type="email"
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
      <div className="mt-5 flex justify-end gap-3">
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

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } =
    useGetCustomerByIdQuery(id);
  const { data: ordersData } = useGetOrdersQuery({ customerId: id, limit: 50 });
  const [editing, setEditing] = useState(false);

  const customer = data?.data;

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }
  if (isError || !customer) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <Link href="/admin/customers" className="mt-3 inline-block font-semibold text-accent">
          ← All customers
        </Link>
      </div>
    );
  }

  const orders = ordersData?.data ?? [];

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <Link href="/admin/customers" className="mb-4 inline-block text-[13.5px] font-semibold text-accent">
        ← All customers
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(26px,3.4vw,36px)] font-normal">
            {customer.fullName}
          </h1>
          <div className="mt-1 text-[13.5px] text-ink/55">
            {customer.phone}
            {customer.email ? ` · ${customer.email}` : ""}
          </div>
        </div>
        <PageActions
          actions={[
            {
              label: "Edit details",
              primary: true,
              onClick: () => setEditing(true),
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[18px]">
        <StatTile label="Orders" value={String(customer.orderCount)} />
        <StatTile label="Total spent" value={formatMoney(customer.totalSpent)} />
        <StatTile label="Last order" value={formatDate(customer.lastOrderAt)} />
        <StatTile label="Customer since" value={formatDate(customer.createdAt)} />
      </div>

      {customer.notes ? (
        <Card className="mt-[18px] p-[clamp(20px,3vw,28px)]">
          <h2 className="mb-2 font-serif text-[19px]">Notes</h2>
          <p className="text-[14.5px] leading-[1.6] text-ink/70">{customer.notes}</p>
        </Card>
      ) : null}

      <Card className="mt-[18px] overflow-hidden">
        <div className="border-b border-ink/10 px-6 py-4">
          <h2 className="font-serif text-[19px]">Orders</h2>
        </div>
        {orders.length === 0 ? (
          <p className="px-6 py-5 text-[14px] text-ink/50">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-ink/10 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink/50">
                  <th className="px-6 py-3.5 font-semibold">Code</th>
                  <th className="px-4 py-3.5 font-semibold">Total</th>
                  <th className="px-4 py-3.5 font-semibold">Payment</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Placed</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => router.push(`/admin/orders/${o.id}`)}
                    className="cursor-pointer border-b border-ink/[0.08] transition-colors last:border-0 hover:bg-accent/[0.05]"
                  >
                    <td className="px-6 py-3.5 text-[14px] font-semibold">{o.code}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[14px] font-medium">
                      {formatMoney(o.total, o.currency)}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-[13.5px] text-ink/70">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right text-ink/40">→</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing ? (
        <EditCustomerModal customer={customer} onClose={() => setEditing(false)} />
      ) : null}
    </div>
  );
}
