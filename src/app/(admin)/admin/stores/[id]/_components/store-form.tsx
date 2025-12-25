"use client";

import { type ReactNode, useRef } from "react";
import { FormProvider } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/forms/fields/image-upload-field";
import { OpeningHoursField } from "@/components/forms/fields/opening-hours-field";
import { QuantityField } from "@/components/forms/fields/quantity-field";
import { RichTextField } from "@/components/forms/fields/rich-text-field";
import { SlugField } from "@/components/forms/fields/slug-field";
import { SwitchField } from "@/components/forms/fields/switch-field";
import { TextField } from "@/components/forms/fields/text-field";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { uploadMedia } from "@/lib/actions/media";
import { updateStoreAction } from "@/lib/actions/stores";
import type { AdminStore } from "@/lib/queries/stores";
import { type StoreSchema, useStoreForm } from "../use-store-form";

export function StoreForm({
  store,
  children,
}: {
  store: AdminStore;
  children: (props: { isPending: boolean }) => ReactNode;
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

  const form = useStoreForm(store);

  const onSubmit = async (data: StoreSchema) => {
    const result = await updateStoreAction({
      id: store?.id ?? "",
      store: data,
    });
    if (result.success) {
      toast.success("Obchod bol uložený");
    } else if (result.error === "SLUG_TAKEN") {
      toast.error("Slug je už použitý iným obchodom");
    } else {
      toast.error("Nepodarilo sa uložiť obchod");
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
                const media = await uploadMedia(file, "stores");
                return { id: media.id, url: media.url };
              }}
            />
            <TextField
              label="Názov obchodu"
              name="name"
              placeholder="Názov obchodu"
            />
            <SlugField label="Slug" name="slug" />
            <RichTextField label="Popis obchodu" name="description" />
          </FieldGroup>
          <FieldGroup className="gap-4">
            <TextField label="Telefón" name="phone" placeholder="Telefón" />
            <TextField label="Email" name="email" placeholder="Email" />
            <OpeningHoursField name="openingHours" />
          </FieldGroup>
          <FieldGroup className="grid grid-cols-2 gap-4">
            <SwitchField
              description="Je obchod aktívny?"
              label="Aktívny"
              name="isActive"
            />
            <QuantityField label="Poradie" name="sortOrder" />
          </FieldGroup>
        </FieldSet>
        {children({ isPending: form.formState.isSubmitting })}
      </form>
    </FormProvider>
  );
}
