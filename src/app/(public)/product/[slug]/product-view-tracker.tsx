"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

type Props = {
	productId: string;
	productName: string;
	price: number;
	category: string;
	categoryId: string;
};

export function ProductViewTracker({
	productId,
	productName,
	price,
	category,
	categoryId,
}: Props) {
	useEffect(() => {
		analytics.productViewed({
			product_id: productId,
			product_name: productName,
			price,
			category,
			category_id: categoryId,
		});
	}, [productId, productName, price, category, categoryId]);

	return null;
}
