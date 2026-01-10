"use client";

import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
};

export function DaysToggleField<T extends FieldValues>({
  name,
  label,
  description,
  className,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const isInvalid = fieldState.invalid;
        const value = (field.value as string[]) ?? [];

        return (
          <Field className={className} data-invalid={isInvalid}>
            {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
            {description && <FieldDescription>{description}</FieldDescription>}

            <ToggleGroup
              onValueChange={(values) => field.onChange(values)}
              size="sm"
              type="multiple"
              value={value}
            >
              <ToggleGroupItem value="monday">po</ToggleGroupItem>
              <ToggleGroupItem value="tuesday">ut</ToggleGroupItem>
              <ToggleGroupItem value="wednesday">st</ToggleGroupItem>
              <ToggleGroupItem value="thursday">št</ToggleGroupItem>
              <ToggleGroupItem value="friday">pi</ToggleGroupItem>
              <ToggleGroupItem value="saturday">so</ToggleGroupItem>
              <ToggleGroupItem value="sunday">ne</ToggleGroupItem>
            </ToggleGroup>

            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
