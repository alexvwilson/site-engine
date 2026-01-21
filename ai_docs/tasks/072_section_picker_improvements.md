# AI Task Template

> **Instructions:** Section Picker Improvements - Add search, categories, favorites, and recently used functionality.

---

## 1. Task Overview

### Task Title
**Title:** Section Picker Improvements - Search, Categories, Favorites, and Recent

### Goal Statement
**Goal:** Improve the BlockPicker dialog to help users quickly find the right section type. With 18 block types, the current flat grid is overwhelming. Add search filtering, category tabs, favorites (starred), and recently used sections.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**❌ SKIP STRATEGIC ANALYSIS** - User has already specified the approach (horizontal tabs above grid). Implementation approach is clear with no significant trade-offs to consider.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State
The `BlockPicker` component (`components/editor/BlockPicker.tsx`) currently:
- Shows a flat grid of 18 block types (2-3 columns)
- Each block shows icon, label, and description
- Clicking a block advances to template selection
- No search, no categorization, no favorites/recent

### Existing Codebase Analysis

**🔍 Analysis Checklist - Relevant Areas:**

- [x] **Component Patterns** (`components/ui/`, `components/editor/`)
  - `BlockPicker.tsx` - Current implementation, 142 lines
  - `BlockIcon.tsx` - Icon rendering for each block type
  - `TemplateSelector.tsx` - Template selection step (unchanged)
  - shadcn/ui `Tabs` component available for category tabs
  - shadcn/ui `Input` component for search

- [x] **Lib Utilities** (`lib/section-types.ts`)
  - `BlockTypeInfo` interface: `{ type, label, description, icon }`
  - `BLOCK_TYPE_INFO` array: 18 block types with metadata
  - Need to add `category` field to interface

---

## 4. Context & Problem Definition

### Problem Statement
With 18 block types in a flat grid, users must scan all options to find the one they need. There's no way to:
1. **Search** - Filter by typing (e.g., "hero" or "image")
2. **Browse by category** - Group related blocks (Layout, Media, Cards, etc.)
3. **Access favorites** - Star frequently used block types
4. **Access recent** - Quickly reuse recently added block types

This slows down the section-adding workflow, especially for power users.

### Success Criteria
- [ ] Search input filters block types by label/description
- [ ] Category tabs group blocks logically (All, Layout, Content, Media, Cards, Blog, Utility)
- [ ] Users can star/unstar block types (stored in localStorage)
- [ ] Recently used block types shown at top (last 5, stored in localStorage)
- [ ] Favorites shown at top when in "All" category
- [ ] Keyboard navigation works (arrow keys, enter to select)
- [ ] Responsive design maintained

---

## 5. Development Mode Context

### Development Mode Context
- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- User can type in search box to filter block types by label or description
- User can click category tabs to filter block types by category
- User can star/unstar block types by clicking a star icon
- System shows favorites at top of "All" category
- System tracks last 5 used block types in localStorage
- System shows "Recent" section at top when available
- Search works across all categories (ignores current tab filter)

### Non-Functional Requirements
- **Performance:** Filtering should be instant (client-side)
- **Usability:** Clear visual distinction between categories, favorites, recent
- **Responsive Design:** Must work on mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Theme Support:** Must support both light and dark mode

### Technical Constraints
- Must use localStorage for favorites and recent (no database changes)
- Must maintain existing two-step flow (block type → template)
- Must not break existing `position`, `trigger`, `onClose` props

---

## 7. Data & Database Changes

### Database Schema Changes
**No database changes required.** Favorites and recent stored in localStorage.

### Data Model Updates

```typescript
// lib/section-types.ts - Add category to BlockTypeInfo

export type BlockCategory =
  | "layout"    // header, hero, cta, footer, heading
  | "content"   // text, markdown, article
  | "media"     // image, gallery, embed
  | "cards"     // features, testimonials, product_grid
  | "blog"      // blog_featured, blog_grid
  | "utility";  // contact, social_links

export interface BlockTypeInfo {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  category: BlockCategory; // NEW
}

// Category display info
export const BLOCK_CATEGORIES: { id: BlockCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "layout", label: "Layout" },
  { id: "content", label: "Content" },
  { id: "media", label: "Media" },
  { id: "cards", label: "Cards" },
  { id: "blog", label: "Blog" },
  { id: "utility", label: "Utility" },
];
```

### localStorage Keys
```typescript
// Stored in localStorage
"blockpicker-favorites": string[]  // Array of block type strings
"blockpicker-recent": string[]     // Array of last 5 used block types
```

---

## 8. Backend Changes & Background Jobs

**No backend changes required.** This is a purely client-side feature.

---

## 9. Frontend Changes

