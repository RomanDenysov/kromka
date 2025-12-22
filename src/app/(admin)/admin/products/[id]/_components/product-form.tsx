"use client";

import type { JSONContent } from "@tiptap/react";
import { RefreshCwIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import z from "zod";
import { Editor } from "@/components/editor/editor";
import { ImageUploadField } from "@/components/forms/fields/image-upload-field";
import { ComboboxInput } from "@/components/shared/combobox-input";
import { QuantityInput } from "@/components/shared/quantity-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { MaskInput } from "@/components/ui/mask-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PRODUCT_STATUSES, type ProductStatus } from "@/db/types";
import { uploadMedia } from "@/lib/actions/media";
import { updateProductAction } from "@/lib/actions/products";
import { PRODUCT_STATUSES_LABELS } from "@/lib/constants";
import type { Category } from "@/lib/queries/categories";
import type { AdminProduct } from "@/lib/queries/products";
import { cn, formatCentsToPrice } from "@/lib/utils";
import { MAX_STRING_LENGTH } from "@/validation/constants";

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
      imageId: product.images[0] ?? null,
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
    console.log(result);
    if (result.success) {
      toast.success("Produkt bol uložený");
    }
  };
  return (
    <FormProvider {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
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
                control={form.control}
                name="imageId"
                onUpload={async (file) => {
                  const media = await uploadMedia(file, "products");
                  form.setValue("imageId", media.id);
                  return { id: media.id, url: media.url };
                }}
              />
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Názov</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      className="max-w-xs"
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
                name="slug"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                    <InputGroup className="h-7 max-w-xs py-0.5 text-xs md:text-sm">
                      <InputGroupInput
                        {...field}
                        aria-invalid={fieldState.invalid}
                        className="px-1.5"
                      />
                      <InputGroupButton
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                      >
                        <RefreshCwIcon className="size-3" />
                      </InputGroupButton>
                    </InputGroup>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field
                    className="@xl/page:col-span-full col-span-full @xl/page:row-span-2 row-span-2 gap-1 overflow-y-hidden"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>Popis</FieldLabel>
                    <Editor
                      className="min-h-30"
                      content={field.value ?? undefined}
                      onBlur={field.onBlur}
                      onChange={(content) =>
                        field.onChange(content as JSONContent)
                      }
                      placeholder="Popis produktu"
                      variant="simple"
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldContent className="gap-0.5">
                      <FieldLabel htmlFor={field.name}>Kategória</FieldLabel>
                    </FieldContent>
                    <ComboboxInput
                      onChange={field.onChange}
                      options={categories.map((category) => ({
                        value: category.id,
                        label: category.name,
                      }))}
                      value={field.value ?? null}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="status"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldContent className="gap-0.5">
                      <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                    </FieldContent>
                    <Select
                      aria-invalid={fieldState.invalid}
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value as ProductStatus}
                    >
                      <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        className="px-1.5 py-0.5"
                        id={`${field.name}-${formId}`}
                        name={field.name}
                        size="xs"
                      >
                        <SelectValue placeholder="Vyberte status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_STATUSES.map((status) => (
                          <SelectItem
                            className="capitalize"
                            key={status}
                            value={status}
                          >
                            {PRODUCT_STATUSES_LABELS[status]}
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
              <Controller
                control={form.control}
                name="priceCents"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Cena</FieldLabel>
                    <MaskInput
                      aria-invalid={fieldState.invalid}
                      className="h-7 max-w-xs px-1.5 py-0.5 text-xs md:text-sm"
                      currency="EUR"
                      id={`${field.name}-${formId}`}
                      locale="sk-SK"
                      mask="currency"
                      name={field.name}
                      onBlur={field.onBlur}
                      onValueChange={(_maskedValue, unmaskedValue) => {
                        const price = Number.parseFloat(unmaskedValue);
                        if (Number.isNaN(price)) {
                          field.onChange(0);
                          return;
                        }
                        const cents = Math.round(price * 100);
                        field.onChange(cents);
                      }}
                      value={formatCentsToPrice(field.value).toString()}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
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
              <Controller
                control={form.control}
                name="showInB2b"
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    orientation="horizontal"
                  >
                    <Checkbox
                      checked={field.value}
                      id={`${field.value}-${formId}`}
                      onCheckedChange={field.onChange}
                    />
                    <FieldLabel
                      className="font-normal"
                      htmlFor={`${field.value}-${formId}`}
                    >
                      B2B
                    </FieldLabel>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="showInB2c"
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    orientation="horizontal"
                  >
                    <Checkbox
                      checked={field.value}
                      id={`${field.value}-${formId}`}
                      onCheckedChange={field.onChange}
                    />
                    <FieldLabel
                      className="font-normal"
                      htmlFor={`${field.value}-${formId}`}
                    >
                      B2C
                    </FieldLabel>
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup className="flex-row gap-3">
              <Controller
                control={form.control}
                name="isActive"
                render={({ field, fieldState }) => (
                  <Field
                    className="grow rounded-md border p-3"
                    data-invalid={fieldState.invalid}
                    orientation="horizontal"
                  >
                    <FieldContent className="gap-0.5">
                      <FieldLabel htmlFor={field.name}>Aktívny</FieldLabel>
                      <FieldDescription className="text-xs">
                        Je produkt aktívny? Zobrazuje sa na stránkach.
                      </FieldDescription>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <Switch
                      aria-invalid={fieldState.invalid}
                      checked={field.value}
                      id={`${field.name}-${formId}`}
                      name={field.name}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="sortOrder"
                render={({ field, fieldState }) => (
                  <Field
                    className="flex-1 gap-1 rounded-md border p-3"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>Poradie</FieldLabel>

                    <QuantityInput
                      id={`${field.name}-${formId}`}
                      max={100}
                      min={0}
                      onChange={field.onChange}
                      value={field.value}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </FieldSet>
        </div>
      </form>
      {renderFooter({ isPending: form.formState.isSubmitting })}
    </FormProvider>
  );
}
