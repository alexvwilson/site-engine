-- Rollback: Richtext Primitive Consolidation Migration
-- Converts richtext blocks back to text, markdown, or article based on mode

-- Convert richtext with mode='visual' back to 'text'
UPDATE sections
SET
  block_type = 'text',
  content = content - 'mode'
WHERE block_type = 'richtext' AND content->>'mode' = 'visual';

-- Convert richtext with mode='markdown' back to 'markdown'
-- Move 'markdown' field back to 'body' if needed
UPDATE sections
SET
  block_type = 'markdown',
  content = CASE
    WHEN content->>'markdown' IS NOT NULL THEN
      (content - 'mode' - 'markdown') || jsonb_build_object('body', content->>'markdown')
    ELSE
      content - 'mode'
  END
WHERE block_type = 'richtext' AND content->>'mode' = 'markdown';

-- Convert richtext with mode='article' back to 'article'
UPDATE sections
SET
  block_type = 'article',
  content = content - 'mode'
WHERE block_type = 'richtext' AND content->>'mode' = 'article';
