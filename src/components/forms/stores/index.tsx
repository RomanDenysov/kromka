"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { JSONContent } from "@tiptap/react";
import { useParams } from "next/navigation";
import { Editor } from "@/components/editor";
import { useAppForm } from "@/components/shared/form";
import {
  Field,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { useTRPC } from "@/trpc/client";

export function StoreForm() {
  const params = useParams();
  const trpc = useTRPC();
  const { data: store } = useSuspenseQuery(
    trpc.admin.stores.byId.queryOptions({ id: params.id as string })
  );
  const form = useAppForm({
    defaultValues: { ...store },
    validators: {
      // onSubmit: storeFormSchema,
    },
    onSubmit: (values) => {
      // biome-ignore lint/suspicious/noConsole: TODO - implement mutation
      console.log("Form values:", values.value);
    },
  });
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
