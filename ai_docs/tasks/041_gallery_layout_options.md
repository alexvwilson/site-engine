# Task 041: Gallery Layout Options

> **Task Document for AI-Driven Development**

---

## 1. Task Overview

### Task Title
**Title:** Gallery Block Layout Options - Aspect Ratios, Layout Variants, Columns, Lightbox

### Goal Statement
**Goal:** Transform the basic gallery block into a flexible, feature-rich image gallery with user-configurable aspect ratios, layout variants (grid, masonry, carousel), column settings, gap control, and lightbox functionality. This empowers site owners to create professional image galleries tailored to their content type (portfolios, team photos, product showcases).

---

## 2. Strategic Analysis & Solution Options

### Problem Context
The current gallery has a fixed layout (flex wrap, object-cover, fixed height). Users have no control over how images display, which limits the gallery's usefulness for different content types (e.g., portrait photos need different handling than landscape product shots).

### Solution Options Analysis

#### Option 1: Incremental Enhancement (Recommended)
**Approach:** Add all features to the existing gallery block, extending `GalleryContent` interface.

**Pros:**
- Backwards compatible - existing galleries continue to work
- Single block type to maintain
- Simpler mental model for users

**Cons:**
- Gallery editor becomes more complex
- More props to manage in one component

**Implementation Complexity:** Medium
**Risk Level:** Low - additive changes only

#### Option 2: Separate Block Types
**Approach:** Create separate blocks: `gallery`, `masonry`, `carousel`

**Pros:**
- Simpler individual components
- Clear separation of concerns

**Cons:**
- Users must choose upfront, can't easily switch
- Duplicate code for image management
- More block types to maintain

**Implementation Complexity:** Medium-High
**Risk Level:** Medium - code duplication concerns

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 1 - Incremental Enhancement

**Why:**
1. **User flexibility** - Users can experiment with layouts without recreating content
2. **Code maintainability** - Single source of truth for gallery logic
3. **Backwards compatibility** - Existing galleries work with sensible defaults

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks:** Next.js 15.3, React 19
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **State:** React useState in editors, JSONB content in database
- **Relevant Patterns:** EmbedContent has `aspectRatio` field we can reference

### Current State

**GalleryContent Interface:**
```typescript
export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryContent {
  images: GalleryImage[];
}
```

**GalleryBlock Renderer:**
- Fixed `flex-wrap` layout with `gap: 1.5rem`
- Images flex from 280px to 400px max
- Fixed `h-48` (192px) height with `object-cover`
- Optional captions below each image

**GalleryEditor:**
- Simple list of images with add/remove
- ImageUpload component for each image
- Alt text and caption fields

---

## 4. Context & Problem Definition

### Problem Statement
Gallery has fixed layout (flex wrap, object-cover). No control over:
- Aspect ratio (all images cropped to same height)
- Layout style (no masonry or carousel options)
- Column count (auto-determined by flex)
- Spacing between images
- Click behavior (no lightbox/zoom)

### Success Criteria
- [ ] User can select aspect ratio: Square (1:1), Landscape (16:9, 4:3), Portrait (3:4), Original
- [ ] User can select layout: Grid (default), Masonry, Carousel
- [ ] User can set columns: 2, 3, 4, Auto
- [ ] User can adjust gap: Small, Medium (default), Large
- [ ] User can enable lightbox: Off (default), On
- [ ] Existing galleries continue to work (backwards compatible)
- [ ] All layouts work responsively on mobile
- [ ] Lightbox supports keyboard navigation (arrows, escape)

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns** for schema changes
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can select aspect ratio from dropdown (Square, Landscape 16:9, Landscape 4:3, Portrait 3:4, Original)
- User can select layout variant from dropdown (Grid, Masonry, Carousel)
- User can set column count (2, 3, 4, Auto)
- User can select gap size (Small, Medium, Large)
- User can toggle lightbox on/off
- Carousel layout shows navigation arrows and optional dots
- Lightbox opens on image click, supports keyboard navigation
- All layouts responsive on mobile (stack to fewer columns)

### Non-Functional Requirements
- **Performance:** Lazy-load images in large galleries; carousel only renders visible slides
- **Accessibility:** Lightbox has proper focus trap, keyboard nav, aria labels
- **Responsive:** Mobile shows 1-2 columns max; carousel is touch-swipable

### Technical Constraints
- Must use existing ImageUpload component for image management
- Lightbox must work without external dependencies (keep bundle small)
- Carousel can use simple CSS/JS (no heavy carousel library)

---

## 7. Data & Database Changes

### Database Schema Changes
No database schema changes required. All new fields stored in existing JSONB `content` column.

