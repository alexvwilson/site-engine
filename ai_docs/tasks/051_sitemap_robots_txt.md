# Task 051: Sitemap and robots.txt for Child Sites

## 1. Task Overview

### Task Title
**Title:** Dynamic Sitemap and robots.txt Generation for Child Sites

### Goal Statement
**Goal:** Generate dynamic sitemap.xml and robots.txt files for each published child site, improving SEO discoverability. Sitemaps will include all published pages and blog content, using custom domain URLs when configured.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis skipped** - This is a straightforward implementation with one clear approach: Next.js App Router dynamic route handlers.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15 (App Router), React 19
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **Existing SEO:** OpenGraph metadata, JSON-LD on blog posts

### Current State
- No sitemap.xml exists for child sites
- No robots.txt exists for child sites
- Custom domain support is fully implemented
- `getPublicSiteUrl()` utility exists in `lib/metadata.ts`

### Existing Codebase Analysis

**Checked:**
- [x] **Published site routes** (`app/(sites)/sites/[siteSlug]/`) - Existing page structure
- [x] **Blog routes** - Blog listing, posts, categories all exist
- [x] **Custom domain** - `custom_domain` field and `getPublicSiteUrl()` utility
- [x] **Database queries** - `lib/queries/sites.ts`, `lib/queries/blog.ts` for fetching published content

---

## 4. Context & Problem Definition

### Problem Statement
Search engines have difficulty discovering all pages on child sites without a sitemap. The missing sitemap.xml and robots.txt hurt SEO rankings and indexing efficiency.

### Success Criteria
- [x] Each child site has `/sites/[slug]/sitemap.xml` endpoint
- [x] Each child site has `/sites/[slug]/robots.txt` endpoint
- [x] Sitemap includes homepage, all published pages, blog listing, blog posts, categories
- [x] URLs use custom domain when configured, fallback to `/sites/[slug]`
- [x] Sitemap auto-updates based on published content (1-hour cache)
- [x] robots.txt allows all crawlers and points to sitemap

---

## 5. Development Mode Context

- **No backwards compatibility concerns** - New feature
- **Priority: Speed and simplicity** - Standard Next.js patterns

---

## 6. Technical Requirements

### Functional Requirements
- Dynamic sitemap.xml generation per child site
- Dynamic robots.txt generation per child site
- Include all published pages with `lastmod` dates
- Include blog posts with publication dates
- Support custom domain URLs
- 1-hour cache revalidation for performance

### Non-Functional Requirements
- **Performance:** Cached responses, minimal database queries
- **SEO:** Valid XML sitemap format, proper robots.txt syntax

### Technical Constraints
- Must use Next.js App Router route handlers
- Must query only published content (status = 'published')

---

## 7. Data & Database Changes

**No database changes required** - Uses existing tables and columns.

---

## 8. Backend Changes & Background Jobs

### New Route Handlers

**`app/(sites)/sites/[siteSlug]/sitemap.xml/route.ts`**
- Fetches site by slug
- Fetches all published pages for site
- Fetches all published blog posts for site
- Fetches all blog categories with posts
- Generates XML sitemap with proper URLs
- Uses custom domain if configured

**`app/(sites)/sites/[siteSlug]/robots.txt/route.ts`**
- Simple text response
- Points to sitemap URL
- Allows all user agents

### Query Functions Needed

**`lib/queries/sitemap.ts`** (new file)
- `getSitemapData(siteSlug)` - Fetches all data needed for sitemap in one efficient query

---

## 9. Frontend Changes

**No frontend changes required** - These are API route handlers only.

---

## 10. Code Changes Overview

### New Files to Create

#### `app/(sites)/sites/[siteSlug]/sitemap.xml/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSitemapData } from "@/lib/queries/sitemap";
import { getPublicSiteUrl } from "@/lib/metadata";

export const revalidate = 3600; // 1 hour cache

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params;
  const data = await getSitemapData(siteSlug);

  if (!data) {
    return new NextResponse("Site not found", { status: 404 });
  }

  const baseUrl = getPublicSiteUrl(siteSlug, data.site.custom_domain);

  // Generate XML sitemap
  const xml = generateSitemapXml(baseUrl, data);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
```

#### `app/(sites)/sites/[siteSlug]/robots.txt/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getPublishedSiteBySlug } from "@/lib/queries/sites";
import { getPublicSiteUrl } from "@/lib/metadata";

export const revalidate = 3600; // 1 hour cache

