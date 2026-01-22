# AI Task Template

## 1. Task Overview

### Task Title
**Title:** Block Type Migration UI - Convert Old Sections to New Primitives

### Goal Statement
**Goal:** Add a "Convert to [Primitive]" button in the InspectorPanel for old block types (hero, cta, heading, features, testimonials, product_grid, image, gallery, embed, blog_featured, blog_grid) that allows users to migrate existing sections to the new unified primitives (hero_primitive, cards, media, blog). This enables users to convert their existing content before we hide the old block types from the "Add Section" panel.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Users have existing sections created with old block types. Before hiding these old types from the block picker, we need to provide a migration path so users can convert their content to the new unified primitives. The conversion should be user-initiated, per-section, with a confirmation dialog.

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Per-section "Convert" button in InspectorPanel header

**Why this is the best choice:**
1. **User Control** - Users can convert sections one at a time, verifying each conversion
2. **Low Risk** - If something goes wrong, only one section is affected
3. **Natural UX** - Button appears in the inspector where users are already editing the section
4. **Copy-Paste Backup** - Users can copy content before converting if they want a manual backup

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS

### Current State
- New unified primitives exist: `richtext`, `hero_primitive`, `cards`, `media`, `blog`
- Old block types still exist and are editable: `hero`, `cta`, `heading`, `features`, `testimonials`, `product_grid`, `image`, `gallery`, `embed`, `blog_featured`, `blog_grid`
- `BLOCK_TYPE_INFO` in `lib/section-types.ts` controls what appears in the block picker
- `text`, `markdown`, `article` are already hidden (converted to `richtext`)
- `primitive-utils.ts` has the mapping from old types to new primitives

### Existing Codebase Analysis

**Relevant Files:**
- `components/editor/InspectorPanel.tsx` - Where convert button will be added
- `lib/primitive-utils.ts` - Has `BLOCK_TYPE_TO_PRIMITIVE` mapping
- `lib/section-types.ts` - Block type definitions and `BLOCK_TYPE_INFO`
- `lib/section-defaults.ts` - Default content for each block type
- `app/actions/sections.ts` - Server actions for section operations

---

## 4. Context & Problem Definition

### Problem Statement
Users have existing sections using old block types. We want to:
1. Allow users to convert these to new primitives via a UI button
2. Show a confirmation dialog before conversion
3. Keep the section selected after conversion so they can verify the result
4. Eventually hide old block types from the "Add Section" panel

### Success Criteria
- [ ] "Convert to [Primitive]" button appears in InspectorPanel header for old block types
- [ ] Clicking button shows confirmation dialog explaining the conversion
- [ ] Confirmation triggers server action that converts the section
- [ ] Section stays selected after conversion, showing new primitive's editor
- [ ] All 11 old block types can be converted to their corresponding primitives
- [ ] Content is properly migrated (no data loss)

---

## 5. Development Mode Context

- **Data loss acceptable** - This is development, aggressive migration is fine
- **No backwards compatibility concerns** - Old block types will eventually be hidden
- **Priority: User control** - Let users convert at their own pace

---

## 6. Technical Requirements

### Functional Requirements
- User can see "Convert to [Primitive]" button when editing an old block type
- User sees confirmation dialog with conversion details
- User can cancel or confirm the conversion
- After conversion, section displays in new primitive's editor
- All content is preserved during conversion

### Non-Functional Requirements
- **Performance:** Conversion should be fast (single DB update)
- **Usability:** Clear UI indicating what will happen
- **Reliability:** Content must not be lost during conversion

---

## 7. Data & Database Changes

### Database Schema Changes
No schema changes needed - we're updating existing `block_type`, `primitive`, `preset`, and `content` columns.

### Data Migration Plan
Each conversion will:
1. Map old `block_type` to new primitive
2. Transform `content` JSON to new format
3. Set `primitive` and `preset` columns
4. Update `block_type` to new value

---

## 8. Backend Changes & Background Jobs

### Server Actions

**`convertSectionToPrimitive(sectionId: string)`**
- Fetches section by ID
- Determines target primitive from `block_type`
- Transforms content to new format
- Updates section with new block_type, primitive, preset, content
- Revalidates page path
- Returns success/error result

### Content Transformation Logic

| Old Type | New Type | Content Changes |
|----------|----------|-----------------|
| `hero` | `hero_primitive` | Add `layout: "full"`, `textAlignment: "center"` |
| `cta` | `hero_primitive` | `description`→`subheading`, single button→`buttons[]`, `layout: "cta"` |
| `heading` | `hero_primitive` | `title`→`heading`, `subtitle`→`subheading`, `level`→`headingLevel`, `alignment`→`textAlignment`, `layout: "title-only"` |
| `features` | `cards` | `features[]`→`items[]` (add `id`), `template: "feature"` |
| `testimonials` | `cards` | `testimonials[]`→`items[]` (add `id`), `template: "testimonial"` |
| `product_grid` | `cards` | Already has `items[]`, add `template: "product"` |
| `image` | `media` | Add `mode: "single"` |
| `gallery` | `media` | `aspectRatio`→`galleryAspectRatio`, `layout`→`galleryLayout`, `mode: "gallery"` |
| `embed` | `media` | `src`→`embedSrc`, `aspectRatio`→`embedAspectRatio`, etc., `mode: "embed"` |
| `blog_featured` | `blog` | `layout`→`featuredLayout`, `mode: "featured"` |
| `blog_grid` | `blog` | Add `mode: "grid"`, `gridLayout: "grid"` |

---

## 9. Frontend Changes

### New Components

