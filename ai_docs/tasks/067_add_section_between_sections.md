# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Add Section Between Sections - Insertion Point UI

### Goal Statement
**Goal:** Enable users to insert new sections at any position in the page, not just at the end. Add a "+" button between section cards that opens the BlockPicker with the target position, allowing precise control over section placement.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision: Skip Strategic Analysis** - This is a straightforward UI enhancement with only one obvious technical solution. The backend logic (`addSection()` with `position` parameter) already exists. No architectural decisions are needed.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4 for styling
- **Relevant Existing Components:**
  - `components/editor/SectionsList.tsx` - Renders list of section cards with drag-and-drop
  - `components/editor/BlockPicker.tsx` - Dialog for selecting block type and template
  - `components/editor/SectionCard.tsx` - Individual section card component
  - `app/actions/sections.ts` - Server actions including `addSection(pageId, blockType, position?, templateContent?)`

### Current State
The `addSection()` server action already supports an optional `position` parameter (line 106):
- When `position` is provided, it shifts existing sections down and inserts at the specified position
- When `position` is omitted, sections are added to the end
- The BlockPicker component currently doesn't accept a `position` prop - it always calls `addSection(pageId, blockType, undefined, content)` (line 45)
- The SectionsList renders cards in a flat list with `space-y-4` gap, with no UI for inserting between sections

### Existing Codebase Analysis

**Checked:**
- [x] **Server Actions** (`app/actions/sections.ts`)
  - `addSection()` already supports position parameter - backend is ready
  - Shifts sections down when position is provided (lines 119-130)

- [x] **Component Patterns** (`components/editor/`)
  - `SectionsList.tsx` - Wraps sections in DndContext for drag-and-drop
  - `BlockPicker.tsx` - Two-step flow: select block type → select template
  - Both use `useTransition` for optimistic updates

---

## 4. Context & Problem Definition

### Problem Statement
Users can only add sections at the bottom of the page. If they want to insert a section between existing sections, they must:
1. Add the section at the bottom
2. Drag it to the desired position

This is cumbersome, especially for pages with many sections. Users should be able to click a "+" button between any two sections to insert directly at that position.

### Success Criteria
- [ ] "+" button appears between section cards on hover
- [ ] "+" button also appears before the first section (position 0)
- [ ] Clicking "+" opens BlockPicker with target position
- [ ] After adding section, new section appears at correct position
- [ ] Existing sections shift down as expected
- [ ] UI is accessible (keyboard navigable, proper focus management)

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can click "+" button between any two sections to insert at that position
- User can click "+" button at the top to insert before the first section
- BlockPicker receives the target position and passes it to `addSection()`
- After insertion, new section appears in correct position with other sections shifted down

### Non-Functional Requirements
- **Performance:** No additional API calls - position is passed client-side
- **Usability:** "+" buttons appear on hover to avoid visual clutter
- **Accessibility:** Buttons are keyboard accessible with proper ARIA labels
- **Responsive Design:** Works on all screen sizes

### Technical Constraints
- Must work within existing DndContext for drag-and-drop
- Must not interfere with existing "Add Section" button at bottom

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - Backend already supports position parameter.

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
**No backend changes required** - `addSection()` already supports the `position` parameter.

---

## 9. Frontend Changes

### Components to Modify

#### 1. `components/editor/BlockPicker.tsx`
- Add optional `position` prop
- Pass position to `addSection()` call
- Create a new variant component `InsertionButton` for the "+" button between sections

#### 2. `components/editor/SectionsList.tsx`
- Add insertion points between each section card
- Each insertion point shows "+" on hover
- Pass position to BlockPicker when clicked

### New Components
- [ ] **`components/editor/InsertionPoint.tsx`** - The "+" button that appears between sections
  - Props: `pageId: string`, `siteId: string`, `position: number`
  - Shows a subtle line/button on hover
  - Opens BlockPicker with the target position

### Page Updates
- No page changes needed - SectionsList is already embedded in the page editor

### State Management
- BlockPicker already manages its own dialog state
- No additional state management needed

---

## 10. Code Changes Overview

### Current Implementation (Before)

