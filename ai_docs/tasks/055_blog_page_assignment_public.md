# Task 055: Blog Page Assignment - Public-Facing Page-Specific Blog Feeds

> **Backlog Item:** #44 Blog Page Assignment (Blog Feeds per Page)
> **Created:** 2026-01-03
> **Completed:** 2026-01-03
> **Status:** Complete

---

## 1. Task Overview

### Task Title
Blog Grid Block Page Filtering for Public Sites

### Goal Statement
Enable the Blog Grid block to filter posts by page assignment on public-facing sites. When a Blog Grid block is placed on a page, it should auto-detect the current page context and show only posts assigned to that page by default, with the ability to override this behavior in the block editor.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
The database foundation is complete (Task #54 added `page_id` column to blog_posts, dashboard filtering works). However, the public-facing Blog Grid block currently shows ALL published posts regardless of page assignment. Users want page-specific blog feeds (e.g., "Featured" posts on homepage, "Company News" on About page).

### Solution Options Analysis

#### Option 1: Auto-Detect with Manual Override (Recommended)
**Approach:** Blog Grid block auto-detects current page context and filters by default, with a dropdown to override (All Posts, This Page, Unassigned, or specific page).

**Pros:**
- ✅ Zero-config for common use case (posts on their assigned page)
- ✅ Full flexibility for advanced use cases
- ✅ Backwards compatible (existing blocks default to "All Posts")

**Cons:**
- ❌ Slightly more complex editor UI
- ❌ Requires passing pageId through component tree

**Implementation Complexity:** Low-Medium
**Risk Level:** Low

#### Option 2: Manual Selection Only
**Approach:** Add dropdown to block editor, no auto-detection.

**Pros:**
- ✅ Simpler implementation
- ✅ Explicit user intent

**Cons:**
- ❌ Users must manually configure every block
- ❌ No "smart default" behavior

**Implementation Complexity:** Low
**Risk Level:** Low

### Recommendation & Rationale

**🎯 RECOMMENDED SOLUTION:** Option 1 - Auto-Detect with Manual Override

**Why this is the best choice:**
1. **Best UX** - Smart defaults mean most users never need to configure anything
2. **Full flexibility** - Power users can override for advanced layouts
3. **Backwards compatible** - Existing blocks continue showing all posts

**User Decision:** C (Both auto-detect and manual override) was selected.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Language:** TypeScript 5.x with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS

### Current State

**What exists (from Task #54):**
- `blog_posts.page_id` column - nullable FK to pages table
- Dashboard filtering UI - BlogFilterBar with page filter dropdown
- Page assignment in PostEditor sidebar (PageSelector component)
- Posts can be assigned to pages and filtered in admin

**What's missing:**
- BlogGridBlock doesn't accept or use pageId
- BlogGridContent type has no page filter field
- Query functions don't filter by pageId
- No pageId passed through PageRenderer → BlockRenderer chain
- BlogGridEditor has no page filter settings

### Existing Codebase Analysis

**Relevant files:**
- `lib/section-types.ts` - BlogGridContent interface (lines 440-443)
- `lib/section-defaults.ts` - Blog grid defaults
- `components/editor/BlogGridEditor.tsx` - Block editor UI
- `components/render/blocks/BlogGridBlock.tsx` - Public renderer
- `components/render/BlockRenderer.tsx` - Routes to BlogGridBlock
- `components/render/PageRenderer.tsx` - Renders sections for a page
- `lib/queries/blog.ts` - getPublishedPostsBySite query
- `app/api/blog/[siteId]/posts/route.ts` - API for infinite scroll
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Published page route

---

## 4. Context & Problem Definition

### Problem Statement
Blog posts can be assigned to pages in the dashboard, but this assignment has no effect on the public site. The Blog Grid block always shows all published posts, ignoring page assignments. Users expect posts assigned to a specific page to appear on that page's blog grid.

### Success Criteria
- [ ] BlogGridBlock filters posts by page when `pageFilter` is set to "current" or a specific pageId
- [ ] BlogGridEditor shows page filter dropdown with options: All Posts, This Page, Unassigned, [list of pages]
- [ ] Default behavior for NEW blocks is "This Page" (auto-detect)
- [ ] Existing blocks continue to show all posts (backwards compatible via "all" default)
- [ ] PageId flows from page route → PageRenderer → BlockRenderer → BlogGridBlock
- [ ] API route supports optional pageId parameter for future infinite scroll needs

---

## 5. Development Mode Context

- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** for data - but block content defaults should be backwards compatible
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- Blog Grid block can filter by: All Posts, This Page (current), Unassigned, or specific page
- "This Page" uses the current page's ID from route context
- When no posts match filter, show "No posts yet" message
- Filter setting persists in block content

### Non-Functional Requirements
- **Performance:** No additional database queries beyond existing pattern
- **Backwards Compatibility:** Existing BlogGridContent without pageFilter field defaults to "all"

### Technical Constraints
- Must pass pageId through existing component chain (no new context providers)
- Use existing Page type from queries

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - page_id column already exists on blog_posts table.

### Data Model Updates

```typescript
// lib/section-types.ts - Update BlogGridContent
export type BlogGridPageFilter = "all" | "current" | "unassigned" | string; // string = specific pageId

export interface BlogGridContent {
  postCount: 3 | 6 | 9;
  showExcerpt: boolean;
  pageFilter: BlogGridPageFilter; // NEW FIELD
}
```

```typescript
// lib/section-defaults.ts - Update default
blog_grid: {
  postCount: 3,
  showExcerpt: true,
  pageFilter: "current", // Smart default for new blocks
} as BlogGridContent,
```

---

## 8. Backend Changes

### Query Function Updates

```typescript
// lib/queries/blog.ts - Update getPublishedPostsBySite
export async function getPublishedPostsBySite(
  siteId: string,
  limit: number = 10,
  offset: number = 0,
  pageId?: string | null // NEW: optional page filter
): Promise<...> {
  const conditions = [
    eq(blogPosts.site_id, siteId),
    eq(blogPosts.status, "published"),
    lte(blogPosts.published_at, new Date()),
  ];

  // Add page filter if specified
  if (pageId === null) {
    // "unassigned" - posts with no page
    conditions.push(isNull(blogPosts.page_id));
  } else if (pageId) {
    // Specific page
    conditions.push(eq(blogPosts.page_id, pageId));
  }
  // If pageId is undefined, no filter (all posts)

  // ... rest of query
}
```

### API Route Updates

```typescript
// app/api/blog/[siteId]/posts/route.ts - Add pageId parameter
const pageId = searchParams.get("pageId"); // "null" for unassigned, or UUID

// Pass to query (convert "null" string to actual null)
const pageFilter = pageId === "null" ? null : pageId || undefined;
```

---

## 9. Frontend Changes

### Component Props Flow

```
PublishedSitePage (has page.id)
  → PageRenderer (receives pageId prop)
    → BlockRenderer (receives pageId prop)
      → BlogGridBlock (receives pageId prop, uses with content.pageFilter)
```

### BlogGridBlock Updates

```typescript
// components/render/blocks/BlogGridBlock.tsx
interface BlogGridBlockProps {
  content: BlogGridContent;
  theme: ThemeData;
  siteId: string;
  basePath: string;
  showAuthor?: boolean;
  pageId?: string; // NEW: current page context
}

export async function BlogGridBlock({
  content,
  siteId,
  basePath,
  showAuthor = true,
  pageId, // NEW
}: BlogGridBlockProps) {
  // Determine effective page filter
  let effectivePageId: string | null | undefined;

  if (content.pageFilter === "all" || !content.pageFilter) {
    effectivePageId = undefined; // No filter
  } else if (content.pageFilter === "current") {
    effectivePageId = pageId; // Use current page (could be undefined for homepage)
  } else if (content.pageFilter === "unassigned") {
    effectivePageId = null; // Only unassigned posts
  } else {
    effectivePageId = content.pageFilter; // Specific page ID
  }

  const posts = await getPublishedPostsBySite(
    siteId,
    content.postCount,
    0,
    effectivePageId // NEW parameter
  );
  // ... rest of component
}
```

### BlogGridEditor Updates

```typescript
// components/editor/BlogGridEditor.tsx
interface BlogGridEditorProps {
  content: BlogGridContent;
  onChange: (content: BlogGridContent) => void;
  pages: Page[]; // NEW: list of site pages
  currentPageId?: string; // NEW: current page context
}

export function BlogGridEditor({
  content,
  onChange,
  pages,
  currentPageId
}: BlogGridEditorProps) {
  // Add page filter dropdown
  // Options: All Posts, This Page, Unassigned, ...pages.map(p => p.title)
}
```

### SectionEditor Updates

Need to pass `pages` and `currentPageId` to BlogGridEditor when block_type is "blog_grid".

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

```typescript
// lib/section-types.ts (lines 440-443)
export interface BlogGridContent {
  postCount: 3 | 6 | 9;
  showExcerpt: boolean;
}
```

```typescript
// components/render/blocks/BlogGridBlock.tsx (lines 15-21)
export async function BlogGridBlock({
  content,
  siteId,
  basePath,
  showAuthor = true,
}: BlogGridBlockProps) {
  const posts = await getPublishedPostsBySite(siteId, content.postCount, 0);
  // No page filtering
}
```

```typescript
// lib/queries/blog.ts (lines 51-54)
export async function getPublishedPostsBySite(
  siteId: string,
  limit: number = 10,
  offset: number = 0
): Promise<...> {
  // No pageId parameter
}
```

### 📂 **After Changes**

```typescript
// lib/section-types.ts
export type BlogGridPageFilter = "all" | "current" | "unassigned" | string;

export interface BlogGridContent {
  postCount: 3 | 6 | 9;
  showExcerpt: boolean;
  pageFilter: BlogGridPageFilter; // NEW
}
```

```typescript
// components/render/blocks/BlogGridBlock.tsx
export async function BlogGridBlock({
  content,
  siteId,
  basePath,
  showAuthor = true,
  pageId, // NEW - current page context
}: BlogGridBlockProps) {
  // Resolve pageFilter to actual pageId for query
  const effectivePageId = resolvePageFilter(content.pageFilter, pageId);
  const posts = await getPublishedPostsBySite(siteId, content.postCount, 0, effectivePageId);
}
```

```typescript
// lib/queries/blog.ts
export async function getPublishedPostsBySite(
  siteId: string,
  limit: number = 10,
  offset: number = 0,
  pageId?: string | null // NEW - undefined=all, null=unassigned, string=specific
): Promise<...> {
  // Add conditional WHERE clause for page_id
}
```

### 🎯 **Key Changes Summary**
- [ ] **BlogGridContent type** - Add `pageFilter` field
- [ ] **section-defaults** - Set default to "current" for new blocks
- [ ] **getPublishedPostsBySite** - Add optional `pageId` parameter
- [ ] **BlogGridBlock** - Accept `pageId` prop, resolve filter, pass to query
- [ ] **BlogGridEditor** - Add page filter dropdown UI
- [ ] **BlockRenderer** - Pass `pageId` to BlogGridBlock
- [ ] **PageRenderer** - Accept and pass `pageId` prop
- [ ] **Published page routes** - Pass `page.id` to PageRenderer
- [ ] **API route** - Support `pageId` query parameter
- [ ] **SectionEditor** - Pass pages and currentPageId to BlogGridEditor

**Files Modified:** ~10 files
**Impact:** Blog Grid blocks can now filter by page assignment

---

## 11. Implementation Plan

### Phase 1: Type & Default Updates
**Goal:** Update types and defaults for BlogGridContent

- [ ] **Task 1.1:** Update BlogGridContent type in section-types.ts
  - Files: `lib/section-types.ts`
  - Details: Add BlogGridPageFilter type and pageFilter field
- [ ] **Task 1.2:** Update blog_grid defaults
  - Files: `lib/section-defaults.ts`
  - Details: Set pageFilter default to "current"

### Phase 2: Query Layer
**Goal:** Enable page filtering in database queries

- [ ] **Task 2.1:** Update getPublishedPostsBySite query
  - Files: `lib/queries/blog.ts`
  - Details: Add optional pageId parameter with null/undefined/string handling
- [ ] **Task 2.2:** Update API route
  - Files: `app/api/blog/[siteId]/posts/route.ts`
  - Details: Add pageId query parameter support

### Phase 3: Component Chain Updates
**Goal:** Pass pageId through component tree

- [ ] **Task 3.1:** Update PageRenderer props
  - Files: `components/render/PageRenderer.tsx`
  - Details: Accept and pass pageId to BlockRenderer
- [ ] **Task 3.2:** Update BlockRenderer props
  - Files: `components/render/BlockRenderer.tsx`
  - Details: Accept and pass pageId to BlogGridBlock
- [ ] **Task 3.3:** Update BlogGridBlock
  - Files: `components/render/blocks/BlogGridBlock.tsx`
  - Details: Accept pageId, resolve pageFilter, call query with filter
- [ ] **Task 3.4:** Update published page routes
  - Files: `app/(sites)/sites/[siteSlug]/page.tsx`, `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx`
  - Details: Pass page.id to PageRenderer

### Phase 4: Editor UI
**Goal:** Add page filter settings to blog grid editor

- [ ] **Task 4.1:** Update BlogGridEditor
  - Files: `components/editor/BlogGridEditor.tsx`
  - Details: Add page filter dropdown with options
- [ ] **Task 4.2:** Update SectionEditor to pass props
  - Files: `components/editor/SectionEditor.tsx`
  - Details: Pass pages array and currentPageId to BlogGridEditor

### Phase 5: Testing & Verification
**Goal:** Verify all functionality works correctly

- [ ] **Task 5.1:** Type checking
  - Command: `npm run type-check`
- [ ] **Task 5.2:** Linting
  - Command: `npm run lint`

---

## 12. Task Completion Tracking

_Will be updated during implementation_

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `lib/section-types.ts` - Add BlogGridPageFilter type, update interface
- [ ] `lib/section-defaults.ts` - Update blog_grid default
- [ ] `lib/queries/blog.ts` - Add pageId parameter to getPublishedPostsBySite
- [ ] `app/api/blog/[siteId]/posts/route.ts` - Add pageId query param support
- [ ] `components/render/PageRenderer.tsx` - Add pageId prop
- [ ] `components/render/BlockRenderer.tsx` - Add pageId prop, pass to BlogGridBlock
- [ ] `components/render/blocks/BlogGridBlock.tsx` - Use pageFilter with pageId
- [ ] `components/editor/BlogGridEditor.tsx` - Add page filter UI
- [ ] `components/editor/SectionEditor.tsx` - Pass pages/currentPageId to BlogGridEditor
- [ ] `app/(sites)/sites/[siteSlug]/page.tsx` - Pass page.id to PageRenderer
- [ ] `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Pass page.id to PageRenderer

### No New Files Required
All changes are modifications to existing files.

---

## 14. Potential Issues & Edge Cases

### Edge Cases to Consider
- [ ] **Homepage has no page record:** Homepage uses is_home flag, may not have page.id in same context
  - **Mitigation:** Homepage route may need special handling - check if homepage has a page record
- [ ] **Block placed on page with no assigned posts:** Show "No posts yet" message gracefully
- [ ] **pageFilter set to deleted page:** Query returns no posts, which is acceptable
- [ ] **Backwards compatibility:** Existing blocks without pageFilter field should default to "all"

### Security Considerations
- [ ] **No security concerns:** pageId is validated by query joining on valid page records

---

## 15. Second-Order Consequences

### Impact Assessment

**Breaking Changes:** None - backwards compatible via "all" default
**Performance:** Slight improvement (filtering reduces dataset when used)
**User Experience:** Improved - intuitive page-based blog organization

### Mitigation Strategies
- Default to "all" for existing blocks (no pageFilter field)
- Default to "current" for new blocks (smart default)

---

## 16. Notes

### Reference Implementation
- Dashboard page filtering in `BlogTab.tsx` and `BlogFilterBar.tsx` provides pattern for editor UI
- `PageSelector.tsx` component may be reusable or provide inspiration

### Testing Scenarios
1. New Blog Grid block on "About" page → should show only posts assigned to About page
2. Existing Blog Grid block (no pageFilter) → should show all posts
3. Blog Grid with "All Posts" selected → shows all posts
4. Blog Grid with "Unassigned" → shows only posts with no page assignment
5. Blog Grid on homepage → "current" should work (need to verify homepage has page.id)

---

*Task Document Version: 1.0*
*Created: 2026-01-03*
