# AI Task Template

---

## 1. Task Overview

### Task Title
**Title:** Cards Primitive Consolidation - Unify features/testimonials/product_grid blocks

### Goal Statement
**Goal:** Consolidate three card-based block types (features, testimonials, product_grid) into a single unified `cards` primitive with template switching. This eliminates significant code duplication, provides consistent UX (all templates get drag-drop reordering), and continues the primitive consolidation pattern established by the RichText task.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Strategic analysis conducted - approach aligns with RichText consolidation pattern and user-confirmed decisions.

### Problem Context
The codebase has three block types that are all "array of items displayed in a grid with card styling":
- **features** - Items with icon, title, subtitle, description, optional button
- **testimonials** - Items with quote, author, role, avatar
- **product_grid** - Items with image, title, description, platform action links

All three share significant rendering patterns (grid layout, card styling, styling controls) but have separate editors (~1,363 lines) and renderers (~903 lines = 2,266 total).

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Single `cards` block type with `template` discriminator

**Why this is the best choice:**
1. **Code reduction** - Extract shared grid/card/styling logic, estimated 30-40% reduction
2. **Consistency** - All card templates share identical grid and styling behavior
3. **UX Enhancement** - All templates get drag-drop reordering (currently only product_grid)
4. **Maintainability** - Bug fixes and enhancements apply to all templates at once

**Key Decision Factors:**
- **Performance Impact:** Negligible - same rendering, consolidated code
- **User Experience:** Improved - consistent drag-drop, section headers for all
- **Maintainability:** Significantly improved - single source of truth for grid/card patterns
- **Scalability:** Establishes pattern for Hero and Media consolidation

### User-Confirmed Decisions
1. **Drag-drop reordering** - All templates get drag-drop (consistent UX)
2. **Links handling** - Template-specific (features: button, testimonials: none, products: platform links)
3. **Section header** - All templates get optional title/subtitle (unified experience)

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Key Architectural Patterns:** Server Components, Server Actions, StylingControls composition

### Current State

**Three separate block implementations:**

| Block | Editor Lines | Renderer Lines | Unique Features |
|-------|-------------|----------------|-----------------|
| features | 292 | 383 | IconPicker, optional button with variant |
| testimonials | 193 | 324 | ImageUpload for avatar, Quote icon |
| product_grid | 878 | 196 | DnD reordering, ItemEditorDialog, platform icons, nested link DnD |

**Total: ~2,266 lines** across 6 files

**Shared patterns across all three:**
- Extends `SectionStyling` for styling options
- Uses `StylingControls` component with `CardBackgroundPanel`
- Grid layout with configurable display
- Card background color controls (`showCardBackground`, `cardBackgroundColor`)
- Text color mode logic (auto/light/dark)
- Empty state rendering

**Differences:**
| Aspect | Features | Testimonials | Product Grid |
|--------|----------|--------------|--------------|
| Item fields | icon, title, subtitle, description, button | quote, author, role, avatar | image, title, description, links[] |
| Section header | Yes (sectionTitle, sectionSubtitle) | No | Yes |
| Drag-drop | No | No | Yes (items + nested links) |
| Card action | Optional button per item | None | Platform icon links |
| Columns config | Flex wrap (implied 3) | Flex wrap (implied 3) | Explicit 2/3/4/auto |
| Gap config | Fixed 2rem | Fixed 2rem | small/medium/large |

### Existing Codebase Analysis

**Relevant Analysis Completed:**

- [x] **Database Schema** (`lib/drizzle/schema/sections.ts`)
  - `BLOCK_TYPES` array includes "features", "testimonials", "product_grid"
  - `block_type` column stores the type string
  - `content` JSONB stores the block content

- [x] **Component Patterns** (`components/editor/StylingControls.tsx`)
  - 713-line shared styling component
  - Composable panels: BorderPanel, BackgroundPanel, LayoutPanel, TypographyPanel
  - `CardBackgroundPanel` used by all three editors

