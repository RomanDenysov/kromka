"use client";

import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { cn, formatCentsToPrice } from "@/lib/utils";
import { MaskInput } from "@/shared/ui/mask-input";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
};

export function PriceField<T extends FieldValues>({
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
          className={cn("gap-1", className)}
          data-invalid={fieldState.invalid}
        >
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <MaskInput
            aria-invalid={fieldState.invalid}
            className="h-7 max-w-xs px-1.5 py-0.5 text-xs md:text-sm"
            currency="EUR"
            id={field.name}
            locale="sk-SK"
            mask="currency"
            name={field.name}
            onBlur={field.onBlur}
            onValueChange={(_maskedValue, unmaskedValue) => {
              const price = Number.parseFloat(unmaskedValue);
              if (Number.isNaN(price)) {
                field.onChange(0);
                return;
              }
              const cents = Math.round(price * 100);
              field.onChange(cents);
            }}
            value={formatCentsToPrice(field.value).toString()}
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
