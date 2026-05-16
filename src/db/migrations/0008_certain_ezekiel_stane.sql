CREATE TABLE "allergens" (
	"code" text PRIMARY KEY NOT NULL,
	"name_sk" text NOT NULL,
	"name_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "allergen_codes" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
INSERT INTO "allergens" ("code", "name_sk", "name_en", "sort_order") VALUES
  ('gluten',      'Lepok',                       'Gluten',       10),
  ('crustaceans', 'Kôrovce',                     'Crustaceans',  20),
  ('eggs',        'Vajcia',                      'Eggs',         30),
  ('fish',        'Ryby',                        'Fish',         40),
  ('peanuts',     'Arašidy',                     'Peanuts',      50),
  ('soybeans',    'Sójové bôby',                 'Soybeans',     60),
  ('milk',        'Mlieko',                      'Milk',         70),
  ('tree_nuts',   'Orechy',                      'Tree nuts',    80),
  ('celery',      'Zeler',                       'Celery',       90),
  ('mustard',     'Horčica',                     'Mustard',     100),
  ('sesame',      'Sezam',                       'Sesame',      110),
  ('sulphites',   'Oxid siričitý a siričitany',  'Sulphites',   120),
  ('lupin',       'Vlčí bôb',                    'Lupin',       130),
  ('molluscs',    'Mäkkýše',                     'Molluscs',    140);
