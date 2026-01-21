# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Database Migration to Primitives - Schema Modernization

### Goal Statement
**Goal:** Add `primitive` and `preset` columns to the sections table to normalize the schema after primitive consolidation. Backfill existing records from old `block_type` values and enable new sections to write both formats. This cleans up technical debt and creates a foundation for future block type management.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
This task has **one clear technical approach** (add columns + backfill), so strategic analysis is **not required**. The implementation pattern is straightforward database migration work.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State

The primitive consolidation work is **complete**:
- **RichText** (#73): Consolidates `text`, `markdown`, `article` → `richtext` with mode
- **Cards** (#74): Consolidates `features`, `testimonials`, `product_grid` → `cards` with template
- **Hero** (#75): Consolidates `hero`, `cta`, `heading` → `hero_primitive` with layout
- **Media** (#76): Consolidates `image`, `gallery`, `embed` → `media` with mode
- **Blog** (#80): Consolidates `blog_featured`, `blog_grid` → `blog` with mode

**Current Problem:**
- Database still stores old `block_type` values ("text", "markdown", "features", etc.)
- No explicit `primitive` or `preset` columns to normalize the data
- Block type selection in UI shows both old and new block types
- Renderers and editors must support both patterns

### Existing Codebase Analysis

#### Block Type to Primitive Mapping

| Old block_type | Primitive | Preset/Mode |
|---------------|-----------|-------------|
| `text` | `richtext` | `visual` |
| `markdown` | `richtext` | `markdown` |
| `article` | `richtext` | `article` |
| `hero` | `hero_primitive` | `full` |
| `cta` | `hero_primitive` | `cta` |
| `heading` | `hero_primitive` | `title-only` |
| `features` | `cards` | `feature` |
| `testimonials` | `cards` | `testimonial` |
| `product_grid` | `cards` | `product` |
| `image` | `media` | `single` |
| `gallery` | `media` | `gallery` |
| `embed` | `media` | `embed` |
| `blog_featured` | `blog` | `featured` |
| `blog_grid` | `blog` | `grid` |
| `header` | `header` | `null` (standalone) |
| `footer` | `footer` | `null` (standalone) |
| `contact` | `contact` | `null` (standalone) |
| `social_links` | `social_links` | `null` (standalone) |
| `richtext` | `richtext` | *from content.mode* |
| `hero_primitive` | `hero_primitive` | *from content.layout* |
| `cards` | `cards` | *from content.template* |
| `media` | `media` | *from content.mode* |
| `blog` | `blog` | *from content.mode* |

---

## 4. Context & Problem Definition

### Problem Statement
After completing primitive consolidation, the database schema has accumulated technical debt:
1. The `block_type` column contains both old values ("text", "markdown") and new primitive values ("richtext")
2. No clean separation between "what primitive is this" vs "what preset/mode is it using"
3. Queries must handle multiple block type values to find equivalent content
4. UI shows duplicate options (e.g., both "Text" and "Rich Text" in picker)

### Success Criteria
- [ ] New `primitive` column added to sections table
- [ ] New `preset` column added to sections table
- [ ] All existing sections backfilled with correct primitive/preset values
- [ ] New section creation writes both `block_type` AND `primitive`/`preset`
- [ ] Queries can filter by `primitive` column for cleaner logic
- [ ] Down migration created and tested for safe rollback
- [ ] Existing renderers and editors continue working (backward compatible)

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make changes
- **Data loss acceptable** - existing data can be migrated
- **Users are developers/testers** - not production users
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- [ ] Add `primitive` column to sections table (text, not null after backfill)
- [ ] Add `preset` column to sections table (text, nullable - standalone blocks have no preset)
- [ ] Migration script backfills values based on mapping table
- [ ] `addSection` action writes both `block_type` and `primitive`/`preset`
- [ ] `updateSection` action maintains both columns

### Non-Functional Requirements
- **Performance:** Backfill migration should complete in reasonable time (< 2 minutes for typical dataset)
- **Safety:** Down migration must be able to undo all changes
- **Compatibility:** Existing code continues to work during transition period

### Technical Constraints
- [ ] Must use Drizzle ORM migration system
- [ ] Cannot break existing renderers that read `block_type`
- [ ] Must create down migration BEFORE running up migration

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- Add primitive column (initially nullable for migration)
ALTER TABLE sections ADD COLUMN primitive TEXT;

-- Add preset column (nullable, standalone blocks have no preset)
ALTER TABLE sections ADD COLUMN preset TEXT;

-- Create indexes for query optimization
CREATE INDEX sections_primitive_idx ON sections(primitive);
CREATE INDEX sections_primitive_preset_idx ON sections(primitive, preset);
```

### Data Model Updates

```typescript
// lib/drizzle/schema/sections.ts
export const PRIMITIVES = [
  "header",
  "footer",
  "contact",
  "social_links",
  "richtext",
  "hero_primitive",
  "cards",
  "media",
  "blog",
] as const;

export type Primitive = (typeof PRIMITIVES)[number];

export const PRESETS = {
  richtext: ["visual", "markdown", "article"] as const,
  hero_primitive: ["full", "compact", "cta", "title-only"] as const,
  cards: ["feature", "testimonial", "product"] as const,
  media: ["single", "gallery", "embed"] as const,
  blog: ["featured", "grid"] as const,
} as const;

// Add columns to schema
export const sections = pgTable("sections", {
  // ... existing columns ...
  primitive: text("primitive"), // Will be NOT NULL after migration
  preset: text("preset"),       // Nullable for standalone blocks
  // ...
});
```

### Data Migration Plan

**Phase 1: Add columns (nullable)**
- [ ] Add `primitive` column as nullable
- [ ] Add `preset` column as nullable
- [ ] Add indexes

**Phase 2: Backfill existing data**
- [ ] Run SQL UPDATE statements based on block_type mapping
- [ ] For new primitives, extract preset from content JSON

**Phase 3: Set NOT NULL constraint**
- [ ] Verify all rows have `primitive` value
- [ ] Alter column to NOT NULL

### Backfill SQL

```sql
-- Backfill primitive and preset from old block_type values
UPDATE sections SET primitive = 'richtext', preset = 'visual' WHERE block_type = 'text';
UPDATE sections SET primitive = 'richtext', preset = 'markdown' WHERE block_type = 'markdown';
UPDATE sections SET primitive = 'richtext', preset = 'article' WHERE block_type = 'article';
UPDATE sections SET primitive = 'hero_primitive', preset = 'full' WHERE block_type = 'hero';
UPDATE sections SET primitive = 'hero_primitive', preset = 'cta' WHERE block_type = 'cta';
UPDATE sections SET primitive = 'hero_primitive', preset = 'title-only' WHERE block_type = 'heading';
UPDATE sections SET primitive = 'cards', preset = 'feature' WHERE block_type = 'features';
UPDATE sections SET primitive = 'cards', preset = 'testimonial' WHERE block_type = 'testimonials';
UPDATE sections SET primitive = 'cards', preset = 'product' WHERE block_type = 'product_grid';
UPDATE sections SET primitive = 'media', preset = 'single' WHERE block_type = 'image';
UPDATE sections SET primitive = 'media', preset = 'gallery' WHERE block_type = 'gallery';
UPDATE sections SET primitive = 'media', preset = 'embed' WHERE block_type = 'embed';
UPDATE sections SET primitive = 'blog', preset = 'featured' WHERE block_type = 'blog_featured';
UPDATE sections SET primitive = 'blog', preset = 'grid' WHERE block_type = 'blog_grid';

-- Standalone blocks (no preset)
UPDATE sections SET primitive = 'header', preset = NULL WHERE block_type = 'header';
UPDATE sections SET primitive = 'footer', preset = NULL WHERE block_type = 'footer';
UPDATE sections SET primitive = 'contact', preset = NULL WHERE block_type = 'contact';
UPDATE sections SET primitive = 'social_links', preset = NULL WHERE block_type = 'social_links';

-- New primitive block types - extract preset from content JSON
UPDATE sections SET
  primitive = 'richtext',
  preset = content->>'mode'
WHERE block_type = 'richtext';

UPDATE sections SET
  primitive = 'hero_primitive',
  preset = content->>'layout'
WHERE block_type = 'hero_primitive';

UPDATE sections SET
  primitive = 'cards',
  preset = content->>'template'
WHERE block_type = 'cards';

UPDATE sections SET
  primitive = 'media',
  preset = content->>'mode'
WHERE block_type = 'media';

UPDATE sections SET
  primitive = 'blog',
  preset = content->>'mode'
WHERE block_type = 'blog';
```

### Down Migration

```sql
-- down.sql - Rollback migration
-- WARNING: This will remove the primitive and preset columns

-- Drop indexes first
DROP INDEX IF EXISTS sections_primitive_preset_idx;
DROP INDEX IF EXISTS sections_primitive_idx;

-- Drop columns
ALTER TABLE sections DROP COLUMN IF EXISTS preset;
ALTER TABLE sections DROP COLUMN IF EXISTS primitive;
```

### 🚨 MANDATORY: Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate` to create the migration file
- [ ] **Step 2: Create Down Migration** - Follow `drizzle_down_migration.md` template
- [ ] **Step 3: Create Subdirectory** - Create `drizzle/migrations/[timestamp_name]/` directory
- [ ] **Step 4: Generate down.sql** - Create the `down.sql` file with safe rollback operations
- [ ] **Step 5: Verify Safety** - Ensure all operations use `IF EXISTS`
- [ ] **Step 6: Apply Migration** - Only after down migration is created, run `npm run db:migrate`

---

## 8. Backend Changes

### Server Actions Updates

#### `app/actions/sections.ts`

Update `addSection` to write both formats:

```typescript
export async function addSection(
  pageId: string,
  blockType: BlockType,
  content: SectionContent,
  position?: number
) {
  // ... existing validation ...

  // Compute primitive and preset from blockType and content
  const { primitive, preset } = computePrimitiveAndPreset(blockType, content);

  const [section] = await db
    .insert(sections)
    .values({
      page_id: pageId,
      user_id: userId,
      block_type: blockType,
      primitive,      // NEW
      preset,         // NEW
      content,
      position: actualPosition,
    })
    .returning();

  // ...
}
```

#### New utility function `lib/primitive-utils.ts`

```typescript
import type { BlockType } from "@/lib/drizzle/schema/sections";
import type { SectionContent } from "@/lib/section-types";

export interface PrimitiveInfo {
  primitive: string;
  preset: string | null;
}

/**
 * Maps a block_type and content to the normalized primitive/preset format
 */
export function computePrimitiveAndPreset(
  blockType: BlockType,
  content: SectionContent
): PrimitiveInfo {
  // Old block types map to primitives
  const OLD_TO_PRIMITIVE: Record<string, PrimitiveInfo> = {
    text: { primitive: "richtext", preset: "visual" },
    markdown: { primitive: "richtext", preset: "markdown" },
    article: { primitive: "richtext", preset: "article" },
    hero: { primitive: "hero_primitive", preset: "full" },
    cta: { primitive: "hero_primitive", preset: "cta" },
    heading: { primitive: "hero_primitive", preset: "title-only" },
    features: { primitive: "cards", preset: "feature" },
    testimonials: { primitive: "cards", preset: "testimonial" },
    product_grid: { primitive: "cards", preset: "product" },
    image: { primitive: "media", preset: "single" },
    gallery: { primitive: "media", preset: "gallery" },
    embed: { primitive: "media", preset: "embed" },
    blog_featured: { primitive: "blog", preset: "featured" },
    blog_grid: { primitive: "blog", preset: "grid" },
    // Standalone blocks
    header: { primitive: "header", preset: null },
    footer: { primitive: "footer", preset: null },
    contact: { primitive: "contact", preset: null },
    social_links: { primitive: "social_links", preset: null },
  };

  // Check if it's an old block type
  if (blockType in OLD_TO_PRIMITIVE) {
    return OLD_TO_PRIMITIVE[blockType];
  }

  // New primitive types - extract preset from content
  switch (blockType) {
    case "richtext":
      return {
        primitive: "richtext",
        preset: (content as { mode?: string }).mode ?? "visual"
      };
    case "hero_primitive":
      return {
        primitive: "hero_primitive",
        preset: (content as { layout?: string }).layout ?? "full"
      };
    case "cards":
      return {
        primitive: "cards",
        preset: (content as { template?: string }).template ?? "feature"
      };
    case "media":
      return {
        primitive: "media",
        preset: (content as { mode?: string }).mode ?? "single"
      };
    case "blog":
      return {
        primitive: "blog",
        preset: (content as { mode?: string }).mode ?? "featured"
      };
    default:
      // Fallback for any unexpected block type
      return { primitive: blockType, preset: null };
  }
}
```

---

## 9. Frontend Changes

### No immediate frontend changes required

The frontend will continue to use `block_type` for routing to renderers/editors. The `primitive` and `preset` columns are backend normalization for future use.

**Future Enhancement (not in this task):**
- Update BlockPicker to only show primitive block types
- Hide legacy block types from UI
- Update queries to use `primitive` column

---

## 10. Code Changes Overview

### 📂 **Files to Create**
1. `lib/primitive-utils.ts` - Utility function for computing primitive/preset
2. `drizzle/migrations/XXXX_add_primitive_preset_columns.sql` - Migration file
3. `drizzle/migrations/XXXX_add_primitive_preset_columns/down.sql` - Down migration

### 📂 **Files to Modify**
1. `lib/drizzle/schema/sections.ts` - Add primitive/preset columns and types
2. `app/actions/sections.ts` - Update addSection to write both columns

### 🎯 **Key Changes Summary**
- [ ] **Schema Addition:** Add `primitive` and `preset` columns to sections table
- [ ] **Data Backfill:** Migrate existing data based on block_type mapping
- [ ] **New Utility:** Create `computePrimitiveAndPreset()` function
- [ ] **Action Update:** Modify `addSection` to populate new columns
- [ ] **Impact:** Lays groundwork for deprecating old block types in future

---

## 11. Implementation Plan

### Phase 1: Schema Changes
**Goal:** Add columns and create migration

- [ ] **Task 1.1:** Update Drizzle schema file
  - Files: `lib/drizzle/schema/sections.ts`
  - Details: Add PRIMITIVES array, primitive/preset columns
- [ ] **Task 1.2:** Generate database migration
  - Command: `npm run db:generate`
  - Details: Generate SQL migration file
- [ ] **Task 1.3:** Create down migration
  - Files: `drizzle/migrations/XXXX/down.sql`
  - Details: Follow drizzle_down_migration.md template
- [ ] **Task 1.4:** Apply migration
  - Command: `npm run db:migrate`
  - Details: Only after down migration is verified

### Phase 2: Backfill Data
**Goal:** Populate new columns for all existing sections

- [ ] **Task 2.1:** Create backfill SQL script
  - Files: Create temporary script or run via SQL client
  - Details: Execute UPDATE statements from Data Migration Plan
- [ ] **Task 2.2:** Verify backfill
  - Details: Query to confirm all sections have primitive value
  - Verification: `SELECT COUNT(*) FROM sections WHERE primitive IS NULL` = 0

### Phase 3: Add NOT NULL Constraint
**Goal:** Make primitive column required

- [ ] **Task 3.1:** Generate constraint migration
  - Files: New migration file
  - Details: `ALTER TABLE sections ALTER COLUMN primitive SET NOT NULL`
- [ ] **Task 3.2:** Create down migration for constraint
  - Files: `drizzle/migrations/XXXX/down.sql`
- [ ] **Task 3.3:** Apply constraint migration
  - Command: `npm run db:migrate`

### Phase 4: Backend Integration
**Goal:** Update server actions to write both columns

- [ ] **Task 4.1:** Create primitive utilities
  - Files: `lib/primitive-utils.ts`
  - Details: `computePrimitiveAndPreset()` function
- [ ] **Task 4.2:** Update addSection action
  - Files: `app/actions/sections.ts`
  - Details: Write primitive/preset on insert
- [ ] **Task 4.3:** Update updateSection action (if content changes)
  - Files: `app/actions/sections.ts`
  - Details: Keep primitive/preset in sync when mode/template changes

### Phase 5: Verification
**Goal:** Ensure everything works correctly

- [ ] **Task 5.1:** Create new section via UI
  - Details: Verify primitive/preset columns populated correctly
- [ ] **Task 5.2:** Verify existing sections still render
  - Details: Check all block types display properly
- [ ] **Task 5.3:** Run linting and type-check
  - Command: `npm run lint && npm run type-check`

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

🚨 **CRITICAL: Real-time task completion tracking is mandatory**

- [ ] **🗓️ GET TODAY'S DATE FIRST** - Use time tool before adding timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp

---

## 13. File Structure & Organization

### New Files to Create
```
site-engine/
├── lib/
│   └── primitive-utils.ts              # Primitive/preset computation
└── drizzle/migrations/
    ├── XXXX_add_primitive_preset.sql   # Schema migration
    └── XXXX_add_primitive_preset/
        └── down.sql                     # Rollback migration
```

### Files to Modify
- `lib/drizzle/schema/sections.ts` - Schema definition
- `app/actions/sections.ts` - Server actions

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Backfill Missing Data:** What if some content doesn't have expected mode/layout field?
  - **Mitigation:** Use fallback defaults in backfill SQL
- [ ] **Migration Failure:** What if migration fails mid-backfill?
  - **Mitigation:** Down migration allows clean rollback

### Edge Cases
- [ ] **New Primitive Sections:** Sections created with new primitives already have correct block_type
  - **Handling:** Extract preset from content JSON
- [ ] **Content Mode Changes:** User changes mode in editor (e.g., visual → markdown)
  - **Handling:** Update preset column when content mode changes

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with schema changes (Phase 1)
2. Create and verify down migration before applying
3. Backfill data carefully with verification
4. Update server actions last

### Code Quality Standards
- [ ] Use TypeScript strict types for primitive/preset values
- [ ] Add proper indexes for query performance
- [ ] Follow existing Drizzle patterns in codebase

---

## 17. Notes & Additional Context

### Research Links
- Drizzle ORM migrations: https://orm.drizzle.team/docs/migrations
- PostgreSQL ALTER TABLE: https://www.postgresql.org/docs/current/sql-altertable.html

### Future Work (not in this task)
- Deprecate old block types from BLOCK_TYPES array
- Update BlockPicker to only show primitive blocks
- Remove duplicate block type entries from UI
- Update queries to filter by primitive instead of block_type

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [ ] **Existing API Contracts:** No breaking changes - old `block_type` column preserved
- [ ] **Database Dependencies:** Renderers still read `block_type` - backward compatible
- [ ] **Component Dependencies:** No frontend changes in this task

#### Ripple Effects Assessment
- [ ] **Data Flow Impact:** Minimal - new columns are additive
- [ ] **UI/UX Cascading Effects:** None in this task
- [ ] **State Management:** No changes to frontend state

#### Performance Implications
- [ ] **Database Query Impact:** New indexes improve future query flexibility
- [ ] **Bundle Size:** Minimal increase (new utility file)

### Mitigation Strategies
- [ ] **Backup Strategy:** Down migration provides complete rollback
- [ ] **Gradual Migration:** Old code continues working during transition
- [ ] **Verification Steps:** Count queries to confirm all data migrated

---

*Template Version: 1.0*
*Created: 2026-01-21*
*Task Number: 080*
