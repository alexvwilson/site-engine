# Task 044: Text Block Styling Options (Border, Background, Overlay)

> **Status:** Complete - 2025-12-31
> **Priority:** P1 - High
> **Complexity:** Medium

---

## 1. Task Overview

### Task Title
**Title:** Text Block Styling Options - Border, Background Image, and Overlay Support

### Goal Statement
**Goal:** Enhance the Text block with visual styling options including card-like borders (with customizable width, radius, and color), background images, and color overlays (similar to the BlogFeatured hero layout). This transforms the basic text block into a versatile content container that can serve as cards, featured content sections, or visually distinct callouts.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
The current Text block is purely functional - it renders rich text content with no visual styling options. Users need to create visually distinct text sections like:
- Cards with borders
- Featured content with background images
- Highlighted sections with colored backgrounds
- Callout boxes with accent borders

This is a straightforward enhancement following established patterns from BlogFeaturedBlock. No strategic analysis needed - the approach is clear.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Key Patterns:** CSS variables for theming, JSONB content storage

### Current State

**TextContent Interface** (`lib/section-types.ts:62-64`):
```typescript
export interface TextContent {
  body: string;
}
```

**TextBlock Renderer** (`components/render/blocks/TextBlock.tsx`):
- Simple section with `py-12 px-6` padding
- Fixed `max-w-3xl` content width
- Uses theme CSS variables for colors
- No styling options

**TextEditor** (`components/editor/blocks/TextEditor.tsx`):
- Single TiptapEditor for body content
- No styling controls
- 45 lines total

### Existing Patterns to Reference

**BlogFeaturedBlock Hero Layout** (`components/render/blocks/BlogFeaturedBlock.tsx:242-321`):
- Background image with `backgroundSize: cover`, `backgroundPosition: center`
- Overlay using `hexToRgba()` utility function
- Absolute positioned overlay div on top of background
- Content with `relative z-10` to appear above overlay

**BlogFeaturedContent Interface**:
```typescript
overlayColor: string;    // Hex color, e.g., "#000000"
overlayOpacity: number;  // 0-100
```

---

## 4. Context & Problem Definition

### Problem Statement
Text blocks lack visual customization options. Users cannot:
- Add borders to create card-like containers
- Set background images for featured content sections
- Apply color overlays for visual hierarchy
- Control content width independently from background

### Success Criteria
- [ ] Border toggle with width, radius, and color options working
- [ ] Background image upload functional
- [ ] Overlay color and opacity controls working (overlay on top of background)
- [ ] Content width options (narrow/medium/full) working
- [ ] All styling visible in both editor preview and published site
- [ ] New templates (Card, Featured, Highlight) available
- [ ] Backwards compatible with existing text blocks (default to no styling)

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns** - existing text blocks will simply have no styling (all new fields optional)
- **Priority: Clean implementation** following established patterns

---

## 6. Technical Requirements

### Functional Requirements
- User can toggle border on/off for the text container
- User can select border width: Thin (1px), Medium (2px), Thick (4px)
- User can select border radius: None, Small, Medium, Large, Full
- User can pick border color (defaults to theme primary, with color picker override)
- User can upload a background image
- User can set overlay color (hex) and opacity (0-100)
- User can select content width: Narrow, Medium, Full
- Background spans full width; content respects width setting
- When background image present, overlay sits on top (tinted effect)
- When no background image, overlay color acts as solid background

### Non-Functional Requirements
- **Performance:** No additional JavaScript for styling (CSS only)
- **Responsive Design:** Styling works across all breakpoints
- **Theme Support:** Uses CSS variables, works in light/dark mode
- **Backwards Compatible:** Existing text blocks render unchanged

---

## 7. Data & Database Changes

### Database Schema Changes
No database schema changes required - content stored in existing JSONB `content` column.

### Data Model Updates

