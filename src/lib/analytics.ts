"use client";

import posthog from "posthog-js";

export const analytics = {
	productViewed(p: {
		product_id: string;
		product_name: string;
		price: number;
		category: string;
		category_id: string;
	}) {
		posthog.capture("product viewed", p);
	},
	productAdded(p: {
		product_id: string;
		product_name: string;
		price: number;
		quantity: number;
		cart_type: "b2c" | "b2b";
	}) {
		posthog.capture("product added", p);
	},
	productRemoved(p: {
		product_id: string;
		product_name: string;
		quantity: number;
	}) {
		posthog.capture("product removed", p);
	},
	cartViewed() {
		posthog.capture("cart viewed");
	},
	checkoutStarted(p: {
		item_count: number;
		total: number;
		cart_type: "b2c" | "b2b";
	}) {
		posthog.capture("checkout started", p);
	},
	storeSelected(p: { store_id: string; store_name: string }) {
		posthog.capture("store selected", p);
	},
	searchPerformed(p: { query: string }) {
		posthog.capture("search performed", p);
	},
	favoriteToggled(p: {
		product_id: string;
		product_name: string;
		action: "added" | "removed";
	}) {
		posthog.capture("favorite toggled", p);
	},
} as const;