### Data Model Updates

```typescript
// lib/section-types.ts - Extended GalleryContent interface

export type GalleryAspectRatio = "1:1" | "16:9" | "4:3" | "3:4" | "original";
export type GalleryLayout = "grid" | "masonry" | "carousel";
export type GalleryColumns = 2 | 3 | 4 | "auto";
export type GalleryGap = "small" | "medium" | "large";

export interface GalleryContent {
  images: GalleryImage[];
  // New styling options
  aspectRatio?: GalleryAspectRatio;   // Default: "1:1"
  layout?: GalleryLayout;              // Default: "grid"
  columns?: GalleryColumns;            // Default: "auto"
  gap?: GalleryGap;                    // Default: "medium"
  lightbox?: boolean;                  // Default: false
}
```

### Data Migration Plan
- No migration needed - new fields are optional with defaults
- Existing galleries will render with default values (grid, 1:1, auto, medium, no lightbox)

---

## 8. Backend Changes & Background Jobs

No backend changes required. This is a pure frontend enhancement.

---

## 9. Frontend Changes

### New Components

- [ ] **`components/render/blocks/GalleryLightbox.tsx`** - Modal lightbox for fullscreen image viewing
  - Keyboard navigation (left/right arrows, escape to close)
  - Click outside to close
  - Image counter (1/5)
  - Previous/Next buttons

- [ ] **`components/render/blocks/GalleryCarousel.tsx`** - Carousel variant renderer
  - Previous/Next navigation arrows
  - Optional dot indicators
  - Touch swipe support for mobile
  - Single image visible at a time

- [ ] **`components/render/blocks/GalleryMasonry.tsx`** - Masonry variant renderer
  - Pinterest-style layout with CSS columns
  - Respects column settings
  - Images maintain original aspect ratios

### Component Updates

- [ ] **`components/editor/blocks/GalleryEditor.tsx`** - Add styling controls
  - Aspect ratio dropdown
  - Layout variant dropdown
  - Columns dropdown
  - Gap dropdown
  - Lightbox toggle switch

- [ ] **`components/render/blocks/GalleryBlock.tsx`** - Route to correct layout renderer
  - Switch on layout prop
  - Pass through lightbox handler
  - Apply aspect ratio and gap styles

### State Management
- Lightbox state managed locally in GalleryBlock (open/closed, current index)
- No global state needed

---

## 10. Code Changes Overview

### Current Implementation (Before)

**lib/section-types.ts:**
```typescript
export interface GalleryContent {
  images: GalleryImage[];
}
```

**components/render/blocks/GalleryBlock.tsx:**
```typescript
// Fixed flex layout, h-48 height, object-cover
<div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
  {content.images.map((image, index) => (
    <figure style={{ flex: "1 1 280px", maxWidth: "400px" }}>
      <img className="w-full h-48 object-cover" ... />
    </figure>
  ))}
</div>
```

**components/editor/blocks/GalleryEditor.tsx:**
```typescript
// Only image management, no styling controls
<ImageUpload ... />
<Input ... alt />
<Input ... caption />
```

### After Refactor

**lib/section-types.ts:**
```typescript
export type GalleryAspectRatio = "1:1" | "16:9" | "4:3" | "3:4" | "original";
export type GalleryLayout = "grid" | "masonry" | "carousel";
export type GalleryColumns = 2 | 3 | 4 | "auto";
export type GalleryGap = "small" | "medium" | "large";

export interface GalleryContent {
  images: GalleryImage[];
  aspectRatio?: GalleryAspectRatio;
  layout?: GalleryLayout;
  columns?: GalleryColumns;
  gap?: GalleryGap;
  lightbox?: boolean;
}
```

**components/render/blocks/GalleryBlock.tsx:**
```typescript
export function GalleryBlock({ content, theme }: GalleryBlockProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const layout = content.layout ?? "grid";

  const handleImageClick = (index: number) => {
    if (content.lightbox) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  return (
    <section ...>
      {layout === "grid" && <GalleryGrid ... />}
      {layout === "masonry" && <GalleryMasonry ... />}
      {layout === "carousel" && <GalleryCarousel ... />}

      {content.lightbox && lightboxOpen && (
        <GalleryLightbox
          images={content.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
```

