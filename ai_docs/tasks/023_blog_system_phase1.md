# AI Task Template

> **Task:** Blog System - Phase 1 Core Functionality

---

## 1. Task Overview

### Task Title
**Title:** Blog System Phase 1 - Core Blog Functionality

### Goal Statement
**Goal:** Add a complete blogging module to Site Engine, enabling site owners to create, edit, and publish blog posts that render with their site's theme. This establishes the foundation for ongoing content management alongside static pages.

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis Decision
**Skip Strategic Analysis** - The planning document (`ai_docs/blog-system-planning.md`) has already defined the approach:
- Blog posts as separate entity (not page type)
- Automatic `/blog` route per site
- Reuse existing components (TiptapEditor, ImageUpload, ThemeStyles)

User has confirmed key decisions:
- Responsive post editor (two-column desktop, stacked mobile)
- "Load More" pagination
- Create draft → redirect to editor flow
- Show author toggle in site settings

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Language:** TypeScript with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Authentication:** Supabase Auth via middleware

### Current State
- Sites have Pages, Theme, and Settings tabs
- Pages contain sections with various block types
- Rich text editing exists via TiptapEditor
- Image uploads work via Supabase Storage
- Theme system applies CSS variables to rendered content
- No blog functionality exists currently

### Existing Codebase Analysis

**Relevant Areas Analyzed:**

- [x] **Database Schema** (`lib/drizzle/schema/*.ts`)
  - `sites` table has user_id, slug, settings columns
  - `pages` table has site_id, slug, status, SEO fields
  - Pattern: pgTable with indexes, InferSelectModel/InferInsertModel types

- [x] **Server Actions** (`app/actions/*.ts`)
  - CRUD pattern with requireUserId() authentication
  - ActionResult return type: `{ success: boolean; error?: string }`
  - revalidatePath() after mutations

- [x] **Component Patterns** (`components/sites/SiteTabs.tsx`)
  - Tab switching via URL query params
  - Props passed from parent page component
  - Each tab is a separate component

- [x] **Published Site Routes** (`app/(sites)/sites/[siteSlug]/page.tsx`)
  - Fetches site, checks ownership for under_construction
  - Applies theme via ThemeStyles component
  - Uses PageRenderer for sections

---

## 4. Context & Problem Definition

### Problem Statement
Site Engine currently supports static pages with sections. Users need a way to publish time-based content (news, articles, updates) that:
- Has a different data model than pages (posts with publish dates, excerpts)
- Appears in a chronological listing with pagination
- Integrates with existing theme system
- Is easy to create and manage

### Success Criteria
- [ ] User can create a new blog post from the Blog tab
- [ ] User can edit post title, content (rich text), excerpt, featured image
- [ ] User can save as draft or publish immediately
- [ ] User can toggle "Show Author" in site settings
- [ ] Published posts appear at `/sites/[slug]/blog`
- [ ] Individual posts render at `/sites/[slug]/blog/[postSlug]`
- [ ] Blog pages inherit site theme styling
- [ ] Blog listing shows paginated posts with "Load More"

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns**
- **Data loss acceptable** - no existing blog data to preserve
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can create, edit, update, and delete blog posts
- Posts have: title, slug, content (rich text), excerpt, featured image, status (draft/published), published_at
- Blog tab shows list of posts with status badges
- Post editor has responsive layout (sidebar on desktop, stacked on mobile)
- Published posts render with site theme
- Blog listing paginates with "Load More" button
- Site settings include "Show Author on Posts" toggle

### Non-Functional Requirements
- **Performance:** Blog listing loads in <2s with 50+ posts
- **Security:** Only site owner can create/edit posts
- **Usability:** Create-to-publish flow under 2 minutes
- **Responsive Design:** Works on mobile (320px+), tablet, desktop
- **Theme Support:** Posts render correctly in light and dark mode

### Technical Constraints
- Must use existing TiptapEditor for rich text
- Must use existing ImageUpload for featured images
- Must follow existing schema patterns (Drizzle ORM)
- Must follow existing server action patterns

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- New blog_posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content JSONB,
  featured_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(site_id, slug)
);

-- Indexes for common queries
CREATE INDEX blog_posts_site_id_idx ON blog_posts(site_id);
CREATE INDEX blog_posts_author_id_idx ON blog_posts(author_id);
CREATE INDEX blog_posts_status_idx ON blog_posts(status);
CREATE INDEX blog_posts_published_at_idx ON blog_posts(published_at);

