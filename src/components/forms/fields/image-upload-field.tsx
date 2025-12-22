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
};

export function ImageUploadField<T extends FieldValues>({
  name,
  disabled,
  className,
  onUpload,
}: ImageUploadFieldProps<T>) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ImageInput
          className={className}
          disabled={disabled ?? false}
          onChange={field.onChange}
          onUpload={onUpload}
          value={field.value}
        />
      )}
    />
  );
}
