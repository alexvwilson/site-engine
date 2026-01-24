CREATE TABLE "landing_faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" varchar(500) NOT NULL,
	"answer" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "landing_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"icon_name" varchar(50) DEFAULT 'sparkles' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_landing_faqs_order" ON "landing_faqs" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "idx_landing_faqs_active" ON "landing_faqs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_landing_features_order" ON "landing_features" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "idx_landing_features_active" ON "landing_features" USING btree ("is_active");