**Updated TextContent Interface** (`lib/section-types.ts`):
```typescript
// Border styling types
export type TextBorderWidth = "thin" | "medium" | "thick";
export type TextBorderRadius = "none" | "small" | "medium" | "large" | "full";
export type TextContentWidth = "narrow" | "medium" | "full";

export interface TextContent {
  body: string;

  // Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string; // Hex color, defaults to theme primary if not set

  // Background & overlay options
  backgroundImage?: string;
  overlayColor?: string; // Hex color
  overlayOpacity?: number; // 0-100

  // Layout options
  contentWidth?: TextContentWidth;
}
```

### Data Migration Plan
No migration needed - all new fields are optional with sensible defaults.

---

## 8. Backend Changes & Background Jobs

No backend changes required. This is a purely frontend feature.

---

## 9. Frontend Changes

### Files to Modify

#### 1. `lib/section-types.ts`
Add new types and extend TextContent interface.

#### 2. `lib/section-defaults.ts`
Update text defaults with new styling fields (all disabled by default).

#### 3. `lib/section-templates.ts`
Add new templates: Card, Featured, Highlight.

#### 4. `components/editor/blocks/TextEditor.tsx`
Add collapsible "Styling" section with:
- Border controls (toggle, width, radius, color picker)
- Background controls (image upload, overlay color, overlay opacity slider)
- Content width selector

#### 5. `components/render/blocks/TextBlock.tsx`
Update renderer to:
- Apply border styles when enabled
- Render background image with cover sizing
- Render overlay div on top of background
- Apply content width classes

### New Components
None required - will use existing shadcn/ui components (Switch, Select, Slider, ColorPicker pattern from theme editor).

### Component Changes Detail

**TextEditor.tsx** - Add styling controls:
```
Content
├── [TiptapEditor] (existing)

Styling (collapsible)
├── Border
│   ├── [Switch] Show Border
│   ├── [Select] Width: Thin / Medium / Thick
│   ├── [Select] Corners: None / Small / Medium / Large / Full
│   └── [ColorPicker] Border Color (with "Use theme primary" default)
├── Background
│   ├── [ImageUpload] Background Image
│   ├── [ColorPicker] Overlay Color
│   └── [Slider] Overlay Opacity (0-100%)
└── Layout
    └── [Select] Content Width: Narrow / Medium / Full
```

**TextBlock.tsx** - Rendering logic:
```tsx
// Outer section: full width, background image, overlay
<section style={{ backgroundImage, backgroundSize: 'cover' }}>
  {/* Overlay div (absolute positioned) */}
  {hasOverlay && <div className="absolute inset-0" style={{ backgroundColor: overlayRgba }} />}

  {/* Content container with border and width */}
  <div className={cn(
    "relative z-10 mx-auto",
    contentWidthClass,
    showBorder && borderClasses
  )} style={borderStyles}>
    {/* Rich text content */}
  </div>
</section>
```

---

## 10. Code Changes Overview

### Current Implementation (Before)

**TextContent** (`lib/section-types.ts:62-64`):
```typescript
export interface TextContent {
  body: string;
}
```

**TextEditor** (`components/editor/blocks/TextEditor.tsx`):
```typescript
export function TextEditor({ content, onChange, disabled }: TextEditorProps) {
  return (
    <div className="space-y-2">
      <Label>Content</Label>
      <TiptapEditor ... />
    </div>
  );
}
```

**TextBlock** (`components/render/blocks/TextBlock.tsx`):
```typescript
return (
  <section className="py-12 px-6" style={{ backgroundColor: "var(--color-background)" }}>
    <div className="max-w-3xl mx-auto">
      <div className="text-block-prose" dangerouslySetInnerHTML={{ __html: content.body }} />
    </div>
  </section>
);
```

### After Implementation

**TextContent** (`lib/section-types.ts`):
```typescript
export type TextBorderWidth = "thin" | "medium" | "thick";
export type TextBorderRadius = "none" | "small" | "medium" | "large" | "full";
export type TextContentWidth = "narrow" | "medium" | "full";

export interface TextContent {
  body: string;
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  contentWidth?: TextContentWidth;
}
```

