"use client";

import { useState } from "react";
import { BackLink } from "@/components/admin/back-link";
import { useParams, useRouter } from "next/navigation";
import { Card, StatTile } from "@/components/admin/ui";
import { EditCustomerModal } from "@/components/admin/edit-customer-modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { Modal } from "@/components/ui/Modal";
import { PageActions } from "@/components/admin/page-actions";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { formatDate, formatDateTime, formatTime } from "@/lib/format-date";
import { useGetCustomerByIdQuery } from "@/redux/customers/customers-api";
import { useGetOrdersQuery } from "@/redux/orders/orders-api";
import type { ICustomer } from "@/types/customer.types";

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
        <BackLink href="/admin/customers" className="mb-0 mt-3">
          ← All customers
        </BackLink>
      </div>
    );
  }

  const orders = ordersData?.data ?? [];

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <BackLink href="/admin/customers">
        ← All customers
      </BackLink>

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

      {/* 1-up on phones, 2-up on tablets, 4-up from xl. */}
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Orders" value={String(customer.orderCount)} />
        <StatTile label="Total spent" value={formatMoney(customer.totalSpent)} />
        <StatTile
          label="Last order"
          value={formatDate(customer.lastOrderAt)}
          sub={customer.lastOrderAt ? formatTime(customer.lastOrderAt) : undefined}
        />
        <StatTile
          label="Customer since"
          value={formatDate(customer.createdAt)}
          sub={formatTime(customer.createdAt)}
        />
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
                      {formatDateTime(o.createdAt)}
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
