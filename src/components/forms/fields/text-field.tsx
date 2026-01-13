"use client";

import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  inputClassName?: string;
};

export function TextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  description,
  className,
  inputClassName,
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
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            {...field}
            aria-invalid={fieldState.invalid}
            className={cn("max-w-xs", inputClassName)}
            placeholder={placeholder}
            volume="xs"
          />
          {description && (
            <FieldDescription className="text-muted-foreground text-xs">
              {description}
            </FieldDescription>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
