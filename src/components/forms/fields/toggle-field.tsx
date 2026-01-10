"use client";

import { CheckIcon, XIcon } from "lucide-react";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  description?: string;
  className?: string;
};

export function ToggleField<T extends FieldValues>({
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
        const value = (field.value as boolean) ?? false;

        return (
          <Field className={cn("gap-0.5", className)} data-invalid={isInvalid}>
            <div className="flex w-full flex-1 flex-row gap-1">
              {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
              <Toggle
                className="group/toggle"
                id={field.name}
                name={field.name}
                onBlur={field.onBlur}
                onPressedChange={(pressed) => field.onChange(!!pressed)}
                pressed={value}
                size="sm"
              >
                <div className="items-center gap-0.5 group-data-[state=on]/toggle:flex group-data-[state=off]/toggle:hidden">
                  <CheckIcon /> Ano
                </div>
                <div className="items-center gap-0.5 group-data-[state=off]/toggle:flex group-data-[state=on]/toggle:hidden">
                  <XIcon />
                  Nie
                </div>
              </Toggle>
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            {isInvalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
