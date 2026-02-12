"use server";

import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { priceTiers, prices } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import type {
	BulkPricesSchema,
	PriceSchema,
	PriceTierSchema,
} from "@/features/b2b/price-tiers/schema";

export async function createPriceTierAction() {
	await requireAdmin();

	const [tier] = await db
		.insert(priceTiers)
		.values({})
		.returning({ id: priceTiers.id });

	updateTag("price-tiers");

	redirect(`/admin/b2b/price-tiers/${tier.id}`);
}

export async function updatePriceTierAction({
	id,
	data,
}: {
	id: string;
	data: PriceTierSchema;
}) {
	await requireAdmin();

	await db.update(priceTiers).set(data).where(eq(priceTiers.id, id));

	updateTag("price-tiers");

	return { success: true };
}

export async function deletePriceTierAction({ id }: { id: string }) {
	await requireAdmin();

	await db.delete(priceTiers).where(eq(priceTiers.id, id));

	updateTag("price-tiers");

	return { success: true };
}

export async function setPriceAction({
	productId,
	priceTierId,
	priceCents,
}: PriceSchema) {
	await requireAdmin();

	await db
		.insert(prices)
		.values({ productId, priceTierId, priceCents })
		.onConflictDoUpdate({
			target: [prices.productId, prices.priceTierId],
			set: { priceCents },
		});

	updateTag("price-tiers");

	return { success: true };
}

export async function removePriceAction({
	productId,
	priceTierId,
}: {
	productId: string;
	priceTierId: string;
}) {
	await requireAdmin();

	await db
		.delete(prices)
		.where(
			and(eq(prices.productId, productId), eq(prices.priceTierId, priceTierId)),
		);

	updateTag("price-tiers");

	return { success: true };
}

export async function bulkSetPricesAction({
	priceTierId,
	prices: priceEntries,
}: BulkPricesSchema) {
	await requireAdmin();

	// Delete existing prices for this tier
	await db.delete(prices).where(eq(prices.priceTierId, priceTierId));

	// Insert new prices if any
	if (priceEntries.length > 0) {
		await db.insert(prices).values(
			priceEntries.map((p) => ({
				productId: p.productId,
				priceTierId,
				priceCents: p.priceCents,
			})),
		);
	}

	updateTag("price-tiers");

	return { success: true };
}
