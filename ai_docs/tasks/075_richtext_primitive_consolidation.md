# AI Task Template

---

## 1. Task Overview

### Task Title
**Title:** RichText Primitive Consolidation - Unify text/markdown/article blocks

### Goal Statement
**Goal:** Consolidate three similar block types (text, markdown, article) into a single unified `richtext` primitive with mode switching. This eliminates ~200+ lines of duplicated renderer logic, simplifies the codebase, and establishes the pattern for future primitive consolidations (Cards, Hero, Media).

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Strategic analysis conducted - only one clear approach exists after prerequisite #81 (Shared Styling Interface) was completed.

### Problem Context
The codebase has three block types that are essentially "formatted text content with styling options":
- **text** - HTML body from TipTap visual editor
- **markdown** - Markdown source rendered to HTML
- **article** - HTML body with inline image support

All three share 90%+ of the same rendering logic (prose styling, borders, backgrounds, typography) but have separate editors (76, 121, 132 lines) and renderers (303, 381, 355 lines = 1,039 total).

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Single `richtext` block type with `mode` discriminator

**Why this is the best choice:**
1. **Code reduction** - Extract ~200 lines of shared renderer logic, reduce total from 1,039 to ~500 lines
2. **Consistency** - All text-based blocks share identical styling behavior
3. **Maintainability** - Bug fixes and enhancements apply to all modes at once
4. **Clean migration** - User approved clean migration, no backward compatibility needed

**Key Decision Factors:**
- **Performance Impact:** Negligible - same rendering, consolidated code
- **User Experience:** Improved - users can switch modes without recreating sections
- **Maintainability:** Significantly improved - single source of truth
- **Scalability:** Establishes pattern for Cards/Hero/Media consolidation

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Key Architectural Patterns:** Server Components, Server Actions, StylingControls composition

### Current State

**Three separate block implementations:**

| Block | Editor Lines | Renderer Lines | Unique Features |
|-------|-------------|----------------|-----------------|
| text | 76 | 303 | Plain HTML, TipTap |
| markdown | 121 | 381 | Markdown textarea, code styles, live preview |
| article | 132 | 355 | ArticleTipTap, inline image float styles, imageRounding |

**Duplicated code across all three renderers:**
- `getTextColors()` - 30 lines each
- `getBoxBackgroundColor()` - 16 lines each
- Plain mode prose styles - ~85 lines each
- Styled mode prose styles - ~79 lines each
- Section/container style calculations - ~15 lines each

**Total duplication:** ~225 lines x 3 = 675 lines of near-identical code

### Existing Codebase Analysis

**Relevant Analysis Completed:**

- [x] **Database Schema** (`lib/drizzle/schema/sections.ts`)
  - `BLOCK_TYPES` array includes "text", "markdown", "article"
  - `block_type` column stores the type string
  - `content` JSONB stores the block content

- [x] **Component Patterns** (`components/editor/StylingControls.tsx`)
  - 713-line shared styling component
  - Composable panels: BorderPanel, BackgroundPanel, LayoutPanel, TypographyPanel
  - Already used by all three editors

- [x] **Content Interfaces** (`lib/section-types.ts`)
  - `TextContent extends SectionStyling { body: string }`
  - `MarkdownContent extends SectionStyling { markdown: string }`
  - `ArticleContent extends SectionStyling { body: string; imageRounding?: TextBorderRadius }`

---

## 4. Context & Problem Definition

### Problem Statement
Three block types share 90%+ identical rendering logic but exist as separate implementations. This causes:
- **Maintenance burden** - Bug fixes must be applied 3x
- **Inconsistency risk** - Divergent behavior over time
- **Code bloat** - 1,039 lines of renderers with ~675 duplicated
- **Feature fragmentation** - Enhancements added to one but not others

### Success Criteria
- [ ] Single `richtext` block type with mode: "visual" | "markdown" | "article"
- [ ] Unified `RichTextEditor` component handling all modes
- [ ] Unified `RichTextBlock` renderer with shared logic extracted
- [ ] Shared utility functions for prose styling and color calculations
- [ ] Database migration converting existing text/markdown/article sections
- [ ] All existing content renders identically after migration
- [ ] Mode switcher in editor allowing users to change content format
- [ ] Article-specific imageRounding preserved in article mode

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - clean migration approved
- **Data loss acceptable** - existing sections will be migrated, not preserved in old format
- **Priority: Speed and simplicity** over data preservation
- **Aggressive refactoring allowed** - delete old components entirely

