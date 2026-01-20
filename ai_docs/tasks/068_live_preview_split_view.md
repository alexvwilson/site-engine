# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Live Preview Split View Mode for Page Editor

### Goal Statement
**Goal:** Transform the page editor from a single-column list with a separate preview route into a modern split-view interface where users can edit sections on the left while seeing real-time preview updates on the right. This eliminates the need to navigate between pages and provides immediate visual feedback during editing.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - the approach is clearly defined in the backlog and user has confirmed full feature implementation.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Authentication:** Supabase Auth managed by `middleware.ts`
- **Key Architectural Patterns:** Next.js App Router, Server Components for data fetching, Server Actions for mutations

### Current State
The page editor currently has two separate routes:
1. **Editor Page** (`/app/sites/[siteId]/pages/[pageId]`) - Single-column list of collapsible section cards with SectionsList component
2. **Preview Page** (`/app/sites/[siteId]/pages/[pageId]/preview`) - Full preview with device/color mode toggles

Users must navigate between these pages to see how edits look. The PreviewFrame component already handles device sizing (desktop/tablet/mobile) and color mode (light/dark), but requires separate navigation.

### Existing Codebase Analysis

**Relevant Files Analyzed:**

- [x] **Page Editor** (`app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx`)
  - Server component fetching site, page, sections
  - Renders EditorHeader, SectionsList, BlockPicker, LayoutSuggestionModal
  - Single column layout with max-w-4xl container

- [x] **Preview Page** (`app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/page.tsx`)
  - Fetches sections + active theme + handles header/footer merging
  - Renders PreviewHeader + PreviewFrame

- [x] **PreviewFrame** (`components/preview/PreviewFrame.tsx`)
  - Client component with device toggle and color mode toggle
  - Generates scoped CSS variables for theme
  - Renders sections via PreviewBlockRenderer
  - Already handles header/footer separately from content sections

- [x] **SectionsList** (`components/editor/SectionsList.tsx`)
  - Client component with drag-drop via @dnd-kit
  - Maps sections to SectionCard components
  - Has InsertionPoint components between sections

- [x] **EditorHeader** (`components/editor/EditorHeader.tsx`)
  - Shows page title (editable), status badge, Preview link, Publish button
  - Preview button currently links to separate preview route

---

## 4. Context & Problem Definition

### Problem Statement
The current editor requires users to navigate to a separate `/preview` route to see how their page looks. This creates friction in the editing workflow:
- Users lose context when switching between pages
- No way to see edits reflected in real-time
- Extra clicks and page loads slow down the design process
- Modern page builders (Webflow, Squarespace, Wix) all provide side-by-side editing

### Success Criteria
- [x] Split view layout: editor panel (left) + live preview (right)
- [x] Three view modes: "Builder" (editor only), "Preview" (preview only), "Split" (both)
- [x] Preview updates immediately as content is edited (already have auto-save)
- [x] Device toggle (desktop/tablet/mobile) in split and preview modes
- [x] Color mode toggle (light/dark) in split and preview modes
- [x] Responsive: collapse to single pane on screens < 1024px
- [x] View mode preference persisted in localStorage
- [x] Keyboard shortcut to toggle view modes

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Priority: Speed and simplicity** over data preservation
- **Aggressive refactoring allowed** - delete/recreate components as needed

---

## 6. Technical Requirements

### Functional Requirements
- User can toggle between Builder, Split, and Preview view modes
- In Split mode, editor panel takes ~40% width, preview takes ~60%
- Preview renders the same output as the current preview page
- Section edits trigger immediate preview refresh (via router.refresh or revalidation)
- Device and color mode toggles available in Split and Preview modes
- View mode preference saved to localStorage and restored on page load
- On screens < 1024px, only Builder or Preview modes available (no split)

### Non-Functional Requirements
- **Performance:** Preview should update within 500ms of auto-save completing
- **Usability:** View mode toggle should be prominent and easy to understand
- **Responsive Design:** Must work on mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Theme Support:** Preview must support both light and dark mode themes

### Technical Constraints
- Must fetch theme data on the server (combine editor and preview data fetching)
- PreviewFrame is a client component - sections data passed as props
- Must maintain drag-drop functionality in editor panel
- Header/footer merging logic must be included for accurate preview

---

## 7. Data & Database Changes

