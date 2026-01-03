ALTER TABLE "blog_posts" ADD COLUMN "page_id" uuid;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blog_posts_page_id_idx" ON "blog_posts" USING btree ("page_id");