### New Components
- [ ] **`components/editor/BlockPickerSearch.tsx`** - Search input with icon, clear button
- [ ] **`components/editor/BlockPickerTabs.tsx`** - Category tabs using shadcn Tabs
- [ ] **`hooks/useBlockPickerStorage.ts`** - Custom hook for favorites/recent localStorage

### Component Updates
- [ ] **`components/editor/BlockPicker.tsx`** - Major refactor:
  - Add search state and filtering logic
  - Add category tab state
  - Integrate favorites/recent storage hook
  - Show "Recent" and "Favorites" sections when in "All" tab
  - Add star toggle on each block card
  - Update block selection to track recent usage

### Page Updates
None - BlockPicker is already integrated.

### State Management
- `searchQuery: string` - Current search text
- `selectedCategory: BlockCategory | "all"` - Current tab
- `favorites: string[]` - From localStorage via hook
- `recent: string[]` - From localStorage via hook

### Context Usage Strategy
No context needed - all state is local to BlockPicker component.

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

```typescript
// components/editor/BlockPicker.tsx (simplified)
<DialogContent className="sm:max-w-2xl">
  <DialogHeader>
    <DialogTitle>Add Section</DialogTitle>
    <DialogDescription>Choose a block type to add to your page</DialogDescription>
  </DialogHeader>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
    {BLOCK_TYPE_INFO.map((block) => (
      <button key={block.type} onClick={() => handleSelectBlockType(block.type)}>
        <BlockIcon blockType={block.type} />
        <span>{block.label}</span>
        <span>{block.description}</span>
      </button>
    ))}
  </div>
</DialogContent>
```

### 📂 **After Refactor**

```typescript
// components/editor/BlockPicker.tsx (simplified)
<DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
  <DialogHeader>
    <DialogTitle>Add Section</DialogTitle>
    <DialogDescription>Choose a block type to add to your page</DialogDescription>
  </DialogHeader>

  {/* Search Input */}
  <BlockPickerSearch value={searchQuery} onChange={setSearchQuery} />

  {/* Category Tabs */}
  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
    <TabsList>
      {BLOCK_CATEGORIES.map((cat) => (
        <TabsTrigger key={cat.id} value={cat.id}>{cat.label}</TabsTrigger>
      ))}
    </TabsList>
  </Tabs>

  {/* Block Grid with Recent/Favorites sections */}
  <ScrollArea className="flex-1">
    {/* Recent Section (when in "All" and has recent) */}
    {selectedCategory === "all" && recent.length > 0 && !searchQuery && (
      <BlockSection title="Recent" blocks={recentBlocks} />
    )}

    {/* Favorites Section (when in "All" and has favorites) */}
    {selectedCategory === "all" && favorites.length > 0 && !searchQuery && (
      <BlockSection title="Favorites" blocks={favoriteBlocks} />
    )}

    {/* All Blocks / Filtered by Category */}
    <BlockSection title={searchQuery ? "Results" : undefined} blocks={filteredBlocks} />
  </ScrollArea>
</DialogContent>
```

### 📂 **lib/section-types.ts - Category additions**

```typescript
// Before: BlockTypeInfo without category
export interface BlockTypeInfo {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
}

// After: BlockTypeInfo with category
export type BlockCategory = "layout" | "content" | "media" | "cards" | "blog" | "utility";

export interface BlockTypeInfo {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  category: BlockCategory;
}

// Add category to each block in BLOCK_TYPE_INFO
export const BLOCK_TYPE_INFO: BlockTypeInfo[] = [
  { type: "header", label: "Header", ..., category: "layout" },
  { type: "heading", label: "Heading", ..., category: "layout" },
  { type: "hero", label: "Hero", ..., category: "layout" },
  // ... etc
];
```

### 🎯 **Key Changes Summary**
- [ ] **Change 1:** Add `category` field to `BlockTypeInfo` interface and all 18 block entries
- [ ] **Change 2:** Create search input with real-time filtering by label/description
- [ ] **Change 3:** Add horizontal category tabs (All, Layout, Content, Media, Cards, Blog, Utility)
- [ ] **Change 4:** Create localStorage hook for favorites and recent tracking
- [ ] **Change 5:** Show Recent and Favorites sections at top of "All" tab
- [ ] **Files Modified:** `lib/section-types.ts`, `components/editor/BlockPicker.tsx`
- [ ] **Files Created:** `hooks/useBlockPickerStorage.ts`
- [ ] **Impact:** Faster section discovery, especially with 18+ block types

---

## 11. Implementation Plan

### Phase 1: Data Model Update
**Goal:** Add category field to block type info

- [x] **Task 1.1:** Update BlockTypeInfo interface ✅ 2026-01-20
  - Files: `lib/section-types.ts`
  - Details: Added `BlockCategory` type, `category` field to interface, `BLOCK_CATEGORIES` export
