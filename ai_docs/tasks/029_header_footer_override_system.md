# Task 029: Header/Footer Override System

> **Status:** Ready for Implementation
> **Created:** 2025-12-29
> **Complexity:** Medium-High

---

## 1. Task Overview

### Task Title
**Title:** Header/Footer Override System with Layout Variants

### Goal Statement
**Goal:** Implement a system where site-level header/footer settings serve as defaults, while individual pages can override specific styling options (layout variant, sticky behavior, logo text visibility, CTA) without duplicating all the navigation content.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Currently, site-level header/footer configuration completely replaces any page-level header/footer sections. Users want:
1. Global defaults for navigation, logo, and CTA
2. Per-page styling customization (layout, sticky, etc.)
3. Per-page CTA overrides (different CTA on landing vs blog pages)

### Solution: Merge-Based Override System

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    SETTINGS TAB (Site-Level)                │
├─────────────────────────────────────────────────────────────┤
│  Header Defaults                                            │
│  ├── Content: Logo, Nav Links, CTA Text/URL                 │
│  └── Default Styling: Layout, Sticky, Show Logo Text        │
│                                                             │
│  Footer Defaults                                            │
│  ├── Content: Links, Copyright                              │
│  └── Default Styling: Layout                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (inherited by all pages)
┌─────────────────────────────────────────────────────────────┐
│                   PAGE HEADER SECTION (Override Mode)       │
├─────────────────────────────────────────────────────────────┤
│  [Site nav, logo, CTA inherited automatically]              │
│                                                             │
│  Override Options:                                          │
│  ├── Layout:      ○ Site Default  ● Custom → [Left ▼]       │
│  ├── Sticky:      ● Site Default  ○ Custom → [ ] Sticky     │
│  ├── Logo Text:   ● Site Default  ○ Custom → [ ] Show       │
│  └── CTA:         ● Site Default  ○ Custom → [Text] [URL]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI:** shadcn/ui components with Tailwind CSS v4
- **Database:** Supabase (Postgres) via Drizzle ORM

### Current State

**Site-Level Header/Footer:**
- Stored in `sites.header_content` and `sites.footer_content` (JSONB)
- Configured in SettingsTab using HeaderEditor/FooterEditor
- Rendered directly in published pages

**Page-Level Sections:**
- Header/footer sections can be added to pages
- Currently FILTERED OUT when site-level config exists (lines 78-83 of published page)
- No override capability exists

**Current Filtering Logic:**
```typescript
// app/(sites)/sites/[siteSlug]/page.tsx lines 78-83
const sections = allSections.filter((section) => {
  if (siteHeader && section.block_type === "header") return false;
  if (siteFooter && section.block_type === "footer") return false;
  return true;
});
```

---

## 4. Context & Problem Definition

### Problem Statement
Site owners need consistent navigation across their site (managed globally) but want flexibility in header/footer presentation on different pages. A landing page might need a transparent header with center layout, while blog pages need a standard sticky header with left layout.

### Success Criteria
- [ ] Site Settings has default styling options (layout, sticky, logo text)
- [ ] Page header/footer sections show override controls
- [ ] Overrides merge with site defaults (not replace entirely)
- [ ] Layout variants render correctly (Left, Right, Center for header; Simple, Columns, Minimal for footer)
- [ ] Sticky behavior works when enabled
- [ ] Logo text visibility toggle works
- [ ] CTA can be overridden per-page
- [ ] Published sites render merged configuration correctly
- [ ] Preview mode shows merged configuration correctly
- [ ] Backwards compatible with existing sites

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns** - can make breaking changes
- **Data migration acceptable** - existing data handled with sensible defaults

---

## 6. Technical Requirements

### Functional Requirements

**Header Styling Options:**
| Option | Type | Values | Default |
|--------|------|--------|---------|
| Layout | enum | `left`, `right`, `center` | `left` |
| Sticky | boolean | true/false | `true` |
| Show Logo Text | boolean | true/false | `true` |

**Footer Styling Options:**
| Option | Type | Values | Default |
|--------|------|--------|---------|
| Layout | enum | `simple`, `columns`, `minimal` | `simple` |

**Override Behavior:**
- Each option can be "Use Site Default" or "Custom"
- Custom values only stored when different from site default
- Missing override = use site default

### Non-Functional Requirements
- **Performance:** No additional database queries for merging
- **Responsive Design:** Layout variants work on mobile
- **Theme Support:** Works with light/dark mode

