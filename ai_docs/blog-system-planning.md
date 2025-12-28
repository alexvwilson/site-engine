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
| status | enum | draft / published / archived |
| published_at | timestamp | Publication date (can be scheduled) |
| author_id | uuid | FK to users |
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
/sites/[siteSlug]/blog              # Blog listing (paginated)
/sites/[siteSlug]/blog/[postSlug]   # Individual post
/sites/[siteSlug]/blog/category/[categorySlug]  # Category filter (Phase 2)
```

---

## Implementation Phases

### Phase 1: Core Blog Functionality

**Scope:** Basic post creation, editing, and display

**Database:**
- [ ] Create `blog_posts` table schema
- [ ] Generate and run migration

**Server Actions (`app/actions/blog.ts`):**
- [ ] `createPost(siteId, data)` - Create new draft post
- [ ] `updatePost(postId, data)` - Update post content
- [ ] `publishPost(postId)` - Set status to published
- [ ] `unpublishPost(postId)` - Revert to draft
- [ ] `deletePost(postId)` - Delete post
- [ ] `getPostsBySite(siteId, options)` - List posts with pagination
- [ ] `getPostBySlug(siteSlug, postSlug)` - Get single post for display

**Admin UI:**
- [ ] Add "Blog" tab to site detail page (`components/blog/BlogTab.tsx`)
- [ ] Posts list with status badges (`components/blog/PostsList.tsx`)
- [ ] Post editor page (`app/(protected)/app/sites/[siteId]/blog/[postId]/page.tsx`)
- [ ] Rich text editor integration (reuse TiptapEditor)
- [ ] Featured image upload (reuse ImageUpload)
- [ ] SEO fields (meta title, description)

**Public Routes:**
- [ ] Blog listing page (`app/(sites)/sites/[siteSlug]/blog/page.tsx`)
- [ ] Post detail page (`app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`)

**Rendering Components:**
- [ ] `BlogListingPage.tsx` - Grid/list of post cards
- [ ] `BlogPostPage.tsx` - Full post with title, image, content, date
- [ ] `PostCard.tsx` - Card for listing display

---

### Phase 2: Categories & Organization

**Scope:** Categorize posts, filter by category

- [ ] Create `blog_categories` and `blog_post_categories` tables
- [ ] Category management UI (CRUD)
- [ ] Category selector in post editor
- [ ] Category filter on blog listing
- [ ] Category archive pages

---

### Phase 3: Enhanced Features

**Scope:** Additional blog capabilities

- [ ] RSS feed generation (`/sites/[siteSlug]/blog/feed.xml`)
- [ ] Related posts suggestions
- [ ] Post scheduling (publish_at in future)
- [ ] Reading time estimation
- [ ] Social sharing buttons
- [ ] Previous/Next post navigation

---

### Phase 4: Advanced (Future)

- [ ] Tags (many-to-many, more granular than categories)
- [ ] Search within blog
- [ ] Comments system (or integration with Disqus/etc)
- [ ] Multiple authors with author pages
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

### Theme System
- Blog pages use site's active theme
- Typography applies to post content
- Colors apply to cards, links, etc.
- Consider blog-specific theme options later (post card style, etc.)

### SEO
- Post meta title/description
- Open Graph tags for social sharing
- Structured data (Article schema)
- Automatic sitemap inclusion

### Existing Components to Reuse
- `TiptapEditor` - Rich text editing
- `ImageUpload` - Featured image
- `ThemeStyles` - Apply theme to blog pages
- Site header/footer rendering

---

## Open Questions

1. **Blog as page type vs. separate entity?**
   - Current plan: Separate entity (blog_posts table)
   - Alternative: Blog post as a special page type
   - Decision: Separate entity allows for blog-specific features

2. **Blog listing as automatic route vs. configurable?**
   - Current plan: Automatic `/blog` route when blog is enabled
   - Alternative: Let user choose where blog appears
   - Decision: Start with automatic, consider flexibility later

3. **Multiple blogs per site?**
   - Current plan: One blog per site
   - Could extend later if needed

---

## Success Metrics

- Users can create and publish blog posts
- Posts render correctly with site theme
- Blog pages are SEO-friendly
- Post creation is intuitive (< 2 min to publish first post)

---

**Created:** 2025-12-28
**Status:** Planning
**Priority:** P2 - Medium (larger initiative)
