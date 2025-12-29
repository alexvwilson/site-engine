# AI Task Template - Blog Categories & Enhanced Features

> **Task 025:** Implement blog categories (simplified single-category model) and enhanced features including RSS feeds, reading time, post navigation, scheduling, and social sharing.

---

## 1. Task Overview

### Task Title
**Title:** Blog Categories & Enhanced Features (Phase 2 + Phase 3)

### Goal Statement
**Goal:** Extend the existing blog system with category organization and enhanced features to improve content discoverability, user experience, and SEO. This includes single-category support per post, site-level default categories, RSS feed generation, reading time estimation, previous/next post navigation, post scheduling, and social sharing buttons.

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis: Not Required

This task has clear requirements from user discussion:
- Single category per post (simpler than many-to-many)
- Site-level default category setting
- Inline category creation in post editor
- All Phase 3 features included

The implementation approach is straightforward - no competing strategies need analysis.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Authentication:** Supabase Auth managed by `middleware.ts`

### Current State

**Completed (Phase 1 & 1.5):**
- `blog_posts` table with title, slug, excerpt, content, featured_image, status, published_at
- Admin UI: Blog tab, posts list, post editor with rich text and image upload
- Public routes: `/sites/[siteSlug]/blog` (listing) and `/sites/[siteSlug]/blog/[postSlug]` (detail)
- Blog section blocks: `blog_featured` and `blog_grid` for embedding posts on pages
- Theme integration and author display settings

**Not Yet Implemented:**
- Categories (neither table nor UI)
- RSS feed generation
- Reading time estimation
- Previous/next post navigation
- Post scheduling (future publish dates)
- Social sharing buttons
- Related posts suggestions

### Existing Codebase Analysis

**Relevant Files:**
- `lib/drizzle/schema/blog-posts.ts` - Current blog_posts table (needs category_id)
- `lib/drizzle/schema/sites.ts` - Sites table (needs default_category_id)
- `lib/queries/blog.ts` - Query functions for posts (need category-aware versions)
- `app/actions/blog.ts` - Server actions for CRUD (needs category support)
- `components/blog/PostEditor.tsx` - Post editor (needs category selector)
- `app/(sites)/sites/[siteSlug]/blog/page.tsx` - Public blog listing
- `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx` - Public post detail

---

## 4. Context & Problem Definition

### Problem Statement
The blog system currently lacks organization capabilities and modern blog features:
1. No way to categorize posts for better content discovery
2. No RSS feed for subscribers
3. No reading time to set reader expectations
4. No navigation between posts (prev/next)
5. No scheduling for future publication
6. No easy way to share posts on social media

### Success Criteria
- [ ] Posts can be assigned to a single category
- [ ] Sites have a default category that auto-applies to new posts
- [ ] Categories can be created inline in the post editor
- [ ] RSS feed available at `/sites/[siteSlug]/blog/feed.xml`
- [ ] Reading time displayed on post cards and detail pages
- [ ] Previous/Next navigation on post detail pages
- [ ] Posts can be scheduled for future publication
- [ ] Social sharing buttons on post detail pages
- [ ] Category filter pages at `/sites/[siteSlug]/blog/category/[categorySlug]`

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns** - can make breaking changes
- **Data loss acceptable** - existing blog posts can be updated
- **Priority: Speed and simplicity** over complex features

---

## 6. Technical Requirements

### Functional Requirements
- User can create categories inline when editing a post
- User can set a site-level default category in site settings
- New posts automatically get the default category (if set)
- User can override category per post
- Public visitors can filter posts by category
- RSS feed includes all published posts (latest 20)
- Reading time calculated from post content word count
- Previous/Next navigation based on publish date
- Scheduled posts auto-publish when publish_at time passes
- Social sharing buttons for Twitter, Facebook, LinkedIn, Copy Link

### Non-Functional Requirements
- **Performance:** RSS feed and category pages should load < 500ms
- **SEO:** RSS feed uses proper XML format; category pages have meta tags
- **Responsive Design:** All new UI works on mobile 320px+
- **Theme Support:** Social buttons and navigation inherit theme colors

### Technical Constraints
- Single category per post (not many-to-many)
- Categories are site-scoped (not global)
- Flat category structure (no hierarchy)

---

## 7. Data & Database Changes

