# Phase 3: Page Management

> **Instructions:** This task implements Phase 3 from the roadmap - enabling users to create, edit, and manage pages within their sites.

---

## 1. Task Overview

### Task Title
**Title:** Phase 3 - Page Management System

### Goal Statement
**Goal:** Enable users to create, edit, and manage pages within their sites. This includes a pages database schema, site detail page with tabbed interface (Pages/Theme/Settings), table-based page list with CRUD operations, and context-aware sidebar navigation that switches to site-specific navigation when viewing a site.

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis Not Required
This phase follows the established roadmap with clear requirements. The architectural decisions have already been made:
- Database schema follows existing sites pattern
- Table layout for pages (user-specified)
- Sidebar replacement for site context (user-specified)
- Placeholder content for Theme/Settings tabs

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Authentication:** Supabase Auth managed by `middleware.ts` for protected routes
- **Key Architectural Patterns:** Next.js App Router, Server Components for data fetching, Server Actions for mutations

### Current State
Phase 2 is complete with:
- `sites` table with CRUD operations
- Dashboard page showing sites in card grid
- Site queries in `lib/queries/sites.ts`
- Site actions in `app/actions/sites.ts`
- Components: `SiteCard`, `SiteStatusBadge`, `CreateSiteModal`, `EmptyState`, `SiteSortDropdown`

The `SiteCard` currently shows "0 pages" hardcoded - this will be updated to show real page counts.

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- [x] **Database Schema** (`lib/drizzle/schema/sites.ts`) - Pattern for new pages schema
- [x] **Server Actions** (`app/actions/sites.ts`) - Pattern for page actions
- [x] **Queries** (`lib/queries/sites.ts`) - Pattern for page queries
- [x] **Components** (`components/sites/*.tsx`) - Existing component patterns
- [x] **Sidebar** (`components/layout/AppSidebar.tsx`) - Current navigation structure

---

## 4. Context & Problem Definition

### Problem Statement
Users can create sites but cannot add pages to them. The site detail page doesn't exist yet, and there's no way to manage content within a site. The sidebar currently shows the same navigation regardless of context.

### Success Criteria
- [x] Pages table exists with proper schema (id, site_id, user_id, title, slug, status, is_home, meta fields, timestamps) ✓
- [x] Site detail page shows site info with tabbed interface ✓
- [x] Pages tab displays pages in table format with actions ✓
- [x] Users can create, edit, duplicate, and delete pages ✓
- [x] Homepage enforcement works (only one `is_home=true` per site) ✓
- [x] First page created automatically becomes homepage ✓
- [x] Sidebar shows site-specific navigation when inside a site ✓
- [x] Theme and Settings tabs show placeholder content ✓

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - breaking changes acceptable
- **Data loss acceptable** - aggressive migrations allowed
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- User can view site details with tabs (Pages, Theme, Settings)
- User can create new pages with title and optional slug
- User can edit page title, slug, and meta information
- User can set a page as homepage (auto-unsets previous)
- User can publish/unpublish individual pages
- User can duplicate a page
- User can delete a page
- First page created in a site automatically becomes homepage
- Sidebar shows site-specific navigation (Pages, Theme, Settings) when in site context

### Non-Functional Requirements
- **Performance:** Page list should load quickly for sites with 50+ pages
- **Responsive Design:** Table layout works on mobile (horizontal scroll)
- **Theme Support:** Works in both light and dark mode

### Technical Constraints
- Must use existing Drizzle ORM patterns
- Must follow Server Actions pattern for mutations
- Must use shadcn/ui components

---

## 7. Data & Database Changes

### Database Schema Changes

```typescript
// lib/drizzle/schema/pages.ts
import { pgTable, text, timestamp, uuid, boolean, index, unique } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { sites } from "./sites";

export const PAGE_STATUSES = ["draft", "published"] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    status: text("status", { enum: PAGE_STATUSES }).notNull().default("draft"),
    is_home: boolean("is_home").notNull().default(false),
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    published_at: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [
    index("pages_site_id_idx").on(t.site_id),
    index("pages_user_id_idx").on(t.user_id),
    index("pages_status_idx").on(t.status),
    unique("pages_site_slug_unique").on(t.site_id, t.slug),
  ]
);

export type Page = InferSelectModel<typeof pages>;
export type NewPage = InferInsertModel<typeof pages>;
```

