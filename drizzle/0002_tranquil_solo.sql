CREATE TABLE "repository_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"repository_id" text NOT NULL,
	"repository_name" text NOT NULL,
	"ignored" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "repository_preference" ADD CONSTRAINT "repository_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "repository_preference_user_repository_unique" ON "repository_preference" USING btree ("user_id","repository_id");--> statement-breakpoint
CREATE INDEX "repository_preference_user_ignored_idx" ON "repository_preference" USING btree ("user_id","ignored");