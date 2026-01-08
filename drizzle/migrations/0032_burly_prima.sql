-- Add slug column as nullable first
ALTER TABLE "documents" ADD COLUMN "slug" text;

-- Generate slugs for existing documents from filename
-- Remove file extension, lowercase, replace spaces/special chars with hyphens
UPDATE "documents"
SET "slug" = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(filename, '\.[^.]+$', ''),  -- Remove file extension
      '[^a-zA-Z0-9\s-]', '', 'g'                  -- Remove special chars
    ),
    '\s+', '-', 'g'                               -- Replace spaces with hyphens
  )
);

-- Handle any duplicate slugs within the same site by appending row number
WITH duplicates AS (
  SELECT id, site_id, slug,
    ROW_NUMBER() OVER (PARTITION BY site_id, slug ORDER BY created_at) as rn
  FROM documents
)
UPDATE documents d
SET slug = d.slug || '-' || (duplicates.rn - 1)
FROM duplicates
WHERE d.id = duplicates.id AND duplicates.rn > 1;

-- Now make the column NOT NULL
ALTER TABLE "documents" ALTER COLUMN "slug" SET NOT NULL;

--> statement-breakpoint
-- Add unique constraint
ALTER TABLE "documents" ADD CONSTRAINT "documents_slug_unique" UNIQUE("site_id","slug");
