"use client";

import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { ImageInput } from "@/components/shared/image-input";

type ImageUploadFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  disabled?: boolean;
  className?: string;
  onUpload: (file: File) => Promise<{ id: string; url: string }>;
};

export function ImageUploadField<T extends FieldValues>({
  control,
  name,
  disabled,
  className,
  onUpload,
}: ImageUploadFieldProps<T>) {
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
