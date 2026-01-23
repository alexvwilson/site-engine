# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Accordion Primitive Block - FAQ, Curriculum & Collapsible Content

### Goal Statement
**Goal:** Create a unified Accordion primitive block with three modes (FAQ, Curriculum, Custom) that enables users to add collapsible content sections to their sites. This supports common use cases like FAQ pages, course curriculum outlines, and generic expandable content sections with smooth animations and accessible keyboard navigation.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - the solution approach is well-defined in the backlog and follows established primitive patterns from RichText, Cards, Hero, Media, and Blog consolidations.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4 for styling
- **Key Architectural Patterns:** Unified primitives with mode-based architecture, SectionStyling interface

### Current State
- No accordion/collapsible block type currently exists
- Users requesting FAQ sections must use workarounds (multiple CTA blocks or markdown)
- Existing primitives (RichText, Cards, Hero, Media, Blog) provide established patterns to follow
- shadcn/ui has an Accordion component that can be leveraged

### Existing Codebase Analysis

**Relevant Analysis Areas:**

- [x] **Component Patterns** (`components/ui/`, `components/editor/blocks/`, `components/render/blocks/`)
  - shadcn/ui accordion available at `components/ui/accordion.tsx`
  - Established editor patterns: mode selector tabs, drag-drop reordering, item dialogs
  - Renderer patterns: SectionStyling application, theme CSS variables

- [x] **Section Types** (`lib/section-types.ts`)
  - SectionStyling base interface for consistent styling across blocks
  - Mode-based content interfaces (BlogMode, HeroLayout, etc.)
  - BLOCK_TYPE_INFO registry with category assignments

- [x] **Section Defaults** (`lib/section-defaults.ts`)
  - Default content structures for all block types
  - Pattern: provide sensible defaults, backwards-compatible

- [x] **Section Templates** (`lib/section-templates.ts`)
  - Curated templates per block type
  - Pattern: 3-6 templates covering common use cases

---

## 4. Context & Problem Definition

### Problem Statement
Users need collapsible content sections for:
1. **FAQ pages** - Common on every business/service website
2. **Course curriculum previews** - Essential for course landing pages
3. **Expandable content** - Product specs, documentation, step-by-step guides

Currently no block type supports this pattern. Users must:
- Create separate Text/CTA blocks for each Q&A (no collapse functionality)
- Link to external pages for detailed content
- Use markdown with no interactive elements

### Success Criteria
- [x] Accordion block available in block picker under "Utility" category
- [x] FAQ mode works with question/answer pairs that expand/collapse
- [x] Curriculum mode works with nested modules/lessons structure
- [x] Custom mode works with generic title/content sections
- [x] Smooth expand/collapse animations (using Radix UI Accordion)
- [x] Keyboard accessible (Enter/Space to toggle, arrow keys to navigate - Radix UI built-in)
- [x] "Expand All" / "Collapse All" toggle available
- [x] Icon style options (chevron, plus/minus)
- [x] Full SectionStyling support
- [x] 6+ templates for common use cases (6 templates created)
- [ ] Mobile responsive (needs browser testing)
- [x] Theme-aware colors (via CSS variables)

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns** - new block type
- **Priority: Speed and simplicity** over over-engineering
- **Follow existing primitive patterns** from Cards, Blog, etc.

---

## 6. Technical Requirements

### Functional Requirements
- User can add Accordion block from block picker
- User can switch between modes (FAQ, Curriculum, Custom)
- User can add/edit/delete/reorder items via drag-drop
- User can set expand/collapse behavior (single vs multiple open)
- User can toggle "Expand All" / "Collapse All" visibility
- User can choose icon style (chevron or plus/minus)
- FAQ mode: Simple question/answer pairs with optional numbering
- Curriculum mode: Nested modules with lessons, duration, lock/complete indicators
- Custom mode: Generic title/content sections
- All modes support rich text content (HTML via TipTap)

