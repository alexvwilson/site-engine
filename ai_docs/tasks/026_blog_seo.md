# Blog SEO Enhancements

> Completing the deferred SEO features from Phase 2 of the blog system: meta fields, Open Graph optimization, structured data, and sitemap generation.

---

## 1. Task Overview

### Task Title
**Title:** Blog SEO - Meta Fields, Structured Data & Sitemap

### Goal Statement
**Goal:** Enhance blog posts with proper SEO capabilities including custom meta title/description fields, optimized Open Graph tags, JSON-LD structured data (Article schema), and automatic sitemap generation for search engine discoverability.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis not required** - This is a straightforward feature enhancement with established patterns in the codebase. The implementation approach is clear:
- Database fields for SEO metadata (following existing `sites.meta_title` pattern)
- Admin UI additions to existing PostEditor
- Standard Next.js metadata and sitemap APIs

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State

**What exists:**
- `blog_posts` table with basic fields (title, slug, excerpt, content, featured_image, status, published_at)
- `generateMetadata()` on blog post pages using title and excerpt as fallbacks
- Basic Open Graph tags (title, description, type, publishedTime, authors, images)
- PostEditor component with sidebar cards for Actions, Featured Image, Category, Details

**What's missing (deferred from Phase 2):**
- [ ] Post meta title/description database fields
- [ ] SEO editing UI in admin
- [ ] JSON-LD structured data (Article schema)
- [ ] Sitemap generation (`app/sitemap.ts`)

### Existing Codebase Analysis

**🔍 Relevant Files Analyzed:**

- [x] **Database Schema** (`lib/drizzle/schema/blog-posts.ts`)
  - Current columns: id, site_id, author_id, category_id, title, slug, excerpt, content, featured_image, status, published_at, created_at, updated_at
  - Sites table already has `meta_title`, `meta_description` pattern to follow

- [x] **Server Actions** (`app/actions/blog.ts`)
  - `updatePost()` accepts UpdatePostData interface - needs SEO fields added
  - Pattern established for optional nullable fields

- [x] **Public Pages** (`app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`)
  - Has `generateMetadata()` already - needs enhancement for custom SEO fields
  - Has basic Open Graph - needs canonical URL, site_name
  - Missing JSON-LD structured data

- [x] **Admin UI** (`components/blog/PostEditor.tsx`)
  - Sidebar has Cards pattern - add new SEO card
  - State management pattern established with useState hooks

---

## 4. Context & Problem Definition

### Problem Statement
Blog posts currently lack customizable SEO metadata. The title and excerpt are used as fallbacks for meta tags, but content creators may want different text optimized for search results vs. display. Additionally, there's no structured data for rich search results and no sitemap for search engine crawling.

### Success Criteria
- [ ] Posts can have optional custom meta_title and meta_description
- [ ] Meta tags use custom values when set, with intelligent fallbacks
- [ ] JSON-LD Article schema added to blog post pages
- [ ] Sitemap.xml includes all published sites, pages, and blog posts
- [ ] No regression in existing SEO (Open Graph still works)

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - free to add new columns
- **Data loss acceptable** - existing posts don't have SEO fields yet
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can set optional meta_title for blog posts (falls back to post title)
- User can set optional meta_description for blog posts (falls back to excerpt)
- Blog post pages include JSON-LD Article structured data
- Sitemap.xml is generated dynamically with all published content

### Non-Functional Requirements
- **Performance:** Sitemap should be cached/ISR to avoid expensive queries on every request
- **SEO:** Follow Google's structured data guidelines for Article schema
- **Responsive Design:** SEO fields in admin work on mobile