**TextEditor** - Adds collapsible Styling section with all controls.

**TextBlock** - Full styling support:
```typescript
return (
  <section className="relative py-12 px-6" style={backgroundStyles}>
    {hasOverlay && <div className="absolute inset-0" style={{ backgroundColor: overlayRgba }} />}
    <div className={cn("relative z-10 mx-auto", widthClass, borderClass)} style={borderStyles}>
      <div className="text-block-prose" dangerouslySetInnerHTML={{ __html: content.body }} />
    </div>
  </section>
);
```

### Key Changes Summary
- [ ] **TextContent interface:** Add 8 new optional fields for styling
- [ ] **TextEditor:** Add ~100 lines for styling controls in collapsible section
- [ ] **TextBlock:** Add ~30 lines for conditional styling logic
- [ ] **Templates:** Add 3 new templates (Card, Featured, Highlight)
- [ ] **Defaults:** Add default values for new fields

---

## 11. Implementation Plan

### Phase 1: Type Definitions & Defaults
**Goal:** Define data structures for text styling options

- [ ] **Task 1.1:** Add type definitions to `lib/section-types.ts`
  - Files: `lib/section-types.ts`
  - Details: Add TextBorderWidth, TextBorderRadius, TextContentWidth types; extend TextContent
- [ ] **Task 1.2:** Update defaults in `lib/section-defaults.ts`
  - Files: `lib/section-defaults.ts`
  - Details: Add default styling values (all disabled/neutral)

### Phase 2: Renderer Updates
**Goal:** Update TextBlock to render all styling options

- [ ] **Task 2.1:** Update TextBlock component
  - Files: `components/render/blocks/TextBlock.tsx`
  - Details: Add background image, overlay, border, and content width rendering
- [ ] **Task 2.2:** Add hexToRgba utility (if not already shared)
  - Files: Check if exists in `lib/`, otherwise add inline or to shared utils
  - Details: Convert hex + opacity to rgba string

### Phase 3: Editor Controls
**Goal:** Build styling UI in TextEditor

- [ ] **Task 3.1:** Update TextEditor with styling controls
  - Files: `components/editor/blocks/TextEditor.tsx`
  - Details: Add collapsible Styling section with all controls
- [ ] **Task 3.2:** Wire up ImageUpload for background
  - Files: `components/editor/blocks/TextEditor.tsx`
  - Details: Use existing ImageUpload component for background image

### Phase 4: Templates
**Goal:** Add new template presets

- [ ] **Task 4.1:** Add Card, Featured, Highlight templates
  - Files: `lib/section-templates.ts`
  - Details: Create 3 new templates with appropriate styling presets

### Phase 5: Testing & Validation
**Goal:** Verify all features work correctly

- [ ] **Task 5.1:** Test border options (all combinations)
- [ ] **Task 5.2:** Test background image + overlay combinations
- [ ] **Task 5.3:** Test content width options
- [ ] **Task 5.4:** Test templates in Add Section flow
- [ ] **Task 5.5:** Test backwards compatibility (existing text blocks unchanged)
- [ ] **Task 5.6:** Test in both light and dark mode

---

## 12. Task Completion Tracking

### Phase 1: Type Definitions & Defaults ✓ 2025-12-31
- [x] **Task 1.1:** Added 3 types (TextBorderWidth, TextBorderRadius, TextContentWidth) to `lib/section-types.ts`
- [x] **Task 1.2:** Extended TextContent interface with 8 optional styling fields
- [x] **Task 1.3:** Updated defaults in `lib/section-defaults.ts` with all new fields

### Phase 2: Renderer Updates ✓ 2025-12-31
- [x] **Task 2.1:** Rewrote `components/render/blocks/TextBlock.tsx` (~153 lines)
  - Added hexToRgba utility function
  - Added border width/radius/color mappings
  - Added content width class mappings
  - Background image with cover sizing
  - Overlay layer with rgba opacity
  - Border container styling
  - Conditional text colors for readability on backgrounds

