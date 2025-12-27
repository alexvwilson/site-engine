# AI Task Template

> **Instructions:** Fix header section defaults to use actual site name and page navigation

---

## 1. Task Overview

### Task Title
**Title:** Fix Header Section Defaults - Site Name and Navigation Links

### Goal Statement
**Goal:** When a header section is added to a page, it should automatically populate with the actual site name and navigation links to the site's pages, instead of using hardcoded placeholder values.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - this is a straightforward fix with a clear implementation path.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Framework:** Next.js 15, React 19, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Relevant Files:**
  - `app/actions/sections.ts` - `addSection` function
  - `lib/section-defaults.ts` - Default content for sections
  - `lib/queries/pages.ts` - Page queries
  - `lib/queries/sites.ts` - Site queries

### Current State

**Current Behavior:**
When a header section is added, it uses hardcoded defaults from `lib/section-defaults.ts`:
```typescript
header: {
  siteName: "Your Site",  // Hardcoded
  logoUrl: "",
  links: [
    { label: "Home", url: "/" },        // Hardcoded, wrong URL
    { label: "About", url: "/about" },   // Hardcoded, wrong URL
    { label: "Contact", url: "/contact" }, // Hardcoded, wrong URL
  ],
  ctaText: "Get Started",
  ctaUrl: "#",
},
```

**Problems:**
1. `siteName` shows "Your Site" instead of the actual site name
2. Navigation links are hardcoded placeholders, not the actual pages
3. Navigation link URLs are wrong format (should be `/sites/[slug]` or `/sites/[slug]/[pageSlug]`)

---

## 4. Context & Problem Definition

### Problem Statement
Users create a header section and expect it to show their site's name and link to their pages. Instead, they see generic placeholder content that doesn't work.

### Success Criteria
- [ ] Header siteName defaults to the actual site name
- [ ] Header navigation links default to the site's existing pages
- [ ] Navigation link URLs are correct (`/sites/[siteSlug]` for homepage, `/sites/[siteSlug]/[pageSlug]` for other pages)
- [ ] If no pages exist, navigation links are empty (not hardcoded placeholders)

---

## 5. Development Mode Context

- **Development mode:** Active development
- **Backwards compatibility:** Not required - can change behavior freely

---

## 6. Technical Requirements

### Functional Requirements
1. When adding a header section, fetch the site's name and use it as `siteName`
2. When adding a header section, fetch the site's pages and build navigation links
3. Navigation URLs should use the correct public URL format

### Non-Functional Requirements
- **Performance:** Single additional query when adding header sections (acceptable)

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - using existing schema.

---

## 8. Backend Changes

### Server Actions to Modify

**`app/actions/sections.ts` - `addSection` function:**

Current flow:
1. Verify page ownership
2. Get next position
3. Get default content from `getDefaultContent(blockType)`
4. Insert section

New flow for header blocks:
1. Verify page ownership (already returns siteId)
2. Get next position
3. **If blockType is "header":**
   - Fetch site name using siteId
   - Fetch site's pages
   - Build custom header content with site name and page links
4. **Else:** Get default content from `getDefaultContent(blockType)`
5. Insert section

### New Helper Function

Create a helper function to build header content with site context:

```typescript
async function getHeaderContentWithSiteData(
  siteId: string
): Promise<HeaderContent> {
  // Fetch site name
  const site = await getSiteById(siteId);

  // Fetch site's pages
  const sitePages = await getPagesBySite(siteId);

  // Build navigation links
  const links = sitePages.map(page => ({
    label: page.title,
    url: page.is_home
      ? `/sites/${site.slug}`
      : `/sites/${site.slug}/${page.slug}`,
  }));

  return {
    siteName: site.name,
    logoUrl: "",
    links,
    ctaText: "",
    ctaUrl: "",
  };
}
```

---

## 9. Frontend Changes

### Components
**No component changes needed** - the HeaderBlock renderer already correctly displays whatever content is passed to it.

---

## 10. Code Changes Overview

### Current Implementation (Before)

```typescript
// app/actions/sections.ts - addSection function (lines 62-108)
export async function addSection(
  pageId: string,
  blockType: BlockType,
  position?: number
): Promise<CreateSectionResult> {
  const userId = await requireUserId();

  const ownership = await verifyPageOwnership(pageId, userId);
  if (!ownership.valid) {
    return { success: false, error: "Page not found" };
  }

  const targetPosition = position ?? (await getNextPosition(pageId));

  // ... position shifting logic ...

  const defaultContent = getDefaultContent(blockType);  // <-- Always uses static defaults

  const [section] = await db
    .insert(sections)
    .values({
      page_id: pageId,
      user_id: userId,
      block_type: blockType,
      content: defaultContent,
      position: targetPosition,
    })
    .returning({ id: sections.id });

  // ... revalidation ...
}
```

