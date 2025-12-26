"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import z from "zod";
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
import { cn } from "@/lib/utils";
import type { AdminCategory } from "@/types/categories";

type Props = {
  category: AdminCategory;
  children: (props: { isPending: boolean }) => ReactNode;
  categories: AdminCategory[];
  className?: string;
};

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  parentId: z.string().nullable(),
  showInMenu: z.boolean(),
  isActive: z.boolean(),
  showInB2c: z.boolean(),
  showInB2b: z.boolean(),
  imageId: z.string().nullable(),
  sortOrder: z.number(),
  pickupDates: z.array(z.string()).optional(),
});

export type CategorySchema = z.infer<typeof categorySchema>;

export function CategoryForm({
  category,
  children,
  categories,
  className,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  useHotkeys(
    "mod+s",
    (e) => {
      e.preventDefault();
      formRef.current?.requestSubmit();
    },
    { enableOnFormTags: true }
  );

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      id: category.id,
      name: category.name ?? "",
      slug: category.slug ?? "",
      description: category.description ?? "",
      parentId: category.parentId ?? null,
      pickupDates: category.pickupDates ?? [],
      isActive: category.isActive ?? false,
      showInMenu: category.showInMenu ?? true,
      showInB2c: category.showInB2c ?? true,
      showInB2b: category.showInB2b ?? true,
      imageId: category.imageId ?? null,
      sortOrder: category.sortOrder ?? 0,
    },
  });

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
        <FieldSet
          className={cn(
            "grid @xl/page:max-w-5xl max-w-full gap-6 @lg/page:p-5 @xl/page:p-8 p-4",
            className
          )}
        >
          <FieldGroup className="grid @xl/page:grid-cols-4 grid-cols-2 @xl/page:gap-6 gap-4">
            <ImageUploadField
              className="@xl/page:col-span-3 col-span-full @xl/page:row-span-2"
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
              className="@xl/page:col-span-2 col-span-full"
              label="Popis"
              name="description"
              placeholder="Popis kategórie..."
            />
            <ComboboxField
              className="@xl/page:col-span-2 col-span-full"
              label="Rodičovská kategória"
              name="parentId"
              options={filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
            <PickupDatesField
              className="@xl/page:col-span-2 col-span-full"
              label="Dátumy vyzdvihnutia"
              name="pickupDates"
            />
          </FieldGroup>
          <FieldGroup className="gap-4">
            <div className="grid @xl/page:grid-cols-4 grid-cols-2 @xl/page:gap-6 gap-4">
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
            <QuantityField
              className="@xl/page:col-span-2 col-span-full"
              label="Poradie"
              name="sortOrder"
            />
          </FieldGroup>
        </FieldSet>
        {children({ isPending: form.formState.isSubmitting })}
      </form>
    </FormProvider>
  );
}
