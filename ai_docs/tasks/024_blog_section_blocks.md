# AI Task Template

---

## 1. Task Overview

### Task Title
**Title:** Blog Section Blocks - Featured Post and Post Grid

### Goal Statement
**Goal:** Add two new block types (`blog_featured` and `blog_grid`) that allow users to display blog posts as sections on any page. This transforms the blog from a dedicated route into embeddable content blocks, enabling a "news website" style layout where posts can appear on the homepage or any other page.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Skip strategic analysis** - This is a straightforward extension of the existing block type system. The implementation pattern is clearly established in the codebase.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.5, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Authentication:** Supabase Auth managed by middleware

### Current State
- Blog system is fully implemented with admin UI for creating/editing posts
- Posts have title, slug, excerpt, content, featured image, status, author
- Existing block type system supports 10 block types with editors and renderers
- Public blog routes exist at `/sites/[slug]/blog` but user prefers section-based display
- Individual post pages work at `/sites/[slug]/blog/[postSlug]`

### Existing Codebase Analysis

**Relevant Files:**
- `lib/drizzle/schema/sections.ts` - Block type enum definition
- `lib/section-types.ts` - Content interfaces for each block type
- `lib/section-defaults.ts` - Default content for new sections
- `components/editor/` - Editor components for each block type
- `components/render/blocks/` - Renderer components for each block type
- `lib/queries/blog.ts` - Blog post query functions
- `lib/drizzle/schema/blog-posts.ts` - Blog post schema

---

## 4. Context & Problem Definition

### Problem Statement
Users want to display blog posts as sections on any page (primarily homepage) rather than having a dedicated `/blog` route. They envision a "news website" style where:
- A featured/pinned post appears prominently (hero style)
- A grid of recent posts with excerpts appears below
- Posts link to individual post pages

### Success Criteria
- [x] `blog_featured` block type allows selecting and displaying a single post as a hero
- [x] `blog_grid` block type displays configurable number of recent posts (3, 6, 9)
- [x] Both blocks link to individual post pages (`/sites/[slug]/blog/[postSlug]`)
- [x] Blocks inherit site theme styling
- [x] Editors allow configuration (post selection for featured, count for grid)
- [x] Works on any page, not just homepage

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can add a `blog_featured` section to any page
- User can select which published post to feature in `blog_featured`
- User can add a `blog_grid` section to any page
- User can configure how many posts to show in `blog_grid` (3, 6, or 9)
- Both sections render with theme-aware styling
- Clicking a post navigates to the individual post page

### Non-Functional Requirements
- **Performance:** Posts fetched server-side for initial render
- **Responsive Design:** Grid adjusts columns based on screen size
- **Theme Support:** Uses CSS variables for theming

### Technical Constraints
- Must extend existing block type system
- Must use existing blog post queries
- Must follow established editor/renderer patterns

---

## 7. Data & Database Changes

### Database Schema Changes
```sql
-- Modify BLOCK_TYPES enum to include new types
-- This requires updating the sections.ts schema file
```

### Data Model Updates
```typescript
// lib/drizzle/schema/sections.ts
export const BLOCK_TYPES = [
  "header",
  "hero",
  "text",
  "image",
  "gallery",
  "features",
  "cta",
  "testimonials",
  "contact",
  "footer",
  "blog_featured",  // NEW
  "blog_grid",      // NEW
] as const;

// lib/section-types.ts - New interfaces
export interface BlogFeaturedContent {
  postId: string | null;  // Selected post ID, null if none selected
}

export interface BlogGridContent {
  postCount: 3 | 6 | 9;  // Number of recent posts to display
  showExcerpt: boolean;  // Whether to show post excerpts
}
```

### Data Migration Plan
- [x] No migration needed - just schema file updates
- [x] New block types will be available immediately

### Down Migration Safety Protocol
- [x] **Not required** - No database migration, only TypeScript enum changes

---

## 8. Backend Changes & Background Jobs

### Server Actions
No new server actions needed - existing blog queries are sufficient.

