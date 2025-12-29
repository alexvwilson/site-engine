# Blog System - Planning Document

> A comprehensive blogging module for Site Engine, enabling users to create and manage ongoing content like news, articles, and stories.

---

## Overview

The Blog System extends Site Engine with content management capabilities, allowing site owners to publish time-based content alongside their static pages.

**Key Goals:**
- Simple, intuitive post creation and editing
- Seamless integration with existing theme system
- Clean public-facing blog pages with good SEO
- Minimal complexity - start simple, extend later

---

## Data Model

### New Tables

#### `blog_posts`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| site_id | uuid | FK to sites |
| title | text | Post title |
| slug | text | URL slug (unique per site) |
| excerpt | text | Short description for listings |
| content | jsonb | Rich text content (same format as text sections) |
| featured_image | text | Image URL |
| status | enum | draft / published |
| published_at | timestamp | Publication date (can be scheduled) |
| author_id | uuid | FK to users |
| category_id | uuid | FK to blog_categories (optional) |
| meta_title | text | Custom SEO title (optional) |
| meta_description | text | Custom SEO description (optional) |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `blog_categories` (Phase 2)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| site_id | uuid | FK to sites |
| name | text | Category name |
| slug | text | URL slug |
| description | text | Optional description |

#### `blog_post_categories` (Phase 2)
| Column | Type | Description |
|--------|------|-------------|
| post_id | uuid | FK to blog_posts |
| category_id | uuid | FK to blog_categories |

---

## URL Structure

```
/sites/[siteSlug]/blog                          # Blog listing (paginated)
/sites/[siteSlug]/blog/[postSlug]               # Individual post
/sites/[siteSlug]/blog/category/[categorySlug]  # Category filter
/sites/[siteSlug]/blog/rss.xml                  # RSS feed
/sites/[siteSlug]/sitemap.xml                   # Site sitemap (includes blog posts)
```

---

## Implementation Phases

### Phase 1: Core Blog Functionality ✅ COMPLETE

**Scope:** Basic post creation, editing, and display

**Database:**
- [x] Create `blog_posts` table schema (`lib/drizzle/schema/blog-posts.ts`)
- [x] Generate and run migration

**Server Actions (`app/actions/blog.ts`):**
- [x] `createPost(siteId, data)` - Create new draft post
- [x] `updatePost(postId, data)` - Update post content
- [x] `publishPost(postId)` - Set status to published
- [x] `unpublishPost(postId)` - Revert to draft
- [x] `deletePost(postId)` - Delete post

**Query Functions (`lib/queries/blog.ts`):**
- [x] `getPostsBySite(siteId)` - List posts for admin
- [x] `getPublishedPostsBySite(siteId, limit, offset)` - List published posts with pagination
- [x] `getPublishedPostBySlug(siteSlug, postSlug)` - Get single post for display
- [x] `getPublishedPostById(postId)` - Get single post by ID (for featured block)

**Admin UI:**
- [x] Add "Blog" tab to site detail page (`components/blog/BlogTab.tsx`)
- [x] Posts list with status badges (`components/blog/PostsList.tsx`, `PostCard.tsx`)
- [x] Post editor page (`app/(protected)/app/sites/[siteId]/blog/[postId]/page.tsx`)
- [x] Rich text editor integration (reuses TiptapEditor)
- [x] Featured image upload (reuses ImageUpload)
- [x] SEO fields (meta title, description) - Added in SEO phase

**Public Routes:**
- [x] Blog listing page (`app/(sites)/sites/[siteSlug]/blog/page.tsx`)
- [x] Post detail page (`app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`)
- [x] Loading states (`loading.tsx`)
- [x] Not found handling (`not-found.tsx`)

**Rendering Components:**
- [x] `BlogListingPage.tsx` - Grid of post cards with pagination
- [x] `PostContent.tsx` - Renders rich text post content
- [x] `PublicPostCard.tsx` - Card for listing display

### Phase 1.5: Blog Section Blocks ✅ COMPLETE (Added)

**Scope:** Embed blog posts as sections on any page

- [x] `blog_featured` block type - Display a selected post as a hero section
- [x] `blog_grid` block type - Display grid of recent posts (3/6/9)
- [x] `BlogFeaturedEditor.tsx` - Post selector dropdown
- [x] `BlogGridEditor.tsx` - Post count and excerpt toggle
- [x] `BlogFeaturedBlock.tsx` - Async server component renderer
- [x] `BlogGridBlock.tsx` - Async server component renderer
- [x] `PreviewBlockRenderer.tsx` - Client-safe preview with placeholders

---

### Phase 2: Categories & Organization ✅ COMPLETE

**Scope:** Categorize posts, filter by category

