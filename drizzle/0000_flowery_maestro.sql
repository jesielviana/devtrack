CREATE TABLE "account" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "comment_tracking" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_item_id" text NOT NULL,
	"last_known_comment_id" text,
	"last_known_comment_at" timestamp with time zone,
	"last_known_comment_count" integer DEFAULT 0 NOT NULL,
	"last_viewed_comment_id" text,
	"last_viewed_comment_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_item" (
	"id" text PRIMARY KEY NOT NULL,
	"github_id" text NOT NULL,
	"repository_id" text NOT NULL,
	"repository_name" text NOT NULL,
	"repository_owner" text NOT NULL,
	"number" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"state" text NOT NULL,
	"author" text,
	"is_draft" boolean DEFAULT false NOT NULL,
	"labels" text DEFAULT '[]' NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "github_item_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE TABLE "item_metadata" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_item_id" text NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"target_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_item_id" text,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"image" text,
	"github_login" text,
	"github_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_github_login_unique" UNIQUE("github_login"),
	CONSTRAINT "user_github_user_id_unique" UNIQUE("github_user_id")
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_tracking" ADD CONSTRAINT "comment_tracking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_tracking" ADD CONSTRAINT "comment_tracking_github_item_id_github_item_id_fk" FOREIGN KEY ("github_item_id") REFERENCES "public"."github_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_metadata" ADD CONSTRAINT "item_metadata_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_metadata" ADD CONSTRAINT "item_metadata_github_item_id_github_item_id_fk" FOREIGN KEY ("github_item_id") REFERENCES "public"."github_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_github_item_id_github_item_id_fk" FOREIGN KEY ("github_item_id") REFERENCES "public"."github_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "comment_tracking_user_item_unique" ON "comment_tracking" USING btree ("user_id","github_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_item_repo_number_unique" ON "github_item" USING btree ("repository_id","number");--> statement-breakpoint
CREATE INDEX "github_item_repository_idx" ON "github_item" USING btree ("repository_name");--> statement-breakpoint
CREATE UNIQUE INDEX "item_metadata_user_item_unique" ON "item_metadata" USING btree ("user_id","github_item_id");--> statement-breakpoint
CREATE INDEX "item_metadata_user_status_idx" ON "item_metadata" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "notification_user_read_idx" ON "notification" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_user_item_type_unique" ON "notification" USING btree ("user_id","github_item_id","type");