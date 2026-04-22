"use client";

import posthog from "posthog-js";

export type AddToCartSource =
  | "product_page"
  | "product_card"
  | "recommendation"
  | "favorites"
  | "homepage";

/** Homepage / landing CTA locations for funnel analysis. */
export type HomepageCtaSection =
  | "home_hero"
  | "about_cta"
  | "loyalty_banner"
  | "b2b"
  | "registration"
  | "homepage_top_products"
  | "homepage_pecivo"
  | "homepage_stores_map"
  | "homepage_stores_pitch"
  | "homepage_brand_story";

export type HomepageCtaId =
  | "order_online"
  | "stores"
  | "loyalty_signup"
  | "b2b_apply"
  | "b2b_learn_more"
  | "create_account"
  | "view_all_eshop"
  | "view_all_category"
  | "view_all_stores"
  | "store_detail"
  | "read_full_story";

export interface HomepageCtaClickPayload {
  cta: HomepageCtaId;
  href: string;
  section: HomepageCtaSection;
  store_slug?: string;
  variant?: "overlay" | "surface";
}

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
    source?: AddToCartSource;
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
  buyAgainDismissed() {
    posthog.capture("buy again dismissed");
  },
  orderRepeated(p: {
    item_count: number;
    total: number;
    source: "banner" | "banner_dialog" | "cart_drawer" | "reorder_bar";
  }) {
    posthog.capture("order repeated", p);
  },
  favoritesAllAdded(p: { item_count: number }) {
    posthog.capture("favorites all added", p);
  },
  categorySelected(p: { category_slug: string; category_name: string }) {
    posthog.capture("category selected", p);
  },
  // NOTE: Use "order confirmed" (client-side) in PostHog funnels, not "order completed" (server-side).
  // Client event has session context for Session Replay. Server event is the source-of-truth fallback.
  orderConfirmed(p: {
    order_id: string;
    order_number: string;
    total: number;
    item_count: number;
  }) {
    posthog.capture("order confirmed", p);
  },
  homepageCtaClicked(p: HomepageCtaClickPayload) {
    posthog.capture("homepage cta clicked", p);
  },
} as const;