### Database Queries
Will reuse existing queries from `lib/queries/blog.ts`:
- `getPublishedPostsBySite(siteId, limit, offset)` - For grid
- `getPostById(postId)` - For featured (need to add author join)

May need a new query:
- [x] **`getPublishedPostById(postId)`** - Get single published post with author for featured block

---

## 9. Frontend Changes

### New Components

**Editors:**
- [x] **`components/editor/BlogFeaturedEditor.tsx`** - Post selector dropdown
- [x] **`components/editor/BlogGridEditor.tsx`** - Post count selector, excerpt toggle

**Renderers:**
- [x] **`components/render/blocks/BlogFeaturedBlock.tsx`** - Hero-style featured post
- [x] **`components/render/blocks/BlogGridBlock.tsx`** - Grid of recent posts

### Files to Modify
- [x] `lib/drizzle/schema/sections.ts` - Add new block types to enum
- [x] `lib/section-types.ts` - Add content interfaces
- [x] `lib/section-defaults.ts` - Add default content
- [x] `components/editor/SectionEditor.tsx` - Add editor cases
- [x] `components/render/BlockRenderer.tsx` - Add renderer cases
- [x] `lib/queries/blog.ts` - Add `getPublishedPostById`

---

## 10. Code Changes Overview

### Current Implementation (sections.ts)
```typescript
export const BLOCK_TYPES = [
  "header",
  "hero",
  "text",
  "image",
  "gallery",
  "features",
  "cta",
  "testimonials",
  "contact",
  "footer",
] as const;
```

### After Changes (sections.ts)
```typescript
export const BLOCK_TYPES = [
  "header",
  "hero",
  "text",
  "image",
  "gallery",
  "features",
  "cta",
  "testimonials",
  "contact",
  "footer",
  "blog_featured",
  "blog_grid",
] as const;
```

### Key Changes Summary
- [x] **Add 2 new block types** to BLOCK_TYPES enum
- [x] **Add 2 content interfaces** (BlogFeaturedContent, BlogGridContent)
- [x] **Add 2 default contents** for new sections
- [x] **Create 2 editor components** for admin UI
- [x] **Create 2 renderer components** for public display
- [x] **Update SectionEditor** to handle new block types
- [x] **Update BlockRenderer** to handle new block types

---

## 11. Implementation Plan

### Phase 1: Schema & Types ✅
**Goal:** Add new block types to the type system

- [x] **Task 1.1:** Update `lib/drizzle/schema/sections.ts` - Add `blog_featured` and `blog_grid` to BLOCK_TYPES
- [x] **Task 1.2:** Update `lib/section-types.ts` - Add content interfaces and update unions
- [x] **Task 1.3:** Update `lib/section-defaults.ts` - Add default content for new types
- [x] **Task 1.4:** Add query `getPublishedPostById` to `lib/queries/blog.ts`

### Phase 2: Editors ✅
**Goal:** Create admin UI for configuring blog sections

- [x] **Task 2.1:** Create `components/editor/BlogFeaturedEditor.tsx` - Post selector
- [x] **Task 2.2:** Create `components/editor/BlogGridEditor.tsx` - Count/excerpt config
- [x] **Task 2.3:** Update `components/editor/SectionEditor.tsx` - Add cases for new editors

### Phase 3: Renderers ✅
**Goal:** Create public display components

- [x] **Task 3.1:** Create `components/render/blocks/BlogFeaturedBlock.tsx` - Featured post display
- [x] **Task 3.2:** Create `components/render/blocks/BlogGridBlock.tsx` - Post grid display
- [x] **Task 3.3:** Update `components/render/BlockRenderer.tsx` - Add cases for new renderers

### Phase 4: Testing & Polish ✅
**Goal:** Verify functionality and fix issues

- [x] **Task 4.1:** Run type-check and build
- [x] **Task 4.2:** Fix server/client boundary violation (PreviewBlockRenderer)
- [x] **Task 4.3:** Verify build passes successfully

### Phase 5: Comprehensive Code Review ✅
**Goal:** Final verification