### Database Schema Changes

#### New Table: `blog_categories`
```sql
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

CREATE INDEX blog_categories_site_id_idx ON blog_categories(site_id);
```

#### Modify: `blog_posts` - Add category_id
```sql
ALTER TABLE blog_posts ADD COLUMN category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL;
CREATE INDEX blog_posts_category_id_idx ON blog_posts(category_id);
```

#### Modify: `sites` - Add default_category_id
```sql
ALTER TABLE sites ADD COLUMN default_blog_category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL;
```

### Data Model Updates

```typescript
// lib/drizzle/schema/blog-categories.ts (NEW)
export const blogCategories = pgTable(
  "blog_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("blog_categories_site_id_idx").on(t.site_id),
    unique("blog_categories_site_slug_unique").on(t.site_id, t.slug),
  ]
);

// blog-posts.ts - Add category_id
category_id: uuid("category_id").references(() => blogCategories.id, { onDelete: "set null" }),

// sites.ts - Add default_blog_category_id
default_blog_category_id: uuid("default_blog_category_id").references(() => blogCategories.id, { onDelete: "set null" }),
```

### 🚨 MANDATORY: Down Migration Safety Protocol
- [ ] **Step 1:** Generate migration with `npm run db:generate`
- [ ] **Step 2:** Create down migration following `drizzle_down_migration.md` template
- [ ] **Step 3:** Verify down.sql uses `IF EXISTS` clauses
- [ ] **Step 4:** Only then run `npm run db:migrate`

---

## 8. Backend Changes

### Server Actions - `app/actions/blog.ts` Updates

- [ ] `createCategory(siteId, data)` - Create new category
- [ ] `updateCategory(categoryId, data)` - Update category name/description
- [ ] `deleteCategory(categoryId)` - Delete category (posts keep null category)
- [ ] Update `createPost` - Accept category_id, default to site's default_blog_category_id
- [ ] Update `updatePost` - Accept category_id

### Server Actions - `app/actions/sites.ts` Updates

- [ ] Update site settings action to accept `default_blog_category_id`

### Query Functions - `lib/queries/blog.ts` Updates

- [ ] `getCategoriesBySite(siteId)` - List all categories for a site
- [ ] `getPublishedPostsByCategory(siteId, categorySlug, limit, offset)` - Posts filtered by category
- [ ] `getPublishedPostCountByCategory(siteId, categorySlug)` - Count for pagination
- [ ] `getAdjacentPosts(siteId, publishedAt)` - Get previous/next posts by date
- [ ] Update existing queries to include category info

### Utility Functions - `lib/blog-utils.ts` (NEW)

- [ ] `calculateReadingTime(htmlContent: string)` - Returns minutes based on word count (~200 wpm)
- [ ] `generateRssFeed(site, posts)` - Generate RSS 2.0 XML string

---

## 9. Frontend Changes

### New Components

#### `components/blog/CategorySelector.tsx`
- Combobox with existing categories
- "Create new category" option inline
- Shows site's default category as hint

#### `components/blog/SocialShareButtons.tsx`
- Twitter, Facebook, LinkedIn share buttons
- Copy link button with toast confirmation
- Inherits theme colors

#### `components/blog/PostNavigation.tsx`
- Previous/Next post links
- Shows post titles with arrows
- Handles edge cases (first/last post)

#### `components/blog/ReadingTime.tsx`
- Small component showing "X min read"
- Used in post cards and detail pages

### Component Updates

#### `components/blog/PostEditor.tsx`
- Add CategorySelector in sidebar
- Show current category or "Uncategorized"

#### `components/render/blog/PostContent.tsx`
- Add reading time display
- Add social share buttons at bottom
- Add previous/next navigation

#### `components/render/blog/PublicPostCard.tsx`
- Add category badge
- Add reading time

#### `components/render/blog/BlogListingPage.tsx`
- Add category filter UI (optional, low priority)

### New Pages

#### `app/(sites)/sites/[siteSlug]/blog/category/[categorySlug]/page.tsx`
- Category archive page
- Shows category name, description
- Paginated post list filtered by category

#### `app/(sites)/sites/[siteSlug]/blog/feed.xml/route.ts`
- RSS 2.0 feed route
- Returns XML content type
- Latest 20 published posts

