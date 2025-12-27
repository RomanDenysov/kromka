"use client";

import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { Editor } from "@/components/editor/editor";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  variant?: "simple" | "full";
};

export function RichTextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  className,
  variant = "simple",
}: Props<T>) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          className={cn(
            "@xl/page:col-span-full col-span-full @xl/page:row-span-2 row-span-2 gap-1 overflow-y-hidden",
            className
          )}
          data-invalid={fieldState.invalid}
        >
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Editor
            className="min-h-30"
            content={field.value ?? undefined}
            onBlur={field.onBlur}
            onChange={(content) => field.onChange(content)}
            placeholder={placeholder}
            variant={variant}
          />
          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
