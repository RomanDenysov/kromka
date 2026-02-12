import { z } from "zod";

export const priceTierSchema = z.object({
	name: z.string().min(1, "Názov je povinný"),
	description: z.string().nullable(),
});

export type PriceTierSchema = z.infer<typeof priceTierSchema>;

export const priceSchema = z.object({
	productId: z.string().min(1),
	priceTierId: z.string().min(1),
	priceCents: z.number().int().min(0, "Cena musí byť >= 0"),
});

export type PriceSchema = z.infer<typeof priceSchema>;

export const bulkPricesSchema = z.object({
	priceTierId: z.string().min(1),
	prices: z.array(
		z.object({
			productId: z.string().min(1),
			priceCents: z.number().int().min(0),
		}),
	),
});

export type BulkPricesSchema = z.infer<typeof bulkPricesSchema>;
