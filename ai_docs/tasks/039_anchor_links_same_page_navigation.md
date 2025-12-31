# Task 039: Anchor Links for Same-Page Navigation

> **Status:** Ready for Implementation
> **Priority:** P2 - Medium
> **Complexity:** Medium

---

## 1. Task Overview

### Task Title
**Title:** Anchor Links for Same-Page Navigation

### Goal Statement
**Goal:** Enable users to create single-page websites with navigation that scrolls to sections on the same page. Users can assign optional IDs to sections and use `#section-id` syntax in header navigation links.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip detailed strategic analysis - this is a straightforward implementation with one obvious approach.

### Summary
- Header nav links already accept any URL string
- Users will manually type `#section-id` in the URL field (Option A per user preference)
- Header only (not footer) per user preference
- Manual ID entry (no auto-generation) per user preference

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS

### Current State
- **Header links** accept any URL via text input (see `HeaderEditor.tsx:129-135`)
- **Sections** have no anchor ID field (see `sections.ts` schema)
- **Block rendering** wraps sections in divs but without IDs
- **No smooth scroll** behavior configured

### Existing Codebase Analysis

**Checked:**
- [x] **Database Schema** - `lib/drizzle/schema/sections.ts` - sections table lacks anchor_id column
- [x] **Section Types** - `lib/section-types.ts` - anchor_id is section-level metadata, not content-level
- [x] **Header Editor** - Already has URL input field for nav links
- [x] **Section Card** - Shows block type label, good place for anchor ID display/edit
- [x] **Block Renderer** - Needs to add `id` attribute to section wrappers

---

## 4. Context & Problem Definition

### Problem Statement
Header nav links can only point to other pages. Some single-page sites need links to sections on the same page. Currently there's no way to:
1. Assign an ID to a section
2. Link to sections using `#anchor` syntax
3. Have smooth scrolling behavior

### Success Criteria
- [ ] Each section has optional "Section ID" field in editor
- [ ] Section ID displays as visual indicator when set (badge in section card header)
- [ ] Header nav links work with `#section-id` syntax
- [ ] Smooth scroll behavior when clicking anchor links
- [ ] Section IDs validated (alphanumeric + hyphens only, no spaces)
- [ ] Unique ID validation within a page (warn on duplicates)

---

## 5. Development Mode Context
- **New application in active development**
- **No backwards compatibility concerns**
- **Data loss acceptable** - existing sections have no anchor_id
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can enter optional "Section ID" for any section
- Section ID appears as badge in section card header when set
- User can type `#section-id` in header nav link URL field
- Clicking anchor links smoothly scrolls to the target section
- Invalid IDs show validation error (spaces, special characters)
- Duplicate IDs on same page show warning

### Non-Functional Requirements
- **Performance:** No impact - just adding HTML `id` attribute
- **Security:** ID sanitized to prevent XSS via id attribute
- **Usability:** Clear visual feedback when section has ID
- **Responsive Design:** N/A - section ID UI works same on all devices

### Technical Constraints
- Must work with existing section system
- Must not break existing sections (nullable column)
- ID validation must prevent invalid HTML id characters

---

## 7. Data & Database Changes

### Database Schema Changes
```sql
-- Add anchor_id column to sections table
ALTER TABLE sections ADD COLUMN anchor_id text;

-- Add index for faster lookups when validating uniqueness
CREATE INDEX sections_page_anchor_idx ON sections(page_id, anchor_id);
```

### Data Model Updates
```typescript
// lib/drizzle/schema/sections.ts
export const sections = pgTable(
  "sections",
  {
    // ... existing columns ...
    anchor_id: text("anchor_id"), // Optional section anchor ID for same-page navigation
  },
  (t) => [
    // ... existing indexes ...
    index("sections_page_anchor_idx").on(t.page_id, t.anchor_id),
  ]
);
```

### Data Migration Plan
- [x] No data migration needed - new nullable column
- [x] Existing sections will have `null` anchor_id

### Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate`
- [ ] **Step 2: Create Down Migration** - Create `down.sql` with `ALTER TABLE sections DROP COLUMN anchor_id;`
- [ ] **Step 3: Apply Migration** - Run `npm run db:migrate`