### Data Migration Plan
- [ ] Create pages schema file
- [ ] Generate migration with `npm run db:generate`
- [ ] Create down migration before applying
- [ ] Apply migration with `npm run db:migrate`
- [ ] Update schema index exports

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns

**Server Actions (Mutations)** → `app/actions/pages.ts`
- `createPage(siteId, data)` - Create page, auto-set homepage if first
- `updatePage(pageId, data)` - Update page details
- `deletePage(pageId)` - Delete page
- `publishPage(pageId)` - Set status to published
- `unpublishPage(pageId)` - Set status to draft
- `duplicatePage(pageId)` - Copy page with "-copy" slug suffix
- `setAsHomePage(pageId)` - Set is_home=true, unset others

**Queries** → `lib/queries/pages.ts`
- `getPagesBySite(siteId, userId)` - All pages for a site
- `getPageById(pageId, userId)` - Single page with ownership check
- `getPageBySlug(siteId, slug)` - For URL routing
- `getPageCount(siteId)` - Count for site card display

---

## 9. Frontend Changes

### New Components

**Site Detail Components:**
- [ ] `components/sites/SiteHeader.tsx` - Site name (editable), status badge, publish toggle, delete button
- [ ] `components/sites/SiteTabs.tsx` - Tab navigation (Pages, Theme, Settings)
- [ ] `components/sites/ThemeTabPlaceholder.tsx` - Coming soon placeholder
- [ ] `components/sites/SettingsTabPlaceholder.tsx` - Coming soon placeholder

**Page Management Components:**
- [ ] `components/pages/PagesList.tsx` - Table of pages with header
- [ ] `components/pages/PageRow.tsx` - Individual page row with actions
- [ ] `components/pages/CreatePageModal.tsx` - Modal form for creating pages
- [ ] `components/pages/EditPageModal.tsx` - Modal form for editing pages
- [ ] `components/pages/PageStatusBadge.tsx` - Draft/Published badge (reuse pattern from SiteStatusBadge)
- [ ] `components/pages/HomeBadge.tsx` - Home page indicator badge
- [ ] `components/pages/PageActions.tsx` - Dropdown menu with page actions
- [ ] `components/pages/EmptyPagesState.tsx` - Empty state for no pages

**Navigation Components:**
- [ ] `components/layout/SiteContextSidebar.tsx` - Site-specific sidebar content
- [ ] Update `components/layout/AppSidebar.tsx` - Detect site context and render appropriate content

### Page Updates
- [ ] Create `app/(protected)/app/sites/[siteId]/page.tsx` - Site detail page
- [ ] Create `app/(protected)/app/sites/[siteId]/loading.tsx` - Loading skeleton
- [ ] Create `app/(protected)/app/sites/[siteId]/error.tsx` - Error boundary
- [ ] Update `components/sites/SiteCard.tsx` - Show real page count

### State Management
- Site detail page is a Server Component fetching site and pages
- Modals manage their own local state
- Actions use `revalidatePath` for cache invalidation

---

## 10. Code Changes Overview

### Current Implementation (Sites Dashboard)

```typescript
// app/(protected)/app/page.tsx - Sites are displayed in card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {sites.map((site) => (
    <SiteCard key={site.id} site={site} />
  ))}
</div>

// components/sites/SiteCard.tsx - Hardcoded page count
<span>0 pages</span>
```

### After Implementation

