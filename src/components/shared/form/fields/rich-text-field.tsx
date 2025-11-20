"use client";

import type { JSONContent } from "@tiptap/react";
import { useCallback } from "react";
import { Editor } from "@/components/editor";
import { useFieldContext } from "@/components/shared/form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

type Props = {
  label?: string;
  placeholder?: string;
  className?: string;
  variant?: "simple" | "full";
};

export function RichTextField({
  label,
  placeholder,
  className,
  variant = "simple",
}: Props) {
  const field = useFieldContext<JSONContent | null | undefined>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleUpdate = useCallback(
    (
      editor: Parameters<
        NonNullable<React.ComponentProps<typeof Editor>["onUpdate"]>
      >[0]
    ) => {
      const jsonContent = editor.getJSON();
      field.handleChange(jsonContent);
    },
    [field]
  );

  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <div className="rounded-md border border-input bg-background">
        <Editor
          className="prose prose-sm min-h-[120px] max-w-none rounded-md px-4 py-3 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          content={field.state.value ?? undefined}
          onBlur={field.handleBlur}
          onUpdate={handleUpdate}
          placeholder={placeholder}
          variant={variant}
        />
      </div>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
