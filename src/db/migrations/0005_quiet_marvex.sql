ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "parent_id";--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_product_unique" UNIQUE("user_id","product_id");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_total_cents_non_negative" CHECK ("invoices"."total_cents" >= 0);--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_price_non_negative" CHECK ("order_items"."price" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_total_cents_non_negative" CHECK ("orders"."total_cents" >= 0);--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_cents_non_negative" CHECK ("orders"."discount_cents" >= 0);--> statement-breakpoint
ALTER TABLE "prices" ADD CONSTRAINT "prices_price_cents_non_negative" CHECK ("prices"."price_cents" >= 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_price_cents_non_negative" CHECK ("products"."price_cents" >= 0);--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_value_non_negative" CHECK ("promo_codes"."value" >= 0);--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_min_order_cents_non_negative" CHECK ("promo_codes"."min_order_cents" >= 0);