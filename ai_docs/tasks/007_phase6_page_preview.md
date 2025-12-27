# AI Task Template

> **Instructions:** Phase 6 - Page Preview implementation with Rendering Contract Checkpoint

---

## 1. Task Overview

### Task Title
**Title:** Phase 6: Page Preview with Section Renderers and Device Toggle

### Goal Statement
**Goal:** Create a comprehensive page preview system that renders all 9 section types with theme styling applied. Users will be able to preview their pages with responsive device sizes (Desktop/Tablet/Mobile) before publishing. This phase also includes completing the Rendering Contract Checkpoint to validate the architecture before proceeding.

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis Skipped
**Reason:** User has already provided clear direction through Q&A:
- A) Do Rendering Contract Checkpoint first
- B) Focus on Phase 6, defer Guided Mode
- B) Build reusable renderers for both preview and public routes
- C) Start with inline styles, migrate to CSS Variables in Phase 8
- A) Include device preview with responsive widths

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Authentication:** Supabase Auth managed by `middleware.ts`
- **Background Jobs:** Trigger.dev v4 for theme generation
- **AI Integration:** OpenAI API for theme generation

### Current State

**Existing Infrastructure (Complete):**
- Database schemas for sites, pages, sections, themes, theme-generation-jobs
- 9 block type editors in `components/editor/blocks/`
- Section types and defaults in `lib/section-types.ts` and `lib/section-defaults.ts`
- Theme types with ColorPalette, TypographySettings, ComponentStyles in `lib/drizzle/schema/theme-types.ts`
- ThemePreview component using inline styles pattern in `components/theme/ThemePreview.tsx`
- Page editor at `app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx`
- Preview button in EditorHeader linking to `/app/sites/[siteId]/pages/[pageId]/preview`
- Query functions for themes, sections, pages, sites

**Missing (To Be Built):**
- Section renderer components for all 9 block types
- PageRenderer component to render full page with theme
- Preview page route with device toggle
- Theme CSS generation utilities
- Icon resolver for Lucide icons in Features block

### Existing Codebase Analysis

**🔍 Analysis Completed:**

- [x] **Section Types** (`lib/section-types.ts`)
  - 9 content interfaces: HeroContent, TextContent, ImageContent, GalleryContent, FeaturesContent, CTAContent, TestimonialsContent, ContactContent, FooterContent
  - ContentTypeMap for type-safe content access
  - BLOCK_TYPE_INFO with icons and descriptions

- [x] **Theme Types** (`lib/drizzle/schema/theme-types.ts`)
  - ColorPalette (8 colors + rationale)
  - TypographySettings (heading/body fonts, scale, line heights)
  - ComponentStyles (button, card, input, badge)
  - ThemeData combining all + tailwindExtends + cssVariables

- [x] **ThemePreview Pattern** (`components/theme/ThemePreview.tsx`)
  - Uses inline styles for theme application
  - Demonstrates color swatch, typography, and component styling
  - Good reference for inline style approach

- [x] **Page Editor** (`app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx`)
  - Server Component fetching page and sections
  - Uses EditorHeader, SectionsList, BlockPicker
  - Preview button already links to `/preview` route

---

## 4. Context & Problem Definition

### Problem Statement
Users can create and edit page sections, but cannot see how their content will look with the generated theme applied. The Preview button in the page editor leads to a non-existent route. Users need a way to visualize their pages as visitors will see them, including testing on different device sizes.

### Success Criteria
- [ ] Rendering Contract Checkpoint passes - all 9 section types render correctly with theme
- [ ] Preview page at `/app/sites/[siteId]/pages/[pageId]/preview` loads successfully
- [ ] All 9 section types render with proper theme colors, typography, and component styles
- [ ] Device toggle switches between Desktop (100%), Tablet (768px), Mobile (375px) widths
- [ ] Renderers are reusable for future Phase 8 public routes
- [ ] Icons in Features block render correctly from Lucide

---

## 5. Development Mode Context