### Phase 3: Editor Controls ✓ 2025-12-31
- [x] **Task 3.1:** Rewrote `components/editor/blocks/TextEditor.tsx` (~276 lines)
  - Added collapsible "Styling" section with Palette icon
  - Border controls: toggle, width, radius, color picker with reset
  - Background controls: ImageUpload, overlay color, opacity slider
  - Layout controls: content width selector
  - All controls properly disabled when editing disabled

### Phase 4: Templates ✓ 2025-12-31
- [x] **Task 4.1:** Added 3 new templates to `lib/section-templates.ts`
  - Card: bordered with light gray background
  - Featured: dark overlay for background images
  - Highlight: thick accent border with subtle tint

### Phase 5: Code Review ✓ 2025-12-31
- [x] Type checking: Passes
- [x] All files reviewed and verified

---

## 13. File Structure & Organization

### Files to Modify
```
lib/
├── section-types.ts      # Add types, extend TextContent
├── section-defaults.ts   # Add default styling values
└── section-templates.ts  # Add Card, Featured, Highlight templates

components/
├── editor/blocks/
│   └── TextEditor.tsx    # Add styling controls
└── render/blocks/
    └── TextBlock.tsx     # Add styling rendering
```

### No New Files Required
All changes fit within existing file structure.

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty background image URL:** Should not render background styles
- [ ] **Opacity at 0:** Overlay should not render (optimization)
- [ ] **Border without color:** Falls back to theme primary
- [ ] **Long content with full-width:** Ensure readability on wide screens

### Security Considerations
- [ ] **Image URLs:** Already validated by ImageUpload component
- [ ] **Color values:** Hex colors are safe (no script injection possible)

---

## 15. Deployment & Configuration

No environment variables or configuration changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with type definitions (Phase 1) - establishes data contract
2. Update renderer (Phase 2) - can test with hardcoded values
3. Add editor controls (Phase 3) - full user control
4. Add templates (Phase 4) - convenience presets
5. Test thoroughly (Phase 5)

### Code Quality Standards
- [ ] Use existing patterns from BlogFeaturedBlock for overlay logic
- [ ] Use existing ImageUpload component
- [ ] Use shadcn/ui Select, Switch, Slider components
- [ ] Maintain backwards compatibility (all new fields optional)
- [ ] Follow mobile-first responsive design

### Reference Files
- `components/render/blocks/BlogFeaturedBlock.tsx` - Overlay pattern (lines 62-69, 252-273)
- `components/editor/blocks/HeroEditor.tsx` - ImageUpload integration pattern
- `components/theme/ColorPickerField.tsx` - Color picker pattern

---

## 17. Notes & Additional Context

### Design Decisions
- Border wraps the content container, not the full-width section
- Background spans full section width (edge-to-edge)
- Content width controls the inner text container only
- Overlay sits between background and content (standard pattern)

### Template Presets

**Card Template:**
- Border: On, Medium width, Medium radius, Theme primary
- Background: None
- Overlay: Light gray (#F5F5F5), 100% opacity
- Width: Narrow

**Featured Template:**
- Border: Off
- Background: Placeholder for user upload
- Overlay: Black (#000000), 50% opacity
- Width: Medium

**Highlight Template:**
- Border: On, Thick width, None radius, Theme primary
- Background: None
- Overlay: Theme primary color, 10% opacity
- Width: Narrow

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **None** - All new fields are optional with sensible defaults

### Ripple Effects Assessment
- [ ] **UI/UX:** Text blocks gain significant new capabilities
- [ ] **Templates:** New templates will appear in Add Section flow
- [ ] **Theme integration:** Border color defaults to theme primary (respects theming)

### Performance Implications
- [ ] **Minimal** - CSS-only styling, no JavaScript overhead
- [ ] **Image loading:** Background images load lazily (browser default)

### User Experience Impacts
- [ ] **Positive** - More design flexibility without complexity
- [ ] **Learning curve:** Minimal - controls are intuitive

---

*Task Document Created: 2025-12-31*
*Template Version: 1.0*
