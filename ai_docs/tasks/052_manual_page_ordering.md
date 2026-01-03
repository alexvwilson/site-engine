# AI Task Document: Manual Page Ordering

> **Task #052** | Feature from Backlog #40

---

## 1. Task Overview

### Task Title
**Title:** Manual Page Ordering with Drag-and-Drop

### Goal Statement
**Goal:** Allow users to manually reorder pages in their site dashboard using drag-and-drop, with the order syncing to the published site navigation. This gives users control over how their pages are organized and displayed.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - this is a straightforward feature with one clear implementation approach (drag-and-drop with database order column), matching existing patterns in the codebase.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Drag-and-Drop:** @dnd-kit already installed and used for section reordering

### Current State
- Pages are ordered by `updated_at DESC` (most recently updated first)
- No `display_order` column exists in pages table
- PagesList uses a table-based layout
- SectionsList already has drag-and-drop reordering implemented with dnd-kit

### Existing Codebase Analysis

**Relevant patterns analyzed:**

- [x] **Database Schema** (`lib/drizzle/schema/pages.ts`)
  - Pages table has: id, site_id, user_id, title, slug, status, is_home, meta fields, timestamps
  - No ordering column exists

- [x] **Server Actions** (`app/actions/sections.ts`)
  - `reorderSections()` provides exact pattern to follow for `reorderPages()`
  - Uses transaction to update positions atomically

- [x] **Component Patterns** (`components/editor/SectionsList.tsx`, `SectionCard.tsx`)
  - dnd-kit implementation with DndContext, SortableContext, useSortable
  - Sensors configured for pointer and keyboard
  - Uses useTransition for optimistic UI

---

## 4. Context & Problem Definition

### Problem Statement
Pages are displayed in a fixed order (by updated date), giving users no control over organization. When building a site, users want to arrange pages in a logical order that reflects their site structure and navigation flow.

### Success Criteria
- [x] User can drag pages to reorder them in the dashboard
- [x] Order persists after page refresh (stored in database)
- [x] New pages are added to the end of the list
- [x] Published site navigation reflects the custom order
- [x] Home page can be reordered freely (not locked)
- [x] UI converts from table to card layout (matches sections pattern)

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns** - can make breaking changes
- **Data loss acceptable** - existing data can be migrated
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can drag-and-drop pages to reorder them
- Order persists in database via `display_order` column
- New pages get `display_order` = max + 1 (end of list)
- Published site navigation uses `display_order` for link ordering

### Non-Functional Requirements
- **Performance:** Reorder operation should complete in <500ms
- **Usability:** Drag handle clearly visible, smooth animations
- **Responsive Design:** Works on tablet and desktop (drag may be disabled on mobile)

### Technical Constraints
- Must use existing dnd-kit library (already installed)
- Follow existing SectionsList/SectionCard patterns

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
ALTER TABLE pages ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

-- Initialize existing pages by created_at order within each site
UPDATE pages SET display_order = subq.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY site_id ORDER BY created_at) as row_num
  FROM pages
) subq
WHERE pages.id = subq.id;
```

### Data Model Updates

```typescript
// lib/drizzle/schema/pages.ts
export const pages = pgTable("pages", {
  // ... existing columns
  display_order: integer("display_order").notNull().default(0),
});
```

### Down Migration Safety Protocol
- [x] **Step 1:** Generate migration with `npm run db:generate`
- [x] **Step 2:** Create down migration following `drizzle_down_migration.md`
- [x] **Step 3:** Create subdirectory for down.sql
- [x] **Step 4:** Generate down.sql with safe rollback
- [x] **Step 5:** Verify safety with `IF EXISTS`
- [x] **Step 6:** Only then run `npm run db:migrate`

---

## 8. Backend Changes

### Server Actions

**File:** `app/actions/pages.ts`

```typescript
export async function reorderPages(
  siteId: string,
  pageIds: string[]
): Promise<ActionResult> {
  const userId = await requireUserId();

  // Verify site ownership
  // Verify all pages belong to site
  // Update display_order in transaction
  // Revalidate paths
}
```

### Database Queries

**File:** `lib/queries/pages.ts`

Update `getPagesBySite()`:
```typescript
.orderBy(asc(pages.display_order), asc(pages.created_at))
```

---

## 9. Frontend Changes

### Component Updates

**File:** `components/pages/PagesList.tsx`
- Convert from `<Table>` to div-based card layout
- Add DndContext, SortableContext wrapper
- Add useSensors for pointer/keyboard
- Add handleDragEnd to call reorderPages()
- Add useTransition for pending state

**File:** `components/pages/PageRow.tsx`
- Convert from `<TableRow>` to styled div card
- Add useSortable hook
- Add drag handle (GripVertical icon)
- Apply transform/transition styles
- Maintain click-to-navigate behavior

---

## 10. Code Changes Overview

### Current Implementation (Before)

```tsx
// components/pages/PagesList.tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Page</TableHead>
      <TableHead>Slug</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Updated</TableHead>
      <TableHead className="w-[50px]"></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {pages.map((page) => (
      <PageRow key={page.id} page={page} siteId={siteId} />
    ))}
  </TableBody>