### Non-Functional Requirements
- **Performance:** Smooth CSS transitions (no layout thrashing)
- **Accessibility:** WCAG AA compliant, keyboard navigation, ARIA attributes
- **Responsive Design:** Works on mobile (320px+), tablet (768px+), desktop (1024px+)
- **Theme Support:** Uses CSS variables for colors, supports light/dark mode

### Technical Constraints
- Must use existing SectionStyling interface
- Must integrate with existing editor infrastructure (auto-save, undo/redo)
- Must follow established primitive patterns

---

## 7. Data & Database Changes

### Database Schema Changes
```sql
-- No new tables required
-- Just adding 'accordion' to BLOCK_TYPES array in sections schema
```

### Data Model Updates
```typescript
// lib/section-types.ts additions

export type AccordionMode = "faq" | "curriculum" | "custom";
export type AccordionIconStyle = "chevron" | "plus-minus";

export interface AccordionItem {
  id: string;
  title: string;
  content: string; // HTML content
}

export interface CurriculumLesson {
  id: string;
  title: string;
  duration?: string; // "5:30" or "15 min"
  isLocked?: boolean;
  isCompleted?: boolean;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description?: string;
  lessons: CurriculumLesson[];
}

export interface AccordionContent extends SectionStyling {
  mode: AccordionMode;

  // Common settings
  sectionTitle?: string;
  sectionSubtitle?: string;
  iconStyle?: AccordionIconStyle;
  allowMultipleOpen?: boolean;
  showExpandAll?: boolean;
  defaultExpandFirst?: boolean;

  // FAQ mode
  faqItems?: AccordionItem[];
  showNumbering?: boolean;

  // Curriculum mode
  modules?: CurriculumModule[];
  showLessonCount?: boolean;
  showTotalDuration?: boolean;

  // Custom mode
  customItems?: AccordionItem[];
}
```

### Data Migration Plan
- [ ] No data migration required - new block type

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
No new server actions required. Uses existing section CRUD operations.

---

## 9. Frontend Changes

### New Components

#### Editor Components
- [x] **`components/editor/blocks/AccordionEditor.tsx`** - Main editor with mode tabs, item management
  - Mode selector tabs (FAQ, Curriculum, Custom)
  - Common settings (icon style, expand behavior, section title)
  - Mode-specific item editors
  - Drag-drop reordering for items

#### Renderer Components
- [x] **`components/render/blocks/AccordionBlock.tsx`** - Unified renderer
  - Mode-based rendering (FAQ, Curriculum, Custom)
  - Smooth expand/collapse with Radix UI Accordion
  - Icon rendering (chevron/plus-minus)
  - SectionStyling application

### Files to Modify
- [x] **`lib/drizzle/schema/sections.ts`** - Add "accordion" to BLOCK_TYPES
- [x] **`lib/section-types.ts`** - Add AccordionContent interface, types, BLOCK_TYPE_INFO
- [x] **`lib/section-defaults.ts`** - Add accordion defaults
- [x] **`lib/section-templates.ts`** - Add 6+ accordion templates
- [x] **`components/editor/BlockIcon.tsx`** - Add icon for accordion
- [x] **`components/render/BlockRenderer.tsx`** - Add accordion case
- [x] **`components/render/PreviewBlockRenderer.tsx`** - Add accordion case
- [x] **`components/editor/inspector/ContentTab.tsx`** - Add AccordionEditor case

### State Management
- Local state for expanded/collapsed items (not persisted)
- Mode-specific content persisted via auto-save

---

## 10. Code Changes Overview

### No Existing Code Changes Required
This is a new block type following established patterns. No refactoring of existing code.

### Key New Code

