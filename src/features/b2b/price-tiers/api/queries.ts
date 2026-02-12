"use cache";

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";

export async function getPriceTiers() {
	cacheLife("hours");
	cacheTag("price-tiers");

	return db.query.priceTiers.findMany({
		orderBy: (tier, { asc }) => asc(tier.name),
	});
}

export async function getPriceTierById(id: string) {
	cacheLife("hours");
	cacheTag("price-tiers");

	return db.query.priceTiers.findFirst({
		where: (tier, { eq: eqOp }) => eqOp(tier.id, id),
		with: {
			prices: {
				with: {
					product: {
						columns: { id: true, name: true, slug: true, priceCents: true },
						with: {
							image: {
								columns: { url: true },
							},
						},
					},
				},
			},
		},
	});
}

export type PriceTier = NonNullable<
	Awaited<ReturnType<typeof getPriceTiers>>[number]
>;

export type PriceTierDetail = NonNullable<
	Awaited<ReturnType<typeof getPriceTierById>>
>;