export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);

  if (!site) {
    return new NextResponse("Site not found", { status: 404 });
  }

  const baseUrl = getPublicSiteUrl(siteSlug, site.custom_domain);

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
```

#### `lib/queries/sitemap.ts`
```typescript
import { db } from "@/lib/drizzle/db";
import { sites, pages, blogPosts, blogCategories } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function getSitemapData(siteSlug: string) {
  // Fetch site
  const site = await db.query.sites.findFirst({
    where: and(eq(sites.slug, siteSlug), eq(sites.status, "published")),
  });

  if (!site) return null;

  // Fetch published pages
  const publishedPages = await db.query.pages.findMany({
    where: eq(pages.site_id, site.id),
    columns: { slug: true, updated_at: true, is_home: true },
  });

  // Fetch published blog posts
  const publishedPosts = await db.query.blogPosts.findMany({
    where: and(
      eq(blogPosts.site_id, site.id),
      eq(blogPosts.status, "published")
    ),
    columns: { slug: true, published_at: true, updated_at: true },
  });

  // Fetch categories that have published posts
  const categories = await db.query.blogCategories.findMany({
    where: eq(blogCategories.site_id, site.id),
    columns: { slug: true, updated_at: true },
  });

  return {
    site,
    pages: publishedPages,
    posts: publishedPosts,
    categories,
  };
}
```

### Key Changes Summary
- [x] **New route handler:** `sitemap.xml/route.ts` - Dynamic XML sitemap generation
- [x] **New route handler:** `robots.txt/route.ts` - Dynamic robots.txt generation
- [x] **New query function:** `lib/queries/sitemap.ts` - Efficient data fetching
- [x] **Uses existing:** `getPublicSiteUrl()` for custom domain support

---

## 11. Implementation Plan

### Phase 1: Query Function
**Goal:** Create efficient query to fetch all sitemap data

- [x] **Task 1.1:** Create `lib/queries/sitemap.ts` ✅ 2026-01-01
  - Files: `lib/queries/sitemap.ts`
  - Details: Query site, pages, posts, categories in one go
  - Note: Used `db.select().from()` pattern instead of `db.query` (db doesn't have schema passed)

### Phase 2: Sitemap Route Handler
**Goal:** Generate valid XML sitemap

- [x] **Task 2.1:** Create sitemap.xml route handler ✅ 2026-01-01
  - Files: `app/(sites)/sites/[siteSlug]/sitemap.xml/route.ts`
  - Details: Generate XML with all URLs, proper dates, custom domain support

### Phase 3: robots.txt Route Handler
**Goal:** Generate robots.txt pointing to sitemap

- [x] **Task 3.1:** Create robots.txt route handler ✅ 2026-01-01
  - Files: `app/(sites)/sites/[siteSlug]/robots.txt/route.ts`
  - Details: Allow all crawlers, include sitemap URL

### Phase 4: Testing & Validation
**Goal:** Verify both endpoints work correctly

- [x] **Task 4.1:** Test sitemap.xml endpoint ✅ 2026-01-01
  - Details: Verify XML structure, all URLs included, custom domain used
- [x] **Task 4.2:** Test robots.txt endpoint ✅ 2026-01-01
  - Details: Verify format, sitemap URL correct
- [x] **Task 4.3:** Run type-check ✅ 2026-01-01
  - Command: `npm run type-check`
  - Result: No errors

### Phase 5: Code Review
**Goal:** Comprehensive review of implementation

- [x] **Task 5.1:** Present "Implementation Complete!" message ✅ 2026-01-01
- [x] **Task 5.2:** Execute comprehensive code review ✅ 2026-01-01
  - Linting: 0 errors
  - Type checking: No errors
  - All requirements verified

---

## 12. Task Completion Tracking

| Phase | Task | Status | Date |
|-------|------|--------|------|
| 1 | Create sitemap query | ✅ Completed | 2026-01-01 |
| 2 | Create sitemap.xml route | ✅ Completed | 2026-01-01 |
| 3 | Create robots.txt route | ✅ Completed | 2026-01-01 |
| 4 | Testing & validation | ✅ Completed | 2026-01-01 |
| 5 | Code review | ✅ Completed | 2026-01-01 |

**Implementation Notes:**
- Used `db.select().from()` pattern instead of `db.query` (db instance doesn't have schema passed)
- Categories use `created_at` instead of `updated_at` (column doesn't exist in schema)
- `getPublicSiteUrl()` imported from `@/lib/url-utils`

---

## 13. File Structure & Organization

### New Files to Create
```
app/(sites)/sites/[siteSlug]/
├── sitemap.xml/
│   └── route.ts          # Dynamic sitemap generation
└── robots.txt/
    └── route.ts          # Dynamic robots.txt generation

lib/queries/
└── sitemap.ts            # Sitemap data fetching
```

### Files to Modify
None - all new files

### Dependencies to Add
None - uses existing Next.js APIs

---

## 14. Potential Issues & Security Review

### Edge Cases
- [x] **Site not published:** Return 404 ✅
- [x] **No blog enabled:** Skip blog URLs in sitemap ✅
- [x] **No custom domain:** Use `/sites/[slug]` format ✅

### Security Considerations
- [x] Only include published content (pages, posts) ✅
- [x] Don't expose draft or private content in sitemap ✅

---

## 15. Deployment & Configuration

No environment variables needed - uses existing configuration.

---

## 16. AI Agent Instructions

Follow standard task template workflow. This is a straightforward implementation.

---

## 17. Notes & Additional Context

### Sitemap XML Format
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ...
</urlset>
```

### Priority Guidelines
- Homepage: 1.0
- Main pages: 0.8
- Blog listing: 0.7
- Blog posts: 0.6
- Category pages: 0.5

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Identified
- None - new feature

### Performance Implications
- Minimal - queries are simple, responses cached for 1 hour

### Security Considerations
- Only published content exposed - no risk

---

*Task Document Created: 2026-01-01*
*Status: COMPLETED* ✅
*Completed: 2026-01-01*