---

## 6. Technical Requirements

### Functional Requirements
- User can create a new richtext section with mode selector (Visual/Markdown/Article)
- User can switch modes on existing richtext sections (with content preservation where possible)
- System renders content identically to current text/markdown/article blocks
- Article mode preserves inline image float styles and imageRounding option
- Markdown mode preserves live preview and code syntax highlighting
- All styling options (StylingControls) work identically across modes

### Non-Functional Requirements
- **Performance:** No regression in render performance
- **Responsive Design:** Existing responsive behavior preserved
- **Theme Support:** Existing light/dark mode support preserved

### Technical Constraints
- Must use existing `StylingControls` component pattern
- Must preserve existing TipTap and ArticleTipTap editors
- Block type must be valid in `BLOCK_TYPES` enum

---

## 7. Data & Database Changes

### Database Schema Changes

**Update `lib/drizzle/schema/sections.ts`:**
```typescript
// Remove from BLOCK_TYPES: "text", "markdown", "article"
// Add to BLOCK_TYPES: "richtext"
export const BLOCK_TYPES = [
  "header",
  "hero",
  "richtext",  // NEW - replaces text, markdown, article
  "image",
  "gallery",
  // ... rest unchanged
] as const;
```

### Data Model Updates

**New unified interface in `lib/section-types.ts`:**
```typescript
export type RichTextMode = "visual" | "markdown" | "article";

export interface RichTextContent extends SectionStyling {
  mode: RichTextMode;
  // Content storage - use appropriate field based on mode
  body?: string;      // HTML for visual/article modes
  markdown?: string;  // Raw markdown for markdown mode
  // Article-specific
  imageRounding?: TextBorderRadius;
}

// Keep type aliases for backward compatibility during migration
export type TextContent = RichTextContent;
export type MarkdownContent = RichTextContent;
export type ArticleContent = RichTextContent;
```

### Data Migration Plan

**Migration SQL to convert existing sections:**
```sql
-- Convert text blocks to richtext with mode="visual"
UPDATE sections
SET block_type = 'richtext',
    content = jsonb_set(content, '{mode}', '"visual"')
WHERE block_type = 'text';

-- Convert markdown blocks to richtext with mode="markdown"
UPDATE sections
SET block_type = 'richtext',
    content = jsonb_set(content, '{mode}', '"markdown"')
WHERE block_type = 'markdown';

-- Convert article blocks to richtext with mode="article"
UPDATE sections
SET block_type = 'richtext',
    content = jsonb_set(content, '{mode}', '"article"')
WHERE block_type = 'article';
```

### Down Migration Safety Protocol
- [x] **Step 1: Generate Migration** - Create migration file
- [x] **Step 2: Create Down Migration** - Reverse the block_type changes
- [x] **Step 3: Verify Safety** - Ensure down migration restores original state

---

## 8. Backend Changes & Background Jobs

### Server Actions
No new server actions required - existing `addSection`, `updateSection`, `deleteSection` work unchanged.

### Database Queries
No query changes needed - sections table structure unchanged, only content shape updated.

---

## 9. Frontend Changes

### New Components

**Shared Utilities:**
- [ ] **`lib/richtext-utils.ts`** - Extracted shared functions:
  - `getTextColors(textColorMode, hasBackground)`
  - `getBoxBackgroundColor(color, opacity, useTheme)`
  - `getProseStyles(prefix, textSize, colors)` - Generate prose CSS
  - `getSectionStyles(content, theme)` - Calculate section wrapper styles
  - `getContainerStyles(content)` - Calculate content container styles

**Unified Editor:**
- [ ] **`components/editor/blocks/RichTextEditor.tsx`** - Unified editor
  - Mode selector tabs (Visual / Markdown / Article)
  - Conditionally renders appropriate input:
    - Visual: TiptapEditor
    - Markdown: Textarea with preview
    - Article: ArticleTiptapEditor
  - StylingControls with article-specific imageRounding panel when mode="article"

