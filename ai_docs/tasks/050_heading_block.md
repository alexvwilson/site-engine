# Task 050: Heading Block Type

> **Created:** 2026-01-01
> **Status:** Ready for Implementation

---

## 1. Task Overview

### Task Title
**Title:** Add Heading Block Type for SEO-Friendly Page Titles

### Goal Statement
**Goal:** Create a new "Heading" block type that allows users to add semantic heading elements (H1, H2, H3) to pages that don't have a Hero section, solving the SEO problem of missing H1 tags on content-focused pages like About, Services, or simple landing pages.

---

## 2. Strategic Analysis & Solution Options

**Analysis Skipped:** This is a straightforward feature addition following established patterns in the codebase. The implementation approach is clear:
- New block type following existing patterns (similar to Text, CTA blocks)
- Simple content structure (title, subtitle, level, alignment)
- Minimal styling options (text color mode only)

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State
- 14 block types exist (header, hero, text, markdown, image, gallery, features, cta, testimonials, contact, footer, blog_featured, blog_grid, embed)
- Hero block is the only block that renders an H1
- Text block TiptapEditor only supports H2/H3 headings
- Pages without Hero sections have no way to include an H1, which is bad for SEO

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- `lib/drizzle/schema/sections.ts` - BLOCK_TYPES array defines all block types
- `lib/section-types.ts` - Content interfaces for each block type
- `lib/section-defaults.ts` - Default content for new sections
- `lib/section-templates.ts` - Pre-designed templates per block type
- `components/editor/blocks/*.tsx` - Editor components pattern
- `components/render/blocks/*.tsx` - Renderer components pattern
- `components/editor/SectionEditor.tsx` - Routes to correct editor
- `components/render/BlockRenderer.tsx` - Routes to correct renderer
- `components/editor/BlockIcon.tsx` - Icon mapping for block types

---

## 4. Context & Problem Definition

### Problem Statement
Not every page has a Hero section, but every page needs an H1 for SEO. Pages like About, Services, or simple content pages often just have a Header, Text blocks, and Footer - leaving no H1 on the page. This is a significant SEO issue that ChatGPT and other AI assistants correctly flag when reviewing site content.

### Success Criteria
- [ ] New "heading" block type available in block picker
- [ ] Users can select heading level (H1, H2, H3)
- [ ] Optional subtitle field renders below main heading
- [ ] Alignment options work correctly (left, center, right)
- [ ] Text color mode affects rendered heading color
- [ ] Heading uses theme's heading font family
- [ ] Block renders correctly in preview and published pages
- [ ] At least 2 templates available (Page Title, Section Divider)

---

## 5. Development Mode Context

- **New application in active development** - no backwards compatibility concerns
- **No existing heading blocks** - pure addition, no migration needed
- **Priority: Speed and simplicity** - keep implementation focused

---

## 6. Technical Requirements

### Functional Requirements
- User can add a Heading block from the block picker
- User can enter a title (required field)
- User can enter an optional subtitle
- User can select heading level: H1, H2, or H3
- User can select alignment: Left, Center, or Right
- User can select text color mode: Auto, Light, or Dark
- Heading renders with theme's heading font family
- Subtitle renders with theme's body font family at smaller size

### Non-Functional Requirements
- **Performance:** Lightweight component, no external dependencies
- **Responsive Design:** Heading text scales appropriately on mobile
- **Theme Support:** Uses CSS variables for colors, respects dark mode

### Technical Constraints
- Must follow existing block type patterns exactly
- No database migration needed (BLOCK_TYPES is an array, not enum in DB)
- Must work with existing undo/redo system in SectionEditor

---

## 7. Data & Database Changes

### Database Schema Changes
**No migration needed.** The `block_type` column uses a TEXT type with an enum constraint defined in application code, not at the database level. Adding a new value to the `BLOCK_TYPES` array is sufficient.

### Data Model Updates

```typescript
// lib/section-types.ts - New interface
export type HeadingLevel = 1 | 2 | 3;
export type HeadingAlignment = "left" | "center" | "right";

export interface HeadingContent {
  title: string;
  subtitle?: string;
  level: HeadingLevel;
  alignment: HeadingAlignment;
  textColorMode?: TextColorMode; // Reuse existing type
}
```

---

## 8. Backend Changes & Background Jobs

### Server Actions
**No new server actions needed.** Existing `updateSection` action handles content updates for all block types.

### Database Queries
**No new queries needed.** Existing section queries work for all block types.

---

## 9. Frontend Changes

### New Components

