CREATE TABLE "image_albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "image_albums_site_name_unique" UNIQUE("site_id","name")
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"album_id" uuid,
	"storage_path" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "images_storage_path_unique" UNIQUE("site_id","storage_path")
);
--> statement-breakpoint
ALTER TABLE "image_albums" ADD CONSTRAINT "image_albums_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_album_id_image_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."image_albums"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "image_albums_site_id_idx" ON "image_albums" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "image_albums_display_order_idx" ON "image_albums" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "images_site_id_idx" ON "images" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "images_album_id_idx" ON "images" USING btree ("album_id");--> statement-breakpoint
CREATE INDEX "images_created_at_idx" ON "images" USING btree ("created_at");