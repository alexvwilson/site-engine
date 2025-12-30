# AI Task Template

> **Instructions:** Fix broken navigation links when sites use custom domains

---

## 1. Task Overview

### Task Title
**Title:** Fix Broken Navigation Links on Custom Domain Sites

### Goal Statement
**Goal:** When a site has a verified custom domain (like MonkeyNutz.com), all internal navigation links currently break because they're hardcoded to use `/sites/[siteSlug]/` paths. We need to make links domain-aware so they work correctly on both custom domains and the default `/sites/[slug]` routes.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
When a site has a custom domain:
- Browser URL shows: `monkeynuts.com/blog/post-1`
- Middleware rewrites to: `/sites/my-site/blog/post-1` (internal)
- BUT links in components render as: `/sites/my-site/about`
- User clicks link → navigates to: `monkeynuts.com/sites/my-site/about` (404 BROKEN)

The middleware correctly rewrites incoming URLs, but components don't know they're on a custom domain and generate wrong outbound links.

### Solution Options Analysis

#### Option 1: Pass `basePath` Prop Through Component Tree
**Approach:** Detect custom domain in page components, compute `basePath` (empty string for custom domains, `/sites/[slug]` for default), and pass through all components.

**Pros:**
- ✅ Simple, explicit solution - easy to understand and debug
- ✅ No global state or context needed
- ✅ Components become pure functions of their props
- ✅ Works immediately without hydration concerns

**Cons:**
- ❌ Requires prop drilling through many components
- ❌ Every link-generating component needs updating
- ❌ Must update all parent components to pass the prop

**Implementation Complexity:** Medium - Many components need changes but logic is simple
**Risk Level:** Low - Well-understood pattern, easy to test

#### Option 2: Create URL Context Provider
**Approach:** Create a React Context that provides URL generation utilities based on custom domain detection.

**Pros:**
- ✅ Clean API - components just call `useUrl().page('/about')`
- ✅ No prop drilling - any component can access URL utilities
- ✅ Centralized logic for URL generation
- ✅ Easy to extend for future URL-related features

**Cons:**
- ❌ Requires context provider setup at layout level
- ❌ Server Components can't use React Context directly
- ❌ More complex architecture for a relatively simple need

**Implementation Complexity:** Medium - Context setup + hook creation
**Risk Level:** Medium - Server/Client boundary considerations

#### Option 3: Middleware Header Injection (Recommended)
**Approach:** Middleware sets a custom header (`x-base-path`) when rewriting custom domain requests. Server Components read this header to determine the base path for links.

**Pros:**
- ✅ Minimal component changes - just read header once per page
- ✅ Works perfectly with Server Components
- ✅ Leverages existing middleware infrastructure
- ✅ Clean separation - routing logic stays in middleware
- ✅ Zero client-side JavaScript overhead
- ✅ Can be combined with prop passing for clean architecture

**Cons:**
- ❌ Headers only available in Server Components (not Client Components)
- ❌ Need to pass basePath to Client Components via props

**Implementation Complexity:** Low - Small middleware change + prop updates
**Risk Level:** Low - Building on proven middleware pattern

### Recommendation & Rationale

**🎯 RECOMMENDED SOLUTION:** Option 3 - Middleware Header Injection + Prop Passing

**Why this is the best choice:**
1. **Leverages existing infrastructure** - Middleware already handles custom domain detection
2. **Server Component friendly** - Headers work perfectly with Next.js Server Components
3. **Minimal changes** - One middleware line + prop updates in page components
4. **Clean architecture** - Domain detection stays centralized in middleware
5. **Zero runtime cost** - No context providers or client-side detection needed

**Key Decision Factors:**
- **Performance Impact:** None - header read is negligible
- **User Experience:** Seamless - links work correctly immediately
- **Maintainability:** Simple - logic centralized in middleware
- **Scalability:** Excellent - pattern works for any number of components

**Alternative Consideration:**
Option 1 (pure prop drilling) is a close second and might be preferred if we want to avoid any middleware changes. However, middleware is the natural place for domain-aware routing logic.

### Decision Request

