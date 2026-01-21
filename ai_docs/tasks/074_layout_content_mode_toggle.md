# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Layout vs Content Mode Toggle in Inspector Panel

### Goal Statement
**Goal:** Add a toggle switch in the Content tab of the Inspector Panel that allows users to switch between "Content" mode (showing only content-specific fields like text, headings, items) and "Layout" mode (showing only styling/design fields like borders, backgrounds, typography). This improves editor UX by reducing visual clutter and letting users focus on one aspect at a time.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
This is a straightforward enhancement with a clear implementation path. Strategic analysis is minimal since the approach is well-defined.

### Problem Context
The Inspector Panel currently shows all editing fields at once - both content fields (text, headings, feature items) and styling fields (borders, backgrounds, typography). For complex blocks like Hero or Features, this creates long scrolling lists that can overwhelm users. A simple toggle to switch modes would help users focus.

### Solution Options Analysis

#### Option 1: Mode Toggle in Content Tab Header
**Approach:** Add a segmented toggle control (`Content | Layout`) in the Content tab header area, above the block editor content. The toggle state determines which fields the editor renders.

**Pros:**
- Quick to implement - single state variable
- Uses existing `mode` prop pattern already in some editors
- Keeps Design tab intact for future Phase 4 work
- Persists mode selection per session via localStorage

**Cons:**
- Requires modifying 10+ block editors to conditionally render
- Some blocks have minimal styling (header/footer) - toggle may feel unnecessary

**Implementation Complexity:** Medium - ~1 day
**Risk Level:** Low - purely additive, no breaking changes

#### Option 2: Populate Design Tab Instead
**Approach:** Move all StylingControls usage into the Design tab, keeping Content tab pure.

**Pros:**
- Cleaner separation - Content tab is content only
- Design tab becomes useful immediately

**Cons:**
- Major refactor - need to extract styling from all 18 editors
- Changes established patterns users may already understand
- Higher complexity and risk

**Implementation Complexity:** High - 3-5 days
**Risk Level:** Medium - changes user expectations

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 1 - Mode Toggle in Content Tab Header

**Why this is the best choice:**
1. **Quick implementation** - Can be done in 1 day with low risk
2. **Non-breaking** - Adds capability without removing existing functionality
3. **User-friendly** - Users can toggle as needed; default to "All" shows current behavior
4. **Foundation for Phase 4** - Design tab consolidation can still happen later

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State
- InspectorPanel has 3 tabs: Content, Design (placeholder), Advanced
- ContentTab routes to 18 block editors based on `block_type`
- Block editors use `StylingControls` component for styling options
- Design tab shows "Coming Soon" placeholder message
- No mode toggle exists currently

### Existing Codebase Analysis

**Analyzed Areas:**
- [x] **Inspector Panel Structure** (`components/editor/InspectorPanel.tsx`)
- [x] **Content Tab Routing** (`components/editor/inspector/ContentTab.tsx`)
- [x] **Design Tab Placeholder** (`components/editor/inspector/DesignTab.tsx`)
- [x] **StylingControls Component** (`components/editor/StylingControls.tsx`)
- [x] **Block Editors** (`components/editor/blocks/*.tsx`)

**Key Findings:**
- ContentTab passes `content`, `onChange`, `disabled`, `siteId` to editors
- Editors mix content and styling fields within single components
- StylingControls is a reusable component used by most editors
- TextEditor is the simplest example: TiptapEditor + StylingControls
- FeaturesEditor is more complex: section header + item list + StylingControls

---

## 4. Context & Problem Definition

### Problem Statement
Users editing sections in the Inspector Panel see all fields at once - both content (text, headings, items) and styling (borders, backgrounds, colors). For blocks with extensive options, this creates visual clutter and long scroll distances. Users want to focus on either content OR layout without distraction.

