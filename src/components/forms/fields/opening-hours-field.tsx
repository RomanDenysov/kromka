"use client";

import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { TestHoursField } from "@/components/forms/stores/test-hours-field";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { StoreSchedule } from "@/db/types";
import { cn } from "@/lib/utils";

interface Props<T extends FieldValues> {
  className?: string;
  label?: string;
  name: FieldPath<T>;
}

export function OpeningHoursField<T extends FieldValues>({
  name,
  label = "Otváracie hodiny",
  className,
}: Props<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          className={cn("gap-1", className)}
          data-invalid={fieldState.invalid}
        >
          <FieldLabel>{label}</FieldLabel>
          <TestHoursField
            onChange={field.onChange}
            value={field.value as StoreSchedule}
          />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