**👤 USER DECISION REQUIRED:**
Based on this analysis, do you want to proceed with the recommended solution (Option 3), or would you prefer a different approach?

**Questions for you to consider:**
- Does the recommended solution align with your priorities?
- Are there any constraints or preferences I should factor in?

**Next Steps:**
Once you approve the strategic direction, I'll proceed with implementation.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State
The middleware correctly detects custom domains and rewrites URLs internally:
- `monkeynuts.com/` → `/sites/my-site/` (rewritten, not redirected)
- `monkeynuts.com/about` → `/sites/my-site/about` (rewritten)

However, all link-generating components hardcode paths:
- `<Link href={`/sites/${siteSlug}/blog/${post.slug}`}>` → BROKEN on custom domains
- `<a href={link.url}>` (from NavLink in database) → BROKEN if stored as `/sites/...`

### Existing Codebase Analysis

**🔍 Analysis Checklist - Relevant Areas:**

- [x] **Middleware** (`middleware.ts`)
  - Already detects custom domains via `isCustomDomain()`
  - Already rewrites URLs to internal `/sites/[slug]` routes
  - Just need to add header for basePath communication

- [x] **Published Site Pages** (`app/(sites)/sites/[siteSlug]/`)
  - Server Components that render published sites
  - Can read headers and pass basePath to child components
  - Files: `page.tsx`, `[pageSlug]/page.tsx`, `blog/` routes

- [x] **Link-Generating Components** (`components/render/`)
  - HeaderBlock - uses `link.url` from NavLink (database stored)
  - FooterBlock - uses `link.url` from NavLink (database stored)
  - HeroBlock - uses `content.ctaUrl`
  - CTABlock - uses `content.buttonUrl`
  - PublicPostCard - hardcodes `/sites/${siteSlug}/blog/${post.slug}`
  - BlogGridBlock, BlogFeaturedBlock - similar blog links
  - PostNavigation - hardcodes `/sites/${siteSlug}/blog/${slug}`

---

## 4. Context & Problem Definition

### Problem Statement
When users add a custom domain to their site:
1. The domain correctly serves the site content (middleware working)
2. All internal navigation links are broken (clicking them results in 404)
3. Blog post links, header/footer navigation, CTA buttons all fail
4. Users cannot navigate their own published sites on custom domains

This completely breaks the custom domain feature for multi-page sites.

### Success Criteria
- [ ] Navigation links in headers/footers work on custom domains
- [ ] Blog post links work on custom domains
- [ ] CTA buttons and hero links work on custom domains
- [ ] Links still work correctly on default `/sites/[slug]` routes
- [ ] No visible change in URL bar when clicking links on custom domains
- [ ] Social sharing URLs use correct domain

---

## 5. Development Mode Context

### Development Mode Context
- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- Links on sites with custom domains should be root-relative (e.g., `/about`, `/blog/post-1`)
- Links on sites without custom domains should include `/sites/[slug]` prefix
- Stored NavLink URLs in database should be transformed at render time
- Social sharing and RSS feeds should use the correct public URL

### Non-Functional Requirements
- **Performance:** Zero client-side overhead for URL computation
- **Maintainability:** Centralized domain detection logic
- **Testing:** Easy to verify both custom domain and default routes

### Technical Constraints
- Must work with Server Components (primary rendering path)
- Cannot use React Context in Server Components
- Should leverage existing middleware infrastructure

---

## 7. Data & Database Changes

### Database Schema Changes
**No database changes required.** NavLink URLs will be transformed at render time, not stored differently.

---

## 8. Backend Changes & Background Jobs

### Changes Required

#### 1. Middleware Enhancement (`middleware.ts`)
Set a custom header when handling custom domain requests:
```typescript
// In custom domain handling block:
const response = NextResponse.rewrite(url);
response.headers.set('x-site-base-path', ''); // Empty for custom domains
return response;
```

#### 2. URL Utility Function (`lib/url-utils.ts`)
Create utility to generate correct URLs:
```typescript
export function getSiteUrl(basePath: string, path: string): string {
  // Normalize path to ensure leading slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

export function getBasePath(siteSlug: string, isCustomDomain: boolean): string {
  return isCustomDomain ? '' : `/sites/${siteSlug}`;
}
```

