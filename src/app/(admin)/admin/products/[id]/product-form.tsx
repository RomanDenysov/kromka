"use client";

import { format } from "date-fns";
import {
  MoreHorizontalIcon,
  RefreshCwIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { AdminProduct } from "@/app/(admin)/admin/products/[id]/page";
import { ImageUpload } from "@/components/image-upload";
import { useAppForm } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateProductAction } from "@/lib/actions/products";
import { getSlug } from "@/lib/get-slug";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/categories";
import { updateProductSchema } from "@/validation/products";

export function ProductForm({
  product,
  categories,
}: {
  product: AdminProduct;
  categories: Category[];
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const form = useAppForm({
    validators: {
      onSubmit: updateProductSchema,
    },
    defaultValues: {
      id: product?.id ?? "",
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? null,
      isActive: product?.isActive ?? true,
      sortOrder: product?.sortOrder ?? 0,
      status: product?.status ?? "draft",
      showInB2c: product?.showInB2c ?? true,
      showInB2b: product?.showInB2b ?? false,
      priceCents: product?.priceCents ?? 0,
      categoryId: product?.category?.id ?? null,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await updateProductAction({
          id: value.id,
          product: value,
        });
        if (result.success) {
          toast.success("Produkt bol uložený");
        } else if (result.error === "SLUG_TAKEN") {
          toast.error("Slug je už použitý iným produktom");
        } else {
          toast.error("Nepodarilo sa uložiť produkt");
        }
      });
    },
  });

  if (!product) {
    return <div>Produkt nebol nájdený</div>;
  }

  return (
    <form.AppForm>
      <form
        aria-disabled={isPending}
        id="product-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldSet className="@md/page:max-w-md max-w-full gap-5">
          <div className="flex flex-row items-start justify-between">
            <div>
              <FieldLegend>Nastavenie produktu</FieldLegend>
              <FieldDescription className="text-[10px]">
                Naposledy uložené{" "}
                {format(product?.updatedAt ?? new Date(), "dd.MM.yyyy HH:mm")}
              </FieldDescription>
            </div>
            <div className="flex gap-1">
              <form.Subscribe
                selector={(state) => [state.isDirty, state.isValid]}
              >
                {([isDirty, isValid]) => (
                  <Button
                    disabled={isPending || !isDirty || !isValid}
                    size="xs"
                    type="submit"
                  >
                    <SaveIcon className="size-3.5" />
                    {isPending ? "Ukladá sa..." : "Uložiť"}
                  </Button>
                )}
              </form.Subscribe>
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
              <ImageUpload productId={product.id} />
            </Field>
            <form.AppField name="name">
              {(field) => <field.TextField label="Názov" />}
            </form.AppField>

            <form.AppField name="slug">
              {(field) => (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <field.TextField
                      label="Slug"
                      onBlur={() => {
                        const formatted = getSlug(field.state.value);
                        field.handleChange(formatted);
                      }}
                    />
                  </div>
                  <form.Subscribe selector={(state) => state.values.name}>
                    {(name) => (
                      <Button
                        className="mt-6"
                        onClick={() => field.handleChange(getSlug(name))}
                        size="icon"
                        title="Generovať z názvu"
                        type="button"
                        variant="outline"
                      >
                        <RefreshCwIcon className="size-4" />
                      </Button>
                    )}
                  </form.Subscribe>
                </div>
              )}
            </form.AppField>

            <form.AppField name="priceCents">
              {(field) => <field.PriceInputField label="Cena" />}
            </form.AppField>

            <form.AppField name="description">
              {(field) => <field.RichTextField label="Popis" />}
            </form.AppField>
          </FieldGroup>

          <FieldGroup className="gap-4">
            <form.Field name="categoryId">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    className={cn("rounded-md border bg-card p-3")}
                    data-invalid={isInvalid}
                    orientation="horizontal"
                  >
                    <FieldContent>
                      <FieldLabel>Kategória</FieldLabel>
                    </FieldContent>
                    <Popover onOpenChange={setOpen} open={open}>
                      <PopoverTrigger asChild>
                        <Button
                          className="justify-start"
                          size="sm"
                          variant="outline"
                        >
                          {field.state.value ? (
                            categories.find(
                              (category) => category.id === field.state.value
                            )?.name
                          ) : (
                            <>+ Vyberte kategóriu</>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="p-0"
                        side="right"
                      >
                        <Command>
                          <CommandInput placeholder="Vyberte kategóriu..." />
                          <CommandList>
                            <CommandEmpty>
                              Ziadna kategória nebola nájdená
                            </CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  onSelect={() => {
                                    field.handleChange(category.id);
                                  }}
                                  value={category.id}
                                >
                                  {category.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </Field>
                );
              }}
            </form.Field>
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
                    options={[
                      { label: "Draft", value: "draft" },
                      { label: "Active", value: "active" },
                      { label: "Sold", value: "sold" },
                      { label: "Archived", value: "archived" },
                    ]}
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