#### `components/editor/blocks/HeadingEditor.tsx`
Simple editor with:
- Title input (required)
- Subtitle input (optional)
- Level selector (H1/H2/H3 radio or select)
- Alignment selector (left/center/right)
- Text color mode selector

#### `components/render/blocks/HeadingBlock.tsx`
Renderer that:
- Renders appropriate heading tag (h1/h2/h3) based on level
- Applies theme heading font
- Renders subtitle with body font if present
- Applies alignment via Tailwind classes
- Handles text color mode

### Component Updates
- `components/editor/SectionEditor.tsx` - Add HeadingEditor routing
- `components/render/BlockRenderer.tsx` - Add HeadingBlock routing
- `components/editor/BlockIcon.tsx` - Add heading icon (Heading1 from lucide-react)

---

## 10. Code Changes Overview

### 📂 **Files to Modify**

#### `lib/drizzle/schema/sections.ts`
```typescript
// Before
export const BLOCK_TYPES = [
  "header",
  "hero",
  "text",
  // ... other types
  "embed",
] as const;

// After - Add "heading" to the array
export const BLOCK_TYPES = [
  "header",
  "heading",  // NEW - after header, before hero
  "hero",
  "text",
  // ... other types
  "embed",
] as const;
```

#### `lib/section-types.ts`
```typescript
// Add new types
export type HeadingLevel = 1 | 2 | 3;
export type HeadingAlignment = "left" | "center" | "right";

export interface HeadingContent {
  title: string;
  subtitle?: string;
  level: HeadingLevel;
  alignment: HeadingAlignment;
  textColorMode?: TextColorMode;
}

// Update ContentTypeMap
export interface ContentTypeMap {
  header: HeaderContent;
  heading: HeadingContent;  // NEW
  hero: HeroContent;
  // ... rest
}

// Update BLOCK_TYPE_INFO
export const BLOCK_TYPE_INFO: BlockTypeInfo[] = [
  // ... after header entry
  {
    type: "heading",
    label: "Heading",
    description: "Page title or section heading with optional subtitle",
    icon: "heading",
  },
  // ... rest
];
```

#### `lib/section-defaults.ts`
```typescript
heading: {
  title: "Page Title",
  subtitle: "",
  level: 1,
  alignment: "center",
  textColorMode: "auto",
},
```

#### `lib/section-templates.ts`
```typescript
heading: [
  {
    id: "heading-page-title",
    name: "Page Title",
    description: "Centered H1 for page titles",
    content: {
      title: "About Us",
      subtitle: "Learn more about our story and mission",
      level: 1,
      alignment: "center",
      textColorMode: "auto",
    },
  },
  {
    id: "heading-section",
    name: "Section Divider",
    description: "Left-aligned H2 for content sections",
    content: {
      title: "Our Services",
      subtitle: "",
      level: 2,
      alignment: "left",
      textColorMode: "auto",
    },
  },
],
```

### 📂 **Files to Create**

#### `components/editor/blocks/HeadingEditor.tsx`
Simple form with:
- Input for title
- Input for subtitle (optional)
- Select for level (H1/H2/H3)
- Select for alignment
- Select for text color mode

#### `components/render/blocks/HeadingBlock.tsx`
Renders:
- Dynamic heading tag (h1/h2/h3)
- Optional subtitle paragraph
- Proper styling from theme

---

## 11. Implementation Plan

### Phase 1: Type Definitions
**Goal:** Add heading block type to schema and type system

- [ ] **Task 1.1:** Update `lib/drizzle/schema/sections.ts` - Add "heading" to BLOCK_TYPES
- [ ] **Task 1.2:** Update `lib/section-types.ts` - Add HeadingContent interface and BLOCK_TYPE_INFO
- [ ] **Task 1.3:** Update `lib/section-defaults.ts` - Add heading defaults
- [ ] **Task 1.4:** Update `lib/section-templates.ts` - Add heading templates

### Phase 2: Editor Component
**Goal:** Create the editor UI for heading blocks

- [ ] **Task 2.1:** Create `components/editor/blocks/HeadingEditor.tsx`
- [ ] **Task 2.2:** Update `components/editor/SectionEditor.tsx` - Add HeadingEditor routing
- [ ] **Task 2.3:** Update `components/editor/BlockIcon.tsx` - Add heading icon

### Phase 3: Renderer Component
**Goal:** Create the renderer for published pages

- [ ] **Task 3.1:** Create `components/render/blocks/HeadingBlock.tsx`
- [ ] **Task 3.2:** Update `components/render/BlockRenderer.tsx` - Add HeadingBlock routing