---

## 9. Frontend Changes

### Components to Update

All components that generate internal links need to accept a `basePath` prop:

| Component | Current Link Pattern | New Pattern |
|-----------|---------------------|-------------|
| HeaderBlock | `link.url` (direct) | `getSiteUrl(basePath, link.url)` |
| FooterBlock | `link.url` (direct) | `getSiteUrl(basePath, link.url)` |
| HeroBlock | `content.ctaUrl` | `getSiteUrl(basePath, content.ctaUrl)` |
| CTABlock | `content.buttonUrl` | `getSiteUrl(basePath, content.buttonUrl)` |
| PublicPostCard | `/sites/${siteSlug}/blog/${slug}` | `${basePath}/blog/${slug}` |
| BlogGridBlock | `/sites/${siteSlug}/blog/${slug}` | `${basePath}/blog/${slug}` |
| BlogFeaturedBlock | `/sites/${siteSlug}/blog/${slug}` | `${basePath}/blog/${slug}` |
| PostNavigation | `/sites/${siteSlug}/blog/${slug}` | `${basePath}/blog/${slug}` |
| BlogListingPage | `/sites/${siteSlug}/blog/rss.xml` | `${basePath}/blog/rss.xml` |
| CategoryListingPage | `/sites/${siteSlug}/blog` | `${basePath}/blog` |
| SocialShare | Full URL construction | Use site's public URL |

### Page Updates
Pages need to detect custom domain and compute basePath:

```typescript
// In page.tsx Server Components:
import { headers } from 'next/headers';

export default async function Page({ params }: PageProps) {
  const { siteSlug } = await params;
  const headersList = await headers();
  const isCustomDomain = headersList.has('x-site-base-path');
  const basePath = isCustomDomain ? '' : `/sites/${siteSlug}`;

  // Pass basePath to components...
}
```

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**middleware.ts:**
```typescript
if (siteSlug) {
  const url = request.nextUrl.clone();
  // ... path handling ...
  return NextResponse.rewrite(url);  // No header set
}
```

**PublicPostCard.tsx:**
```tsx
<Link href={`/sites/${siteSlug}/blog/${post.slug}`}>
```

**HeaderBlock.tsx:**
```tsx
<a href={link.url}>  {/* Uses URL directly from NavLink */}
```

### 📂 **After Refactor**

**middleware.ts:**
```typescript
if (siteSlug) {
  const url = request.nextUrl.clone();
  // ... path handling ...
  const response = NextResponse.rewrite(url);
  response.headers.set('x-site-base-path', '');  // Signal custom domain
  return response;
}
```

**PublicPostCard.tsx:**
```tsx
interface PublicPostCardProps {
  post: BlogPost;
  basePath: string;  // NEW: replaces siteSlug for URL generation
  // ...
}

<Link href={`${basePath}/blog/${post.slug}`}>
```

**HeaderBlock.tsx:**
```tsx
interface HeaderBlockProps {
  content: HeaderContent;
  theme: ThemeData;
  basePath: string;  // NEW
}

// Transform stored URLs to use basePath
const linkUrl = link.url.startsWith('/sites/')
  ? link.url.replace(/^\/sites\/[^/]+/, basePath)
  : `${basePath}${link.url.startsWith('/') ? link.url : `/${link.url}`}`;
<a href={linkUrl}>
```

### 🎯 **Key Changes Summary**
- [ ] **Middleware:** Add `x-site-base-path` header for custom domain requests
- [ ] **URL Utility:** Create `lib/url-utils.ts` with helper functions
- [ ] **Page Components:** Read header, compute basePath, pass to children
- [ ] **Render Components:** Replace `siteSlug` prop with `basePath`, update link generation
- [ ] **Files Modified:** ~15 files (1 middleware, 1 utility, ~6 pages, ~7 render components)

---

## 11. Implementation Plan

### Phase 1: Infrastructure Setup
**Goal:** Add middleware header and URL utility

- [ ] **Task 1.1:** Update middleware to set `x-site-base-path` header
  - Files: `middleware.ts`
  - Details: Set header value to empty string for custom domain requests

