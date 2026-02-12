"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	removePriceAction,
	setPriceAction,
} from "@/features/b2b/price-tiers/api/actions";
import type { PriceTierDetail } from "@/features/b2b/price-tiers/api/queries";
import type { AdminProductList } from "@/features/products/api/queries";

type Props = {
	tier: PriceTierDetail;
	products: AdminProductList;
};

function formatPrice(cents: number) {
	return (cents / 100).toFixed(2);
}

export function PricesTable({ tier, products }: Props) {
	const existingPrices = new Map(
		tier.prices.map((p) => [p.product.id, p.priceCents]),
	);

	const [priceValues, setPriceValues] = useState<Record<string, string>>(() => {
		const initial: Record<string, string> = {};
		for (const p of tier.prices) {
			initial[p.product.id] = formatPrice(p.priceCents);
		}
		return initial;
	});

	const [savingId, setSavingId] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const handleSave = (productId: string) => {
		const value = priceValues[productId];
		if (!value) return;

		const priceCents = Math.round(Number.parseFloat(value) * 100);
		if (Number.isNaN(priceCents) || priceCents < 0) {
			toast.error("Neplatná cena");
			return;
		}

		setSavingId(productId);
		startTransition(async () => {
			const result = await setPriceAction({
				productId,
				priceTierId: tier.id,
				priceCents,
			});
			setSavingId(null);
			if (result.success) {
				toast.success("Cena bola uložená");
			} else {
				toast.error("Nepodarilo sa uložiť cenu");
			}
		});
	};

	const handleRemove = (productId: string) => {
		setSavingId(productId);
		startTransition(async () => {
			const result = await removePriceAction({
				productId,
				priceTierId: tier.id,
			});
			setSavingId(null);
			if (result.success) {
				setPriceValues((prev) => {
					const next = { ...prev };
					delete next[productId];
					return next;
				});
				toast.success("Cena bola odstránená");
			} else {
				toast.error("Nepodarilo sa odstrániť cenu");
			}
		});
	};

	return (
		<div className="space-y-4">
			<h3 className="font-semibold text-lg">Ceny produktov</h3>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Produkt</TableHead>
							<TableHead className="w-32">Základná cena</TableHead>
							<TableHead className="w-40">Cena skupiny</TableHead>
							<TableHead className="w-28">Akcie</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{products.map((product) => {
							const isSaving = savingId === product.id && isPending;
							const hasExistingPrice = existingPrices.has(product.id);

							return (
								<TableRow key={product.id}>
									<TableCell className="font-medium">{product.name}</TableCell>
									<TableCell className="text-muted-foreground">
										{formatPrice(product.priceCents)}
									</TableCell>
									<TableCell>
										<Input
											className="h-8 w-32"
											min="0"
											onChange={(e) =>
												setPriceValues((prev) => ({
													...prev,
													[product.id]: e.target.value,
												}))
											}
											placeholder="0.00"
											step="0.01"
											type="number"
											value={priceValues[product.id] ?? ""}
										/>
									</TableCell>
									<TableCell>
										<div className="flex gap-1">
											<Button
												disabled={isSaving}
												onClick={() => handleSave(product.id)}
												size="sm"
												type="button"
												variant="outline"
											>
												{isSaving ? <Spinner /> : "Uložiť"}
											</Button>
											{hasExistingPrice && (
												<Button
													disabled={isSaving}
													onClick={() => handleRemove(product.id)}
													size="sm"
													type="button"
													variant="ghost"
												>
													Odstrániť
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