**SectionsList.tsx (lines 84-100):**
```tsx
return (
  <DndContext ...>
    <SortableContext ...>
      <div className={`space-y-4 ${isPending ? "opacity-70" : ""}`}>
        {sections.map((section) => (
          <SectionCard key={section.id} section={section} siteId={siteId} />
        ))}
      </div>
    </SortableContext>
  </DndContext>
);
```

**BlockPicker.tsx (lines 22-26, 44-47):**
```tsx
interface BlockPickerProps {
  pageId: string;
  siteId: string;
  className?: string;
}

// In handleSelectTemplate:
startTransition(async () => {
  await addSection(pageId, selectedBlockType, undefined, content);
  handleClose();
});
```

### After Refactor

**SectionsList.tsx:**
```tsx
return (
  <DndContext ...>
    <SortableContext ...>
      <div className={`${isPending ? "opacity-70" : ""}`}>
        {/* Insertion point before first section */}
        <InsertionPoint pageId={pageId} siteId={siteId} position={0} />

        {sections.map((section, index) => (
          <div key={section.id}>
            <SectionCard section={section} siteId={siteId} />
            {/* Insertion point after each section */}
            <InsertionPoint
              pageId={pageId}
              siteId={siteId}
              position={index + 1}
            />
          </div>
        ))}
      </div>
    </SortableContext>
  </DndContext>
);
```

**BlockPicker.tsx:**
```tsx
interface BlockPickerProps {
  pageId: string;
  siteId: string;
  className?: string;
  position?: number;  // NEW: Optional position for insertion
  trigger?: React.ReactNode;  // NEW: Custom trigger element
  onClose?: () => void;  // NEW: Callback after adding section
}

// In handleSelectTemplate:
startTransition(async () => {
  await addSection(pageId, selectedBlockType, position, content);
  handleClose();
  onClose?.();
});
```

**New InsertionPoint.tsx:**
```tsx
interface InsertionPointProps {
  pageId: string;
  siteId: string;
  position: number;
}

export function InsertionPoint({ pageId, siteId, position }: InsertionPointProps) {
  // Renders a horizontal line with centered "+" button
  // Visible on hover, opens BlockPicker dialog
}
```

### Key Changes Summary
- [ ] **BlockPicker.tsx:** Add `position`, `trigger`, and `onClose` props
- [ ] **SectionsList.tsx:** Add InsertionPoint components between section cards
- [ ] **InsertionPoint.tsx:** New component for hover-visible "+" insertion UI
- **Files Modified:** 2 existing, 1 new
- **Impact:** Users can insert sections at any position in the page

---

## 11. Implementation Plan

### Phase 1: Update BlockPicker to Accept Position
**Goal:** Modify BlockPicker to support position-based insertion

- [ ] **Task 1.1:** Add `position` prop to BlockPickerProps interface
  - Files: `components/editor/BlockPicker.tsx`
  - Details: Add optional `position?: number` prop
- [ ] **Task 1.2:** Pass position to addSection call
  - Files: `components/editor/BlockPicker.tsx`
  - Details: Update handleSelectTemplate to pass `position` parameter
- [ ] **Task 1.3:** Add `trigger` prop for custom trigger element
  - Files: `components/editor/BlockPicker.tsx`
  - Details: Allow custom trigger instead of default button
- [ ] **Task 1.4:** Add `onClose` callback prop
  - Files: `components/editor/BlockPicker.tsx`
  - Details: Called after section is added to allow parent cleanup

### Phase 2: Create InsertionPoint Component
**Goal:** Create the hover-activated "+" button component

- [ ] **Task 2.1:** Create InsertionPoint component
  - Files: `components/editor/InsertionPoint.tsx`
  - Details: Renders subtle insertion line with "+" button visible on hover
- [ ] **Task 2.2:** Style for minimal visual impact
  - Files: `components/editor/InsertionPoint.tsx`
  - Details: Thin line, small "+" icon, appears on hover
- [ ] **Task 2.3:** Integrate BlockPicker
  - Files: `components/editor/InsertionPoint.tsx`
  - Details: Opens BlockPicker dialog with correct position

### Phase 3: Update SectionsList
**Goal:** Add insertion points between section cards

- [ ] **Task 3.1:** Add InsertionPoint before first section
  - Files: `components/editor/SectionsList.tsx`
  - Details: Position 0 insertion point
