"use client";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
};

export function CheckboxField<T extends FieldValues>({
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
          className={className}
          data-invalid={fieldState.invalid}
          orientation="horizontal"
        >
          <Checkbox
            checked={field.value}
            id={field.name}
            onCheckedChange={field.onChange}
          />
          <FieldContent>
            <FieldLabel className="font-normal" htmlFor={field.name}>
              {label}
            </FieldLabel>
            {description && (
              <FieldDescription className="text-muted-foreground text-xs">
                {description}
              </FieldDescription>
            )}
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </FieldContent>
        </Field>
      )}
    />
  );
}
