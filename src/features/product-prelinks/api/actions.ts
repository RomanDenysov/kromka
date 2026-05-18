"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { db } from "@/db";
import { productPrelinks, products } from "@/db/schema";
import {
  type AddPrelinkSchema,
  addPrelinkSchema,
  type RemovePrelinkSchema,
  removePrelinkSchema,
  type UpdatePrelinkSchema,
  updatePrelinkSchema,
} from "@/features/product-prelinks/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { log } from "@/lib/logger";

type ActionResult = { success: true } | { success: false; error: string };

function invalidateForProduct(productId: string) {
  updateTag("product-prelinks");
  updateTag(`product-prelinks-${productId}`);
}

export async function addPrelinkAction(
  input: AddPrelinkSchema
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = addPrelinkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const { productId, linkedProductId, label } = parsed.data;

  if (productId === linkedProductId) {
    return { success: false, error: "SELF_LINK" };
  }

  // Verify both products exist and the linked one isn't archived/draft.
  const [source, target] = await Promise.all([
    db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true },
    }),
    db.query.products.findFirst({
      where: eq(products.id, linkedProductId),
      columns: { id: true, status: true, isActive: true },
    }),
  ]);

  if (!(source && target)) {
    return { success: false, error: "NOT_FOUND" };
  }

  // Idempotent: skip if the link already exists.
  const existing = await db.query.productPrelinks.findFirst({
    where: and(
      eq(productPrelinks.productId, productId),
      eq(productPrelinks.linkedProductId, linkedProductId)
    ),
    columns: { productId: true },
  });
  if (existing) {
    return { success: true };
  }

  try {
    await db.insert(productPrelinks).values({
      productId,
      linkedProductId,
      label: label ?? null,
    });
  } catch (error) {
    log.db.error(
      { err: error, productId, linkedProductId },
      "Failed to insert product prelink"
    );
    return { success: false, error: "INSERT_FAILED" };
  }

  invalidateForProduct(productId);
  return { success: true };
}

export async function updatePrelinkAction(
  input: UpdatePrelinkSchema
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = updatePrelinkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const { productId, linkedProductId, label, sortOrder } = parsed.data;

  const updates: { label?: string | null; sortOrder?: number } = {};
  if (label !== undefined) {
    updates.label = label;
  }
  if (sortOrder !== undefined) {
    updates.sortOrder = sortOrder;
  }
  if (Object.keys(updates).length === 0) {
    return { success: true };
  }

  await db
    .update(productPrelinks)
    .set(updates)
    .where(
      and(
        eq(productPrelinks.productId, productId),
        eq(productPrelinks.linkedProductId, linkedProductId)
      )
    );

  invalidateForProduct(productId);
  return { success: true };
}

export async function removePrelinkAction(
  input: RemovePrelinkSchema
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = removePrelinkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA" };
  }

  const { productId, linkedProductId } = parsed.data;

  await db
    .delete(productPrelinks)
    .where(
      and(
        eq(productPrelinks.productId, productId),
        eq(productPrelinks.linkedProductId, linkedProductId)
      )
    );

  invalidateForProduct(productId);
  return { success: true };
}
