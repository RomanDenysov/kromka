"use client";

import { format } from "date-fns";
import { MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useTransition } from "react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { useFormAutoSave } from "@/hooks/use-form-auto-save";
import { updateStoreAction } from "@/lib/actions/stores";
import { getSlug } from "@/lib/get-slug";
import type { Store } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";
import { storeSchema } from "@/validation/stores";
import { SingleImageUpload } from "../image-upload/single-image-upload";
import { useAppForm } from "../shared/form";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { TestHoursField } from "./stores/test-hours-field";

// biome-ignore lint/style/noMagicNumbers: Image aspect ratio
const IMAGE_ASPECT_RATIO = 16 / 9;

export function StoreForm({
  store,
  className,
}: {
  store: Store;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useAppForm({
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
      // Initialize openingHours with fallback (though DB provides default)
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
    listeners: {
      onChangeDebounceMs: 5000,
      onChange: ({ formApi }) => {
        if (formApi.state.isValid && !formApi.state.isSubmitting) {
          formApi.handleSubmit();
        }
      },
    },
    validators: {
      onSubmit: storeSchema,
    },
    onSubmit: ({ value }) =>
      startTransition(async () => {
        await updateStoreAction({ id: store.id, store: value });
      }),
  });

  const { formRef, onBlurCapture, onFocusCapture } = useFormAutoSave(form, {
    blurDelay: 1000,
  });

  return (
    <div className={cn(className)}>
      <form.AppForm>
        <form
          aria-disabled={isPending}
          id="store-form"
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
                <FieldLegend>Nastavenie obchodu</FieldLegend>
                <FieldDescription className="text-[10px]">
                  {isPending
                    ? "Ukladá sa..."
                    : `Naposledy uložené ${format(
                        store.updatedAt ?? new Date(),
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
                    label="Názov obchodu"
                    placeholder="Názov obchodu"
                  />
                )}
              </form.AppField>
              <form.AppField name="slug">
                {(field) => <field.TextField label="Slug" placeholder="Slug" />}
              </form.AppField>
              <form.AppField name="description">
                {(field) => <field.RichTextField label="Popis obchodu" />}
              </form.AppField>
            </FieldGroup>
            <FieldGroup className="gap-4">
              <form.AppField name="phone">
                {(field) => (
                  <field.TextField label="Phone" placeholder="Phone" />
                )}
              </form.AppField>
              <form.AppField name="email">
                {(field) => (
                  <field.TextField label="Email" placeholder="Email" />
                )}
              </form.AppField>
              <form.AppField name="openingHours">
                {(field) => (
                  <TestHoursField
                    onChange={(value) => field.handleChange(value)}
                    value={field.state.value}
                  />
                )}
              </form.AppField>
            </FieldGroup>
            <FieldGroup className="grid grid-cols-2 gap-4">
              <form.AppField name="isActive">
                {(field) => (
                  <field.SwitchField
                    description="Je obchod aktívny?"
                    label="Aktívny"
                  />
                )}
              </form.AppField>
              <form.AppField name="sortOrder">
                {(field) => (
                  <field.QuantitySetterField label="Sort Order" min={0} />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </form>
      </form.AppForm>
    </div>
  );
}
