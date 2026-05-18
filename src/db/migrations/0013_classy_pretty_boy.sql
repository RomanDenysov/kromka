CREATE TABLE "product_prelinks" (
	"product_id" text NOT NULL,
	"linked_product_id" text NOT NULL,
	"label" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_prelinks_product_id_linked_product_id_pk" PRIMARY KEY("product_id","linked_product_id"),
	CONSTRAINT "product_prelinks_no_self_link" CHECK ("product_prelinks"."product_id" <> "product_prelinks"."linked_product_id")
);
--> statement-breakpoint
ALTER TABLE "product_prelinks" ADD CONSTRAINT "product_prelinks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_prelinks" ADD CONSTRAINT "product_prelinks_linked_product_id_products_id_fk" FOREIGN KEY ("linked_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_product_prelinks_linked" ON "product_prelinks" USING btree ("linked_product_id");