### After Refactor

```typescript
// app/actions/sections.ts - addSection function
export async function addSection(
  pageId: string,
  blockType: BlockType,
  position?: number
): Promise<CreateSectionResult> {
  const userId = await requireUserId();

  const ownership = await verifyPageOwnership(pageId, userId);
  if (!ownership.valid || !ownership.siteId) {
    return { success: false, error: "Page not found" };
  }

  const targetPosition = position ?? (await getNextPosition(pageId));

  // ... position shifting logic ...

  // For header blocks, populate with actual site data
  let content: SectionContent;
  if (blockType === "header") {
    content = await getHeaderContentWithSiteData(ownership.siteId);
  } else {
    content = getDefaultContent(blockType);
  }

  const [section] = await db
    .insert(sections)
    .values({
      page_id: pageId,
      user_id: userId,
      block_type: blockType,
      content,
      position: targetPosition,
    })
    .returning({ id: sections.id });

  // ... revalidation ...
}
```

### Key Changes Summary
- [ ] **Change 1:** Add helper function `getHeaderContentWithSiteData()` to fetch site name and pages
- [ ] **Change 2:** Modify `addSection()` to use custom content for header blocks
- [ ] **Files Modified:** `app/actions/sections.ts`

---

## 11. Implementation Plan

### Phase 1: Update addSection to Use Site Data for Headers
**Goal:** Populate header sections with actual site name and page navigation

- [x] **Task 1.1:** Add imports for site and page queries ✓ 2025-12-27
  - Files: `app/actions/sections.ts`
  - Details: Imported `getSiteById` from sites queries, `getPagesBySite` from pages queries, and `HeaderContent` type

- [x] **Task 1.2:** Create `getHeaderContentWithSiteData` helper function ✓ 2025-12-27
  - Files: `app/actions/sections.ts` (lines 61-89)
  - Details: Function fetches site name and pages, builds HeaderContent with correct URLs (`/sites/[siteSlug]` and `/sites/[siteSlug]/[pageSlug]`)

- [x] **Task 1.3:** Modify `addSection` to use helper for header blocks ✓ 2025-12-27
  - Files: `app/actions/sections.ts` (lines 122-126)
  - Details: Added conditional logic - if blockType is "header", calls helper; otherwise uses default content

### Phase 2: Verification
**Goal:** Verify the fix works correctly

- [x] **Task 2.1:** Run type-check ✓ 2025-12-27
  - Command: `npm run type-check` - Passed with no errors
- [x] **Task 2.2:** Run lint ✓ 2025-12-27
  - Command: `npm run lint` - Passed with no errors
- [ ] **Task 2.3:** User Testing
  - Details: Create a site with pages, add a header section, verify it shows correct name and links

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

**Date:** 2025-12-27

### Completion Log
(To be filled in as tasks are completed)

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `app/actions/sections.ts` - Add header content helper and modify addSection

### Dependencies
- Uses existing `lib/queries/sites.ts` - `getSiteById`
- Uses existing `lib/queries/pages.ts` - `getPagesBySite`

---

## 14. Potential Issues & Security Review

### Edge Cases
- **No pages exist:** Navigation links should be empty array (not hardcoded placeholders)
- **Site has no slug yet:** Should still work, using whatever slug exists

### Error Scenarios
- **Site query fails:** Should fall back to default content
- **Pages query fails:** Should use site name but empty navigation

---

## 15. Deployment & Configuration

No deployment changes required.

---

## 16. AI Agent Instructions

### Workflow
1. Read current `app/actions/sections.ts`
2. Add imports for site and page queries
3. Create helper function for header content
4. Modify addSection to use helper for headers
5. Run type-check and lint
6. Request user testing

### Important Notes
- The HeaderBlock renderer already works correctly - only the section creation needs fixing
- Navigation URLs must use `/sites/[siteSlug]` format for published sites

---

## 17. Notes & Additional Context

### Reference Files
- `lib/queries/sites.ts` - `getSiteById(siteId, userId)` returns site with name and slug
- `lib/queries/pages.ts` - `getPagesBySite(siteId)` returns all pages for a site
- `lib/section-types.ts` - `HeaderContent` interface definition

---

*Task Created: 2025-12-27*
*Priority: Bug fix - user-facing issue*
