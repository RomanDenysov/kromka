"use client";

import { type ReactNode, useRef } from "react";
import { FormProvider } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ComboboxField } from "@/components/forms/fields/combobox-field";
import { ImageUploadField } from "@/components/forms/fields/image-upload-field";
import { PickupDatesField } from "@/components/forms/fields/pickup-dates-field";
import { QuantityField } from "@/components/forms/fields/quantity-field";
import { SlugField } from "@/components/forms/fields/slug-field";
import { SwitchField } from "@/components/forms/fields/switch-field";
import { TextField } from "@/components/forms/fields/text-field";
import { TextareaField } from "@/components/forms/fields/textarea-field";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { updateCategoryAction } from "@/lib/actions/categories";
import { uploadMedia } from "@/lib/actions/media";
import type { AdminCategory } from "@/types/categories";
import { type CategorySchema, useCategoryForm } from "../use-category-form";

export function CategoryForm({
  category,
  children,
  categories,
}: {
  category: AdminCategory;
  children: (props: { isPending: boolean }) => ReactNode;
  categories: AdminCategory[];
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

  const form = useCategoryForm(category);

  const filteredCategories = categories.filter((c) => c.id !== category.id);

  const onSubmit = async (data: CategorySchema) => {
    const result = await updateCategoryAction({
      id: data.id,
      category: data,
    });
    if (result.success) {
      toast.success("Kategória bola uložená");
    } else if (result.error === "SLUG_TAKEN") {
      toast.error("Slug je už použitý inou kategóriou");
    } else {
      toast.error("Nepodarilo sa uložiť kategóriu");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
        <FieldSet className="@md/page:max-w-md max-w-full gap-5">
          <FieldGroup className="gap-4">
            <ImageUploadField
              name="imageId"
              onUpload={async (file) => {
                const media = await uploadMedia(file, "categories");
                return { id: media.id, url: media.url };
              }}
            />
            <TextField
              label="Názov kategórie"
              name="name"
              placeholder="Názov kategórie"
            />
            <SlugField label="Slug" name="slug" />
            <TextareaField
              label="Popis"
              name="description"
              placeholder="Popis kategórie..."
            />
            <ComboboxField
              label="Rodičovská kategória"
              name="parentId"
              options={filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
            <PickupDatesField label="Dátumy vyzdvihnutia" name="pickupDates" />
          </FieldGroup>
          <FieldGroup className="gap-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-4">
              <SwitchField
                description="Je kategória aktívna?"
                label="Aktívna"
                name="isActive"
              />
              <SwitchField
                description="Zobraziť v menu?"
                label="V menu"
                name="showInMenu"
              />
              <SwitchField
                description="Zobraziť pre B2C?"
                label="B2C"
                name="showInB2c"
              />
              <SwitchField
                description="Zobraziť pre B2B?"
                label="B2B"
                name="showInB2b"
              />
            </div>
            <QuantityField label="Poradie" name="sortOrder" />
          </FieldGroup>
        </FieldSet>
        {children({ isPending: form.formState.isSubmitting })}
      </form>
    </FormProvider>
  );
}
