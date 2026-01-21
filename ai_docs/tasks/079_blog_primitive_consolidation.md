# Task 079: Blog Primitive Consolidation

> **Instructions:** This task consolidates `blog_featured` and `blog_grid` into a unified `Blog` primitive with mode support, following the same pattern used for RichText (#73), Cards (#74), Hero (#75), and Media (#76) consolidations.

---

## 1. Task Overview

### Task Title
**Title:** Consolidate blog_featured and blog_grid into unified Blog primitive

### Goal Statement
**Goal:** Reduce code duplication and simplify the blog block architecture by creating a unified `Blog` primitive with two modes ("featured" and "grid"). This completes the primitive consolidation effort and provides a consistent editing experience for blog content blocks.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - the approach is established by prior consolidation tasks (#73-76). We follow the same pattern: unified primitive with mode switching, shared utilities, backwards compatibility.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State

**Existing Blog Blocks:**

| Block | Editor Lines | Renderer Lines | Total |
|-------|-------------|----------------|-------|
| blog_featured | 385 | 687 | 1,072 |
| blog_grid | 284 | 504 | 788 |
| **Total** | **669** | **1,191** | **1,860** |

**Current Type Definitions:**
- `BlogFeaturedContent` - Single post with 4 layouts (split/stacked/hero/minimal)
- `BlogGridContent` - Multiple posts in grid with full SectionStyling support

**Shared Fields:**
- `showCategory` - Boolean
- `showAuthor` - Boolean

**Unique to blog_featured:**
- `postId` - Single post reference
- `layout` - BlogFeaturedLayout (4 options)
- `showFullContent`, `contentLimit`, `showReadMore`
- `imageFit` - Cover/contain/fill
- `overlayColor`, `overlayOpacity` (hero layout only)

**Unique to blog_grid:**
- `postCount` - 3/6/9
- `showExcerpt` - Boolean
- `pageFilter` - Filter by page assignment
- `sectionTitle`, `sectionSubtitle`
- Full SectionStyling support
- Card border/background customization

### Existing Codebase Analysis

**Checked Areas:**
- [x] **Database Schema** - `sections` table with `block_type` enum includes both blog types
- [x] **Section Types** - `lib/section-types.ts` lines 474-519
- [x] **Section Defaults** - `lib/section-defaults.ts` lines 404-446
- [x] **Section Templates** - `lib/section-templates.ts` (empty arrays for blog blocks)
- [x] **Block Renderers** - Both use theme CSS variables, similar patterns
- [x] **Block Editors** - BlogGridEditor uses StylingControls, BlogFeaturedEditor doesn't

---

## 4. Context & Problem Definition

### Problem Statement
Two block types (`blog_featured`, `blog_grid`) display blog posts with different layouts. They share common patterns (post metadata display, image handling, category badges) but have separate implementations. This creates:
- Code duplication (~400+ lines of similar rendering logic)
- Inconsistent feature sets (Grid has SectionStyling, Featured doesn't)
- Maintenance overhead when adding features

### Success Criteria
- [ ] Unified `Blog` primitive with mode: "featured" | "grid"
- [ ] Featured mode: 4 layouts (split/stacked/hero/minimal)
- [ ] Grid mode: 3 layouts (grid/list/magazine)
- [ ] Single `BlogEditor.tsx` with mode-specific controls
- [ ] Single `BlogBlock.tsx` with mode-based rendering
- [ ] Extracted shared components to `components/render/blog/`
- [ ] Full SectionStyling support for both modes
- [ ] Backwards compatible - old blocks still render
- [ ] New `blog` block available in block picker
- [ ] 9 templates available (4 featured + 5 grid)
- [ ] ~30-40% code reduction from consolidation

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** for primitives - old blocks remain functional
- **Priority: Code consolidation and consistency**

---

## 6. Technical Requirements

### Functional Requirements
- [ ] Blog primitive has two modes: "featured" (single post) and "grid" (multiple posts)
- [ ] Mode switching with confirmation warning when changing from featured (post selected) to grid
- [ ] Featured mode supports all 4 existing layouts (split/stacked/hero/minimal)
- [ ] Grid mode supports 3 layouts: grid (2-4 columns), list (horizontal cards), magazine (mixed sizes)
- [ ] Grid mode supports existing filtering, counts, and card styling
- [ ] Both modes support SectionStyling (currently only Grid does)
- [ ] Section header (title/subtitle) available for both modes
- [ ] EditorMode toggle support (content/layout separation)

### Non-Functional Requirements
- **Performance:** No performance regression from consolidation
- **Maintainability:** Single source of truth for blog block logic
- **Consistency:** Same editing patterns as other primitives (Cards, Hero, Media)

### Technical Constraints
- Must preserve existing `blog_featured` and `blog_grid` blocks for backwards compatibility
- Database schema unchanged (new `blog` block_type added to enum)

---

## 7. Data & Database Changes

### Database Schema Changes
```sql
-- Add 'blog' to BLOCK_TYPES enum
-- This is done via Drizzle schema, generates migration automatically
```

### Data Model Updates
```typescript
// lib/section-types.ts

// New unified interface
export type BlogMode = "featured" | "grid";
export type BlogFeaturedLayout = "split" | "stacked" | "hero" | "minimal";
export type BlogGridLayout = "grid" | "list" | "magazine";

export interface BlogContent extends SectionStyling {
  mode: BlogMode;

  // Section header (both modes)
  sectionTitle?: string;
  sectionSubtitle?: string;

  // Featured mode fields
  postId?: string;
  featuredLayout?: BlogFeaturedLayout; // "split" | "stacked" | "hero" | "minimal"
  showFullContent?: boolean;
  contentLimit?: number;
  showReadMore?: boolean;
  imageFit?: ImageFit;

  // Grid mode fields
  gridLayout?: BlogGridLayout; // "grid" | "list" | "magazine"
  postCount?: 3 | 6 | 9;
  columns?: 2 | 3 | 4; // For grid layout
  showExcerpt?: boolean;
  pageFilter?: BlogGridPageFilter;

  // Shared display options
  showCategory?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;

  // Card styling (both modes)
  cardBorderMode?: "default" | "primary" | "custom";
  cardBorderColor?: string;
  imageBackgroundMode?: ImageBackgroundMode;
  imageBackgroundColor?: string;
}
```

**Grid Layout Variants:**
- **Grid:** Traditional card grid (current behavior) - 2/3/4 columns
- **List:** Single column, horizontal cards with image left, content right
- **Magazine:** Mixed sizes - first post large, rest in grid (editorial style)

### Data Migration Plan
- [ ] No migration needed - new `blog` type is additive
- [ ] Existing `blog_featured` and `blog_grid` sections continue to work unchanged

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
- No server action changes required
- Existing queries (`getPublishedPostById`, `getPublishedPostsBySite`) reused

---

## 9. Frontend Changes

### New Components

**Editor:**
- [ ] `components/editor/blocks/BlogEditor.tsx` - Unified editor with mode tabs

**Renderer:**
- [ ] `components/render/blocks/BlogBlock.tsx` - Unified renderer with mode routing

**Shared Blog Components (extract from existing):**
- [ ] `components/render/blog/BlogPostImage.tsx` - Featured image with fallback
- [ ] `components/render/blog/BlogPostMeta.tsx` - Author + date display
- [ ] `components/render/blog/BlogCategoryBadge.tsx` - Styled category tag
- [ ] `components/render/blog/BlogPostExcerpt.tsx` - Truncated content display

**Utilities:**
- [ ] `lib/blog-utils.ts` - Content truncation, color helpers

### Component Requirements
- **Mode tabs:** Visual distinction with colors (Featured=blue, Grid=green)
- **Responsive Design:** Mobile-first with Tailwind breakpoints
- **Theme Support:** CSS variables for light/dark mode
- **EditorMode support:** Content vs Layout toggle integration

### State Management
- Mode state controlled by `content.mode` property
- Mode switching shows confirmation dialog when data would be lost
- EditorMode from context for content/layout field filtering

### Context Usage Strategy
- [x] **EditorMode context** - Use existing `useEditorMode()` for content/layout toggle
- [x] **No new contexts needed** - Follow existing patterns

---

## 10. Code Changes Overview

### Current Implementation (Before)

**BlogFeaturedEditor.tsx (~385 lines):**
```typescript
// Post selector, layout buttons, content display options
// No StylingControls integration
// Hero overlay settings inline
```

**BlogGridEditor.tsx (~284 lines):**
```typescript
// Section header, page filter, post count
// StylingControls integration with CardBackgroundPanel
// Card border color controls
```

**BlogFeaturedBlock.tsx (~687 lines):**
```typescript
// 4 layout components: SplitLayout, StackedLayout, HeroLayout, MinimalLayout
// Helper components: PostImage, PostTitle, PostText, PostMeta, CategoryBadge
// Content truncation logic
```

**BlogGridBlock.tsx (~504 lines):**
```typescript
// Plain mode vs Styled mode rendering
// Grid layout with post cards
// Similar helper components (duplicated logic)
```

### After Refactor

**BlogEditor.tsx (~500-600 lines):**
```typescript
// Mode tabs (Featured | Grid)
// Shared: section header, display options
// Featured-specific: post selector, layout, content settings
// Grid-specific: post count, page filter, card styling
// StylingControls for both modes
```

**BlogBlock.tsx (~600-700 lines):**
```typescript
// Mode-based routing to FeaturedRenderer or GridRenderer
// Shared components imported from components/render/blog/
// Unified styling application
```

**Shared Components (~200 lines total):**
```typescript
// BlogPostImage, BlogPostMeta, BlogCategoryBadge, BlogPostExcerpt
// Extracted from both renderers, DRY
```

### Key Changes Summary
- [ ] **Unified type definition:** `BlogContent` interface with mode property
- [ ] **Single editor:** Mode tabs with conditional field rendering
- [ ] **Single renderer:** Mode-based layout routing
- [ ] **Extracted shared components:** Reduce duplication
- [ ] **SectionStyling for both modes:** Featured mode gains styling support
- [ ] **Files Modified:** ~12 files (types, defaults, templates, schema, editors, renderers)
- [ ] **Expected Code Reduction:** ~400-500 lines (25-30%)

---

## 11. Implementation Plan

### Phase 1: Type Definitions & Utilities
**Goal:** Create unified BlogContent interface and shared utilities

- [ ] **Task 1.1:** Add `BlogMode` type and `BlogContent` interface to `lib/section-types.ts`
- [ ] **Task 1.2:** Add `blog` to BLOCK_TYPES in `lib/drizzle/schema/sections.ts`
- [ ] **Task 1.3:** Add blog defaults to `lib/section-defaults.ts`
- [ ] **Task 1.4:** Add blog templates to `lib/section-templates.ts` (4-6 templates)
- [ ] **Task 1.5:** Create `lib/blog-utils.ts` with truncation and helper functions
- [ ] **Task 1.6:** Run `npm run db:generate` and create down migration

### Phase 2: Extract Shared Components
**Goal:** DRY up rendering logic before creating unified renderer

- [ ] **Task 2.1:** Create `components/render/blog/BlogPostImage.tsx`
- [ ] **Task 2.2:** Create `components/render/blog/BlogPostMeta.tsx`
- [ ] **Task 2.3:** Create `components/render/blog/BlogCategoryBadge.tsx`
- [ ] **Task 2.4:** Create `components/render/blog/BlogPostExcerpt.tsx`
- [ ] **Task 2.5:** Update existing BlogFeaturedBlock and BlogGridBlock to use shared components (verify no regression)

### Phase 3: Create Blog Primitive Renderer
**Goal:** Unified renderer with mode-based routing

- [ ] **Task 3.1:** Create `components/render/blocks/BlogBlock.tsx` with mode switch
- [ ] **Task 3.2:** Implement FeaturedRenderer (extract from BlogFeaturedBlock)
- [ ] **Task 3.3:** Implement GridRenderer (extract from BlogGridBlock)
- [ ] **Task 3.4:** Add SectionStyling support to Featured mode
- [ ] **Task 3.5:** Register in `BlockRenderer.tsx` and `PreviewBlockRenderer.tsx`

### Phase 4: Create Blog Primitive Editor
**Goal:** Unified editor with mode tabs

- [ ] **Task 4.1:** Create `components/editor/blocks/BlogEditor.tsx` with mode tabs
- [ ] **Task 4.2:** Implement Featured mode controls (post selector, layout, content settings)
- [ ] **Task 4.3:** Implement Grid mode controls (count, filter, card styling)
- [ ] **Task 4.4:** Add StylingControls integration for both modes
- [ ] **Task 4.5:** Add EditorMode support (content/layout toggle)
- [ ] **Task 4.6:** Add mode switching confirmation dialog
- [ ] **Task 4.7:** Register in `SectionEditor.tsx` and `ContentTab.tsx`

### Phase 5: Block Picker & Templates
**Goal:** Make Blog primitive available in UI

- [ ] **Task 5.1:** Add `blog` entry to `BLOCK_TYPE_INFO` in `lib/section-types.ts`
- [ ] **Task 5.2:** Add BlockIcon for blog primitive
- [ ] **Task 5.3:** Verify templates appear in template picker

### Phase 6: Testing & Validation
**Goal:** Verify all functionality works

- [ ] **Task 6.1:** Test Featured mode with all 4 layouts
- [ ] **Task 6.2:** Test Grid mode with filtering and styling
- [ ] **Task 6.3:** Test mode switching with confirmation
- [ ] **Task 6.4:** Test SectionStyling on Featured mode (new capability)
- [ ] **Task 6.5:** Verify old blog_featured/blog_grid blocks still render
- [ ] **Task 6.6:** Run linting and type-check

### Phase 7: Comprehensive Code Review
**Goal:** Final verification before user testing

- [ ] **Task 7.1:** Present "Implementation Complete!" message
- [ ] **Task 7.2:** Execute comprehensive code review (if approved)

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** before adding timestamps
- [ ] **Update task document immediately** after each subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp

---

## 13. File Structure & Organization

### New Files to Create
```
lib/
├── blog-utils.ts                          # Truncation, color helpers

components/
├── editor/blocks/
│   └── BlogEditor.tsx                     # Unified editor
├── render/
│   ├── blocks/
│   │   └── BlogBlock.tsx                  # Unified renderer
│   └── blog/
│       ├── BlogPostImage.tsx              # Featured image component
│       ├── BlogPostMeta.tsx               # Author + date display
│       ├── BlogCategoryBadge.tsx          # Category badge
│       └── BlogPostExcerpt.tsx            # Truncated content
```

### Files to Modify
- [ ] `lib/drizzle/schema/sections.ts` - Add 'blog' to BLOCK_TYPES
- [ ] `lib/section-types.ts` - Add BlogMode, BlogContent, BLOCK_TYPE_INFO entry
- [ ] `lib/section-defaults.ts` - Add blog defaults
- [ ] `lib/section-templates.ts` - Add blog templates
- [ ] `components/editor/BlockIcon.tsx` - Add blog icon
- [ ] `components/render/BlockRenderer.tsx` - Add blog case
- [ ] `components/render/PreviewBlockRenderer.tsx` - Add blog case
- [ ] `components/editor/SectionEditor.tsx` - Add BlogEditor case
- [ ] `components/editor/inspector/ContentTab.tsx` - Add BlogEditor case

### Dependencies to Add
None - all dependencies already present.

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Mode switching loses postId:** Show confirmation dialog before switching
- [ ] **Missing post in Featured mode:** Handle gracefully with empty state
- [ ] **No posts in Grid mode:** Show "No posts" message

### Edge Cases to Consider
- [ ] **Empty section header:** Don't render header container
- [ ] **PageFilter with deleted page:** Fall back to "all"

### Security & Access Control Review
- [ ] **No new security concerns** - Uses existing post queries with proper authorization

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow the established primitive consolidation pattern from tasks #73-76
2. Extract shared components FIRST to verify no regression
3. Then create unified primitive using those shared components
4. Keep old blocks functional throughout

### Code Quality Standards
- [ ] Use early returns for cleaner code
- [ ] Use async/await (no .then() chains)
- [ ] No fallback behavior - fail fast with clear errors
- [ ] Professional comments explaining business logic

### Architecture Compliance
- [ ] Blog primitive follows Cards/Hero/Media patterns
- [ ] EditorMode toggle support included
- [ ] StylingControls integration for both modes

---

## 17. Notes & Additional Context

### Reference Implementations
- **Mode-based primitive:** `components/render/blocks/MediaBlock.tsx`
- **Template-based primitive:** `components/render/blocks/CardsBlock.tsx`
- **Layout-based primitive:** `components/render/blocks/HeroPrimitiveBlock.tsx`
- **Shared styling utilities:** `lib/styling-utils.ts`
- **Existing blog components:** `components/render/blog/` (PublicPostCard, etc.)

### Templates to Create

**Featured Mode (4 templates):**
1. **Hero Spotlight:** Full-width background with overlay, dramatic call-out for featured article
2. **Split Feature:** Image left, content right - classic blog featured style
3. **Stacked Highlight:** Image top, content below - works well in narrow columns
4. **Minimal Quote:** Text only, large quote-style typography, no image

**Grid Mode (5 templates):**
1. **Standard Blog Grid:** 3 posts in 3 columns, with excerpts and author
2. **Compact Overview:** 6 posts, no excerpts - quick overview of recent content
3. **Two-Column Cards:** 2 large cards per row, more visual impact
4. **Magazine Layout:** First post large (spans 2 cols), rest in smaller grid - editorial feel
5. **List View:** Single column, horizontal cards - image left, content right, detailed

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [ ] **No breaking changes** - Old blog_featured and blog_grid remain functional
- [ ] **Database compatible** - New block_type added, existing unchanged

#### Ripple Effects Assessment
- [ ] **Block picker:** New "Blog" option appears in Content category
- [ ] **Templates:** New blog templates available
- [ ] **Preview:** BlogBlock renders in preview iframe

#### Performance Implications
- [ ] **No performance impact** - Same rendering logic, just reorganized
- [ ] **Potential improvement** - Shared components may reduce duplication

#### User Experience Impacts
- [ ] **Positive:** Unified editing experience for blog content
- [ ] **Positive:** Featured mode gains SectionStyling (new capability)
- [ ] **Learning curve:** Minimal - same fields, new organization

### Mitigation Strategies
- Keep old blocks functional for existing sections
- Clear mode labels in editor UI
- Confirmation dialog when mode switch would lose data

---

*Task Document Version: 1.0*
*Created: 2026-01-21*
*Status: Ready for Implementation*