---

## 8. Backend Changes

### Server Actions
- [ ] **`updateSectionAnchorId`** - Update anchor_id for a section with validation
- [ ] **`validateAnchorId`** - Check ID format and uniqueness within page

### Validation Logic
```typescript
// Anchor ID validation rules:
// - Alphanumeric characters and hyphens only
// - Must start with a letter
// - No spaces
// - Max 50 characters
const ANCHOR_ID_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{0,49}$/;
```

---

## 9. Frontend Changes

### New Components
- [ ] **`components/editor/AnchorIdInput.tsx`** - Inline input for section anchor ID with validation

### Component Changes

#### SectionCard.tsx
- Add anchor ID badge in header (shows when ID is set)
- Add inline edit capability for anchor ID
- Show validation errors inline

#### BlockRenderer.tsx (for published pages)
- Add `id` attribute to section wrapper div when anchor_id is set

#### Published Page Layout
- Add smooth scroll CSS behavior

### State Management
- Anchor ID is stored at section level (database column)
- Updates via server action with optimistic UI
- Validation happens client-side (format) and server-side (uniqueness)

---

## 10. Code Changes Overview

### Current Implementation (Before)

**SectionCard.tsx - Header section:**
```tsx
<button
  type="button"
  className="flex items-center gap-3 flex-1 text-left group"
  onClick={() => setIsExpanded(!isExpanded)}
>
  <BlockIcon blockType={section.block_type} ... />
  <span className="font-medium ...">{blockInfo?.label ?? section.block_type}</span>
  {!isExpanded && (
    <span className="text-xs text-muted-foreground ...">Click to edit</span>
  )}
</button>
```

**sections.ts - Schema (no anchor_id):**
```typescript
export const sections = pgTable("sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  page_id: uuid("page_id").notNull()...,
  // ... no anchor_id column
});
```

### After Refactor

**SectionCard.tsx - With anchor ID badge:**
```tsx
<button type="button" className="flex items-center gap-3 flex-1 text-left group" ...>
  <BlockIcon blockType={section.block_type} ... />
  <span className="font-medium ...">{blockInfo?.label ?? section.block_type}</span>

  {/* Anchor ID badge */}
  {section.anchor_id && (
    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
      #{section.anchor_id}
    </span>
  )}

  {!isExpanded && !section.anchor_id && (
    <span className="text-xs text-muted-foreground ...">Click to edit</span>
  )}
</button>
```

**sections.ts - With anchor_id column:**
```typescript
export const sections = pgTable("sections", {
  // ... existing columns ...
  anchor_id: text("anchor_id"), // Optional anchor ID for same-page navigation
}, (t) => [
  // ... existing indexes ...
  index("sections_page_anchor_idx").on(t.page_id, t.anchor_id),
]);
```

**BlockRenderer.tsx - With id attribute:**
```tsx
<div
  id={section.anchor_id || undefined}
  className="section-wrapper"
>
  {/* Block content */}
</div>
```

**Published page layout - Smooth scroll:**
```tsx
// In layout or page component
<style jsx global>{`
  html {
    scroll-behavior: smooth;
  }
`}</style>
```

### Key Changes Summary
- [ ] **Database:** Add `anchor_id` column to sections table
- [ ] **Schema:** Update Drizzle schema with new column + index
- [ ] **SectionCard:** Add anchor ID badge display + inline edit
- [ ] **BlockRenderer:** Add `id` attribute to section wrapper
- [ ] **Published pages:** Add smooth scroll behavior
- [ ] **Validation:** Client + server validation for ID format/uniqueness

---

## 11. Implementation Plan

### Phase 1: Database Changes
**Goal:** Add anchor_id column to sections table

- [ ] **Task 1.1:** Update Drizzle schema
  - Files: `lib/drizzle/schema/sections.ts`
  - Details: Add `anchor_id` text column and index
- [ ] **Task 1.2:** Generate migration
  - Command: `npm run db:generate`
