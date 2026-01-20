# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Section Selection & Highlighting - Visual Connection Between Editor and Preview

### Goal Statement
**Goal:** Create a visual connection between the section cards in the editor panel and their rendered output in the live preview. When a user hovers or selects a section card, the corresponding section in the preview should be highlighted. Clicking on a section in the preview should expand that section's editor card. This feature builds on the recently completed Split View (#68) to make the editing experience more intuitive and efficient.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
This is a straightforward feature with a clear implementation path. The backlog already specifies the solution approach, and there's one obvious technical solution using React Context for shared state.

**Decision:** Skip detailed strategic analysis - proceed with the established approach from the backlog.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State
The Split View mode was just implemented (#68), providing side-by-side editor and preview panels. Currently:
- **Editor Panel:** `SectionsList.tsx` renders `SectionCard.tsx` components in a sortable list
- **Preview Panel:** `PreviewFrame.tsx` renders `PreviewBlockRenderer.tsx` for each section
- **No connection:** There's no shared state between editor and preview - they operate independently
- **No data attributes:** Preview sections don't have identifying attributes linking them to their source sections

### Existing Codebase Analysis

**Relevant Components Analyzed:**

- [x] **`components/editor/EditorLayout.tsx`** - Main split view layout, manages view mode state
- [x] **`components/editor/SectionsList.tsx`** - Renders list of SectionCard components with DnD support
- [x] **`components/editor/SectionCard.tsx`** - Individual section card with expand/collapse state (`isExpanded`)
- [x] **`components/preview/PreviewFrame.tsx`** - Renders preview with header/sections/footer
- [x] **`components/render/PreviewBlockRenderer.tsx`** - Client-side block renderer for preview

**Key Observations:**
1. `SectionCard` manages its own `isExpanded` state locally - will need to lift this to context
2. `PreviewBlockRenderer` returns raw block components with no wrapper div - needs wrapper for data attributes
3. `EditorLayout` already manages shared state (viewMode, device, colorMode) - good pattern to follow
4. Both panels have access to the same `sections` array with matching `section.id` values

---

## 4. Context & Problem Definition

### Problem Statement
Users editing pages in Split View mode cannot visually connect which section card corresponds to which rendered block in the preview. When editing complex pages with many sections, it's easy to lose track of what you're editing. Additionally, there's no way to click on a section in the preview to jump directly to editing it.

### Success Criteria
- [ ] Hovering a section card highlights the corresponding section in the preview
- [ ] Hovering a section in the preview highlights the corresponding section card
- [ ] Clicking a section in the preview expands that section's editor card
- [ ] Selected/hovered sections show a visible outline/border in the preview
- [ ] Selected sections in the preview show a floating label with the section type
- [ ] Scroll sync: selecting a section scrolls both panels to show it
- [ ] Works correctly in both Split View and Preview-only modes
- [ ] No performance degradation with many sections

---

## 5. Development Mode Context

### Development Mode Context
- **New application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- User can hover a section card to see the corresponding preview section highlighted
- User can hover a section in the preview to see the corresponding editor card highlighted
- User can click a section in the preview to expand that section's editor card
- Selected section in preview shows: outline border, section type label badge
- Selecting a section scrolls both the editor panel and preview panel to show that section

### Non-Functional Requirements
- **Performance:** Hover/selection state changes must be instant (<16ms for 60fps)
- **Usability:** Highlight styling must be clearly visible but not intrusive
- **Responsive Design:** Works on screens 1024px+ (Split View requirement)
- **Theme Support:** Highlight colors should work in both light and dark mode

### Technical Constraints
- Must not break existing drag-and-drop functionality in SectionsList
- Must work with the existing PreviewBlockRenderer component structure
- Context must be optional - components should work without it (for non-editor contexts)

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - this is a purely frontend feature using React state.

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
**None required** - this feature is entirely client-side.

---

## 9. Frontend Changes

### New Components
- [ ] **`contexts/EditorSelectionContext.tsx`** - React Context for shared selection state
  - `hoveredSectionId: string | null` - Currently hovered section (from either panel)
  - `selectedSectionId: string | null` - Currently selected/expanded section
  - `setHoveredSectionId(id: string | null)` - Set hover state
  - `setSelectedSectionId(id: string | null)` - Set selection state
  - `scrollToSection(id: string)` - Trigger scroll sync to section

- [ ] **`components/preview/SectionHighlight.tsx`** - Wrapper component for preview sections
  - Adds `data-section-id` and `data-section-type` attributes
  - Handles hover/click events for preview sections
  - Renders highlight outline and section type label when hovered/selected

### Component Updates
- [ ] **`components/editor/EditorLayout.tsx`** - Wrap children with EditorSelectionProvider
- [ ] **`components/editor/SectionCard.tsx`** - Wire up hover events and selection state from context
- [ ] **`components/editor/SectionsList.tsx`** - Add ref for scroll-to functionality
- [ ] **`components/preview/PreviewFrame.tsx`** - Wire up click handlers, add scroll container ref
- [ ] **`components/render/PreviewBlockRenderer.tsx`** - Wrap output with SectionHighlight

### State Management

**EditorSelectionContext Interface:**
```typescript
interface EditorSelectionContextValue {
  // State
  hoveredSectionId: string | null;
  selectedSectionId: string | null;

  // Actions
  setHoveredSectionId: (id: string | null) => void;
  setSelectedSectionId: (id: string | null) => void;

  // Refs for scroll sync
  registerEditorSection: (id: string, element: HTMLElement | null) => void;
  registerPreviewSection: (id: string, element: HTMLElement | null) => void;
}
```

**Scroll Sync Strategy:**
- Maintain refs map for both editor and preview section elements
- When selection changes, scroll both containers to show the selected section
- Use `scrollIntoView({ behavior: 'smooth', block: 'center' })` for smooth UX

### Context Usage Strategy
- [x] **EditorSelectionContext** will be new - provide at EditorLayout level
- [x] **No props drilling needed** - context provides direct access to selection state

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**PreviewBlockRenderer.tsx** - Returns raw blocks without wrapper:
```typescript
export function PreviewBlockRenderer({ section, theme }: PreviewBlockRendererProps) {
  const { block_type, content } = section;

  switch (block_type) {
    case "hero":
      return <HeroBlock content={getTypedContent("hero", content)} theme={theme} />;
    // ... other cases return blocks directly
  }
}
```

**SectionCard.tsx** - Local expand state, no hover tracking:
```typescript
export function SectionCard({ section, siteId }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // ... no connection to preview
}
```

**PreviewFrame.tsx** - Renders sections without interactivity:
```typescript
{sections.map((section) => (
  <PreviewBlockRenderer
    key={section.id}
    section={section}
    theme={theme}
  />
))}
```

### 📂 **After Implementation**

**EditorSelectionContext.tsx** - New context for shared state:
```typescript
const EditorSelectionContext = createContext<EditorSelectionContextValue | null>(null);

export function EditorSelectionProvider({ children }: { children: React.ReactNode }) {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const editorRefs = useRef<Map<string, HTMLElement>>(new Map());
  const previewRefs = useRef<Map<string, HTMLElement>>(new Map());
  // ... implementation
}

export function useEditorSelection() {
  const context = useContext(EditorSelectionContext);
  if (!context) {
    // Return no-op implementation for non-editor contexts
    return { hoveredSectionId: null, selectedSectionId: null, ... };
  }
  return context;
}
```

**PreviewBlockRenderer.tsx** - Wrapped with SectionHighlight:
```typescript
export function PreviewBlockRenderer({ section, theme }: PreviewBlockRendererProps) {
  const blockContent = renderBlock(section, theme);

  return (
    <SectionHighlight sectionId={section.id} blockType={section.block_type}>
      {blockContent}
    </SectionHighlight>
  );
}
```

**SectionHighlight.tsx** - New wrapper with hover/click handling:
```typescript
export function SectionHighlight({ sectionId, blockType, children }: Props) {
  const { hoveredSectionId, selectedSectionId, setHoveredSectionId, setSelectedSectionId, registerPreviewSection } = useEditorSelection();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerPreviewSection(sectionId, ref.current);
    return () => registerPreviewSection(sectionId, null);
  }, [sectionId, registerPreviewSection]);

  const isHighlighted = hoveredSectionId === sectionId || selectedSectionId === sectionId;

  return (
    <div
      ref={ref}
      data-section-id={sectionId}
      data-section-type={blockType}
      className={cn("relative transition-all", isHighlighted && "ring-2 ring-primary ring-offset-2")}
      onMouseEnter={() => setHoveredSectionId(sectionId)}
      onMouseLeave={() => setHoveredSectionId(null)}
      onClick={() => setSelectedSectionId(sectionId)}
    >
      {children}
      {isHighlighted && (
        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
          {BLOCK_TYPE_INFO.find(b => b.type === blockType)?.label}
        </div>
      )}
    </div>
  );
}
```

**SectionCard.tsx** - Connected to context:
```typescript
export function SectionCard({ section, siteId }: SectionCardProps) {
  const { hoveredSectionId, selectedSectionId, setHoveredSectionId, setSelectedSectionId, registerEditorSection } = useEditorSelection();
  const cardRef = useRef<HTMLDivElement>(null);

  // Selection from context determines expansion
  const isExpanded = selectedSectionId === section.id;
  const isHighlighted = hoveredSectionId === section.id;

  useEffect(() => {
    registerEditorSection(section.id, cardRef.current);
    return () => registerEditorSection(section.id, null);
  }, [section.id, registerEditorSection]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHoveredSectionId(section.id)}
      onMouseLeave={() => setHoveredSectionId(null)}
      className={cn(
        "border rounded-lg bg-card transition-shadow",
        isHighlighted && "ring-2 ring-primary/50"
      )}
    >
      {/* ... rest of card */}
    </div>
  );
}
```

### 🎯 **Key Changes Summary**
- [ ] **New EditorSelectionContext** - Shared state for hover/selection across panels
- [ ] **New SectionHighlight component** - Wrapper for preview sections with highlight UI
- [ ] **SectionCard refactor** - Connect to context for hover/selection state
- [ ] **PreviewBlockRenderer update** - Wrap blocks with SectionHighlight
- [ ] **EditorLayout update** - Provide EditorSelectionContext
- [ ] **Scroll sync** - Both panels scroll to show selected section

**Files Created:** 2
**Files Modified:** 5

---

## 11. Implementation Plan

### Phase 1: Create EditorSelectionContext
**Goal:** Establish shared state infrastructure for selection/hover tracking

- [ ] **Task 1.1:** Create EditorSelectionContext with types and provider
  - Files: `contexts/EditorSelectionContext.tsx`
  - Details: Create context, provider, and useEditorSelection hook with graceful fallback
- [ ] **Task 1.2:** Add context provider to EditorLayout
  - Files: `components/editor/EditorLayout.tsx`
  - Details: Wrap editor and preview panels with EditorSelectionProvider

### Phase 2: Preview Section Highlighting
**Goal:** Add visual highlighting to preview sections

- [ ] **Task 2.1:** Create SectionHighlight wrapper component
  - Files: `components/preview/SectionHighlight.tsx`
  - Details: Wrapper with data attributes, hover/click handlers, highlight ring, type label badge
- [ ] **Task 2.2:** Update PreviewBlockRenderer to use SectionHighlight
  - Files: `components/render/PreviewBlockRenderer.tsx`
  - Details: Wrap all block outputs with SectionHighlight component

### Phase 3: Editor Card Integration
**Goal:** Connect SectionCard to selection context

- [ ] **Task 3.1:** Refactor SectionCard to use context for expansion state
  - Files: `components/editor/SectionCard.tsx`
  - Details: Replace local isExpanded with selectedSectionId from context, add hover tracking
- [ ] **Task 3.2:** Add highlight styling to SectionCard
  - Files: `components/editor/SectionCard.tsx`
  - Details: Visual indication when card is hovered (from preview) or selected

### Phase 4: Scroll Synchronization
**Goal:** Implement scroll-to-section when selection changes

- [ ] **Task 4.1:** Add ref registration system to context
  - Files: `contexts/EditorSelectionContext.tsx`
  - Details: Maintain maps of section refs for both panels
- [ ] **Task 4.2:** Wire up ref registration in SectionCard and SectionHighlight
  - Files: `components/editor/SectionCard.tsx`, `components/preview/SectionHighlight.tsx`
  - Details: Register/unregister refs on mount/unmount
- [ ] **Task 4.3:** Implement scroll-to behavior on selection change
  - Files: `contexts/EditorSelectionContext.tsx`
  - Details: useEffect to scroll both panels when selectedSectionId changes

### Phase 5: Testing & Polish
**Goal:** Verify functionality and refine UX

- [ ] **Task 5.1:** Test hover interactions
  - Details: Verify hover on card highlights preview, hover on preview highlights card
- [ ] **Task 5.2:** Test click-to-select interactions
  - Details: Verify clicking preview section expands correct editor card
- [ ] **Task 5.3:** Test scroll synchronization
  - Details: Verify both panels scroll to show selected section
- [ ] **Task 5.4:** Test with many sections
  - Details: Performance check with 10+ sections, ensure smooth interactions
- [ ] **Task 5.5:** Verify drag-and-drop still works
  - Details: Ensure DnD in SectionsList is not broken by hover state changes

### Phase 6: Code Review & User Testing
**Goal:** Comprehensive review before user testing

- [ ] **Task 6.1:** Present "Implementation Complete!" message
- [ ] **Task 6.2:** Execute comprehensive code review (if approved)
- [ ] **Task 6.3:** Request user browser testing

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes, etc.)