---

## 7. Data & Database Changes

### Data Model Updates

**Updated HeaderContent interface:**
```typescript
export type HeaderLayout = 'left' | 'right' | 'center';

export interface HeaderContent {
  // Content (from site settings)
  siteName: string;
  logoUrl?: string;
  links: NavLink[];
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;

  // Styling (can be set at site level OR overridden at page level)
  layout?: HeaderLayout;
  sticky?: boolean;
  showLogoText?: boolean;

  // Override flags (only used in page-level sections)
  overrideLayout?: boolean;
  overrideSticky?: boolean;
  overrideShowLogoText?: boolean;
  overrideCta?: boolean;
}
```

**Updated FooterContent interface:**
```typescript
export type FooterLayout = 'simple' | 'columns' | 'minimal';

export interface FooterContent {
  // Content (from site settings)
  copyright: string;
  links: FooterLink[];

  // Styling
  layout?: FooterLayout;

  // Override flags (only used in page-level sections)
  overrideLayout?: boolean;
}
```

### Database Schema Changes
No database schema changes needed - all data stored in existing JSONB columns.

---

## 8. Backend Changes & Background Jobs

No backend changes needed. Merging logic happens at render time.

---

## 9. Frontend Changes

### New Components to Create

1. **`components/editor/HeaderStyleOptions.tsx`**
   - Layout select (Left/Right/Center)
   - Sticky toggle
   - Show Logo Text toggle
   - Used in both SettingsTab and page HeaderEditor

2. **`components/editor/FooterStyleOptions.tsx`**
   - Layout select (Simple/Columns/Minimal)
   - Used in both SettingsTab and page FooterEditor

3. **`components/editor/OverrideField.tsx`**
   - Generic "Use Default" / "Custom" radio group
   - Wraps any form field to add override capability

### Files to Modify

1. **`lib/section-types.ts`**
   - Add `HeaderLayout` and `FooterLayout` types
   - Add styling fields to HeaderContent and FooterContent
   - Add override flags

2. **`lib/section-defaults.ts`**
   - Add default styling values

3. **`components/editor/blocks/HeaderEditor.tsx`**
   - Add styling options section
   - Add override mode UI (when used on page)
   - Conditionally show override controls

4. **`components/editor/blocks/FooterEditor.tsx`**
   - Add styling options section
   - Add override mode UI (when used on page)

5. **`components/sites/SettingsTab.tsx`**
   - Pass `isPageLevel={false}` to HeaderEditor/FooterEditor
   - Styling options shown without override controls

6. **`components/editor/SectionEditor.tsx`**
   - Pass site header/footer defaults to page-level editors
   - Pass `isPageLevel={true}` to HeaderEditor/FooterEditor

7. **`components/render/blocks/HeaderBlock.tsx`**
   - Implement layout variants (Left, Right, Center)
   - Implement sticky behavior
   - Implement logo text visibility

8. **`components/render/blocks/FooterBlock.tsx`**
   - Implement layout variants (Simple, Columns, Minimal)

9. **`app/(sites)/sites/[siteSlug]/page.tsx`**
   - Change from filtering to merging logic
   - Pass merged content to HeaderBlock/FooterBlock

10. **`app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx`**
    - Same merging logic

11. **`app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/page.tsx`**
    - Same merging logic for preview

12. **`components/preview/PreviewFrame.tsx`**
    - Update to handle merged header/footer

---

## 10. Code Changes Overview

### Merge Logic (New Utility Function)

```typescript
// lib/header-footer-utils.ts

export function mergeHeaderContent(
  siteHeader: HeaderContent,
  pageHeader: HeaderContent | null
): HeaderContent {
  if (!pageHeader) return siteHeader;

  return {
    // Content always from site
    siteName: siteHeader.siteName,
    logoUrl: siteHeader.logoUrl,
    links: siteHeader.links,

    // CTA: use page override if enabled, otherwise site
    showCta: pageHeader.overrideCta ? pageHeader.showCta : siteHeader.showCta,
    ctaText: pageHeader.overrideCta ? pageHeader.ctaText : siteHeader.ctaText,
    ctaUrl: pageHeader.overrideCta ? pageHeader.ctaUrl : siteHeader.ctaUrl,

    // Styling: use page override if enabled, otherwise site
    layout: pageHeader.overrideLayout ? pageHeader.layout : siteHeader.layout,
    sticky: pageHeader.overrideSticky ? pageHeader.sticky : siteHeader.sticky,
    showLogoText: pageHeader.overrideShowLogoText
      ? pageHeader.showLogoText
      : siteHeader.showLogoText,
  };
}

export function mergeFooterContent(
  siteFooter: FooterContent,
  pageFooter: FooterContent | null
): FooterContent {
  if (!pageFooter) return siteFooter;

  return {
    // Content always from site
    copyright: siteFooter.copyright,
    links: siteFooter.links,

    // Styling: use page override if enabled
    layout: pageFooter.overrideLayout ? pageFooter.layout : siteFooter.layout,
  };
}
```

