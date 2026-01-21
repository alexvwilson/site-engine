# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Inspector Panel Independent Scrolling

### Goal Statement
**Goal:** Make each panel in the split view editor (section list, preview, inspector) scroll independently so users can access all inspector controls without scrolling the entire page. Currently, when editing a section with many fields, users may need to scroll the whole page to reach all editing controls in the inspector panel.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Skip Strategic Analysis** - This is a straightforward UI fix with a clear implementation path. Only one obvious technical solution exists (proper height constraints + overflow handling).

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Key Components:** EditorLayout.tsx, InspectorPanel.tsx, SectionsList.tsx

### Current State
The editor layout has three panels in split mode:
1. **Section List Panel** (`w-[25%]`) - Has `overflow-auto` on container
2. **Preview Panel** (`w-[50%]`) - Has `overflow-hidden` (iframe handles scroll)
3. **Inspector Panel** (`w-[25%]`) - Has `overflow-hidden` on wrapper

The InspectorPanel component internally uses a `ScrollArea` component for its tab content, but the parent wrapper in EditorLayout may not properly constrain heights, causing potential scrolling issues.

### Existing Codebase Analysis

**Files Analyzed:**
- `components/editor/EditorLayout.tsx` - Main split view layout
- `components/editor/InspectorPanel.tsx` - Inspector panel with tabs and ScrollArea

**Current Implementation (EditorLayout.tsx lines 251-260):**
```tsx
{/* Inspector Panel */}
{showInspector && (
  <div className="w-[25%] border-l overflow-hidden">
    <InspectorPanel
      section={selectedSection}
      siteId={siteId}
      onClose={() => setSelectedSectionId(null)}
    />
  </div>
)}
```

**Current Implementation (InspectorPanel.tsx structure):**
```tsx
<div className="h-full flex flex-col bg-background">
  {/* Header - fixed */}
  <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">...</div>

  {/* Undo/Redo Controls - fixed */}
  <div className="px-4 py-2 border-b">...</div>

  {/* Tabs with ScrollArea */}
  <Tabs className="flex-1 flex flex-col min-h-0">
    <div className="px-4 pt-3">
      <TabsList>...</TabsList>
    </div>
    <ScrollArea className="flex-1">
      <div className="p-4">
        {/* Tab content */}
      </div>
    </ScrollArea>
  </Tabs>
</div>
```

---

## 4. Context & Problem Definition

### Problem Statement
When editing a section positioned high on the page with a long inspector panel (e.g., Hero editor with many fields), users may need to scroll the entire page to access all editing controls. The inspector panel should scroll independently within its container.

### Success Criteria
- [ ] Inspector panel scrolls independently without affecting page scroll
- [ ] Section list panel scrolls independently
- [ ] Preview panel handles its own scroll (via iframe)
- [ ] Header and undo/redo controls in inspector stay visible while scrolling
- [ ] No visual glitches or layout shifts when scrolling any panel

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- Each panel (section list, preview, inspector) scrolls independently
- Inspector header with section type label stays visible (sticky)
- Undo/redo controls stay visible while scrolling inspector content
- Scroll position resets when selecting a different section

### Non-Functional Requirements
- **Performance:** No jank or lag while scrolling
- **Usability:** Smooth scrolling experience
- **Responsive Design:** Works on screens >= 1024px (split mode requirement)

### Technical Constraints
- Must use existing shadcn/ui ScrollArea component pattern
- Must preserve existing keyboard shortcuts (Escape to close)
- Must work with existing auto-save functionality

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - This is a pure UI/styling fix.

---

## 8. Backend Changes & Background Jobs

**None required** - This is a pure frontend change.

---

## 9. Frontend Changes

### Component Updates

#### EditorLayout.tsx
- Add explicit height constraint to inspector wrapper
- Ensure flex layout properly distributes height to children

#### InspectorPanel.tsx (if needed)
- Verify ScrollArea properly fills available space
- Consider making header sticky if not already

### State Management
**No changes** - Existing state management is sufficient.

---

## 10. Code Changes Overview

### Current Implementation (Before)

**EditorLayout.tsx (lines 251-260):**
```tsx
{/* Inspector Panel */}
{showInspector && (
  <div className="w-[25%] border-l overflow-hidden">
    <InspectorPanel
      section={selectedSection}
      siteId={siteId}
      onClose={() => setSelectedSectionId(null)}
    />
  </div>
)}
```

### After Refactor

