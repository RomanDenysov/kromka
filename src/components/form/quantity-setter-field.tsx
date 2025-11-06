"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useCallback } from "react";
import { useFieldContext } from "@/components/form";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "../ui/button-group";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

type Props = {
  label?: string;
  max?: number;
  min?: number;
};
export function QuantitySetterField({ label, max = 1000, min = 0 }: Props) {
  const field = useFieldContext<number>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleIncrement = useCallback(() => {
    const value = (field.state.value ?? 0) + 1;
    if (value > max) {
      field.handleChange(max);
    } else {
      field.handleChange(value);
    }
  }, [field, max]);

  const handleDecrement = useCallback(() => {
    const value = (field.state.value ?? 0) - 1;
    if (value < min) {
      field.handleChange(min);
    } else {
      field.handleChange(value);
    }
  }, [field, min]);

  return (
    <Field className="w-fit" data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <ButtonGroup
        aria-label="Quantity setter"
        className="w-fit"
        orientation="horizontal"
      >
        <Button
          onClick={handleDecrement}
          size="icon-xs"
          type="button"
          variant="outline"
        >
          <MinusIcon />
        </Button>
        <Input
          className="w-full max-w-12 text-wrap bg-background text-center font-mono"
          id={field.name}
          max={max}
          min={min}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(Number(e.target.value))}
          pattern="[0-9]*"
          type="text"
          value={field.state.value ?? 0}
          volume="xs"
        />

        <Button
          onClick={handleIncrement}
          size="icon-xs"
          type="button"
          variant="outline"
        >
          <PlusIcon />
        </Button>
      </ButtonGroup>
    </Field>
  );
}