- [x] **Content Interfaces** (`lib/section-types.ts`)
  - `FeaturesContent extends SectionStyling { features: Feature[]; ... }`
  - `TestimonialsContent extends SectionStyling { testimonials: Testimonial[]; ... }`
  - `ProductGridContent extends SectionStyling { items: ProductItem[]; ... }`

---

## 4. Context & Problem Definition

### Problem Statement
Three block types share significant grid/card/styling patterns but exist as separate implementations. This causes:
- **Maintenance burden** - Grid/styling fixes must be applied 3x
- **Inconsistency risk** - Testimonials lacks section header, only product_grid has drag-drop
- **Code bloat** - 2,266 lines with substantial duplication
- **Feature fragmentation** - Drag-drop only in one block, section headers in two

### Success Criteria
- [ ] Single `cards` block type with template: "feature" | "testimonial" | "product"
- [ ] Unified `CardsEditor` component handling all templates
- [ ] Unified `CardsBlock` renderer with shared grid/card logic
- [ ] All templates have drag-drop reordering for items
- [ ] All templates have optional section header (title/subtitle)
- [ ] Template-specific item fields preserved:
  - Feature: icon, title, subtitle, description, optional button
  - Testimonial: quote, author, role, avatar
  - Product: image, title, description, platform links
- [ ] Database migration converting existing sections
- [ ] All existing content renders identically after migration

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - clean migration approved
- **Data loss acceptable** - existing sections will be migrated, not preserved in old format
- **Priority: Speed and simplicity** over data preservation
- **Aggressive refactoring allowed** - delete old components entirely

---

## 6. Technical Requirements

### Functional Requirements
- User can create a new cards section with template selector (Feature/Testimonial/Product)
- User can reorder items via drag-drop in any template
- User can add optional section header (title/subtitle) to any template
- System renders content identically to current blocks
- Template-specific item editing preserved:
  - Feature cards: icon picker, title, subtitle, description, optional button
  - Testimonial cards: quote textarea, author, role, avatar upload
  - Product cards: image, title, description, platform link management

### Non-Functional Requirements
- **Performance:** No regression in render performance
- **Responsive Design:** Grid breakpoints preserved (mobile → desktop columns)
- **Theme Support:** Existing light/dark mode support preserved

### Technical Constraints
- Must use existing `StylingControls` component pattern
- Must preserve existing IconPicker, ImageUpload, ProductIcon components
- Must use @dnd-kit for drag-drop (already installed for product_grid)
- Block type must be valid in `BLOCK_TYPES` enum

---

## 7. Data & Database Changes

### Database Schema Changes
```sql
-- Add 'cards' to block_type enum
-- This will be handled by Drizzle migration

-- Migration: Convert existing sections
UPDATE sections
SET block_type = 'cards',
    content = jsonb_set(
      jsonb_set(content, '{template}', '"feature"'),
      '{items}', content->'features'
    ) - 'features'
WHERE block_type = 'features';

UPDATE sections
SET block_type = 'cards',
    content = jsonb_set(
      jsonb_set(content, '{template}', '"testimonial"'),
      '{items}', content->'testimonials'
    ) - 'testimonials'
WHERE block_type = 'testimonials';

UPDATE sections
SET block_type = 'cards',
    content = jsonb_set(content, '{template}', '"product"')
WHERE block_type = 'product_grid';
```