### Development Mode Context
- **IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Data loss acceptable** - existing data can be wiped/migrated aggressively
- **Priority: Speed and simplicity** over data preservation
- **Aggressive refactoring allowed** - delete/recreate components as needed

---

## 6. Technical Requirements

### Functional Requirements
- User can click "Preview" button in page editor to see their page rendered with theme
- User can toggle between Desktop, Tablet, and Mobile device sizes
- All 9 section types render with theme styling applied:
  - Hero: Background image, heading, subheading, CTA button
  - Text: Body content with theme typography
  - Image: Image with optional caption
  - Gallery: Grid of images with captions
  - Features: Cards with icons, titles, descriptions
  - CTA: Heading, description, styled button
  - Testimonials: Quote cards with author info
  - Contact: Form fields (display only, non-functional in preview)
  - Footer: Copyright and links
- Sections render in the correct position order
- Theme colors, fonts, and component styles are visually applied

### Non-Functional Requirements
- **Performance:** Preview page loads in <2 seconds
- **Responsive Design:** Device toggle accurately simulates responsive breakpoints
- **Theme Support:** Works with light mode themes (dark mode enhancement deferred)
- **Reusability:** Renderers can be used for public routes in Phase 8

### Technical Constraints
- Must use inline styles for theme application (CSS Variables deferred to Phase 8)
- Must work with existing ThemeData structure from theme generation
- Must use existing section content interfaces from `lib/section-types.ts`
- Must not require theme data transformation - use as-is from database

---

## 7. Data & Database Changes

### Database Schema Changes
**No database changes required for Phase 6.**

Existing schemas provide all needed data:
- `sections` table with `block_type`, `content` (JSONB), `position`
- `themes` table with `data` (JSONB containing ThemeData)
- `pages` table with page metadata
- `sites` table with site context

### Data Model Updates
**No data model changes required.**

New TypeScript utilities will be added but no schema changes.

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns

**No new mutations required.** This phase is read-only (preview/display).

#### Queries Needed (May Already Exist)

- [x] `getSectionsByPage(pageId, userId)` - Already exists in `lib/queries/sections.ts`
- [x] `getActiveTheme(siteId)` - Already exists in `lib/queries/themes.ts`
- [x] `getPageById(pageId, userId)` - Already exists in `lib/queries/pages.ts`
- [x] `getSiteById(siteId, userId)` - Already exists in `lib/queries/sites.ts`

**All needed queries exist - no new backend code required.**

---

## 9. Frontend Changes

### New Components

#### `components/render/` Directory (Section Renderers)

- [ ] **`components/render/PageRenderer.tsx`** - Renders full page with all sections and theme
  - Props: `sections: Section[]`, `theme: ThemeData`
  - Maps sections to appropriate block renderers
  - Applies theme context/wrapper

- [ ] **`components/render/BlockRenderer.tsx`** - Routes to specific block renderer
  - Props: `section: Section`, `theme: ThemeData`
  - Switch on `block_type` to render correct component

- [ ] **`components/render/blocks/HeroBlock.tsx`** - Hero section renderer
  - Background image, heading (theme h1), subheading, CTA button (theme primary)

- [ ] **`components/render/blocks/TextBlock.tsx`** - Text content renderer
  - Body text with theme typography

- [ ] **`components/render/blocks/ImageBlock.tsx`** - Single image renderer
  - Image with optional caption, theme card styling

- [ ] **`components/render/blocks/GalleryBlock.tsx`** - Image grid renderer
  - Responsive grid of images with captions

- [ ] **`components/render/blocks/FeaturesBlock.tsx`** - Features cards renderer
  - Cards with Lucide icons, titles, descriptions

- [ ] **`components/render/blocks/CTABlock.tsx`** - Call-to-action renderer
  - Heading, description, styled button

- [ ] **`components/render/blocks/TestimonialsBlock.tsx`** - Testimonials renderer
  - Quote cards with author, role, avatar

- [ ] **`components/render/blocks/ContactBlock.tsx`** - Contact form display
  - Form fields (display-only, non-functional)

