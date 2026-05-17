"use client";

import { type ReactNode, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import z from "zod";
import { ComboboxField } from "@/components/forms/fields/combobox-field";
import { ImageUploadField } from "@/components/forms/fields/image-upload-field";
import { PriceInputField } from "@/components/forms/fields/price-input-field";
import { QuantityField } from "@/components/forms/fields/quantity-field";
import { SelectField } from "@/components/forms/fields/select-field";
import { SlugField } from "@/components/forms/fields/slug-field";
import { SwitchField } from "@/components/forms/fields/switch-field";
import { TextField } from "@/components/forms/fields/text-field";
import { TextareaField } from "@/components/forms/fields/textarea-field";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_STATUSES, WEIGHT_UNITS } from "@/db/types";
import type { Allergen } from "@/features/allergens/api/queries";
import { AllergenPicker } from "@/features/allergens/components/allergen-picker";
import { allergenCodeSchema } from "@/features/allergens/schema";
import type { Category } from "@/features/categories/api/queries";
import { nutritionPer100Schema } from "@/features/ingredients/schema";
import { updateProductAction } from "@/features/products/api/actions";
import type { AdminProduct } from "@/features/products/api/queries";
import { MAX_STRING_LENGTH, PRODUCT_STATUSES_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MAX_DESCRIPTION_LENGTH = 2000;

const WEIGHT_UNIT_LABELS: Record<(typeof WEIGHT_UNITS)[number], string> = {
  g: "gramy (g)",
  ml: "mililitre (ml)",
  ks: "kusy (ks)",
};

export const productSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1).max(MAX_STRING_LENGTH),
    slug: z.string().min(1).max(MAX_STRING_LENGTH),
    description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable(),
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
    weightValue: z.number().int().positive().nullable(),
    weightUnit: z.enum(WEIGHT_UNITS).nullable(),
  })
  .refine((data) => data.weightValue === null || data.weightUnit !== null, {
    message: "Vyberte jednotku pre zadanú hodnotu",
    path: ["weightUnit"],
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
      weightValue: product.weightValue ?? null,
      weightUnit: product.weightUnit ?? "g",
    },
  });

  const onSubmit = async (data: ProductSchema) => {
    // Empty weight value clears the unit so we never persist a unit without a value.
    const normalizedWeightUnit =
      data.weightValue === null ? null : data.weightUnit;
    const result = await updateProductAction({
      id: data.id,
      product: {
        ...data,
        categoryId: data.categoryId ?? null,
        weightUnit: normalizedWeightUnit,
      },
    });
    if (result.success) {
      toast.success("Produkt bol uložený");
    }
  };

  return (
    <FormProvider {...form}>
      <div className="flex flex-col">
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
          <div className={cn("flex flex-col gap-10", className)}>
            <section className="flex flex-col gap-4">
              <header>
                <h2 className="font-semibold text-base">Základné informácie</h2>
                <p className="text-muted-foreground text-sm">
                  Obrázok, názov a katalógové údaje produktu.
                </p>
              </header>
              <ImageUploadField
                className="size-40 self-start"
                folder="products"
                imageUrl={product.imageUrl ?? undefined}
                name="imageId"
              />
              <div className="grid @md/page:grid-cols-2 gap-4">
                <TextField
                  label="Názov"
                  name="name"
                  placeholder="Názov produktu"
                />
                <SlugField label="Slug" name="slug" />
              </div>
              <div className="grid @md/page:grid-cols-3 gap-4">
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
            </section>

            <section className="flex flex-col gap-4">
              <header>
                <h2 className="font-semibold text-base">Popis</h2>
                <p className="text-muted-foreground text-sm">
                  Marketingový popis zobrazený zákazníkom na detaile produktu.
                  Jednoduchý text - na štruktúrované údaje (váha, zloženie)
                  použite vyhradené polia.
                </p>
              </header>
              <TextareaField
                name="description"
                placeholder="Krátky marketingový popis produktu..."
                rows={4}
              />
            </section>

            <section className="flex flex-col gap-4">
              <header>
                <h2 className="font-semibold text-base">Váha / množstvo</h2>
                <p className="text-muted-foreground text-sm">
                  Čistá hmotnosť alebo počet kusov v jednom balení. Nechajte
                  prázdne, ak produkt nemá zmysluplnú váhu.
                </p>
              </header>
              <div className="grid @md/page:grid-cols-[1fr_180px] gap-4">
                <Controller
                  control={form.control}
                  name="weightValue"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Hodnota</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        id={field.name}
                        inputMode="numeric"
                        min={1}
                        name={field.name}
                        onBlur={field.onBlur}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            field.onChange(null);
                            return;
                          }
                          const parsed = Number.parseInt(raw, 10);
                          field.onChange(Number.isNaN(parsed) ? null : parsed);
                        }}
                        placeholder="napr. 750"
                        type="number"
                        value={field.value ?? ""}
                        volume="xs"
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="weightUnit"
                  render={({ field, fieldState }) => (
                    <Field className="gap-1" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Jednotka</FieldLabel>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(v === "" ? null : v)
                        }
                        value={field.value ?? ""}
                      >
                        <SelectTrigger
                          aria-invalid={fieldState.invalid}
                          className="w-full"
                          id={field.name}
                          name={field.name}
                        >
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {WEIGHT_UNITS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {WEIGHT_UNIT_LABELS[u]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <header>
                <h2 className="font-semibold text-base">Alergény</h2>
                <p className="text-muted-foreground text-sm">
                  Vyberte alergény, ktoré produkt obsahuje. Zoznam pochádza z
                  povinných 14 alergénov podľa nariadenia EÚ 1169/2011.
                </p>
              </header>
              <AllergenPicker
                allergens={allergens}
                label=""
                name="allergenCodes"
              />
            </section>

            <section className="flex flex-col gap-4">
              <header>
                <h2 className="font-semibold text-base">Zobrazenie</h2>
                <p className="text-muted-foreground text-sm">
                  Nastavenie zobrazenia produktu pre B2C a B2B klientov.
                </p>
              </header>
              <div className="grid @md/page:grid-cols-2 gap-4">
                <SwitchField
                  description="Zobraziť produkt B2B klientom"
                  label="B2B"
                  name="showInB2b"
                />
                <SwitchField
                  description="Zobraziť produkt B2C klientom"
                  label="B2C"
                  name="showInB2c"
                />
              </div>
              <div className="grid @md/page:grid-cols-[1fr_auto] @md/page:items-stretch gap-4">
                <SwitchField
                  description="Zobraziť produkt na stránkach?"
                  label="Aktívny"
                  name="isActive"
                />
                <QuantityField
                  className="@md/page:w-[180px]"
                  label="Poradie"
                  name="sortOrder"
                />
              </div>
            </section>
          </div>
        </form>
        {renderFooter({ isPending: form.formState.isSubmitting })}
      </div>
    </FormProvider>
  );
}