### Success Criteria
- [x] Mode toggle appears in Content tab header
- [x] Toggle has 3 states: "All" (default), "Content", "Layout"
- [x] Content mode shows only text/item fields, hides StylingControls
- [x] Layout mode shows only StylingControls section
- [x] All mode shows everything (current behavior)
- [x] Mode preference persists in localStorage
- [x] Works across all 18 block types
- [x] Smooth UX with no layout jumping

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can toggle between "All", "Content", and "Layout" modes in inspector
- Toggle state is remembered per session (localStorage)
- Content mode hides the StylingControls collapsible section
- Layout mode shows only the StylingControls section
- All mode shows both (default, current behavior)
- Toggle resets to "All" when switching between sections

### Non-Functional Requirements
- **Performance:** Instant toggle, no re-renders
- **Usability:** Clear visual indication of current mode
- **Responsive Design:** Works in inspector panel width (~300px)

### Technical Constraints
- Must work with existing ContentTab routing pattern
- Cannot change the public props interface of block editors (would break existing usage)
- Must preserve undo/redo functionality

---

## 7. Data & Database Changes

### Database Schema Changes
None required - this is purely a UI enhancement.

### Data Model Updates
None required.

---

## 8. Backend Changes & Background Jobs

None required - this is purely a frontend UI change.

---

## 9. Frontend Changes

### New Components
- [ ] **`components/editor/inspector/EditorModeToggle.tsx`** - Segmented toggle control for All/Content/Layout modes

### Component Modifications
- [ ] **`components/editor/inspector/ContentTab.tsx`** - Add mode prop, pass to editors
- [ ] **`components/editor/InspectorPanel.tsx`** - Add mode state, localStorage persistence
- [ ] **Block editors** - Accept `editorMode` prop, conditionally render content/styling

### State Management
- Mode state lives in InspectorPanel
- Passed through ContentTab to individual editors
- Persisted in localStorage as `editor-mode-preference`
- **CONFIRMED:** Persists across section changes (user can stay in "Content" mode while clicking different sections)

### Context Usage Strategy
No new contexts needed. Mode state is local to InspectorPanel and passed as props.

---

## 10. Code Changes Overview

### Current Implementation (Before)

```tsx
// ContentTab.tsx - passes all props to editor, no mode filtering
export function ContentTab({ section, content, onChange, siteId, disabled }) {
  switch (section.block_type) {
    case "text":
      return <TextEditor content={content} onChange={onChange} ... />;
  }
}

// TextEditor.tsx - renders both content AND styling
export function TextEditor({ content, onChange, disabled, siteId }) {
  return (
    <div className="space-y-6">
      {/* Content Editor */}
      <div className="space-y-2">
        <Label>Content</Label>
        <TiptapEditor value={content.body} onChange={handleBodyChange} />
      </div>

      {/* Styling Section - always visible */}
      <StylingControls content={content} onChange={onChange} ... />
    </div>
  );
}
```

### After Refactor

```tsx
// EditorModeToggle.tsx - new component
export type EditorMode = "all" | "content" | "layout";

export function EditorModeToggle({ mode, onChange }: {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
}) {
  return (
    <ToggleGroup type="single" value={mode} onValueChange={onChange}>
      <ToggleGroupItem value="all">All</ToggleGroupItem>
      <ToggleGroupItem value="content">Content</ToggleGroupItem>
      <ToggleGroupItem value="layout">Layout</ToggleGroupItem>
    </ToggleGroup>
  );
}

// ContentTab.tsx - passes editorMode to editors
interface ContentTabProps {
  editorMode: EditorMode;  // New prop
  // ... existing props
}

export function ContentTab({ section, content, onChange, siteId, disabled, editorMode }) {
  switch (section.block_type) {
    case "text":
      return <TextEditor content={content} onChange={onChange} editorMode={editorMode} ... />;
  }
}

// TextEditor.tsx - conditionally renders based on mode
export function TextEditor({ content, onChange, disabled, siteId, editorMode = "all" }) {
  const showContent = editorMode === "all" || editorMode === "content";
  const showLayout = editorMode === "all" || editorMode === "layout";

  return (
    <div className="space-y-6">
      {/* Content Editor - conditional */}
      {showContent && (
        <div className="space-y-2">
          <Label>Content</Label>
          <TiptapEditor value={content.body} onChange={handleBodyChange} />
        </div>
      )}

      {/* Styling Section - conditional */}
      {showLayout && (
        <StylingControls content={content} onChange={onChange} ... />
      )}
    </div>
  );
}
```