**Unified Renderer:**
- [ ] **`components/render/blocks/RichTextBlock.tsx`** - Unified renderer
  - Uses extracted utility functions
  - Mode-specific CSS additions:
    - Markdown: code syntax styles
    - Article: image float styles
  - Single prose style generator for all modes

### Files to Delete (After Migration Verified)
- [ ] `components/editor/blocks/TextEditor.tsx` (76 lines)
- [ ] `components/editor/blocks/MarkdownEditor.tsx` (121 lines)
- [ ] `components/editor/blocks/ArticleEditor.tsx` (132 lines)
- [ ] `components/render/blocks/TextBlock.tsx` (303 lines)
- [ ] `components/render/blocks/MarkdownBlock.tsx` (381 lines)
- [ ] `components/render/blocks/ArticleBlock.tsx` (355 lines)

### Page Updates
- [ ] **`components/editor/SectionEditor.tsx`** - Route "richtext" to RichTextEditor
- [ ] **`components/render/BlockRenderer.tsx`** - Route "richtext" to RichTextBlock
- [ ] **`components/editor/BlockIcon.tsx`** - Add icon for "richtext"
- [ ] **`lib/section-defaults.ts`** - Add richtext defaults, remove text/markdown/article
- [ ] **`lib/section-templates.ts`** - Update templates to use richtext block type

### State Management
No state management changes - existing patterns preserved.

---

## 10. Code Changes Overview

### Current Implementation (Before)

**Three separate renderers with duplicated logic:**
```typescript
// components/render/blocks/TextBlock.tsx (303 lines)
export function TextBlock({ content, theme }: { content: TextContent; theme: ThemeData }) {
  // 30 lines: getTextColors function
  // 16 lines: getBoxBackgroundColor function
  // 85 lines: plain mode prose styles
  // 79 lines: styled mode prose styles
  // 93 lines: render logic
}

// components/render/blocks/MarkdownBlock.tsx (381 lines)
// Same structure + 68 lines code styles

// components/render/blocks/ArticleBlock.tsx (355 lines)
// Same structure + 55 lines image float styles
```

**Three separate editors:**
```typescript
// components/editor/blocks/TextEditor.tsx (76 lines)
// TiptapEditor + StylingControls

// components/editor/blocks/MarkdownEditor.tsx (121 lines)
// Markdown textarea + preview + StylingControls

// components/editor/blocks/ArticleEditor.tsx (132 lines)
// ArticleTiptapEditor + StylingControls + imageRounding panel
```

### After Refactor

**Shared utilities:**
```typescript
// lib/richtext-utils.ts (~120 lines)
export function getTextColors(textColorMode: TextColorMode, hasBackground: boolean): TextColors
export function getBoxBackgroundColor(color: string, opacity: number, useTheme: boolean): string
export function generateProseStyles(prefix: string, textSize: TextSize, colors: TextColors): string
export function getSectionStyles(content: RichTextContent, theme: ThemeData): React.CSSProperties
export function getContainerStyles(content: RichTextContent): React.CSSProperties
```

**Unified renderer:**
```typescript
// components/render/blocks/RichTextBlock.tsx (~250 lines)
export function RichTextBlock({ content, theme }: { content: RichTextContent; theme: ThemeData }) {
  const colors = getTextColors(content.textColorMode, hasBackground);
  const sectionStyles = getSectionStyles(content, theme);
  const containerStyles = getContainerStyles(content);

  // Mode-specific: add code styles for markdown, float styles for article
  const modeStyles = getModeSpecificStyles(content.mode);

  // Single render path with shared prose styles
}
```

**Unified editor:**
```typescript
// components/editor/blocks/RichTextEditor.tsx (~180 lines)
export function RichTextEditor({ content, onChange, siteId, editorMode }: Props) {
  return (
    <>
      {/* Mode selector tabs */}
      <Tabs value={content.mode} onValueChange={handleModeChange}>
        <TabsList>
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
          <TabsTrigger value="article">Article</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Mode-specific input */}
      {content.mode === "visual" && <TiptapEditor ... />}
      {content.mode === "markdown" && <MarkdownInput ... />}
      {content.mode === "article" && <ArticleTiptapEditor ... />}

      {/* Shared styling controls */}
      <StylingControls content={content} onChange={onChange}>
        {content.mode === "article" && <ImageRoundingPanel ... />}
      </StylingControls>
    </>
  );
}
```