-- Add show_author setting to sites table
ALTER TABLE sites ADD COLUMN show_blog_author BOOLEAN NOT NULL DEFAULT true;
```

### Data Model Updates

```typescript
// lib/drizzle/schema/blog-posts.ts
import { pgTable, text, timestamp, uuid, index, unique, jsonb } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { sites } from "./sites";

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    author_id: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    content: jsonb("content").$type<{ html: string }>(),
    featured_image: text("featured_image"),
    status: text("status", { enum: POST_STATUSES }).notNull().default("draft"),
    published_at: timestamp("published_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("blog_posts_site_id_idx").on(t.site_id),
    index("blog_posts_author_id_idx").on(t.author_id),
    index("blog_posts_status_idx").on(t.status),
    index("blog_posts_published_at_idx").on(t.published_at),
    unique("blog_posts_site_slug_unique").on(t.site_id, t.slug),
  ]
);

export type BlogPost = InferSelectModel<typeof blogPosts>;
export type NewBlogPost = InferInsertModel<typeof blogPosts>;
```

### Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate`
- [ ] **Step 2: Create Down Migration** - Create `down.sql` with DROP TABLE and ALTER TABLE DROP COLUMN
- [ ] **Step 3: Verify Safety** - Use `IF EXISTS` clauses
- [ ] **Step 4: Apply Migration** - Run `npm run db:migrate`

---

## 8. Backend Changes

### Server Actions (`app/actions/blog.ts`)

- [ ] **`createPost(siteId)`** - Create new draft post with auto-generated slug, return postId
- [ ] **`updatePost(postId, data)`** - Update post content, title, slug, excerpt, featured_image
- [ ] **`publishPost(postId)`** - Set status to published, set published_at
- [ ] **`unpublishPost(postId)`** - Revert status to draft
- [ ] **`deletePost(postId)`** - Delete post with ownership check

### Query Functions (`lib/queries/blog.ts`)

- [ ] **`getPostsBySite(siteId)`** - List all posts for admin (drafts + published)
- [ ] **`getPublishedPostsBySite(siteId, limit, offset)`** - Paginated published posts for public
- [ ] **`getPostById(postId)`** - Single post for editor
- [ ] **`getPublishedPostBySlug(siteSlug, postSlug)`** - Single published post for public view
- [ ] **`getPublishedPostCount(siteId)`** - Total count for pagination

---

## 9. Frontend Changes

### New Components

#### Admin Components (`components/blog/`)

- [ ] **`BlogTab.tsx`** - Main tab content with "New Post" button and posts list
- [ ] **`PostsList.tsx`** - List of posts with status badges, edit/delete actions
- [ ] **`PostCard.tsx`** - Individual post row/card in admin list
- [ ] **`PostEditor.tsx`** - Full post editor with title, content, sidebar

#### Public Components (`components/render/blog/`)

- [ ] **`BlogListingPage.tsx`** - Grid of post cards with "Load More"
- [ ] **`BlogPostPage.tsx`** - Full post rendering with theme
- [ ] **`PublicPostCard.tsx`** - Card for blog listing (image, title, excerpt, date)

### Page Updates

- [ ] **`components/sites/SiteTabs.tsx`** - Add "Blog" tab
- [ ] **`components/sites/SettingsTab.tsx`** - Add "Show Author on Posts" toggle

### New Routes

#### Admin Routes
- [ ] **`app/(protected)/app/sites/[siteId]/blog/[postId]/page.tsx`** - Post editor page
- [ ] **`app/(protected)/app/sites/[siteId]/blog/[postId]/loading.tsx`** - Loading state
- [ ] **`app/(protected)/app/sites/[siteId]/blog/[postId]/error.tsx`** - Error boundary

#### Public Routes
- [ ] **`app/(sites)/sites/[siteSlug]/blog/page.tsx`** - Blog listing
- [ ] **`app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`** - Individual post
- [ ] **`app/(sites)/sites/[siteSlug]/blog/loading.tsx`** - Loading state

---

## 10. Code Changes Overview

### Sites Schema Addition

```typescript
// lib/drizzle/schema/sites.ts - ADD to existing table definition
show_blog_author: boolean("show_blog_author").notNull().default(true),
```

