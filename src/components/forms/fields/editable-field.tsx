"use client";

import { CheckIcon, EditIcon, XIcon } from "lucide-react";
import type { FieldPath } from "react-hook-form";
import { Controller, type FieldValues, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Editable,
  EditableArea,
  EditableCancel,
  EditableInput,
  EditablePreview,
  EditableSubmit,
  EditableToolbar,
  EditableTrigger,
} from "@/components/ui/editable";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Props<T extends FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  onSubmit?: (value: string) => void;
};

export function EditableField<T extends FieldValues>({
  name,
  label,
  placeholder,
  className,
  onSubmit,
}: Props<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const isInvalid = fieldState.invalid;
        const value = (field.value as string) ?? "";

        const handleSubmit = (newValue: string) => {
          if (onSubmit) {
            onSubmit(newValue);
          } else {
            field.onChange(newValue);
          }
        };

        return (
          <Field data-invalid={isInvalid}>
            {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
            <Editable
              className="group flex w-full flex-row items-center justify-start gap-2"
              editing={isInvalid}
              onSubmit={handleSubmit}
              placeholder={placeholder}
              value={value}
            >
              <EditableArea className="flex-1 md:text-2xl">
                <EditablePreview className={cn("w-full", className)} />
                <EditableInput className={cn("w-full", className)} />
              </EditableArea>

              <EditableTrigger asChild>
                <Button
                  className="hidden group-hover:flex"
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <EditIcon className="text-muted-foreground" />
                </Button>
              </EditableTrigger>

              <EditableToolbar className="gap-1">
                <EditableSubmit asChild>
                  <Button size="icon-xs" type="button" variant="outline">
                    <CheckIcon />
                  </Button>
                </EditableSubmit>
                <EditableCancel asChild>
                  <Button size="icon-xs" type="button" variant="outline">
                    <XIcon />
                  </Button>
                </EditableCancel>
              </EditableToolbar>
            </Editable>
            {isInvalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}
