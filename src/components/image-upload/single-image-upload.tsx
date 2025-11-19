"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon, Loader2, X } from "lucide-react";
import { type ChangeEvent, useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { ImageCrop } from "./image-crop";

type SingleImageUploadProps = {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  className?: string;
  aspect?: number;
};

const KB = 1024;
const MB = 4;
const IMAGE_SIZE_MB = MB * KB * KB;

export function SingleImageUpload({
  value,
  onChange,
  disabled,
  className,
  aspect = 1,
}: SingleImageUploadProps) {
  const trpc = useTRPC();
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // Fetch current image details if ID is present
  const { data: media, isLoading } = useQuery(
    trpc.admin.media.byId.queryOptions(
      { id: value ?? "" },
      { enabled: !!value }
    )
  );

  // Mutation to save metadata to DB
  const { mutateAsync: uploadMedia, isPending: isUploadingMedia } = useMutation(
    trpc.admin.media.upload.mutationOptions({
      onSuccess: (data) => {
        toast.success("Obrázok úspešne nahraný");
        setFileToUpload(null);
        // Update the form with the new media ID
        if (data?.[0]?.id) {
          onChange(data[0].id);
        }
      },
      onError: () => {
        toast.error("Nepodarilo sa nahrať obrázok");
      },
    })
  );

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Prosím vyberte súbor s obrázkom");
      return;
    }

    if (file.size > IMAGE_SIZE_MB) {
      toast.error(`Veľkosť obrázka musí byť menšia ako ${MB}MB`);
      return;
    }

    setFileToUpload(file);
    // Reset input
    e.target.value = "";
  }, []);

  const handleApply = useCallback(
    async (croppedFile: File) => {
      try {
        // 1. Upload to storage (R2/S3)
        const result = await uploadImage(croppedFile, "general");
        const { url, pathname, size, type } = result.data;

        // 2. Save metadata to DB
        await uploadMedia({
          name: croppedFile.name,
          path: pathname,
          type,
          url,
          size,
        });
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Logging error for debugging
        console.error(error);
        toast.error("Chyba pri nahrávaní súboru");
      }
    },
    [uploadMedia]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onChange(null);
    },
    [onChange]
  );

  // Render State 1: Cropping Modal
  if (fileToUpload) {
    return (
      <ImageCrop
        aspect={aspect}
        file={fileToUpload}
        isUploading={isUploadingMedia}
        onApply={handleApply}
        onCancel={() => setFileToUpload(null)}
      />
    );
  }

  // Render State 2: Loading existing image
  if (value && isLoading) {
    return (
      <div
        className={cn(
          "flex h-40 w-40 items-center justify-center rounded-md border bg-muted",
          className
        )}
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render State 3: Display Image
  if (value && media) {
    return (
      <div
        className={cn(
          "group relative h-40 w-40 overflow-hidden rounded-md border",
          className
        )}
        style={{ aspectRatio: aspect }}
      >
        {/* biome-ignore lint/correctness/useImageSize: Image size varies by user upload */}
        {/* biome-ignore lint/performance/noImgElement: Simple img tag is sufficient for admin preview */}
        <img
          alt={media.name}
          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
          src={media.url}
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <label className="cursor-pointer rounded-md bg-secondary px-3 py-1.5 font-medium text-secondary-foreground text-xs hover:bg-secondary/80">
            Zmeniť
            <input
              accept="image/*"
              className="hidden"
              disabled={disabled || isUploadingMedia}
              onChange={handleFileSelect}
              type="file"
            />
          </label>
        </div>

        {/* Remove Button */}
        <Button
          className="-right-2 -top-2 absolute size-6 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          disabled={disabled}
          onClick={handleRemove}
          size="icon"
          type="button"
          variant="destructive"
        >
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  // Render State 4: Empty / Upload Placeholder
  return (
    <div className={cn("h-40 w-40", className)} style={{ aspectRatio: aspect }}>
      <label
        className={cn(
          "flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 transition-colors hover:bg-muted",
          (disabled || isUploadingMedia) && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {isUploadingMedia ? (
            <Loader2 className="size-8 animate-spin" />
          ) : (
            <ImageIcon className="size-8" />
          )}
          <span className="font-medium text-xs">Nahrať obrázok</span>
        </div>
        <input
          accept="image/*"
          className="hidden"
          disabled={disabled || isUploadingMedia}
          onChange={handleFileSelect}
          type="file"
        />
      </label>
    </div>
  );
}
