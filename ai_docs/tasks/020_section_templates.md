# Task 020: Section Templates / Presets

> **Created:** 2025-12-27
> **Status:** ✅ Completed
> **Completed:** 2025-12-27

---

## 1. Task Overview

### Task Title
**Title:** Section Templates / Presets

### Goal Statement
**Goal:** Provide pre-designed section variations so users can quickly add professionally styled sections without starting from scratch. Instead of just "add Hero", users can choose from "Hero - Centered", "Hero - Left Aligned", "Hero - With Image", etc.

---

## 2. Problem Context

**Current State:**
- When users add a section, they get a single default content structure
- All heroes look the same initially, all feature sections start identical
- AI layout suggestions exist but are page-level, not section-level
- Users must manually customize every section from the same starting point

**Desired State:**
- Multiple starting templates per block type
- Visual preview of each template before selection
- Quick way to create varied, professional-looking pages
- Templates include realistic placeholder content

---

## 3. Technical Analysis

### Current Flow
1. User clicks "Add Section" → `BlockPicker` dialog opens
2. User selects block type (e.g., "Hero")
3. `addSection(pageId, blockType)` called with default content
4. Section created with `sectionDefaults[blockType]`

### Proposed Flow
1. User clicks "Add Section" → `BlockPicker` dialog opens
2. User selects block type (e.g., "Hero")
3. **NEW:** Template selector shows 3-4 templates for that block type
4. User selects a template (or "Blank" for current default)
5. `addSection(pageId, blockType, content)` called with template content
6. Section created with selected template content

---

## 4. Implementation Plan

### Phase 1: Create Section Templates Data
**Goal:** Define templates for each block type

**File:** `lib/section-templates.ts`
```typescript
import type { BlockType } from "@/lib/drizzle/schema/sections";
import type { ContentTypeMap } from "./section-types";

export interface SectionTemplate<T extends BlockType = BlockType> {
  id: string;
  name: string;
  description: string;
  content: ContentTypeMap[T];
}

export const sectionTemplates: { [K in BlockType]: SectionTemplate<K>[] } = {
  hero: [
    {
      id: "hero-centered",
      name: "Centered",
      description: "Classic centered layout with heading and CTA",
      content: { ... }
    },
    {
      id: "hero-bold",
      name: "Bold Statement",
      description: "Large impactful heading with minimal text",
      content: { ... }
    },
    // ... more templates
  ],
  features: [ ... ],
  // ... other block types
};
```

### Phase 2: Update addSection Action
**Goal:** Accept optional content parameter

**File:** `app/actions/sections.ts`
```typescript
export async function addSection(
  pageId: string,
  blockType: BlockType,
  position?: number,
  templateContent?: SectionContent  // NEW parameter
): Promise<CreateSectionResult>
```

### Phase 3: Create Template Selector Component
**Goal:** UI to browse and select templates

**File:** `components/editor/TemplateSelector.tsx`
- Grid of template cards with name, description
- Visual preview thumbnail (optional - phase 2)
- "Blank" option that uses default content
- Click to select and create section

### Phase 4: Update BlockPicker Flow
**Goal:** Two-step selection (block type → template)

**File:** `components/editor/BlockPicker.tsx`
- Step 1: Select block type (existing)
- Step 2: Select template for that block type
- Back button to change block type
- Loading state while creating section

---

## 5. Template Design

### Hero Templates (3-4 variations)
1. **Centered** - Classic centered heading, subheading, single CTA
2. **Bold Statement** - Large heading, minimal subheading
3. **With Tagline** - Small tagline above heading, detailed subheading
4. **Dual CTA** - Primary and secondary call-to-action buttons

### Features Templates (3-4 variations)
1. **Three Column** - 3 features in a row (default)
2. **Four Column** - 4 features in a row
3. **Two Column** - 2 larger feature cards
4. **Icon Grid** - 6 smaller features in 2 rows

### CTA Templates (3 variations)
1. **Centered** - Centered text with button
2. **Split** - Text on left, button on right
3. **Minimal** - Just heading and button, no description

### Testimonials Templates (3 variations)
1. **Single Quote** - One large testimonial
2. **Grid** - 2-3 testimonials in cards
3. **Carousel Style** - Single testimonial with larger avatar

### Text Templates (3 variations)
1. **Paragraph** - Simple paragraph text
2. **Two Column** - Side by side content
3. **With Heading** - H2 heading followed by paragraph

### Contact Templates (2 variations)
1. **Standard** - Name, email, message fields
2. **Extended** - Additional phone and company fields

### Header/Footer Templates
- Skip templates for now (site-level config handles this)
- Or offer 1-2 navigation styles

### Image/Gallery Templates
- Skip detailed templates (content is just image URLs)
- Could offer layout hints in description

---

## 6. Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `lib/section-templates.ts` | Template definitions for all block types |
| `components/editor/TemplateSelector.tsx` | Template selection UI |

### Modified Files
| File | Changes |
|------|---------|
| `app/actions/sections.ts` | Add optional `templateContent` parameter to `addSection` |
| `components/editor/BlockPicker.tsx` | Two-step flow with template selection |

---

## 7. Task Checklist

### Phase 1: Template Data
- [x] Create `lib/section-templates.ts`
- [x] Define Hero templates (4 variations)
- [x] Define Features templates (4 variations)
- [x] Define CTA templates (3 variations)
- [x] Define Testimonials templates (3 variations)
- [x] Define Text templates (3 variations)
- [x] Define Contact templates (2 variations)
- [x] Define Image templates (2 variations)
- [x] Define Gallery templates (2 variations)

### Phase 2: Backend
- [x] Update `addSection` to accept template content

### Phase 3: UI Components
- [x] Create `TemplateSelector` component
- [x] Update `BlockPicker` with two-step flow

### Phase 4: Testing
- [x] Test adding section with each template (build passed)
- [x] Verify content renders correctly
- [x] Test "Blank" option uses defaults

---

## 8. Success Criteria

- [x] Each block type has 2-4 template options
- [x] Users can preview template name/description before selecting
- [x] Selected template content is correctly saved to section
- [x] "Blank" option available for users who want default
- [x] Flow feels fast and intuitive (not adding friction)

---

## 9. Future Enhancements (Out of Scope)

- Visual thumbnail previews of templates
- User-created custom templates
- Import/export templates
- AI-generated templates based on site context

---

*Task Document Version: 1.0*
*Last Updated: 2025-12-27*