- [ ] **Task 1.2:** Create URL utility functions
  - Files: `lib/url-utils.ts` (new file)
  - Details: `getSiteUrl()`, `transformNavLinkUrl()` helpers

### Phase 2: Update Render Components
**Goal:** Make all render components basePath-aware

- [ ] **Task 2.1:** Update HeaderBlock
  - Files: `components/render/blocks/HeaderBlock.tsx`
  - Details: Add `basePath` prop, transform nav link URLs and CTA URL

- [ ] **Task 2.2:** Update FooterBlock
  - Files: `components/render/blocks/FooterBlock.tsx`
  - Details: Add `basePath` prop, transform footer link URLs

- [ ] **Task 2.3:** Update HeroBlock
  - Files: `components/render/blocks/HeroBlock.tsx`
  - Details: Add `basePath` prop, transform CTA URL

- [ ] **Task 2.4:** Update CTABlock
  - Files: `components/render/blocks/CTABlock.tsx`
  - Details: Add `basePath` prop, transform button URL

### Phase 3: Update Blog Components
**Goal:** Fix all blog-related links

- [ ] **Task 3.1:** Update PublicPostCard
  - Files: `components/render/blog/PublicPostCard.tsx`
  - Details: Replace `siteSlug` with `basePath`, update link pattern

- [ ] **Task 3.2:** Update BlogGridBlock
  - Files: `components/render/blocks/BlogGridBlock.tsx`
  - Details: Replace `siteSlug` with `basePath`

- [ ] **Task 3.3:** Update BlogFeaturedBlock
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Replace `siteSlug` with `basePath`

- [ ] **Task 3.4:** Update PostNavigation
  - Files: `components/render/blog/PostNavigation.tsx`
  - Details: Replace `siteSlug` with `basePath`

- [ ] **Task 3.5:** Update BlogListingPage
  - Files: `components/render/blog/BlogListingPage.tsx`
  - Details: Replace `siteSlug` with `basePath`

- [ ] **Task 3.6:** Update CategoryListingPage
  - Files: `components/render/blog/CategoryListingPage.tsx`
  - Details: Replace `siteSlug` with `basePath`

### Phase 4: Update Page Components
**Goal:** Pages detect custom domain and pass basePath

- [ ] **Task 4.1:** Update published site homepage
  - Files: `app/(sites)/sites/[siteSlug]/page.tsx`
  - Details: Read header, compute basePath, pass to all components

- [ ] **Task 4.2:** Update published site subpages
  - Files: `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx`
  - Details: Same pattern as homepage

- [ ] **Task 4.3:** Update blog listing page
  - Files: `app/(sites)/sites/[siteSlug]/blog/page.tsx`
  - Details: Read header, pass basePath

- [ ] **Task 4.4:** Update blog post page
  - Files: `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`
  - Details: Read header, pass basePath to components

- [ ] **Task 4.5:** Update blog category page
  - Files: `app/(sites)/sites/[siteSlug]/blog/category/[categorySlug]/page.tsx`
  - Details: Read header, pass basePath

### Phase 5: Update PageRenderer
**Goal:** Pass basePath through the renderer to all section blocks

- [ ] **Task 5.1:** Update PageRenderer interface
  - Files: `components/render/index.tsx` (or PageRenderer location)
  - Details: Add `basePath` prop, pass to all block renderers

### Phase 6: Update Social Sharing & RSS
**Goal:** Fix external URLs (social share, RSS feed)

- [ ] **Task 6.1:** Update SocialShare component
  - Files: `components/render/blog/SocialShare.tsx`
  - Details: Use site's public URL (custom domain or app URL)

- [ ] **Task 6.2:** Update RSS feed generation
  - Files: `app/(sites)/sites/[siteSlug]/blog/rss.xml/route.ts`, `lib/blog-utils.ts`
  - Details: Use site's custom domain if available

### Phase 7: Testing & Validation
**Goal:** Verify all links work correctly

- [ ] **Task 7.1:** Test on custom domain site
  - Details: Navigate all pages, click all links, verify URLs