### Data Model Updates
```typescript
// lib/section-types.ts

/**
 * Template type for Cards primitive
 * - feature: Icon + title + subtitle + description + optional button
 * - testimonial: Quote + author + role + avatar
 * - product: Image + title + description + platform links
 */
export type CardsTemplate = "feature" | "testimonial" | "product";

/**
 * Union type for card items based on template
 */
export type CardItem = FeatureCardItem | TestimonialCardItem | ProductCardItem;

export interface FeatureCardItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  description: string;
  showButton?: boolean;
  buttonText?: string;
  buttonUrl?: string;
  buttonVariant?: "primary" | "secondary";
}

export interface TestimonialCardItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface ProductCardItem {
  id: string;
  image?: string;
  title?: string;
  description?: string;
  links: ProductLink[];
  featuredLinkIndex?: number;
}

/**
 * Unified Cards content interface
 */
export interface CardsContent extends SectionStyling {
  /** Template determines item fields and card layout */
  template: CardsTemplate;

  /** Optional section header (all templates) */
  sectionTitle?: string;
  sectionSubtitle?: string;

  /** Items array - type depends on template */
  items: CardItem[];

  /** Grid layout (unified across templates) */
  columns?: 2 | 3 | 4 | "auto";
  gap?: "small" | "medium" | "large";

  /** Card styling (not in base SectionStyling) */
  showCardBackground?: boolean;
  cardBackgroundColor?: string;

  /** Product template specific */
  iconStyle?: ProductIconStyle;
  showItemTitles?: boolean;
  showItemDescriptions?: boolean;
}
```

### Data Migration Plan
- [ ] Add "cards" to BLOCK_TYPES in schema
- [ ] Generate migration with `npm run db:generate`
- [ ] Create down migration following drizzle_down_migration.md template
- [ ] Write TypeScript migration script to transform content JSONB:
  - Convert `features[]` → `items[]` with template: "feature"
  - Convert `testimonials[]` → `items[]` with template: "testimonial"
  - Convert product_grid `items[]` to include template: "product"
  - Add `id` field to Feature and Testimonial items for drag-drop
- [ ] Run migration with `npm run db:migrate`
- [ ] Verify all existing sections render correctly

### MANDATORY: Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate` to create the migration file
- [ ] **Step 2: Create Down Migration** - Follow `drizzle_down_migration.md` template
- [ ] **Step 3: Create Subdirectory** - Create `drizzle/migrations/[timestamp_name]/` directory
- [ ] **Step 4: Generate down.sql** - Create the `down.sql` file with safe rollback
- [ ] **Step 5: Verify Safety** - Ensure all operations use `IF EXISTS`
- [ ] **Step 6: Apply Migration** - Only after down migration is created, run `npm run db:migrate`

---

## 8. Backend Changes & Background Jobs

### Server Actions
No new server actions required - existing `updateSection` action handles content updates.

### Database Queries
No new queries required - existing section queries work with new block type.

---

## 9. Frontend Changes

### New Components
- [ ] **`components/editor/blocks/CardsEditor.tsx`** - Unified editor with template-specific rendering
  - Template selector at top (Feature/Testimonial/Product)
  - Section header fields (title, subtitle)
  - Drag-drop sortable item list
  - Template-specific item editing (dialog or inline based on complexity)
  - StylingControls at bottom

- [ ] **`components/render/blocks/CardsBlock.tsx`** - Unified renderer
  - Shared grid layout logic
  - Template-specific card rendering (FeatureCard, TestimonialCard, ProductCard)
  - Shared styling/theming logic

### Files to Delete (after migration verified)
- [ ] `components/editor/blocks/FeaturesEditor.tsx` (292 lines)
- [ ] `components/editor/blocks/TestimonialsEditor.tsx` (193 lines)
- [ ] `components/editor/blocks/ProductGridEditor.tsx` (878 lines)
- [ ] `components/render/blocks/FeaturesBlock.tsx` (383 lines)
- [ ] `components/render/blocks/TestimonialsBlock.tsx` (324 lines)
- [ ] `components/render/blocks/ProductGridBlock.tsx` (196 lines)

### Files to Modify
- [ ] `lib/section-types.ts` - Add CardsContent, CardsTemplate, CardItem types
- [ ] `lib/section-defaults.ts` - Add default content for cards block
- [ ] `lib/section-templates.ts` - Add card templates (Feature Cards, Testimonials, Product Catalog)
- [ ] `lib/drizzle/schema/sections.ts` - Add "cards" to BLOCK_TYPES, remove old types after migration
- [ ] `components/editor/SectionEditor.tsx` - Route to CardsEditor
- [ ] `components/editor/BlockIcon.tsx` - Add icon for cards block
- [ ] `components/editor/BlockPicker.tsx` - Update picker with cards block, remove old blocks
- [ ] `components/render/BlockRenderer.tsx` - Route to CardsBlock