- [ ] **Task 3.2:** Add InsertionPoints after each section
  - Files: `components/editor/SectionsList.tsx`
  - Details: Position = index + 1 for each section

### Phase 4: Testing & Validation
**Goal:** Verify functionality works correctly

- [ ] **Task 4.1:** Lint all modified files
  - Command: `npm run lint`
  - Details: Ensure no linting errors
- [ ] **Task 4.2:** Type check all files
  - Command: `npm run type-check`
  - Details: Ensure no TypeScript errors

### Phase 5: Comprehensive Code Review (Mandatory)
**Goal:** Present implementation completion and request thorough code review

- [ ] **Task 5.1:** Present "Implementation Complete!" Message (MANDATORY)
  - Template: Use exact message from section 16, step 7
  - Details: STOP here and wait for user code review approval
- [ ] **Task 5.2:** Execute Comprehensive Code Review (If Approved)
  - Process: Follow step 8 comprehensive review checklist from section 16
  - Details: Read all files, verify requirements, provide detailed summary

### Phase 6: User Browser Testing (Only After Code Review)
**Goal:** Request human testing for UI/UX functionality

- [ ] **Task 6.1:** Present AI Testing Results
  - Files: Summary of linting and type checking results
- [ ] **Task 6.2:** Request User UI Testing
  - Details: User verifies hover behavior, insertion at correct position, etc.

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Task Completion Tracking - MANDATORY WORKFLOW
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes, etc.)

---

## 13. File Structure & Organization

### New Files to Create
```
components/editor/
└── InsertionPoint.tsx   # "+" button between sections
```

### Files to Modify
- [ ] **`components/editor/BlockPicker.tsx`** - Add position, trigger, onClose props
- [ ] **`components/editor/SectionsList.tsx`** - Add InsertionPoint components between cards

### Dependencies to Add
**None** - Uses existing shadcn/ui components

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty page (no sections):** InsertionPoint at position 0 should still work
  - **Analysis Approach:** Test with empty section list
  - **Recommendation:** Position 0 insertion point works regardless of section count
- [ ] **Rapid clicking:** User clicks "+" multiple times quickly
  - **Analysis Approach:** Check if useTransition prevents duplicate submissions
  - **Recommendation:** useTransition already handles pending state
- [ ] **Drag-and-drop interaction:** InsertionPoint shouldn't interfere with DnD
  - **Analysis Approach:** Test dragging sections over insertion points
  - **Recommendation:** InsertionPoint is outside sortable items, shouldn't interfere

### Security & Access Control Review
- [ ] **Authentication:** addSection() already requires userId via requireUserId()
- [ ] **Authorization:** addSection() verifies page ownership

---

## 15. Deployment & Configuration

### Environment Variables
**None required** - No new environment variables needed.

---

## 16. AI Agent Instructions

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for validation
- [ ] No inline styles - use Tailwind classes
- [ ] Ensure responsive design
- [ ] Follow existing component patterns in codebase

### Architecture Compliance
- [ ] Use Server Actions for mutations (existing pattern)
- [ ] Use shadcn/ui components for UI elements
- [ ] Follow existing BlockPicker dialog pattern

---

## 17. Notes & Additional Context

### Design Considerations
- The "+" button should be subtle to avoid visual clutter
- Consider using a thin horizontal line that shows "+" icon on hover
- Should be visually distinct from the drag handle on section cards

### Reference from Backlog
From `ai_docs/features-backlog.md` #70:
> "Show "+" button between section cards on hover"
> "Clicking opens BlockPicker with target position"
> "After adding, auto-select new section and focus inspector"

Note: The "auto-select new section" feature depends on future work (#69 Section Selection). For this task, we'll focus on the insertion functionality only.

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

**Breaking Changes:** None - adding new props to BlockPicker with default values maintains backward compatibility.

**Ripple Effects:** Minimal - InsertionPoint is a self-contained component.

**Performance Implications:** Negligible - adds a few DOM elements between sections.

**User Experience Impact:** Positive - eliminates need to drag sections after adding.

---

*Task Created: 2026-01-20*
*Backlog Item: #70 - Add Section Between Sections*