### Key Changes Summary
- [ ] **New EditorModeToggle component** - 3-state segmented control
- [ ] **InspectorPanel** - Add mode state, localStorage, render toggle in header
- [ ] **ContentTab** - Accept and pass `editorMode` prop
- [ ] **18 block editors** - Accept `editorMode` prop, conditional rendering
- [ ] **Files Modified:** ~20 files total
- [ ] **Impact:** UI-only, no data changes

---

## 11. Implementation Plan

### Phase 1: Create Mode Toggle Component
**Goal:** Build the reusable toggle component

- [ ] **Task 1.1:** Create EditorModeToggle component
  - Files: `components/editor/inspector/EditorModeToggle.tsx`
  - Details: ToggleGroup with "All", "Content", "Layout" options

### Phase 2: Integrate Toggle into Inspector
**Goal:** Add mode state and toggle UI to InspectorPanel

- [ ] **Task 2.1:** Add mode state to InspectorPanel
  - Files: `components/editor/InspectorPanel.tsx`
  - Details: useState + localStorage persistence
- [ ] **Task 2.2:** Render EditorModeToggle in Content tab header area
  - Files: `components/editor/InspectorPanel.tsx`
  - Details: **CONFIRMED:** Position toggle below undo/redo buttons, always visible in header area (not inside scrollable content)
- [ ] **Task 2.3:** Pass editorMode to ContentTab
  - Files: `components/editor/inspector/ContentTab.tsx`
  - Details: Add editorMode prop, pass to all editor components

### Phase 3: Update Block Editors
**Goal:** Make editors respect the mode prop

- [ ] **Task 3.1:** Update simple editors (TextEditor, MarkdownEditor, HeadingEditor)
  - Files: `components/editor/blocks/TextEditor.tsx`, `MarkdownEditor.tsx`, `HeadingEditor.tsx`
  - Details: Add editorMode prop, wrap content/styling in conditionals
- [ ] **Task 3.2:** Update medium editors (FeaturesEditor, CTAEditor, TestimonialsEditor, ContactEditor)
  - Files: `components/editor/blocks/FeaturesEditor.tsx`, `CTAEditor.tsx`, etc.
  - Details: Same pattern - conditional content/styling sections
- [ ] **Task 3.3:** Update complex editors (HeroEditor, ImageEditor, GalleryEditor)
  - Files: `components/editor/blocks/HeroEditor.tsx`, `ImageEditor.tsx`, `GalleryEditor.tsx`
  - Details: May need more careful separation of content vs layout fields
- [ ] **Task 3.4:** Update remaining editors (Header, Footer, Blog, Embed, Social, Product, Article)
  - Files: All remaining editors
  - Details: Complete coverage of all 18 block types

### Phase 4: Testing & Polish
**Goal:** Verify functionality across all block types

- [ ] **Task 4.1:** Test each block type with all 3 modes
  - Details: Verify correct fields show/hide per mode
- [ ] **Task 4.2:** Test localStorage persistence
  - Details: Mode should persist across page reloads
- [ ] **Task 4.3:** Test with undo/redo
  - Details: Ensure mode toggle doesn't affect history
- [ ] **Task 4.4:** Run linting and type checking
  - Command: `npm run lint && npm run type-check`

### Phase 5: Code Review
**Goal:** Comprehensive review of all changes

- [ ] **Task 5.1:** Present "Implementation Complete!" message
- [ ] **Task 5.2:** Execute comprehensive code review

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** - Use time tool before adding timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp

