"use server";

import { eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import { heroBanners } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { log } from "@/lib/logger";
import { heroBannerSchema } from "../schema";

export async function createHeroBannerAction(
  data: unknown
): Promise<{ success: boolean; id?: string; error?: string }> {
  await requireAdmin();

  const parsed = heroBannerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const [created] = await db
    .insert(heroBanners)
    .values(parsed.data)
    .returning({ id: heroBanners.id });

  updateTag("hero-banners");
  return { success: true, id: created.id };
}

export async function updateHeroBannerAction({
  id,
  data,
}: {
  id: string;
  data: unknown;
}): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const parsed = heroBannerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  await db.update(heroBanners).set(parsed.data).where(eq(heroBanners.id, id));

  updateTag("hero-banners");
  return { success: true };
}

export async function activateHeroBannerAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const banner = await db.query.heroBanners.findFirst({
    where: eq(heroBanners.id, id),
    columns: { id: true },
  });

  if (!banner) {
    return { success: false, error: "NOT_FOUND" };
  }

  // Deactivate all other banners
  await db
    .update(heroBanners)
    .set({ isActive: false })
    .where(ne(heroBanners.id, id));

  // Activate the selected one
  await db
    .update(heroBanners)
    .set({ isActive: true })
    .where(eq(heroBanners.id, id));

  log.db.info({ heroBannerId: id }, "Hero banner activated");
  updateTag("hero-banners");
  return { success: true };
}

export async function deactivateHeroBannerAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  await db
    .update(heroBanners)
    .set({ isActive: false })
    .where(eq(heroBanners.id, id));

  updateTag("hero-banners");
  return { success: true };
}

export async function deleteHeroBannerAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  const banner = await db.query.heroBanners.findFirst({
    where: eq(heroBanners.id, id),
    columns: { isActive: true },
  });

  if (!banner) {
    return { success: false, error: "NOT_FOUND" };
  }

  if (banner.isActive) {
    return { success: false, error: "CANNOT_DELETE_ACTIVE" };
  }

  await db.delete(heroBanners).where(eq(heroBanners.id, id));

  updateTag("hero-banners");
  return { success: true };
}
