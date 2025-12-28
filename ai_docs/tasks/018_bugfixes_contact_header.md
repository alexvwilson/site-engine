# Task 018: Bugfixes - ContactBlock Error & Header Link Improvements

> **Created:** 2025-12-27
> **Status:** In Progress

---

## 1. Task Overview

### Task Title
**Title:** Fix ContactBlock Server Component Error & Improve Header Link UX

### Goal Statement
**Goal:** Fix the runtime error when rendering ContactBlock on published pages, and improve the header editor UX by adding drag-and-drop reordering for navigation links. These fixes ensure AI-generated layouts render correctly and give users better control over their site navigation.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Three related issues have been identified after adding `header` to the AI layout suggestion system:

1. **ContactBlock Runtime Error**: The ContactBlock has an `onSubmit` handler that causes "Event handlers cannot be passed to Client Component props" error when rendered in Server Component context.

2. **Header Links Not Auto-Updating**: When new pages are added to a site, the header section doesn't automatically reflect them. (This is by design - headers are user-editable content, but may confuse users)

3. **Header Links Reordering**: Users cannot drag-and-drop to reorder navigation links in the header editor.

### Solution Options Analysis

#### Option 1: Minimal Fix - Remove onSubmit Handler
**Approach:** Simply remove the `onSubmit={(e) => e.preventDefault()}` from ContactBlock since it's already display-only.

**Pros:**
- ✅ Simplest fix, single line change
- ✅ No architectural changes
- ✅ Maintains Server Component benefits

**Cons:**
- ❌ Form could technically submit if somehow enabled

**Implementation Complexity:** Low
**Risk Level:** Low

#### Option 2: Make ContactBlock a Client Component
**Approach:** Add "use client" directive to ContactBlock.

**Pros:**
- ✅ Allows event handlers
- ✅ Future-proof for adding form interactivity

**Cons:**
- ❌ Unnecessary client-side JavaScript
- ❌ Larger bundle size for no benefit

**Implementation Complexity:** Low
**Risk Level:** Low

### Recommendation & Rationale

**🎯 RECOMMENDED SOLUTION:** Option 1 - Remove the onSubmit handler

**Why this is the best choice:**
1. **No benefit to the handler** - The form inputs are already `disabled` and the button is `disabled`
2. **Server Components are preferred** - Keeps rendering on server, better performance
3. **Minimal change** - Low risk of introducing new bugs

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.x with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS

### Current State

**ContactBlock (`components/render/blocks/ContactBlock.tsx`):**
- Line 42: `onSubmit={(e) => e.preventDefault()}` causes Server Component error
- All form inputs are already `disabled`
- Submit button is already `disabled`
- The handler serves no purpose

**HeaderEditor (`components/editor/blocks/HeaderEditor.tsx`):**
- Links are rendered in array order
- Add/Remove functionality exists
- No drag-and-drop reordering
- No integration with site pages

### Existing Codebase Analysis

- [x] **Components analyzed:**
  - `ContactBlock.tsx` - Has problematic onSubmit handler
  - `HeaderEditor.tsx` - Missing drag-and-drop for links
  - `SectionCard.tsx` - Uses dnd-kit for section reordering (can reference pattern)

---

## 4. Context & Problem Definition

### Problem Statement
1. **Critical Bug:** ContactBlock crashes published pages with runtime error
2. **UX Improvement:** Header links cannot be reordered via drag-and-drop

### Success Criteria
- [x] ContactBlock renders without error on published pages
- [ ] Header editor supports drag-and-drop reordering of navigation links
- [ ] Link order is preserved when saving

---

## 5. Development Mode Context

- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- ContactBlock must render on Server Components without error
- Header editor must allow drag-and-drop reordering of links
- Link order must persist through save operations

### Non-Functional Requirements
- **Performance:** No unnecessary client-side JavaScript
- **Usability:** Intuitive drag handle for reordering

---

## 7. Data & Database Changes

No database changes required.

---

## 8. Backend Changes & Background Jobs

No backend changes required.

---

## 9. Frontend Changes

### Files to Modify

1. **`components/render/blocks/ContactBlock.tsx`**
   - Remove `onSubmit={(e) => e.preventDefault()}` from form

