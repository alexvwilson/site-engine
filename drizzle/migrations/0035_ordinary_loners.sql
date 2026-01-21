ALTER TABLE "sections" ADD COLUMN "primitive" text;--> statement-breakpoint
ALTER TABLE "sections" ADD COLUMN "preset" text;--> statement-breakpoint
CREATE INDEX "sections_primitive_idx" ON "sections" USING btree ("primitive");--> statement-breakpoint
CREATE INDEX "sections_primitive_preset_idx" ON "sections" USING btree ("primitive","preset");