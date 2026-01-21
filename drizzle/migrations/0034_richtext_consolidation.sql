-- Richtext Primitive Consolidation Migration
-- Converts text, markdown, and article block types to the unified richtext type

-- Convert 'text' blocks to 'richtext' with mode='visual'
UPDATE sections
SET
  block_type = 'richtext',
  content = jsonb_set(content, '{mode}', '"visual"')
WHERE block_type = 'text';

-- Convert 'markdown' blocks to 'richtext' with mode='markdown'
-- Move 'body' to 'markdown' field (if body exists and markdown doesn't)
UPDATE sections
SET
  block_type = 'richtext',
  content = CASE
    WHEN content->>'body' IS NOT NULL AND content->>'markdown' IS NULL THEN
      jsonb_set(
        jsonb_set(content, '{mode}', '"markdown"'),
        '{markdown}',
        to_jsonb(content->>'body')
      )
    ELSE
      jsonb_set(content, '{mode}', '"markdown"')
  END
WHERE block_type = 'markdown';

-- Convert 'article' blocks to 'richtext' with mode='article'
UPDATE sections
SET
  block_type = 'richtext',
  content = jsonb_set(content, '{mode}', '"article"')
WHERE block_type = 'article';
