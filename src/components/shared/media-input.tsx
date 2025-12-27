"use client";

import {
  ExpandIcon,
  ImageIcon,
  Loader2Icon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/actions/media";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

type MediaFolder = "products" | "categories" | "stores" | "posts";

type Props = {
  /** Current image URL to display */
  imageUrl?: string | null;
  /** Folder for organizing uploads */
  folder: MediaFolder;
  /** Callback when image changes - receives media ID or null */
  onChange: (mediaId: string | null) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Unified media input component for uploading and displaying images.
 * Handles upload logic internally using the uploadMedia action.
 * Includes preview dialog for full-size image viewing.
 */
export function MediaInput({
  imageUrl,
  folder,
  onChange,
  disabled = false,
  className,
}: Props) {
  const [isUploading, startTransition] = useTransition();
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const displayUrl = uploadedUrl ?? imageUrl ?? null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vyberte obrázok");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Maximálna veľkosť je 4MB");
      return;
    }

    startTransition(async () => {
      try {
        const media = await uploadMedia(file, folder);
        setUploadedUrl(media.url);
        onChange(media.id);
      } catch {
        toast.error("Nepodarilo sa nahrať obrázok");
      }
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
    e.dataTransfer.clearData();
  };

  const handleRemove = () => {
    setUploadedUrl(null);
    onChange(null);
  };

  if (displayUrl) {
    return (
      <div
        className={cn(
          "group relative h-36 w-full overflow-hidden rounded-lg border-2 border-dashed",
          className
        )}
      >
        <Image
          alt=""
          className="object-cover"
          fill
          src={displayUrl}
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Dialog onOpenChange={setPreviewOpen} open={previewOpen}>
            <DialogTrigger asChild>
              <Button className="size-8" size="icon" variant="secondary">
                <ExpandIcon className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-h-[90vh] max-w-fit overflow-hidden p-0 sm:max-w-fit"
              showCloseButton={false}
            >
              <DialogHeader>
                <DialogTitle className="sr-only">Náhľad obrázku</DialogTitle>
              </DialogHeader>
              <div className="relative aspect-auto max-h-[85vh]">
                <Image
                  alt=""
                  className="h-auto max-h-[85vh] w-auto object-contain"
                  height={1200}
                  src={displayUrl}
                  unoptimized
                  width={1200}
                />
              </div>
              <Button
                className="absolute top-2 right-2 size-8"
                onClick={() => setPreviewOpen(false)}
                size="icon"
                variant="secondary"
              >
                <XIcon className="size-4" />
              </Button>
            </DialogContent>
          </Dialog>

          <Button asChild className="size-8" size="icon" variant="secondary">
            <label>
              <UploadIcon className="size-4" />
              <input
                accept="image/*"
                className="hidden"
                disabled={disabled || isUploading}
                onChange={handleChange}
                type="file"
              />
            </label>
          </Button>

          <Button
            className="size-8"
            disabled={disabled || isUploading}
            onClick={handleRemove}
            size="icon"
            variant="destructive"
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Label
      className={cn(
        "flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50",
        (isUploading || disabled) && "pointer-events-none opacity-50",
        className
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {isUploading ? (
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      ) : (
        <ImageIcon className="size-8 text-muted-foreground" />
      )}
      <span className="text-xs">
        {isUploading ? "Nahráva sa..." : "Nahrať obrázok"}
      </span>
      <input
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
        onChange={handleChange}
        type="file"
      />
    </Label>
  );
}
