"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { format } from "date-fns";
import { Editor } from "@/components/editor";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import { useTRPC } from "@/trpc/client";
import { type StoreSchema, storeSchema } from "@/validation/stores";
import { useAppForm } from "../shared/form";
import { FormSkeleton } from "../shared/form/form-skeleton";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Component is slightly complex due to form fields
export function StoreForm({ id }: { id: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: store, isLoading: isLoadingStore } = useSuspenseQuery(
    trpc.admin.stores.byId.queryOptions({ id })
  );
  const { mutate: updateStore, isPending: isPendingUpdateStore } = useMutation(
    trpc.admin.stores.update.mutationOptions({
      onSuccess: async (updatedStore) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.stores.byId.queryOptions({ id: updatedStore.id })
            .queryKey,
        });
      },
      onError: (error) => {
        // biome-ignore lint/suspicious/noConsole: TODO: Implement error handling
        console.error(error);
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      name: store?.name ?? "",
      slug: store?.slug ?? "",
      description: store?.description ?? null,
      phone: store?.phone ?? "",
      email: store?.email ?? "",
      isActive: store?.isActive ?? false,
      sortOrder: store?.sortOrder ?? 0,
      imageId: store?.imageId ?? null,
      address: (store?.address ?? null) as StoreSchema["address"],
      latitude: store?.latitude ?? null,
      longitude: store?.longitude ?? null,
    },
    validators: {
      onSubmit: storeSchema,
    },
    onSubmit: ({ value }) => updateStore({ id, store: value }),
  });

  if (isLoadingStore) {
    return <FormSkeleton />;
  }

  return (
    <div className="max-w-md p-3">
      <form.AppForm>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-muted-foreground text-xs">
            {isPendingUpdateStore || isLoadingStore
              ? "Ukladá sa..."
              : `Naposledy uložené ${format(
                  store?.updatedAt ?? new Date(),
                  "dd.MM.yyyy HH:mm"
                )}`}
          </div>
        </div>
        <form
          aria-disabled={isPendingUpdateStore}
          id="store-form"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldSet>
            <FieldGroup>
              <form.AppField name="name">
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
                {(field) => (
                  <Field className="w-full">
                    <Editor
                      content={field.state.value as JSONContent}
                      onUpdate={(content) => field.handleChange(content)}
                      placeholder="Description"
                      variant="full"
                    />
                  </Field>
                )}
              </form.AppField>
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

              {/* <OpeningHoursForm fields="openingHours" form={form} /> */}
            </FieldGroup>
            <form.SubmitButton
              className="mt-auto self-end"
              form="store-form"
              size="sm"
            />
          </FieldSet>
        </form>
      </form.AppForm>
    </div>
  );
}