---

## 13. File Structure & Organization

### New Files to Create
```
site-engine/
├── contexts/
│   └── EditorSelectionContext.tsx    # New context for selection state
└── components/
    └── preview/
        └── SectionHighlight.tsx      # New wrapper for preview sections
```

### Files to Modify
- [ ] **`components/editor/EditorLayout.tsx`** - Add EditorSelectionProvider wrapper
- [ ] **`components/editor/SectionCard.tsx`** - Connect to context, refactor expansion state
- [ ] **`components/editor/SectionsList.tsx`** - Minor updates if needed for scroll refs
- [ ] **`components/preview/PreviewFrame.tsx`** - Add scroll container ref
- [ ] **`components/render/PreviewBlockRenderer.tsx`** - Wrap blocks with SectionHighlight

### Dependencies to Add
**None** - Using existing React APIs (Context, refs, useState, useEffect)

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Context not available:** Components used outside EditorLayout
  - **Code Review Focus:** `useEditorSelection` hook fallback behavior
  - **Potential Fix:** Return no-op implementation when context is null

- [ ] **Rapid hover changes:** Performance with fast mouse movements
  - **Code Review Focus:** State update frequency, potential for React batching issues
  - **Potential Fix:** Consider debouncing if performance issues arise

### Edge Cases to Consider
- [ ] **Collapsed Split View:** When on mobile/small screen (builder-only mode)
  - **Analysis Approach:** Verify hover state doesn't cause issues when preview is hidden
  - **Recommendation:** Context should work but be no-op visually

