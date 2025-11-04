"use client";

import { useParams } from "next/navigation";
import z from "zod";
import { useAppForm } from "@/components/form";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { useGetSuspenseProductById } from "../hooks/use-products-queries";

const MAX_NAME_LENGTH = 255;

const _productFormSchema = z.object({
  name: z.string().min(1).max(MAX_NAME_LENGTH),
  slug: z.string().min(1).max(MAX_NAME_LENGTH),
  sku: z.string().min(1).max(MAX_NAME_LENGTH),
});

export function ProductForm() {
  const params = useParams();
  const id = params.id as string;
  const { data: product } = useGetSuspenseProductById(id);
  const form = useAppForm({
    defaultValues: product,

    onSubmit: (values) => {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log(values);
    },
  });
  return (
    <form
      id="product-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet>
        <FieldGroup className="gap-2">
          <div className="flex flex-col gap-1">
            <form.AppField name="name">
              {(field) => (
                <field.EditableField className="font-medium text-xl md:text-2xl" />
              )}
            </form.AppField>
            <form.AppField name="slug">
              {(field) => <field.EditableField />}
            </form.AppField>
          </div>
          <form.AppField name="sku">
            {(field) => <field.TextField label="SKU" placeholder="Enter SKU" />}
          </form.AppField>
        </FieldGroup>
      </FieldSet>
      <form.AppForm>
        <form.SubmitButton className="mt-4" size="sm">
          Submit
        </form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