- [ ] **`components/render/blocks/FooterBlock.tsx`** - Footer renderer
  - Copyright text and links

- [ ] **`components/render/index.ts`** - Barrel export

#### `components/render/utilities/` (Theme Utilities)

- [ ] **`components/render/utilities/theme-styles.ts`** - Helper to apply theme styles
  - `getButtonStyles(theme)` - Returns inline styles for buttons
  - `getHeadingStyles(theme, level)` - Returns styles for h1-h4
  - `getBodyStyles(theme)` - Returns body text styles
  - `getCardStyles(theme)` - Returns card container styles

- [ ] **`components/render/utilities/icon-resolver.tsx`** - Resolve Lucide icons by name
  - `renderIcon(iconName: string)` - Returns Lucide icon component

#### `components/preview/` Directory (Preview UI)

- [ ] **`components/preview/PreviewHeader.tsx`** - Header with back button and device toggle
  - Back to editor link
  - Device toggle buttons
  - Current page title

- [ ] **`components/preview/PreviewFrame.tsx`** - Responsive preview container
  - Adjusts width based on device selection
  - Renders PageRenderer inside

- [ ] **`components/preview/DeviceToggle.tsx`** - Device size selector
  - Desktop, Tablet, Mobile buttons with icons
  - Active state highlighting

- [ ] **`components/preview/index.ts`** - Barrel export

### Page Updates

- [ ] **`app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/page.tsx`** - NEW
  - Server Component fetching page, sections, site, active theme
  - Renders PreviewHeader and PreviewFrame

- [ ] **`app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/loading.tsx`** - NEW
  - Loading skeleton for preview page

- [ ] **`app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/error.tsx`** - NEW
  - Error boundary for preview page

### State Management

**Minimal client state needed:**
- Device selection state in PreviewHeader (Desktop/Tablet/Mobile)
- Passed to PreviewFrame to control width

No context providers or complex state management required.

---

## 10. Code Changes Overview

### Current Implementation (Before)

**Preview Route:** Does not exist - clicking Preview button leads to 404

**Section Renderers:** Do not exist - only editor components exist in `components/editor/blocks/`

### After Implementation

#### Preview Route Structure
```
app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/
├── page.tsx      # Server Component - fetches data, renders preview
├── loading.tsx   # Loading skeleton
└── error.tsx     # Error boundary
```

#### Render Components Structure
```
components/render/
├── PageRenderer.tsx           # Full page with all sections
├── BlockRenderer.tsx          # Routes to specific block
├── blocks/
│   ├── HeroBlock.tsx
│   ├── TextBlock.tsx
│   ├── ImageBlock.tsx
│   ├── GalleryBlock.tsx
│   ├── FeaturesBlock.tsx
│   ├── CTABlock.tsx
│   ├── TestimonialsBlock.tsx
│   ├── ContactBlock.tsx
│   └── FooterBlock.tsx
├── utilities/
│   ├── theme-styles.ts        # Inline style generators
│   └── icon-resolver.tsx      # Lucide icon by name
└── index.ts
```

#### Preview Components Structure
```
components/preview/
├── PreviewHeader.tsx          # Back button + device toggle
├── PreviewFrame.tsx           # Responsive container
├── DeviceToggle.tsx           # Device selector buttons
└── index.ts
```

### Key Changes Summary
- [ ] **New Route:** `/app/sites/[siteId]/pages/[pageId]/preview` with page.tsx, loading.tsx, error.tsx
- [ ] **New Components:** 10 block renderers + 3 preview UI components + 2 utilities
- [ ] **Theme Application:** Inline styles applied from ThemeData (following ThemePreview.tsx pattern)
- [ ] **Device Preview:** Width-constrained container with Desktop/Tablet/Mobile options

---

## 11. Implementation Plan

### Phase 0: Rendering Contract Checkpoint (MANDATORY FIRST)
**Goal:** Validate rendering architecture works before building full preview

- [ ] **Task 0.1:** Create test site with page via existing UI
  - Details: Manually create site "Test Site", add page "Test Page"
