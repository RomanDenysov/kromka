"use client";

import type { JSONContent } from "@tiptap/react";
import { type ReactNode, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import z from "zod";
import { CheckboxField } from "@/components/forms/fields/checkbox-field";
import { ComboboxField } from "@/components/forms/fields/combobox-field";
import { ImageUploadField } from "@/components/forms/fields/image-upload-field";
import { PriceInputField } from "@/components/forms/fields/price-input-field";
import { QuantityField } from "@/components/forms/fields/quantity-field";
import { RichTextField } from "@/components/forms/fields/rich-text-field";
import { SelectField } from "@/components/forms/fields/select-field";
import { SlugField } from "@/components/forms/fields/slug-field";
import { SwitchField } from "@/components/forms/fields/switch-field";
import { TextField } from "@/components/forms/fields/text-field";
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { PRODUCT_STATUSES } from "@/db/types";
import type { Category } from "@/features/categories/api/queries";
import { updateProductAction } from "@/features/products/api/actions";
import type { AdminProduct } from "@/features/products/api/queries";
import { MAX_STRING_LENGTH, PRODUCT_STATUSES_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(MAX_STRING_LENGTH),
  slug: z.string().min(1).max(MAX_STRING_LENGTH),
  description: z.custom<JSONContent>().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  status: z.enum(PRODUCT_STATUSES),
  showInB2c: z.boolean(),
  showInB2b: z.boolean(),
  priceCents: z.number(),
  imageId: z.string().nullable(),
  categoryId: z.string().nullable(),
});

export type ProductSchema = z.infer<typeof productSchema>;

export function ProductForm({
  product,
  categories,
  formId,
  renderFooter,
  className,
}: {
  product: AdminProduct;
  categories: Category[];
  formId: string;
  renderFooter: (props: { isPending: boolean }) => ReactNode;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  useHotkeys(
    "mod+s",
    (e) => {
      e.preventDefault();
      formRef.current?.requestSubmit();
    },
    { enableOnFormTags: true }
  );

  const form = useForm<ProductSchema>({
    defaultValues: {
      name: product.name,
      slug: product.slug,
      id: product.id,
      description: product.description ?? null,
      isActive: product.isActive,
      sortOrder: product.sortOrder,
      status: product.status,
      showInB2c: product.showInB2c,
      showInB2b: product.showInB2b,
      priceCents: product.priceCents,
      imageId: product.imageId ?? null,
      categoryId: product.category?.id ?? null,
    },
  });

  const onSubmit = async (data: ProductSchema) => {
    const result = await updateProductAction({
      id: data.id,
      product: {
        ...data,
        categoryId: data.categoryId ?? null,
      },
    });
    if (result.success) {
      toast.success("Produkt bol uložený");
    }
  };
  return (
    <FormProvider {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
        <div
          className={cn(
            "grid @xl/page:max-w-5xl max-w-full gap-6 @lg/page:p-5 @xl/page:p-8 p-4",
            className
          )}
        >
          <FieldSet className="@xl/page:gap-8 gap-5">
            <FieldGroup className="grid @xl/page:grid-cols-4 grid-cols-2 @xl/page:gap-6 gap-4">
              <ImageUploadField
                className="@xl/page:col-span-3 col-span-full @xl/page:row-span-2"
                folder="products"
                imageUrl={product.imageUrl ?? undefined}
                name="imageId"
              />
              <TextField
                label="Názov"
                name="name"
                placeholder="Názov produktu"
              />
              <SlugField label="Slug" name="slug" />
              <RichTextField
                label="Popis"
                name="description"
                placeholder="Popis produktu"
                variant="simple"
              />
              <ComboboxField
                label="Kategória"
                name="categoryId"
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
              />

              <SelectField
                label="Status"
                name="status"
                options={PRODUCT_STATUSES.map((status) => ({
                  value: status,
                  label: PRODUCT_STATUSES_LABELS[status],
                }))}
              />
              <PriceInputField label="Cena" name="priceCents" />
            </FieldGroup>
          </FieldSet>

          <FieldSet className="@xl/page:gap-8 gap-4">
            <FieldLabel>Zobrazenie</FieldLabel>
            <FieldDescription>
              Nastavenie configurácie zobrazenia produktu pre B2C a B2B
              klientov.
            </FieldDescription>
            <FieldGroup
              className="flex-row gap-3 rounded-md border p-3"
              data-slot="checkbox-group"
            >
              <CheckboxField label="B2B" name="showInB2b" />
              <CheckboxField label="B2C" name="showInB2c" />
            </FieldGroup>
            <FieldGroup className="flex-row gap-3">
              <SwitchField
                className="grow"
                description="Zobraziť produkt na stránkach?"
                label="Aktívny"
                name="isActive"
              />
              <QuantityField
                className="flex-1"
                label="Poradie"
                name="sortOrder"
              />
            </FieldGroup>
          </FieldSet>
        </div>
      </form>
      {renderFooter({ isPending: form.formState.isSubmitting })}
    </FormProvider>
  );
}