**components/editor/blocks/GalleryEditor.tsx:**
```typescript
// New styling controls section
<div className="space-y-4 p-4 border rounded-lg bg-muted/30">
  <h4>Gallery Settings</h4>

  <div className="grid grid-cols-2 gap-4">
    <Select value={content.layout} onValueChange={...}>
      <SelectItem value="grid">Grid</SelectItem>
      <SelectItem value="masonry">Masonry</SelectItem>
      <SelectItem value="carousel">Carousel</SelectItem>
    </Select>

    <Select value={content.aspectRatio} onValueChange={...}>
      <SelectItem value="1:1">Square (1:1)</SelectItem>
      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
      <SelectItem value="4:3">Landscape (4:3)</SelectItem>
      <SelectItem value="3:4">Portrait (3:4)</SelectItem>
      <SelectItem value="original">Original</SelectItem>
    </Select>

    <Select value={content.columns} onValueChange={...}>
      <SelectItem value="auto">Auto</SelectItem>
      <SelectItem value="2">2 Columns</SelectItem>
      <SelectItem value="3">3 Columns</SelectItem>
      <SelectItem value="4">4 Columns</SelectItem>
    </Select>

    <Select value={content.gap} onValueChange={...}>
      <SelectItem value="small">Small Gap</SelectItem>
      <SelectItem value="medium">Medium Gap</SelectItem>
      <SelectItem value="large">Large Gap</SelectItem>
    </Select>
  </div>

  <div className="flex items-center gap-2">
    <Switch checked={content.lightbox} onCheckedChange={...} />
    <Label>Enable Lightbox</Label>
  </div>
</div>
```

### Key Changes Summary

- [ ] **Type Extensions:** Add 5 new types and 5 optional fields to GalleryContent
- [ ] **Editor Controls:** Add settings panel with dropdowns and toggle
- [ ] **Layout Variants:** Create 3 layout renderers (grid improved, masonry, carousel)
- [ ] **Lightbox Component:** New modal with keyboard nav and touch support
- [ ] **Files Modified:** `lib/section-types.ts`, `lib/section-defaults.ts`, `lib/section-templates.ts`, `GalleryEditor.tsx`, `GalleryBlock.tsx`
- [ ] **Files Created:** `GalleryLightbox.tsx`, `GalleryMasonry.tsx`, `GalleryCarousel.tsx`, `GalleryGrid.tsx`

---

## 11. Implementation Plan

### Phase 1: Type System & Defaults
**Goal:** Extend GalleryContent interface and update defaults

- [ ] **Task 1.1:** Update `lib/section-types.ts`
  - Add `GalleryAspectRatio`, `GalleryLayout`, `GalleryColumns`, `GalleryGap` types
  - Extend `GalleryContent` interface with new optional fields

- [ ] **Task 1.2:** Update `lib/section-defaults.ts`
  - Add default values for new gallery fields

- [ ] **Task 1.3:** Update `lib/section-templates.ts`
  - Update gallery templates with layout presets (portfolio = masonry, team = grid)

### Phase 2: Gallery Editor Controls
**Goal:** Add styling controls to GalleryEditor

- [ ] **Task 2.1:** Update `GalleryEditor.tsx`
  - Add "Gallery Settings" section above image list
  - Add Layout dropdown (Grid, Masonry, Carousel)
  - Add Aspect Ratio dropdown
  - Add Columns dropdown
  - Add Gap dropdown
  - Add Lightbox toggle switch
  - Wire up onChange handlers

### Phase 3: Grid Layout Enhancement
**Goal:** Improve existing grid layout with new options

- [ ] **Task 3.1:** Create `components/render/blocks/gallery/GalleryGrid.tsx`
  - Extract grid logic from GalleryBlock
  - Apply aspect ratio classes
  - Apply column count
  - Apply gap sizes
  - Support click handler for lightbox

- [ ] **Task 3.2:** Update `GalleryBlock.tsx`
  - Import GalleryGrid
  - Route to correct layout based on content.layout
  - Add lightbox state management

### Phase 4: Masonry Layout
**Goal:** Implement Pinterest-style masonry layout

- [ ] **Task 4.1:** Create `components/render/blocks/gallery/GalleryMasonry.tsx`
  - Use CSS columns for masonry effect
  - Respect column count setting
  - Apply gap sizes
  - Images maintain original aspect ratio (override aspectRatio setting for masonry)
  - Support click handler for lightbox

### Phase 5: Carousel Layout
**Goal:** Implement slider/carousel layout

- [ ] **Task 5.1:** Create `components/render/blocks/gallery/GalleryCarousel.tsx`
  - Single image display with navigation
  - Previous/Next arrow buttons
  - Optional dot indicators
  - Keyboard navigation (arrow keys)
  - Touch swipe support (simple implementation)
  - Apply aspect ratio to displayed image

### Phase 6: Lightbox Component
**Goal:** Implement fullscreen lightbox modal

