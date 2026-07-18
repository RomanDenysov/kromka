CREATE TABLE "homepage_carousel_products" (
	"section_id" text NOT NULL,
	"product_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "homepage_carousel_products_section_id_product_id_pk" PRIMARY KEY("section_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "homepage_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"section_key" text,
	"block_type" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"title" text,
	"cta_label" text,
	"cta_href" text,
	"source_type" text,
	"category_id" text,
	"item_limit" integer DEFAULT 8 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "homepage_sections_section_key_unique" UNIQUE("section_key"),
	CONSTRAINT "homepage_sections_carousel_source" CHECK ((
        "homepage_sections"."block_type" <> 'carousel'
        OR (
          "homepage_sections"."source_type" IS NOT NULL
          AND (
            ("homepage_sections"."source_type" = 'category' AND "homepage_sections"."category_id" IS NOT NULL)
            OR ("homepage_sections"."source_type" IN ('manual_products', 'best_sellers'))
          )
        )
      )),
	CONSTRAINT "homepage_sections_predefined_key" CHECK ((
        "homepage_sections"."block_type" = 'carousel'
        OR "homepage_sections"."section_key" IS NOT NULL
      )),
	CONSTRAINT "homepage_sections_item_limit_positive" CHECK ("homepage_sections"."item_limit" > 0 AND "homepage_sections"."item_limit" <= 24)
);
--> statement-breakpoint
ALTER TABLE "homepage_carousel_products" ADD CONSTRAINT "homepage_carousel_products_section_id_homepage_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."homepage_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homepage_carousel_products" ADD CONSTRAINT "homepage_carousel_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "homepage_sections" ADD CONSTRAINT "homepage_sections_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_homepage_carousel_products_section" ON "homepage_carousel_products" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "idx_homepage_sections_sort" ON "homepage_sections" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_homepage_sections_block_type" ON "homepage_sections" USING btree ("block_type");--> statement-breakpoint
INSERT INTO "homepage_sections" (
	"id",
	"section_key",
	"block_type",
	"is_enabled",
	"sort_order",
	"title",
	"cta_label",
	"cta_href",
	"source_type",
	"category_id",
	"item_limit"
)
VALUES
	('hsec-seed-hero', 'hero', 'hero', true, 0, NULL, NULL, NULL, NULL, NULL, 8),
	('hsec-seed-registration', 'registration_reorder', 'registration_reorder', true, 1, NULL, NULL, NULL, NULL, NULL, 8),
	('hsec-seed-top-sellers', NULL, 'carousel', true, 2, 'Najobľúbenejšie', 'Zobraziť všetko', '/e-shop', 'best_sellers', NULL, 8),
	('hsec-seed-brand-story', 'brand_story', 'brand_story', true, 3, NULL, NULL, NULL, NULL, NULL, 8),
	('hsec-seed-stores', 'stores', 'stores', true, 4, NULL, NULL, NULL, NULL, NULL, 8),
	('hsec-seed-loyalty', 'loyalty', 'loyalty', true, 6, NULL, NULL, NULL, NULL, NULL, 8),
	('hsec-seed-game', 'game', 'game', true, 7, NULL, NULL, NULL, NULL, NULL, 8),
	('hsec-seed-blog', 'blog', 'blog', true, 8, NULL, NULL, NULL, NULL, NULL, 8),
	('hsec-seed-b2b', 'b2b_cta', 'b2b_cta', true, 9, NULL, NULL, NULL, NULL, NULL, 8)
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
INSERT INTO "homepage_sections" (
	"id",
	"section_key",
	"block_type",
	"is_enabled",
	"sort_order",
	"title",
	"cta_label",
	"cta_href",
	"source_type",
	"category_id",
	"item_limit"
)
SELECT
	'hsec-seed-pecivo',
	NULL,
	'carousel',
	true,
	5,
	'Naše pečivo',
	'Zobraziť všetko',
	NULL,
	'category',
	c."id",
	8
FROM "categories" c
WHERE c."slug" = 'nase-pecivo'
ON CONFLICT ("id") DO NOTHING;