- [x] **Task 5.1:** Review all created/modified files
- [x] **Task 5.2:** Verify proper integration across components

---

## 12. Task Completion Tracking

**Status: COMPLETE** ✅

**Files Created:**
- `components/editor/BlogFeaturedEditor.tsx` - Post selector dropdown for featured block
- `components/editor/BlogGridEditor.tsx` - Post count and excerpt toggle for grid block
- `components/render/blocks/BlogFeaturedBlock.tsx` - Async server component for featured post
- `components/render/blocks/BlogGridBlock.tsx` - Async server component for post grid
- `components/render/PreviewBlockRenderer.tsx` - Client-safe renderer with placeholders for blog blocks

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Added `blog_featured` and `blog_grid` to BLOCK_TYPES
- `lib/section-types.ts` - Added BlogFeaturedContent and BlogGridContent interfaces
- `lib/section-defaults.ts` - Added defaults for new block types
- `lib/section-templates.ts` - Added empty template arrays for new blocks
- `lib/queries/blog.ts` - Added `getPublishedPostById` query
- `components/editor/BlockIcon.tsx` - Added Newspaper and LayoutGrid icons
- `components/editor/SectionEditor.tsx` - Added cases for blog editors
- `components/render/BlockRenderer.tsx` - Made async, added blog block cases with site context
- `components/render/PageRenderer.tsx` - Made async, added site context props
- `components/preview/PreviewFrame.tsx` - Switched to PreviewBlockRenderer for client safety
- `app/(sites)/sites/[siteSlug]/page.tsx` - Pass site context to PageRenderer
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Pass site context to PageRenderer

**Key Implementation Notes:**
1. Blog blocks are async server components that fetch data directly from the database
2. Preview mode uses a separate client-safe renderer with placeholder UI for blog blocks
3. Site context (siteId, siteSlug, showBlogAuthor) is passed through PageRenderer → BlockRenderer
4. Both blocks use CSS variables for theme-aware styling

---

## 13. File Structure & Organization

### New Files to Create
```
components/
├── editor/
│   ├── BlogFeaturedEditor.tsx    # Post selector for featured block
│   └── BlogGridEditor.tsx        # Config for grid block
└── render/
    └── blocks/
        ├── BlogFeaturedBlock.tsx  # Featured post renderer
        └── BlogGridBlock.tsx      # Post grid renderer
```

### Files to Modify
- `lib/drizzle/schema/sections.ts`
- `lib/section-types.ts`
- `lib/section-defaults.ts`
- `lib/queries/blog.ts`
- `components/editor/SectionEditor.tsx`
- `components/render/SectionRenderer.tsx`

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [x] **No published posts:** Grid shows "No published posts yet" message
- [x] **Selected post unpublished:** Featured block shows "Selected post is no longer available"
- [x] **No post selected:** Featured block shows "No post selected. Edit this section to choose a featured post"

### Security Considerations
- [x] Only published posts are shown on public pages (enforced by queries)
- [x] Post selection in editor fetches only published posts for the current site

---

## 15. Deployment & Configuration

No additional environment variables needed.

---

## 16. AI Agent Instructions

Follow standard task template workflow:
1. Implement phase-by-phase
2. Update task document with completion timestamps
3. Provide phase recap after each phase
4. Wait for "proceed" before continuing
5. Present code review recommendation at end

---

## 17. Notes & Additional Context

### Design Reference
- `blog_featured`: Similar to hero block but populated from blog post data
- `blog_grid`: Similar to the existing BlogListingPage component but as an embeddable section

### Existing Patterns to Follow
- See `components/editor/HeroEditor.tsx` for editor pattern
- See `components/render/blocks/HeroBlock.tsx` for renderer pattern
- See `components/render/blog/PublicPostCard.tsx` for post card styling

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment
- **Breaking Changes:** None - additive change only
- **Performance:** Minimal - reuses existing queries
- **User Experience:** Positive - more flexibility in page design

### Critical Issues
None identified - straightforward feature extension.

---

*Template Version: 1.0*
*Task Created: 2025-12-28*