### Site Settings Update

#### `components/sites/SettingsTab.tsx`
- Add "Blog Settings" section
- Default category dropdown
- (Existing: show_blog_author toggle)

---

## 10. Code Changes Overview

### 📂 Database Schema Changes

**Before (`lib/drizzle/schema/blog-posts.ts`):**
```typescript
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  site_id: uuid("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  // ... other fields, no category_id
});
```

**After:**
```typescript
import { blogCategories } from "./blog-categories";

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  site_id: uuid("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  category_id: uuid("category_id").references(() => blogCategories.id, { onDelete: "set null" }),
  // ... other fields
});
```

**New file (`lib/drizzle/schema/blog-categories.ts`):**
```typescript
export const blogCategories = pgTable("blog_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  site_id: uuid("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("blog_categories_site_id_idx").on(t.site_id),
  unique("blog_categories_site_slug_unique").on(t.site_id, t.slug),
]);
```

### 📂 Post Editor - Category Selector

**Current PostEditor.tsx sidebar has:**
- Actions card (Save, Publish, Delete)
- Featured Image card
- Details card (Slug, Excerpt)

**Will add CategorySelector card between Featured Image and Details:**
```typescript
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium">Category</CardTitle>
  </CardHeader>
  <CardContent>
    <CategorySelector
      siteId={siteId}
      value={categoryId}
      onChange={setCategoryId}
    />
  </CardContent>
</Card>
```

### 📂 Post Detail Page - New Sections

**Will add to post detail page:**
```typescript
{/* After post content */}
<div className="border-t pt-8 mt-8">
  <SocialShareButtons url={postUrl} title={post.title} />
</div>

<PostNavigation
  previousPost={adjacentPosts.previous}
  nextPost={adjacentPosts.next}
  siteSlug={siteSlug}
/>
```

### 🎯 Key Changes Summary
- [ ] **New table:** `blog_categories` for organizing posts
- [ ] **Schema updates:** Add `category_id` to posts, `default_blog_category_id` to sites
- [ ] **New components:** CategorySelector, SocialShareButtons, PostNavigation, ReadingTime
- [ ] **New routes:** RSS feed, category archive pages
- [ ] **Post editor:** Category selection with inline creation
- [ ] **Post detail:** Reading time, social sharing, prev/next navigation

---

## 11. Implementation Plan

### Phase 1: Database Schema & Migrations ✅ COMPLETE
**Goal:** Add blog_categories table and update existing tables

- [x] **Task 1.1:** Create `lib/drizzle/schema/blog-categories.ts` ✓ 2025-12-28
  - Created new schema with id, site_id, name, slug, description, created_at
  - Added unique constraint on (site_id, slug)
  - Added index on site_id
- [x] **Task 1.2:** Update `lib/drizzle/schema/blog-posts.ts` - add category_id ✓ 2025-12-28
  - Added category_id column with FK to blog_categories (ON DELETE SET NULL)
  - Added index on category_id
- [x] **Task 1.3:** Update `lib/drizzle/schema/sites.ts` - add default_blog_category_id ✓ 2025-12-28
  - Added default_blog_category_id column (uuid, nullable)
  - FK constraint added via migration
- [x] **Task 1.4:** Update `lib/drizzle/schema/index.ts` - export new schema ✓ 2025-12-28
  - Added export for blog-categories.ts
- [x] **Task 1.5:** Generate migration with `npm run db:generate` ✓ 2025-12-28
  - Generated: drizzle/migrations/0013_woozy_tony_stark.sql
- [x] **Task 1.6:** Create down migration following template ✓ 2025-12-28
  - Created: drizzle/migrations/0013_woozy_tony_stark/down.sql
  - Includes all rollback operations with IF EXISTS
- [x] **Task 1.7:** Apply migration with `npm run db:migrate` ✓ 2025-12-28
  - Migration applied successfully

### Phase 2: Backend - Categories CRUD & Queries ✅ COMPLETE
**Goal:** Implement server actions and query functions for categories

- [x] **Task 2.1:** Add category server actions to `app/actions/blog.ts` ✓ 2025-12-28
  - Added createCategory, updateCategory, deleteCategory actions
  - Added CreateCategoryResult interface
  - Added generateUniqueCategorySlug helper function
