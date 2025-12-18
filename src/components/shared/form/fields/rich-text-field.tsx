"use client";

import type { JSONContent } from "@tiptap/react";
import { useCallback } from "react";
import { Editor } from "@/components/editor/editor";
import { useFieldContext } from "@/components/shared/form";
import { Field, FieldLabel } from "@/components/ui/field";

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
    (content: JSONContent) => {
      field.handleChange(content);
    },
    [field]
  );

  return (
    <Field className={className} data-invalid={isInvalid}>
      {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
      <div className="rounded-md border border-input bg-background">
        <Editor
          className="prose prose-sm min-h-[120px] max-w-none px-2 py-1 focus-within:outline-none"
          content={field.state.value ?? undefined}
          onBlur={field.handleBlur}
          onChange={handleUpdate}
          placeholder={placeholder}
          variant={variant}
        />
      </div>
    </Field>
  );
}