- [ ] **Section deletion while selected:** Selected section is deleted
  - **Analysis Approach:** Check if selectedSectionId cleanup is needed
  - **Recommendation:** Clear selection when section is removed

- [ ] **Drag while hovering:** User starts drag while section is hovered
  - **Analysis Approach:** Test DnD interaction with hover state
  - **Recommendation:** May need to clear hover on drag start

### Security & Access Control Review
- [ ] **No security concerns** - This is a purely UI feature with no data access

---

## 15. Deployment & Configuration

### Environment Variables
**None required** - This is a frontend-only feature.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard task template workflow:
1. Create task document ✅
2. Get user approval
3. Implement phase-by-phase with progress updates
4. Comprehensive code review
5. User browser testing

### Code Quality Standards
- [ ] Use TypeScript strict mode
- [ ] Follow existing patterns from EditorLayout (for context usage)
- [ ] Use Tailwind for all styling (ring utilities for highlights)
- [ ] Ensure graceful degradation when context unavailable
- [ ] Use `cn()` utility for conditional classes

### Architecture Compliance
- [ ] Context follows React best practices
- [ ] Components remain composable and reusable
- [ ] No breaking changes to existing functionality
- [ ] Proper cleanup in useEffect hooks

---

## 17. Notes & Additional Context

### Design Decisions
1. **Ring vs Border for highlights:** Using `ring-2 ring-primary` for highlight effect because:
   - Doesn't affect layout (unlike border)
   - Works with ring-offset for spacing
   - Matches shadcn/ui focus patterns

2. **Context vs Props:** Using context because:
   - Avoids prop drilling through SectionsList → SectionCard
   - Provides clean separation of concerns
   - Makes it easy to add more panels later (e.g., Inspector Panel #71)

3. **Graceful fallback:** `useEditorSelection` returns no-op values when context unavailable to ensure components work in non-editor contexts (e.g., published site preview).

### References
- **Backlog Entry:** `ai_docs/features-backlog.md` - Item #69
- **Prerequisites Completed:** #68 Live Preview Split View Mode
- **Enables:** #71 Inspector Panel Editing

---

*Template Version: 1.0*
*Created: 2026-01-20*
