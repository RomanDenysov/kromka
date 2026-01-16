"use client";

import type { FieldPath, FieldValues } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Max length: +421XXXXXXXXX = 16 chars (with spaces) */
const MAX_PHONE_LENGTH = 16;

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

export function PhoneField<T extends FieldValues>({
  name,
  label,
  placeholder = "+421 900 000 000",
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
            autoComplete="tel"
            className={cn("max-w-xs", inputClassName)}
            inputMode="tel"
            maxLength={MAX_PHONE_LENGTH}
            placeholder={placeholder}
            type="tel"
            volume="xs"
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