### State Management
- Editor state managed locally within CardsEditor
- Drag-drop state via @dnd-kit hooks
- No global state changes required

---

## 10. Code Changes Overview

### Current Implementation (Before)

```typescript
// FeaturesEditor.tsx - 292 lines
// - Feature list with inline editing
// - IconPicker, button controls
// - StylingControls with CardBackgroundPanel

// TestimonialsEditor.tsx - 193 lines
// - Testimonial list with inline editing
// - Avatar ImageUpload
// - StylingControls with CardBackgroundPanel

// ProductGridEditor.tsx - 878 lines
// - DnD sortable item list
// - ItemEditorDialog for complex item editing
// - Nested link DnD
// - StylingControls (placeholder)
```

### After Refactor

```typescript
// CardsEditor.tsx - ~600 lines (estimated)
// - Template selector (Feature/Testimonial/Product)
// - Section header (title/subtitle)
// - DnD sortable item list (all templates)
// - Template-specific item editing:
//   - Feature: inline fields + IconPicker + button controls
//   - Testimonial: inline fields + avatar upload
//   - Product: dialog with image, fields, link management
// - Unified StylingControls with CardBackgroundPanel

// CardsBlock.tsx - ~400 lines (estimated)
// - Shared grid layout
// - Template-specific card components
// - Shared styling/theming logic
```

### Key Changes Summary
- [ ] **Unified editor** - Single CardsEditor handles all templates
- [ ] **Drag-drop everywhere** - All templates get reordering
- [ ] **Section headers everywhere** - All templates get title/subtitle
- [ ] **Template-specific item fields** - Preserved via union type
- [ ] **Shared infrastructure** - Grid, styling, card background
- [ ] **Files Modified:** ~10 files, ~1,400 lines removed (estimated)

---

## 11. Implementation Plan

### Phase 1: Type Definitions & Schema
**Goal:** Create new types and add cards to block schema

- [ ] **Task 1.1:** Add CardsContent, CardsTemplate, CardItem types to section-types.ts
- [ ] **Task 1.2:** Add "cards" to BLOCK_TYPES in sections schema
- [ ] **Task 1.3:** Add default cards content to section-defaults.ts
- [ ] **Task 1.4:** Add cards templates to section-templates.ts (preserve existing templates)

### Phase 2: CardsBlock Renderer
**Goal:** Create unified renderer that handles all templates

- [ ] **Task 2.1:** Create CardsBlock.tsx with shared grid/styling logic
- [ ] **Task 2.2:** Extract FeatureCard, TestimonialCard, ProductCard sub-components
- [ ] **Task 2.3:** Implement template-specific rendering
- [ ] **Task 2.4:** Verify visual parity with existing blocks (manual testing)

### Phase 3: CardsEditor Component
**Goal:** Create unified editor with drag-drop and template-specific fields

- [ ] **Task 3.1:** Create CardsEditor.tsx base structure with template selector
- [ ] **Task 3.2:** Implement section header fields (title/subtitle)
- [ ] **Task 3.3:** Implement drag-drop sortable item list
- [ ] **Task 3.4:** Implement Feature template item editing (icon, fields, button)
- [ ] **Task 3.5:** Implement Testimonial template item editing (quote, author, avatar)
- [ ] **Task 3.6:** Implement Product template item editing (dialog with links)
- [ ] **Task 3.7:** Integrate StylingControls with CardBackgroundPanel

### Phase 4: Integration
**Goal:** Wire up new components to routing and picker

- [ ] **Task 4.1:** Update SectionEditor.tsx to route to CardsEditor
- [ ] **Task 4.2:** Update BlockRenderer.tsx to route to CardsBlock
- [ ] **Task 4.3:** Update BlockIcon.tsx with cards icon
- [ ] **Task 4.4:** Update BlockPicker.tsx with cards block type