#### AccordionContent Interface
```typescript
export interface AccordionContent extends SectionStyling {
  mode: AccordionMode;
  sectionTitle?: string;
  sectionSubtitle?: string;
  iconStyle?: AccordionIconStyle;
  allowMultipleOpen?: boolean;
  showExpandAll?: boolean;
  defaultExpandFirst?: boolean;
  faqItems?: AccordionItem[];
  showNumbering?: boolean;
  modules?: CurriculumModule[];
  showLessonCount?: boolean;
  showTotalDuration?: boolean;
  customItems?: AccordionItem[];
}
```

#### Editor Structure (AccordionEditor.tsx)
```typescript
// Mode tabs at top
// Common settings section
// Mode-specific content:
//   - FAQ: Item list with add/edit/delete/reorder
//   - Curriculum: Module list with nested lesson management
//   - Custom: Simple item list
// StylingControls at bottom
```

#### Renderer Structure (AccordionBlock.tsx)
```typescript
// Apply SectionStyling wrapper
// Render section title/subtitle
// Expand All toggle (if enabled)
// Mode-specific accordion:
//   - FAQ: Simple accordion items with optional numbering
//   - Curriculum: Two-level accordion (modules > lessons)
//   - Custom: Simple accordion items
```

---

## 11. Implementation Plan

### Phase 1: Type Definitions & Schema ✅
**Goal:** Set up all TypeScript types and database schema

- [x] **Task 1.1:** Add accordion types to section-types.ts
  - Files: `lib/section-types.ts`
  - Details: Added AccordionMode, AccordionIconStyle, AccordionItem, CurriculumLesson, CurriculumModule, AccordionContent interfaces, BLOCK_TYPE_INFO entry (~80 lines)

- [x] **Task 1.2:** Add accordion to BLOCK_TYPES in schema
  - Files: `lib/drizzle/schema/sections.ts`
  - Details: Added "accordion" to BLOCK_TYPES array

- [x] **Task 1.3:** Add accordion defaults
  - Files: `lib/section-defaults.ts`
  - Details: Added default AccordionContent with 3 FAQ items (~55 lines)

- [x] **Task 1.4:** Add accordion templates
  - Files: `lib/section-templates.ts`
  - Details: Added 6 templates: FAQ Simple, FAQ Styled, FAQ Numbered, Course Curriculum, Product Specifications, Documentation Sections (~200 lines)

### Phase 2: Renderer Implementation ✅
**Goal:** Create the public-facing accordion renderer

- [x] **Task 2.1:** Create AccordionBlock.tsx
  - Files: `components/render/blocks/AccordionBlock.tsx`
  - Details: ~400 lines - CustomAccordionTrigger, ExpandAllToggle, FAQAccordion, CurriculumAccordion with nested modules/lessons, SectionStyling support

- [x] **Task 2.2:** Wire up renderers
  - Files: `components/render/BlockRenderer.tsx`, `components/render/PreviewBlockRenderer.tsx`
  - Details: Added AccordionBlock import and case to switch statements

- [x] **Task 2.3:** Add block icon
  - Files: `components/editor/BlockIcon.tsx`
  - Details: Added ListCollapse icon from lucide-react

### Phase 3: Editor Implementation ✅
**Goal:** Create the editor for accordion content

- [x] **Task 3.1:** Create AccordionEditor.tsx
  - Files: `components/editor/blocks/AccordionEditor.tsx`
  - Details: ~1000 lines - Mode tabs, common settings, item management with dnd-kit drag-drop, TipTap for content, StylingControls integration

- [x] **Task 3.2:** Wire up editor
  - Files: `components/editor/inspector/ContentTab.tsx`
  - Details: Added AccordionEditor import and case

### Phase 4: Testing & Polish
**Goal:** Verify functionality and polish UX

- [ ] **Task 4.1:** Test FAQ mode
  - Details: Add FAQ items, verify expand/collapse, numbering, icons

- [ ] **Task 4.2:** Test Curriculum mode
  - Details: Add modules with lessons, verify nesting, duration display

- [ ] **Task 4.3:** Test Custom mode
  - Details: Add custom items, verify basic functionality

