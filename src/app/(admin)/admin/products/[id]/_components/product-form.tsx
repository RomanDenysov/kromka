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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PRODUCT_STATUSES } from "@/db/types";
import type { Allergen } from "@/features/allergens/api/queries";
import { AllergenPicker } from "@/features/allergens/components/allergen-picker";
import { allergenCodeSchema } from "@/features/allergens/schema";
import type { Category } from "@/features/categories/api/queries";
import { nutritionPer100Schema } from "@/features/ingredients/schema";
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
  allergenCodes: z.array(allergenCodeSchema),
  nutritionOverride: nutritionPer100Schema.nullable(),
});

export type ProductSchema = z.infer<typeof productSchema>;

export function ProductForm({
  product,
  categories,
  allergens,
  formId,
  renderFooter,
  className,
}: {
  product: AdminProduct;
  categories: Category[];
  allergens: Allergen[];
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
      allergenCodes: (product.allergenCodes ??
        []) as ProductSchema["allergenCodes"],
      nutritionOverride:
        (product as { nutritionOverride?: ProductSchema["nutritionOverride"] })
          .nutritionOverride ?? null,
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
        <div className={cn("flex flex-col gap-6", className)}>
          <Card>
            <CardHeader>
              <CardTitle>Základné informácie</CardTitle>
              <CardDescription>
                Obrázok, názov a katalógové údaje produktu.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid @2xl/page:grid-cols-[minmax(0,240px)_1fr] gap-6">
              <ImageUploadField
                className="@2xl/page:max-w-[240px]"
                folder="products"
                imageUrl={product.imageUrl ?? undefined}
                name="imageId"
              />
              <div className="flex flex-col gap-4">
                <div className="grid @md/page:grid-cols-2 gap-4">
                  <TextField
                    label="Názov"
                    name="name"
                    placeholder="Názov produktu"
                  />
                  <SlugField label="Slug" name="slug" />
                </div>
                <div className="grid @lg/page:grid-cols-3 gap-4">
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
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popis</CardTitle>
              <CardDescription>
                Marketingový popis zobrazený zákazníkom na detaile produktu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextField
                label=""
                name="description"
                placeholder="Popis produktu"
                variant="simple"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alergény</CardTitle>
              <CardDescription>
                Vyberte alergény, ktoré produkt obsahuje. Zoznam pochádza z
                povinných 14 alergénov podľa nariadenia EÚ 1169/2011.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AllergenPicker
                allergens={allergens}
                label=""
                name="allergenCodes"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zobrazenie</CardTitle>
              <CardDescription>
                Nastavenie zobrazenia produktu pre B2C a B2B klientov.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div
                className="flex flex-wrap items-center gap-6 rounded-md border bg-muted/30 p-4"
                data-slot="checkbox-group"
              >
                <CheckboxField label="B2B" name="showInB2b" />
                <CheckboxField label="B2C" name="showInB2c" />
              </div>
              <div className="grid @md/page:grid-cols-[1fr_auto] @md/page:items-stretch gap-4">
                <SwitchField
                  className="bg-muted/30"
                  description="Zobraziť produkt na stránkach?"
                  label="Aktívny"
                  name="isActive"
                />
                <QuantityField
                  className="@md/page:w-[180px] bg-muted/30"
                  label="Poradie"
                  name="sortOrder"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
      {renderFooter({ isPending: form.formState.isSubmitting })}
    </FormProvider>
  );
}
