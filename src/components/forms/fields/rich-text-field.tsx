"use client";

import dynamic from "next/dynamic";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Editor = dynamic(
  () => import("@/widgets/editor/editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-32 w-full" />,
  }
);

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