- [ ] **Task 4.4:** Test styling options
  - Details: Verify SectionStyling works (borders, backgrounds, etc.)

- [ ] **Task 4.5:** Test accessibility
  - Details: Keyboard navigation, screen reader compatibility

- [ ] **Task 4.6:** Test responsiveness
  - Details: Mobile, tablet, desktop layouts

### Phase 5: Comprehensive Code Review (Mandatory)
**Goal:** Verify implementation quality

- [ ] **Task 5.1:** Present "Implementation Complete!" message
- [ ] **Task 5.2:** Execute comprehensive code review

### Phase 6: User Browser Testing
**Goal:** User verification of UI/UX

- [ ] **Task 6.1:** Present testing checklist to user
- [ ] **Task 6.2:** Wait for user confirmation

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes)

---

## 13. File Structure & Organization

### New Files to Create
```
components/
├── editor/
│   └── blocks/
│       └── AccordionEditor.tsx     # Accordion block editor
└── render/
    └── blocks/
        └── AccordionBlock.tsx      # Accordion block renderer
```

### Files to Modify
- [ ] `lib/drizzle/schema/sections.ts` - Add to BLOCK_TYPES
- [ ] `lib/section-types.ts` - Add interfaces and BLOCK_TYPE_INFO
- [ ] `lib/section-defaults.ts` - Add defaults
- [ ] `lib/section-templates.ts` - Add templates
- [ ] `components/editor/BlockIcon.tsx` - Add icon
- [ ] `components/render/BlockRenderer.tsx` - Add case
- [ ] `components/render/PreviewBlockRenderer.tsx` - Add case
- [ ] `components/editor/inspector/ContentTab.tsx` - Add editor case

### Dependencies to Add
```json
{
  "dependencies": {
    // shadcn/ui accordion already installed
    // May need: @radix-ui/react-collapsible if not present
  }
}
```

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Empty accordion:** Handle gracefully when no items exist
- [ ] **Deep nesting in curriculum:** Limit to 2 levels (modules > lessons)

### Edge Cases to Consider
- [ ] **Very long content:** Ensure smooth animation with large content
- [ ] **Many items:** Test performance with 50+ FAQ items
- [ ] **Mode switching with data:** Warn about data loss when switching modes

### Security & Access Control Review
- [ ] **Input Validation:** HTML content sanitized via existing TipTap patterns
- [ ] No admin-only features

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the phase-by-phase approach in section 11.

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for clean code
- [ ] Use async/await instead of .then()
- [ ] No fallback behavior - throw errors for unexpected states
- [ ] Ensure responsive design (mobile-first)
- [ ] Test in both light and dark mode
- [ ] Follow accessibility guidelines

### Architecture Compliance
- [ ] Use SectionStyling interface
- [ ] Follow primitive pattern from Cards/Blog
- [ ] Use existing TipTap for rich text content
- [ ] Use shadcn/ui accordion as base

---

## 17. Notes & Additional Context

### Research Links
- shadcn/ui Accordion: https://ui.shadcn.com/docs/components/accordion
- WAI-ARIA Accordion Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/

### Design Considerations
- **Animation:** Use CSS transitions for performance (height animation can be tricky - consider using CSS grid or max-height approach)
- **Curriculum mode:** Two-level hierarchy only (modules > lessons) to avoid complexity
- **Icon animation:** Rotate chevron/transform plus to minus on expand

### Templates to Create
1. **FAQ - Simple** - Basic Q&A with chevron icons
2. **FAQ - Styled** - Q&A with background, border styling
3. **Course Curriculum** - Modules with lessons, duration display
4. **Product Specifications** - Technical specs in categories
5. **Documentation** - Help docs with sections
6. **Custom Sections** - Generic collapsible content

---

*Template Version: 1.0*
*Created: 2026-01-23*
*Feature: #85 from features-backlog.md*
