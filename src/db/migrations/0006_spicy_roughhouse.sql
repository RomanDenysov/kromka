CREATE TABLE "hero_banners" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"heading" text,
	"subtitle" text,
	"image_id" text,
	"cta_label" text,
	"cta_href" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hero_banners" ADD CONSTRAINT "hero_banners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hero_banners_active_idx" ON "hero_banners" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "orders_company_id_idx" ON "orders" USING btree ("company_id");