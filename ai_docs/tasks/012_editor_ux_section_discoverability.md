# AI Task Template

> **Task:** Improve Section Editor UX - Make content editing discoverable

---

## 1. Task Overview

### Task Title
**Title:** Editor UX - Section Editing Discoverability Fix

### Goal Statement
**Goal:** Make it immediately obvious to users how to edit section content in the page editor. Currently, users must click a small chevron icon to expand sections and reveal edit forms - this is not discoverable, causing users to think they can't edit content at all.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Users are confused about how to edit content on pages. The current UI shows sections as collapsed cards with only a chevron icon to expand. This pattern is not intuitive - users see a preview but don't realize they can click to edit.

### Solution Options Analysis

#### Option 1: Clickable Header + Visual Hints (Recommended)
**Approach:** Make the entire section header clickable to expand, add "Click to edit" hint text, and improve visual affordances.

**Pros:**
- ✅ Minimal code changes - only modifies SectionCard.tsx
- ✅ Maintains existing expand/collapse pattern
- ✅ Clear affordance with hint text
- ✅ Works well on both desktop and mobile

**Cons:**
- ❌ Hint text adds slight visual clutter
- ❌ Still requires expand/collapse interaction

**Implementation Complexity:** Low - Single component modification
**Risk Level:** Low - No architectural changes

#### Option 2: Always-Expanded Editors
**Approach:** Show all section editors expanded by default, with collapse option.

**Pros:**
- ✅ Content immediately visible and editable
- ✅ No hidden interactions

**Cons:**
- ❌ Very long pages with many sections become unwieldy
- ❌ Harder to get overview of page structure
- ❌ Performance impact with many open editors

**Implementation Complexity:** Low - Change default state
**Risk Level:** Medium - May hurt UX for pages with many sections

#### Option 3: Inline Preview Editing
**Approach:** Click directly on rendered content to edit (like Notion or Squarespace).

**Pros:**
- ✅ Most intuitive editing experience
- ✅ WYSIWYG feel

**Cons:**
- ❌ Significant architectural change
- ❌ Complex to implement for all block types
- ❌ Would require rebuilding all editors

**Implementation Complexity:** High - Major refactor
**Risk Level:** High - Significant code changes

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 1 - Clickable Header + Visual Hints

**Why this is the best choice:**
1. **Low risk** - Minimal code changes, easy to test
2. **Quick win** - Can be implemented in under an hour
3. **Solves the problem** - Makes editing discoverable without architectural changes
4. **Reversible** - Easy to adjust or expand later

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Language:** TypeScript 5.x with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS

### Current State
The SectionCard component (`components/editor/SectionCard.tsx`) renders each section with:
- Collapsed state showing: drag handle, block icon, block name, status toggle, action buttons, chevron
- Only the chevron is clickable to expand
- No visual indication that the section is expandable/editable
- Users looking at the preview page (not editor) may not realize they need to go to the editor

### Existing Codebase Analysis

**Relevant Files:**
- `components/editor/SectionCard.tsx` - Main component to modify
- `components/editor/SectionsList.tsx` - Parent container (no changes needed)
- `components/editor/SectionEditor.tsx` - Editor router (no changes needed)

---

## 4. Context & Problem Definition

### Problem Statement
Users cannot discover how to edit section content. They see a collapsed card with section name but don't realize:
1. The card is expandable
2. Clicking the chevron reveals an edit form
3. They need to be in the editor (not preview) to edit

This creates a perception that content is not editable, which is the most critical usability issue in the app.

### Success Criteria
- [ ] Section headers are fully clickable to expand (not just chevron)
- [ ] Visual hint ("Click to edit" or similar) shows on hover
- [ ] Expanded state is visually distinct from collapsed state
- [ ] First-time users can intuitively discover editing within 5 seconds

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- Section header (excluding action buttons) is clickable to expand/collapse
- Hover state shows "Click to edit" hint
- Visual distinction between collapsed and expanded states
- Drag handle, duplicate, delete, and status toggle remain independently clickable

### Non-Functional Requirements
- **Performance:** No impact - pure CSS/interaction changes
- **Usability:** Must be obvious to first-time users
- **Responsive Design:** Works on mobile (tap to expand)

### Technical Constraints
- Must maintain drag-and-drop functionality
- Must not break existing action buttons
- Must preserve keyboard accessibility

---

## 7. Data & Database Changes

**No database changes required.**

---

## 8. Backend Changes & Background Jobs

**No backend changes required.**

---