- [ ] **Task 7.2:** Test on default `/sites/[slug]` route
  - Details: Ensure links still work without custom domain

- [ ] **Task 7.3:** Run linting and type checking
  - Command: `npm run lint && npm run type-check`

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

Updates will be added here as implementation progresses.

---

## 13. File Structure & Organization

### New Files to Create
```
lib/
└── url-utils.ts              # URL generation utilities
```

### Files to Modify
```
middleware.ts                                          # Add header for custom domains
components/render/blocks/
├── HeaderBlock.tsx                                    # Add basePath prop
├── FooterBlock.tsx                                    # Add basePath prop
├── HeroBlock.tsx                                      # Add basePath prop
├── CTABlock.tsx                                       # Add basePath prop
├── BlogGridBlock.tsx                                  # Replace siteSlug with basePath
└── BlogFeaturedBlock.tsx                              # Replace siteSlug with basePath
components/render/blog/
├── PublicPostCard.tsx                                 # Replace siteSlug with basePath
├── PostNavigation.tsx                                 # Replace siteSlug with basePath
├── BlogListingPage.tsx                                # Replace siteSlug with basePath
├── CategoryListingPage.tsx                            # Replace siteSlug with basePath
└── SocialShare.tsx                                    # Use correct public URL
components/render/
└── index.tsx (or PageRenderer.tsx)                    # Add basePath prop
app/(sites)/sites/[siteSlug]/
├── page.tsx                                           # Compute and pass basePath
├── [pageSlug]/page.tsx                                # Compute and pass basePath
├── blog/page.tsx                                      # Compute and pass basePath
├── blog/[postSlug]/page.tsx                           # Compute and pass basePath
├── blog/category/[categorySlug]/page.tsx              # Compute and pass basePath
└── blog/rss.xml/route.ts                              # Use custom domain in URLs
lib/
└── blog-utils.ts                                      # Update RSS URL generation
```

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Error Scenario 1:** NavLink URL stored with wrong format
  - **Code Review Focus:** URL transformation logic in HeaderBlock/FooterBlock
  - **Potential Fix:** Handle various URL formats (absolute, relative, with/without leading slash)

- [ ] **Error Scenario 2:** Custom domain header not present (caching, CDN)
  - **Code Review Focus:** basePath computation fallback
  - **Potential Fix:** Default to `/sites/[slug]` if header missing

### Edge Cases to Consider
- [ ] **Edge Case 1:** External URLs in navigation (https://...)
  - **Analysis Approach:** Check if URL is external before transforming
  - **Recommendation:** Skip transformation for URLs starting with http(s)://

- [ ] **Edge Case 2:** Anchor links (#section)
  - **Analysis Approach:** Verify anchor-only links preserved
  - **Recommendation:** Skip transformation for hash-only links

### Security & Access Control Review
- [ ] **No security changes required** - This is purely a URL routing fix

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with Phase 1 (infrastructure) to establish the pattern
2. Update render components in Phase 2-3, testing as you go
3. Update page components in Phase 4 to wire everything together
4. Phase 5-6 handle the PageRenderer and external URLs
5. Comprehensive testing in Phase 7

### Code Quality Standards
- Use TypeScript strict types for all new props
- Keep URL transformation logic centralized in `url-utils.ts`
- Preserve backwards compatibility - components should work if basePath not provided (default to current behavior)

---

## 17. Notes & Additional Context

### Research Summary
The root cause is that:
1. Middleware rewrites custom domain URLs to internal `/sites/[slug]` paths
2. Components don't know about the custom domain context
3. All generated links include `/sites/[slug]` prefix
4. Browser tries to access `customdomain.com/sites/slug/page` which doesn't exist

The fix makes components aware of the custom domain via a header, allowing them to generate correct root-relative URLs.

### Affected Components Quick Reference
- **Navigation:** HeaderBlock, FooterBlock
- **CTAs:** HeroBlock, CTABlock
- **Blog:** PublicPostCard, BlogGridBlock, BlogFeaturedBlock, PostNavigation, BlogListingPage, CategoryListingPage
- **External:** SocialShare, RSS feed

---

*Template Version: 1.0*
*Created: 2025-12-30*
