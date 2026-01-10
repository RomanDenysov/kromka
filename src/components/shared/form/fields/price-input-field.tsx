"use client";

import { useCallback, useState } from "react";
import { useFieldContext } from "@/components/shared/form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { formatCentsToPrice } from "@/lib/utils";

const CURRENCY_SYMBOL = "€";
const DECIMAL_SEPARATOR = ",";

type Props = {
  label?: string;
  className?: string;
  description?: string;
  placeholder?: string;
};

/** Formats cents to display string (e.g., 1250 → "12,50 €") */
function formatDisplayValue(cents: number | undefined): string {
  if (cents === undefined || cents === 0) {
    return "";
  }
  const price = formatCentsToPrice(cents);
  const formatted = price.toFixed(2).replace(".", DECIMAL_SEPARATOR);
  return `${formatted} ${CURRENCY_SYMBOL}`;
}

/** Parses user input to cents (e.g., "12,50" → 1250) */
function parseInputToCents(input: string): number {
  const cleaned = input
    .replace(CURRENCY_SYMBOL, "")
    .replace(/\s/g, "")
    .replace(DECIMAL_SEPARATOR, ".");
  const price = Number.parseFloat(cleaned);
  if (Number.isNaN(price)) {
    return 0;
  }
  return Math.round(price * 100);
}

export function PriceInputField({
  label,
  className,
  description,
  placeholder,
}: Props) {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const [displayValue, setDisplayValue] = useState(() =>
    formatDisplayValue(field.state.value)
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      // Allow only digits, comma, dot, euro symbol, and spaces while typing
      const filtered = raw.replace(/[^\d.,€\s]/g, "");
      setDisplayValue(filtered);

      const cents = parseInputToCents(filtered);
      field.handleChange(cents);
    },
    [field]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      field.handleBlur();
      // Format display value on blur
      const cents = parseInputToCents(event.target.value);
      setDisplayValue(formatDisplayValue(cents || undefined));
    },
    [field]
  );

  const handleFocus = useCallback(() => {
    // Strip formatting on focus for easier editing
    if (field.state.value) {
      const price = formatCentsToPrice(field.state.value);
      setDisplayValue(price.toFixed(2).replace(".", DECIMAL_SEPARATOR));
    }
  }, [field.state.value]);

  return (
    <Field
      className={className}
      data-invalid={isInvalid}
      orientation="responsive"
    >
      <FieldContent>
        {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
        {description && <FieldDescription>{description}</FieldDescription>}
      </FieldContent>
      <Input
        id={field.name}
        inputMode="decimal"
        name={field.name}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={
          placeholder ?? `0${DECIMAL_SEPARATOR}00 ${CURRENCY_SYMBOL}`
        }
        value={displayValue}
        volume="sm"
      />
    </Field>
  );
}