### Technical Constraints
- Must use Drizzle ORM migration workflow
- Must follow Next.js 15 Metadata API patterns
- Sitemap must handle multi-site architecture

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- Add SEO fields to blog_posts table
ALTER TABLE blog_posts ADD COLUMN meta_title text;
ALTER TABLE blog_posts ADD COLUMN meta_description text;
```

### Data Model Updates

```typescript
// lib/drizzle/schema/blog-posts.ts - Add to blogPosts table definition
meta_title: text("meta_title"),
meta_description: text("meta_description"),
```

### 🚨 MANDATORY: Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate`
- [ ] **Step 2: Create Down Migration** - Create `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Step 3: Verify Safety** - Ensure `IF EXISTS` clauses
- [ ] **Step 4: Apply Migration** - Run `npm run db:migrate`

---

## 8. Backend Changes

### Server Actions Updates

**`app/actions/blog.ts`:**
- [ ] Add `meta_title` and `meta_description` to `UpdatePostData` interface
- [ ] Handle these fields in `updatePost()` function

### New Query Functions

**`lib/queries/blog.ts`:**
- [ ] Ensure existing queries return new SEO fields (no changes needed if using `select *` pattern)

### Sitemap Implementation

**`app/sitemap.ts`:**
- [ ] Create dynamic sitemap using Next.js Sitemap API
- [ ] Query all published sites
- [ ] Query all published pages per site
- [ ] Query all published blog posts per site
- [ ] Return MetadataRoute.Sitemap array

---

## 9. Frontend Changes

### Component Updates

**`components/blog/PostEditor.tsx`:**
- [ ] Add `metaTitle` and `metaDescription` state
- [ ] Add new "SEO" card in sidebar (collapsible)
- [ ] Include fields in `handleSave()` function

### Page Updates

**`app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`:**
- [ ] Update `generateMetadata()` to use `meta_title` ?? `title` pattern
- [ ] Update `generateMetadata()` to use `meta_description` ?? `excerpt` pattern
- [ ] Add canonical URL to metadata
- [ ] Add site_name to Open Graph
- [ ] Add JSON-LD script tag with Article schema

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**blog-posts.ts schema:**
```typescript
export const blogPosts = pgTable("blog_posts", {
  // ... existing fields
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  // No SEO-specific fields
});
```

**PostEditor.tsx state:**
```typescript
const [title, setTitle] = useState(post.title);
const [excerpt, setExcerpt] = useState(post.excerpt || "");
// No SEO state
```

**generateMetadata (post page):**
```typescript
return {
  title: `${post.title} | ${post.site.name}`,
  description: post.excerpt || `Read ${post.title}...`,
  // No canonical, no structured data
};
```

### 📂 **After Changes**

**blog-posts.ts schema:**
```typescript
export const blogPosts = pgTable("blog_posts", {
  // ... existing fields
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
});
```

**PostEditor.tsx with SEO card:**
```typescript
const [metaTitle, setMetaTitle] = useState(post.meta_title || "");
const [metaDescription, setMetaDescription] = useState(post.meta_description || "");

// New SEO Card in sidebar
<Card>
  <CardHeader>
    <CardTitle>SEO</CardTitle>
  </CardHeader>
  <CardContent>
    <Input value={metaTitle} onChange={...} placeholder="Custom page title" />
    <Textarea value={metaDescription} onChange={...} placeholder="Custom meta description" />
  </CardContent>
</Card>
```

**generateMetadata with custom fields + structured data:**
```typescript
return {
  title: post.meta_title || `${post.title} | ${post.site.name}`,
  description: post.meta_description || post.excerpt || `Read ${post.title}...`,
  alternates: { canonical: postUrl },
  openGraph: {
    siteName: post.site.name,
    // ... existing OG tags
  },
};