- [ ] **Task 6.1:** Create `components/render/blocks/gallery/GalleryLightbox.tsx`
  - Full-screen modal overlay
  - Current image display (respects original aspect ratio)
  - Previous/Next navigation
  - Image counter (1/5)
  - Close button
  - Click outside to close
  - Keyboard navigation (arrows, escape)
  - Focus trap for accessibility
  - Prevent body scroll when open

### Phase 7: Integration & Testing
**Goal:** Wire everything together and test

- [ ] **Task 7.1:** Update `GalleryBlock.tsx` to use all components
  - Import all layout variants
  - Render correct layout based on setting
  - Manage lightbox state
  - Pass handlers to child components

- [ ] **Task 7.2:** Verify responsive behavior
  - Test all layouts on mobile (320px)
  - Test carousel touch swipe
  - Test lightbox on mobile

- [ ] **Task 7.3:** Verify backwards compatibility
  - Test existing galleries render correctly
  - Verify defaults apply properly

### Phase 8: Code Review & Polish
**Goal:** Final verification and cleanup

- [ ] **Task 8.1:** Run linting on all modified files
- [ ] **Task 8.2:** Verify TypeScript types are correct
- [ ] **Task 8.3:** Test light/dark mode compatibility
- [ ] **Task 8.4:** Update backlog to mark feature complete

---

## 12. Task Completion Tracking

*(To be filled in during implementation)*

---

## 13. File Structure & Organization

### New Files to Create
```
components/render/blocks/gallery/
├── GalleryGrid.tsx        # Grid layout renderer
├── GalleryMasonry.tsx     # Masonry layout renderer
├── GalleryCarousel.tsx    # Carousel layout renderer
└── GalleryLightbox.tsx    # Lightbox modal component
```

### Files to Modify
- `lib/section-types.ts` - Add gallery types and extend interface
- `lib/section-defaults.ts` - Add default gallery settings
- `lib/section-templates.ts` - Update gallery templates
- `components/editor/blocks/GalleryEditor.tsx` - Add settings controls
- `components/render/blocks/GalleryBlock.tsx` - Route to layouts, manage lightbox

### Dependencies to Add
None - using pure CSS/JS implementation for carousel and lightbox.

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Empty gallery with layout selected:** Show placeholder message
- [ ] **Single image in carousel:** Hide navigation arrows
- [ ] **Very large image in lightbox:** Constrain to viewport

### Edge Cases
- [ ] **Mixed aspect ratio images:** Original mode shows actual ratios; other modes crop
- [ ] **Broken image URLs:** Show fallback/placeholder
- [ ] **Carousel with many images:** Consider lazy loading

### Security Considerations
- [ ] **Image URLs:** Already validated by ImageUpload component
- [ ] **Lightbox focus trap:** Prevent tabbing outside modal

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with Phase 1 (types) as foundation
2. Build editor controls (Phase 2) for immediate feedback
3. Implement layouts in order: Grid (easiest), Masonry, Carousel
4. Lightbox last as it integrates with all layouts
5. Test thoroughly on mobile

### Code Quality Standards
- Use Tailwind classes where possible, inline styles for dynamic values
- Keep each layout renderer focused and simple
- Lightbox must be fully accessible (keyboard nav, focus trap)
- All components must support dark mode

---

## 17. Notes & Additional Context

### Reference Implementations
- Aspect ratio pattern: See `EmbedContent.aspectRatio` in section-types.ts
- Layout variants pattern: See `HeaderLayout` and `FooterLayout` types
- Modal pattern: See existing dialog components in `components/ui/dialog.tsx`

### Design Decisions
- **Masonry ignores aspect ratio:** Images in masonry layouts display at original proportions for authentic Pinterest-style effect
- **Carousel shows one image:** Simple implementation; multi-slide carousel could be future enhancement
- **No external dependencies:** Keep bundle lean; carousel uses CSS scroll-snap

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **None expected** - All new fields are optional with defaults

### Ripple Effects Assessment
- [ ] **Section templates** - Should update with layout-specific presets
- [ ] **Preview mode** - Will work automatically (same renderers)
- [ ] **Published sites** - Will work automatically

### Performance Implications
- [ ] **Masonry layout** - CSS columns are performant, no JS layout calculations
- [ ] **Carousel** - Only renders visible slide (good for large galleries)
- [ ] **Lightbox** - Lazy loads via dialog portal, doesn't affect initial render

### User Experience Impacts
- [ ] **Learning curve:** Minimal - dropdown-based settings are intuitive
- [ ] **Feature discovery:** Settings panel clearly visible above image list

---

*Task Document Created: 2025-12-30*
*Feature Backlog Reference: #24 Gallery Layout Options*