- [x] **Task 2.2:** Update `createPost` and `updatePost` actions for category_id ✓ 2025-12-28
  - createPost now accepts optional category_id, defaults to site's default
  - updatePost now handles category_id updates
  - Updated UpdatePostData interface
- [x] **Task 2.3:** Add category queries to `lib/queries/blog.ts` ✓ 2025-12-28
  - Added getCategoriesBySite, getCategoryBySlug
  - Added getPublishedPostsByCategory, getPublishedPostCountByCategory
- [x] **Task 2.4:** Add `getAdjacentPosts` query for prev/next navigation ✓ 2025-12-28
  - Returns previous and next published posts based on published_at date
- [x] **Task 2.5:** Update existing post queries to include category data ✓ 2025-12-28
  - Updated getPostsBySite, getPublishedPostsBySite with category info
  - Updated getPostById, getPublishedPostById with category info
  - Updated getPostWithAuthor, getPublishedPostBySlug with category info
  - Added scheduling filter (published_at <= now) to all public queries

### Phase 3: Utility Functions ✅ COMPLETE
**Goal:** Implement reading time and RSS feed generation

- [x] **Task 3.1:** Create `lib/blog-utils.ts` with calculateReadingTime ✓ 2025-12-28
  - Strips HTML tags and counts words
  - Returns minutes at 200 wpm (minimum 1)
  - Added formatReadingTime helper for display
- [x] **Task 3.2:** Add generateRssFeed function for RSS 2.0 XML ✓ 2025-12-28
  - Generates valid RSS 2.0 with atom:link
  - Includes CDATA for title/description
  - Handles enclosures for featured images
  - Proper XML escaping for URLs

### Phase 4: Admin UI - Category Selector ✅ COMPLETE
**Goal:** Add category selection to post editor

- [x] **Task 4.1:** Create `components/blog/CategorySelector.tsx` ✓ 2025-12-28
  - Popover-based selector with search/filter
  - "Uncategorized" option always available
  - Inline "Create new" option when typing non-matching text
  - Sorted alphabetically, handles new category creation
- [x] **Task 4.2:** Update `components/blog/PostEditor.tsx` to include CategorySelector ✓ 2025-12-28
  - Added categoryId state and localCategories for new categories
  - Added Category card in sidebar between Featured Image and Details
  - handleSave now includes category_id in update
- [x] **Task 4.3:** Update post editor page to pass categories ✓ 2025-12-28
  - Fetches categories with getCategoriesBySite
  - Passes categories prop to PostEditor

### Phase 5: Site Settings - Default Category
**Goal:** Add default category setting to site settings

- [ ] **Task 5.1:** Update `components/sites/SettingsTab.tsx`
  - Add Blog Settings section with default category dropdown
- [ ] **Task 5.2:** Update site settings action to save default_blog_category_id

### Phase 6: Public UI - Reading Time & Categories
**Goal:** Display reading time and category on public pages

- [ ] **Task 6.1:** Create `components/blog/ReadingTime.tsx`
- [ ] **Task 6.2:** Update `components/render/blog/PublicPostCard.tsx`
  - Add category badge and reading time
- [ ] **Task 6.3:** Update post detail page to show reading time and category

### Phase 7: Public UI - Social Sharing & Navigation
**Goal:** Add social sharing buttons and prev/next navigation

- [ ] **Task 7.1:** Create `components/blog/SocialShareButtons.tsx`
- [ ] **Task 7.2:** Create `components/blog/PostNavigation.tsx`
- [ ] **Task 7.3:** Update post detail page with both components
- [ ] **Task 7.4:** Add query for adjacent posts

### Phase 8: RSS Feed Route
**Goal:** Generate RSS 2.0 feed

- [ ] **Task 8.1:** Create `app/(sites)/sites/[siteSlug]/blog/feed.xml/route.ts`
- [ ] **Task 8.2:** Test RSS feed with validator

### Phase 9: Category Archive Pages
**Goal:** Public pages filtered by category

- [ ] **Task 9.1:** Create `app/(sites)/sites/[siteSlug]/blog/category/[categorySlug]/page.tsx`
- [ ] **Task 9.2:** Add loading.tsx and not-found.tsx for the route
- [ ] **Task 9.3:** Update blog listing to show category filter links (optional)

