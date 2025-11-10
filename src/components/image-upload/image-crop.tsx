/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
"use client";

import { CropIcon, RotateCcwIcon, XIcon } from "lucide-react";
import {
  type CSSProperties,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import "react-image-crop/dist/ReactCrop.css";

const centerAspectCrop = (
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | undefined
): PercentCrop =>
  centerCrop(
    aspect
      ? makeAspectCrop(
          {
            unit: "%",
            width: 90,
          },
          aspect,
          mediaWidth,
          mediaHeight
        )
      : { x: 0, y: 0, width: 90, height: 90, unit: "%" },
    mediaWidth,
    mediaHeight
  );

function getCroppedFile(
  image: HTMLImageElement,
  crop: PixelCrop,
  originalFileName: string
): Promise<File> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], originalFileName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        resolve(file);
      },
      "image/jpeg",
      0.95
    );
  });
}

type ImageCropProps = {
  file: File;
  onApply: (croppedFile: File) => void;
  onCancel: () => void;
  isUploading: boolean;
  style?: CSSProperties;
};

export function ImageCrop({
  file,
  onApply,
  onCancel,
  isUploading,
  style,
}: ImageCropProps) {
  const defaultCrop: Crop = {
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  };
  const [crop, setCrop] = useState<Crop>({ ...defaultCrop });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [initialCrop, setInitialCrop] = useState<PercentCrop>();
  const [imageSrc, setImageSrc] = useState<string>("");
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [file]);

  const onImageLoad = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const newCrop = centerAspectCrop(width, height, 1);
    setCrop(newCrop);
    setInitialCrop(newCrop);
  }, []);

  const handleApply = async () => {
    if (!completedCrop) {
      return;
    }
    const image = imageRef.current;
    if (!image) {
      return;
    }
    if (!file) {
      return;
    }

    try {
      const croppedFile = await getCroppedFile(image, completedCrop, file.name);
      onApply(croppedFile);
    } catch (_error) {
      // TODO: handle error
    }
  };

  const handleReset = () => {
    if (initialCrop) {
      setCrop(initialCrop);
      setCompletedCrop(null);
    }
  };

  const shadcnStyle = {
    "--rc-border-color": "var(--color-border)",
    "--rc-focus-color": "var(--color-primary)",
  } as CSSProperties;

  return (
    <div>
      <div>
        <ReactCrop
          aspect={1}
          className="max-h-[400px]"
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          style={{ ...shadcnStyle, ...style }}
        >
          {imageSrc && (
            // biome-ignore lint/correctness/useImageSize: <explanation>
            // biome-ignore lint/performance/noImgElement: <explanation>
            // biome-ignore lint/a11y/noNoninteractiveElementInteractions: <explanation>
            <img
              alt="Crop preview"
              className="size-full"
              onLoad={onImageLoad}
              ref={imageRef}
              src={imageSrc}
            />
          )}
        </ReactCrop>
      </div>
      <div className="flex items-center justify-center gap-2">
        <Button
          disabled={isUploading}
          onClick={handleReset}
          size="sm"
          type="button"
          variant="outline"
        >
          <RotateCcwIcon className="mr-2 size-4" />
          Reset
        </Button>
        <Button
          disabled={isUploading}
          onClick={onCancel}
          size="sm"
          type="button"
          variant="outline"
        >
          <XIcon className="mr-2 size-4" />
          Cancel
        </Button>
        <Button
          disabled={isUploading || !completedCrop}
          onClick={handleApply}
          size="sm"
          type="button"
        >
          {isUploading ? (
            <>
              <Spinner />
              Uploading...
            </>
          ) : (
            <>
              <CropIcon className="mr-2 size-4" />
              Apply & Upload
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
