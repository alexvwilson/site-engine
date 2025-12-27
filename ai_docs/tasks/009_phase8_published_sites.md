# Phase 8: Published Sites

> **Task Number:** 009
> **Phase:** 8
> **Created:** 2025-12-26

---

## 1. Task Overview

### Task Title
**Title:** Implement Public Site Rendering with Draft/Published Section Control

### Goal Statement
**Goal:** Enable users to publish their sites and have them accessible via subdirectory-based public URLs (`/sites/[siteSlug]`). Visitors can view published sites with published pages and sections, while draft content remains hidden. This phase also implements the Settings tab with custom domain preparation, slug editing, and site-level SEO configuration.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
This is a straightforward implementation phase following established patterns from the codebase. The primary decisions have been made:
- Subdirectory routing (`/sites/[siteSlug]`) rather than custom domain routing
- Default fallback theme for sites without active themes
- Section-level draft/published control
- Full Settings tab implementation

**Strategic analysis not required** - the approach is defined by the roadmap and user clarifications.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Authentication:** Supabase Auth managed by `middleware.ts`

### Current State

**Existing Infrastructure:**
- Sites table exists with `status` (draft/published), `slug`, but NO `custom_domain` column
- Pages table has `status` (draft/published), `is_home`, `meta_title`, `meta_description`
- Sections table has NO `status` column (all sections are implicitly published)
- PageRenderer and BlockRenderer components exist for rendering pages with themes
- Theme system is complete with active theme per site
- No public site routes exist (`app/(public)/sites/` directory doesn't exist)
- Settings tab is a placeholder component

**What Needs to Be Built:**
1. Database schema updates (custom_domain on sites, status on sections, SEO fields on sites)
2. Public site routes with proper authentication bypass
3. Query functions for published content
4. Default fallback theme
5. Full Settings tab implementation
6. SEO metadata generation

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- `lib/drizzle/schema/sites.ts` - Sites schema (needs custom_domain, SEO fields)
- `lib/drizzle/schema/sections.ts` - Sections schema (needs status column)
- `lib/queries/sites.ts` - Site queries (needs getPublishedSite)
- `lib/queries/pages.ts` - Page queries (needs public query variants)
- `lib/queries/sections.ts` - Section queries (needs published filter)
- `lib/queries/themes.ts` - Theme queries (getActiveTheme exists)
- `middleware.ts` - Routes to Supabase middleware
- `lib/supabase/middleware.ts` - Auth handling with public routes list
- `components/render/PageRenderer.tsx` - Page rendering with theme
- `components/sites/SettingsTabPlaceholder.tsx` - Placeholder to replace

---

## 4. Context & Problem Definition

### Problem Statement
Currently, users can create and edit sites, pages, and sections, but there's no way for visitors to view published content. The application needs public-facing routes that:
1. Display published sites at `/sites/[siteSlug]`
2. Display published pages at `/sites/[siteSlug]/[pageSlug]`
3. Respect draft/published status at site, page, AND section levels
4. Apply active theme (with fallback if none exists)
5. Include proper SEO metadata

Additionally, users need a proper Settings tab to configure their site's domain (for future use), URL slug, and SEO defaults.

### Success Criteria
- [ ] Published sites are accessible at `/sites/[siteSlug]` without authentication
- [ ] Homepage renders when visiting `/sites/[siteSlug]`
- [ ] Individual pages render at `/sites/[siteSlug]/[pageSlug]`
- [ ] Unpublished sites return 404
- [ ] Published sites with unpublished pages return 404 for those pages
- [ ] Draft sections within published pages are hidden from public view
- [ ] Active theme is applied; fallback theme used if none exists
- [ ] SEO metadata (title, description, OG tags) renders correctly
- [ ] Settings tab allows editing: custom domain (display only), slug, site SEO
- [ ] All section editors support toggling draft/published status

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Data loss acceptable** - existing data can be wiped/migrated aggressively
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- User can visit `/sites/[siteSlug]` and see the published homepage
- User can visit `/sites/[siteSlug]/[pageSlug]` and see a specific published page
- Unpublished content (sites, pages, sections) is not visible to public
- Site owner can toggle section status between draft/published in the editor
- Site owner can configure custom domain (stored for future use), slug, and SEO in Settings
- Pages display with active theme or fallback theme

### Non-Functional Requirements
- **Performance:** Public pages should be statically optimizable (SSG-compatible)
- **SEO:** Proper meta tags, Open Graph tags, semantic HTML
- **Responsive Design:** Public pages work on all device sizes (320px+)
- **Theme Support:** Pages render with theme or fallback gracefully

### Technical Constraints
- Must use existing PageRenderer/BlockRenderer for consistency
- Must integrate with existing Supabase auth middleware
- No custom domain routing in middleware (subdirectory only for now)

---

## 7. Data & Database Changes

### Database Schema Changes

#### 1. Add `custom_domain` and SEO fields to sites table

```sql
-- Add custom_domain column (nullable, for future use)
ALTER TABLE sites ADD COLUMN custom_domain TEXT UNIQUE;

-- Add site-level SEO fields
ALTER TABLE sites ADD COLUMN meta_title TEXT;
ALTER TABLE sites ADD COLUMN meta_description TEXT;
```

#### 2. Add `status` column to sections table

```sql
-- Add status column with default 'published' for existing sections
ALTER TABLE sections ADD COLUMN status TEXT NOT NULL DEFAULT 'published';

-- Add index for filtering by status
CREATE INDEX sections_status_idx ON sections (status);
```

### Data Model Updates

**`lib/drizzle/schema/sites.ts`:**
```typescript
// Add to sites table definition:
custom_domain: text("custom_domain").unique(),
meta_title: text("meta_title"),
meta_description: text("meta_description"),
```

**`lib/drizzle/schema/sections.ts`:**
```typescript
// Add status enum and column:
export const SECTION_STATUSES = ["draft", "published"] as const;
export type SectionStatus = (typeof SECTION_STATUSES)[number];

// In table definition:
status: text("status", { enum: SECTION_STATUSES }).notNull().default("published"),

// Add index:
index("sections_status_idx").on(t.status),
```

### Data Migration Plan
- [ ] Generate migration with `npm run db:generate`
- [ ] Create down migration file
- [ ] Apply migration with `npm run db:migrate`
- [ ] Existing sections will have status='published' by default

### Down Migration Safety Protocol
- [ ] **Step 1:** Generate migration
- [ ] **Step 2:** Create down migration following template
- [ ] **Step 3:** Create subdirectory for down.sql
- [ ] **Step 4:** Verify safety with IF EXISTS clauses
- [ ] **Step 5:** Apply migration

---

## 8. Backend Changes

### Data Access Patterns

#### Server Actions (`app/actions/sites.ts`) - Updates
- [ ] `updateSiteSettings(siteId, { customDomain?, slug?, metaTitle?, metaDescription? })` - Update site settings

#### Server Actions (`app/actions/sections.ts`) - Updates
- [ ] `updateSectionStatus(sectionId, status: 'draft' | 'published')` - Toggle section status

#### Query Functions (`lib/queries/`) - New Functions

**`lib/queries/sites.ts`:**
- [ ] `getPublishedSiteBySlug(slug)` - Get published site by slug (no auth check, status='published')

**`lib/queries/pages.ts`:**
- [ ] `getPublishedHomePage(siteId)` - Get published homepage (status='published', is_home=true)
- [ ] `getPublishedPageBySlug(siteId, pageSlug)` - Get published page by slug

**`lib/queries/sections.ts`:**
- [ ] `getPublishedSectionsByPage(pageId)` - Get only published sections (status='published')

### Default Theme

**`lib/default-theme.ts`:**
```typescript
// Fallback theme when site has no active theme
export const DEFAULT_THEME: ThemeData = {
  colors: {
    primary: "#2563eb",      // Blue
    secondary: "#64748b",    // Slate
    accent: "#f59e0b",       // Amber
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
  },
  typography: {
    headingFont: "Inter",
    bodyFont: "Inter",
    baseSize: 16,
    scaleRatio: 1.25,
    lineHeight: 1.6,
    headingWeight: 700,
    bodyWeight: 400,
  },
  components: {
    borderRadius: "0.5rem",
    buttonStyle: "solid",
    cardShadow: "sm",
    inputStyle: "outline",
  },
};
```

---

## 9. Frontend Changes

### New Components

**`app/(public)/sites/[siteSlug]/page.tsx`:**
- Server Component fetching published site and homepage
- Renders homepage with PageRenderer
- Returns 404 if site not published or no published homepage

**`app/(public)/sites/[siteSlug]/[pageSlug]/page.tsx`:**
- Server Component fetching published site and specific page
- Renders page with PageRenderer
- Returns 404 if site/page not published

**`app/(public)/sites/[siteSlug]/layout.tsx`:**
- Wraps public site pages
- Injects theme styles (fonts, base styles)

**`app/(public)/sites/[siteSlug]/not-found.tsx`:**
- Custom 404 for published sites

**`components/sites/SettingsTab.tsx`:**
- Replace SettingsTabPlaceholder
- Custom domain input (display/store for future)
- Slug editing with validation
- Site-level SEO (meta_title, meta_description)
- Save button with loading state

**`components/editor/SectionStatusToggle.tsx`:**
- Toggle button for section draft/published status
- Shows current status badge
- Appears in SectionCard header

### Page Updates
- [ ] Update `components/editor/SectionCard.tsx` - Add status toggle and badge
- [ ] Update `components/sites/SiteTabs.tsx` - Use real SettingsTab instead of placeholder
- [ ] Update `lib/supabase/middleware.ts` - Add `/sites` to public routes

### State Management
- Section status changes use server action with revalidation
- Settings form uses local state with server action on save

---

## 10. Code Changes Overview

### Current Implementation (Before)

**`lib/drizzle/schema/sites.ts`:**
```typescript
export const sites = pgTable("sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  status: text("status", { enum: SITE_STATUSES }).notNull().default("draft"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  published_at: timestamp("published_at", { withTimezone: true }),
  // Missing: custom_domain, meta_title, meta_description
}, ...);
```

**`lib/drizzle/schema/sections.ts`:**
```typescript
export const sections = pgTable("sections", {
  // ... existing fields
  // Missing: status column
}, ...);
```

**`lib/supabase/middleware.ts`:**
```typescript
const publicRoutes = ["/", "/cookies", "/privacy", "/terms"];
const publicPatterns = ["/auth"];
// Missing: /sites pattern
```

### After Implementation

**`lib/drizzle/schema/sites.ts`:**
```typescript
export const sites = pgTable("sites", {
  // ... existing fields ...
  custom_domain: text("custom_domain").unique(),
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
}, ...);
```

**`lib/drizzle/schema/sections.ts`:**
```typescript
export const SECTION_STATUSES = ["draft", "published"] as const;
export type SectionStatus = (typeof SECTION_STATUSES)[number];

export const sections = pgTable("sections", {
  // ... existing fields ...
  status: text("status", { enum: SECTION_STATUSES }).notNull().default("published"),
}, (t) => [
  // ... existing indexes ...
  index("sections_status_idx").on(t.status),
]);
```

**`lib/supabase/middleware.ts`:**
```typescript
const publicRoutes = ["/", "/cookies", "/privacy", "/terms"];
const publicPatterns = ["/auth", "/sites"];  // Added /sites
```

### Key Changes Summary
- [ ] **Schema Updates:** Add 3 columns to sites, 1 column to sections
- [ ] **New Query Functions:** 4 new public query functions
- [ ] **New Routes:** 3 new public routes (page, layout, not-found)
- [ ] **New Components:** SettingsTab, SectionStatusToggle
- [ ] **Updated Components:** SectionCard, SiteTabs, middleware
- [ ] **New Utility:** Default theme constant

---

## 11. Implementation Plan

### Phase 1: Database Schema Updates
**Goal:** Add required columns to sites and sections tables

- [ ] **Task 1.1:** Update `lib/drizzle/schema/sites.ts`
  - Add custom_domain, meta_title, meta_description columns
  - Add unique constraint on custom_domain
- [ ] **Task 1.2:** Update `lib/drizzle/schema/sections.ts`
  - Add SECTION_STATUSES constant and SectionStatus type
  - Add status column with default 'published'
  - Add index on status column
- [ ] **Task 1.3:** Generate migration
  - Run `npm run db:generate`
- [ ] **Task 1.4:** Create down migration
  - Create `drizzle/migrations/[timestamp]/down.sql`
  - Include DROP COLUMN statements with IF EXISTS
- [ ] **Task 1.5:** Apply migration
  - Run `npm run db:migrate`

### Phase 2: Query Functions for Public Content
**Goal:** Add query functions that fetch only published content

- [ ] **Task 2.1:** Update `lib/queries/sites.ts`
  - Add `getPublishedSiteBySlug(slug)` function
- [ ] **Task 2.2:** Update `lib/queries/pages.ts`
  - Add `getPublishedHomePage(siteId)` function
  - Add `getPublishedPageBySlug(siteId, pageSlug)` function
- [ ] **Task 2.3:** Update `lib/queries/sections.ts`
  - Add `getPublishedSectionsByPage(pageId)` function
- [ ] **Task 2.4:** Create `lib/default-theme.ts`
  - Export DEFAULT_THEME constant with fallback theme data

### Phase 3: Public Site Routes
**Goal:** Create public-facing routes for published sites

- [ ] **Task 3.1:** Update middleware for public routes
  - Add `/sites` to publicPatterns in `lib/supabase/middleware.ts`
- [ ] **Task 3.2:** Create `app/(public)/sites/[siteSlug]/layout.tsx`
  - Basic layout wrapper for public sites
  - Include Google Fonts link for theme fonts
- [ ] **Task 3.3:** Create `app/(public)/sites/[siteSlug]/page.tsx`
  - Fetch published site by slug
  - Fetch published homepage
  - Fetch published sections
  - Get active theme or use default
  - Render with PageRenderer
  - Return notFound() if unpublished
- [ ] **Task 3.4:** Create `app/(public)/sites/[siteSlug]/[pageSlug]/page.tsx`
  - Fetch published site and page by slugs
  - Fetch published sections
  - Get active theme or use default
  - Render with PageRenderer
  - Return notFound() if unpublished
- [ ] **Task 3.5:** Create `app/(public)/sites/[siteSlug]/not-found.tsx`
  - Custom 404 page for published sites
- [ ] **Task 3.6:** Add SEO metadata generation
  - Add `generateMetadata` to page.tsx files
  - Use page meta_title/meta_description or fallback to site values

### Phase 4: Section Status Toggle in Editor
**Goal:** Allow users to toggle section draft/published status

- [ ] **Task 4.1:** Add `updateSectionStatus` server action
  - Update `app/actions/sections.ts`
- [ ] **Task 4.2:** Create `components/editor/SectionStatusToggle.tsx`
  - Toggle button with status badge
  - Calls updateSectionStatus action
- [ ] **Task 4.3:** Update `components/editor/SectionCard.tsx`
  - Add SectionStatusToggle to card header
  - Show draft indicator when status='draft'

### Phase 5: Settings Tab Implementation
**Goal:** Replace placeholder with full settings functionality

- [ ] **Task 5.1:** Add `updateSiteSettings` server action
  - Update `app/actions/sites.ts`
  - Handle customDomain, slug, metaTitle, metaDescription
- [ ] **Task 5.2:** Create `components/sites/SettingsTab.tsx`
  - Form with all settings fields
  - Slug editing with uniqueness validation
  - Custom domain input (stored for future use)
  - Site-level SEO fields
  - Save button with loading/success states
- [ ] **Task 5.3:** Update `components/sites/SiteTabs.tsx`
  - Import and use SettingsTab instead of placeholder
  - Pass site data to SettingsTab
- [ ] **Task 5.4:** Delete `components/sites/SettingsTabPlaceholder.tsx`
  - Remove placeholder component

### Phase 6: Testing & Validation
**Goal:** Verify all functionality works correctly

- [ ] **Task 6.1:** Test public site access
  - Verify published site renders at /sites/[slug]
  - Verify unpublished site returns 404
  - Verify published page renders correctly
  - Verify unpublished page returns 404
- [ ] **Task 6.2:** Test section status
  - Verify draft sections hidden on public view
  - Verify status toggle works in editor
- [ ] **Task 6.3:** Test settings tab
  - Verify all fields save correctly
  - Verify slug uniqueness validation
- [ ] **Task 6.4:** Test SEO metadata
  - Verify meta tags render correctly
  - Verify Open Graph tags present
- [ ] **Task 6.5:** Test fallback theme
  - Verify sites without active theme use default

---

## 12. Task Completion Tracking

Tasks will be marked as completed with timestamps as implementation proceeds.

---

## 13. File Structure & Organization

### New Files to Create
```
app/(public)/sites/[siteSlug]/
├── layout.tsx                    # Public site layout
├── page.tsx                      # Homepage route
├── not-found.tsx                 # Custom 404
└── [pageSlug]/
    └── page.tsx                  # Individual page route

components/
├── editor/
│   └── SectionStatusToggle.tsx   # Status toggle component
└── sites/
    └── SettingsTab.tsx           # Full settings tab

lib/
└── default-theme.ts              # Fallback theme constant
```

### Files to Modify
```
lib/drizzle/schema/sites.ts       # Add columns
lib/drizzle/schema/sections.ts    # Add status column
lib/queries/sites.ts              # Add public query
lib/queries/pages.ts              # Add public queries
lib/queries/sections.ts           # Add published filter
lib/supabase/middleware.ts        # Add /sites to public patterns
app/actions/sites.ts              # Add updateSiteSettings
app/actions/sections.ts           # Add updateSectionStatus
components/editor/SectionCard.tsx # Add status toggle
components/sites/SiteTabs.tsx     # Use real SettingsTab
```

### Files to Delete
```
components/sites/SettingsTabPlaceholder.tsx
```

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Site not found:** Return 404 with helpful message
- [ ] **No published homepage:** Return 404 (site exists but no viewable content)
- [ ] **No active theme:** Use default theme (already handled)
- [ ] **Slug collision on update:** Validate uniqueness, show error

### Edge Cases
- [ ] **Site with all draft pages:** Show 404 (no published content)
- [ ] **Page with all draft sections:** Show empty page (valid but empty)
- [ ] **Circular homepage setting:** Prevented by existing logic

### Security Considerations
- [ ] **Public routes bypass auth:** Intentional, only published content
- [ ] **No user data exposed:** Public queries don't return user_id
- [ ] **Slug validation:** Prevent SQL injection via parameterized queries

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required for this phase.

### Future Considerations
- `NEXT_PUBLIC_APP_DOMAIN` will be needed when custom domain routing is implemented
- DNS/SSL configuration documentation for custom domains

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard implementation workflow:
1. Complete each phase sequentially
2. Update this document with completion timestamps
3. Provide phase recaps after each phase
4. Wait for "proceed" before continuing to next phase
5. Run comprehensive code review after all phases

### Code Quality Standards
- Use early returns for cleaner code
- Use async/await (not .then() chains)
- No fallback behavior - throw errors for unexpected states
- Professional comments explaining business logic
- Create down migration before running any database migration

### Architecture Compliance
- Public routes must not require authentication
- Query functions for public content must filter by status
- Use existing PageRenderer/BlockRenderer for consistency
- Follow established patterns for server actions

---

## 17. Notes & Additional Context

### Deferred Items from Earlier Phases
- **Custom domain column:** Was deferred from Phase 2, now implemented
- **Section status:** New requirement based on user feedback

### Future Phase Considerations
- Phase 8 prepares for custom domain routing (stores domain, but doesn't route)
- Actual domain routing will require middleware updates and Vercel configuration
- Consider adding sitemap.xml and robots.txt generation for SEO

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **Existing sections:** Will have status='published' by default (no change in behavior)
- [ ] **Existing sites:** Will have null custom_domain, meta_title, meta_description

### Ripple Effects Assessment
- [ ] **Editor UI:** SectionCard will show new status toggle
- [ ] **SiteTabs:** Will use real SettingsTab instead of placeholder
- [ ] **PageRenderer:** No changes needed (already receives filtered sections)

### Performance Implications
- [ ] **Query performance:** New index on sections.status ensures fast filtering
- [ ] **Public pages:** Can be statically generated for optimal performance

### Security Considerations
- [ ] **Public data exposure:** Only published content visible
- [ ] **No sensitive data in public queries:** Queries don't return user information

### Summary
This is a low-risk implementation that extends existing patterns. The main considerations are:
1. Database migration requires down migration for safety
2. Public routes must be added to middleware whitelist
3. Default theme ensures graceful fallback

---

*Template Version: 1.0*
*Created: 2025-12-26*