### SiteTabs Addition

```typescript
// components/sites/SiteTabs.tsx - ADD Blog tab
<TabsTrigger value="blog">Blog</TabsTrigger>
// ...
<TabsContent value="blog">
  <BlogTab siteId={site.id} />
</TabsContent>
```

### Key Changes Summary
- [ ] **New Table:** `blog_posts` with full CRUD support
- [ ] **New Column:** `sites.show_blog_author` boolean setting
- [ ] **New Tab:** Blog tab in SiteTabs component
- [ ] **New Routes:** 4 new routes (2 admin, 2 public)
- [ ] **New Components:** ~8 new components for blog functionality
- [ ] **Files Modified:** SiteTabs.tsx, SettingsTab.tsx, sites schema

---

## 11. Implementation Plan

### Phase 1: Database & Schema
**Goal:** Create blog_posts table and add show_blog_author setting

- [ ] **Task 1.1:** Create `lib/drizzle/schema/blog-posts.ts` with blogPosts table
- [ ] **Task 1.2:** Update `lib/drizzle/schema/sites.ts` - add show_blog_author column
- [ ] **Task 1.3:** Update `lib/drizzle/schema/index.ts` - export new schema
- [ ] **Task 1.4:** Run `npm run db:generate` to generate migration
- [ ] **Task 1.5:** Create down migration file
- [ ] **Task 1.6:** Run `npm run db:migrate` to apply migration

### Phase 2: Server Actions & Queries
**Goal:** Backend CRUD operations for blog posts

- [ ] **Task 2.1:** Create `lib/queries/blog.ts` with query functions
- [ ] **Task 2.2:** Create `app/actions/blog.ts` with server actions
- [ ] **Task 2.3:** Update `app/actions/sites.ts` - add showBlogAuthor to settings

### Phase 3: Admin UI - Blog Tab & Posts List
**Goal:** Add Blog tab to site management

- [ ] **Task 3.1:** Create `components/blog/BlogTab.tsx` - main tab content
- [ ] **Task 3.2:** Create `components/blog/PostsList.tsx` - posts list with badges
- [ ] **Task 3.3:** Create `components/blog/PostCard.tsx` - admin post row
- [ ] **Task 3.4:** Update `components/sites/SiteTabs.tsx` - add Blog tab
- [ ] **Task 3.5:** Update `components/sites/SettingsTab.tsx` - add author toggle
- [ ] **Task 3.6:** Update site detail page to fetch/pass blog data

### Phase 4: Admin UI - Post Editor
**Goal:** Full post editing experience

- [ ] **Task 4.1:** Create `components/blog/PostEditor.tsx` - responsive editor layout
- [ ] **Task 4.2:** Create `app/(protected)/app/sites/[siteId]/blog/[postId]/page.tsx`
- [ ] **Task 4.3:** Create loading.tsx and error.tsx for post editor route
- [ ] **Task 4.4:** Wire up save, publish, unpublish actions

### Phase 5: Public Routes - Blog Listing
**Goal:** Public blog listing page

- [ ] **Task 5.1:** Create `components/render/blog/PublicPostCard.tsx` - themed card
- [ ] **Task 5.2:** Create `components/render/blog/BlogListingPage.tsx` - grid + load more
- [ ] **Task 5.3:** Create `app/(sites)/sites/[siteSlug]/blog/page.tsx`
- [ ] **Task 5.4:** Create loading.tsx for blog listing

### Phase 6: Public Routes - Individual Post
**Goal:** Individual post rendering

- [ ] **Task 6.1:** Create `components/render/blog/BlogPostPage.tsx` - full post render
- [ ] **Task 6.2:** Create `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`
- [ ] **Task 6.3:** Add SEO metadata generation

### Phase 7: Testing & Polish
**Goal:** Verify everything works together

- [ ] **Task 7.1:** Test complete create → edit → publish → view flow
- [ ] **Task 7.2:** Test theme application on blog pages
- [ ] **Task 7.3:** Test responsive layouts (mobile, tablet, desktop)
- [ ] **Task 7.4:** Test light/dark mode on blog pages
- [ ] **Task 7.5:** Test "Load More" pagination

### Phase 8: Comprehensive Code Review
**Goal:** Final verification before user testing

- [ ] **Task 8.1:** Present "Implementation Complete!" message
- [ ] **Task 8.2:** Execute comprehensive code review (if approved)

