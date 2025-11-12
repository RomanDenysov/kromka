"use client";

import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GripVerticalIcon, PlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropReset,
} from "@/components/kibo-ui/image-crop";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { compressImage } from "@/lib/compress-img";
import { useTRPC } from "@/trpc/client";

const KB = 1024;
const MB = KB * KB;
const MAX_IMAGE_SIZE_MB = 4;
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * MB; // 4MB
const DRAG_OPACITY = 0.5;

type ProductImageUploadProps = {
  productId: string;
  maxImages?: number;
};

type ProductImage = {
  productId: string;
  mediaId: string;
  sortOrder: number;
  isPrimary: boolean;
  media: {
    id: string;
    name: string;
    path: string;
    type: string;
    size: number;
  };
};

type UploadState =
  | { type: "idle" }
  | { type: "compressing" }
  | { type: "cropping"; file: File }
  | { type: "uploading" }
  | { type: "saving" };

export function ProductImageUpload({
  productId,
  maxImages = 4,
}: ProductImageUploadProps) {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({ type: "idle" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  // Fetch images
  const { data: fetchedImages, refetch } = useQuery(
    trpc.admin.products.images.queryOptions(
      { productId },
      { enabled: !!productId }
    )
  );

  useEffect(() => {
    if (fetchedImages) {
      setImages(fetchedImages as ProductImage[]);
    }
  }, [fetchedImages]);

  // Mutations
  const createImageRecordMutation = useMutation(
    trpc.admin.products.createImageRecord.mutationOptions({
      onSuccess: () => {
        toast.success("Image uploaded successfully");
        setUploadState({ type: "idle" });
        setIsDialogOpen(false);
        refetch();
      },
      onError: (error) => {
        toast.error(`Failed to save image: ${error.message}`);
        setUploadState({ type: "idle" });
        setIsDialogOpen(false); // Close dialog on error
      },
    })
  );

  const updateSortOrderMutation = useMutation(
    trpc.admin.products.updateImageSortOrder.mutationOptions({
      onSuccess: () => {
        toast.success("Image order updated");
        refetch();
      },
      onError: (error) => {
        toast.error(`Failed to update order: ${error.message}`);
        refetch(); // Revert optimistic update
      },
    })
  );

  const deleteImageMutation = useMutation(
    trpc.admin.products.deleteImage.mutationOptions({
      onSuccess: () => {
        toast.success("Image deleted");
        refetch();
      },
      onError: (error) => {
        toast.error(`Failed to delete image: ${error.message}`);
        refetch();
      },
    })
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (images.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      try {
        setUploadState({ type: "compressing" });
        const compressedFile = await compressImage(file);
        setUploadState({ type: "cropping", file: compressedFile });
        setIsDialogOpen(true);
      } catch (error) {
        toast.error(
          `Compression failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setUploadState({ type: "idle" });
      }
    },
    [images.length, maxImages]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file).catch((error) => {
          toast.error(
            `File selection failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        });
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect]
  );

  const handleCrop = useCallback(
    async (base64DataUrl: string) => {
      if (uploadState.type !== "cropping") {
        return;
      }

      try {
        setUploadState({ type: "uploading" });

        // Get image dimensions from base64
        const img = new window.Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = base64DataUrl;
        });

        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Upload to Vercel Blob
        const filename = `product-${Date.now()}.png`;

        // Get blob size
        const blob = await fetch(base64DataUrl).then((r) => r.blob());
        const size = blob.size;

        setUploadState({ type: "saving" });

        // Create DB records
        await createImageRecordMutation.mutateAsync({
          productId,
          blobPath,
          blobUrl,
          metadata: {
            width,
            height,
            size,
            filename,
          },
        });
      } catch (error) {
        toast.error(
          `Upload failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setUploadState({ type: "idle" });
        setIsDialogOpen(false); // Close dialog on upload error
      }
    },
    [uploadState, productId, createImageRecordMutation]
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

      // Optimistic update
      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);

      // Update sort order on server
      const mediaIds = newImages.map((img) => img.mediaId);
      updateSortOrderMutation.mutate({
        productId,
        mediaIds,
      });
    },
    [images, productId, updateSortOrderMutation]
  );

  const handleDeleteClick = useCallback((mediaId: string) => {
    setImageToDelete(mediaId);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!imageToDelete) {
      return;
    }

    deleteImageMutation.mutate({
      productId,
      mediaId: imageToDelete,
    });

    setDeleteConfirmOpen(false);
    setImageToDelete(null);
  }, [imageToDelete, productId, deleteImageMutation]);

  const handleCloseDialog = useCallback(() => {
    if (uploadState.type === "uploading" || uploadState.type === "saving") {
      return; // Prevent closing during upload
    }
    setIsDialogOpen(false);
    setUploadState({ type: "idle" });
  }, [uploadState]);

  const canUpload = images.length < maxImages;
  const isLoading =
    uploadState.type === "compressing" ||
    uploadState.type === "uploading" ||
    uploadState.type === "saving";

  return (
    <div className="space-y-4">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-4">
          <SortableContext
            items={images.map((img) => img.mediaId)}
            strategy={verticalListSortingStrategy}
          >
            {images.map((image) => (
              <SortableImageItem
                image={image}
                key={image.mediaId}
                onDelete={handleDeleteClick}
              />
            ))}
          </SortableContext>

          {canUpload && (
            <div className="aspect-square">
              <button
                className="flex h-full w-full items-center justify-center rounded-lg border-2 border-border border-dashed bg-muted/50 transition-colors hover:border-primary hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                {isLoading ? (
                  <Spinner className="size-6" />
                ) : (
                  <PlusIcon className="size-8 text-muted-foreground" />
                )}
              </button>
              <input
                accept="image/*"
                className="hidden"
                disabled={isLoading}
                onChange={handleFileInputChange}
                ref={fileInputRef}
                type="file"
              />
            </div>
          )}
        </div>
      </DndContext>

      <Dialog onOpenChange={handleCloseDialog} open={isDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {uploadState.type === "cropping" && (
            <ImageCrop
              aspect={1}
              file={uploadState.file}
              maxImageSize={MAX_IMAGE_SIZE}
              onCrop={handleCrop}
            >
              <ImageCropContent className="max-h-[400px] w-full" />
              <DialogFooter>
                <div className="flex items-center gap-2">
                  <ImageCropReset />
                  <ImageCropApply />
                  <Button
                    disabled={isLoading}
                    onClick={handleCloseDialog}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </DialogFooter>
            </ImageCrop>
          )}
          {uploadState.type === "uploading" && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Spinner className="size-8" />
              <p className="text-muted-foreground">Uploading to storage...</p>
            </div>
          )}
          {uploadState.type === "saving" && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Spinner className="size-8" />
              <p className="text-muted-foreground">Saving to database...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog onOpenChange={setDeleteConfirmOpen} open={deleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              variant="destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type SortableImageItemProps = {
  image: ProductImage;
  onDelete: (mediaId: string) => void;
};

function SortableImageItem({ image, onDelete }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.mediaId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? DRAG_OPACITY : 1, // Visual feedback for dragging
  };

  // The path field stores the full blob URL
  const imageUrl = image.media.path;

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
      ref={setNodeRef}
      style={style}
    >
      <Image
        alt={image.media.name}
        className="object-cover"
        fill
        src={imageUrl}
        unoptimized
      />
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          className="size-8"
          onClick={() => onDelete(image.mediaId)}
          size="icon"
          type="button"
          variant="destructive"
        >
          <XIcon className="size-4" />
        </Button>
      </div>
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab rounded bg-black/50 p-1.5 opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
      >
        <GripVerticalIcon className="size-4 text-white" />
      </div>
    </div>
  );
}
