import { ImageIcon, Trash2Icon, UploadIcon } from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useTransition,
} from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

// TODO: Migrate to single URL string instead of object
type Props = {
  value: { id: string; url: string } | null;
  onChange: (value: { id: string; url: string } | null) => void;
  onUpload: (file: File) => Promise<{ id: string; url: string }>;
  disabled: boolean;
  className?: string;
};

const MAX_SIZE = 4 * 1024 * 1024;

export function ImageInput({
  onChange,
  value,
  onUpload,
  disabled,
  className,
}: Props) {
  const [isUploading, startTransition] = useTransition();

  const handleFile = useCallback(
    (file: File) => {
      startTransition(async () => {
        if (!file.type.startsWith("image/")) {
          toast.error("Vyberte obrázok");
          return;
        }
        if (file.size > MAX_SIZE) {
          toast.error("Maximálna veľkosť je 4MB");
          return;
        }

        try {
          const { id, url } = await onUpload(file);
          onChange({ id, url });
        } catch {
          toast.error("Nepodarilo sa nahrať obrázok");
        }
      });
    },
    [onUpload, onChange]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
    e.dataTransfer.clearData();
  };

  if (value) {
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
          src={value.url}
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-muted opacity-0 transition-opacity group-hover:opacity-100">
          <Button asChild className="size-8" size="icon" variant="outline">
            <label>
              <UploadIcon className="size-4" />
              <input
                accept="image/*"
                className="hidden"
                disabled={disabled}
                onChange={handleChange}
                type="file"
              />
            </label>
          </Button>
          <Button
            className="size-8"
            disabled={disabled}
            onClick={() => onChange(null)}
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
        isUploading && "pointer-events-none opacity-50",
        className
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <ImageIcon className="size-8 text-muted-foreground" />
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