// JSON-LD in page component
<script type="application/ld+json" dangerouslySetInnerHTML={{
  __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    // ...
  })
}} />
```

### 🎯 **Key Changes Summary**
- [ ] **Database:** Add 2 nullable text columns to blog_posts
- [ ] **Server Actions:** Extend UpdatePostData interface
- [ ] **Admin UI:** Add SEO card to PostEditor sidebar
- [ ] **Public Pages:** Enhanced metadata + JSON-LD
- [ ] **Sitemap:** New app/sitemap.ts file
- **Files Modified:** 5 files
- **New Files:** 1 file (app/sitemap.ts)

---

## 11. Implementation Plan

### Phase 1: Database Migration ✅ COMPLETE 2025-12-28
**Goal:** Add SEO columns to blog_posts table

- [x] **Task 1.1:** Update Drizzle schema ✓
  - Files: `lib/drizzle/schema/blog-posts.ts`
  - Details: Added `meta_title` and `meta_description` text columns
- [x] **Task 1.2:** Generate migration ✓
  - Command: `npm run db:generate`
  - Generated: `0014_short_texas_twister.sql`
- [x] **Task 1.3:** Create down migration ✓
  - Files: `drizzle/migrations/0014_short_texas_twister/down.sql`
- [x] **Task 1.4:** Apply migration ✓
  - Command: `npm run db:migrate` - completed successfully

### Phase 2: Backend Updates ✅ COMPLETE 2025-12-28
**Goal:** Enable saving SEO fields

- [x] **Task 2.1:** Update server action ✓
  - Files: `app/actions/blog.ts`
  - Details: Added meta_title, meta_description to UpdatePostData interface and updatePost function

### Phase 3: Admin UI ✅ COMPLETE 2025-12-28
**Goal:** Add SEO editing in PostEditor

- [x] **Task 3.1:** Add SEO state and card ✓
  - Files: `components/blog/PostEditor.tsx`
  - Details: Added metaTitle/metaDescription state, SEO card in sidebar with character counts, included in save handler

### Phase 4: Public SEO Enhancements ✅ COMPLETE 2025-12-28
**Goal:** Improve metadata and add structured data

- [x] **Task 4.1:** Update generateMetadata ✓
  - Files: `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`
  - Details: Added custom meta field support with fallbacks, canonical URL, Twitter cards
- [x] **Task 4.2:** Add JSON-LD structured data ✓
  - Files: `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`
  - Details: Add Article schema script tag

### Phase 5: Sitemap Generation ✅ COMPLETE 2025-12-28
**Goal:** Create dynamic sitemap

- [x] **Task 5.1:** Create sitemap.ts ✓
  - Files: `app/sitemap.ts`
  - Details: Created dynamic sitemap with all published sites, pages, and blog posts (~80 lines)

### Phase 6: Code Review & Testing ✅ COMPLETE 2025-12-28
**Goal:** Verify implementation

- [x] **Task 6.1:** Run linting ✓ - No new errors (8 pre-existing warnings)
- [x] **Task 6.2:** Run type checking ✓ - No type errors
- [ ] **Task 6.3:** Verify meta tags in page source - 👤 USER TESTING
- [ ] **Task 6.4:** Validate JSON-LD with Google's Rich Results Test - 👤 USER TESTING
- [ ] **Task 6.5:** Check sitemap.xml output - 👤 USER TESTING

---

## 12. Task Completion Tracking

_To be updated during implementation with timestamps and notes._

---

## 13. File Structure & Organization

### New Files to Create
```
app/
└── sitemap.ts                    # Dynamic sitemap generation
```

### Files to Modify
- [ ] `lib/drizzle/schema/blog-posts.ts` - Add SEO columns
- [ ] `app/actions/blog.ts` - Add SEO fields to update interface
- [ ] `components/blog/PostEditor.tsx` - Add SEO card
- [ ] `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx` - Enhanced metadata + JSON-LD

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty SEO fields:** Fallback logic must work correctly
- [ ] **Very long meta descriptions:** May need character limit guidance in UI
- [ ] **Special characters in title:** JSON-LD escaping handled by JSON.stringify

### Security Considerations
- [ ] **XSS in JSON-LD:** Using JSON.stringify for safe output
- [ ] **No user input validation needed:** These are optional text fields

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow standard workflow from task template:
1. Execute phase-by-phase
2. Update task document after each phase
3. Wait for "proceed" between phases
4. Run linting on modified files
5. Present comprehensive code review at end

---

## 17. Notes & Additional Context

### JSON-LD Article Schema Reference
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Post Title",
  "description": "Post excerpt",
  "image": "featured_image_url",
  "datePublished": "2025-01-01T00:00:00Z",
  "dateModified": "2025-01-02T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Site Name"
  }
}
```

### Next.js Sitemap API Reference
```typescript
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: 'https://example.com', lastModified: new Date() },
  ]
}
```

---

**Created:** 2025-12-28
**Status:** Ready for Implementation
**Priority:** P2 - Medium

---

*Template Version: 1.0*