---

## 13. File Structure & Organization

### New Files to Create
```
components/editor/inspector/EditorModeToggle.tsx  # New toggle component
```

### Files to Modify
- `components/editor/InspectorPanel.tsx` - Add mode state, toggle UI
- `components/editor/inspector/ContentTab.tsx` - Add editorMode prop
- `components/editor/blocks/TextEditor.tsx`
- `components/editor/blocks/MarkdownEditor.tsx`
- `components/editor/blocks/HeadingEditor.tsx`
- `components/editor/blocks/FeaturesEditor.tsx`
- `components/editor/blocks/CTAEditor.tsx`
- `components/editor/blocks/TestimonialsEditor.tsx`
- `components/editor/blocks/ContactEditor.tsx`
- `components/editor/blocks/HeroEditor.tsx`
- `components/editor/blocks/ImageEditor.tsx`
- `components/editor/blocks/GalleryEditor.tsx`
- `components/editor/blocks/HeaderEditor.tsx`
- `components/editor/blocks/FooterEditor.tsx`
- `components/editor/blocks/EmbedEditor.tsx`
- `components/editor/blocks/SocialLinksEditor.tsx`
- `components/editor/blocks/ProductGridEditor.tsx`
- `components/editor/blocks/ArticleEditor.tsx`
- `components/editor/BlogFeaturedEditor.tsx`
- `components/editor/BlogGridEditor.tsx`

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Editors without styling options** - HeaderEditor, FooterEditor may have no StylingControls
  - **Code Review Focus:** Check which editors actually use StylingControls
  - **Potential Fix:** Only show toggle if block has styling options

### Edge Cases to Consider
- [ ] **Block types with mixed fields** - HeroEditor has image positioning which could be "content" or "layout"
  - **Analysis Approach:** Decide what counts as "layout" vs "content" per block
  - **Recommendation:** Image source/URL = content; image sizing/borders = layout

### Security & Access Control Review
No security implications - this is UI state management only.

---

## 15. Deployment & Configuration

### Environment Variables
None required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Create the EditorModeToggle component first
2. Integrate into InspectorPanel with state management
3. Update editors one by one, starting with simplest (TextEditor)
4. Test as you go - verify each editor before moving to next
5. Run lint/type-check after each phase

### Code Quality Standards
- Use TypeScript types for EditorMode
- Keep conditional rendering clean with helper booleans
- Don't break existing editor functionality
- Ensure mode defaults to "all" for backwards compatibility

---

## 17. Notes & Additional Context

### Definition of "Content" vs "Layout" Fields

**Content Fields (show in Content mode):**
- Text/body fields (TiptapEditor, Textarea for markdown)
- Title, subtitle, heading fields
- Item arrays (features, testimonials, etc.)
- Links/URLs for navigation
- Image sources (what image, not how displayed)

**Layout Fields (show in Layout mode):**
- StylingControls component (entire thing)
- Image sizing, positioning, borders
- Typography options (text size, color mode)
- Section backgrounds and overlays
- Grid columns, gaps, alignment

**Ambiguous (keep in Content for now):**
- Button variant selection (primary/secondary)
- Icon selection
- Show/hide toggles for optional fields

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **Existing API Contracts:** None - adding optional prop with default
- [ ] **Component Dependencies:** Editors gain optional prop, default preserves behavior

### Ripple Effects Assessment
- [ ] **UI/UX Cascading Effects:** Users may need to learn new toggle
- [ ] **State Management:** New localStorage key added

### User Experience Impacts
- [ ] **Workflow Disruption:** Minimal - default "All" shows current behavior
- [ ] **Learning Curve:** Toggle is self-explanatory

### Mitigation Strategies
- Default to "All" mode so nothing changes for users who don't use toggle
- Clear labels on toggle options

---

*Template Version: 1.0*
*Task Document Created: 2026-01-20*