### Key Changes Summary
- [ ] **Extract shared utilities** - ~120 lines in new `lib/richtext-utils.ts`
- [ ] **Create unified renderer** - ~250 lines replacing 1,039 lines (76% reduction)
- [ ] **Create unified editor** - ~180 lines replacing 329 lines (45% reduction)
- [ ] **Database migration** - Convert existing blocks to new format
- [ ] **Delete old files** - 6 files totaling 1,368 lines

---

## 11. Implementation Plan

### Phase 1: Shared Utilities
**Goal:** Extract common rendering logic into reusable utilities

- [ ] **Task 1.1:** Create `lib/richtext-utils.ts`
  - Files: `lib/richtext-utils.ts` (new)
  - Details: Extract getTextColors, getBoxBackgroundColor, generateProseStyles, getSectionStyles, getContainerStyles
- [ ] **Task 1.2:** Add unit tests for utility functions (optional)
  - Files: `lib/__tests__/richtext-utils.test.ts`
  - Details: Test color calculations, style generation

### Phase 2: Unified Renderer
**Goal:** Create single RichTextBlock that handles all modes

- [ ] **Task 2.1:** Create RichTextBlock component
  - Files: `components/render/blocks/RichTextBlock.tsx` (new)
  - Details: Use shared utilities, handle visual/markdown/article modes, include mode-specific CSS
- [ ] **Task 2.2:** Update BlockRenderer routing
  - Files: `components/render/BlockRenderer.tsx`
  - Details: Add case for "richtext", temporarily keep old cases for testing

### Phase 3: Unified Editor
**Goal:** Create single RichTextEditor with mode switching

- [ ] **Task 3.1:** Create RichTextEditor component
  - Files: `components/editor/blocks/RichTextEditor.tsx` (new)
  - Details: Mode tabs, conditional input rendering, StylingControls integration
- [ ] **Task 3.2:** Update SectionEditor routing
  - Files: `components/editor/SectionEditor.tsx`
  - Details: Add case for "richtext"
- [ ] **Task 3.3:** Update BlockIcon
  - Files: `components/editor/BlockIcon.tsx`
  - Details: Add icon for "richtext" block type

### Phase 4: Database & Schema Updates
**Goal:** Update schema and migrate existing data

- [ ] **Task 4.1:** Update BLOCK_TYPES in schema
  - Files: `lib/drizzle/schema/sections.ts`
  - Details: Add "richtext", keep old types temporarily for migration
- [ ] **Task 4.2:** Update section-types.ts
  - Files: `lib/section-types.ts`
  - Details: Add RichTextMode, RichTextContent, update BlockContent union
- [ ] **Task 4.3:** Update section-defaults.ts
  - Files: `lib/section-defaults.ts`
  - Details: Add richtext defaults with mode="visual"
- [ ] **Task 4.4:** Update section-templates.ts
  - Files: `lib/section-templates.ts`
  - Details: Convert text/markdown/article templates to richtext
- [ ] **Task 4.5:** Generate database migration
  - Command: `npm run db:generate`
  - Details: Generate migration for BLOCK_TYPES change
- [ ] **Task 4.6:** Create data migration script
  - Files: Custom SQL or script to convert existing sections
  - Details: Convert text→richtext(visual), markdown→richtext(markdown), article→richtext(article)
- [ ] **Task 4.7:** Create down migration
  - Files: `drizzle/migrations/[timestamp]/down.sql`
  - Details: Reverse the block_type and content changes

### Phase 5: Testing & Validation
**Goal:** Verify all functionality works correctly

- [ ] **Task 5.1:** Test visual mode (former text block)
  - Details: Create section, edit content, verify rendering
- [ ] **Task 5.2:** Test markdown mode (former markdown block)
  - Details: Create section, edit content, verify live preview, verify code highlighting
- [ ] **Task 5.3:** Test article mode (former article block)
  - Details: Create section, add inline images, verify float styles, verify imageRounding
- [ ] **Task 5.4:** Test mode switching
  - Details: Switch between modes, verify content preservation where applicable
