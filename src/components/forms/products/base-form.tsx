"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Editor } from "@/components/editor";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getSlug } from "@/lib/get-slug";
import { cn } from "@/lib/utils";
import type { ProductFormValues } from ".";

export function BaseProductForm({ className }: { className?: string }) {
  const form = useFormContext<ProductFormValues>();
  return (
    <FieldGroup className={cn("max-w-sm p-3 xl:max-w-md", className)}>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="name">Názov</FieldLabel>
            <Input
              {...field}
              id="name"
              name="name"
              placeholder="Názov produktu"
              required
              volume="sm"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="slug"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>

            <Input
              {...field}
              id="slug"
              name="slug"
              onBlur={(e) => {
                const slugified = getSlug(e.target.value);
                if (slugified !== e.target.value) {
                  field.onChange(slugified);
                }
                field.onBlur();
              }}
              onChange={(e) => {
                field.onChange(e.target.value);
              }}
              placeholder="nazov-produktu"
              required
              volume="sm"
            />
            <FieldDescription>
              Slug je unikátny identifikátor produktu, ktorý sa používa v URL.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">Popis</FieldLabel>
            <Editor
              className="min-h-28 rounded-md border p-2"
              content={field.value ?? undefined}
              onUpdate={(content) => field.onChange(content)}
              placeholder="Popis produktu"
            />
          </Field>
        )}
      />
    </FieldGroup>
  );
}
