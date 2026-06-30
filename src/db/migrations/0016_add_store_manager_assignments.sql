CREATE TABLE "store_manager_assignments" (
	"store_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'manager' NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_manager_assignments_store_id_user_id_pk" PRIMARY KEY("store_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "store_manager_assignments" ADD CONSTRAINT "store_manager_assignments_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_manager_assignments" ADD CONSTRAINT "store_manager_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_manager_assignments" ADD CONSTRAINT "store_manager_assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_store_manager_assignments_user_id" ON "store_manager_assignments" USING btree ("user_id");