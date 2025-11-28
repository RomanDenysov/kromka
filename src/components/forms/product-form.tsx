"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useAppForm } from "@/components/shared/form";
import { FormSkeleton } from "@/components/shared/form/form-skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { PRODUCT_STATUSES } from "@/db/schema";
import { useFormAutoSave } from "@/hooks/use-form-auto-save";
import { getSlug } from "@/lib/get-slug";
import { useTRPC } from "@/trpc/client";
import { updateProductSchema } from "@/validation/products";
import { ImageUpload } from "../image-upload";

export function ProductForm({ id }: { id: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: product, isLoading: isLoadingProduct } = useSuspenseQuery(
    trpc.admin.products.byId.queryOptions({ id })
  );
  const { mutateAsync: updateProduct, isPending: isPendingUpdateProduct } =
    useMutation(
      trpc.admin.products.update.mutationOptions({
        onSuccess: async (updatedProduct) => {
          await queryClient.invalidateQueries({
            queryKey: trpc.admin.products.byId.queryOptions({
              id: updatedProduct.id,
            }).queryKey,
          });
        },
        onError: (error) => {
          toast.error(error.message);
        },
      })
    );

  const form = useAppForm({
    validators: {
      onSubmit: updateProductSchema,
    },
    defaultValues: {
      id,
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? null,
      isActive: product?.isActive ?? true,
      sortOrder: product?.sortOrder ?? 0,
      status: product?.status ?? "draft",
      showInB2c: product?.showInB2c ?? true,
      showInB2b: product?.showInB2b ?? false,
      priceCents: product?.priceCents ?? 0,
      categoryIds: product?.categories.map((category) => category.id) ?? [],
    },
    listeners: {
      onChangeDebounceMs: 5000,
      onChange: ({ formApi }) => {
        if (formApi.state.isValid && !formApi.state.isSubmitting) {
          formApi.handleSubmit();
        }
      },
    },
    onSubmit: ({ value }) => updateProduct({ id, product: value }),
  });

  const { formRef, onBlurCapture, onFocusCapture } = useFormAutoSave(form);

  if (isLoadingProduct) {
    return <FormSkeleton className="@md/page:max-w-md" />;
  }

  return (
    <form.AppForm>
      <form
        aria-disabled={isPendingUpdateProduct}
        id="product-form"
        onBlurCapture={onBlurCapture}
        onFocusCapture={onFocusCapture}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        ref={formRef}
      >
        <FieldSet className="@md/page:max-w-md max-w-full gap-5">
          <div className="flex flex-row items-start justify-between">
            <div>
              <FieldLegend>Nastavenie produktu</FieldLegend>
              <FieldDescription className="text-[10px]">
                {isPendingUpdateProduct || isLoadingProduct
                  ? "Ukladá sa..."
                  : `Naposledy uložené ${format(
                      product?.updatedAt ?? new Date(),
                      "dd.MM.yyyy HH:mm"
                    )}`}
              </FieldDescription>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-xs" variant="ghost">
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem variant="destructive">
                    <Trash2Icon />
                    Vymazať
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <FieldGroup className="gap-4">
            <Field className="flex flex-col gap-2">
              <FieldLabel>Galéria</FieldLabel>
              <ImageUpload productId={id} />
            </Field>
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

            <form.AppField name="priceCents">
              {(field) => <field.PriceInputField label="Cena" />}
            </form.AppField>

            <form.AppField name="description">
              {(field) => <field.RichTextField label="Popis" />}
            </form.AppField>
          </FieldGroup>

          <FieldGroup className="gap-4">
            <form.AppField name="categoryIds">
              {(field) => <field.CategorySelectField />}
            </form.AppField>
          </FieldGroup>

          <FieldGroup className="gap-4">
            <div className="grid grid-cols-2 gap-4">
              <form.AppField name="sortOrder">
                {(field) => <field.QuantitySetterField label="Poradie" />}
              </form.AppField>
              <form.AppField name="status">
                {(field) => (
                  <field.SelectField
                    label="Status"
                    options={PRODUCT_STATUSES.map((status) => ({
                      label: status,
                      value: status,
                    }))}
                  />
                )}
              </form.AppField>
            </div>
          </FieldGroup>

          <FieldGroup className="gap-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-4">
              {/* <form.AppField name="isActive">
                {(field) => (
                  <field.SwitchField
                    description="Je produkt aktívny?"
                    label="Aktívny"
                  />
                )}
              </form.AppField> */}
              <form.AppField name="showInB2c">
                {(field) => (
                  <field.SwitchField
                    description="Zobraziť pre B2C?"
                    label="B2C"
                  />
                )}
              </form.AppField>
              <form.AppField name="showInB2b">
                {(field) => (
                  <field.SwitchField
                    description="Zobraziť pre B2B?"
                    label="B2B"
                  />
                )}
              </form.AppField>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </form.AppForm>
  );
}
