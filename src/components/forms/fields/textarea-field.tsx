"use client";

import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props<T extends FieldValues> {
  className?: string;
  description?: string;
  label?: string;
  name: FieldPath<T>;
  placeholder?: string;
  rows?: number;
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  placeholder,
  description,
  className,
  rows,
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
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Textarea
            {...field}
            aria-invalid={fieldState.invalid}
            className="max-w-full p-1.5"
            placeholder={placeholder}
            rows={rows}
          />
          {description && (
            <FieldDescription className="text-muted-foreground text-xs">
              {description}
            </FieldDescription>
          )}
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