- [ ] **Task 1.3:** Create down migration
  - Files: `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Task 1.4:** Apply migration
  - Command: `npm run db:migrate`

### Phase 2: Server Actions
**Goal:** Add server-side validation and update logic

- [ ] **Task 2.1:** Create anchor ID validation utility
  - Files: `lib/anchor-utils.ts`
  - Details: Format validation regex, sanitization
- [ ] **Task 2.2:** Add updateSectionAnchorId action
  - Files: `app/actions/sections.ts`
  - Details: Update anchor_id with validation, check uniqueness within page

### Phase 3: Editor UI
**Goal:** Add anchor ID display and editing in SectionCard

- [ ] **Task 3.1:** Create AnchorIdInput component
  - Files: `components/editor/AnchorIdInput.tsx`
  - Details: Inline input with validation, edit/save states
- [ ] **Task 3.2:** Update SectionCard with anchor ID badge
  - Files: `components/editor/SectionCard.tsx`
  - Details: Show badge when ID set, click to edit
- [ ] **Task 3.3:** Add to SectionEditor (optional placement)
  - Files: `components/editor/SectionEditor.tsx`
  - Details: Consider adding as first field in expanded section

### Phase 4: Rendering & Smooth Scroll
**Goal:** Make anchor links work on published pages

- [ ] **Task 4.1:** Update BlockRenderer with id attribute
  - Files: `components/render/BlockRenderer.tsx`
  - Details: Add `id={section.anchor_id}` to wrapper
- [ ] **Task 4.2:** Add smooth scroll behavior
  - Files: `app/(sites)/sites/[siteSlug]/page.tsx`, `[pageSlug]/page.tsx`
  - Details: Add `scroll-behavior: smooth` CSS

### Phase 5: Comprehensive Code Review
**Goal:** Verify implementation meets all requirements

- [ ] **Task 5.1:** Review all modified files
- [ ] **Task 5.2:** Verify anchor links work end-to-end
- [ ] **Task 5.3:** Check validation catches edge cases

### Phase 6: User Browser Testing
**Goal:** Human verification of UI/UX

- [ ] **Task 6.1:** Test anchor ID creation in editor
- [ ] **Task 6.2:** Test header nav with `#anchor` URLs
- [ ] **Task 6.3:** Test smooth scroll on published site

---

## 12. Task Completion Tracking

*(Will be updated as tasks are completed)*

---

## 13. File Structure & Organization

### New Files to Create
```
components/editor/
  AnchorIdInput.tsx          # Inline anchor ID input with validation

lib/
  anchor-utils.ts            # Validation and sanitization utilities
```

### Files to Modify
- [ ] `lib/drizzle/schema/sections.ts` - Add anchor_id column
- [ ] `app/actions/sections.ts` - Add updateSectionAnchorId action
- [ ] `components/editor/SectionCard.tsx` - Add anchor ID badge + edit
- [ ] `components/render/BlockRenderer.tsx` - Add id attribute
- [ ] `app/(sites)/sites/[siteSlug]/page.tsx` - Add smooth scroll
- [ ] `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Add smooth scroll

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Invalid ID format:** User enters spaces or special characters
  - **Mitigation:** Client-side validation with helpful error message
- [ ] **Duplicate IDs:** Same ID used on multiple sections
  - **Mitigation:** Warning message (not blocking - HTML allows duplicates)

### Edge Cases
- [ ] **Empty anchor ID:** Treated as no anchor (null)
- [ ] **Very long IDs:** Capped at 50 characters
- [ ] **Reserved IDs:** Check for conflicts with existing HTML ids (header, footer, etc.)

### Security Considerations
- [ ] **XSS via id attribute:** IDs sanitized to alphanumeric + hyphens only
- [ ] **SQL injection:** Using parameterized queries via Drizzle

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow phases in order
2. Create down migration BEFORE running db:migrate
3. Test anchor links work end-to-end before requesting user testing

### Code Quality Standards
- Validate anchor IDs on both client and server
- Use early returns for validation
- Keep AnchorIdInput component focused and reusable

---

## 17. Notes & Additional Context

### User Preferences (Confirmed)
- **Link format:** Manual `#section-id` entry in URL field (Option A)
- **Scope:** Header navigation only (not footer)
- **ID entry:** Manual only (no auto-generation from titles)

### Reference
- Feature from backlog item #23 in `ai_docs/features-backlog.md`

---

*Task Created: 2025-12-30*
