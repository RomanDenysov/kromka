-- Extensions used by the fuzzy/duplicate-detection ingredient queries
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint
-- unaccent() is STABLE by default which blocks index usage; wrap in IMMUTABLE.
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE PARALLEL SAFE STRICT
AS $$ SELECT public.unaccent('public.unaccent', $1) $$;--> statement-breakpoint
CREATE TABLE "ingredient_price_history" (
	"id" text PRIMARY KEY NOT NULL,
	"ingredient_id" text NOT NULL,
	"price_per_kg_cents" integer,
	"price_per_piece_cents" integer,
	"supplier_name" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"notes" text,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "iph_price_kg_non_negative" CHECK ("ingredient_price_history"."price_per_kg_cents"    IS NULL OR "ingredient_price_history"."price_per_kg_cents"    >= 0),
	CONSTRAINT "iph_price_piece_non_negative" CHECK ("ingredient_price_history"."price_per_piece_cents" IS NULL OR "ingredient_price_history"."price_per_piece_cents" >= 0),
	CONSTRAINT "iph_price_xor" CHECK (("ingredient_price_history"."price_per_kg_cents"    IS NOT NULL AND "ingredient_price_history"."price_per_piece_cents" IS NULL)
       OR ("ingredient_price_history"."price_per_piece_cents" IS NOT NULL AND "ingredient_price_history"."price_per_kg_cents"    IS NULL))
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Nová surovina' NOT NULL,
	"slug" text NOT NULL,
	"base_unit" text DEFAULT 'g' NOT NULL,
	"grams_per_piece" integer,
	"price_per_kg_cents" integer,
	"price_per_piece_cents" integer,
	"supplier_name" text,
	"allergen_codes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"nutrition_per_100" jsonb,
	"nutrition_source" text DEFAULT 'manual' NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ingredients_slug_unique" UNIQUE("slug"),
	CONSTRAINT "ingredients_price_kg_non_negative" CHECK ("ingredients"."price_per_kg_cents" IS NULL OR "ingredients"."price_per_kg_cents" >= 0),
	CONSTRAINT "ingredients_price_piece_non_negative" CHECK ("ingredients"."price_per_piece_cents" IS NULL OR "ingredients"."price_per_piece_cents" >= 0),
	CONSTRAINT "ingredients_grams_per_piece_when_piece" CHECK (("ingredients"."base_unit" <> 'piece') OR ("ingredients"."grams_per_piece" IS NOT NULL AND "ingredients"."grams_per_piece" > 0)),
	CONSTRAINT "ingredients_price_matches_base_unit" CHECK (("ingredients"."base_unit" = 'g'     AND "ingredients"."price_per_kg_cents"    IS NOT NULL AND "ingredients"."price_per_piece_cents" IS NULL)
       OR ("ingredients"."base_unit" = 'piece' AND "ingredients"."price_per_piece_cents" IS NOT NULL AND "ingredients"."price_per_kg_cents"    IS NULL))
);
--> statement-breakpoint
ALTER TABLE "ingredient_price_history" ADD CONSTRAINT "ingredient_price_history_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_iph_ingredient_effective" ON "ingredient_price_history" USING btree ("ingredient_id","effective_from");--> statement-breakpoint
CREATE INDEX "idx_ingredients_slug" ON "ingredients" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_ingredients_active" ON "ingredients" USING btree ("is_active");--> statement-breakpoint
-- Trigram GIN index for fuzzy/duplicate-suggestion queries (Phase B).
-- Drizzle's index DSL can't express gin_trgm_ops cleanly; raw SQL here.
CREATE INDEX "idx_ingredients_name_trgm" ON "ingredients" USING gin (lower(f_unaccent("name")) gin_trgm_ops);--> statement-breakpoint
-- Seed: ~50 bakery ingredients. Names + allergens + base unit only.
-- Prices placeholder (0) and nutrition NULL — admin fills via the UI / AI autofill.
INSERT INTO "ingredients" ("id","name","slug","base_unit","grams_per_piece","price_per_kg_cents","price_per_piece_cents","allergen_codes","nutrition_source","notes") VALUES
  -- Múky
  ('ing_seed_muka_t550','Hladká múka T550','muka-t550','g',NULL,0,NULL,ARRAY['gluten'],'seed','Cena: doplniť'),
  ('ing_seed_muka_t650','Hladká múka T650','muka-t650','g',NULL,0,NULL,ARRAY['gluten'],'seed','Cena: doplniť'),
  ('ing_seed_muka_t1050','Polohrubá múka T1050','muka-t1050','g',NULL,0,NULL,ARRAY['gluten'],'seed','Cena: doplniť'),
  ('ing_seed_muka_t1800','Hrubá múka T1800','muka-t1800','g',NULL,0,NULL,ARRAY['gluten'],'seed','Cena: doplniť'),
  ('ing_seed_muka_spaldova','Špaldová múka','muka-spaldova','g',NULL,0,NULL,ARRAY['gluten'],'seed','Cena: doplniť'),
  ('ing_seed_muka_razna_tmava','Ražná múka tmavá','muka-razna-tmava','g',NULL,0,NULL,ARRAY['gluten'],'seed','Cena: doplniť'),
  ('ing_seed_muka_razna_svetla','Ražná múka svetlá','muka-razna-svetla','g',NULL,0,NULL,ARRAY['gluten'],'seed','Cena: doplniť'),
  ('ing_seed_muka_kukuricna','Kukuričná múka','muka-kukuricna','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  -- Tekutiny / mlieko
  ('ing_seed_voda','Voda','voda','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_mlieko_1_5','Mlieko 1,5 %','mlieko-1-5','g',NULL,0,NULL,ARRAY['milk'],'seed','Cena: doplniť'),
  ('ing_seed_mlieko_3_5','Mlieko 3,5 %','mlieko-3-5','g',NULL,0,NULL,ARRAY['milk'],'seed','Cena: doplniť'),
  ('ing_seed_smotana_33','Smotana 33 %','smotana-33','g',NULL,0,NULL,ARRAY['milk'],'seed','Cena: doplniť'),
  ('ing_seed_kysla_smotana','Kyslá smotana','kysla-smotana','g',NULL,0,NULL,ARRAY['milk'],'seed','Cena: doplniť'),
  ('ing_seed_cmar','Cmar','cmar','g',NULL,0,NULL,ARRAY['milk'],'seed','Cena: doplniť'),
  -- Cukry / sladidlá
  ('ing_seed_kristal_cukor','Kryštálový cukor','kristal-cukor','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_prasok_cukor','Práškový cukor','praskovy-cukor','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_hnedy_cukor','Hnedý cukor','hnedy-cukor','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_med','Med','med','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_glukozovy_sirup','Glukózový sirup','glukozovy-sirup','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  -- Tuky
  ('ing_seed_maslo','Maslo','maslo','g',NULL,0,NULL,ARRAY['milk'],'seed','Cena: doplniť'),
  ('ing_seed_sadlo','Sadlo','sadlo','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_slnecnicovy_olej','Slnečnicový olej','slnecnicovy-olej','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_olivovy_olej','Olivový olej','olivovy-olej','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_repkovy_olej','Repkový olej','repkovy-olej','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  -- Vajcia (piece-based)
  ('ing_seed_vajce_m','Vajce M','vajce-m','piece',50,NULL,0,ARRAY['eggs'],'seed','Cena: doplniť'),
  -- Soli / koreniny
  ('ing_seed_morska_sol','Morská soľ','morska-sol','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_jemna_sol','Jemná soľ','jemna-sol','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_mleta_rasca','Mletá rasca','mleta-rasca','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_mlety_zazvor','Mletý zázvor','mlety-zazvor','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_vanilkovy_cukor','Vanilkový cukor','vanilkovy-cukor','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  -- Kysniace
  ('ing_seed_cerstve_drozdie','Čerstvé droždie','cerstve-drozdie','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_susene_drozdie','Sušené droždie','susene-drozdie','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_prasok_pecivo','Prášok do pečiva','prasok-do-peciva','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_soda_bikarbona','Sóda bikarbóna','soda-bikarbona','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  -- Orechy / semienka
  ('ing_seed_vlasske_orechy','Vlašské orechy','vlasske-orechy','g',NULL,0,NULL,ARRAY['tree_nuts'],'seed','Cena: doplniť'),
  ('ing_seed_mandle','Mandle','mandle','g',NULL,0,NULL,ARRAY['tree_nuts'],'seed','Cena: doplniť'),
  ('ing_seed_lieskovce','Lieskovce','lieskovce','g',NULL,0,NULL,ARRAY['tree_nuts'],'seed','Cena: doplniť'),
  ('ing_seed_slnecnicove_seminka','Slnečnicové semienka','slnecnicove-semienka','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_sezamove_seminka','Sezamové semienka','sezamove-semienka','g',NULL,0,NULL,ARRAY['sesame'],'seed','Cena: doplniť'),
  ('ing_seed_lanove_seminka','Ľanové semienka','lanove-semienka','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_makove_seminka','Makové semienka','makove-semienka','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_tekvicove_seminka','Tekvicové semienka','tekvicove-semienka','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  -- Sušené ovocie
  ('ing_seed_hrozienka','Hrozienka','hrozienka','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_susene_brusnice','Sušené brusnice','susene-brusnice','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_susene_marhule','Sušené marhule','susene-marhule','g',NULL,0,NULL,ARRAY['sulphites'],'seed','Cena: doplniť'),
  ('ing_seed_susene_slivky','Sušené slivky','susene-slivky','g',NULL,0,NULL,ARRAY['sulphites'],'seed','Cena: doplniť'),
  -- Špeciality
  ('ing_seed_kakao_prasok','Kakaový prášok','kakaovy-prasok','g',NULL,0,NULL,ARRAY[]::text[],'seed','Cena: doplniť'),
  ('ing_seed_cokolada_70','Čokoláda 70 %','cokolada-70','g',NULL,0,NULL,ARRAY['milk','soybeans'],'seed','Cena: doplniť'),
  ('ing_seed_mascarpone','Mascarpone','mascarpone','g',NULL,0,NULL,ARRAY['milk'],'seed','Cena: doplniť'),
  ('ing_seed_syr_niva','Syr Niva','syr-niva','g',NULL,0,NULL,ARRAY['milk'],'seed','Cena: doplniť');
--> statement-breakpoint
-- Mirror price-history rows for every seeded ingredient.
INSERT INTO "ingredient_price_history" ("id","ingredient_id","price_per_kg_cents","price_per_piece_cents","source","notes")
SELECT 'iph_seed_' || substring(i.id from 10), i.id, i.price_per_kg_cents, i.price_per_piece_cents, 'seed', 'Seed price (zero placeholder)'
FROM "ingredients" i
WHERE i.nutrition_source = 'seed';
