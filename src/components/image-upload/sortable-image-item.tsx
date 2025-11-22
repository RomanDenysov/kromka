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
        alt={image.media.name}
        className="object-cover"
        fill
        src={imageUrl}
        unoptimized
      />

      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />

      {!disabled && (
        <>
          <div
            {...attributes}
            {...listeners}
            className="absolute bottom-1.5 left-1.5 cursor-grab rounded bg-black/70 p-1.5 opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
          >
            <GripVerticalIcon className="size-3 text-white" />
          </div>
          <AlertDialog key={image.mediaId}>
            <AlertDialogTrigger asChild>
              <Button
                className="absolute top-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100"
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