```typescript
// app/(protected)/app/sites/[siteId]/page.tsx - Site detail with tabs
<SiteHeader site={site} />
<SiteTabs activeTab="pages">
  <TabsContent value="pages">
    <PagesList pages={pages} siteId={site.id} />
  </TabsContent>
  <TabsContent value="theme">
    <ThemeTabPlaceholder />
  </TabsContent>
  <TabsContent value="settings">
    <SettingsTabPlaceholder />
  </TabsContent>
</SiteTabs>

// components/pages/PagesList.tsx - Table layout
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Page</TableHead>
      <TableHead>Slug</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Updated</TableHead>
      <TableHead></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {pages.map((page) => (
      <PageRow key={page.id} page={page} />
    ))}
  </TableBody>
</Table>

// components/layout/AppSidebar.tsx - Context-aware navigation
const isSiteContext = pathname.startsWith("/app/sites/");
const siteId = isSiteContext ? extractSiteId(pathname) : null;

if (siteId) {
  return <SiteContextSidebar siteId={siteId} />;
}
return <DefaultSidebarContent />;
```

### Key Changes Summary
- [ ] **New Schema:** `pages` table with site_id FK, unique slug per site
- [ ] **Site Detail Page:** Tabbed interface at `/app/sites/[siteId]`
- [ ] **Table Layout:** Pages displayed in table with inline actions
- [ ] **Context Sidebar:** Sidebar content changes when inside a site
- [ ] **Page Count:** SiteCard shows real page count from database

---

## 11. Implementation Plan

### Phase 1: Database Schema ✅ COMPLETE
**Goal:** Create pages table with proper schema and indexes

- [x] **Task 1.1:** Create `lib/drizzle/schema/pages.ts` ✓ 2025-12-25
  - Files: `lib/drizzle/schema/pages.ts`
  - Details: 12 columns, 3 indexes, unique constraint on (site_id, slug)
- [x] **Task 1.2:** Update schema index exports ✓ 2025-12-25
  - Files: `lib/drizzle/schema/index.ts`
  - Details: Added `export * from "./pages"`
- [x] **Task 1.3:** Generate database migration ✓ 2025-12-25
  - Command: `npm run db:generate`
  - Details: Generated `drizzle/migrations/0004_clever_mandroid.sql`
- [x] **Task 1.4:** Create down migration (MANDATORY) ✓ 2025-12-25
  - Files: `drizzle/migrations/0004_clever_mandroid/down.sql`
  - Details: Safe rollback script with IF EXISTS clauses
- [x] **Task 1.5:** Apply migration ✓ 2025-12-25
  - Command: `npm run db:migrate`
  - Details: Migration applied successfully

### Phase 2: Queries and Server Actions ✅ COMPLETE
**Goal:** Implement data access layer for pages

- [x] **Task 2.1:** Create `lib/queries/pages.ts` ✓ 2025-12-25
  - Files: `lib/queries/pages.ts`
  - Details: Implemented getPagesBySite, getPageById, getPageBySlug, getPageCount, getHomePage
- [x] **Task 2.2:** Create `app/actions/pages.ts` ✓ 2025-12-25
  - Files: `app/actions/pages.ts`
  - Details: Implemented createPage, updatePage, deletePage, publishPage, unpublishPage, duplicatePage, setAsHomePage with transaction for homepage enforcement
- [x] **Task 2.3:** Update SiteCard to show real page count ✓ 2025-12-25
  - Files: `components/sites/SiteCard.tsx`, `lib/queries/sites.ts`, `app/(protected)/app/page.tsx`
  - Details: Added getSitesWithPageCounts query with LEFT JOIN, updated SiteCard to accept pageCount prop

### Phase 3: Site Detail Page Structure ✅ COMPLETE
**Goal:** Build the site detail page with tabbed interface

- [x] **Task 3.1:** Create site detail page route ✓ 2025-12-25
  - Files: `app/(protected)/app/sites/[siteId]/page.tsx`
  - Details: Server component fetching site and pages data with notFound() handling
- [x] **Task 3.2:** Create loading and error states ✓ 2025-12-25
  - Files: `app/(protected)/app/sites/[siteId]/loading.tsx`, `app/(protected)/app/sites/[siteId]/error.tsx`
  - Details: Skeleton loader and error boundary with retry button
