"use client";

import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppForm } from "@/components/shared/form";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { productStatusEnum } from "@/db/schema/enums";
import { getSlug } from "@/lib/get-slug";
import { useTRPC } from "@/trpc/client";
import { productSchema } from "@/validation/products";

export function ProductForm({ id }: { id: string }) {
  const trpc = useTRPC();
  const { data: product } = useSuspenseQuery(
    trpc.admin.products.byId.queryOptions({ id })
  );
  const { mutateAsync: updateProduct, isPending: isPendingUpdateProduct } =
    useMutation(
      trpc.admin.products.update.mutationOptions({
        onSuccess: () => {
          toast.success("Produkt aktualizovaný");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      })
    );

  const form = useAppForm({
    validators: {
      onSubmit: productSchema,
    },
    defaultValues: {
      id,
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? null,
      stock: product?.stock ?? 0,
      isActive: product?.isActive ?? false,
      sortOrder: product?.sortOrder ?? 0,
      status: product?.status ?? "draft",
    },
    onSubmit: ({ value }) => updateProduct({ id, product: value }),
  });

  return (
    <div className="max-w-md p-3">
      <form.AppForm>
        <form
          aria-disabled={isPendingUpdateProduct}
          id="product-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldGroup>
              <form.AppField
                listeners={{
                  onChangeDebounceMs: 300,
                  onChange: (event) => {
                    form.setFieldValue("slug", getSlug(event.value));
                  },
                }}
                name="name"
              >
                {(field) => <field.TextField label="Názov" />}
              </form.AppField>

              <form.AppField
                listeners={{
                  onChangeDebounceMs: 300,
                  onChange: (event) => {
                    form.setFieldValue("slug", getSlug(event.value));
                  },
                }}
                name="slug"
              >
                {(field) => <field.TextField label="Slug" />}
              </form.AppField>

              <form.AppField name="description">
                {(field) => <field.RichTextField label="Popis" />}
              </form.AppField>
            </FieldGroup>
            <FieldGroup>
              <form.AppField name="stock">
                {(field) => <field.QuantitySetterField label="Množstvo" />}
              </form.AppField>
            </FieldGroup>
            <FieldGroup>
              <form.AppField name="isActive">
                {(field) => <field.SwitchField label="Aktívny" />}
              </form.AppField>
            </FieldGroup>
            <FieldGroup>
              <form.AppField name="sortOrder">
                {(field) => <field.QuantitySetterField label="Poradie" />}
              </form.AppField>
            </FieldGroup>
            <FieldGroup>
              <form.AppField name="status">
                {(field) => (
                  <field.SelectField
                    label="Status"
                    options={productStatusEnum.enumValues.map((status) => ({
                      label: status,
                      value: status,
                    }))}
                  />
                )}
              </form.AppField>
            </FieldGroup>
            <form.SubmitButton
              className="mt-auto self-end"
              form="product-form"
              size="sm"
            />
          </FieldSet>
        </form>
      </form.AppForm>
    </div>
  );
}
