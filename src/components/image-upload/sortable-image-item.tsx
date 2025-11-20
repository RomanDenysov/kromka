"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, XIcon } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ProductImageType } from ".";

const DRAG_OPACITY = 0.5;

type Props = {
  image: ProductImageType;
  onRemove: (id: string) => void;
  disabled: boolean;
};

export function SortableImageItem({ image, onRemove, disabled }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.mediaId, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? DRAG_OPACITY : 1,
  };

  const imageUrl = image.media.url;

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
      ref={setNodeRef}
      style={style}
    >
      <Image
        alt={image.media.title}
        className="object-cover"
        fill
        src={imageUrl}
        unoptimized
      />

      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

      {image.isPrimary && (
        <div className="absolute top-2 left-2 rounded bg-primary px-2 py-1 font-medium text-primary-foreground text-xs">
          Primary
        </div>
      )}

      {!disabled && (
        <>
          <div
            {...attributes}
            {...listeners}
            className="absolute bottom-2 left-2 cursor-grab rounded bg-black/70 p-1.5 opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
          >
            <GripVerticalIcon className="size-4 text-white" />
          </div>
          <AlertDialog key={image.mediaId}>
            <AlertDialogTrigger>
              <Button
                className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                size="icon-xs"
                type="button"
                variant="destructive"
              >
                <XIcon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Odstrániť obrázok</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                Opravdu chcete odstrániť tento obrázok? Táto akcia je nevratná.
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(image.mediaId)}
                  variant="destructive"
                >
                  Odstrániť
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
