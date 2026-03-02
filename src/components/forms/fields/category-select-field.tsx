"use client";

import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { CategorySelector } from "@/components/category-selector";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { Category } from "@/features/categories/api/queries";

interface Props<T extends FieldValues> {
  categories: Category[];
  className?: string;
  label?: string;
  name: FieldPath<T>;
}

export function CategorySelectField<T extends FieldValues>({
  name,
  label,
  className,
  categories,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const isInvalid = fieldState.invalid;
        const selectedIds = (field.value as string[]) ?? [];

        return (
          <Field className={className} data-invalid={isInvalid}>
            {label && <FieldLabel>{label}</FieldLabel>}
            <CategorySelector
              categories={categories}
              onChange={(value) => field.onChange(value)}
              value={selectedIds}
            />
            {isInvalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