- [ ] **Task 0.2:** Add one of each section type (9 total)
  - Details: Use BlockPicker to add Hero, Text, Image, Gallery, Features, CTA, Testimonials, Contact, Footer
- [ ] **Task 0.3:** Generate theme using Quick Mode
  - Details: Use ThemeTab to generate a theme with requirements
- [ ] **Task 0.4:** Verify data exists correctly
  - Command: Query database to confirm sections and theme are saved
- [ ] **Task 0.5:** Document checkpoint completion
  - Details: Record site/page/theme IDs for testing preview implementation

### Phase 1: Theme Style Utilities
**Goal:** Create helper functions for applying theme styles inline

- [ ] **Task 1.1:** Create `components/render/utilities/theme-styles.ts`
  - Files: `components/render/utilities/theme-styles.ts`
  - Details: Export functions for button, heading, body, card styles from ThemeData

- [ ] **Task 1.2:** Create `components/render/utilities/icon-resolver.tsx`
  - Files: `components/render/utilities/icon-resolver.tsx`
  - Details: Map icon names to Lucide components, fallback for unknown icons

### Phase 2: Block Renderers (Core)
**Goal:** Create renderer components for all 9 section types

- [ ] **Task 2.1:** Create `HeroBlock.tsx`
  - Files: `components/render/blocks/HeroBlock.tsx`
  - Details: Background image, heading, subheading, CTA button with theme styles

- [ ] **Task 2.2:** Create `TextBlock.tsx`
  - Files: `components/render/blocks/TextBlock.tsx`
  - Details: Body text with theme typography

- [ ] **Task 2.3:** Create `ImageBlock.tsx`
  - Files: `components/render/blocks/ImageBlock.tsx`
  - Details: Responsive image with optional caption

- [ ] **Task 2.4:** Create `GalleryBlock.tsx`
  - Files: `components/render/blocks/GalleryBlock.tsx`
  - Details: Responsive grid of images

- [ ] **Task 2.5:** Create `FeaturesBlock.tsx`
  - Files: `components/render/blocks/FeaturesBlock.tsx`
  - Details: Feature cards with icons using icon-resolver

- [ ] **Task 2.6:** Create `CTABlock.tsx`
  - Files: `components/render/blocks/CTABlock.tsx`
  - Details: CTA section with theme button

- [ ] **Task 2.7:** Create `TestimonialsBlock.tsx`
  - Files: `components/render/blocks/TestimonialsBlock.tsx`
  - Details: Testimonial cards with quote, author, avatar

- [ ] **Task 2.8:** Create `ContactBlock.tsx`
  - Files: `components/render/blocks/ContactBlock.tsx`
  - Details: Display-only form with theme input styles

- [ ] **Task 2.9:** Create `FooterBlock.tsx`
  - Files: `components/render/blocks/FooterBlock.tsx`
  - Details: Copyright and links

### Phase 3: Page Renderer
**Goal:** Create components to render full pages with theme

- [ ] **Task 3.1:** Create `BlockRenderer.tsx`
  - Files: `components/render/BlockRenderer.tsx`
  - Details: Switch on block_type, render appropriate block component

- [ ] **Task 3.2:** Create `PageRenderer.tsx`
  - Files: `components/render/PageRenderer.tsx`
  - Details: Map sections to BlockRenderer, apply theme wrapper styles

- [ ] **Task 3.3:** Create `components/render/index.ts`
  - Files: `components/render/index.ts`
  - Details: Barrel export for all render components

### Phase 4: Preview UI Components
**Goal:** Create preview header and device toggle UI

- [ ] **Task 4.1:** Create `DeviceToggle.tsx`
  - Files: `components/preview/DeviceToggle.tsx`
  - Details: Desktop/Tablet/Mobile toggle buttons with icons

- [ ] **Task 4.2:** Create `PreviewFrame.tsx`
  - Files: `components/preview/PreviewFrame.tsx`
  - Details: Width-constrained container based on device selection

- [ ] **Task 4.3:** Create `PreviewHeader.tsx`
  - Files: `components/preview/PreviewHeader.tsx`
  - Details: Back link, page title, device toggle