- [ ] **Task 5.5:** Test styling controls
  - Details: Verify all StylingControls panels work in all modes

### Phase 6: Cleanup
**Goal:** Remove old code after verification

- [ ] **Task 6.1:** Remove old block types from BLOCK_TYPES
  - Files: `lib/drizzle/schema/sections.ts`
  - Details: Remove "text", "markdown", "article" from array
- [ ] **Task 6.2:** Remove old routing cases
  - Files: `components/editor/SectionEditor.tsx`, `components/render/BlockRenderer.tsx`
  - Details: Remove cases for text/markdown/article
- [ ] **Task 6.3:** Delete old editor files
  - Files: `components/editor/blocks/TextEditor.tsx`, `MarkdownEditor.tsx`, `ArticleEditor.tsx`
- [ ] **Task 6.4:** Delete old renderer files
  - Files: `components/render/blocks/TextBlock.tsx`, `MarkdownBlock.tsx`, `ArticleBlock.tsx`
- [ ] **Task 6.5:** Update section picker
  - Files: `lib/section-types.ts` (BLOCK_TYPE_INFO)
  - Details: Remove text/markdown/article entries, add richtext entry

### Phase 7: Comprehensive Code Review
**Goal:** Final verification and quality check

- [ ] **Task 7.1:** Run linting and type checking
- [ ] **Task 7.2:** Verify no dead code remains
- [ ] **Task 7.3:** Test published site rendering

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** - Use time tool before adding timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp

---

## 13. File Structure & Organization

### New Files to Create
```
lib/
└── richtext-utils.ts                    # Shared rendering utilities

components/
├── editor/
│   └── blocks/
│       └── RichTextEditor.tsx           # Unified editor
└── render/
    └── blocks/
        └── RichTextBlock.tsx            # Unified renderer
```

### Files to Modify
- `lib/drizzle/schema/sections.ts` - Update BLOCK_TYPES
- `lib/section-types.ts` - Add RichTextContent interface
- `lib/section-defaults.ts` - Add richtext defaults
- `lib/section-templates.ts` - Update templates
- `components/editor/SectionEditor.tsx` - Add routing
- `components/render/BlockRenderer.tsx` - Add routing
- `components/editor/BlockIcon.tsx` - Add icon

### Files to Delete (Phase 6)
- `components/editor/blocks/TextEditor.tsx`
- `components/editor/blocks/MarkdownEditor.tsx`
- `components/editor/blocks/ArticleEditor.tsx`
- `components/render/blocks/TextBlock.tsx`
- `components/render/blocks/MarkdownBlock.tsx`
- `components/render/blocks/ArticleBlock.tsx`

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Mode switching with incompatible content:** User switches from markdown to visual - what happens to raw markdown?
  - **Mitigation:** Warn user that content format will change, offer to convert or preserve raw
- [ ] **Missing mode field on old data:** After migration, if any section lacks `mode` field
  - **Mitigation:** Default to "visual" mode in renderer if mode is undefined

### Edge Cases to Consider
- [ ] **Empty content:** All modes should handle empty body/markdown gracefully
- [ ] **Inline images in visual mode:** If user switches from article to visual, images in HTML preserved but no float styles
- [ ] **Code blocks in non-markdown modes:** Visual/article don't have code syntax highlighting

### Security & Access Control Review
- [ ] **No new attack surface** - Same content types, same sanitization
- [ ] **XSS already handled** - TipTap and markdown renderers already sanitize

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the phased approach exactly. Key principles:
1. **Build new before removing old** - Keep old blocks working until new is verified
2. **Extract utilities first** - Shared code enables cleaner components
3. **Test each mode thoroughly** - Visual, markdown, article must all work identically to before
4. **Clean migration** - User approved, so delete old code after verification

### Code Quality Standards
- [ ] Follow TypeScript strict mode
- [ ] Use extracted utilities, no code duplication
- [ ] Preserve existing responsive/theme behavior exactly
- [ ] Use early returns for mode switching logic

---

## 17. Notes & Additional Context

### Reference Implementations
- **StylingControls pattern:** `components/editor/StylingControls.tsx` (713 lines) - Excellent composition example
- **Current renderers:** Study `TextBlock.tsx`, `MarkdownBlock.tsx`, `ArticleBlock.tsx` for exact styling logic

