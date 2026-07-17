import type { HomepageBlockType, HomepagePredefinedKey } from "@/db/schema";

export const HOMEPAGE_DEFAULT_CTA_LABEL = "Zobraziť všetko";
export const HOMEPAGE_DEFAULT_CTA_HREF = "/e-shop";
export const HOMEPAGE_DEFAULT_ITEM_LIMIT = 8;
export const HOMEPAGE_MAX_ITEM_LIMIT = 24;
export const HOMEPAGE_BEST_SELLERS_WINDOW_DAYS = 30;
/** Extra IDs to scan when filtering inactive products from sales ranking. */
export const HOMEPAGE_BEST_SELLER_POOL_MULTIPLIER = 6;

export const HOMEPAGE_PREDEFINED_LABELS: Record<HomepagePredefinedKey, string> =
  {
    hero: "Hero",
    registration_reorder: "Registrácia a opakovaná objednávka",
    brand_story: "Príbeh značky",
    stores: "Predajne",
    loyalty: "Vernostný program",
    game: "Hra",
    blog: "Blog",
    b2b_cta: "B2B výzva",
  };

export const HOMEPAGE_BLOCK_TYPE_LABELS: Record<HomepageBlockType, string> = {
  ...HOMEPAGE_PREDEFINED_LABELS,
  carousel: "Produktový carousel",
};

export const HOMEPAGE_SOURCE_TYPE_LABELS = {
  category: "Kategória",
  manual_products: "Vybrané produkty",
  best_sellers: "Najpredávanejšie (30 dní)",
} as const;
