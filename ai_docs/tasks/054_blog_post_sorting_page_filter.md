# Task 054: Blog Post Sorting & Page Filter

> **Instructions:** This task implements sorting options and page filtering for the blog posts dashboard list.

---

## 1. Task Overview

### Task Title
**Title:** Blog Post Sorting Options & Page Assignment Filter

### Goal Statement
**Goal:** Add sorting controls and page filtering to the Blog tab in the dashboard, allowing users to organize their blog posts by different criteria (newest, oldest, alphabetical, by status) and filter posts by which page they're assigned to. This improves blog management as content grows and lays the groundwork for page-specific blog feeds.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
The blog posts list in the dashboard currently shows posts sorted by `updated_at` (most recently updated first) with no user control. As sites accumulate more posts, users need ways to:
1. Find specific posts quickly (alphabetical sort, filter by page)
2. See their oldest content (for updates/refreshing)
3. Focus on drafts vs published posts

### Solution Options Analysis

#### Option 1: Client-Side Sorting Only (No Database Changes)
**Approach:** Sort/filter posts entirely in the browser using the existing data

**Pros:**
- No database migration required
- Instant sorting (no server round-trip)
- Simple implementation

**Cons:**
- Cannot add page assignment (no `page_id` column)
- All posts must be loaded (pagination complications)
- Filter state resets on page refresh unless using localStorage

**Implementation Complexity:** Low
**Risk Level:** Low

#### Option 2: Server-Side Sorting with Page Assignment (Recommended)
**Approach:** Add `page_id` column to blog_posts, implement server-side sorting with client-side filter controls persisted to localStorage

**Pros:**
- Enables page filtering feature (future blog feeds per page)
- Clean database model for future features
- Sorting works correctly with pagination (future)
- Better scalability for large post counts

**Cons:**
- Requires database migration
- Slightly more complex implementation

**Implementation Complexity:** Medium
**Risk Level:** Low (additive change, nullable column)

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 2 - Server-Side Sorting with Page Assignment

