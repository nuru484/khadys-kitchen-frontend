"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/admin/ui";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { notify } from "@/lib/notify";
import { extractApiError } from "@/lib/extract-api-error";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/redux/products/products-api";
import type { IProduct, IProductInput } from "@/types/product.types";
import { PRODUCT_CATEGORIES } from "@/types/product.types";
import {
  productSchema,
  type ProductFormValues,
} from "@/validations/product-schema";

/** Form values → the backend `createProductSchema` payload (GHS → pesewas). */
function toPayload(v: ProductFormValues): IProductInput {
  return {
    name: v.name,
    category: v.category,
    description: v.description?.trim() || undefined,
    price: Math.round(Number(v.price) * 100),
    unit: v.unit,
    leadTimeDays: v.leadTimeDays === "" ? 0 : Number(v.leadTimeDays),
    isAvailable: v.isAvailable,
    isFeatured: v.isFeatured,
    stock: v.stock === "" ? null : Number(v.stock),
    position: v.position === "" ? 0 : Number(v.position),
  };
}

function toForm(p: IProduct): ProductFormValues {
  return {
    name: p.name,
    category: p.category,
    description: p.description ?? "",
    price: String(p.price / 100),
    unit: p.unit,
    leadTimeDays: String(p.leadTimeDays),
    isAvailable: p.isAvailable,
    isFeatured: p.isFeatured,
    stock: p.stock === null ? "" : String(p.stock),
    position: String(p.position),
  };
}

const EMPTY: ProductFormValues = {
  name: "",
  category: "BREAD",
  description: "",
  price: "",
  unit: "Each",
  leadTimeDays: "0",
  isAvailable: true,
  isFeatured: false,
  stock: "",
  position: "0",
};

const labelClass =
  "text-[12.5px] font-semibold uppercase tracking-[0.06em] text-ink/60";

/** Create/edit form for a shop product. Price entered in GHS; empty stock
 * means made to order. A chosen photo is only staged locally — it travels with
 * the save as multipart, and the backend uploads it (cleaning up on failure),
 * so cancelling never leaves an orphaned image in Cloudinary. */
export function ProductForm({ product }: { product?: IProduct }) {
  const router = useRouter();
  const editing = Boolean(product);
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? toForm(product) : EMPTY,
  });

  // The photo is only STAGED here; it uploads on submit, so cancelling never
  // orphans an image. `cleared` removes the existing photo.
  const [photo, setPhoto] = useState<{ cleared: boolean; file: File | null }>({
    cleared: false,
    file: null,
  });

  const onSubmit = async (v: ProductFormValues) => {
    try {
      const payload: IProductInput = {
        ...toPayload(v),
        // The backend never accepts an image URL from the client: a staged
        // file overwrites on upload, and this flag clears the saved photo.
        removeImage: photo.cleared || undefined,
      };
      const file = photo.file ?? undefined;
      if (product) {
        await updateProduct({ id: product.id, body: payload, photo: file }).unwrap();
        notify.success("Product updated");
      } else {
        await createProduct({ body: payload, photo: file }).unwrap();
        notify.success("Product created");
      }
      router.push("/admin/items");
    } catch (err) {
      notify.error(
        editing ? "Couldn't save the product" : "Couldn't create the product",
        { description: extractApiError(err).message },
      );
    }
  };

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="grid gap-[18px]"
      style={{ animation: "kk-rise .5s both" }}
    >
      {/* Details take the bulk of the width; the photo sits alongside on lg so
          the upload doesn't leave a wide empty strip. Stacks below on smaller. */}
      <div className="grid gap-[18px] lg:grid-cols-[minmax(0,3fr)_minmax(240px,1fr)]">
        <Card className="grid gap-4 p-[clamp(20px,3vw,28px)]">
          <h2 className="font-serif text-[19px]">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Name"
              placeholder="e.g. Butter Croissant"
              error={errors.name?.message}
              {...register("name")}
            />
            <div className="grid gap-[7px]">
              <span className={labelClass}>Category</span>
              <Select {...register("category")}>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-[7px]">
            <span className={labelClass}>Description</span>
            <textarea
              rows={4}
              placeholder="What makes this bake special?"
              {...register("description")}
              className="w-full rounded-[12px] border-[1.5px] border-ink/20 bg-cream px-[15px] py-3 font-sans text-[15px] text-ink outline-none transition-colors focus:border-accent"
            />
            {errors.description ? (
              <span className="text-[12.5px] font-semibold text-danger">
                {errors.description.message}
              </span>
            ) : null}
          </div>
        </Card>

        <Card className="p-[clamp(20px,3vw,28px)]">
          <h2 className="mb-4 font-serif text-[19px]">Photo</h2>
          <FileUploadField
            label="Product photo"
            kind="image"
            accept="image/*"
            hint="JPG, PNG or WebP, up to 10MB."
            currentUrl={product?.image}
            onChange={setPhoto}
          />
        </Card>
      </div>

      <Card className="grid gap-4 p-[clamp(20px,3vw,28px)]">
        <h2 className="font-serif text-[19px]">Pricing & availability</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Price (GHS)"
            placeholder="e.g. 25.00"
            type="number"
            step="0.01"
            min="0"
            error={errors.price?.message}
            {...register("price")}
          />
          <TextField
            label="Sale unit"
            placeholder='e.g. "Each", "Box of 6", "Per loaf"'
            error={errors.unit?.message}
            {...register("unit")}
          />
          <TextField
            label="Lead time (days)"
            placeholder="e.g. 2"
            type="number"
            min="0"
            hint="0 = available same day"
            error={errors.leadTimeDays?.message}
            {...register("leadTimeDays")}
          />
          <TextField
            label="Stock (optional)"
            placeholder="e.g. 20"
            type="number"
            min="0"
            hint="Leave empty for made to order (no cap)"
            error={errors.stock?.message}
            {...register("stock")}
          />
          <TextField
            label="Position"
            placeholder="e.g. 0"
            type="number"
            min="0"
            hint="Lower numbers show first in the shop"
            error={errors.position?.message}
            {...register("position")}
          />
          <label className="flex items-center gap-3 self-end pb-3 text-[14.5px] font-medium">
            <input
              type="checkbox"
              {...register("isAvailable")}
              className="h-[18px] w-[18px] accent-[--color-accent]"
            />
            Available in the shop
          </label>
          <label className="flex items-center gap-3 self-end pb-3 text-[14.5px] font-medium">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="h-[18px] w-[18px] accent-[--color-accent]"
            />
            Featured on the home page
          </label>
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/items")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={creating || updating}
          loadingText={editing ? "Saving…" : "Creating…"}
        >
          {editing ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