### HeaderBlock Layout Variants

**Left Layout (current):**
```
[Logo] [SiteName]    [Nav Links]    [CTA]
```

**Right Layout:**
```
[CTA]    [Nav Links]    [Logo] [SiteName]
```

**Center Layout:**
```
        [Logo] [SiteName]
    [Nav Link] [Nav Link] [Nav Link]
            [CTA]
```

### FooterBlock Layout Variants

**Simple (current):**
```
[Copyright]                    [Link] [Link] [Link]
```

**Columns:**
```
[Logo/Company]    [Links Col 1]    [Links Col 2]    [Links Col 3]
                        [Copyright]
```

**Minimal:**
```
                [Copyright]
```

---

## 11. Implementation Plan

### Phase 1: Type System Updates
**Goal:** Add types and defaults for styling options

- [ ] **Task 1.1:** Update `lib/section-types.ts`
  - Add `HeaderLayout` and `FooterLayout` types
  - Add styling fields to HeaderContent
  - Add override flags to HeaderContent
  - Add styling field and override flag to FooterContent

- [ ] **Task 1.2:** Update `lib/section-defaults.ts`
  - Add default styling values

### Phase 2: Utility Functions
**Goal:** Create merge utilities

- [ ] **Task 2.1:** Create `lib/header-footer-utils.ts`
  - Implement `mergeHeaderContent()`
  - Implement `mergeFooterContent()`

### Phase 3: Editor UI - Site Level
**Goal:** Add styling options to Settings Tab

- [ ] **Task 3.1:** Create `components/editor/HeaderStyleOptions.tsx`
  - Layout select
  - Sticky toggle
  - Show Logo Text toggle

- [ ] **Task 3.2:** Create `components/editor/FooterStyleOptions.tsx`
  - Layout select

- [ ] **Task 3.3:** Update `components/editor/blocks/HeaderEditor.tsx`
  - Add `isPageLevel` prop
  - Show styling options (from HeaderStyleOptions)
  - When `isPageLevel=false`, show styling without override controls

- [ ] **Task 3.4:** Update `components/editor/blocks/FooterEditor.tsx`
  - Add `isPageLevel` prop
  - Show styling options (from FooterStyleOptions)

### Phase 4: Editor UI - Page Level Overrides
**Goal:** Add override controls for page-level sections

- [ ] **Task 4.1:** Create `components/editor/OverrideField.tsx`
  - Reusable "Use Default" / "Custom" radio group
  - Accepts children (the actual field to override)

- [ ] **Task 4.2:** Update `HeaderEditor` for page-level mode
  - When `isPageLevel=true`, wrap styling options in OverrideField
  - Add CTA override section
  - Hide content fields (siteName, links) since they come from site

- [ ] **Task 4.3:** Update `FooterEditor` for page-level mode
  - When `isPageLevel=true`, wrap layout in OverrideField
  - Hide content fields (copyright, links) since they come from site

- [ ] **Task 4.4:** Update `components/editor/SectionEditor.tsx`
  - Detect header/footer block types
  - Pass `isPageLevel={true}` to editors
  - Pass site defaults for display/comparison

### Phase 5: Renderer Updates
**Goal:** Implement visual layout variants

- [ ] **Task 5.1:** Update `components/render/blocks/HeaderBlock.tsx`
  - Implement Left layout (existing, make explicit)
  - Implement Right layout
  - Implement Center layout
  - Implement non-sticky mode
  - Implement logo text hide option

- [ ] **Task 5.2:** Update `components/render/blocks/FooterBlock.tsx`
  - Implement Simple layout (existing, make explicit)
  - Implement Columns layout
  - Implement Minimal layout

### Phase 6: Published Site Integration
**Goal:** Update published pages to use merging

