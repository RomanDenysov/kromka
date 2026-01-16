"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  max?: number;
  min?: number;
};

export function QuantitySetterField<T extends FieldValues>({
  name,
  label,
  max = 1000,
  min = 0,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const isInvalid = fieldState.invalid;
        const value = (field.value as number) ?? 0;

        const handleIncrement = () => {
          field.onChange(Math.min(value + 1, max));
        };

        const handleDecrement = () => {
          field.onChange(Math.max(value - 1, min));
        };

        return (
          <Field
            className="max-w-md rounded-md border bg-card p-3"
            data-invalid={isInvalid}
            orientation="horizontal"
          >
            {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
            <ButtonGroup
              aria-label="Quantity setter"
              className="w-fit"
              orientation="horizontal"
            >
              <Button
                className="size-6"
                disabled={value <= min}
                onClick={handleDecrement}
                size="icon-xs"
                type="button"
                variant="outline"
              >
                <MinusIcon className="size-3" />
              </Button>
              <Input
                className="h-6 w-full max-w-12 text-wrap bg-background text-center font-mono"
                id={field.name}
                max={max}
                min={min}
                name={field.name}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(Number(e.target.value))}
                pattern="[0-9]*"
                type="text"
                value={value}
                volume="xs"
              />

              <Button
                className="size-6"
                disabled={value >= max}
                onClick={handleIncrement}
                size="icon-xs"
                type="button"
                variant="outline"
              >
                <PlusIcon className="size-3" />
              </Button>
            </ButtonGroup>
            {isInvalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