### Mode Switching Behavior (Decision: Warn and Convert)
When user switches modes, show warning dialog and convert content:
- **visual → markdown:** Convert HTML to markdown using turndown library, warn about potential formatting loss
- **markdown → visual:** Render markdown to HTML using existing markdown renderer, store in body
- **visual ↔ article:** Direct transfer (both use HTML body), just toggle inline image capability
- **markdown → article:** Convert markdown to HTML first

### Block Picker Presentation (Decision: Single Entry)
- Single "Rich Text" block type in picker
- Mode selector (Visual/Markdown/Article) shown in editor after adding
- Default mode: "visual" (most common use case)

### Template Handling (Decision: Update All)
- All existing templates updated to use "richtext" block_type with appropriate mode
- No runtime mapping needed - clean migration

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Identified
- **Block type change:** "text", "markdown", "article" → "richtext" (handled by migration)
- **BlockTypeInfo in section picker:** Old entries removed, new entry added

### Performance Implications
- **Slight improvement:** Less code to load, shared utilities
- **No regression:** Same rendering logic, just consolidated

### User Experience Impacts
- **Positive:** Users can now switch between modes without recreating sections
- **Neutral:** Existing content renders identically

### Mitigation Strategies
- **Database backup** before migration (standard practice)
- **Test on dev environment** before production

---

## 19. Task Completion Summary

### Status: ✅ COMPLETED (2026-01-21)

### Phases Completed

- [x] **Phase 1: Shared Utilities** - Created `lib/richtext-utils.ts` with extracted functions
- [x] **Phase 2: Unified Renderer** - Created `components/render/blocks/RichTextBlock.tsx`
- [x] **Phase 3: Unified Editor** - Created `components/editor/blocks/RichTextEditor.tsx`
- [x] **Phase 4: Schema & Types** - Updated BLOCK_TYPES, interfaces, defaults, templates
- [x] **Phase 5: Database Migration** - Created and ran `0034_richtext_consolidation.sql`
- [x] **Phase 6: Testing** - Build passes, type check passes
- [x] **Phase 7: Cleanup** - Deleted old files, removed old imports

### Files Created
- `lib/richtext-utils.ts` - Shared utilities (~280 lines)
- `components/render/blocks/RichTextBlock.tsx` - Unified renderer (~187 lines)
- `components/editor/blocks/RichTextEditor.tsx` - Unified editor (~335 lines)
- `drizzle/migrations/0034_richtext_consolidation.sql` - Data migration
- `drizzle/migrations/0034_richtext_consolidation.down.sql` - Rollback migration

### Files Deleted
- `components/editor/blocks/TextEditor.tsx` (76 lines)
- `components/editor/blocks/MarkdownEditor.tsx` (121 lines)
- `components/editor/blocks/ArticleEditor.tsx` (132 lines)
- `components/render/blocks/TextBlock.tsx` (303 lines)
- `components/render/blocks/MarkdownBlock.tsx` (381 lines)
- `components/render/blocks/ArticleBlock.tsx` (355 lines)

### Files Modified
- `lib/drizzle/schema/sections.ts` - Added "richtext" to BLOCK_TYPES
- `lib/section-types.ts` - Added RichTextMode, RichTextContent, removed old entries from BLOCK_TYPE_INFO
- `lib/section-defaults.ts` - Added richtext defaults
- `lib/section-templates.ts` - Added richtext templates
- `components/editor/SectionEditor.tsx` - Updated routing
- `components/editor/inspector/ContentTab.tsx` - Updated routing
- `components/render/BlockRenderer.tsx` - Updated routing
- `components/render/PreviewBlockRenderer.tsx` - Updated routing
- `components/render/index.ts` - Updated exports
- `components/editor/BlockIcon.tsx` - Added richtext icon

### Code Reduction Summary
- **Before:** 1,368 lines across 6 files
- **After:** ~802 lines across 3 files
- **Net reduction:** ~566 lines (41% reduction)

### Dependencies Added
- `turndown` - HTML to Markdown conversion for mode switching
- `@types/turndown` - TypeScript definitions

---

*Template Version: 1.0*
*Task Number: 075*
*Created: 2026-01-21*
*Completed: 2026-01-21*
