"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
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

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
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

type PriceInputInnerProps = {
  field: {
    value: unknown;
    onChange: (value: number) => void;
    onBlur: () => void;
    name: string;
  };
  isInvalid: boolean;
  label?: string;
  className?: string;
  description?: string;
  placeholder?: string;
};

function PriceInputInner({
  field,
  isInvalid,
  label,
  className,
  description,
  placeholder,
}: PriceInputInnerProps) {
  const cents = (field.value as number) ?? 0;
  const isFocusedRef = useRef(false);

  const [displayValue, setDisplayValue] = useState(() =>
    formatDisplayValue(cents)
  );

  // Sync display value when form value changes externally (e.g., form.setValue, form.reset)
  useEffect(() => {
    if (!isFocusedRef.current) {
      setDisplayValue(formatDisplayValue(cents || undefined));
    }
  }, [cents]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      // Allow only digits, comma, dot, euro symbol, and spaces while typing
      const filtered = raw.replace(/[^\d.,€\s]/g, "");
      setDisplayValue(filtered);

      const parsedCents = parseInputToCents(filtered);
      field.onChange(parsedCents);
    },
    [field]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false;
      field.onBlur();
      // Format display value on blur
      const parsedCents = parseInputToCents(event.target.value);
      setDisplayValue(formatDisplayValue(parsedCents || undefined));
    },
    [field]
  );

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    // Strip formatting on focus for easier editing
    if (cents) {
      const price = formatCentsToPrice(cents);
      setDisplayValue(price.toFixed(2).replace(".", DECIMAL_SEPARATOR));
    }
  }, [cents]);

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

export function PriceInputField<T extends FieldValues>({
  name,
  label,
  className,
  description,
  placeholder,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <PriceInputInner
          className={className}
          description={description}
          field={field}
          isInvalid={fieldState.invalid}
          label={label}
          placeholder={placeholder}
        />
      )}
    />
  );
}
