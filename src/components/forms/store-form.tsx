"use client";

import { useStore } from "@tanstack/react-form";
import type { JSONContent } from "@tiptap/react";
import { format } from "date-fns";
import { Editor } from "@/components/editor";
import { OpeningHoursForm } from "@/components/shared/form/parts/opening-hours-form";
import { Field, FieldSet } from "@/components/ui/field";
import { useStoreForm } from "@/hooks/forms/use-store-form";
import type { Store } from "@/types/store";
import { SubmitButton } from "../shared/form/fields/submit-button";

export function StoreForm({ store }: { store: Store }) {
  const { form, isPending } = useStoreForm(store);

  const [canSubmit, isDirty] = useStore(form.store, (state) => [
    state.canSubmit,
    state.isDirty,
  ]);
  const disabled = isPending || !canSubmit || !isDirty;

  return (
    <div className="size-full">
      <form.AppForm>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-muted-foreground text-xs">
            {isPending
              ? "Ukladá sa..."
              : `Naposledy uložené ${format(store.updatedAt, "dd.MM.yyyy HH:mm")}`}
          </div>
        </div>
        <form
          id="store-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldSet className="h-full gap-4">
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
              {(field) => <field.TextField label="Phone" placeholder="Phone" />}
            </form.AppField>
            <form.AppField name="email">
              {(field) => <field.TextField label="Email" placeholder="Email" />}
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

            <OpeningHoursForm fields="openingHours" form={form} />
            <SubmitButton
              className="mt-auto self-end"
              disabled={disabled}
              form="store-form"
              size="sm"
              type="submit"
            >
              {isPending ? "Ukladám..." : "Uložiť"}
            </SubmitButton>
          </FieldSet>
        </form>
      </form.AppForm>
    </div>
  );
}