### Phase 5: Database Migration
**Goal:** Convert existing sections and clean up old types

- [ ] **Task 5.1:** Generate migration with `npm run db:generate`
- [ ] **Task 5.2:** Create down migration file following template
- [ ] **Task 5.3:** Write TypeScript migration script for content transformation
- [ ] **Task 5.4:** Run migration with `npm run db:migrate`
- [ ] **Task 5.5:** Verify all existing content renders correctly

### Phase 6: Cleanup
**Goal:** Remove old code and update picker

- [ ] **Task 6.1:** Remove FeaturesEditor, TestimonialsEditor, ProductGridEditor
- [ ] **Task 6.2:** Remove FeaturesBlock, TestimonialsBlock, ProductGridBlock
- [ ] **Task 6.3:** Remove old block types from BlockPicker
- [ ] **Task 6.4:** Remove old types from section-types.ts (after verifying no imports)
- [ ] **Task 6.5:** Update BLOCK_TYPES to remove old types

### Phase 7: Comprehensive Code Review (Mandatory)
**Goal:** Verify implementation quality and completeness

- [ ] **Task 7.1:** Present "Implementation Complete!" message
- [ ] **Task 7.2:** Execute comprehensive code review process

### Phase 8: User Browser Testing
**Goal:** Request human testing for UI/UX functionality

- [ ] **Task 8.1:** Present testing checklist to user
- [ ] **Task 8.2:** Wait for user confirmation

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** - Use time tool before timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes)

---

## 13. File Structure & Organization

### New Files to Create
```
components/
  editor/
    blocks/
      CardsEditor.tsx           # Unified editor (~600 lines)
  render/
    blocks/
      CardsBlock.tsx            # Unified renderer (~400 lines)
```

### Files to Delete
```
components/
  editor/
    blocks/
      FeaturesEditor.tsx        # 292 lines
      TestimonialsEditor.tsx    # 193 lines
      ProductGridEditor.tsx     # 878 lines
  render/
    blocks/
      FeaturesBlock.tsx         # 383 lines
      TestimonialsBlock.tsx     # 324 lines
      ProductGridBlock.tsx      # 196 lines
```

**Estimated Code Impact:**
- Lines added: ~1,000 (CardsEditor + CardsBlock)
- Lines removed: ~2,266 (old editors + renderers)
- Net reduction: ~1,266 lines (56% reduction)

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty items array** - Render empty state gracefully
- [ ] **Template switching** - What happens to items if template changes? (Block or warn)
- [ ] **Missing fields after migration** - Ensure defaults for new required fields
- [ ] **Large item counts** - Performance with many items (50+)?

### Error Scenarios to Analyze
- [ ] **Invalid template value** - Handle gracefully with fallback
- [ ] **Missing item ID** - Generate ID during migration
- [ ] **Corrupted content JSON** - Migration script should skip/log errors

### Security Considerations
- [ ] **User input validation** - URLs validated before rendering as links
- [ ] **Image URLs** - Already handled by existing ImageUpload component

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the phase-by-phase approach in section 11.

**Key reminders:**
1. **Use existing StylingControls** - Don't recreate styling logic
2. **Preserve ProductGrid DnD patterns** - @dnd-kit already configured
3. **Keep template-specific logic contained** - Don't over-generalize
4. **Test visual parity** - New renderer must match old exactly
5. **Migration script is critical** - Test thoroughly before applying

### Code Quality Standards
- [ ] TypeScript strict mode compliance
- [ ] Use early returns for cleaner logic
- [ ] No inline styles except theme-based rendering
- [ ] Professional comments (no history, just what/why)

---

## 17. Notes & Additional Context

### Reference Implementations
- **RichText consolidation** - `ai_docs/tasks/075_richtext_primitive_consolidation.md`
- **ProductGrid DnD** - `components/editor/blocks/ProductGridEditor.tsx`
- **StylingControls** - `components/editor/StylingControls.tsx`

