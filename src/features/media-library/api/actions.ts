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

export async function uploadMedia(file: File, folder: string) {
  await requireAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());

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
