# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Inspector Panel for Section Editing

### Goal Statement
**Goal:** Transform the section editing experience from inline accordion cards to a dedicated right-side inspector panel. When a section is selected (via click in preview or section list), the inspector panel shows its editable properties organized into Content, Design, and Advanced tabs. This creates a professional editing experience similar to Figma, Webflow, or Framer.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**SKIP STRATEGIC ANALYSIS** - User has already specified the approach:
- Right-side inspector panel
- Content / Design / Advanced tab structure
- Builds on completed #68 (Split View) and #69 (Section Selection)

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **State Management:** React Context (EditorSelectionContext)

### Current State
The page editor currently has:
- **Split view layout** (#68): Editor panel (40%) + Preview panel (60%)
- **Section selection** (#69): Click sections in preview to select, hover highlighting
- **Inline editing**: SectionCard components expand to show block editors inline
- **Auto-save**: 500ms debounce with undo/redo history

The current editing flow:
1. User sees section list as accordion cards
2. Click a section → card expands inline showing the full editor
3. Edit fields → auto-save triggers
4. See changes in preview (if in split mode)

### Existing Codebase Analysis

**Relevant Files:**
- [x] `components/editor/EditorLayout.tsx` - Current split view, needs inspector pane
- [x] `components/editor/SectionCard.tsx` - Currently expands to show editor, will become simpler
- [x] `components/editor/SectionEditor.tsx` - Routes to block editors, has undo/redo/auto-save
- [x] `contexts/EditorSelectionContext.tsx` - Selection state management
- [x] `components/editor/blocks/*.tsx` - 20+ block editors with consistent patterns

**Key Patterns Found:**
- Block editors use `onChange(content)` callback
- Collapsible sections for grouping (Styling, Border, Background, etc.)
- Enable/disable toggles with Switch component
- Common fields: border, background, overlay, typography, content width

---

## 4. Context & Problem Definition

### Problem Statement
The current inline accordion editing is functional but has limitations:
1. **Context switching**: Expanding a card pushes other sections down, losing overview
2. **No persistent workspace**: Editor collapses when selecting a different section
3. **Limited space**: Inline editors compete for vertical space in the section list
4. **Professional gap**: Modern design tools use inspector panels (Figma, Webflow, Framer)

### Success Criteria
- [ ] Inspector panel appears on the right when a section is selected
- [ ] Panel has 3 tabs: Content, Design, Advanced
- [ ] Content tab shows text/media fields specific to the block type
- [ ] Design tab shows spacing, colors, borders, backgrounds
- [ ] Advanced tab shows section ID, anchor, custom attributes
- [ ] Changes auto-save with existing debounce behavior
- [ ] Undo/redo works as expected
- [ ] Section list becomes compact (no inline expansion)
- [ ] Preview remains functional and updates live
- [ ] Mobile (<1024px) shows Builder only (no inspector)

---

## 5. Development Mode Context

### Development Mode Context
- **New application in active development**
- **No backwards compatibility concerns**
- **Aggressive refactoring allowed**

---

## 6. Technical Requirements

### Functional Requirements
- User can select a section from the list OR preview to open inspector
- User can switch between Content/Design/Advanced tabs
- User can edit all fields currently available in block editors
- User can see changes reflected in preview immediately
- System auto-saves changes after 500ms debounce
- User can undo/redo changes (Ctrl+Z / Ctrl+Shift+Z)
- User can deselect (click outside) to close inspector

### Non-Functional Requirements
- **Performance:** Tab switching should be instant (lazy load heavy editors)
- **Usability:** Keyboard navigation between tabs
- **Responsive Design:** Inspector hidden on mobile, appears on desktop
- **Theme Support:** Dark/light mode support

### Technical Constraints
- Must integrate with existing EditorSelectionContext
- Must preserve existing auto-save and undo/redo behavior
- Must reuse existing block editor components where possible

---

## 7. Data & Database Changes

### Database Schema Changes
No database changes required.

### Data Model Updates
No data model changes - using existing Section and content interfaces.

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
No backend changes required. Inspector uses existing:
- `updateSection()` server action for saving
- Existing section data passed via props

---

## 9. Frontend Changes

### New Components

- [ ] **`components/editor/InspectorPanel.tsx`** - Main inspector panel container
  - Props: `section: Section | null`, `siteId: string`, `onClose: () => void`
  - Renders nothing when no section selected
  - Three tabs: Content, Design, Advanced
  - Close button to deselect

- [ ] **`components/editor/InspectorTabs.tsx`** - Tab navigation component
  - Tabs UI with icons: Content (FileText), Design (Palette), Advanced (Settings)
  - Stores active tab in local state

- [ ] **`components/editor/inspector/ContentTab.tsx`** - Content fields for each block type
  - Routes to block-specific content editors
  - Shows: headings, body text, buttons, images, items arrays

- [ ] **`components/editor/inspector/DesignTab.tsx`** - Shared design controls
  - Universal: Border, Background, Overlay, Typography, Content Width
  - Block-specific overrides where needed

- [ ] **`components/editor/inspector/AdvancedTab.tsx`** - Advanced settings
  - Section anchor ID (existing AnchorIdInput)
  - Custom CSS classes (future)
  - Section visibility toggle

### Component Organization
```
components/editor/
├── EditorLayout.tsx        # Modified - add inspector panel
├── SectionCard.tsx         # Simplified - no inline expansion
├── SectionEditor.tsx       # May be deprecated or refactored
├── InspectorPanel.tsx      # NEW - main inspector container
├── InspectorTabs.tsx       # NEW - tab navigation
├── inspector/
│   ├── ContentTab.tsx      # NEW - content fields
│   ├── DesignTab.tsx       # NEW - design controls
│   └── AdvancedTab.tsx     # NEW - advanced settings
└── blocks/                 # Existing - may refactor for inspector
```

### Page Updates
- [ ] **Page editor** - Layout changes for inspector panel

### State Management
- **Selection state**: Already in EditorSelectionContext
- **Active tab**: Local state in InspectorPanel
- **Content editing**: Reuse existing useHistory and useAutoSave hooks
- **Inspector visibility**: Derived from selectedSectionId !== null

### Layout Changes

**Current Layout (Split Mode):**
```
┌─────────────────────────────────────────────────────┐
│  Editor Header                                       │
├───────────────────────┬─────────────────────────────┤
│  Section List (40%)   │  Preview Frame (60%)         │
│  ┌─────────────────┐  │  ┌─────────────────────────┐│
│  │ Section Card 1  │  │  │                         ││
│  │ (expanded)      │  │  │       Live Preview      ││
│  │ [full editor]   │  │  │                         ││
│  └─────────────────┘  │  │                         ││
│  ┌─────────────────┐  │  │                         ││
│  │ Section Card 2  │  │  └─────────────────────────┘│
│  └─────────────────┘  │                             │
└───────────────────────┴─────────────────────────────┘
```

**New Layout (Split Mode with Inspector):**
```
┌────────────────────────────────────────────────────────────┐
│  Editor Header                                              │
├────────────────┬─────────────────────────┬─────────────────┤
│ Section List   │  Preview Frame          │ Inspector Panel │
│ (25%)          │  (50%)                  │ (25%)           │
│ ┌────────────┐ │  ┌───────────────────┐  │ ┌─────────────┐ │
│ │ Section 1  │ │  │                   │  │ │ [Content]   │ │
│ │ [compact]  │ │  │   Live Preview    │  │ │ [Design]    │ │
│ └────────────┘ │  │                   │  │ │ [Advanced]  │ │
│ ┌────────────┐ │  │   Section 2       │  │ ├─────────────┤ │
│ │ Section 2  │ │  │   [selected]      │  │ │ Hero        │ │
│ │ [selected] │ │  │                   │  │ │ ─────────── │ │
│ └────────────┘ │  │                   │  │ │ Heading:    │ │
│ ┌────────────┐ │  └───────────────────┘  │ │ [input]     │ │
│ │ Section 3  │ │                         │ │             │ │
│ └────────────┘ │                         │ │ Subheading: │ │
│                │                         │ │ [input]     │ │
└────────────────┴─────────────────────────┴─────────────────┘
```

**Layout Modes:**
- **Builder Mode**: Section List only (full width)
- **Split Mode (no selection)**: Section List (40%) + Preview (60%) *(preview expands)*
- **Split Mode (with selection)**: Section List (25%) + Preview (50%) + Inspector (25%)
- **Preview Mode**: Preview only (full width)

**Design Decisions (User Confirmed):**
1. **Empty state**: Preview expands to fill space when no section selected
2. **Refactor strategy**: Split existing block editors into Content/Design components for reuse

---

## 10. Code Changes Overview

### Current Implementation (Before)

**EditorLayout.tsx** - Current split view:
```tsx
<div className="flex h-full">
  {/* Editor Panel */}
  <div className={cn(showEditor && "w-[40%]")}>
    <SectionsList sections={sections} />
  </div>

  {/* Preview Panel */}
  <div className={cn(showPreview && "flex-1")}>
    <PreviewFrame />
  </div>
</div>
```

**SectionCard.tsx** - Currently expands inline:
```tsx
<Collapsible open={isSelected} onOpenChange={handleToggle}>
  <div className="section-header">
    {/* grip, icon, label, actions */}
  </div>
  <CollapsibleContent>
    <SectionEditor section={section} siteId={siteId} />
  </CollapsibleContent>
</Collapsible>
```

### After Refactor

**EditorLayout.tsx** - Three-panel layout:
```tsx
<div className="flex h-full">
  {/* Section List Panel */}
  <div className={cn(
    showEditor && !selectedSectionId && "w-[40%]",
    showEditor && selectedSectionId && "w-[25%]"
  )}>
    <SectionsList sections={sections} />
  </div>

  {/* Preview Panel */}
  <div className={cn(
    showPreview && !selectedSectionId && "flex-1",
    showPreview && selectedSectionId && "w-[50%]"
  )}>
    <PreviewFrame />
  </div>

  {/* Inspector Panel */}
  {selectedSectionId && (
    <div className="w-[25%] border-l">
      <InspectorPanel
        section={selectedSection}
        siteId={siteId}
        onClose={() => setSelectedSectionId(null)}
      />
    </div>
  )}
</div>
```

**SectionCard.tsx** - Simplified (no inline expansion):
```tsx
<div
  className={cn(
    "section-card cursor-pointer",
    isSelected && "ring-2 ring-primary"
  )}
  onClick={() => setSelectedSectionId(section.id)}
>
  <div className="section-header">
    {/* grip, icon, label, actions - no expand/collapse */}
  </div>
</div>
```

### Key Changes Summary
- [ ] **EditorLayout.tsx**: Add inspector panel, adjust widths based on selection
- [ ] **SectionCard.tsx**: Remove inline expansion, simplify to clickable card
- [ ] **InspectorPanel.tsx**: New component with tabbed interface
- [ ] **inspector/ContentTab.tsx**: Route to block-specific content editors
- [ ] **inspector/DesignTab.tsx**: Universal design controls
- [ ] **inspector/AdvancedTab.tsx**: Anchor ID, visibility, etc.
- [ ] **SectionEditor.tsx**: Refactor for use in inspector context

---

## 11. Implementation Plan

### Phase 1: Inspector Panel Foundation
**Goal:** Create the basic inspector panel structure with tabs

- [x] **Task 1.1:** Create InspectorPanel.tsx ✓ 2026-01-20
  - Files: `components/editor/InspectorPanel.tsx`
  - Details: Container with header, undo/redo, tabs, scroll area. Uses useHistory and useAutoSave hooks.
- [x] **Task 1.2:** Create tab components ✓ 2026-01-20
  - Files: `components/editor/inspector/ContentTab.tsx`, `DesignTab.tsx`, `AdvancedTab.tsx`
  - Details: ContentTab routes to existing block editors. DesignTab is placeholder. AdvancedTab has visibility toggle and anchor ID.

### Phase 2: Layout Integration
**Goal:** Integrate inspector panel into EditorLayout

- [x] **Task 2.1:** Modify EditorLayout for three-panel layout ✓ 2026-01-20
  - Files: `components/editor/EditorLayout.tsx`
  - Details: Created EditorLayoutContent inner component to access context. Dynamic widths: 40%/60% → 25%/50%/25% when selection exists.
- [x] **Task 2.2:** Simplify SectionCard (remove inline expansion) ✓ 2026-01-20
  - Files: `components/editor/SectionCard.tsx`
  - Details: Removed SectionEditor import, removed expand/collapse chevrons, made entire card clickable. Compact layout (p-3, smaller icons).
- [ ] **Task 2.3:** Update SectionsList for compact mode
  - Files: `components/editor/SectionsList.tsx`
  - Details: Ensure proper spacing in compact card layout

### Phase 3: Content Tab Implementation
**Goal:** Populate Content tab with block-specific editors

- [ ] **Task 3.1:** Extract content fields from block editors
  - Files: `components/editor/inspector/ContentTab.tsx`
  - Details: Route to existing block editors or create content-only versions
- [ ] **Task 3.2:** Integrate undo/redo and auto-save
  - Files: `components/editor/InspectorPanel.tsx`
  - Details: Move useHistory and useAutoSave logic to inspector level
- [ ] **Task 3.3:** Test content editing for 3-5 block types
  - Files: Hero, Text, Features, CTA, Image
  - Details: Verify changes save and preview updates

### Phase 4: Design Tab Implementation
**Goal:** Create universal design controls

- [ ] **Task 4.1:** Build shared design controls
  - Files: `components/editor/inspector/DesignTab.tsx`
  - Details: Border, Background, Overlay, Typography, Content Width collapsibles
- [ ] **Task 4.2:** Handle block-specific design overrides
  - Files: `components/editor/inspector/DesignTab.tsx`
  - Details: Some blocks have unique styling options

### Phase 5: Advanced Tab Implementation
**Goal:** Add advanced settings

- [ ] **Task 5.1:** Build Advanced tab
  - Files: `components/editor/inspector/AdvancedTab.tsx`
  - Details: Anchor ID input, visibility toggle, future: custom CSS

### Phase 6: Polish & Testing
**Goal:** Complete testing and refinement

- [ ] **Task 6.1:** Test all block types in inspector
  - Details: Verify 20+ block types work correctly
- [ ] **Task 6.2:** Keyboard navigation
  - Details: Tab key between tabs, escape to close
- [ ] **Task 6.3:** Responsive behavior
  - Details: Verify mobile (<1024px) hides inspector

### Phase 7: Comprehensive Code Review (Mandatory)
- [ ] **Task 7.1:** Present "Implementation Complete!" Message
- [ ] **Task 7.2:** Execute Comprehensive Code Review (If Approved)

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** before adding timestamps
- [ ] Update task document after each completed subtask
- [ ] Mark checkboxes as [x] with completion timestamp

---

## 13. File Structure & Organization

### New Files to Create
```
components/editor/
├── InspectorPanel.tsx          # Main inspector container
├── InspectorTabs.tsx           # Tab navigation
└── inspector/
    ├── ContentTab.tsx          # Content fields router
    ├── DesignTab.tsx           # Shared design controls
    └── AdvancedTab.tsx         # Advanced settings
```

### Files to Modify
- [ ] **`components/editor/EditorLayout.tsx`** - Add inspector panel, adjust widths
- [ ] **`components/editor/SectionCard.tsx`** - Remove inline expansion
- [ ] **`components/editor/SectionsList.tsx`** - Compact card styling
- [ ] **`contexts/EditorSelectionContext.tsx`** - May need to expose section data

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Scenario 1:** User rapidly switches between sections
  - **Focus:** Ensure auto-save completes before switching, or queue saves
  - **Potential Fix:** Debounce selection changes, complete pending save on switch

- [ ] **Scenario 2:** Undo/redo across section switches
  - **Focus:** History should be per-section, not global
  - **Potential Fix:** Maintain separate history stacks per section ID

### Edge Cases to Consider
- [ ] **Edge Case 1:** Very long content in inspector
  - **Analysis:** Inspector should scroll independently
  - **Recommendation:** Add overflow-y-auto to content area

- [ ] **Edge Case 2:** Selecting section with unsaved changes
  - **Analysis:** What happens to pending changes?
  - **Recommendation:** Force save on selection change

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard task workflow from the template.

### Code Quality Standards
- [ ] Use existing shadcn/ui components (Tabs, ScrollArea, etc.)
- [ ] Follow existing collapsible patterns from block editors
- [ ] Maintain TypeScript strict mode compliance
- [ ] Use CSS variables for theming

---

## 17. Notes & Additional Context

### Design References
- **Figma**: Right-side panel with properties
- **Webflow**: Right-side panel with tabs (Settings, Style, etc.)
- **Framer**: Right-side panel with collapsible sections

### Key Implementation Notes
1. Inspector panel replaces inline expansion - this is a significant UX change
2. Must preserve all existing editing functionality
3. Undo/redo should work within the inspector
4. Auto-save behavior should be identical

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **Section editing UX**: Completely changes from accordion to panel
- [ ] **SectionCard**: Loses inline editor, becomes click target only

### User Experience Impacts
- [ ] **Learning curve**: Users familiar with accordion may need adjustment
- [ ] **Benefit**: More screen real estate for both preview and editing

### Mitigation Strategies
- Ensure all existing functionality is preserved
- Test with all 20+ block types before completion

---

*Template Version: 1.0*
*Created: 2026-01-20*
*Feature: #71 Inspector Panel Editing*