## 9. Frontend Changes

### Component Modifications

#### `components/editor/SectionCard.tsx`

**Current Implementation:**
```tsx
{/* Header */}
<div className="flex items-center gap-3 p-4 border-b">
  <button className="cursor-grab touch-none ..." {...attributes} {...listeners}>
    <GripVertical className="h-5 w-5" />
  </button>

  <BlockIcon blockType={section.block_type} className="h-5 w-5 text-muted-foreground" />

  <span className="font-medium">
    {blockInfo?.label ?? section.block_type}
  </span>

  <SectionStatusToggle ... />

  <div className="flex-1" />

  <div className="flex items-center gap-1">
    {/* Duplicate button */}
    {/* Delete button */}
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? <ChevronUp /> : <ChevronDown />}
    </Button>
  </div>
</div>
```

**After Refactor:**
```tsx
{/* Header */}
<div className="flex items-center gap-3 p-4 border-b">
  {/* Drag handle - stop propagation to prevent expand */}
  <button
    className="cursor-grab touch-none ..."
    {...attributes}
    {...listeners}
    onClick={(e) => e.stopPropagation()}
  >
    <GripVertical className="h-5 w-5" />
  </button>

  {/* Clickable area to expand/collapse */}
  <button
    type="button"
    className="flex items-center gap-3 flex-1 text-left group"
    onClick={() => setIsExpanded(!isExpanded)}
  >
    <BlockIcon blockType={section.block_type} className="h-5 w-5 text-muted-foreground" />

    <span className="font-medium">
      {blockInfo?.label ?? section.block_type}
    </span>

    {/* Hint text - visible on hover when collapsed */}
    {!isExpanded && (
      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        Click to edit
      </span>
    )}
  </button>

  <SectionStatusToggle ... />

  <div className="flex items-center gap-1">
    {/* Duplicate button */}
    {/* Delete button */}
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? <ChevronUp /> : <ChevronDown />}
    </Button>
  </div>
</div>
```

### Key Changes Summary
- [ ] **Wrap block icon and label in a clickable button** that expands/collapses
- [ ] **Add "Click to edit" hint** that appears on hover (collapsed state only)
- [ ] **Add hover state styling** to indicate clickability
- [ ] **Stop propagation on drag handle** to prevent accidental expand while dragging
- [ ] **Improve visual distinction** - slightly different background when expanded

**Files Modified:**
- `components/editor/SectionCard.tsx` (~30 lines changed)

---

## 10. Code Changes Overview

### Current Implementation (Before)
```tsx
// components/editor/SectionCard.tsx - Header section (lines 79-99)
<div className="flex items-center gap-3 p-4 border-b">
  <button className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors"
    {...attributes}
    {...listeners}
  >
    <GripVertical className="h-5 w-5" />
  </button>

  <BlockIcon blockType={section.block_type} className="h-5 w-5 text-muted-foreground" />

  <span className="font-medium">
    {blockInfo?.label ?? section.block_type}
  </span>

  <SectionStatusToggle sectionId={section.id} status={section.status} />

  <div className="flex-1" />

  <div className="flex items-center gap-1">
    {/* ... action buttons ... */}
    <Button variant="ghost" size="icon" className="h-8 w-8"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </Button>
  </div>
</div>
```

### After Refactor
```tsx
// components/editor/SectionCard.tsx - Header section
<div className={cn(
  "flex items-center gap-3 p-4 border-b transition-colors",
  isExpanded && "bg-muted/30"
)}>
  <button
    className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors"
    {...attributes}
    {...listeners}
    onClick={(e) => e.stopPropagation()}
  >
    <GripVertical className="h-5 w-5" />
  </button>

  {/* Clickable expand/collapse area */}
  <button
    type="button"
    className="flex items-center gap-3 flex-1 text-left group hover:text-primary transition-colors"
    onClick={() => setIsExpanded(!isExpanded)}
  >
    <BlockIcon blockType={section.block_type} className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />

    <span className="font-medium">
      {blockInfo?.label ?? section.block_type}
    </span>

    {!isExpanded && (
      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        Click to edit
      </span>
    )}
  </button>

  <SectionStatusToggle sectionId={section.id} status={section.status} />

  <div className="flex items-center gap-1">
    {/* ... action buttons unchanged ... */}
    <Button variant="ghost" size="icon" className="h-8 w-8"
      onClick={() => setIsExpanded(!isExpanded)}
      aria-label={isExpanded ? "Collapse section" : "Expand section"}
    >
      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </Button>
  </div>
</div>
```

