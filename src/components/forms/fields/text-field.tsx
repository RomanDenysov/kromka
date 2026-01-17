"use client";

import type { InputHTMLAttributes } from "react";
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
  maxLength?: number;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
};

export function TextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  description,
  className,
  inputClassName,
  maxLength,
  type = "text",
  inputMode,
  autoComplete,
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
            autoComplete={autoComplete}
            className={cn("max-w-none", inputClassName)}
            inputMode={inputMode}
            maxLength={maxLength}
            placeholder={placeholder}
            type={type}
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
