"use client";

import { format } from "date-fns";
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useTransition } from "react";
import { SingleImageUpload } from "@/components/image-upload/single-image-upload";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { updateCategoryAction } from "@/lib/actions/categories";
import { getSlug } from "@/lib/get-slug";
import type { AdminCategory } from "@/types/categories";
import { updateCategorySchema } from "@/validation/categories";
import { useAppForm } from "../shared/form";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// biome-ignore lint/style/noMagicNumbers: Image aspect ratio
const IMAGE_ASPECT_RATIO = 16 / 9;

export function CategoryForm({
  category,
}: {
  category?: AdminCategory | null;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useAppForm({
    defaultValues: {
      id: category?.id ?? "",
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      parentId: category?.parentId ?? null,
      isActive: category?.isActive ?? false,
      showInMenu: category?.showInMenu ?? true,
      showInB2c: category?.showInB2c ?? true,
      showInB2b: category?.showInB2b ?? true,
      imageId: category?.imageId ?? null,
      sortOrder: category?.sortOrder ?? 0,
    },
    listeners: {
      onChangeDebounceMs: 5000,
      onChange: ({ formApi }) => {
        if (formApi.state.isValid && !formApi.state.isSubmitting) {
          formApi.handleSubmit();
        }
      },
    },
    validators: {
      onSubmit: updateCategorySchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await updateCategoryAction({ id: value.id, category: value });
      });
    },
  });

  if (!category) {
    return <div>Kategória nebola nájdená</div>;
  }

  return (
    <form.AppForm>
      <form
        aria-disabled={isPending}
        id="category-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldSet className="@md/page:max-w-md max-w-full gap-5">
          <div className="flex flex-row items-start justify-between">
            <div>
              <FieldLegend>Nastavenie kategórie</FieldLegend>
              <FieldDescription className="text-[10px]">
                {isPending
                  ? "Ukladá sa..."
                  : `Naposledy uložené ${format(
                      category?.updatedAt ?? new Date(),
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
            <form.AppField name="imageId">
              {(field) => (
                <Field className="flex flex-col gap-2">
                  <SingleImageUpload
                    aspect={IMAGE_ASPECT_RATIO}
                    className="w-full"
                    disabled={isPending}
                    onChange={(val) => field.handleChange(val)}
                    value={field.state.value}
                  />
                </Field>
              )}
            </form.AppField>
            <form.AppField
              listeners={{
                onChangeDebounceMs: 300,
                onChange: (event) => {
                  form.setFieldValue("slug", getSlug(event.value));
                },
              }}
              name="name"
            >
              {(field) => (
                <field.TextField
                  label="Názov kategórie"
                  placeholder="Názov kategórie"
                />
              )}
            </form.AppField>
            <form.AppField name="slug">
              {(field) => <field.TextField label="Slug" placeholder="Slug" />}
            </form.AppField>
            <form.AppField name="description">
              {(field) => (
                <field.TextareaField
                  label="Popis"
                  placeholder="Popis kategórie..."
                />
              )}
            </form.AppField>
          </FieldGroup>
          <FieldGroup className="gap-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-4">
              <form.AppField name="isActive">
                {(field) => (
                  <field.SwitchField
                    description="Je kategória aktívna?"
                    label="Aktívna"
                  />
                )}
              </form.AppField>
              <form.AppField name="showInMenu">
                {(field) => (
                  <field.SwitchField
                    description="Zobraziť v menu?"
                    label="V menu"
                  />
                )}
              </form.AppField>
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
            <form.AppField name="sortOrder">
              {(field) => <field.QuantitySetterField label="Poradie" min={0} />}
            </form.AppField>
          </FieldGroup>
        </FieldSet>
      </form>
    </form.AppForm>
  );
}
