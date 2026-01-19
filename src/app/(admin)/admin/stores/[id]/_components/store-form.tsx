"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { AddressAutocompleteField } from "@/components/forms/fields/address-autocomplete-field";
import { ImageUploadField } from "@/components/forms/fields/image-upload-field";
import { OpeningHoursField } from "@/components/forms/fields/opening-hours-field";
import { QuantityField } from "@/components/forms/fields/quantity-field";
import { RichTextField } from "@/components/forms/fields/rich-text-field";
import { SlugField } from "@/components/forms/fields/slug-field";
import { SwitchField } from "@/components/forms/fields/switch-field";
import { TextField } from "@/components/forms/fields/text-field";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { updateStoreAction } from "@/features/stores/api/actions";
import type { AdminStore } from "@/features/stores/api/queries";
import type { StoreSchema } from "@/lib/stores/types";
import { storeSchema } from "@/lib/stores/validation";
import { cn } from "@/lib/utils";

type Props = {
  store: AdminStore;
  children: (props: { isPending: boolean }) => ReactNode;
  className?: string;
};

export function StoreForm({ store, children, className }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  useHotkeys(
    "mod+s",
    (e) => {
      e.preventDefault();
      formRef.current?.requestSubmit();
    },
    { enableOnFormTags: true }
  );

  const form = useForm<StoreSchema>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: store?.name ?? "",
      slug: store?.slug ?? "",
      description: store?.description ?? null,
      phone: store?.phone ?? "",
      email: store?.email ?? "kromka@kavejo.sk",
      isActive: store?.isActive ?? false,
      sortOrder: store?.sortOrder ?? 0,
      imageId: store?.imageId ?? null,
      address: store?.address ?? null,
      latitude: store?.latitude ?? null,
      longitude: store?.longitude ?? null,
      openingHours: store?.openingHours ?? {
        regularHours: {
          monday: "closed",
          tuesday: "closed",
          wednesday: "closed",
          thursday: "closed",
          friday: "closed",
          saturday: "closed",
          sunday: "closed",
        },
        exceptions: {},
      },
    },
  });

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
        <FieldSet
          className={cn(
            "grid @xl/page:max-w-5xl max-w-full gap-6 @lg/page:p-5 @xl/page:p-8 p-4",
            className
          )}
        >
          <FieldGroup className="grid @xl/page:grid-cols-4 grid-cols-2 @xl/page:gap-6 gap-3">
            <ImageUploadField
              className="@xl/page:col-span-3 col-span-full @xl/page:row-span-2"
              folder="stores"
              imageUrl={store.image?.url}
              name="imageId"
            />
            <TextField
              label="Názov obchodu"
              name="name"
              placeholder="Názov obchodu"
            />
            <SlugField label="Slug" name="slug" />
            <RichTextField label="Popis obchodu" name="description" />
          </FieldGroup>
          <FieldGroup className="grid @xl/page:grid-cols-4 grid-cols-2 @xl/page:gap-6 gap-3">
            <TextField label="Telefón" name="phone" placeholder="Telefón" />
            <TextField label="Email" name="email" placeholder="Email" />
            <OpeningHoursField
              className="@xl/page:col-span-2 col-span-full"
              name="openingHours"
            />
          </FieldGroup>
          <FieldGroup className="grid @xl/page:grid-cols-4 grid-cols-2 @xl/page:gap-6 gap-3">
            <AddressAutocompleteField
              className="col-span-full"
              description="Vyhladajte adresu a automaticky vyplnte polia"
              label="Vyhladať adresu"
              name="address"
            />
            <TextField
              label="Ulica"
              name="address.street"
              placeholder="Ulica a číslo"
            />
            <TextField label="Mesto" name="address.city" placeholder="Mesto" />
            <TextField
              label="PSČ"
              name="address.postalCode"
              placeholder="PSČ"
            />
            <TextField
              label="Krajina"
              name="address.country"
              placeholder="Krajina"
            />
          </FieldGroup>
          <FieldGroup className="flex h-fit flex-row gap-3">
            <SwitchField
              className="grow"
              description="Je obchod aktívny?"
              label="Aktívny"
              name="isActive"
            />
            <QuantityField
              className="flex-1 shrink-0"
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
