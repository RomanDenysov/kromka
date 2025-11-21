"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";
import { useTRPC } from "@/trpc/client";
import { ImageCrop } from "./image-crop";
import { ImageInput } from "./image-input";
import { SortableImageItem } from "./sortable-image-item";

// biome-ignore lint/performance/noBarrelFile: Only specific exports
export { SingleImageUpload } from "./single-image-upload";

export type ProductImageType = {
  mediaId: string;
  sortOrder: number;
  isPrimary: boolean;
  media: {
    id: string;
    name: string;
    url: string;
    path: string;
    type: string;
    size: number;
  };
  productId: string;
};

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
    trpc.admin.products.createImageRecord.mutationOptions({
      onSuccess: (newImage) => {
        toast.success("Obrázok úspešne nahraný");
        setFileToUpload(null);

        if (newImage) {
          queryClient.setQueryData(
            trpc.admin.products.images.queryKey({ productId }),
            (oldData) => {
              // biome-ignore lint/suspicious/noExplicitAny: Type compatibility
              const newItem = newImage as any;
              return oldData ? [...oldData, newItem] : [newItem];
            }
          );
        }

        queryClient.invalidateQueries({
          queryKey: trpc.admin.products.images.queryKey({ productId }),
        });
      },
      onError: (error) => {
        toast.error(`Chyba pri nahrávaní: ${error.message}`);
      },
    })
  );

  const { mutate: updateSortOrder } = useMutation(
    trpc.admin.products.updateImageSortOrder.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.admin.products.images.queryKey({ productId }),
        });
      },
      onError: () => {
        toast.error("Nepodarilo sa aktualizovať poradie");
      },
    })
  );

  const { mutate: deleteImage } = useMutation(
    trpc.admin.products.deleteImage.mutationOptions({
      onSuccess: () => {
        toast.success("Obrázok odstránený");
        queryClient.invalidateQueries({
          queryKey: trpc.admin.products.images.queryKey({ productId }),
        });
      },
      onError: (error) => {
        toast.error(`Chyba pri odstraňovaní: ${error.message}`);
      },
    })
  );

  const processedImages = useMemo(() => images ?? [], [images]);

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

    if (e.target.value) {
      e.target.value = "";
    }
  }, []);

  const handleApply = useCallback(
    async (croppedFile: File) => {
      const result = await uploadImage(croppedFile, "products");
      const { url, pathname, size } = result.data;

      await uploadMedia({
        productId,
        blobUrl: url,
        blobPath: pathname,
        metadata: {
          filename: croppedFile.name,
          size,
          width: 0, // Metadata extraction not implemented on client side yet
          height: 0,
        },
      });
    },
    [uploadMedia, productId]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = processedImages.findIndex(
        (img) => img.mediaId === active.id
      );
      const newIndex = processedImages.findIndex(
        (img) => img.mediaId === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Optimistic update could be done here if we manage local state
        const newOrderIds = arrayMove(processedImages, oldIndex, newIndex).map(
          (img) => img.mediaId
        );
        updateSortOrder({ productId, mediaIds: newOrderIds });
      }
    },
    [processedImages, productId, updateSortOrder]
  );

  const handleRemove = useCallback(
    (mediaId: string) => {
      deleteImage({ productId, mediaId });
    },
    [deleteImage, productId]
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
        images={processedImages as unknown as ProductImageType[]}
        onChange={handleFileSelect}
        onDragEnd={handleDragEnd}
        onRemove={handleRemove}
      />
    </div>
  );
}

function ImagesSortable({
  images,
  onChange,
  disabled,
  onDragEnd,
  onRemove,
}: {
  images: ProductImageType[];
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  onDragEnd: (event: DragEndEvent) => void;
  onRemove: (mediaId: string) => void;
}) {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
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
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
        <ImageInput disabled={disabled} onChange={onChange} />
      </div>
    </DndContext>
  );
}
