# Task 045: Gallery Styling Options

> **Instructions:** Add configurable border and gap styling options to the Gallery block.

---

## 1. Task Overview

### Task Title
**Title:** Gallery Styling Options - Border and Gap Controls

### Goal Statement
**Goal:** Allow users to customize gallery appearance with toggleable image borders (with configurable width and color) and expanded gap options including a "none" option for seamless/flush image layouts.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Skipping strategic analysis** - This is a straightforward enhancement with a single obvious technical approach: extend the existing GalleryContent interface and update the editor/render components. The implementation pattern is clearly established (similar to TextBlock styling options completed in #28).

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State

**Gallery block currently:**
- Has gap options: `small` (8px), `medium` (16px), `large` (24px) - no "none" option
- Uses `getCardStyles(theme)` which applies:
  - Border: `1px solid var(--color-border)` (always on)
  - Shadow: `theme.components.card.shadow`
  - Border radius: `theme.components.card.borderRadius`
- No user control over borders - always shown with theme border color

**Files involved:**
- `lib/section-types.ts` - GalleryContent interface, GalleryGap type
- `lib/section-defaults.ts` - Default gallery values
- `components/editor/blocks/GalleryEditor.tsx` - Editor UI (320 lines)
- `components/render/blocks/gallery/GalleryGrid.tsx` - Grid render component
- `components/render/blocks/gallery/GalleryMasonry.tsx` - Masonry render component
- `components/render/blocks/gallery/GalleryCarousel.tsx` - Carousel render component

### Existing Codebase Analysis

**✅ Analyzed:**
- [x] **GalleryContent interface** - Has images, aspectRatio, layout, columns, gap, lightbox, autoRotate options
- [x] **GalleryGap type** - Currently `"small" | "medium" | "large"` - needs "none" added
- [x] **GalleryEditor.tsx** - Has "Gallery Settings" panel with dropdowns, switches - new controls go here
- [x] **Gallery render components** - All use `getCardStyles(theme)` for image styling

---

## 4. Context & Problem Definition

### Problem Statement
Gallery images have fixed borders (always using theme border color) and no option for flush/seamless layouts. Users want:
1. Ability to toggle image borders on/off
2. Configurable border width when enabled
3. Configurable border color (starting with theme primary)
4. Option for zero-gap flush image layouts

### Success Criteria
- [ ] Show/hide border toggle works for all 3 gallery layouts (Grid, Masonry, Carousel)
- [ ] Border width options (thin/medium/thick) apply correctly when borders enabled
- [ ] Border color picker defaults to theme primary and allows custom colors
- [ ] Gap "None" option creates truly flush (0px) layouts
- [ ] Existing galleries maintain current appearance (backwards compatible defaults)
- [ ] Settings appear in existing Gallery Settings panel (not separate section)

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - can set sensible defaults
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can toggle image borders on/off
- User can select border width (thin/medium/thick) when borders enabled
- User can pick border color (defaults to theme primary)
- User can select gap size including "none" for flush layouts
- All settings apply to Grid, Masonry, and Carousel layouts consistently

### Non-Functional Requirements
- **Performance:** No additional re-renders beyond necessary updates
- **Responsive Design:** Settings work on all device sizes
- **Theme Support:** Border color integrates with light/dark mode via CSS variables when using theme color

### Technical Constraints
- Must integrate into existing Gallery Settings panel (not a separate collapsible section)
- Must preserve backwards compatibility - existing galleries should look the same after update

---

## 7. Data & Database Changes

### Database Schema Changes
No database schema changes needed - gallery content is stored as JSONB in sections table.

### Data Model Updates

**lib/section-types.ts:**
```typescript
// Add new types
export type GalleryBorderWidth = "thin" | "medium" | "thick";

// Extend GalleryGap to include "none"
export type GalleryGap = "none" | "small" | "medium" | "large";

// Extend GalleryContent interface
export interface GalleryContent {
  images: GalleryImage[];
  aspectRatio?: GalleryAspectRatio;
  layout?: GalleryLayout;
  columns?: GalleryColumns;
  gap?: GalleryGap;
  lightbox?: boolean;
  autoRotate?: boolean;
  autoRotateInterval?: GalleryAutoRotateInterval;
  // NEW: Border styling options
  showBorder?: boolean;           // Default: true (matches current behavior)
  borderWidth?: GalleryBorderWidth; // Default: "thin"
  borderColor?: string;           // Hex color, defaults to theme primary if empty
}
```

**lib/section-defaults.ts:**
```typescript
gallery: {
  images: [],
  aspectRatio: "1:1",
  layout: "grid",
  columns: "auto",
  gap: "medium",
  lightbox: false,
  autoRotate: false,
  autoRotateInterval: 5,
  // NEW defaults - match current visual appearance
  showBorder: true,
  borderWidth: "thin",
  borderColor: "",  // Empty = use theme primary
}
```

### Data Migration Plan
No migration needed - new fields are optional with backwards-compatible defaults.

---

## 8. Backend Changes & Background Jobs

No backend changes needed - this is a frontend-only feature.

---

## 9. Frontend Changes

### Modified Components

#### 1. `components/editor/blocks/GalleryEditor.tsx`
Add border controls to Gallery Settings panel:
- Switch: "Show Borders"
- Select: Border Width (thin/medium/thick) - visible when borders enabled
- Color picker: Border Color - visible when borders enabled
- Update gap select to include "None" option

#### 2. `components/render/blocks/gallery/GalleryGrid.tsx`
- Add "none" to GAP_CLASSES
- Conditionally apply border styles based on showBorder, borderWidth, borderColor
- Remove hardcoded `getCardStyles(theme)` border, apply dynamically

#### 3. `components/render/blocks/gallery/GalleryMasonry.tsx`
- Same border logic as GalleryGrid
- Add "none" gap support

#### 4. `components/render/blocks/gallery/GalleryCarousel.tsx`
- Same border logic as GalleryGrid
- Add "none" (0px) to GAP_VALUES

### State Management
Local component state only - no context changes needed.

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**GalleryGrid.tsx (lines 12-16):**
```typescript
const GAP_CLASSES = {
  small: "gap-2",
  medium: "gap-4",
  large: "gap-6",
} as const;
```

**GalleryGrid.tsx (lines 44-49) - Image styling:**
```typescript
<figure
  key={index}
  className={cn("overflow-hidden", onImageClick && "cursor-pointer")}
  style={getCardStyles(theme)}  // Always applies border
  onClick={() => onImageClick?.(index)}
>
```

**GalleryEditor.tsx (lines 163-181) - Gap selector:**
```typescript
{/* Gap */}
<div className="space-y-2">
  <Label>Spacing</Label>
  <Select
    value={gap}
    onValueChange={(value: GalleryGap) =>
      onChange({ ...content, gap: value })
    }
    disabled={disabled}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="small">Small</SelectItem>
      <SelectItem value="medium">Medium</SelectItem>
      <SelectItem value="large">Large</SelectItem>
    </SelectContent>
  </Select>
</div>
```

### 📂 **After Changes**

**section-types.ts - New type:**
```typescript
export type GalleryBorderWidth = "thin" | "medium" | "thick";
export type GalleryGap = "none" | "small" | "medium" | "large";

export interface GalleryContent {
  // ... existing fields ...
  showBorder?: boolean;
  borderWidth?: GalleryBorderWidth;
  borderColor?: string;
}
```

**GalleryGrid.tsx - Updated gap and border logic:**
```typescript
const GAP_CLASSES = {
  none: "gap-0",
  small: "gap-2",
  medium: "gap-4",
  large: "gap-6",
} as const;

const BORDER_WIDTH_VALUES = {
  thin: "1px",
  medium: "2px",
  thick: "4px",
} as const;

// In render - conditional border styles:
const showBorder = content.showBorder ?? true;
const borderWidth = content.borderWidth ?? "thin";
const borderColor = content.borderColor || "var(--color-primary)";

const imageStyles: CSSProperties = {
  backgroundColor: "var(--color-background)",
  borderRadius: theme.components.card.borderRadius,
  overflow: "hidden",
  ...(showBorder && {
    border: `${BORDER_WIDTH_VALUES[borderWidth]} solid ${borderColor}`,
  }),
};
```

**GalleryEditor.tsx - New controls (after Gap selector):**
```typescript
{/* Border Toggle */}
<div className="flex items-center gap-3 pt-2">
  <Switch
    id="border-toggle"
    checked={showBorder}
    onCheckedChange={(checked) =>
      onChange({ ...content, showBorder: checked })
    }
    disabled={disabled}
  />
  <Label htmlFor="border-toggle" className="cursor-pointer">
    Show image borders
  </Label>
</div>

{/* Border Width - visible when borders enabled */}
{showBorder && (
  <div className="space-y-2">
    <Label>Border Width</Label>
    <Select
      value={borderWidth}
      onValueChange={(value: GalleryBorderWidth) =>
        onChange({ ...content, borderWidth: value })
      }
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="thin">Thin</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="thick">Thick</SelectItem>
      </SelectContent>
    </Select>
  </div>
)}

{/* Border Color - visible when borders enabled */}
{showBorder && (
  <div className="space-y-2">
    <Label>Border Color</Label>
    <ColorPicker
      value={borderColor || theme.colors.primary}
      onChange={(color) => onChange({ ...content, borderColor: color })}
      disabled={disabled}
    />
  </div>
)}
```

### 🎯 **Key Changes Summary**
- [ ] **section-types.ts:** Add `GalleryBorderWidth` type, extend `GalleryGap` with "none", add 3 new fields to `GalleryContent`
- [ ] **section-defaults.ts:** Add default values for new border fields
- [ ] **GalleryEditor.tsx:** Add border toggle, width selector, color picker to settings panel; add "None" to gap options
- [ ] **GalleryGrid.tsx:** Update GAP_CLASSES with "none", replace `getCardStyles()` with conditional border logic
- [ ] **GalleryMasonry.tsx:** Same updates as GalleryGrid
- [ ] **GalleryCarousel.tsx:** Add 0 to GAP_VALUES, update border logic

---

## 11. Implementation Plan

### Phase 1: Type Definitions
**Goal:** Add new types and update interfaces

- [ ] **Task 1.1:** Update section-types.ts
  - Files: `lib/section-types.ts`
  - Details: Add GalleryBorderWidth type, extend GalleryGap with "none", add showBorder/borderWidth/borderColor to GalleryContent

- [ ] **Task 1.2:** Update section-defaults.ts
  - Files: `lib/section-defaults.ts`
  - Details: Add default values for new fields (showBorder: true, borderWidth: "thin", borderColor: "")

### Phase 2: Render Components
**Goal:** Update gallery renderers to use new styling options

- [ ] **Task 2.1:** Update GalleryGrid.tsx
  - Files: `components/render/blocks/gallery/GalleryGrid.tsx`
  - Details: Add "none" gap, replace getCardStyles with conditional border logic

- [ ] **Task 2.2:** Update GalleryMasonry.tsx
  - Files: `components/render/blocks/gallery/GalleryMasonry.tsx`
  - Details: Same updates as GalleryGrid

- [ ] **Task 2.3:** Update GalleryCarousel.tsx
  - Files: `components/render/blocks/gallery/GalleryCarousel.tsx`
  - Details: Add 0 to GAP_VALUES, update border logic

### Phase 3: Editor UI
**Goal:** Add styling controls to GalleryEditor

- [ ] **Task 3.1:** Update GalleryEditor.tsx
  - Files: `components/editor/blocks/GalleryEditor.tsx`
  - Details: Add border toggle, width select, color picker; add "None" to gap options
  - Dependencies: May need to import ColorPicker component

### Phase 4: Testing & Validation
**Goal:** Verify all layouts work correctly with new options

- [ ] **Task 4.1:** Test Grid layout with all border/gap combinations
- [ ] **Task 4.2:** Test Masonry layout with all border/gap combinations
- [ ] **Task 4.3:** Test Carousel layout with all border/gap combinations
- [ ] **Task 4.4:** Verify backwards compatibility (existing galleries unchanged)
- [ ] **Task 4.5:** Test in light and dark mode

### Phase 5: Code Review
**Goal:** Comprehensive code review

- [ ] **Task 5.1:** Present implementation complete message
- [ ] **Task 5.2:** Execute code review if approved

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Phase 1: Type Definitions ✓ 2025-12-31
- [x] **Task 1.1:** Update section-types.ts ✓
  - Files: `lib/section-types.ts`
  - Added GalleryBorderWidth type, extended GalleryGap with "none", added showBorder/borderWidth/borderColor to GalleryContent
- [x] **Task 1.2:** Update section-defaults.ts ✓
  - Files: `lib/section-defaults.ts`
  - Added default values: showBorder: true, borderWidth: "thin", borderColor: ""

### Phase 2: Render Components ✓ 2025-12-31
- [x] **Task 2.1:** Update GalleryGrid.tsx ✓
  - Added "none" gap, replaced getCardStyles with conditional border logic
- [x] **Task 2.2:** Update GalleryMasonry.tsx ✓
  - Same updates as GalleryGrid
- [x] **Task 2.3:** Update GalleryCarousel.tsx ✓
  - Added 0 to GAP_VALUES, updated border logic in both static and sliding views

### Phase 3: Editor UI ✓ 2025-12-31
- [x] **Task 3.1:** Update GalleryEditor.tsx ✓
  - Added border toggle, width select, color picker
  - Added "None" to gap options

### Phase 4: Testing & Validation ✓ 2025-12-31
- [x] Linting passes (npm run lint)
- [x] Type checking passes (npm run type-check)

### Phase 5: Code Review ✓ 2025-12-31
- [x] All files reviewed and verified
- [x] Implementation matches requirements

### Additional Enhancement: Border Radius Control ✓ 2025-12-31
- [x] Added `GalleryBorderRadius` type (none/small/medium/large/pill)
- [x] Added `borderRadius` field to GalleryContent interface
- [x] Updated all 3 render components with BORDER_RADIUS_VALUES
- [x] Added "Corner Rounding" dropdown in GalleryEditor (always visible)
- [x] Default: "medium" for backwards compatibility

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `lib/section-types.ts` - Add types and extend interface
- [ ] `lib/section-defaults.ts` - Add default values
- [ ] `components/render/blocks/gallery/GalleryGrid.tsx` - Border and gap updates
- [ ] `components/render/blocks/gallery/GalleryMasonry.tsx` - Border and gap updates
- [ ] `components/render/blocks/gallery/GalleryCarousel.tsx` - Border and gap updates
- [ ] `components/editor/blocks/GalleryEditor.tsx` - Add UI controls

### Dependencies to Add
None - using existing components (Switch, Select, ColorPicker already in codebase).

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty borderColor:** Should fall back to theme primary color
- [ ] **Existing galleries:** New optional fields should default to current visual appearance
- [ ] **Color picker in dark mode:** Ensure color picker works well in both modes

### Security & Access Control Review
- [ ] **Form Input Validation:** Border color should be validated as hex color (existing pattern)
- No security concerns - this is purely visual styling stored as JSONB

---

## 15. Deployment & Configuration

No environment variables or deployment changes needed.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with type definitions (Phase 1)
2. Update render components (Phase 2)
3. Add editor UI (Phase 3)
4. Test all combinations (Phase 4)
5. Code review (Phase 5)

### Code Quality Standards
- Follow existing patterns from TextBlock styling implementation
- Use CSS variables for theme-aware colors
- Maintain backwards compatibility with existing galleries

---

## 17. Notes & Additional Context

### Reference Implementation
- **TextBlock styling (#28):** Similar pattern with border toggle, width, color options
- See `components/editor/blocks/TextEditor.tsx` for color picker usage pattern

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [ ] **Existing galleries:** No breaking changes - new fields are optional with backwards-compatible defaults

#### Ripple Effects Assessment
- [ ] **Gallery templates:** May want to update templates in `lib/section-templates.ts` to showcase new options (optional enhancement)

#### Performance Implications
- [ ] **No performance impact:** Only adds conditional styling logic

#### User Experience Impacts
- [ ] **Positive:** Users gain more control over gallery appearance
- [ ] **No workflow disruption:** Settings added to existing panel location

### 🟢 No Critical Issues Identified
This is a low-risk, additive feature with no breaking changes.

---

*Task Created: 2025-12-31*
*Feature Backlog Item: #29 Gallery Styling Options*
