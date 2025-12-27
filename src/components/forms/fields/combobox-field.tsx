"use client";

import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { ComboboxInput } from "@/components/shared/combobox-input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
  options: Option[];
};

export function ComboboxField<T extends FieldValues>({
  name,
  label,
  description,
  className,
  options,
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
          <FieldContent className="gap-0.5">
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description && (
              <FieldDescription className="text-muted-foreground text-xs">
                {description}
              </FieldDescription>
            )}
          </FieldContent>
          <ComboboxInput
            onChange={field.onChange}
            options={options}
            value={field.value ?? null}
          />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
