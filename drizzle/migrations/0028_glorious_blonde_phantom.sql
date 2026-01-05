CREATE TABLE "landing_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"company" varchar(255),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "landing_contacts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "idx_landing_contacts_email" ON "landing_contacts" USING btree ("email");