### Phase 4: Testing & Validation
**Goal:** Verify all functionality works correctly

- [ ] **Task 4.1:** Run linting on all modified/created files
- [ ] **Task 4.2:** Type check passes
- [ ] **Task 4.3:** Verify block appears in block picker
- [ ] **Task 4.4:** Verify editor UI works (all fields functional)
- [ ] **Task 4.5:** Verify preview renders correctly
- [ ] **Task 4.6:** Verify published page renders correctly

---

## 12. Task Completion Tracking

### Phase 1: Type Definitions ✅ 2026-01-01
- [x] **Task 1.1:** Updated `lib/drizzle/schema/sections.ts` - Added "heading" to BLOCK_TYPES ✓
- [x] **Task 1.2:** Updated `lib/section-types.ts` - Added HeadingContent interface, types, BLOCK_TYPE_INFO ✓
- [x] **Task 1.3:** Updated `lib/section-defaults.ts` - Added heading defaults ✓
- [x] **Task 1.4:** Updated `lib/section-templates.ts` - Added 3 heading templates ✓

### Phase 2: Editor Component ✅ 2026-01-01
- [x] **Task 2.1:** Created `components/editor/blocks/HeadingEditor.tsx` (~120 lines) ✓
- [x] **Task 2.2:** Updated `components/editor/SectionEditor.tsx` - Added import and routing ✓
- [x] **Task 2.3:** Updated `components/editor/BlockIcon.tsx` - Added Heading1 icon ✓

### Phase 3: Renderer Component ✅ 2026-01-01
- [x] **Task 3.1:** Created `components/render/blocks/HeadingBlock.tsx` (~70 lines) ✓
- [x] **Task 3.2:** Updated `components/render/BlockRenderer.tsx` - Added import and routing ✓

### Phase 4: Testing & Validation ✅ 2026-01-01
- [x] **Task 4.1:** ESLint passes (0 errors, pre-existing warnings only) ✓
- [x] **Task 4.2:** TypeScript type-check passes (0 errors) ✓

---

## 13. File Structure & Organization

### New Files to Create
```
components/
├── editor/blocks/
│   └── HeadingEditor.tsx          # Editor UI for heading blocks
└── render/blocks/
    └── HeadingBlock.tsx           # Renderer for heading blocks
```

### Files to Modify
```
lib/
├── drizzle/schema/sections.ts     # Add "heading" to BLOCK_TYPES
├── section-types.ts               # Add HeadingContent interface
├── section-defaults.ts            # Add heading defaults
└── section-templates.ts           # Add heading templates

components/
├── editor/
│   ├── SectionEditor.tsx          # Add HeadingEditor routing
│   └── BlockIcon.tsx              # Add heading icon
└── render/
    └── BlockRenderer.tsx          # Add HeadingBlock routing
```

### Dependencies to Add
None - uses existing dependencies only.

---

## 14. Potential Issues & Security Review

### Error Scenarios
- **Invalid heading level:** Handled by TypeScript - level is constrained to 1 | 2 | 3
- **Empty title:** Could show validation message, but not blocking (user may want to save draft)

### Edge Cases
- **Very long titles:** Should wrap naturally with CSS
- **Special characters:** No issue - React escapes HTML by default

### Security Considerations
- **XSS Protection:** React's JSX escaping handles this automatically
- **No user-generated links:** Title/subtitle are plain text only

---

## 15. Deployment & Configuration

No environment variables or special configuration needed.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow existing block type patterns exactly
2. Keep the editor simple - this is a lightweight block
3. Use existing UI components (Input, Select from shadcn/ui)
4. Reference CTAEditor for editor pattern, HeroBlock for renderer pattern

### Code Quality Standards
- Use early returns
- Follow TypeScript strict mode
- Use existing Tailwind classes for styling
- Use theme CSS variables for colors

---

## 17. Notes & Additional Context

### Design Decisions
- **No background/border styling:** Kept simple intentionally. If users want styled headings, they can use Hero or CTA blocks.
- **Text color mode only:** Allows adaptation to page backgrounds without full styling overhead
- **Subtitle is optional:** Many headings don't need subtitles, but it's nice to have for page titles

### Reference Implementations
- **Editor pattern:** `components/editor/blocks/CTAEditor.tsx` (simple form fields)
- **Renderer pattern:** `components/render/blocks/HeroBlock.tsx` (heading rendering with theme)
- **Type definitions:** `lib/section-types.ts` (existing content interfaces)

---

*Task Document Version: 1.0*
*Last Updated: 2026-01-01*