2. **`components/editor/blocks/HeaderEditor.tsx`**
   - Add dnd-kit integration for link reordering
   - Add drag handle to each link row
   - Implement `handleDragEnd` to reorder links array

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**ContactBlock.tsx:42**
```tsx
<form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
```

**HeaderEditor.tsx:80-119** (Link list without drag-drop)
```tsx
{content.links.map((link, index) => (
  <div key={index} className="flex items-end gap-3">
    {/* Label input */}
    {/* URL input */}
    {/* Delete button */}
  </div>
))}
```

### 📂 **After Refactor**

**ContactBlock.tsx:42**
```tsx
<form className="space-y-4">
```

**HeaderEditor.tsx** (With dnd-kit)
```tsx
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={content.links.map((_, i) => `link-${i}`)}>
    {content.links.map((link, index) => (
      <SortableLinkItem
        key={`link-${index}`}
        id={`link-${index}`}
        link={link}
        index={index}
        onChange={handleLinkChange}
        onRemove={handleRemoveLink}
        disabled={disabled}
      />
    ))}
  </SortableContext>
</DndContext>
```

### 🎯 **Key Changes Summary**
- [x] **Change 1:** Remove onSubmit handler from ContactBlock form
- [ ] **Change 2:** Add dnd-kit drag-and-drop to HeaderEditor links
- [ ] **Files Modified:** `ContactBlock.tsx`, `HeaderEditor.tsx`

---

## 11. Implementation Plan

### Phase 1: Fix ContactBlock Error (Critical)
**Goal:** Remove the problematic onSubmit handler

- [x] **Task 1.1:** Remove onSubmit from ContactBlock form ✓ 2025-12-27
  - Files: `components/render/blocks/ContactBlock.tsx`
  - Details: Remove `onSubmit={(e) => e.preventDefault()}`

### Phase 2: Add Header Link Drag-and-Drop
**Goal:** Allow users to reorder navigation links

- [ ] **Task 2.1:** Add dnd-kit imports and setup
  - Files: `components/editor/blocks/HeaderEditor.tsx`
  - Details: Import DndContext, SortableContext, useSortable

- [ ] **Task 2.2:** Create SortableLinkItem component
  - Files: `components/editor/blocks/HeaderEditor.tsx`
  - Details: Wrap link row with useSortable, add drag handle

- [ ] **Task 2.3:** Implement handleDragEnd
  - Files: `components/editor/blocks/HeaderEditor.tsx`
  - Details: Reorder links array based on drag result

- [ ] **Task 2.4:** Test drag-and-drop functionality
  - Files: N/A
  - Details: Verify links can be reordered and order persists

### Phase 3: Testing & Validation
**Goal:** Verify all fixes work correctly

- [ ] **Task 3.1:** Test ContactBlock on published pages
- [ ] **Task 3.2:** Test header link reordering in editor
- [ ] **Task 3.3:** Verify link order persists after save

---

## 12. Task Completion Tracking

### Phase 1 Progress
- [x] Task 1.1: Remove onSubmit handler ✓ 2025-12-27

### Phase 2 Progress
- [x] Task 2.1: Add dnd-kit setup ✓ 2025-12-27
- [x] Task 2.2: Create SortableLinkItem ✓ 2025-12-27
- [x] Task 2.3: Implement handleDragEnd ✓ 2025-12-27
- [ ] Task 2.4: User testing of functionality

---

## 13. File Structure & Organization

No new files needed. Modifying existing files only.

---

## 14. Potential Issues & Security Review

### Error Scenarios
- **Drag-drop edge cases:** Empty links array, single link
- **State sync:** Ensure parent component receives updated order

### Security
- No security concerns - UI-only changes

---

## 15. Deployment & Configuration

No environment variables or configuration needed.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Fix ContactBlock first (critical bug)
2. Then implement drag-and-drop (UX improvement)
3. Reference existing dnd-kit usage in SectionCard.tsx

---

## 17. Notes & Additional Context

### Reference Implementation
- `components/editor/SectionCard.tsx` uses dnd-kit for section reordering
- Can adapt the same pattern for header links

### About "Header Not Updating with Pages"
This is actually expected behavior - headers are user-editable content, not auto-generated. Users manually add/remove links. A future enhancement could be a "Sync with Pages" button, but that's a separate feature.

---

*Task Document Version: 1.0*
*Last Updated: 2025-12-27*