- [ ] **Task 4.4:** Create `components/preview/index.ts`
  - Files: `components/preview/index.ts`
  - Details: Barrel export

### Phase 5: Preview Route
**Goal:** Create the preview page route

- [ ] **Task 5.1:** Create preview page
  - Files: `app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/page.tsx`
  - Details: Server Component fetching page, sections, theme

- [ ] **Task 5.2:** Create loading state
  - Files: `app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/loading.tsx`
  - Details: Loading skeleton with device frame

- [ ] **Task 5.3:** Create error boundary
  - Files: `app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/error.tsx`
  - Details: Error state with retry button

### Phase 6: Integration Testing & Validation
**Goal:** Verify all components work together

- [ ] **Task 6.1:** Test with checkpoint site/page/theme
  - Details: Navigate to preview route with test data from Phase 0

- [ ] **Task 6.2:** Verify all 9 block types render
  - Details: Visual inspection of each section type

- [ ] **Task 6.3:** Verify device toggle works
  - Details: Test Desktop (100%), Tablet (768px), Mobile (375px) widths

- [ ] **Task 6.4:** Verify theme application
  - Details: Confirm colors, fonts, component styles match theme data

### Phase 7: Comprehensive Code Review (Mandatory)
**Goal:** Present implementation completion and request thorough code review

- [ ] **Task 7.1:** Present "Implementation Complete!" Message (MANDATORY)
  - Template: Use exact message from section 16, step 7
  - Details: STOP here and wait for user code review approval
- [ ] **Task 7.2:** Execute Comprehensive Code Review (If Approved)
  - Process: Follow step 8 comprehensive review checklist from section 16
  - Details: Read all files, verify requirements, integration testing, provide detailed summary

### Phase 8: User Browser Testing (Only After Code Review)
**Goal:** Request human testing for UI/UX functionality

- [ ] **Task 8.1:** Present AI Testing Results
  - Details: Summary of all automated verification
- [ ] **Task 8.2:** Request User UI Testing
  - Details: Specific browser testing checklist
- [ ] **Task 8.3:** Wait for User Confirmation
  - Details: User verifies preview functionality in browser

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Task Completion Tracking
- [ ] **GET TODAY'S DATE FIRST** - 2025-12-26
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp

---

## 13. File Structure & Organization

### New Files to Create
```
components/
├── render/
│   ├── PageRenderer.tsx
│   ├── BlockRenderer.tsx
│   ├── blocks/
│   │   ├── HeroBlock.tsx
│   │   ├── TextBlock.tsx
│   │   ├── ImageBlock.tsx
│   │   ├── GalleryBlock.tsx
│   │   ├── FeaturesBlock.tsx
│   │   ├── CTABlock.tsx
│   │   ├── TestimonialsBlock.tsx
│   │   ├── ContactBlock.tsx
│   │   └── FooterBlock.tsx
│   ├── utilities/
│   │   ├── theme-styles.ts
│   │   └── icon-resolver.tsx
│   └── index.ts
├── preview/
│   ├── PreviewHeader.tsx
│   ├── PreviewFrame.tsx
│   ├── DeviceToggle.tsx
│   └── index.ts
app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/
├── page.tsx
├── loading.tsx
└── error.tsx
```

### Files to Modify
None - this phase is additive only.

### Dependencies to Add
None - all needed dependencies (Lucide icons, shadcn/ui) already installed.

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Error Scenario 1:** Missing theme data
  - **Code Review Focus:** PageRenderer handling of null/undefined theme
  - **Potential Fix:** Show fallback with default styling, display message

- [ ] **Error Scenario 2:** Invalid section content JSON
  - **Code Review Focus:** Block renderers accessing content properties
  - **Potential Fix:** Type guards and fallback rendering

- [ ] **Error Scenario 3:** Missing Lucide icon name
  - **Code Review Focus:** icon-resolver fallback behavior
  - **Potential Fix:** Return default icon (e.g., Star) for unknown names

