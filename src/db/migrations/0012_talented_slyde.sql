ALTER TABLE "products" ALTER COLUMN "description" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description_text" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "weight_value" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "weight_unit" text;