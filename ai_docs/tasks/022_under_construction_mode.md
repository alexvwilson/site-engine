# Task 022: Under Construction Mode

---

## 1. Task Overview

### Task Title
**Title:** Under Construction Mode for Published Sites

### Goal Statement
**Goal:** Allow sites to be published but display a "Coming Soon" page to public visitors while the owner can still see and work on the actual site content. This provides a way to have a site live at its URL without exposing incomplete content to the public.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis skipped** - This is a straightforward feature with a clear implementation path. The requirements are well-defined and there's only one sensible technical approach (database flag + route-level check).

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Authentication:** Supabase Auth with `getCurrentUserId()` for optional auth checks

### Current State
- Sites can be published via the dashboard, making them accessible at `/sites/[slug]`
- Published site routes (`app/(sites)/sites/[siteSlug]/page.tsx` and `[pageSlug]/page.tsx`) render site content directly
- No mechanism exists to hide published content from public visitors
- SettingsTab has cards for URL, SEO, Appearance, and Header/Footer settings
- SiteCard displays status badge (draft/published) but no construction indicator

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- [x] `lib/drizzle/schema/sites.ts` - Sites table schema, need to add new fields
- [x] `components/sites/SettingsTab.tsx` - Settings UI, need to add Under Construction card
- [x] `app/(sites)/sites/[siteSlug]/page.tsx` - Published homepage, need construction check
- [x] `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Published subpages, need construction check
- [x] `components/sites/SiteCard.tsx` - Dashboard card, need construction badge
- [x] `app/actions/sites.ts` - Server actions, need to handle new settings
- [x] `lib/auth.ts` - Has `getCurrentUserId()` for optional auth check without redirect

---

## 4. Context & Problem Definition

### Problem Statement
When sites are published, they become immediately accessible to anyone with the URL. There's no way to "soft launch" a site - keeping it at its public URL for owner testing while showing a placeholder to the general public. This is problematic when:
- Building a site incrementally while wanting to share the URL
- Testing the published version without exposing incomplete content
- Preparing for a launch but wanting the URL reserved

### Success Criteria
- [x] Site-level toggle: "Under Construction" on/off in Settings
- [x] When enabled, public visitors see a "Coming Soon" page
- [x] Owner (authenticated user) can still see the actual site content
- [x] Customizable title and description for the Coming Soon page
- [x] Dashboard shows construction badge on sites under construction
- [x] Preview mode works normally regardless of construction status

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - can add columns freely
- **Priority: Speed and simplicity** - straightforward implementation

---

## 6. Technical Requirements

### Functional Requirements
- User can toggle "Under Construction" mode in site settings
- User can customize the Coming Soon page title and description
- Public visitors (unauthenticated) see Coming Soon page when mode is enabled
- Site owner (authenticated) sees the actual site content
- Dashboard displays a badge indicating sites under construction

### Non-Functional Requirements
- **Performance:** No impact - simple boolean check
- **Security:** Auth check must be reliable (use `getCurrentUserId()`)
- **Usability:** Toggle should be prominent in settings
- **Responsive Design:** Coming Soon page must work on all devices

### Technical Constraints
- Must use existing Supabase auth via `getCurrentUserId()`
- Must follow existing SettingsTab patterns for UI
- Coming Soon page should use minimal theming (not full site theme)

---

## 7. Data & Database Changes

### Database Schema Changes
Add three new fields to the `sites` table:

```typescript
// lib/drizzle/schema/sites.ts
under_construction: boolean("under_construction").notNull().default(false),
construction_title: text("construction_title"),
construction_description: text("construction_description"),
```

### Data Migration Plan
- [x] Generate migration with new columns
- [x] Create down migration before applying
- [x] Apply migration

---

## 8. Backend Changes

### Server Actions
- [x] **`updateSiteSettings`** - Add `underConstruction`, `constructionTitle`, `constructionDescription` to the settings data type and update handler

---

## 9. Frontend Changes

### New Components
- [x] **`components/render/ComingSoonPage.tsx`** - Simple Coming Soon page with customizable title/description

### Component Updates
- [x] **`components/sites/SettingsTab.tsx`** - Add "Under Construction" card with toggle and optional fields
- [x] **`components/sites/SiteCard.tsx`** - Add construction badge when `under_construction` is true

### Page Updates
- [x] **`app/(sites)/sites/[siteSlug]/page.tsx`** - Check construction mode, render ComingSoonPage for public visitors
- [x] **`app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx`** - Same check for subpages

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**sites.ts schema** - No construction fields:
```typescript
export const sites = pgTable("sites", {
  // ... existing fields
  color_mode: text("color_mode", { enum: COLOR_MODES }).notNull().default("light"),
  header_content: jsonb("header_content").$type<HeaderContent>(),
  footer_content: jsonb("footer_content").$type<FooterContent>(),
});
```

**Published site route** - Renders content directly:
```typescript
export default async function PublishedSiteHomePage({ params }: PageProps) {
  const site = await getPublishedSiteBySlug(siteSlug);
  // ... directly renders PageRenderer
}
```

### 📂 **After Implementation**

**sites.ts schema** - With construction fields:
```typescript
export const sites = pgTable("sites", {
  // ... existing fields
  under_construction: boolean("under_construction").notNull().default(false),
  construction_title: text("construction_title"),
  construction_description: text("construction_description"),
});
```

**Published site route** - With construction check:
```typescript
export default async function PublishedSiteHomePage({ params }: PageProps) {
  const site = await getPublishedSiteBySlug(siteSlug);

  // Check if under construction and visitor is not the owner
  if (site.under_construction) {
    const userId = await getCurrentUserId();
    if (userId !== site.user_id) {
      return <ComingSoonPage site={site} />;
    }
  }
  // ... renders PageRenderer for owner
}
```

### 🎯 **Key Changes Summary**
- **Database:** 3 new columns on sites table
- **Settings UI:** New card with toggle + title/description fields
- **Published Routes:** Construction check before rendering
- **Dashboard:** Badge on SiteCard for under-construction sites
- **New Component:** ComingSoonPage for public placeholder

---

## 11. Implementation Plan

### Phase 1: Database Changes ✅ 2025-12-28
**Goal:** Add construction fields to sites table

- [x] **Task 1.1:** Update sites schema with new fields ✓
  - Files: `lib/drizzle/schema/sites.ts`
  - Details: Added `under_construction` (boolean), `construction_title` (text), `construction_description` (text)
- [x] **Task 1.2:** Generate migration ✓
  - Command: `npm run db:generate`
  - Output: `drizzle/migrations/0011_nosy_vin_gonzales.sql`
- [x] **Task 1.3:** Create down migration ✓
  - Files: `drizzle/migrations/0011_nosy_vin_gonzales/down.sql`
- [x] **Task 1.4:** Apply migration ✓
  - Command: `npm run db:migrate`

### Phase 2: Backend Updates ✅ 2025-12-28
**Goal:** Update server actions to handle new settings

- [x] **Task 2.1:** Update `UpdateSiteSettingsData` interface ✓
  - Files: `app/actions/sites.ts`
  - Details: Added `underConstruction`, `constructionTitle`, `constructionDescription` fields
- [x] **Task 2.2:** Update `updateSiteSettings` function ✓
  - Files: `app/actions/sites.ts`
  - Details: Added handling for new fields with trim/null logic

### Phase 3: Coming Soon Page Component ✅ 2025-12-28
**Goal:** Create the placeholder page for public visitors

- [x] **Task 3.1:** Create ComingSoonPage component ✓
  - Files: `components/render/ComingSoonPage.tsx`
  - Details: Simple responsive page with gradient background, emoji, customizable title/description

### Phase 4: Settings UI ✅ 2025-12-28
**Goal:** Add construction toggle to site settings

- [x] **Task 4.1:** Add Under Construction card to SettingsTab ✓
  - Files: `components/sites/SettingsTab.tsx`
  - Details: Added Construction icon, Switch component, state variables, hasChanges check, useEffect reset, handleSubmit fields, and full card UI with toggle and conditional title/description fields

### Phase 5: Published Route Updates ✅ 2025-12-28
**Goal:** Check construction mode and show Coming Soon page

- [x] **Task 5.1:** Update homepage route ✓
  - Files: `app/(sites)/sites/[siteSlug]/page.tsx`
  - Details: Added imports for getCurrentUserId and ComingSoonPage, added construction check after site fetch
- [x] **Task 5.2:** Update subpage route ✓
  - Files: `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx`
  - Details: Same pattern as homepage

### Phase 6: Dashboard Badge ✅ 2025-12-28
**Goal:** Show construction indicator on site cards

- [x] **Task 6.1:** Add construction badge to SiteCard ✓
  - Files: `components/sites/SiteCard.tsx`
  - Details: Added 🚧 badge with amber styling next to status badge when under_construction is true

### Phase 7: Testing & Code Review ✅ 2025-12-28
**Goal:** Verify all functionality works correctly

- [x] **Task 7.1:** Verify owner can see actual site when under construction ✓
  - Code review confirms: `getCurrentUserId()` compared with `site.user_id`
- [x] **Task 7.2:** Verify public sees Coming Soon page ✓
  - Code review confirms: Non-matching userId returns `<ComingSoonPage />`
- [x] **Task 7.3:** Verify preview mode works normally ✓
  - Preview routes in protected area unaffected by construction check
- [x] **Task 7.4:** Verify settings save and load correctly ✓
  - All state variables, hasChanges, useEffect reset, and handleSubmit properly configured
- [x] **Task 7.5:** Comprehensive code review ✓
  - All 7 files reviewed, type checking passes, no linting errors in modified files

---

## 12. Task Completion Tracking

Updates will be added here as tasks are completed with timestamps.

---

## 13. File Structure & Organization

### New Files to Create
```
components/render/ComingSoonPage.tsx    # Coming Soon placeholder page
drizzle/migrations/XXXX/down.sql        # Rollback migration
```

### Files to Modify
```
lib/drizzle/schema/sites.ts             # Add 3 new columns
app/actions/sites.ts                    # Handle new settings
components/sites/SettingsTab.tsx        # Add Under Construction card
components/sites/SiteCard.tsx           # Add construction badge
app/(sites)/sites/[siteSlug]/page.tsx   # Check construction mode
app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx  # Check construction mode
```

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Auth check fails silently:** If `getCurrentUserId()` throws, ensure we fail safe (show Coming Soon)
- [ ] **Migration issues:** Down migration ready for rollback

### Edge Cases
- [ ] **Site not published but under_construction true:** Should not matter - unpublished sites already hidden
- [ ] **Empty title/description:** Use sensible defaults ("Coming Soon", generic description)

### Security Considerations
- [ ] **Auth bypass:** Ensure `getCurrentUserId()` is reliable for owner check
- [ ] **Data exposure:** Coming Soon page must not leak any site content

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

Follow the standard workflow:
1. Implement phase by phase
2. Update task document after each phase
3. Wait for "proceed" between phases
4. Comprehensive code review after implementation

---

## 17. Notes & Additional Context

### Design Notes
- Coming Soon page should be simple and professional
- Use site name as fallback title if no custom title set
- Keep the page minimal - no heavy styling or animations
- Badge in dashboard should be subtle but visible (e.g., 🚧 icon or "Under Construction" text)

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

**Breaking Changes:** None - new feature with opt-in toggle

**Performance Impact:** Minimal - one additional auth check on published routes

**User Experience:** Positive - enables soft launches and URL reservation

**Maintenance Burden:** Low - simple boolean logic

### Mitigation Strategies
- Down migration ready before applying schema changes
- Default to showing Coming Soon if auth check fails (fail safe)
