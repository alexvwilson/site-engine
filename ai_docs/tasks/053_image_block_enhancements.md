# Task 053: Image Block Enhancements

> **Backlog Item:** #41 (P1 - High Priority)
> **Created:** 2026-01-02

---

## 1. Task Overview

### Task Title
**Title:** Image Block Enhancements - Styling, Layouts, and Description Field

### Goal Statement
**Goal:** Enhance the Image block to match the styling capabilities of other blocks (Text, Features, CTA) and add layout flexibility for image + text combinations. This addresses user requests for full-width options, styling customization, and the ability to add longer descriptions alongside images.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip detailed strategic analysis - the approach is straightforward:
- Follow established patterns from Text Block Styling (#28) and Multi-Block Styling (#30)
- Implementation path is clear with no significant architectural decisions needed

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State

**Current ImageContent Interface (minimal):**
```typescript
export interface ImageContent {
  src: string;
  alt: string;
  caption?: string;
}
```

**Current ImageEditor (~60 lines):**
- Image upload via ImageUpload component
- Alt text input
- Simple caption input (plain text)

**Current ImageBlock Renderer (~45 lines):**
- Fixed `max-w-4xl` container
- Image with caption in figcaption
- No styling options, no layout flexibility

**Gap:** Image block is the only content block without:
- Styling options (border, background, overlay)
- Width/size controls
- Layout variations
- Rich text description field

---

## 4. Context & Problem Definition

### Problem Statement
The Image block is the most basic content block, lacking the styling and layout options available in other blocks. Users want to:
1. Display images at different sizes (contained vs. full-width)
2. Add borders, backgrounds, and overlays like other blocks
3. Include longer descriptions/captions with formatting
4. Position text alongside images (not just below)

### Success Criteria
- [ ] Image block has `displaySize` option: Contained, Wide, Full-width
- [ ] Image block has `layout` option: Image Only, Image Left + Text, Image Right + Text, Image Top + Text, Image Bottom + Text
- [ ] Rich text description field (TipTap) visible when layout includes text
- [ ] Styling options matching other blocks (enableStyling toggle, border, background, overlay, text color)
- [ ] 3-4 starter templates available
- [ ] Responsive: Side-by-side layouts stack vertically on mobile
- [ ] Works in both light and dark mode

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - existing Image blocks will use defaults
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can select display size: Contained (max-w-4xl), Wide (max-w-6xl), Full-width (max-w-full)
- User can select layout: Image Only, Image Left, Image Right, Image Top, Image Bottom
- When layout includes text, a rich text editor appears for the description
- User can toggle styling on/off with collapsible styling controls
- Styling includes: border (show/width/radius/color), background image, overlay color/opacity, text color mode

### Non-Functional Requirements
- **Performance:** Lazy load TipTap editor (dynamic import)
- **Responsive Design:** Side-by-side layouts (left/right) stack vertically on mobile (< 768px)
- **Theme Support:** Uses CSS variables, supports light/dark mode
- **Accessibility:** Proper alt text, semantic HTML (figure/figcaption)

### Technical Constraints
- Must follow existing patterns from TextEditor/TextBlock for styling
- Use existing ImageUpload component for image selection
- Use existing TipTap editor for rich text description

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - content stored as JSONB in sections table.

### Data Model Updates

**Updated ImageContent Interface:**
```typescript
// New types for Image block
export type ImageDisplaySize = "contained" | "wide" | "full";
export type ImageLayout = "image-only" | "image-left" | "image-right" | "image-top" | "image-bottom";

export interface ImageContent {
  src: string;
  alt: string;
  caption?: string;

  // NEW: Layout options
  displaySize?: ImageDisplaySize;
  layout?: ImageLayout;
  description?: string; // Rich text HTML (only used when layout includes text)

  // NEW: Master styling toggle
  enableStyling?: boolean;

  // NEW: Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // NEW: Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // NEW: Background & overlay options
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}
```

### Data Migration Plan
- No migration needed - new fields are optional with sensible defaults
- Existing Image blocks will render as "image-only" with "contained" size

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
**No backend changes required** - this is purely a frontend enhancement to the existing section editor and renderer.

---

## 9. Frontend Changes

### Files to Modify

#### 1. `lib/section-types.ts`
- Add `ImageDisplaySize` and `ImageLayout` types
- Extend `ImageContent` interface with new fields

#### 2. `lib/section-defaults.ts`
- Update `image` defaults with new fields

#### 3. `lib/section-templates.ts`
- Add 3-4 image templates (Simple, Card, Feature Image, Full-width Banner)

#### 4. `components/editor/blocks/ImageEditor.tsx`
- Add display size dropdown
- Add layout dropdown
- Add conditional TipTap editor for description (when layout includes text)
- Add collapsible Styling section with:
  - Enable Styling toggle
  - Border controls (matching TextEditor pattern)
  - Background & Overlay controls (matching TextEditor pattern)
  - Text Color mode (when layout includes text)

#### 5. `components/render/blocks/ImageBlock.tsx`
- Handle different display sizes (container width classes)
- Handle different layouts (flexbox for side-by-side, stack for top/bottom)
- Render rich text description when present
- Apply styling when enabled (border, background, overlay)
- Responsive: Stack on mobile for left/right layouts

### State Management
- Local component state for collapsible sections (no global state changes)
- Content stored in existing JSONB field via onChange callback

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**ImageContent (lib/section-types.ts:172-176):**
```typescript
export interface ImageContent {
  src: string;
  alt: string;
  caption?: string;
}
```

**ImageEditor (components/editor/blocks/ImageEditor.tsx):**
```typescript
// ~60 lines - just 3 fields
<ImageUpload value={content.src} onChange={...} />
<Input id="image-alt" value={content.alt} ... />
<Input id="image-caption" value={content.caption ?? ""} ... />
```

**ImageBlock (components/render/blocks/ImageBlock.tsx):**
```typescript
// ~45 lines - fixed width, simple figure/img/figcaption
<section className="py-12 px-6" style={{ backgroundColor: "var(--color-background)" }}>
  <div className="max-w-4xl mx-auto">
    <figure className="overflow-hidden" style={{...getCardStyles(theme)}}>
      <img src={content.src} alt={content.alt} className="w-full h-auto object-cover" />
      {content.caption && <figcaption className="p-4" ...>{content.caption}</figcaption>}
    </figure>
  </div>
</section>
```

### 📂 **After Enhancement**

**ImageContent (lib/section-types.ts):**
```typescript
export type ImageDisplaySize = "contained" | "wide" | "full";
export type ImageLayout = "image-only" | "image-left" | "image-right" | "image-top" | "image-bottom";

export interface ImageContent {
  src: string;
  alt: string;
  caption?: string;

  // Layout options
  displaySize?: ImageDisplaySize;
  layout?: ImageLayout;
  description?: string;

  // Styling options (matching TextContent pattern)
  enableStyling?: boolean;
  textColorMode?: TextColorMode;
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}
```

**ImageEditor (~250 lines):**
```typescript
// Display size dropdown
<Select value={content.displaySize ?? "contained"} ...>
  <SelectItem value="contained">Contained</SelectItem>
  <SelectItem value="wide">Wide</SelectItem>
  <SelectItem value="full">Full Width</SelectItem>
</Select>

// Layout dropdown
<Select value={content.layout ?? "image-only"} ...>
  <SelectItem value="image-only">Image Only</SelectItem>
  <SelectItem value="image-left">Image Left + Text Right</SelectItem>
  // ...
</Select>

// Conditional TipTap editor for description
{showsText && <TiptapEditor value={content.description} ... />}

// Collapsible Styling section (following TextEditor pattern)
<Collapsible>
  {/* Border controls */}
  {/* Background controls */}
  {/* Text color mode */}
</Collapsible>
```

**ImageBlock (~180 lines):**
```typescript
// Dynamic container width based on displaySize
const containerClasses = {
  contained: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-full px-0",
};

// Layout-specific rendering
{layout === "image-left" && (
  <div className="flex flex-col md:flex-row gap-8">
    <div className="md:w-1/2"><img .../></div>
    <div className="md:w-1/2">{description}</div>
  </div>
)}

// Styling support (background, overlay, border)
```

### 🎯 **Key Changes Summary**
- [ ] **ImageContent interface:** Add ~12 new optional fields for layout and styling
- [ ] **ImageEditor:** Expand from ~60 to ~250 lines with layout/styling controls
- [ ] **ImageBlock:** Expand from ~45 to ~180 lines with layout variants and styling
- [ ] **section-defaults.ts:** Add default values for new Image fields
- [ ] **section-templates.ts:** Add 4 new Image templates

---

## 11. Implementation Plan

### Phase 1: Type Definitions & Defaults
**Goal:** Add new types and update defaults

- [ ] **Task 1.1:** Add `ImageDisplaySize` and `ImageLayout` types to `lib/section-types.ts`
- [ ] **Task 1.2:** Extend `ImageContent` interface with new fields
- [ ] **Task 1.3:** Update `lib/section-defaults.ts` with default values
- [ ] **Task 1.4:** Run type-check to verify no errors

### Phase 2: ImageEditor Enhancement
**Goal:** Add UI controls for new features

- [ ] **Task 2.1:** Add Display Size dropdown
- [ ] **Task 2.2:** Add Layout dropdown
- [ ] **Task 2.3:** Add conditional TipTap editor for description (dynamic import)
- [ ] **Task 2.4:** Add collapsible Styling section with Enable toggle
- [ ] **Task 2.5:** Add Border controls (following TextEditor pattern)
- [ ] **Task 2.6:** Add Background & Overlay controls
- [ ] **Task 2.7:** Add Text Color mode dropdown (for layouts with text)

### Phase 3: ImageBlock Renderer
**Goal:** Render all layout and styling variations

- [ ] **Task 3.1:** Add display size container width handling
- [ ] **Task 3.2:** Implement "image-only" layout (default, with optional caption)
- [ ] **Task 3.3:** Implement "image-left" layout (side-by-side, responsive)
- [ ] **Task 3.4:** Implement "image-right" layout (side-by-side, responsive)
- [ ] **Task 3.5:** Implement "image-top" layout (stacked)
- [ ] **Task 3.6:** Implement "image-bottom" layout (stacked)
- [ ] **Task 3.7:** Add styling support (border, background, overlay)
- [ ] **Task 3.8:** Add text color handling for descriptions

### Phase 4: Templates
**Goal:** Create starter templates

- [ ] **Task 4.1:** Create "Simple" template (image-only, contained)
- [ ] **Task 4.2:** Create "Card" template (image-top, with description, styled border)
- [ ] **Task 4.3:** Create "Feature Image" template (image-left, with description)
- [ ] **Task 4.4:** Create "Full-width Banner" template (full-width, with overlay)

### Phase 5: Testing & Polish
**Goal:** Verify all features work correctly

- [ ] **Task 5.1:** Test all 5 layout options in editor
- [ ] **Task 5.2:** Test responsive behavior (mobile stacking)
- [ ] **Task 5.3:** Test styling options (border, background, overlay)
- [ ] **Task 5.4:** Test light/dark mode
- [ ] **Task 5.5:** Test all 4 templates
- [ ] **Task 5.6:** Lint and type-check all modified files

### Phase 6: Comprehensive Code Review
**Goal:** Verify implementation quality

- [ ] **Task 6.1:** Present "Implementation Complete!" message
- [ ] **Task 6.2:** Execute comprehensive code review (if approved)

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

All tasks will be marked with completion timestamps as work progresses.

---

## 13. File Structure & Organization

### Files to Modify
```
lib/
  section-types.ts       # Add ImageDisplaySize, ImageLayout types; extend ImageContent
  section-defaults.ts    # Add default values for new Image fields
  section-templates.ts   # Add 4 image templates

components/editor/blocks/
  ImageEditor.tsx        # Major expansion with layout/styling controls

components/render/blocks/
  ImageBlock.tsx         # Major expansion with layout variants and styling
```

### No New Files Required
All changes fit within existing file structure.

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Empty description in text layouts:** Show empty state or hide text section
- [ ] **Missing image src:** Already handled, but verify behavior with new layouts

### Edge Cases to Consider
- [ ] **Very long descriptions:** Ensure text doesn't overflow in side-by-side layouts
- [ ] **Very small images:** Handle gracefully in full-width mode
- [ ] **Caption + Description:** Both can be used - caption shows directly on image, description shows in text area

### Security & Access Control Review
- [ ] **No new security concerns** - uses existing components (ImageUpload, TipTap)

---

## 15. Deployment & Configuration

### Environment Variables
**No new environment variables required.**

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard task template workflow:
1. Implement phase by phase
2. Update this document with completion timestamps
3. Request user confirmation between phases
4. Perform comprehensive code review after implementation

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use existing component patterns (TextEditor styling section)
- [ ] Ensure responsive design
- [ ] Test in both light and dark mode

---

## 17. Notes & Additional Context

### Reference Implementations
- **TextEditor.tsx:** Pattern for styling controls, collapsible sections, TipTap integration
- **TextBlock.tsx:** Pattern for styled/plain rendering, text color handling, responsive design
- **FeaturesEditor.tsx:** Pattern for styling controls in other block types

### Design Decisions
- **Description vs Caption:** Caption is brief (plain text), Description is rich (TipTap HTML)
- **Layout naming:** Using descriptive names like "image-left" rather than "split-left"
- **Mobile behavior:** Side-by-side layouts stack vertically below 768px (md breakpoint)

---

*Task Document Created: 2026-01-02*