### Database Schema Changes
No database changes required.

### Data Model Updates
No data model changes required.

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
The page editor will need to fetch additional data that was previously only fetched on the preview page:
- Active theme for the site
- Site-level header/footer content

**Changes to page editor server component:**
- Add `getActiveTheme(siteId)` query
- Access `site.header_content` and `site.footer_content`
- Apply header/footer merging logic (already exists in `lib/header-footer-utils.ts`)

---

## 9. Frontend Changes

### New Components

- [x] **`components/editor/EditorLayout.tsx`** - Main layout component that manages view mode state and renders the split/single pane layout
- [x] **`components/editor/ViewModeToggle.tsx`** - Toggle button group for Builder/Split/Preview modes
- [x] **`components/editor/EditorPreviewPane.tsx`** - Wrapper for PreviewFrame in the editor context (handles data flow)

### Component Modifications

- [x] **`app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx`** - Fetch theme + header/footer, render EditorLayout
- [x] **`components/editor/EditorHeader.tsx`** - Replace Preview link with ViewModeToggle, add device/color toggles
- [x] **`components/preview/PreviewFrame.tsx`** - Make device/color toggles optional (controlled externally in split mode)

### State Management
- View mode state: managed in EditorLayout (client component)
- Device type state: lifted to EditorHeader for shared control
- Color mode state: lifted to EditorHeader for shared control
- localStorage persistence: `editor-view-mode` key

### Context Usage Strategy
No new contexts needed. Data flows from server component → EditorLayout → child components via props.

---

## 10. Code Changes Overview

### Current Implementation (Before)

**Page Editor Page (simplified):**
```tsx
// app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx
export default async function PageEditorPage({ params }) {
  const [site, page] = await Promise.all([getSiteById(), getPageById()]);
  const sections = await getSectionsByPage(pageId);

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs />
      <EditorHeader page={page} siteId={siteId} />
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <SectionsList sections={sections} pageId={pageId} siteId={siteId} />
          <div className="mt-6 flex justify-center gap-3">
            <LayoutSuggestionModal />
            <BlockPicker />
          </div>
        </div>
      </div>
    </div>
  );
}
```

**EditorHeader (Preview as link):**
```tsx
<Button variant="outline" size="sm" asChild>
  <Link href={`/app/sites/${siteId}/pages/${page.id}/preview`}>
    <Eye className="h-4 w-4 mr-2" />
    Preview
  </Link>
</Button>
```

### After Refactor

**Page Editor Page (with split view data):**
```tsx
// app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx
export default async function PageEditorPage({ params }) {
  const [site, page] = await Promise.all([getSiteById(), getPageById()]);
  const [allSections, activeTheme] = await Promise.all([
    getSectionsByPage(pageId),
    getActiveTheme(siteId),
  ]);

  // Header/footer merging (from preview page logic)
  const siteHeader = site.header_content as HeaderContent | null;
  const siteFooter = site.footer_content as FooterContent | null;
  const pageHeaderSection = allSections.find((s) => s.block_type === "header");
  const pageFooterSection = allSections.find((s) => s.block_type === "footer");
  const finalHeader = siteHeader ? mergeHeaderContent(siteHeader, pageHeaderSection?.content) : pageHeaderSection?.content;
  const finalFooter = siteFooter ? mergeFooterContent(siteFooter, pageFooterSection?.content) : pageFooterSection?.content;
  const sections = allSections.filter((s) => s.block_type !== "header" && s.block_type !== "footer");

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs />
      <EditorLayout
        page={page}
        siteId={siteId}
        sections={allSections}
        previewSections={sections}
        theme={activeTheme?.data ?? null}
        siteHeader={finalHeader}
        siteFooter={finalFooter}
      />
    </div>
  );
}
```

