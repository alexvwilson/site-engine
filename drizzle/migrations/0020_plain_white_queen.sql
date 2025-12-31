ALTER TABLE "sections" ADD COLUMN "anchor_id" text;--> statement-breakpoint
CREATE INDEX "sections_page_anchor_idx" ON "sections" USING btree ("page_id","anchor_id");