### Edge Cases to Consider
- [ ] **Edge Case 1:** Page with zero sections
  - **Analysis:** PageRenderer should show empty state
  - **Recommendation:** "No sections added yet" message

- [ ] **Edge Case 2:** Very long content (text block with 10000 chars)
  - **Analysis:** Text should wrap properly
  - **Recommendation:** Use prose classes with line-clamp if needed

### Security & Access Control Review
- [x] **Authentication:** Preview route is in `(protected)` group, requires auth
- [x] **Authorization:** Page query uses userId for ownership check
- [x] **Data Exposure:** Only user's own pages accessible

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach - CRITICAL WORKFLOW

Follow the phase-by-phase implementation as defined in Section 11.

**Phase 0 (Checkpoint) is MANDATORY** - must be completed before proceeding.

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use inline styles for theme application (following ThemePreview.tsx pattern)
- [ ] Ensure responsive design for all block renderers
- [ ] Use proper TypeScript types from existing section-types.ts and theme-types.ts
- [ ] Handle loading/error states appropriately

### Architecture Compliance
- [ ] Renderers should be stateless (receive props, render output)
- [ ] Device toggle is the only client-side state needed
- [ ] Server Component for page.tsx (data fetching)
- [ ] Client Component for PreviewHeader (device toggle state)

---

## 17. Notes & Additional Context

### Research Links
- Existing ThemePreview.tsx pattern: `components/theme/ThemePreview.tsx`
- Section types: `lib/section-types.ts`
- Theme types: `lib/drizzle/schema/theme-types.ts`
- Existing block editors (for content structure reference): `components/editor/blocks/`

### Reference for Inline Styles Pattern
From `ThemePreview.tsx`:
```typescript
<p
  style={{
    fontFamily: typography.headingFont.family,
    fontSize: typography.scale.h3,
    lineHeight: typography.lineHeights.tight,
    color: colors.foreground,
  }}
>
```

### Device Preview Widths
- **Desktop:** 100% (full container width)
- **Tablet:** 768px (centered with border)
- **Mobile:** 375px (centered with border)

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment Framework

#### 1. Breaking Changes Analysis
- [x] **Existing API Contracts:** No changes - read-only additions
- [x] **Database Dependencies:** No changes - using existing schemas
- [x] **Component Dependencies:** New components, no changes to existing
- [x] **Authentication/Authorization:** Uses existing auth patterns

#### 2. Ripple Effects Assessment
- [x] **Data Flow Impact:** None - using existing query patterns
- [x] **UI/UX Cascading Effects:** Preview button will now work (positive)
- [x] **State Management:** Minimal state (device toggle only)
- [x] **Routing Dependencies:** New route, no changes to existing

#### 3. Performance Implications
- [ ] **Database Query Impact:** Similar to page editor - should be fast
- [x] **Bundle Size:** ~15-20KB for new components (acceptable)
- [x] **Server Load:** Similar to page editor loads

#### 4. Security Considerations
- [x] **Attack Surface:** No new attack vectors
- [x] **Data Exposure:** Protected route with ownership check
- [x] **Permission Boundaries:** Follows existing patterns

### Critical Issues Identification

**No red flags identified.** This is additive, read-only functionality.

---

## 19. Phase 5 Deferred Items (For Future Reference)

The following Phase 5 items were deferred per user decision:

### Guided Generate Mode (Deferred)
- `trigger/tasks/generate-color-palette.ts`
- `trigger/tasks/generate-typography.ts`
- `trigger/tasks/generate-component-styles.ts`
- `trigger/tasks/finalize-theme.ts`
- `approveStageAndContinue()` and `regenerateStage()` server actions
- `ColorReview.tsx`, `TypographyReview.tsx`, `ComponentPreview.tsx` UI components

### Manual Adjustment Controls (Deferred)
- Color pickers in ThemeTab
- Font dropdowns for manual selection

**These will be addressed in a future phase after Phase 6 is complete.**

---

*Task Version: 1.0*
*Created: 2025-12-26*
*Phase: 6 (Page Preview)*