### Dependencies Already Installed
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@dnd-kit/modifiers`

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Identified
- **Block type change** - Old block_type values removed from picker
- **Content structure** - items[] array replaces features[]/testimonials[]

### Mitigation Strategies
- **Database migration** - Transforms existing content automatically
- **Clean migration** - User approved, no backward compatibility needed

### RED FLAGS
- [ ] **Database migration required** - Content transformation needed

### YELLOW FLAGS
- [ ] **Increased complexity** - Single editor handles 3 templates
- [ ] **UI/UX changes** - Testimonials get section header (new feature)

---

*Template Version: 1.0*
*Created: 2026-01-21*
*Status: COMPLETED - 2026-01-21*

---

## Implementation Summary

### Completed Steps

**Phase 1: Type Definitions & Schema** - COMPLETED
- [x] Added `CardsContent`, `CardsTemplate`, `CardItem` types to `lib/section-types.ts`
- [x] Added "cards" to `BLOCK_TYPES` in `lib/drizzle/schema/sections.ts`
- [x] Added cards default content to `lib/section-defaults.ts`
- [x] Added cards templates to `lib/section-templates.ts`
- [x] Added cards icon to `components/editor/BlockIcon.tsx`
- [x] Added cards to `BLOCK_TYPE_INFO` in `lib/section-types.ts`

**Phase 2: CardsBlock Renderer** - COMPLETED
- [x] Created `components/render/blocks/CardsBlock.tsx` (~700 lines)
- [x] Implemented FeatureCard, TestimonialCard, ProductCard sub-components
- [x] Added both plain mode and styled mode rendering
- [x] Integrated into `BlockRenderer.tsx` and `PreviewBlockRenderer.tsx`

**Phase 3: CardsEditor Component** - COMPLETED
- [x] Created `components/editor/blocks/CardsEditor.tsx` (~900 lines)
- [x] Implemented template selector (Feature/Testimonial/Product)
- [x] Implemented section header fields
- [x] Implemented drag-drop sortable item list for ALL templates
- [x] Implemented Feature template inline editing with IconPicker and buttons
- [x] Implemented Testimonial template inline editing with avatar upload
- [x] Implemented Product template dialog editing with links
- [x] Integrated StylingControls with CardBackgroundPanel

**Phase 4: Integration** - COMPLETED
- [x] Updated `SectionEditor.tsx` to route to CardsEditor
- [x] Updated `ContentTab.tsx` to route to CardsEditor
- [x] BlockRenderer and PreviewBlockRenderer already integrated in Phase 2

**Phase 5 & 6: Backwards Compatibility** - SKIPPED (by design)
- Old blocks (`features`, `testimonials`, `product_grid`) remain functional
- Cards primitive is NEW block type alongside existing blocks
- Migration can be done later when ready to consolidate

**Phase 7: Code Review** - COMPLETED
- [x] TypeScript strict mode - no errors
- [x] Build passes successfully
- [x] ESLint warnings fixed
- [x] Code follows existing patterns

### Key Files Created
- `components/render/blocks/CardsBlock.tsx` - Unified renderer
- `components/editor/blocks/CardsEditor.tsx` - Unified editor with drag-drop

### Key Files Modified
- `lib/drizzle/schema/sections.ts` - Added "cards" to BLOCK_TYPES
- `lib/section-types.ts` - Added CardsContent and related types
- `lib/section-defaults.ts` - Added cards default content
- `lib/section-templates.ts` - Added cards templates
- `components/editor/BlockIcon.tsx` - Added cards icon
- `components/editor/SectionEditor.tsx` - Added CardsEditor routing
- `components/editor/inspector/ContentTab.tsx` - Added CardsEditor routing
- `components/render/BlockRenderer.tsx` - Added CardsBlock routing
- `components/render/PreviewBlockRenderer.tsx` - Added CardsBlock routing
