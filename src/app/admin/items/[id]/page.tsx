"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { PageActions } from "@/components/admin/page-actions";
import { useConfirm } from "@/components/admin/use-confirm";
import { ErrorState } from "@/components/ui/ErrorState";
import { RippleLoader } from "@/components/ui/Loader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { formatMoney } from "@/lib/format-money";
import { leadLabel } from "@/lib/shop-data";
import {
  useDeleteProductMutation,
  useGetProductByIdQuery,
} from "@/redux/products/products-api";

/** Item detail — read-only until "Edit" activates the form. */
export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const { data, isLoading, isError, error, refetch } =
    useGetProductByIdQuery(id);
  const [deleteProduct] = useDeleteProductMutation();
  const { confirm, dialog } = useConfirm();

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <RippleLoader />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <Link href="/admin/items" className="mt-3 inline-block font-semibold text-accent">
          ← All items
        </Link>
      </div>
    );
  }

  const product = data.data;

  const onDelete = async () => {
    try {
      await deleteProduct(id).unwrap();
      notify.success("Product deleted");
      router.push("/admin/items");
    } catch (err) {
      // The backend refuses deleting an item that's still on sale.
      notify.error("Couldn't delete", { description: extractApiError(err).message });
    }
  };

  const info: [string, string][] = [
    ["Category", product.category.charAt(0) + product.category.slice(1).toLowerCase()],
    ["Price", `${formatMoney(product.price, product.currency)} · ${product.unit}`],
    ["Lead time", leadLabel(product.leadTimeDays)],
    ["Stock", product.stock === null ? "Made to order" : `${String(product.stock)} left`],
    ["Position", String(product.position)],
  ];

  return (
    <div style={{ animation: "kk-rise .5s both" }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/items" className="text-[13.5px] font-semibold text-accent">
          ← All items
        </Link>
        <PageActions
          actions={[
            editing
              ? {
                  label: "Cancel editing",
                  primary: true,
                  onClick: () => setEditing(false),
                }
              : {
                  label: "Edit",
                  primary: true,
                  variant: "primary" as const,
                  onClick: () => setEditing(true),
                },
            {
              label: "Delete",
              variant: "danger" as const,
              onClick: () =>
                confirm({
                  title: "Delete this product?",
                  description:
                    "Past orders keep their own copy of the name and price. An item that's still on sale can't be deleted — take it off sale first.",
                  confirmText: "Delete product",
                  isDestructive: true,
                  onConfirm: onDelete,
                }),
            },
          ]}
        />
      </div>

      {editing ? (
        <ProductForm product={product} />
      ) : (
        <div className="grid items-start gap-[18px] lg:grid-cols-[320px_1fr]">
          <Card className="overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                width={640}
                height={480}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-oat text-[13px] text-ink/45">
                No photo yet
              </div>
            )}
          </Card>
          <Card className="p-[clamp(20px,3vw,28px)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-normal">
                {product.name}
              </h1>
              <StatusBadge
                status={product.isAvailable ? "PUBLISHED" : "UNPUBLISHED"}
                label={product.isAvailable ? "On sale" : "Off sale"}
              />
            </div>
            <div className="grid gap-2.5">
              {info.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-[14px]">
                  <span className="text-ink/55">{label}</span>
                  <span className="font-medium text-ink">{value}</span>
                </div>
              ))}
            </div>
            {product.description ? (
              <p className="mt-4 border-t border-ink/10 pt-4 text-[14px] leading-[1.6] text-ink/70">
                {product.description}
              </p>
            ) : null}
            <Link
              href={`/admin/orders?productId=${product.id}`}
              className="mt-4 inline-block border-t border-ink/10 pt-4 text-[13.5px] font-semibold text-accent no-underline hover:underline"
            >
              View orders for this item →
            </Link>
          </Card>
        </div>
      )}
      {dialog}
    </div>
  );
}
