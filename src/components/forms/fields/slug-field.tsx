"use client";

import { RefreshCwIcon } from "lucide-react";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  className?: string;
};

export function SlugField<T extends FieldValues>({
  name,
  label = "Slug",
  placeholder,
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
          <InputGroup className="h-7 max-w-xs py-0.5 text-xs md:text-sm">
            <InputGroupInput
              {...field}
              aria-invalid={fieldState.invalid}
              className="px-1.5"
              placeholder={placeholder}
            />
            <InputGroupButton size="icon-xs" type="button" variant="ghost">
              <RefreshCwIcon className="size-3" />
            </InputGroupButton>
          </InputGroup>
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
