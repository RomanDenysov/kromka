"use client";

import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props<T extends FieldValues> {
  className?: string;
  description?: string;
  label?: string;
  name: FieldPath<T>;
}

export function SwitchField<T extends FieldValues>({
  name,
  label,
  description,
  className,
}: Props<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          className={cn("rounded-md border p-3", className)}
          data-invalid={fieldState.invalid}
          orientation="horizontal"
        >
          <FieldContent className="gap-0.5">
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description && (
              <FieldDescription className="text-xs">
                {description}
              </FieldDescription>
            )}
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
          <Switch
            aria-invalid={fieldState.invalid}
            checked={field.value}
            id={field.name}
            name={field.name}
            onCheckedChange={field.onChange}
          />
        </Field>
      )}
    />
  );
}