</Table>
```

```tsx
// components/pages/PageRow.tsx
<TableRow className="cursor-pointer hover:bg-muted/50" onClick={handleRowClick}>
  <TableCell>{page.title}</TableCell>
  <TableCell>/{page.slug}</TableCell>
  <TableCell><PageStatusBadge /></TableCell>
  <TableCell>{formatDistanceToNow(...)}</TableCell>
  <TableCell><PageActions /></TableCell>
</TableRow>
```

### After Refactor

```tsx
// components/pages/PagesList.tsx
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={pages.map(p => p.id)} strategy={verticalListSortingStrategy}>
    <div className={cn("space-y-2", isPending && "opacity-70")}>
      {pages.map((page) => (
        <PageRow key={page.id} page={page} siteId={siteId} />
      ))}
    </div>
  </SortableContext>
</DndContext>
```

```tsx
// components/pages/PageRow.tsx
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });

<div ref={setNodeRef} style={style} className="border rounded-lg bg-card p-4 flex items-center gap-4">
  <button {...attributes} {...listeners} className="cursor-grab">
    <GripVertical className="h-5 w-5" />
  </button>
  <div className="flex-1" onClick={handleRowClick}>
    {/* Page title, slug, status, updated */}
  </div>
  <PageActions />
</div>
```

### Key Changes Summary
- [x] **Database:** Add `display_order` integer column to pages table
- [x] **Query:** Change ordering from `updated_at DESC` to `display_order ASC`
- [x] **Server Action:** Add `reorderPages()` following `reorderSections()` pattern
- [x] **PagesList:** Convert table to div layout, add dnd-kit context
- [x] **PageRow:** Convert to card, add useSortable hook and drag handle

---

## 11. Implementation Plan

### Phase 1: Database Changes
**Goal:** Add display_order column with proper migration

- [ ] **Task 1.1:** Update pages schema with display_order column
  - Files: `lib/drizzle/schema/pages.ts`
- [ ] **Task 1.2:** Generate migration
  - Command: `npm run db:generate`
- [ ] **Task 1.3:** Create down migration file
  - Files: `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Task 1.4:** Apply migration
  - Command: `npm run db:migrate`

### Phase 2: Backend Updates
**Goal:** Update queries and add reorder action

- [ ] **Task 2.1:** Update getPagesBySite query ordering
  - Files: `lib/queries/pages.ts`
- [ ] **Task 2.2:** Add reorderPages server action
  - Files: `app/actions/pages.ts`
- [ ] **Task 2.3:** Update createPage to set display_order
  - Files: `app/actions/pages.ts`

### Phase 3: Frontend Updates
**Goal:** Convert UI and add drag-and-drop

- [ ] **Task 3.1:** Update PagesList with dnd-kit
  - Files: `components/pages/PagesList.tsx`
- [ ] **Task 3.2:** Update PageRow to sortable card
  - Files: `components/pages/PageRow.tsx`

### Phase 4: Testing & Verification
**Goal:** Verify all functionality works

- [ ] **Task 4.1:** Run linting on modified files
- [ ] **Task 4.2:** Type check all changes
- [ ] **Task 4.3:** Code review

### Phase 5: User Testing
**Goal:** User verifies in browser

- [ ] **Task 5.1:** 👤 USER TESTING - Verify drag-and-drop in browser
- [ ] **Task 5.2:** 👤 USER TESTING - Verify order persists after refresh
- [ ] **Task 5.3:** 👤 USER TESTING - Verify new pages added to end

---

## 12. Files to Modify

| File | Changes |
|------|---------|
| `lib/drizzle/schema/pages.ts` | Add `display_order` column |
| `lib/queries/pages.ts` | Change orderBy to `display_order` |
| `app/actions/pages.ts` | Add `reorderPages()`, update `createPage()` |
| `components/pages/PagesList.tsx` | Convert to card layout, add dnd-kit |
| `components/pages/PageRow.tsx` | Convert to sortable card with drag handle |

---

## 13. Potential Issues & Security Review

### Error Scenarios
- **Concurrent edits:** Two users reordering same site's pages
  - Mitigation: Last write wins (acceptable for this use case)
- **Invalid page IDs:** Malicious reorder request with wrong page IDs
  - Mitigation: Verify all page IDs belong to user's site

### Edge Cases
- **Single page:** Should still render correctly (no drag needed)
- **Empty pages:** Empty state should still work
- **Large number of pages:** Performance with 50+ pages

---

## 14. AI Agent Instructions

### Implementation Approach
1. Complete each phase before moving to next
2. Update this document with completion timestamps
3. Run linting after each file modification
4. Create down migration BEFORE running db:migrate

### Code Quality Standards
- Follow existing dnd-kit patterns from SectionsList
- Use TypeScript strict mode
- Add proper error handling in server action

---

*Task Created: 2026-01-02*
*Status: Ready for Implementation*