- [x] **Task 3.3:** Create SiteHeader component ✓ 2025-12-25
  - Files: `components/sites/SiteHeader.tsx`
  - Details: Editable site name (click-to-edit), status badge, publish toggle, delete with AlertDialog confirmation, back navigation
- [x] **Task 3.4:** Create SiteTabs component ✓ 2025-12-25
  - Files: `components/sites/SiteTabs.tsx`
  - Details: Tabs component with Pages, Theme, Settings tabs using shadcn/ui
- [x] **Task 3.5:** Create placeholder tab components ✓ 2025-12-25
  - Files: `components/sites/ThemeTabPlaceholder.tsx`, `components/sites/SettingsTabPlaceholder.tsx`
  - Details: Coming soon placeholders with icons and descriptions

### Phase 4: Pages Tab Components ✅ COMPLETE
**Goal:** Build the table-based pages list with all actions

- [x] **Task 4.1:** Create PageStatusBadge and HomeBadge components ✓ 2025-12-25
  - Files: `components/pages/PageStatusBadge.tsx`, `components/pages/HomeBadge.tsx`
  - Details: Badge components following SiteStatusBadge pattern
- [x] **Task 4.2:** Create PageActions dropdown ✓ 2025-12-25
  - Files: `components/pages/PageActions.tsx`
  - Details: Dropdown with Edit, Duplicate, Set as Home, Publish/Unpublish, Delete with confirmation dialog
- [x] **Task 4.3:** Create PageRow component ✓ 2025-12-25
  - Files: `components/pages/PageRow.tsx`
  - Details: Table row with title, slug, badges, actions, and edit modal integration
- [x] **Task 4.4:** Create PagesList component ✓ 2025-12-25
  - Files: `components/pages/PagesList.tsx`
  - Details: Table with header showing page count, create button, and empty state handling
- [x] **Task 4.5:** Create EmptyPagesState component ✓ 2025-12-25
  - Files: `components/pages/EmptyPagesState.tsx`
  - Details: Friendly empty state with icon and create first page CTA
- [x] **Task 4.6:** Create CreatePageModal component ✓ 2025-12-25
  - Files: `components/pages/CreatePageModal.tsx`
  - Details: Modal form for title and optional slug with auto-generation
- [x] **Task 4.7:** Create EditPageModal component ✓ 2025-12-25
  - Files: `components/pages/EditPageModal.tsx`
  - Details: Modal form for editing title, slug, meta_title, meta_description

### Phase 5: Context-Aware Sidebar ✅ COMPLETE
**Goal:** Sidebar shows site-specific navigation when in site context

- [x] **Task 5.1:** Create SiteContextSidebar component ✓ 2025-12-25
  - Files: `components/layout/SiteContextSidebar.tsx`
  - Details: Back to Sites link, Current Site section with name, Pages/Theme/Settings links with active state
- [x] **Task 5.2:** Update AppSidebar with context detection ✓ 2025-12-25
  - Files: `components/layout/AppSidebar.tsx`
  - Details: Regex detection of /app/sites/[siteId] routes, useEffect to fetch site name, conditional rendering
- [x] **Task 5.3:** Add breadcrumb-style back navigation ✓ 2025-12-25
  - Files: Part of SiteContextSidebar
  - Details: Arrow + "Back to Sites" link at top, works in both expanded and collapsed states

### Phase 6: Integration & Testing
**Goal:** Ensure all components work together

- [ ] **Task 6.1:** Verify page creation flow
  - Details: Create page, verify homepage auto-set, verify in table
- [ ] **Task 6.2:** Verify page actions
  - Details: Test edit, duplicate, set as home, publish/unpublish, delete
- [ ] **Task 6.3:** Verify sidebar context switching
  - Details: Navigate into site, verify sidebar changes, navigate out
- [ ] **Task 6.4:** Verify page count in SiteCard
  - Details: Create pages, verify count updates on dashboard

**Note:** Phase 6 tasks are manual verification steps to be performed by the user.

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** before adding timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes)

---

## 13. File Structure & Organization

