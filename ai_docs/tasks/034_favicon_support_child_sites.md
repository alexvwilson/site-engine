# Task 034: Favicon Support for Child Sites

> **AI Task Document** - Add favicon and Apple Touch Icon support for published child sites.

---

## 1. Task Overview

### Task Title
**Title:** Favicon & Apple Touch Icon Support for Child Sites

### Goal Statement
**Goal:** Allow site owners to upload a custom favicon that displays in browser tabs and as the Apple Touch Icon when users bookmark the site on iOS devices. This enables proper branding for published sites (e.g., monkeynutz.com shows their icon, not Site Engine's).

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis Not Required
This is a straightforward feature with a single obvious implementation approach:
- Add database column for favicon URL
- Add upload UI in Settings (reuse existing ImageUpload component)
- Update generateMetadata in published site pages

No alternative approaches warrant consideration.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15 (App Router) with React 19
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **File Storage:** Supabase Storage (existing pattern for images)

### Current State
- Published sites use `generateMetadata()` for SEO (title, description, OpenGraph)
- No favicon field exists in the `sites` table
- No favicon is set in published site metadata - browser shows default/nothing
- ImageUpload component exists and works well for logo, gallery, etc.
- Site Settings tab has existing patterns for image uploads (header logo)

### Existing Codebase Analysis

**Relevant Files:**
- `lib/drizzle/schema/sites.ts` - Sites table schema (needs favicon_url column)
- `app/(sites)/sites/[siteSlug]/page.tsx` - Published homepage with generateMetadata
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Published subpages with generateMetadata
- `app/(sites)/sites/[siteSlug]/blog/page.tsx` - Blog index page
- `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx` - Blog post pages
- `app/(sites)/sites/[siteSlug]/blog/category/[categorySlug]/page.tsx` - Blog category pages
- `components/sites/SettingsTab.tsx` - Site settings UI
- `app/actions/sites.ts` - Site update server action
- `components/editor/ImageUpload.tsx` - Reusable image upload component

---

## 4. Context & Problem Definition

### Problem Statement
Published child sites (like monkeynutz.com) cannot display custom favicons. When users visit the site:
- Browser tab shows no icon or generic browser default
- iOS bookmark shows no app icon
- Site lacks professional branding polish

Site owners expect their brand's favicon to appear, especially on custom domains.

### Success Criteria
- [ ] Site owners can upload a favicon image in Settings
- [ ] Published sites display the favicon in browser tabs
- [ ] iOS devices show the favicon as Apple Touch Icon when bookmarked
- [ ] Favicon persists across all pages (homepage, subpages, blog)
- [ ] Settings UI includes helpful instructions for creating favicons

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns** - new column, no existing data
- **Simple migration** - nullable column addition

---

## 6. Technical Requirements

### Functional Requirements
- User can upload a favicon image (PNG, ICO, or SVG) in Site Settings
- User can remove/replace an existing favicon
- Published sites include favicon in HTML metadata
- Favicon appears as both browser favicon and Apple Touch Icon
- Settings include link to realfavicongenerator.net for creating favicons

### Non-Functional Requirements
- **Performance:** Favicon served from Supabase CDN (fast)
- **Usability:** Clear upload UI with instructions
- **Compatibility:** Works in all modern browsers, iOS Safari

### Technical Constraints
- Must use existing ImageUpload component pattern
- Must use existing Supabase Storage bucket
- Single image serves both favicon and Apple Touch Icon (Next.js handles sizing)

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- Add favicon_url column to sites table
ALTER TABLE sites ADD COLUMN favicon_url TEXT;
```

### Data Model Updates

```typescript
// lib/drizzle/schema/sites.ts - Add to sites table definition
favicon_url: text("favicon_url"),
```

### Down Migration

```sql
-- down.sql
ALTER TABLE sites DROP COLUMN IF EXISTS favicon_url;
```

---

## 8. Backend Changes

### Server Actions

**Modify:** `app/actions/sites.ts` - `updateSiteSettings()`
- Add `faviconUrl` to the settings update interface
- Handle favicon URL in the update query

---

## 9. Frontend Changes

### Component Modifications

**Modify:** `components/sites/SettingsTab.tsx`
- Add "Favicon" card in Appearance section
- Use ImageUpload component for favicon upload
- Include helper text with link to realfavicongenerator.net
- Track favicon state and include in hasChanges detection

### Page Modifications

**Modify:** All published site pages to include favicon in generateMetadata:
- `app/(sites)/sites/[siteSlug]/page.tsx`
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx`
- `app/(sites)/sites/[siteSlug]/blog/page.tsx`
- `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx`
- `app/(sites)/sites/[siteSlug]/blog/category/[categorySlug]/page.tsx`

---

## 10. Code Changes Overview

### Current Implementation (Before)

```typescript
// app/(sites)/sites/[siteSlug]/page.tsx - generateMetadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);

  if (!site) {
    return { title: "Not Found" };
  }

  const page = await getPublishedHomePage(site.id);
  const title = page?.meta_title || site.meta_title || site.name;
  const description =
    page?.meta_description || site.meta_description || site.description || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}
```

### After Implementation

```typescript
// app/(sites)/sites/[siteSlug]/page.tsx - generateMetadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await getPublishedSiteBySlug(siteSlug);

  if (!site) {
    return { title: "Not Found" };
  }

  const page = await getPublishedHomePage(site.id);
  const title = page?.meta_title || site.meta_title || site.name;
  const description =
    page?.meta_description || site.meta_description || site.description || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    // Favicon and Apple Touch Icon
    icons: site.favicon_url
      ? {
          icon: site.favicon_url,
          apple: site.favicon_url,
        }
      : undefined,
  };
}
```

### Settings Tab Addition

```typescript
// components/sites/SettingsTab.tsx - New Favicon Card (in Appearance section)
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Image className="h-5 w-5" />
      Favicon
    </CardTitle>
    <CardDescription>
      The icon shown in browser tabs and when users bookmark your site
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <ImageUpload
      value={faviconUrl}
      onChange={setFaviconUrl}
      disabled={loading}
      siteId={site.id}
    />
    <p className="text-sm text-muted-foreground">
      Upload a square PNG or ICO file (recommended: 512x512px).{" "}
      <a
        href="https://realfavicongenerator.net"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        Create a favicon from your logo
      </a>
    </p>
  </CardContent>
</Card>
```

### Key Changes Summary
- [ ] **Database:** Add `favicon_url` column to sites table
- [ ] **Settings UI:** Add Favicon upload card with ImageUpload component
- [ ] **Server Action:** Handle faviconUrl in updateSiteSettings
- [ ] **Published Pages:** Add `icons` property to all generateMetadata functions
- [ ] **Files Modified:** 8 files total

---

## 11. Implementation Plan

### Phase 1: Database Changes
**Goal:** Add favicon_url column to sites table

- [ ] **Task 1.1:** Update sites schema
  - Files: `lib/drizzle/schema/sites.ts`
  - Details: Add `favicon_url: text("favicon_url")` column
- [ ] **Task 1.2:** Generate migration
  - Command: `npm run db:generate`
- [ ] **Task 1.3:** Create down migration
  - Files: `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Task 1.4:** Apply migration
  - Command: `npm run db:migrate`

### Phase 2: Backend Changes
**Goal:** Update server action to handle favicon

- [ ] **Task 2.1:** Update updateSiteSettings action
  - Files: `app/actions/sites.ts`
  - Details: Add faviconUrl to interface and update query

### Phase 3: Frontend - Settings UI
**Goal:** Add favicon upload to Settings tab

- [ ] **Task 3.1:** Add favicon state and UI
  - Files: `components/sites/SettingsTab.tsx`
  - Details: Add state, hasChanges logic, and Favicon card with ImageUpload

### Phase 4: Frontend - Published Site Metadata
**Goal:** Include favicon in all published page metadata

- [ ] **Task 4.1:** Update homepage metadata
  - Files: `app/(sites)/sites/[siteSlug]/page.tsx`
- [ ] **Task 4.2:** Update subpage metadata
  - Files: `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx`
- [ ] **Task 4.3:** Update blog pages metadata
  - Files: `app/(sites)/sites/[siteSlug]/blog/page.tsx`, `blog/[postSlug]/page.tsx`, `blog/category/[categorySlug]/page.tsx`

### Phase 5: Testing & Validation
**Goal:** Verify favicon appears correctly

- [ ] **Task 5.1:** Type checking
  - Command: `npm run type-check`
- [ ] **Task 5.2:** Linting
  - Command: `npm run lint`

---

## 12. Task Completion Tracking

Will be updated as tasks complete.

---

## 13. File Structure & Organization

### Files to Modify
```
lib/drizzle/schema/sites.ts          # Add favicon_url column
app/actions/sites.ts                  # Handle faviconUrl in update
components/sites/SettingsTab.tsx      # Add Favicon card
app/(sites)/sites/[siteSlug]/page.tsx                           # Add icons to metadata
app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx                # Add icons to metadata
app/(sites)/sites/[siteSlug]/blog/page.tsx                      # Add icons to metadata
app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx           # Add icons to metadata
app/(sites)/sites/[siteSlug]/blog/category/[categorySlug]/page.tsx # Add icons to metadata
```

### New Files
```
drizzle/migrations/[timestamp]_*/     # Generated migration
drizzle/migrations/[timestamp]_*/down.sql  # Rollback migration
```

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Invalid image format:** ImageUpload already validates file types
- [ ] **Large file size:** ImageUpload already has size limits

### Security Considerations
- [ ] **File validation:** Uses existing ImageUpload which validates mime types
- [ ] **Storage access:** Uses existing Supabase Storage with RLS policies

---

## 15. Deployment & Configuration

No new environment variables required. Uses existing Supabase Storage configuration.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow phases in order
2. Create down migration before applying migration
3. Reuse existing ImageUpload component pattern
4. Update all 5 published page files with same icons pattern

### Code Quality Standards
- Use existing component patterns
- Keep Favicon card simple and focused
- Include helpful link to realfavicongenerator.net

---

## 17. Notes & Additional Context

### Reference: Logo Generation Workflow
From `.claude/commands/04_chatgpt_logo_generation.md`:
- Users create logos via ChatGPT
- Use realfavicongenerator.net to generate `favicon.ico` and `apple-icon.png`
- Site Engine will accept the output from this workflow

### Next.js Metadata Icons
Next.js `generateMetadata` supports:
```typescript
icons: {
  icon: '/favicon.ico',           // Browser tab
  apple: '/apple-icon.png',       // iOS bookmark
  shortcut: '/shortcut-icon.png', // Legacy
}
```

We'll use the same URL for both `icon` and `apple` since modern browsers handle sizing.

---

**Task Created:** 2025-12-30
**Complexity:** Low
**Estimated Files:** 8