- [x] **Task 1.2:** Add categories to all block types ✅ 2026-01-20
  - Files: `lib/section-types.ts`
  - Details: Added appropriate category to each of 18 BLOCK_TYPE_INFO entries
- [x] **Task 1.3:** Add BLOCK_CATEGORIES export ✅ 2026-01-20
  - Files: `lib/section-types.ts`
  - Details: Exported category display info array with 7 categories (all + 6 specific)

### Phase 2: Storage Hook
**Goal:** Create localStorage hook for favorites and recent

- [x] **Task 2.1:** Create useBlockPickerStorage hook ✅ 2026-01-20
  - Files: `hooks/useBlockPickerStorage.ts` (NEW - 73 lines)
  - Details: Custom hook managing localStorage for favorites/recent with SSR safety

### Phase 3: UI Components
**Goal:** Build search and category components

- [x] **Task 3.1:** Update BlockPicker with search state ✅ 2026-01-20
  - Files: `components/editor/BlockPicker.tsx`
  - Details: Added search input with clear button, filtering logic by label/description
- [x] **Task 3.2:** Add category tabs ✅ 2026-01-20
  - Files: `components/editor/BlockPicker.tsx`
  - Details: Horizontal tabs using shadcn Tabs component, flex-wrap for responsive
- [x] **Task 3.3:** Add favorites toggle ✅ 2026-01-20
  - Files: `components/editor/BlockPicker.tsx`
  - Details: Star icon on each block card, click to toggle, yellow when favorited
- [x] **Task 3.4:** Add Recent/Favorites sections ✅ 2026-01-20
  - Files: `components/editor/BlockPicker.tsx`
  - Details: Show at top of "All" tab when present, with section headers

### Phase 4: Testing & Polish
**Goal:** Verify functionality works correctly

- [ ] **Task 4.1:** Test search filtering
  - Details: Search filters correctly by label and description
- [ ] **Task 4.2:** Test category tabs
  - Details: Each tab shows correct blocks
- [ ] **Task 4.3:** Test favorites persistence
  - Details: Favorites persist across page reloads
- [ ] **Task 4.4:** Test recent tracking
  - Details: Recent blocks update after selection

### Phase 5: Comprehensive Code Review
**Goal:** Review all changes

- [ ] **Task 5.1:** Present "Implementation Complete!" message
- [ ] **Task 5.2:** Execute comprehensive code review

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

🚨 **CRITICAL: Real-time task completion tracking is mandatory**

- [ ] Update task document immediately after each completed subtask
- [ ] Mark checkboxes as [x] with completion timestamp
- [ ] Add brief completion notes (file paths, key changes, etc.)

---

## 13. File Structure & Organization

### New Files to Create
```
hooks/
  useBlockPickerStorage.ts    # Favorites/recent localStorage hook
```

### Files to Modify
- [ ] **`lib/section-types.ts`** - Add BlockCategory type, category field, BLOCK_CATEGORIES export
- [ ] **`components/editor/BlockPicker.tsx`** - Major refactor with search, tabs, favorites, recent

### Dependencies to Add
None - using existing shadcn components (Tabs, Input already available).

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **localStorage unavailable** (private browsing)
  - **Code Review Focus:** useBlockPickerStorage hook error handling
  - **Potential Fix:** Graceful fallback to empty arrays, no crashes

### Edge Cases to Consider
- [ ] **Search with no results**
  - **Analysis Approach:** Verify empty state message displays
  - **Recommendation:** Show "No blocks match your search" message
- [ ] **All blocks favorited**
  - **Analysis Approach:** Ensure grid doesn't show duplicates
  - **Recommendation:** Don't show favorites section if all blocks are favorites

### Security & Access Control Review
No security concerns - client-side only, no sensitive data.

---

## 15. Deployment & Configuration

### Environment Variables
None required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with Phase 1 (data model) - smallest change, foundation for rest
2. Phase 2 (storage hook) - isolated utility, easy to test
3. Phase 3 (UI) - integrate everything into BlockPicker
4. Phase 4 (testing) - verify all features work

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for cleaner logic
- [ ] No inline styles - use Tailwind classes
- [ ] Ensure responsive design (mobile-first)

---

## 17. Notes & Additional Context

### Block Category Assignments
| Category | Block Types |
|----------|-------------|
| layout | header, heading, hero, cta, footer |
| content | text, markdown, article |
| media | image, gallery, embed |
| cards | features, testimonials, product_grid |
| blog | blog_featured, blog_grid |
| utility | contact, social_links |

### UI Reference
- Tabs: Horizontal tabs above grid (user preference confirmed)
- Search: Standard input with search icon and clear button
- Favorites: Star icon in corner of each block card
- Recent: Separate section header above favorites/all blocks

---

*Task Version: 1.0*
*Created: 2026-01-20*
*Backlog Item: #72*
