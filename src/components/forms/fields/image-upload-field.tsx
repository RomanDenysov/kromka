"use client";

import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import { MediaInput } from "@/components/shared/media-input";

type MediaFolder = "products" | "categories" | "stores" | "posts" | "hero";

interface ImageUploadFieldProps<T extends FieldValues> {
  className?: string;
  disabled?: boolean;
  folder: MediaFolder;
  imageUrl?: string;
  name: FieldPath<T>;
}

/**
 * Form field wrapper for MediaInput.
 * Stores only the media ID in the form field.
 */
export function ImageUploadField<T extends FieldValues>({
  name,
  imageUrl,
  folder,
  disabled = false,
  className,
}: ImageUploadFieldProps<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <MediaInput
          className={className}
          disabled={disabled}
          folder={folder}
          imageUrl={imageUrl}
          onChange={field.onChange}
        />
      )}
    />
  );
}