**EditorLayout (new component):**
```tsx
// components/editor/EditorLayout.tsx
"use client";

export type ViewMode = "builder" | "split" | "preview";

export function EditorLayout({ page, siteId, sections, previewSections, theme, siteHeader, siteFooter }) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("editor-view-mode") as ViewMode) || "split";
    }
    return "split";
  });
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [colorMode, setColorMode] = useState<PreviewColorMode>("light");

  // Persist view mode
  useEffect(() => {
    localStorage.setItem("editor-view-mode", viewMode);
  }, [viewMode]);

  // Responsive: force builder/preview only on small screens
  const isSmallScreen = useMediaQuery("(max-width: 1023px)");
  const effectiveViewMode = isSmallScreen && viewMode === "split" ? "builder" : viewMode;

  return (
    <>
      <EditorHeader
        page={page}
        siteId={siteId}
        viewMode={effectiveViewMode}
        onViewModeChange={setViewMode}
        device={device}
        onDeviceChange={setDevice}
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        showDeviceControls={effectiveViewMode !== "builder"}
      />
      <div className="flex-1 flex overflow-hidden">
        {effectiveViewMode !== "preview" && (
          <div className={cn(
            "overflow-auto border-r",
            effectiveViewMode === "split" ? "w-[40%]" : "w-full"
          )}>
            <div className="container max-w-4xl mx-auto px-4 py-8">
              <SectionsList sections={sections} pageId={page.id} siteId={siteId} />
              <div className="mt-6 flex justify-center gap-3">
                <LayoutSuggestionModal pageId={page.id} siteId={siteId} />
                <BlockPicker pageId={page.id} siteId={siteId} />
              </div>
            </div>
          </div>
        )}
        {effectiveViewMode !== "builder" && (
          <div className={cn(
            "overflow-hidden bg-muted/30",
            effectiveViewMode === "split" ? "w-[60%]" : "w-full"
          )}>
            <PreviewFrame
              sections={previewSections}
              theme={theme}
              siteHeader={siteHeader}
              siteFooter={siteFooter}
              device={device}
              colorMode={colorMode}
              hideControls={true}
            />
          </div>
        )}
      </div>
    </>
  );
}
```

### Key Changes Summary
- [x] **Change 1:** Page editor fetches theme + header/footer data (previously only preview page did this)
- [x] **Change 2:** New EditorLayout client component manages view mode state and renders split panes
- [x] **Change 3:** EditorHeader gains ViewModeToggle and device/color controls
- [x] **Change 4:** PreviewFrame accepts external device/colorMode props with `hideControls` option
- [x] **Files Modified:** 4 files (page.tsx, EditorHeader.tsx, PreviewFrame.tsx, + new EditorLayout.tsx)
- [x] **Impact:** Editor becomes a single-page experience with real-time preview

---

## 11. Implementation Plan

### Phase 1: Data Fetching Updates
**Goal:** Update page editor to fetch all data needed for preview

- [x] **Task 1.1:** Update page editor server component ✓ 2026-01-20
  - Files: `app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx`
  - Details: Added getActiveTheme query, header/footer merging logic from preview page

### Phase 2: Create EditorLayout Component
**Goal:** Build the main layout component that manages view mode and split panes

- [x] **Task 2.1:** Create EditorLayout component ✓ 2026-01-20
  - Files: `components/editor/EditorLayout.tsx` (~140 lines)
  - Details: View mode state, localStorage persistence, responsive handling, split pane layout, keyboard shortcut

- [x] **Task 2.2:** Create ViewModeToggle component ✓ 2026-01-20
  - Files: `components/editor/ViewModeToggle.tsx` (~55 lines)
  - Details: Toggle button group for Builder/Split/Preview with icons and tooltips

- [x] **Task 2.3:** Create useMediaQuery hook ✓ 2026-01-20
  - Files: `hooks/useMediaQuery.ts` (~25 lines)
  - Details: Generic hook to detect any CSS media query match

- [x] **Task 2.4:** Add shadcn toggle-group component ✓ 2026-01-20
  - Files: `components/ui/toggle.tsx`, `components/ui/toggle-group.tsx`
  - Details: Added via `npx shadcn@latest add toggle-group`

### Phase 3: Update Existing Components
**Goal:** Modify EditorHeader and PreviewFrame to work with new layout

- [x] **Task 3.1:** Update EditorHeader ✓ 2026-01-20
  - Files: `components/editor/EditorHeader.tsx`
  - Details: Added ViewModeToggle, device/color toggles, new props for external control

- [x] **Task 3.2:** Update PreviewFrame for external control ✓ 2026-01-20
  - Files: `components/preview/PreviewFrame.tsx`
  - Details: Accept device/colorMode as props, add hideControls prop, internal state as fallback

### Phase 4: Integration & Testing
**Goal:** Wire everything together and verify functionality

