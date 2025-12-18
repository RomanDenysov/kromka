"use client";

import { format } from "date-fns";
import {
  MoreHorizontalIcon,
  RefreshCwIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { uploadMedia } from "@/lib/actions/media";
import { updateStoreAction } from "@/lib/actions/stores";
import { getSlug } from "@/lib/get-slug";
import type { AdminStore } from "@/lib/queries/stores";
import { cn } from "@/lib/utils";
import { storeSchema } from "@/validation/stores";
import { useAppForm } from "../shared/form";
import { ImageInput } from "../shared/image-input";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { TestHoursField } from "./stores/test-hours-field";

const _IMAGE_ASPECT_RATIO = 16 / 9;

export function StoreForm({
  store,
  className,
}: {
  store: AdminStore;
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
    validators: {
      onSubmit: storeSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const result = await updateStoreAction({ id: store.id, store: value });
        if (result.success) {
          toast.success("Obchod bol uložený");
        } else if (result.error === "SLUG_TAKEN") {
          toast.error("Slug je už použitý iným obchodom");
        } else {
          toast.error("Nepodarilo sa uložiť obchod");
        }
      });
    },
  });

  return (
    <div className={cn(className)}>
      <form.AppForm>
        <form
          aria-disabled={isPending}
          id="store-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldSet className="@md/page:max-w-md max-w-full gap-5">
            <div className="flex flex-row items-start justify-between">
              <div>
                <FieldLegend>Nastavenie obchodu</FieldLegend>
                <FieldDescription className="text-[10px]">
                  Naposledy uložené{" "}
                  {format(store.updatedAt ?? new Date(), "dd.MM.yyyy HH:mm")}
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
              <form.AppField name="imageId">
                {(field) => (
                  <Field className="flex flex-col gap-2">
                    <ImageInput
                      className="w-full"
                      disabled={isPending}
                      onChange={() => {
                        return;
                      }}
                      onUpload={async (file) => {
                        const media = await uploadMedia(file, "stores");
                        field.handleChange(media.id);
                        return { id: media.id, url: media.url };
                      }}
                      value={
                        field.state.value as { id: string; url: string } | null
                      }
                    />
                  </Field>
                )}
              </form.AppField>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Názov obchodu"
                    placeholder="Názov obchodu"
                  />
                )}
              </form.AppField>
              <form.AppField name="slug">
                {(field) => (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <field.TextField label="Slug" placeholder="Slug" />
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