**EditorLayout.tsx:**
```tsx
{/* Inspector Panel */}
{showInspector && (
  <div className="w-[25%] border-l overflow-hidden h-full">
    <InspectorPanel
      section={selectedSection}
      siteId={siteId}
      onClose={() => setSelectedSectionId(null)}
    />
  </div>
)}
```

### Key Changes Summary
- [ ] **Change 1:** Add `h-full` to inspector panel wrapper in EditorLayout for explicit height constraint
- [ ] **Files Modified:** `components/editor/EditorLayout.tsx`
- [ ] **Impact:** Inspector panel will properly fill its container and scroll independently

---

## 11. Implementation Plan

### Phase 1: Fix Height Constraints ✅ 2026-01-20
**Goal:** Ensure inspector panel wrapper has proper height so internal ScrollArea works correctly

- [x] **Task 1.1:** Update EditorLayout.tsx inspector wrapper ✅ 2026-01-20
  - Files: `components/editor/EditorLayout.tsx` (line 253)
  - Details: Added `h-full` class to inspector panel wrapper div
  - Change: `"w-[25%] border-l overflow-hidden"` → `"w-[25%] border-l overflow-hidden h-full"`
- [x] **Task 1.2:** Verify section list panel also has proper height ✅ 2026-01-20
  - Files: `components/editor/EditorLayout.tsx`
  - Details: Confirmed section list container already has `overflow-auto` which handles scrolling correctly
- [x] **Task 1.3:** Fix protected layout height chain ✅ 2026-01-20
  - Files: `app/(protected)/layout.tsx`
  - Details: Changed `min-h-screen` to `h-screen overflow-hidden` on outer wrapper, added `overflow-auto` to main, added `min-w-0` to flex child
  - This creates a fixed height constraint so `h-full` works in children
- [x] **Task 1.4:** Update page editor wrapper ✅ 2026-01-20
  - Files: `app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx`
  - Details: Added `overflow-hidden` to page wrapper so child panels handle scrolling
- [x] **Task 1.5:** Fix InspectorPanel ScrollArea height ✅ 2026-01-20
  - Files: `components/editor/InspectorPanel.tsx`
  - Details: Wrapped ScrollArea in container with `flex-1 min-h-0 overflow-hidden`, changed ScrollArea to `h-full`
  - This provides the explicit height constraint needed for Radix ScrollArea to work

### Phase 2: Verify and Test ✅ 2026-01-20
**Goal:** Confirm independent scrolling works correctly

- [x] **Task 2.1:** Manual testing in browser (👤 USER TESTING) ✅ 2026-01-20
  - Details: User confirmed inspector panel now scrolls independently
  - Verification: Inspector scrolls independently, header stays visible ✅

### Phase 3: Comprehensive Code Review ✅ 2026-01-20
**Goal:** Verify implementation is complete and correct

- [x] **Task 3.1:** Execute code review process ✅ 2026-01-20
  - Details: Linting passes on all modified files

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Task Completion Tracking
- [ ] Update task document immediately after each completed subtask
- [ ] Mark checkboxes as [x] with completion timestamp
- [ ] Add brief completion notes (file paths, key changes)

---

## 13. File Structure & Organization

### Files to Modify
- [ ] **`components/editor/EditorLayout.tsx`** - Add height constraint to inspector wrapper

### Dependencies to Add
**None required**

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Error Scenario 1:** ScrollArea doesn't scroll when content overflows
  - **Code Review Focus:** Check that parent containers have explicit height constraints
  - **Potential Fix:** Add `h-full` or explicit height to wrapper elements

### Edge Cases to Consider
- [ ] **Edge Case 1:** Very long inspector content (Hero with all options expanded)
  - **Analysis Approach:** Test with most complex block editors
  - **Recommendation:** Ensure ScrollArea fills available space

---

## 15. Deployment & Configuration

**No deployment changes required** - Pure frontend CSS fix.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Read the current EditorLayout.tsx file
2. Add `h-full` class to the inspector panel wrapper
3. Verify the section list panel also has proper height constraints
4. Run linting to verify no issues
5. Document completion

### Code Quality Standards
- Use Tailwind classes (no inline styles)
- Preserve existing functionality
- No changes beyond what's necessary

---

## 17. Notes & Additional Context

### Backlog Reference
This task addresses **#83 Inspector Panel Independent Scrolling** from the features backlog.

### Prerequisites
- #71 (Inspector Panel Editing) - **Complete** (Phases 1-2)

### Related Issues
- #83 in features-backlog.md

---

*Template Version: 1.0*
*Task Created: 2026-01-20*