**Why this is the best choice:**
1. **Enables page filtering** - The `page_id` column unlocks the page filter feature and future "blog feeds per page" functionality (#44 in backlog)
2. **Scalable** - Server-side sorting works correctly as post count grows
3. **Low risk** - Nullable column is backwards compatible, existing posts simply have no page assignment
4. **Foundation work** - Sets up data model for future blog enhancements

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State
- **BlogTab.tsx** (52 lines) - Shows "Blog Posts" header with counts, "New Post" button, and PostsList
- **PostsList.tsx** (32 lines) - Maps posts to PostCard components with no sorting controls
- **Default sort:** `updated_at DESC` (most recently updated first) - hardcoded in `getPostsBySite()`
- **No page assignment:** Posts are site-level only, no `page_id` column exists
- **Categories exist:** Single category per post via `category_id` FK

### Existing Codebase Analysis

**Relevant Files:**
- `components/blog/BlogTab.tsx` - Main blog tab component (will add filter bar)
- `components/blog/PostsList.tsx` - Posts list (receives filtered/sorted posts)
- `lib/drizzle/schema/blog-posts.ts` - Schema (will add `page_id`)
- `lib/queries/blog.ts` - Queries (will update `getPostsBySite()`)
- `app/actions/blog.ts` - Server actions (will add page assignment)

---

## 4. Context & Problem Definition

### Problem Statement
Blog posts in the dashboard have no sort options. Users cannot:
- Flip the sort order (oldest first vs newest first)
- Filter posts by which page they're assigned to
- Quickly find posts alphabetically
- Focus on drafts or published posts separately

As blog content grows, this makes management increasingly difficult.

### Success Criteria
- [ ] Sort dropdown with options: Newest, Oldest, Recently Updated, Alphabetical (A-Z), By Status
- [ ] Page filter dropdown showing all pages + "All Pages" + "Unassigned"
- [ ] `page_id` column added to blog_posts table
- [ ] Sort/filter preferences persist in localStorage
- [ ] Existing posts remain visible (backwards compatible)
- [ ] Filter bar UI matches existing dashboard styling

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Data loss acceptable** - existing data can be wiped/migrated aggressively
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- User can select sort order from dropdown (Newest, Oldest, Recently Updated, A-Z, By Status)
- User can filter posts by assigned page (All, specific page, Unassigned)
- User can assign a page to a blog post (in post editor)
- Sort/filter selections persist across page refreshes (localStorage)
- Post counts update based on current filter

### Non-Functional Requirements
- **Performance:** Sorting happens server-side in database query
- **Usability:** Filter bar is compact and doesn't push content too far down
- **Responsive Design:** Filter controls stack on mobile

### Technical Constraints
- Must use existing shadcn/ui Select components
- Must integrate with existing blog post list without breaking changes

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- Add page_id column to blog_posts
ALTER TABLE blog_posts
ADD COLUMN page_id uuid REFERENCES pages(id) ON DELETE SET NULL;

-- Add index for filtering by page
CREATE INDEX blog_posts_page_id_idx ON blog_posts(page_id);
```

### Data Model Updates

```typescript
// lib/drizzle/schema/blog-posts.ts
import { pages } from "./pages";

export const blogPosts = pgTable(
  "blog_posts",
  {
    // ... existing columns ...
    page_id: uuid("page_id").references(() => pages.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    // ... existing indexes ...
    index("blog_posts_page_id_idx").on(t.page_id),
  ]
);
```

### Data Migration Plan
- [ ] Generate migration with `npm run db:generate`
- [ ] Create down migration file
- [ ] Apply migration with `npm run db:migrate`
- [ ] Existing posts will have `page_id = null` (shown under "Unassigned" filter)

### Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate`
- [ ] **Step 2: Create Down Migration** - Create rollback SQL
- [ ] **Step 3: Apply Migration** - Run `npm run db:migrate`

---

## 8. Backend Changes

### Server Actions

**Update `app/actions/blog.ts`:**
- [ ] **`updatePost`** - Add `pageId` field support

### Database Queries

**Update `lib/queries/blog.ts`:**
- [ ] **`getPostsBySite()`** - Add `sortBy` and `pageFilter` parameters

```typescript
export type BlogSortOption =
  | "newest"
  | "oldest"
  | "updated"
  | "alphabetical"
  | "status";

export type BlogPageFilter = "all" | "unassigned" | string; // string = page ID

export async function getPostsBySite(
  siteId: string,
  sortBy: BlogSortOption = "newest",
  pageFilter: BlogPageFilter = "all"
): Promise<(BlogPost & { categoryName: string | null; pageName: string | null })[]>
```

---

## 9. Frontend Changes

### New Components

- [ ] **`components/blog/BlogFilterBar.tsx`** - Sort and page filter dropdowns

### Component Updates

- [ ] **`components/blog/BlogTab.tsx`** - Add filter bar, manage sort/filter state
- [ ] **`components/blog/PostsList.tsx`** - No changes (receives already filtered posts)

### State Management
- Sort preference stored in `localStorage` key: `blog-sort-${siteId}`
- Page filter stored in `localStorage` key: `blog-page-filter-${siteId}`
- State initialized from localStorage on component mount

---

## 10. Code Changes Overview

### Current Implementation (Before)

```typescript
// components/blog/BlogTab.tsx (current)
export function BlogTab({ siteId, posts }: BlogTabProps) {
  // No filter controls
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">
            {publishedCount} published, {draftCount} drafts
          </p>
        </div>
        <Button onClick={handleCreatePost}>New Post</Button>
      </div>
      <PostsList posts={posts} siteId={siteId} />
    </div>
  );
}

// lib/queries/blog.ts (current)
export async function getPostsBySite(siteId: string) {
  return db
    .select(...)
    .from(blogPosts)
    .orderBy(desc(blogPosts.updated_at)); // Hardcoded sort
}
```

### After Implementation

```typescript
// components/blog/BlogTab.tsx (after)
export function BlogTab({ siteId, posts, pages }: BlogTabProps) {
  const [sortBy, setSortBy] = useState<BlogSortOption>(() =>
    localStorage.getItem(`blog-sort-${siteId}`) || "newest"
  );
  const [pageFilter, setPageFilter] = useState<string>(() =>
    localStorage.getItem(`blog-page-filter-${siteId}`) || "all"
  );

  // Filter and sort posts client-side based on server-fetched data
  const filteredPosts = useMemo(() => {
    let result = posts;
    // Apply page filter
    if (pageFilter !== "all") {
      result = result.filter(p =>
        pageFilter === "unassigned" ? !p.page_id : p.page_id === pageFilter
      );
    }
    // Apply sort
    return sortPosts(result, sortBy);
  }, [posts, sortBy, pageFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">
            {filteredPosts.length} of {posts.length} posts
          </p>
        </div>
        <Button onClick={handleCreatePost}>New Post</Button>
      </div>

      {/* New filter bar */}
      <BlogFilterBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        pageFilter={pageFilter}
        onPageFilterChange={setPageFilter}
        pages={pages}
      />

      <PostsList posts={filteredPosts} siteId={siteId} />
    </div>
  );
}

// components/blog/BlogFilterBar.tsx (new)
export function BlogFilterBar({
  sortBy, onSortChange,
  pageFilter, onPageFilterChange,
  pages
}: BlogFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="updated">Recently Updated</SelectItem>
          <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
          <SelectItem value="status">By Status</SelectItem>
        </SelectContent>
      </Select>

      <Select value={pageFilter} onValueChange={onPageFilterChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Filter by page..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Pages</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {pages.map(page => (
            <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// lib/drizzle/schema/blog-posts.ts (after)
export const blogPosts = pgTable(
  "blog_posts",
  {
    // ... existing columns ...
    page_id: uuid("page_id").references(() => pages.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    // ... existing indexes ...
    index("blog_posts_page_id_idx").on(t.page_id),
  ]
);
```

### Key Changes Summary
- [ ] **Database:** Add `page_id` column to `blog_posts` with FK to `pages`
- [ ] **BlogFilterBar:** New component with Sort and Page filter dropdowns
- [ ] **BlogTab:** Add filter state, localStorage persistence, filtered post rendering
- [ ] **getPostsBySite:** Update query to include page name in results
- [ ] **Post Editor:** Add page assignment dropdown (stretch goal)

---

## 11. Implementation Plan

### Phase 1: Database Changes ✅ 2026-01-02
**Goal:** Add page_id column to blog_posts table

- [x] **Task 1.1:** Update Drizzle schema ✅
  - Files: `lib/drizzle/schema/blog-posts.ts`
  - Details: Added `page_id` column with FK to pages, added index
- [x] **Task 1.2:** Generate migration ✅
  - Command: `npm run db:generate`
  - Generated: `drizzle/migrations/0025_handy_shen.sql`
- [x] **Task 1.3:** Create down migration ✅
  - Files: `drizzle/migrations/0025_handy_shen/down.sql`
- [x] **Task 1.4:** Apply migration ✅
  - Command: `npm run db:migrate`

### Phase 2: Query Updates ✅ 2026-01-02
**Goal:** Update blog queries to support sorting and include page info

- [x] **Task 2.1:** Add sort/filter types ✅
  - Files: `lib/queries/blog.ts`
  - Details: Added `BlogSortOption` type
- [x] **Task 2.2:** Update getPostsBySite query ✅
  - Files: `lib/queries/blog.ts`
  - Details: Added join with pages table, returns pageName

### Phase 3: UI Implementation ✅ 2026-01-02
**Goal:** Add filter bar component and integrate with BlogTab

- [x] **Task 3.1:** Create BlogFilterBar component ✅
  - Files: `components/blog/BlogFilterBar.tsx` (65 lines)
  - Details: Sort dropdown + Page filter dropdown using shadcn Select
- [x] **Task 3.2:** Update BlogTab to include filter bar ✅
  - Files: `components/blog/BlogTab.tsx` (142 lines, was 52)
  - Details: Added state management, localStorage persistence, filter bar integration
- [x] **Task 3.3:** Update SiteTabs to pass pages to BlogTab ✅
  - Files: `components/sites/SiteTabs.tsx`
  - Details: Updated posts type, passed pages prop to BlogTab

### Phase 4: Post Editor Update ✅ 2026-01-02
**Goal:** Allow users to assign posts to pages

- [x] **Task 4.1:** Add page selector to PostEditor ✅
  - Files: `components/blog/PostEditor.tsx`, `components/blog/PageSelector.tsx`
  - Details: Created PageSelector component, integrated into PostEditor sidebar
- [x] **Task 4.2:** Update updatePost action ✅
  - Files: `app/actions/blog.ts`
  - Details: Added page_id to UpdatePostData, handling in updatePost function
- [x] **Task 4.3:** Update post editor page to pass pages ✅
  - Files: `app/(protected)/app/sites/[siteId]/blog/[postId]/page.tsx`
  - Details: Fetches pages and passes to PostEditor

### Phase 5: Testing & Polish
**Goal:** Verify all functionality works correctly

- [ ] **Task 5.1:** Test sorting options (browser testing required)
- [ ] **Task 5.2:** Test page filter (browser testing required)
- [ ] **Task 5.3:** Test localStorage persistence (browser testing required)
- [ ] **Task 5.4:** Test with empty states (browser testing required)

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** before adding completion timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp

---

## 13. File Structure & Organization

### New Files to Create
```
components/blog/
  └── BlogFilterBar.tsx          # Sort and page filter dropdowns
```

### Files to Modify
```
lib/drizzle/schema/blog-posts.ts  # Add page_id column
lib/queries/blog.ts               # Update query, add types
components/blog/BlogTab.tsx       # Add filter bar integration
components/blog/PostEditor.tsx    # Add page selector (Phase 4)
app/actions/blog.ts               # Handle pageId in updatePost
app/(protected)/app/sites/[siteId]/page.tsx  # Pass pages to BlogTab
```

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty pages list:** Filter dropdown should still show "All Pages" and "Unassigned"
- [ ] **Deleted page:** Posts assigned to deleted page become unassigned (ON DELETE SET NULL)
- [ ] **Large post count:** Client-side sorting may lag; consider server-side if >100 posts

### Security & Access Control Review
- [ ] **Authorization:** Page assignment should only allow pages from the same site
- [ ] **Validation:** Ensure pageId belongs to the same site as the post

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the phases in order. Start with database changes, then queries, then UI.

### Code Quality Standards
- Use shadcn/ui Select components
- Follow existing TypeScript patterns
- Use early returns for cleaner code
- Persist user preferences to localStorage

---

## 17. Notes & Additional Context

### UI Reference
The filter bar should appear between the header and the posts list:

```
Blog Posts                                    [+ New Post]
3 published, 0 drafts

[Sort: Newest ▼] [Page: All ▼]              ← Filter bar here

┌─────────────────────────────────────────┐
│ Post 1                                   │
└─────────────────────────────────────────┘
```

### Future Considerations
- This feature enables #44 (Blog Page Assignment/Blog Feeds per Page)
- The `page_id` column can be used to filter public blog listings per page
- Consider adding bulk page assignment in the future

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Identified
- **None** - Adding nullable column is backwards compatible

### Performance Implications
- Additional JOIN with pages table is minimal overhead
- Client-side sorting is fast for typical post counts (<100)

### Mitigation Strategies
- [ ] Use ON DELETE SET NULL to handle deleted pages gracefully
- [ ] Index on page_id for efficient filtering

---

*Task created: 2026-01-02*