### New Files to Create
```
project-root/
├── lib/drizzle/schema/
│   └── pages.ts                              # Pages table schema
├── lib/queries/
│   └── pages.ts                              # Page query functions
├── app/actions/
│   └── pages.ts                              # Page server actions
├── app/(protected)/app/sites/[siteId]/
│   ├── page.tsx                              # Site detail page
│   ├── loading.tsx                           # Loading skeleton
│   └── error.tsx                             # Error boundary
├── components/sites/
│   ├── SiteHeader.tsx                        # Site header with actions
│   ├── SiteTabs.tsx                          # Tab navigation
│   ├── ThemeTabPlaceholder.tsx               # Theme tab placeholder
│   └── SettingsTabPlaceholder.tsx            # Settings tab placeholder
├── components/pages/
│   ├── PagesList.tsx                         # Pages table
│   ├── PageRow.tsx                           # Table row
│   ├── PageStatusBadge.tsx                   # Status badge
│   ├── HomeBadge.tsx                         # Home indicator
│   ├── PageActions.tsx                       # Actions dropdown
│   ├── CreatePageModal.tsx                   # Create modal
│   ├── EditPageModal.tsx                     # Edit modal
│   └── EmptyPagesState.tsx                   # Empty state
└── components/layout/
    └── SiteContextSidebar.tsx                # Site-specific sidebar
```

### Files to Modify
- [x] `lib/drizzle/schema/index.ts` - Added pages export ✓
- [x] `components/sites/SiteCard.tsx` - Real page count with pageCount prop ✓
- [x] `components/layout/AppSidebar.tsx` - Context detection with SiteContextSidebar ✓
- [x] `lib/queries/sites.ts` - Added getSitesWithPageCounts query ✓
- [x] `app/(protected)/app/page.tsx` - Updated to use getSitesWithPageCounts ✓
- [x] `app/actions/sites.ts` - Added getSiteBasicInfo for sidebar ✓
- [x] `components/sites/index.ts` - Added new component exports ✓

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Duplicate slug within site:** Handled by unique constraint and validation
- [ ] **Deleting homepage:** Should unset is_home and not auto-assign new homepage
- [ ] **Race condition on homepage set:** Use transaction to unset/set atomically

### Edge Cases
- [ ] **Empty slug input:** Auto-generate from title
- [ ] **Special characters in slug:** Sanitize to URL-safe format
- [ ] **Very long title:** Truncate display, allow full in edit

### Security & Access Control
- [ ] **Ownership verification:** All actions verify user owns the site/page
- [ ] **Page belongs to site:** Verify page's site_id matches when editing

---

## 15. Deployment & Configuration

No new environment variables required for this phase.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the phase-by-phase implementation with user approval between phases.

### Code Quality Standards
- Use early returns for validation
- Follow existing patterns from sites implementation
- Use TypeScript strict mode
- Use shadcn/ui Table component for pages list

---

## 17. Notes & Additional Context

### UI Component Dependencies
Ensure these shadcn/ui components are installed:
- `Table` (TableHeader, TableBody, TableRow, TableHead, TableCell)
- `Tabs` (TabsList, TabsTrigger, TabsContent)
- `DropdownMenu` (for PageActions)
- `Dialog` (for modals)
- `AlertDialog` (for delete confirmation)

Install if missing:
```bash
npx shadcn@latest add table tabs dropdown-menu dialog alert-dialog
```

### Sidebar Behavior Notes
When in site context (`/app/sites/[siteId]/*`):
- Replace main navigation with site-specific links
- Show "Back to Dashboard" at top
- Show site name
- Show Pages, Theme, Settings links
- Keep footer (theme switcher, logout) unchanged

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Identified
- None - this is new functionality

### Performance Implications
- Added `getPageCount` query for each SiteCard - consider batch query optimization if needed later
- Pages table indexed on site_id for efficient queries

### Security Considerations
- All page operations verify user ownership through site ownership
- No public page access in this phase (Phase 8)

### User Experience Impacts
- Clear navigation context when inside a site
- Easy return to dashboard via sidebar back link

---

*Task Created: December 2025*
*Phase: 3 of 9*
*Dependencies: Phase 2 Complete*
