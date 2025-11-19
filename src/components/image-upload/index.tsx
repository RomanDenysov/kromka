"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";
import { useTRPC } from "@/trpc/client";
import { ImageCrop } from "./image-crop";
import { ImageInput } from "./image-input";
import { SortableImageItem } from "./sortable-image-item";

// biome-ignore lint/performance/noBarrelFile: <explanation>
export { SingleImageUpload } from "./single-image-upload";

// TODO: Move to constants file
const KB = 1024;
const MB = 4;
const IMAGE_SIZE_MB = MB * KB * KB;

export function ImageUpload({ productId }: { productId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { data: images, isLoading: isLoadingImages } = useQuery(
    trpc.admin.products.images.queryOptions(
      { productId },
      { enabled: !!productId }
    )
  );
  const { mutateAsync: uploadMedia, isPending: isUploadingMedia } = useMutation(
    trpc.admin.media.upload.mutationOptions({
      onSuccess: () => {
        toast.success("Image uploaded successfully");
        setFileToUpload(null);
        queryClient.invalidateQueries({
          queryKey: trpc.admin.products.images.queryKey({ productId }),
        });
      },
      onError: (_error) => {
        toast.error("Failed to upload image");
      },
    })
  );
  const processedImages = useMemo(
    () => (images as ProductImage[]) ?? [],
    [images]
  );

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > IMAGE_SIZE_MB) {
      toast.error(`Image size must be less than ${MB}MB`);
      return;
    }

    setFileToUpload(file);

    if (e.target.value) {
      e.target.value = "";
    }
  }, []);

  const handleApply = useCallback(
    async (croppedFile: File) => {
      const result = await uploadImage(croppedFile, "products");
      const { url, pathname, size, type } = result.data;
      await uploadMedia({
        name: croppedFile.name,
        path: pathname,
        type,
        url,
        size,
      });
    },
    [uploadMedia]
  );

  return (
    <div className="space-y-4">
      {fileToUpload && (
        <ImageCrop
          file={fileToUpload}
          isUploading={isUploadingMedia}
          onApply={handleApply}
          onCancel={() => setFileToUpload(null)}
        />
      )}
      <ImagesSortable
        disabled={isUploadingMedia || isLoadingImages}
        images={processedImages}
        onChange={handleFileSelect}
      />
    </div>
  );
}

function ImagesSortable({
  images,
  onChange,
  disabled,
}: {
  images: ProductImage[];
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
  }, []);
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SortableContext
          items={images.map((img) => img.mediaId)}
          strategy={rectSortingStrategy}
        >
          {images.map((image) => (
            <SortableImageItem
              disabled={disabled}
              image={image}
              key={image.mediaId}
              onRemove={() => image.mediaId}
            />
          ))}
        </SortableContext>
        <ImageInput disabled={disabled} onChange={onChange} />
      </div>
    </DndContext>
  );
}