- [x] Create `blog_categories` table (simplified: single category per post via `category_id` FK on `blog_posts`)
- [x] Category management UI (CRUD in Settings tab)
- [x] Site-level default category setting
- [x] Category selector in post editor
- [x] Category filter on blog listing (via URL parameter)
- [x] Category archive pages (`/sites/[siteSlug]/blog/category/[categorySlug]`)

---

### Phase 3: Enhanced Features ✅ COMPLETE

**Scope:** Additional blog capabilities

- [x] RSS feed generation (`/sites/[siteSlug]/blog/rss.xml`)
- [ ] Related posts suggestions - *Deferred to Phase 4*
- [x] Post scheduling (optional `scheduledAt` parameter in `publishPost`)
- [x] Reading time estimation (~200 wpm calculation)
- [x] Social sharing buttons (Twitter, Facebook, LinkedIn, Copy Link)
- [x] Previous/Next post navigation

---

### Phase 4: Advanced (Future)

- [ ] Related posts suggestions (deferred from Phase 3)
- [ ] Tags (many-to-many, more granular than categories)
- [ ] Search within blog
- [ ] Post series/collections

---

## UI/UX Considerations

### Blog Tab in Site Editor
- Appears alongside Pages, Theme, Settings tabs
- Shows post count badge
- Quick actions: New Post, View Blog

### Post Editor
- Similar layout to page editor but focused on single content block
- Title field (large, prominent)
- Rich text editor for body content
- Sidebar with:
  - Status toggle (Draft/Published)
  - Featured image upload
  - Excerpt field
  - SEO settings (collapsible)
  - Categories (Phase 2)
  - Publish/Update button

### Blog Listing (Public)
- Grid of post cards (responsive: 1/2/3 columns)
- Each card shows: featured image, title, excerpt, date
- Pagination (load more or numbered pages)
- Inherits site theme styling

### Post Page (Public)
- Hero area with featured image (optional)
- Title, author, date
- Rich text content with theme typography
- Back to blog link
- Site header/footer applied

---

## Integration Points

### Theme System ✅
- [x] Blog pages use site's active theme (CSS variables)
- [x] Typography applies to post content via `--theme-font-*` variables
- [x] Colors apply to cards, links, etc. via `--theme-*` variables
- [ ] Blog-specific theme options (post card style, etc.) - *Future*

### SEO ✅ COMPLETE

**Database:**
- [x] `meta_title` column on blog_posts (optional, falls back to title)
- [x] `meta_description` column on blog_posts (optional, falls back to excerpt)

**Admin UI:**
- [x] SEO card in PostEditor sidebar with character count guidance (60/160 recommended)

**Public Pages:**
- [x] Custom meta title/description with intelligent fallbacks
- [x] Canonical URL for each post
- [x] Enhanced Open Graph (siteName, url, modifiedTime)
- [x] Twitter card metadata (summary_large_image when featured image exists)
- [x] JSON-LD Article structured data (headline, description, dates, author, publisher)

**Sitemap:**
- [x] Per-site sitemap at `/sites/[siteSlug]/sitemap.xml`
- [x] Includes: site homepage, blog listing, published pages, published blog posts
- [x] Proper lastmod, changefreq, and priority values
- [x] Caching headers for performance

### Existing Components Reused ✅
- [x] `TiptapEditor` - Rich text editing for post content
- [x] `ImageUpload` - Featured image upload
- [x] `ThemeStyles` - Apply theme to blog pages
- [x] Site header/footer rendering (uses global header/footer if configured)

---

## Open Questions (Resolved)

1. **Blog as page type vs. separate entity?**
   - ✅ Decision: Separate entity (blog_posts table)
   - Allows blog-specific features and cleaner data model

2. **Blog listing as automatic route vs. configurable?**
   - ✅ Decision: Both! Automatic `/blog` route exists, PLUS blog section blocks
   - Users can embed `blog_featured` and `blog_grid` blocks on any page
   - This provides maximum flexibility

3. **Multiple blogs per site?**
   - Current: One blog per site
   - Can extend later if needed

---

## Success Metrics

- [x] Users can create and publish blog posts
- [x] Posts render correctly with site theme
- [x] Blog pages are SEO-friendly (meta tags, JSON-LD, sitemap)
- [x] Post creation is intuitive (< 2 min to publish first post)
- [x] Blog posts can be embedded on any page via section blocks

---

**Created:** 2025-12-28
**Updated:** 2025-12-28
**Status:** Phase 1, 1.5, 2, 3 & SEO Complete
**Priority:** P2 - Medium (larger initiative)

---

## Completed Commits

1. `31adf40` - feat: add blog system with admin UI and public routes (Phase 1)
2. `627078e` - feat: add blog section blocks for embedding posts on pages (Phase 1.5)
3. `36b5212` - feat: add blog categories, reading time, RSS feed, and enhanced features (Phase 2 & 3)
4. `88316dd` - feat: add blog SEO with meta fields, structured data, and sitemap
