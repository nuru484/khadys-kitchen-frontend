"use client";

import { BackLink } from "@/components/admin/back-link";
import { DetailFormSkeleton } from "@/components/admin/detail-skeletons";
import { useParams, useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { useConfirm } from "@/components/admin/use-confirm";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import { useAuthRole } from "@/hooks/use-auth-role";
import {
  useDeleteProductMutation,
  useGetProductByIdQuery,
} from "@/redux/products/products-api";

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } =
    useGetProductByIdQuery(id);
  const [deleteProduct] = useDeleteProductMutation();
  const { isAdmin } = useAuthRole();
  const { confirm, dialog } = useConfirm();

  if (isLoading) {
    return (
      <div>
        <BackLink href="/admin/items">
          ← All items
        </BackLink>
        <DetailFormSkeleton cards={3} />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div style={{ animation: "kk-rise .5s both" }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
        <BackLink href="/admin/items" className="mb-0 mt-3">
          ← All items
        </BackLink>
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

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <BackLink href="/admin/items" className="mb-0">
          ← All items
        </BackLink>
        {isAdmin ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              confirm({
                title: "Delete this product?",
                description:
                  "Past orders keep their own copy of the name and price. An item that's still on sale can't be deleted — take it off sale first.",
                confirmText: "Delete product",
                isDestructive: true,
                onConfirm: onDelete,
              })
            }
          >
            Delete
          </Button>
        ) : null}
      </div>
      <ProductForm product={product} />
      {dialog}
    </div>
  );
}
