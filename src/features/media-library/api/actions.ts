"use server";

import { put } from "@vercel/blob";
import { updateTag } from "next/cache";
import sharp from "sharp";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

const imageExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

const MAX_SIZE = 1600;
const TARGET_QUALITY = 85;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadMedia(file: File, folder: string) {
  await requireAdmin();

  // Validate MIME type before processing
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Neplatný typ súboru. Povolené sú: JPEG, PNG, WebP, GIF");
  }

  // Validate file size before allocating buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("Súbor je príliš veľký (max 10MB)");
  }

  const optimized = await sharp(buffer)
    .rotate()
    .resize(MAX_SIZE, MAX_SIZE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: TARGET_QUALITY, mozjpeg: true })
    .toBuffer();

  const blob = await put(
    `${folder}/${file.name.replace(imageExtensions, ".jpg")}`,
    optimized,
    { access: "public", addRandomSuffix: true }
  );

  const [created] = await db
    .insert(media)
    .values({
      name: file.name,
      url: blob.url,
      path: blob.pathname,
      type: blob.contentType,
      size: optimized.length,
    })
    .returning();

  updateTag("media");

  return created;
}
