/** biome-ignore-all lint/style/noMagicNumbers: default crop values */
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

const HIGH_QUALITY = 0.92;
const LOW_QUALITY = 0.8;
const MAX_DIMENSION = 2400;
const TARGET_SIZE_KB = 900;
const KB = 1024;
const FILE_EXT_REGEX = /\.\w+$/;

function compressIfNeeded(
  canvas: HTMLCanvasElement,
  fileName: string,
  quality: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], fileName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        resolve(file);
      },
      "image/jpeg",
      quality
    );
  });
}

async function getCroppedFile(
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

  // Use natural resolution, not display resolution
  let cropWidth = Math.round(crop.width * scaleX);
  let cropHeight = Math.round(crop.height * scaleY);

  // Limit max dimension to prevent huge files
  if (Math.max(cropWidth, cropHeight) > MAX_DIMENSION) {
    const ratio = MAX_DIMENSION / Math.max(cropWidth, cropHeight);
    cropWidth = Math.round(cropWidth * ratio);
    cropHeight = Math.round(cropHeight * ratio);
  }

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    Math.round(crop.x * scaleX),
    Math.round(crop.y * scaleY),
    Math.round(crop.width * scaleX),
    Math.round(crop.height * scaleY),
    0,
    0,
    cropWidth,
    cropHeight
  );

  const jpegFileName = originalFileName.replace(FILE_EXT_REGEX, ".jpg");

  // Try high quality first
  let file = await compressIfNeeded(canvas, jpegFileName, HIGH_QUALITY);

  // If still too large, use lower quality
  if (file.size > TARGET_SIZE_KB * KB) {
    file = await compressIfNeeded(canvas, jpegFileName, LOW_QUALITY);
  }

  return file;
}

type ImageCropProps = {
  file: File;
  onApply: (croppedFile: File) => void;
  onCancel: () => void;
  isUploading: boolean;
  style?: CSSProperties;
  aspect?: number;
};

export function ImageCrop({
  file,
  onApply,
  onCancel,
  isUploading,
  style,
  aspect = 1,
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

  const onImageLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const newCrop = centerAspectCrop(width, height, aspect);
      setCrop(newCrop);
      setInitialCrop(newCrop);
    },
    [aspect]
  );

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
      <div className="relative">
        <ReactCrop
          aspect={aspect}
          className="max-h-[400px]"
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          style={{ ...shadcnStyle, ...style }}
        >
          {imageSrc && (
            // biome-ignore lint/correctness/useImageSize: image size handled by crop
            // biome-ignore lint/performance/noImgElement: image crop needs raw img
            // biome-ignore lint/a11y/noNoninteractiveElementInteractions: interaction handled by crop wrapper
            <img
              alt="Obrazok na cropovanie"
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
          size="icon"
          type="button"
          variant="ghost"
        >
          <RotateCcwIcon />
        </Button>
        <Button
          disabled={isUploading}
          onClick={onCancel}
          size="icon"
          type="button"
          variant="ghost"
        >
          <XIcon />
        </Button>
        <Button
          disabled={isUploading || !completedCrop}
          onClick={handleApply}
          size="icon"
          type="button"
          variant="ghost"
        >
          {isUploading ? <Spinner /> : <CropIcon />}
        </Button>
      </div>
    </div>
  );
}
