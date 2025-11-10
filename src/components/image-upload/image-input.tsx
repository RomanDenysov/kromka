"use client";

import { PlusIcon } from "lucide-react";
import { type ChangeEvent, useRef } from "react";

type Props = {
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function ImageInput({ disabled, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="aspect-square">
      <button
        aria-label="Upload image"
        className="flex size-full items-center justify-center rounded-md border-2 border-border border-dashed bg-muted/50 transition-colors hover:border-primary hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        <PlusIcon className="size-8 text-muted-foreground" />
        <span className="sr-only">Upload image</span>
      </button>
      <input
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={onChange}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}