**`components/editor/ConvertBlockDialog.tsx`**
- Confirmation dialog for block conversion
- Shows old type → new primitive mapping
- Explains what will happen
- Confirm/Cancel buttons

### Component Updates

**`components/editor/InspectorPanel.tsx`**
- Add "Convert to [Primitive]" button in header for old block types
- Import and use ConvertBlockDialog
- Handle conversion state and refresh

---

## 10. Code Changes Overview

### Current Implementation (Before)

```tsx
// InspectorPanel.tsx - Header section (lines 182-205)
<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
  <div className="flex items-center gap-2 min-w-0">
    <BlockIcon
      blockType={section.block_type}
      className="h-4 w-4 shrink-0 text-muted-foreground"
    />
    <span className="font-medium text-sm truncate">
      {blockInfo?.label ?? section.block_type}
    </span>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    <SaveIndicator status={saveStatus} />
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
      <X className="h-4 w-4" />
    </Button>
  </div>
</div>
```

### After Refactor

```tsx
// InspectorPanel.tsx - Header section with Convert button
<div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
  <div className="flex items-center gap-2 min-w-0">
    <BlockIcon
      blockType={section.block_type}
      className="h-4 w-4 shrink-0 text-muted-foreground"
    />
    <span className="font-medium text-sm truncate">
      {blockInfo?.label ?? section.block_type}
    </span>
    {/* Convert button for old block types */}
    {canConvert && (
      <ConvertBlockDialog
        section={section}
        targetPrimitive={targetPrimitive}
        onConverted={handleConverted}
      />
    )}
  </div>
  <div className="flex items-center gap-2 shrink-0">
    <SaveIndicator status={saveStatus} />
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
      <X className="h-4 w-4" />
    </Button>
  </div>
</div>
```

### Key Changes Summary
- [ ] **New file:** `lib/block-migration.ts` - Content transformation functions
- [ ] **New file:** `components/editor/ConvertBlockDialog.tsx` - Confirmation dialog
- [ ] **Modified:** `app/actions/sections.ts` - Add `convertSectionToPrimitive` action
- [ ] **Modified:** `components/editor/InspectorPanel.tsx` - Add convert button

---

## 11. Implementation Plan

### Phase 1: Content Transformation Logic
**Goal:** Create the content transformation functions

- [ ] **Task 1.1:** Create `lib/block-migration.ts`
  - Files: `lib/block-migration.ts`
  - Details: Functions to transform old content format to new primitive format for each block type

### Phase 2: Server Action
**Goal:** Create the conversion server action

- [ ] **Task 2.1:** Add `convertSectionToPrimitive` to sections actions
  - Files: `app/actions/sections.ts`
  - Details: Server action that performs the conversion and updates the database

### Phase 3: UI Components
**Goal:** Add the convert button and dialog

- [ ] **Task 3.1:** Create ConvertBlockDialog component
  - Files: `components/editor/ConvertBlockDialog.tsx`
  - Details: Dialog with confirmation message and convert/cancel buttons

- [ ] **Task 3.2:** Update InspectorPanel with convert button
  - Files: `components/editor/InspectorPanel.tsx`
  - Details: Add convert button in header for old block types, handle conversion callback

### Phase 4: Testing & Validation
**Goal:** Verify all conversions work correctly

- [ ] **Task 4.1:** Test each block type conversion
  - Details: Create sections with each old type, convert them, verify content preserved

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] Get today's date before adding timestamps
- [ ] Update task document after each completed subtask
- [ ] Mark checkboxes with completion timestamp

---

## 13. File Structure & Organization

### New Files to Create
```
lib/
  block-migration.ts              # Content transformation functions
components/editor/
  ConvertBlockDialog.tsx          # Confirmation dialog component
```

### Files to Modify
- [ ] `app/actions/sections.ts` - Add convertSectionToPrimitive action
- [ ] `components/editor/InspectorPanel.tsx` - Add convert button

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty content fields:** Ensure defaults are applied during transformation
- [ ] **Missing IDs on items:** Generate IDs for features/testimonials that don't have them
- [ ] **Concurrent edits:** User might have unsaved changes when converting

### Security & Access Control Review
- [ ] **Authorization:** Verify user owns the section before converting
- [ ] **Data validation:** Validate section exists and has convertible block type

---

## 15. Deployment & Configuration

No environment variables or deployment changes needed.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard phase-by-phase workflow with user approval between phases.

### Code Quality Standards
- Use TypeScript strict mode
- Add proper error handling for conversion failures
- Follow existing patterns in the codebase

---

## 17. Notes & Additional Context

### Block Type Mapping Reference
From `lib/primitive-utils.ts`:
```typescript
const BLOCK_TYPE_TO_PRIMITIVE: Record<string, PrimitiveInfo> = {
  // Hero primitive
  hero: { primitive: "hero_primitive", preset: "full" },
  cta: { primitive: "hero_primitive", preset: "cta" },
  heading: { primitive: "hero_primitive", preset: "title-only" },
  // Cards primitive
  features: { primitive: "cards", preset: "feature" },
  testimonials: { primitive: "cards", preset: "testimonial" },
  product_grid: { primitive: "cards", preset: "product" },
  // Media primitive
  image: { primitive: "media", preset: "single" },
  gallery: { primitive: "media", preset: "gallery" },
  embed: { primitive: "media", preset: "embed" },
  // Blog primitive
  blog_featured: { primitive: "blog", preset: "featured" },
  blog_grid: { primitive: "blog", preset: "grid" },
};
```

### Follow-Up Task
After users have converted their sections, we'll create a separate task to hide the old block types from `BLOCK_TYPE_INFO` in `lib/section-types.ts`.

---

*Task Number: 081*
*Created: 2025-01-21*
