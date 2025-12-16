"use client";

import { Controller, FormProvider } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useProductForm } from "./use-product-form";
import type { ProductSchema } from "./validation";

export function ProductForm() {
  const form = useProductForm();

  const onSubmit = (data: ProductSchema) => {
    // biome-ignore lint/suspicious/noConsole: Ignore it for now
    console.log(data);
  };
  return (
    <FormProvider {...form}>
      <form id="product-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldSet className="@md/page:max-w-md max-w-full gap-5 p-5">
          <FieldGroup className="grid max-w-xl grid-cols-2 gap-5">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Názov</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    className="h-8 max-w-xs"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      </form>
    </FormProvider>
  );
}
