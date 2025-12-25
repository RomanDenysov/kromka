"use client";

import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import { ImageInput } from "@/components/shared/image-input";

type ImageUploadFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  disabled?: boolean;
  className?: string;
  onUpload: (file: File) => Promise<{ id: string; url: string }>;
  value?: { id: string; url: string } | null;
};

export function ImageUploadField<T extends FieldValues>({
  name,
  disabled,
  className,
  onUpload,
  value: externalValue,
}: ImageUploadFieldProps<T>) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        // Use external value if provided, otherwise use field value
        // If field value is a string (imageId), we need external value for the URL
        const displayValue = externalValue ?? field.value;

        return (
          <ImageInput
            className={className}
            disabled={disabled ?? false}
            onChange={(newValue) => {
              // Store only the ID in the form field
              field.onChange(newValue?.id ?? null);
            }}
            onUpload={onUpload}
            value={displayValue}
          />
        );
      }}
    />
  );
}