- [ ] **Task 6.1:** Update `app/(sites)/sites/[siteSlug]/page.tsx`
  - Remove filtering logic
  - Find page header/footer sections (if any)
  - Merge with site defaults
  - Pass merged content to blocks

- [ ] **Task 6.2:** Update `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx`
  - Same merging logic

### Phase 7: Preview Integration
**Goal:** Update preview to use merging

- [ ] **Task 7.1:** Update `app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/page.tsx`
  - Implement merging logic
  - Pass merged content to PreviewFrame

- [ ] **Task 7.2:** Update `components/preview/PreviewFrame.tsx`
  - Handle merged header/footer props

### Phase 8: Verification
**Goal:** Test and verify implementation

- [ ] **Task 8.1:** Run linting and type checking
- [ ] **Task 8.2:** Verify backwards compatibility with existing sites

---

## 12. Task Completion Tracking

Will be updated during implementation with timestamps.

---

## 13. File Structure & Organization

### New Files to Create
```
lib/
└── header-footer-utils.ts          # Merge utilities

components/editor/
├── HeaderStyleOptions.tsx          # Header styling controls
├── FooterStyleOptions.tsx          # Footer styling controls
└── OverrideField.tsx               # Generic override wrapper
```

### Files to Modify
```
lib/
├── section-types.ts                # Add types
└── section-defaults.ts             # Add defaults

components/
├── editor/blocks/HeaderEditor.tsx  # Add styling + override mode
├── editor/blocks/FooterEditor.tsx  # Add styling + override mode
├── editor/SectionEditor.tsx        # Pass isPageLevel prop
├── sites/SettingsTab.tsx           # Pass isPageLevel=false
├── render/blocks/HeaderBlock.tsx   # Layout variants
├── render/blocks/FooterBlock.tsx   # Layout variants
└── preview/PreviewFrame.tsx        # Handle merged props

app/
├── (sites)/sites/[siteSlug]/page.tsx        # Merging logic
├── (sites)/sites/[siteSlug]/[pageSlug]/page.tsx  # Merging logic
└── (protected)/app/sites/[siteId]/pages/[pageId]/preview/page.tsx  # Merging logic
```

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Site has no header/footer configured** - Page sections work standalone
- [ ] **Page has header section but site doesn't** - Page section renders alone
- [ ] **All overrides enabled** - Essentially a custom header for that page
- [ ] **Backwards compatibility** - Existing headers without styling fields use defaults

### Security & Access Control Review
- No security concerns - all data within existing auth boundaries

---

## 15. Deployment & Configuration

No deployment or environment changes required.

---

## 16. AI Agent Instructions

This is a medium-high complexity task. Follow phase-by-phase implementation with verification at each step. The key insight is that we're not replacing page sections - we're changing them to "override mode" where they only contain override flags and values, not full content.

---

## 17. Notes & Additional Context

### Layout Variant Visual Reference

**Header - Left Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [Logo] Site Name          Home  About  Contact   [CTA]  │
└──────────────────────────────────────────────────────────┘
```

**Header - Right Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [CTA]   Home  About  Contact          Site Name [Logo]  │
└──────────────────────────────────────────────────────────┘
```

**Header - Center Layout:**
```
┌──────────────────────────────────────────────────────────┐
│                    [Logo] Site Name                      │
│              Home    About    Contact                    │
│                        [CTA]                             │
└──────────────────────────────────────────────────────────┘
```

**Footer - Simple Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ © 2025 Company                    Privacy  Terms  Contact│
└──────────────────────────────────────────────────────────┘
```

**Footer - Minimal Layout:**
```
┌──────────────────────────────────────────────────────────┐
│                    © 2025 Company                        │
└──────────────────────────────────────────────────────────┘
```

**Footer - Columns Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ [Logo]              Company        Resources      Legal  │
│ Brief description   About Us       Blog           Privacy│
│ of the company      Careers        Help           Terms  │
│                     Contact        Docs           Cookie │
│                                                          │
│                    © 2025 Company Name                   │
└──────────────────────────────────────────────────────────┘
```

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

**Breaking Changes:**
- Page-level header/footer sections will change behavior (from hidden to override mode)
- Existing page sections may appear differently after update

**Ripple Effects:**
- Preview must be updated to show merged content
- Section templates for header/footer may need updating

**Performance:**
- Minimal impact - merging is simple object spread operation

**Mitigation:**
- Default styling values ensure existing sites look the same
- Override flags default to false (use site defaults)

---

*Task Document Version: 1.0*
*Created: 2025-12-29*
