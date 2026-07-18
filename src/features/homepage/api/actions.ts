"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import { homepageCarouselProducts, homepageSections } from "@/db/schema";
import {
  getHomepageCarouselSectionById,
  getNextCarouselSortOrder,
} from "@/features/homepage/api/queries";
import {
  type CreateCarouselSectionSchema,
  createCarouselSectionSchema,
  deleteCarouselSectionSchema,
  duplicateCarouselSectionSchema,
  reorderSectionsSchema,
  toggleSectionSchema,
  type UpdateCarouselSectionSchema,
  updateCarouselSectionSchema,
} from "@/features/homepage/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { log } from "@/lib/logger";

type ActionResult = { success: true } | { success: false; error: string };

function invalidateHomepage() {
  updateTag("homepage-layout");
}

async function replaceManualCarouselProducts(
  sectionId: string,
  productIds: string[]
) {
  await db
    .delete(homepageCarouselProducts)
    .where(eq(homepageCarouselProducts.sectionId, sectionId));

  if (productIds.length === 0) {
    return;
  }

  await db.insert(homepageCarouselProducts).values(
    productIds.map((productId, index) => ({
      sectionId,
      productId,
      sortOrder: index,
    }))
  );
}

function carouselValues(
  input: CreateCarouselSectionSchema | UpdateCarouselSectionSchema,
  sortOrder: number,
  isEnabled = true
) {
  return {
    blockType: "carousel" as const,
    sortOrder,
    title: input.title,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    itemLimit: input.itemLimit,
    sourceType: input.sourceType,
    categoryId: input.sourceType === "category" ? input.categoryId : null,
    isEnabled,
  };
}

export async function createCarouselSectionAction(
  input: CreateCarouselSectionSchema
): Promise<ActionResult & { sectionId?: string }> {
  await requireAdmin();

  const parsed = createCarouselSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const data = parsed.data;
  const sortOrder = await getNextCarouselSortOrder();

  try {
    const [created] = await db
      .insert(homepageSections)
      .values(carouselValues(data, sortOrder))
      .returning({ id: homepageSections.id });

    if (data.sourceType === "manual_products") {
      await replaceManualCarouselProducts(created.id, data.productIds);
    }

    invalidateHomepage();
    return { success: true, sectionId: created.id };
  } catch (error) {
    log.db.error({ err: error }, "Create homepage carousel failed");
    return { success: false, error: "INSERT_FAILED" };
  }
}

export async function updateCarouselSectionAction(
  input: UpdateCarouselSectionSchema
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = updateCarouselSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const data = parsed.data;
  const existing = await getHomepageCarouselSectionById(data.sectionId);
  if (!existing) {
    return { success: false, error: "NOT_FOUND" };
  }

  try {
    await db
      .update(homepageSections)
      .set({
        title: data.title,
        ctaLabel: data.ctaLabel,
        ctaHref: data.ctaHref,
        itemLimit: data.itemLimit,
        sourceType: data.sourceType,
        categoryId: data.sourceType === "category" ? data.categoryId : null,
      })
      .where(eq(homepageSections.id, data.sectionId));

    if (data.sourceType === "manual_products") {
      await replaceManualCarouselProducts(data.sectionId, data.productIds);
    } else {
      await db
        .delete(homepageCarouselProducts)
        .where(eq(homepageCarouselProducts.sectionId, data.sectionId));
    }

    invalidateHomepage();
    return { success: true };
  } catch (error) {
    log.db.error(
      { err: error, sectionId: data.sectionId },
      "Update homepage carousel failed"
    );
    return { success: false, error: "UPDATE_FAILED" };
  }
}

export async function deleteCarouselSectionAction(input: {
  sectionId: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const parsed = deleteCarouselSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const existing = await getHomepageCarouselSectionById(parsed.data.sectionId);
  if (!existing) {
    return { success: false, error: "NOT_FOUND" };
  }

  try {
    await db
      .delete(homepageSections)
      .where(eq(homepageSections.id, parsed.data.sectionId));
    invalidateHomepage();
    return { success: true };
  } catch (error) {
    log.db.error(
      { err: error, sectionId: parsed.data.sectionId },
      "Delete homepage carousel failed"
    );
    return { success: false, error: "DELETE_FAILED" };
  }
}

export async function duplicateCarouselSectionAction(input: {
  sectionId: string;
}): Promise<ActionResult & { sectionId?: string }> {
  await requireAdmin();

  const parsed = duplicateCarouselSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const source = await getHomepageCarouselSectionById(parsed.data.sectionId);
  if (!source) {
    return { success: false, error: "NOT_FOUND" };
  }

  const sortOrder = await getNextCarouselSortOrder();

  try {
    const [created] = await db
      .insert(homepageSections)
      .values({
        blockType: "carousel",
        sortOrder,
        title: source.title ? `${source.title} (kópia)` : "Produkty (kópia)",
        ctaLabel: source.ctaLabel,
        ctaHref: source.ctaHref,
        itemLimit: source.itemLimit,
        sourceType: source.sourceType,
        categoryId: source.sourceType === "category" ? source.categoryId : null,
        isEnabled: source.isEnabled,
      })
      .returning({ id: homepageSections.id });

    if (
      source.sourceType === "manual_products" &&
      source.manualProductIds.length > 0
    ) {
      await replaceManualCarouselProducts(created.id, source.manualProductIds);
    }

    invalidateHomepage();
    return { success: true, sectionId: created.id };
  } catch (error) {
    log.db.error(
      { err: error, sectionId: parsed.data.sectionId },
      "Duplicate homepage carousel failed"
    );
    return { success: false, error: "INSERT_FAILED" };
  }
}

export async function toggleHomepageSectionAction(input: {
  sectionId: string;
  isEnabled: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  const parsed = toggleSectionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const updated = await db
    .update(homepageSections)
    .set({ isEnabled: parsed.data.isEnabled })
    .where(eq(homepageSections.id, parsed.data.sectionId))
    .returning({ id: homepageSections.id });

  if (updated.length === 0) {
    return { success: false, error: "NOT_FOUND" };
  }

  invalidateHomepage();
  return { success: true };
}

export async function reorderHomepageSectionsAction(input: {
  orderedSectionIds: string[];
}): Promise<ActionResult> {
  await requireAdmin();

  const parsed = reorderSectionsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  try {
    for (let index = 0; index < parsed.data.orderedSectionIds.length; index++) {
      await db
        .update(homepageSections)
        .set({ sortOrder: index })
        .where(eq(homepageSections.id, parsed.data.orderedSectionIds[index]));
    }

    invalidateHomepage();
    return { success: true };
  } catch (error) {
    log.db.error({ err: error }, "Reorder homepage sections failed");
    return { success: false, error: "REORDER_FAILED" };
  }
}