- [x] **Task 4.1:** Update page.tsx to use EditorLayout ✓ 2026-01-20
  - Files: `app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx`
  - Details: Pass all required props to EditorLayout

- [x] **Task 4.2:** Add keyboard shortcut for view mode toggle ✓ 2026-01-20
  - Files: `components/editor/EditorLayout.tsx`
  - Details: Cmd/Ctrl+Shift+P to cycle through view modes (included in EditorLayout)

- [x] **Task 4.3:** Verify type checking passes ✓ 2026-01-20
  - Details: `npm run type-check` passes with no errors

### Phase 5: Comprehensive Code Review (Mandatory)
**Goal:** Present implementation completion and request thorough code review

- [ ] **Task 5.1:** Present "Implementation Complete!" Message (MANDATORY)
- [ ] **Task 5.2:** Execute Comprehensive Code Review (If Approved)

### Phase 6: User Browser Testing (Only After Code Review)
**Goal:** Request human testing for UI/UX functionality

- [ ] **Task 6.1:** Present AI Testing Results
- [ ] **Task 6.2:** Request User UI Testing
- [ ] **Task 6.3:** Wait for User Confirmation

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Task Completion Tracking - MANDATORY WORKFLOW
- [x] **GET TODAY'S DATE FIRST** - 2026-01-20
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes, etc.)

---

## 13. File Structure & Organization

### New Files to Create
```
components/editor/
├── EditorLayout.tsx        # Main split view layout with view mode state
└── ViewModeToggle.tsx      # Toggle button group for view modes

hooks/
└── useMediaQuery.ts        # Responsive breakpoint detection (if not exists)
```

### Files to Modify
- [ ] **`app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx`** - Add theme/header/footer fetching, use EditorLayout
- [ ] **`components/editor/EditorHeader.tsx`** - Add ViewModeToggle, device/color controls
- [ ] **`components/preview/PreviewFrame.tsx`** - Accept external device/colorMode props, hideControls option

### Dependencies to Add
None - using existing dependencies.

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Error Scenario 1:** Theme not yet generated
  - **Code Review Focus:** PreviewFrame already handles null theme with "No Active Theme" message
  - **Potential Fix:** Display in preview pane, allow editing in builder pane

- [ ] **Error Scenario 2:** Large number of sections causes performance issues
  - **Code Review Focus:** React rendering, dnd-kit performance
  - **Potential Fix:** Virtualization if needed (unlikely for typical page sizes)

### Edge Cases to Consider
- [ ] **Edge Case 1:** User resizes window across 1024px breakpoint
  - **Analysis Approach:** useMediaQuery should detect and switch view modes
  - **Recommendation:** Smooth transition, persist user preference for when they return to large screen

- [ ] **Edge Case 2:** User on exactly 1024px width
  - **Analysis Approach:** Test breakpoint boundary
  - **Recommendation:** Use `min-width: 1024px` for split mode

### Security & Access Control Review
- [ ] **Authentication:** Page already requires authentication via `requireUserId()`
- [ ] **Authorization:** Site/page ownership verified in existing queries

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach - CRITICAL WORKFLOW

1. **Follow phases sequentially** - Complete each phase before moving to next
2. **Update task document** after each completed task with timestamp
3. **Run linting** on each modified file
4. **Do NOT run dev server** - user already has it running

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for cleaner code
- [ ] Use async/await instead of .then() chaining
- [ ] Ensure responsive design with Tailwind breakpoints

---

## 17. Notes & Additional Context

### Design Decisions

**View Mode Toggle Design:**
- Three modes: Builder (pencil icon), Split (columns icon), Preview (eye icon)
- Segmented button group style (similar to shadcn ToggleGroup)
- Active mode highlighted with primary color

**Split Ratio:**
- 40% editor / 60% preview chosen for optimal balance
- Editor needs enough space for form fields
- Preview needs more space to show realistic page layout

**Preview Refresh Strategy:**
- Existing auto-save already calls `revalidatePath()` which triggers refresh
- Preview pane will update automatically when server revalidates

### Reference
- Backlog item: #68 Live Preview Split View Mode
- Prerequisites: None
- Dependent features: #69 Section Selection & Highlighting, #71 Inspector Panel

---

*Template Version: 1.0*
*Task Created: 2026-01-20*
*Backlog Reference: #68*
