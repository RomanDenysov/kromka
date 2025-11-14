/** biome-ignore-all lint/style/noMagicNumbers: Ignore magic numbers */
"use client";

import { useStore } from "@tanstack/react-form";
import type { JSONContent } from "@tiptap/react";
import { format } from "date-fns/format";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import type z from "zod";
import { Editor } from "@/components/editor";
import { useAppForm } from "@/components/shared/form";
import { OpeningHoursForm } from "@/components/shared/form/parts/opening-hours-form";
import { Field, FieldSet } from "@/components/ui/field";
import { useUpdateStore } from "@/hooks/mutations/use-update-store";
import type { Store } from "@/types/store";
import { storeSchema } from "@/validation/stores";

const AUTOSAVE_DELAY_MS = 1000;

export function StoreForm({ store }: { store: NonNullable<Store> }) {
  const { mutateAsync: updateStore, isPending } = useUpdateStore({
    onSuccess: () => {
      toast.success("Obchod aktualizovaný");
      form.reset(form.state.values);
    },
    onError: () => {
      toast.error("Nastala chyba pri aktualizácii obchodu");
    },
  });

  const handleSubmit = useCallback(
    async ({ value }: { value: z.infer<typeof storeSchema> }) => {
      await updateStore({
        id: store.id,
        store: value,
      });
    },
    [store.id, updateStore]
  );

  const form = useAppForm({
    defaultValues: {
      ...store,
    },
    validators: {
      onSubmit: storeSchema,
    },
    onSubmit: handleSubmit,
  });
  // Autosave logic
  const canSubmit = useStore(form.store, (state) => state.canSubmit);
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  const submitTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  useEffect(() => {
    // Очищаем предыдущий таймер
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    // Если форма грязная, валидная и не сабмитится сейчас
    if (isDirty && canSubmit && !isSubmitting && !isPending) {
      submitTimeoutRef.current = setTimeout(() => {
        form.handleSubmit();
      }, AUTOSAVE_DELAY_MS);
    }

    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, [isDirty, canSubmit, isSubmitting, isPending, form]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Ignore exhaustive dependencies
  useEffect(() => {
    return () => {
      if (form.state.isDirty && form.state.canSubmit) {
        // Используем beacon API для надёжной отправки при закрытии страницы
        form.handleSubmit();
      }
    };
  }, []);

  return (
    <form.AppForm>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {isPending
            ? "Ukladá sa..."
            : `Naposledy uložené ${format(store.updatedAt, "dd.MM.yyyy HH:mm")}`}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldSet>
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
        </FieldSet>
      </form>
    </form.AppForm>
  );
}