---

## 12. Task Completion Tracking

**Format:** Mark tasks as `[x]` with timestamp and notes after completion.

Example:
```
- [x] **Task 1.1:** Create blog-posts.ts schema ✓ 2025-12-28
  - Files: `lib/drizzle/schema/blog-posts.ts` ✓
  - Details: Created blogPosts table with all columns and indexes ✓
```

---

## 13. File Structure & Organization

### New Files to Create
```
lib/drizzle/schema/
├── blog-posts.ts              # Blog posts table schema

lib/queries/
├── blog.ts                    # Blog query functions

app/actions/
├── blog.ts                    # Blog server actions

components/blog/
├── BlogTab.tsx                # Main blog tab content
├── PostsList.tsx              # Admin posts list
├── PostCard.tsx               # Admin post row/card
├── PostEditor.tsx             # Post editor component

components/render/blog/
├── BlogListingPage.tsx        # Public blog listing
├── BlogPostPage.tsx           # Public post page
├── PublicPostCard.tsx         # Public post card

app/(protected)/app/sites/[siteId]/blog/[postId]/
├── page.tsx                   # Post editor page
├── loading.tsx                # Loading state
├── error.tsx                  # Error boundary

app/(sites)/sites/[siteSlug]/blog/
├── page.tsx                   # Blog listing
├── loading.tsx                # Loading state
├── [postSlug]/
│   └── page.tsx              # Individual post
```

### Files to Modify
- [ ] `lib/drizzle/schema/sites.ts` - Add show_blog_author column
- [ ] `lib/drizzle/schema/index.ts` - Export blogPosts
- [ ] `components/sites/SiteTabs.tsx` - Add Blog tab
- [ ] `components/sites/SettingsTab.tsx` - Add author toggle
- [ ] `app/(protected)/app/sites/[siteId]/page.tsx` - Fetch blog post count for tab badge

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Duplicate slug:** Generate unique slug if conflict exists
- [ ] **Empty content publish:** Validate post has content before publishing
- [ ] **Unauthorized access:** All actions check site ownership

### Edge Cases
- [ ] **No posts yet:** Show empty state with "Create your first post" CTA
- [ ] **Draft posts:** Ensure drafts don't appear on public blog
- [ ] **Deleted site:** Posts cascade delete with site

### Security Considerations
- [ ] **Authentication:** All admin routes use requireUserId()
- [ ] **Authorization:** Server actions verify user owns site before mutations
- [ ] **Input Validation:** Sanitize title, slug, excerpt inputs

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

### Database Migration
Migration will be generated and applied during Phase 1.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow phases sequentially. After each phase:
1. Mark tasks complete with timestamps
2. Provide phase recap with files changed
3. Wait for "proceed" before next phase

### Code Quality Standards
- Use existing patterns from pages/sections for consistency
- Follow TypeScript strict mode
- Use shadcn/ui components
- Mobile-first responsive design
- Support light/dark themes

---

## 17. Notes & Additional Context

### Reference Implementations
- **Pages schema:** `lib/drizzle/schema/pages.ts`
- **Server actions pattern:** `app/actions/sites.ts`
- **Tab component:** `components/sites/SiteTabs.tsx`
- **Published page rendering:** `app/(sites)/sites/[siteSlug]/page.tsx`
- **Rich text editor:** `components/editor/TiptapEditor.tsx`
- **Image upload:** `components/editor/ImageUpload.tsx`

### Planning Document
See `ai_docs/blog-system-planning.md` for full context and future phases.

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **No breaking changes** - This is a new feature, not modifying existing functionality

### Ripple Effects Assessment
- [ ] **Sites table modification** - Adding column is additive, no impact on existing code
- [ ] **SiteTabs change** - Adding tab, existing tabs unchanged

### Performance Implications
- [ ] **New queries** - Indexed appropriately for blog listing performance
- [ ] **Bundle size** - Minimal increase (~5-10KB for new components)

### Security Considerations
- [ ] **New routes protected** - Admin routes use requireUserId()
- [ ] **Public routes read-only** - No mutations on public blog pages

### No Critical Issues Identified
This is a new, additive feature with no impact on existing functionality.

---

**Created:** 2025-12-28
**Status:** Ready for Implementation
**Estimated Phases:** 8
