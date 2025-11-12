/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
"use client";

import { useStore } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Editor } from "@/components/editor";
import { useAppForm } from "@/components/shared/form";
import {
  Field,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { useDebounce } from "@/hooks/use-debounce";
import { useTRPC } from "@/trpc/client";
import type { StoreById } from "@/types/store";

const AUTOSAVE_DELAY_MS = 1000;

export function StoreForm({ store }: { store: NonNullable<StoreById> }) {
  const trpc = useTRPC();
  const { mutateAsync: updateStore, isPending } = useMutation(
    trpc.admin.stores.update.mutationOptions({
      onSuccess: () => {
        toast.success("Store updated successfully");
        // Reset dirty state after successful save
        form.reset(form.state.values);
      },
    })
  );

  const handleSubmit = useCallback(async () => {
    await updateStore({
      id: store.id,
      store: {},
    });
  }, [store.id, updateStore, store]);

  const form = useAppForm({
    defaultValues: {
      name: store.name,
      slug: store.slug,
      description: store.description,
      phone: store.phone,
      email: store.email,
      isActive: store.isActive,
      sortOrder: store.sortOrder,
    },
    // validators: {
    //   onSubmit: storeSchema,
    // },
    onSubmit: handleSubmit,
  });
  // Autosave logic
  const canSubmit = useStore(form.store, (state) => state.canSubmit);
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const debouncedDirty = useDebounce(isDirty, AUTOSAVE_DELAY_MS);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!(canSubmit && debouncedDirty) || isSubmitting || isPending) {
      return;
    }
    form.handleSubmit();
  }, [debouncedDirty, canSubmit, isSubmitting, isPending]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet className="gap-3">
        <form.AppField name="name">
          {(field) => <field.EditableField label="Name" placeholder="Name" />}
        </form.AppField>
        <FieldSeparator />
        <form.AppField name="slug">
          {(field) => <field.EditableField label="Slug" placeholder="Slug" />}
        </form.AppField>

        <FieldGroup>
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
        </FieldGroup>
        <form.AppField name="phone">
          {(field) => <field.EditableField label="Phone" placeholder="Phone" />}
        </form.AppField>
        <form.AppField name="email">
          {(field) => <field.EditableField label="Email" placeholder="Email" />}
        </form.AppField>
        <form.AppField name="isActive">
          {(field) => (
            <field.ToggleField
              description="Is the store active?"
              label="Active"
            />
          )}
        </form.AppField>
        <form.AppField name="sortOrder">
          {(field) => <field.QuantitySetterField label="Sort Order" min={0} />}
        </form.AppField>
      </FieldSet>
    </form>
  );
}
