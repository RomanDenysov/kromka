"use client";

import { Controller, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
};

export function TextField({ name, label, placeholder, description }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{label}</FieldLabel>
          <Input
            {...field}
            aria-invalid={fieldState.invalid}
            className="h-8 max-w-xs"
            id={field.name}
            name={name}
            placeholder={placeholder}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
