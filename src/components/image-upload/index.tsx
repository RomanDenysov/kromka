"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useCallback, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";
import { useTRPC } from "@/trpc/client";
import { ImageCrop } from "./image-crop";
import { ImageInput } from "./image-input";
import { SortableImageItem } from "./sortable-image-item";

export type ProductImageType = {
  mediaId: string;
  sortOrder: number;
  media: {
    id: string;
    name: string;
    url: string;
    path: string;
    type: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
  };
  productId: string;
};

const KB = 1024;
const MB = 4;
const IMAGE_SIZE_MB = MB * KB * KB;

function useProductImages(productId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.admin.products.images.queryKey({ productId });

  const { data: images, isLoading } = useQuery(
    trpc.admin.products.images.queryOptions(
      { productId },
      { enabled: !!productId }
    )
  );

  const uploadMutation = useMutation(
    trpc.admin.products.createImageRecord.mutationOptions({
      onSuccess: (newImage) => {
        toast.success("Obrázok úspešne nahraný");
        if (newImage) {
          queryClient.setQueryData<ProductImageType[]>(queryKey, (old) =>
            old
              ? [...old, newImage as unknown as ProductImageType]
              : [newImage as unknown as ProductImageType]
          );
        }
        queryClient.invalidateQueries({ queryKey });
      },
      onError: (error) => toast.error(`Chyba pri nahrávaní: ${error.message}`),
    })
  );

  const sortMutation = useMutation(
    trpc.admin.products.updateImageSortOrder.mutationOptions({
      onMutate: async ({ mediaIds }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey });

        // Snapshot the previous value
        const previousImages =
          queryClient.getQueryData<ProductImageType[]>(queryKey);

        // Optimistically update to the new value
        queryClient.setQueryData<ProductImageType[]>(queryKey, (old) => {
          if (!old) {
            return [];
          }

          const itemMap = new Map(old.map((item) => [item.mediaId, item]));
          return mediaIds
            .map((id) => itemMap.get(id))
            .filter((item): item is ProductImageType => item !== undefined);
        });

        return { previousImages };
      },
      onError: (_, __, context) => {
        toast.error("Nepodarilo sa aktualizovať poradie");
        // Rollback on error
        if (context?.previousImages) {
          queryClient.setQueryData<ProductImageType[]>(
            queryKey,
            context.previousImages
          );
        }
      },
      onSettled: () => {
        // Always refetch after error or success
        queryClient.invalidateQueries({ queryKey });
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.admin.products.deleteImage.mutationOptions({
      onMutate: async ({ mediaId }) => {
        await queryClient.cancelQueries({ queryKey });
        const previousImages =
          queryClient.getQueryData<ProductImageType[]>(queryKey);

        queryClient.setQueryData<ProductImageType[]>(queryKey, (old) =>
          old ? old.filter((img) => img.mediaId !== mediaId) : []
        );

        return { previousImages };
      },
      onSuccess: () => toast.success("Obrázok odstránený"),
      onError: (error, _, context) => {
        toast.error(`Chyba pri odstraňovaní: ${error.message}`);
        if (context?.previousImages) {
          queryClient.setQueryData<ProductImageType[]>(
            queryKey,
            context.previousImages
          );
        }
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey }),
    })
  );

  return {
    images: images ?? [],
    isLoading,
    uploadImage: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    updateSortOrder: sortMutation.mutate,
    isSorting: sortMutation.isPending,
    deleteImage: deleteMutation.mutate,
  };
}

export function ImageUpload({ productId }: { productId: string }) {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const {
    images,
    isLoading,
    isUploading,
    uploadImage: uploadMedia,
    updateSortOrder,
    isSorting,
    deleteImage,
  } = useProductImages(productId);

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
    e.target.value = "";
  }, []);

  const handleApply = useCallback(
    async (croppedFile: File) => {
      try {
        const result = await uploadImage(croppedFile, "products");
        const { url, pathname, size } = result.data;

        await uploadMedia({
          productId,
          blobUrl: url,
          blobPath: pathname,
          metadata: {
            filename: croppedFile.name,
            size,
            width: 0,
            height: 0,
          },
        });
        setFileToUpload(null);
      } catch {
        toast.error("Chyba pri nahrávaní obrázka");
      }
    },
    [uploadMedia, productId]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = images.findIndex((img) => img.mediaId === active.id);
      const newIndex = images.findIndex((img) => img.mediaId === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Get new order immediately
      const newOrder = arrayMove(images, oldIndex, newIndex);

      // Update server - optimistic update happens in mutation
      updateSortOrder({
        productId,
        mediaIds: newOrder.map((img) => img.mediaId),
      });
    },
    [images, updateSortOrder, productId]
  );

  return (
    <div className="space-y-4">
      {fileToUpload && (
        <ImageCrop
          file={fileToUpload}
          isUploading={isUploading}
          onApply={handleApply}
          onCancel={() => setFileToUpload(null)}
        />
      )}
      <ImagesSortable
        disabled={isUploading || isLoading || isSorting}
        images={images}
        onChange={handleFileSelect}
        onDragEnd={handleDragEnd}
        onRemove={(mediaId) => deleteImage({ productId, mediaId })}
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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
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
