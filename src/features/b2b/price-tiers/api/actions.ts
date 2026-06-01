"use server";

import { and, eq, notInArray, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { prices, priceTiers } from "@/db/schema";
import type {
  BulkPricesSchema,
  PriceSchema,
  PriceTierSchema,
} from "@/features/b2b/price-tiers/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { log } from "@/lib/logger";

type ActionResult = { success: true } | { success: false; error: string };

export async function createPriceTierAction(): Promise<never> {
  await requireAdmin();

  let tierId: string;
  try {
    const [tier] = await db
      .insert(priceTiers)
      .values({})
      .returning({ id: priceTiers.id });
    tierId = tier.id;
    updateTag("price-tiers");
  } catch (err) {
    log.b2b.error({ err }, "Create price tier failed");
    throw err;
  }

  // redirect() must stay outside the try/catch — it throws NEXT_REDIRECT.
  redirect(`/admin/b2b/price-tiers/${tierId}`);
}

export async function updatePriceTierAction({
  id,
  data,
}: {
  id: string;
  data: PriceTierSchema;
}): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db.update(priceTiers).set(data).where(eq(priceTiers.id, id));
    updateTag("price-tiers");
    return { success: true };
  } catch (err) {
    log.b2b.error({ err, priceTierId: id }, "Update price tier failed");
    return { success: false, error: "Nepodarilo sa uložiť cenovú skupinu" };
  }
}

export async function deletePriceTierAction({
  id,
}: {
  id: string;
}): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db.delete(priceTiers).where(eq(priceTiers.id, id));
    updateTag("price-tiers");
    return { success: true };
  } catch (err) {
    log.b2b.error({ err, priceTierId: id }, "Delete price tier failed");
    return { success: false, error: "Nepodarilo sa zmazať cenovú skupinu" };
  }
}

export async function setPriceAction({
  productId,
  priceTierId,
  priceCents,
}: PriceSchema): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db
      .insert(prices)
      .values({ productId, priceTierId, priceCents })
      .onConflictDoUpdate({
        target: [prices.productId, prices.priceTierId],
        set: { priceCents },
      });
    updateTag("price-tiers");
    return { success: true };
  } catch (err) {
    log.b2b.error({ err, productId, priceTierId }, "Set price failed");
    return { success: false, error: "Nepodarilo sa uložiť cenu" };
  }
}

export async function removePriceAction({
  productId,
  priceTierId,
}: {
  productId: string;
  priceTierId: string;
}): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db
      .delete(prices)
      .where(
        and(
          eq(prices.productId, productId),
          eq(prices.priceTierId, priceTierId)
        )
      );
    updateTag("price-tiers");
    return { success: true };
  } catch (err) {
    log.b2b.error({ err, productId, priceTierId }, "Remove price failed");
    return { success: false, error: "Nepodarilo sa odstrániť cenu" };
  }
}

export async function bulkSetPricesAction({
  priceTierId,
  prices: priceEntries,
}: BulkPricesSchema): Promise<ActionResult> {
  await requireAdmin();

  try {
    if (priceEntries.length > 0) {
      // Upsert first so the tier's prices are never momentarily wiped — the
      // Neon HTTP driver has no transactions, and a failed insert after a
      // blanket delete would lose every price for the tier.
      await db
        .insert(prices)
        .values(
          priceEntries.map((p) => ({
            productId: p.productId,
            priceTierId,
            priceCents: p.priceCents,
          }))
        )
        .onConflictDoUpdate({
          target: [prices.productId, prices.priceTierId],
          set: { priceCents: sql`excluded.price_cents` },
        });

      // Prune prices for products no longer present in the submitted set.
      await db.delete(prices).where(
        and(
          eq(prices.priceTierId, priceTierId),
          notInArray(
            prices.productId,
            priceEntries.map((p) => p.productId)
          )
        )
      );
    } else {
      // Empty payload means clear all prices for the tier.
      await db.delete(prices).where(eq(prices.priceTierId, priceTierId));
    }

    updateTag("price-tiers");
    return { success: true };
  } catch (err) {
    log.b2b.error({ err, priceTierId }, "Bulk set prices failed");
    return { success: false, error: "Nepodarilo sa uložiť ceny" };
  }
}
