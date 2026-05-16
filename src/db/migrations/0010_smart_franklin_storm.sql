CREATE TABLE "recipe_items" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"ingredient_id" text,
	"sub_recipe_id" text,
	"quantity_base_unit" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"notes" text,
	CONSTRAINT "recipe_items_unique_ingredient" UNIQUE("recipe_id","ingredient_id"),
	CONSTRAINT "recipe_items_unique_subrecipe" UNIQUE("recipe_id","sub_recipe_id"),
	CONSTRAINT "recipe_items_xor_ingredient_or_subrecipe" CHECK (("recipe_items"."ingredient_id" IS NOT NULL) <> ("recipe_items"."sub_recipe_id" IS NOT NULL)),
	CONSTRAINT "recipe_items_quantity_positive" CHECK ("recipe_items"."quantity_base_unit" > 0),
	CONSTRAINT "recipe_items_no_self_reference" CHECK ("recipe_items"."sub_recipe_id" IS NULL OR "recipe_items"."sub_recipe_id" <> "recipe_items"."recipe_id")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Nový recept' NOT NULL,
	"slug" text NOT NULL,
	"kind" text DEFAULT 'product' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"batch_yield_units" integer DEFAULT 1 NOT NULL,
	"batch_yield_grams" integer DEFAULT 0 NOT NULL,
	"yield_loss_percent" integer DEFAULT 10 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recipes_slug_unique" UNIQUE("slug"),
	CONSTRAINT "recipes_yield_units_positive" CHECK ("recipes"."batch_yield_units" > 0),
	CONSTRAINT "recipes_yield_grams_non_negative" CHECK ("recipes"."batch_yield_grams" >= 0),
	CONSTRAINT "recipes_loss_percent_range" CHECK ("recipes"."yield_loss_percent" >= 0 AND "recipes"."yield_loss_percent" <= 50)
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "recipe_id" text;--> statement-breakpoint
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_sub_recipe_id_recipes_id_fk" FOREIGN KEY ("sub_recipe_id") REFERENCES "public"."recipes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_recipe_items_recipe_id" ON "recipe_items" USING btree ("recipe_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_recipe_items_ingredient_id" ON "recipe_items" USING btree ("ingredient_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_items_sub_recipe_id" ON "recipe_items" USING btree ("sub_recipe_id");--> statement-breakpoint
CREATE INDEX "idx_recipes_kind_status" ON "recipes" USING btree ("kind","status");--> statement-breakpoint
CREATE INDEX "idx_recipes_slug" ON "recipes" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_products_recipe_id" ON "products" USING btree ("recipe_id");
