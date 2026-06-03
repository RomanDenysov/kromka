CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_id" text,
	"actor_type" text DEFAULT 'system' NOT NULL,
	"actor_label" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"summary" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_activity_entity" ON "activity_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_activity_created_at" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_activity_actor" ON "activity_log" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_activity_action" ON "activity_log" USING btree ("action");