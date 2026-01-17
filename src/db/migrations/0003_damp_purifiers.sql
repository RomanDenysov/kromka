CREATE TABLE "b2b_applications" (
	"id" text PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL,
	"ico" text NOT NULL,
	"dic" text,
	"ic_dph" text,
	"contact_name" text NOT NULL,
	"contact_email" text NOT NULL,
	"contact_phone" text NOT NULL,
	"billing_address" jsonb,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "b2b_applications" ADD CONSTRAINT "b2b_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_b2b_applications_status" ON "b2b_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_b2b_applications_created_at" ON "b2b_applications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_b2b_applications_reviewed_at" ON "b2b_applications" USING btree ("reviewed_at");