/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */
import "server-only";

import { put } from "@vercel/blob";
import sharp from "sharp";
import { createShortId } from "./ids";

const RESIZE_SIZE = 2400;
const ONE_HUNDRED = 100;

export async function uploadFile(file: File, path: string) {
  const uploadPath = `${path}/${file.name}`;

  const blob = await put(uploadPath, file, {
    access: "public",
  });

  return {
    url: blob.url,
    path: blob.pathname,
    downloadUrl: blob.downloadUrl,
  };
}

export async function uploadImage(
  file: File,
  imagePath: string,
  _contentType?: string
) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const optimized = await sharp(buffer)
    .rotate() // Rotate the image to the correct orientation
    .resize(RESIZE_SIZE, RESIZE_SIZE, {
      fit: "inside",
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3, // Better quality
    })
    .withMetadata({
      // Add metadata to the image
      exif: {
        IFD0: {
          Copyright: "Kromka",
        },
      },
    })
    .jpeg({
      quality: 88,
      mozjpeg: true,
      chromaSubsampling: "4:2:0", // Standard chroma subsampling
    })
    .toBuffer();

  const uniqueName = `${file.name}-${createShortId()}`;
  const uploadPath = `images/${imagePath}/${uniqueName}.jpg`;

  const blob = await put(uploadPath, optimized, {
    access: "public",
    contentType: "image/jpeg",
  });

  const metadata = await sharp(optimized).metadata();

  return {
    success: true,
    data: {
      url: blob.url,
      pathname: blob.pathname,
      width: metadata.width!,
      height: metadata.height!,
      size: optimized.length,
      originalSize: buffer.length,
      compressionRatio: (
        ((buffer.length - optimized.length) / buffer.length) *
        ONE_HUNDRED
      ).toFixed(1),
    },
  };
}