### Phase 10: Post Scheduling
**Goal:** Support future publish dates

- [ ] **Task 10.1:** Update PostEditor to show date/time picker when scheduling
- [ ] **Task 10.2:** Update publish action to set future published_at
- [ ] **Task 10.3:** Update public queries to only show posts where published_at <= now

### Phase 11: Comprehensive Code Review
**Goal:** Verify all changes work correctly

- [ ] **Task 11.1:** Present "Implementation Complete!" message
- [ ] **Task 11.2:** Execute comprehensive code review
- [ ] **Task 11.3:** Run linting and type-checking

### Phase 12: User Browser Testing
**Goal:** Manual testing of all new features

- [ ] 👤 **USER TESTING:** Verify category creation and selection
- [ ] 👤 **USER TESTING:** Verify RSS feed works in reader
- [ ] 👤 **USER TESTING:** Verify social sharing buttons
- [ ] 👤 **USER TESTING:** Verify prev/next navigation
- [ ] 👤 **USER TESTING:** Verify category archive pages
- [ ] 👤 **USER TESTING:** Verify scheduled posts

---

## 12. Task Completion Tracking

🚨 **CRITICAL:** Update this document after completing each task with:
- [x] Checkbox marked complete
- ✓ Timestamp (e.g., ✓ 2025-12-28)
- File paths modified
- Brief notes on changes made

---

## 13. File Structure & Organization

### New Files to Create
```
lib/drizzle/schema/
  └── blog-categories.ts          # New categories table

lib/
  └── blog-utils.ts               # Reading time, RSS generation

components/blog/
  ├── CategorySelector.tsx        # Category combobox with create
  ├── SocialShareButtons.tsx      # Social share buttons
  ├── PostNavigation.tsx          # Prev/Next post links
  └── ReadingTime.tsx             # Reading time display

app/(sites)/sites/[siteSlug]/blog/
  ├── category/
  │   └── [categorySlug]/
  │       ├── page.tsx            # Category archive page
  │       ├── loading.tsx
  │       └── not-found.tsx
  └── feed.xml/
      └── route.ts                # RSS feed route handler
```

### Files to Modify
- [ ] `lib/drizzle/schema/blog-posts.ts` - Add category_id
- [ ] `lib/drizzle/schema/sites.ts` - Add default_blog_category_id
- [ ] `lib/drizzle/schema/index.ts` - Export blogCategories
- [ ] `lib/queries/blog.ts` - Add category queries, adjacent posts
- [ ] `app/actions/blog.ts` - Add category CRUD, update post actions
- [ ] `components/blog/PostEditor.tsx` - Add CategorySelector
- [ ] `components/sites/SettingsTab.tsx` - Add default category setting
- [ ] `components/render/blog/PublicPostCard.tsx` - Add category, reading time
- [ ] `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx` - Add sharing, navigation

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Category deletion with posts:** Posts should keep null category (handled by ON DELETE SET NULL)
- [ ] **Duplicate category slugs:** Unique constraint prevents per site
- [ ] **Missing default category:** New posts work fine with null category

### Edge Cases
- [ ] **First/last post navigation:** Show only available direction
- [ ] **Empty categories:** Show "No posts" message on archive page
- [ ] **Post with no content:** Reading time shows "< 1 min read"

### Security & Access Control
- [ ] Category CRUD requires site ownership verification
- [ ] Public category pages only show published posts
- [ ] RSS feed only includes published posts

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow phases sequentially
2. Update this task document after each phase
3. Run linting on modified files
4. Create down migration before applying any database changes

### Code Quality Standards
- Follow existing patterns in the codebase
- Use early returns for cleaner code
- Reuse existing components (Button, Card, Combobox, etc.)
- Theme-aware styling for public components

---

## 17. Notes & Additional Context

### Future Enhancements (Not in this task)
- Dedicated category management UI (beyond inline creation)
- Multiple categories per post
- Category hierarchy (parent/child)
- Limit public blog access to section blocks only

### Design Decisions
- Single category per post for simplicity
- Categories are site-scoped, not global
- Flat structure, no nesting
- Inline creation in post editor (no separate management page yet)

---

**Created:** 2025-12-28
**Status:** Ready for Implementation
**Priority:** P2 - Medium
**Estimated Phases:** 12

---