### Key Changes Summary
- [x] **Change 1:** Wrap block icon and label in a clickable button with flex-1 to fill available space
- [x] **Change 2:** Add "Click to edit" hint with hover opacity transition
- [x] **Change 3:** Add hover color change (group-hover:text-primary) for visual feedback
- [x] **Change 4:** Add background color to expanded state (bg-muted/30)
- [x] **Change 5:** Stop propagation on drag handle click to prevent accidental expand
- [x] **Files Modified:** `components/editor/SectionCard.tsx`
- [x] **Impact:** Purely visual/interaction - no data or API changes

---

## 11. Implementation Plan

### Phase 1: Update SectionCard Component
**Goal:** Make section editing discoverable with clickable header and visual hints

- [x] **Task 1.1:** Restructure header to make label area clickable ✓ 2025-12-27
  - Files: `components/editor/SectionCard.tsx`
  - Details: Wrapped BlockIcon and label in a button element with onClick to toggle expand
- [x] **Task 1.2:** Add "Click to edit" hint text ✓ 2025-12-27
  - Files: `components/editor/SectionCard.tsx`
  - Details: Added hint that shows on hover when collapsed
- [x] **Task 1.3:** Add hover and expanded state styling ✓ 2025-12-27
  - Files: `components/editor/SectionCard.tsx`
  - Details: Added group hover effects (text-primary) and expanded background color (bg-muted/30)
- [x] **Task 1.4:** Fix drag handle click propagation ✓ 2025-12-27
  - Files: `components/editor/SectionCard.tsx`
  - Details: Added stopPropagation to prevent expand when clicking drag handle
- [x] **Task 1.5:** Add accessibility improvements ✓ 2025-12-27
  - Files: `components/editor/SectionCard.tsx`
  - Details: Existing aria-label on chevron preserved, button type="button" added

### Phase 2: Testing & Validation
**Goal:** Verify changes work correctly

- [x] **Task 2.1:** Run linting and type-check ✓ 2025-12-27
  - Command: `npm run lint && npm run type-check`
  - Result: No errors in SectionCard.tsx, TypeScript passes
- [ ] **Task 2.2:** Manual browser testing (USER)
  - Test: Click section header expands editor
  - Test: Hover shows "Click to edit" hint
  - Test: Drag handle still works for reordering
  - Test: All action buttons still work
  - Test: Mobile tap to expand works

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** - Use time tool before adding timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp

---

## 13. File Structure & Organization

### Files to Modify
- [ ] **`components/editor/SectionCard.tsx`** - Add clickable header, hints, styling

### No New Files Required

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Error Scenario 1:** Drag handle might trigger expand
  - **Code Review Focus:** Ensure stopPropagation is correctly applied
  - **Potential Fix:** Add onClick handler to drag handle button

### Edge Cases to Consider
- [ ] **Edge Case 1:** Very long block type names
  - **Analysis Approach:** Check if hint text wraps awkwardly
  - **Recommendation:** Use truncate class if needed

### Security & Access Control Review
- [ ] **No security implications** - purely visual/interaction changes

---

## 15. Deployment & Configuration

**No environment variables or configuration changes required.**

---

## 16. AI Agent Instructions

### Implementation Approach
This is a straightforward single-component modification. Follow the implementation plan phases sequentially.

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Ensure responsive design (mobile tap works)
- [ ] Use Tailwind classes only (no inline styles)
- [ ] Maintain accessibility (aria-labels, keyboard navigation)

---

## 17. Notes & Additional Context

### Design Reference
The "Click to edit" pattern is similar to Notion's block hover state and Squarespace's section editing hints.

### Future Enhancements
If this doesn't fully solve discoverability:
- Consider auto-expanding first section
- Add onboarding tooltip for first-time users
- Add "Edit" icon alongside the hint text

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [ ] **No breaking changes** - purely additive UX improvement

#### Ripple Effects Assessment
- [ ] **No ripple effects** - changes are isolated to SectionCard

#### Performance Implications
- [ ] **No performance impact** - CSS-only changes

#### Security Considerations
- [ ] **No security implications**

#### User Experience Impacts
- [ ] **Positive impact** - makes editing discoverable
- [ ] **No workflow disruption** - existing users can still use chevron

### Critical Issues Identification
**No red or yellow flags identified.**

---

*Task Created: 2025-12-27*
*Priority: P0 - Critical*
*Estimated Effort: Low (~30 minutes)*
