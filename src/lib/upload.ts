/** biome-ignore-all lint/style/noNonNullAssertion: sharp metadata is checked */
/** biome-ignore-all lint/style/noMagicNumbers: compression constants */
"use server";

import { put } from "@vercel/blob";
import sharp from "sharp";

export async function uploadFile(file: File, path: string) {
  const uploadPath = `${path}/${file.name}`;

  const blob = await put(uploadPath, file, {
    access: "public",
  });

  return {
    url: blob.url,
    path: blob.pathname,
  };
}

async function optimizeProductImage(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const originalSize = buffer.length;

  const qualities = [95, 90, 85];
  let bestResult: { buffer: Buffer; quality: number; size: number } | null =
    null;

  for (const quality of qualities) {
    const processed = await sharp(buffer)
      .rotate()
      .resize(2400, 2400, {
        fit: "inside",
        kernel: sharp.kernel.lanczos3,
      })
      .jpeg({
        quality,
        mozjpeg: true,
        chromaSubsampling: "4:4:4",
        trellisQuantisation: true,
        overshootDeringing: true,
        optimizeScans: true,
      })
      .toBuffer();

    const sizeKB = processed.length / 1024;

    if (sizeKB <= 1500) {
      bestResult = { buffer: processed, quality, size: processed.length };
      break;
    }
  }

  if (!bestResult) {
    const processed = await sharp(buffer)
      .rotate()
      .resize(2400, 2400, {
        fit: "inside",
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      })
      .jpeg({
        quality: 80,
        mozjpeg: true,
        chromaSubsampling: "4:4:4",
      })
      .toBuffer();

    bestResult = { buffer: processed, quality: 80, size: processed.length };
  }

  const metadata = await sharp(bestResult.buffer).metadata();

  return {
    buffer: bestResult.buffer,
    metadata: {
      width: metadata.width!,
      height: metadata.height!,
      size: bestResult.size,
      quality: bestResult.quality,
      originalSize,
      savings: (
        ((originalSize - bestResult.size) / originalSize) *
        100
      ).toFixed(1),
    },
  };
}

export async function uploadImage(file: File, imagePath: string) {
  const optimized = await optimizeProductImage(file);

  const uploadPath = `images/${imagePath}/${file.name}`;

  const blob = await put(uploadPath, optimized.buffer, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    success: true,
    data: {
      url: blob.url,
      pathname: blob.pathname,
      size: optimized.metadata.size,
      type: blob.contentType,
    },
  };
}
