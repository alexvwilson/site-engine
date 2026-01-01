# Task 048: Header & Footer Styling Options

> **Task Document for AI-Driven Development**

---

## 1. Task Overview

### Task Title
**Title:** Add Styling Options to Header & Footer Blocks with Logo Size Control

### Goal Statement
**Goal:** Enhance the Header and Footer blocks with comprehensive styling options similar to other blocks (Features, CTA, Testimonials, Contact), with special attention to logo size control for the header. This allows users to customize the visual appearance of their site's navigation and footer areas while enabling larger logo displays for sites with image-based branding.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
This is a straightforward enhancement following established patterns in the codebase. No strategic analysis needed as the approach is clear:
- Follow the existing `enableStyling` toggle pattern from other blocks
- Add logo size slider to Header
- Add background/overlay options to both Header and Footer
- Add single-side border (bottom for header, top for footer) that spans full screen width

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State
- **HeaderContent interface:** Has layout, sticky, showLogoText, CTA options but no styling options
- **FooterContent interface:** Has layout option only, no styling options
- **HeaderBlock renderer:** Fixed logo size (h-8, 32px height), theme-based border color
- **FooterBlock renderer:** Fixed dark background (foreground color), no customization
- **Logo display:** Currently fixed at 32px height with `h-8 w-auto` classes

### Existing Patterns to Follow
The styling pattern from `FeaturesEditor`, `CTAEditor`, `TestimonialsEditor`, and `ContactEditor`:
- `enableStyling` toggle to enable/disable styling options
- Collapsible "Styling" section with Palette icon
- Background image upload with overlay color/opacity
- Border options (adapted for single-side borders here)
- Typography scaling options

---

## 4. Context & Problem Definition

### Problem Statement
1. **Logo Size:** The current logo is fixed at 32px height, making it difficult to see detail on image-based logos. Users with larger or more detailed logos need control over the display size.

2. **Header/Footer Styling:** Unlike other blocks, Header and Footer lack background customization options. Users want to:
   - Add background images with overlays
   - Customize border appearance
   - Scale typography

### Success Criteria
- [ ] Logo size slider allows adjusting logo height from 24px to 80px
- [ ] Header has `enableStyling` toggle with collapsible styling section
- [ ] Header supports background image with overlay color/opacity
- [ ] Header has bottom border that spans full viewport width (no radius)
- [ ] Footer has `enableStyling` toggle with collapsible styling section
- [ ] Footer supports background image with overlay color/opacity
- [ ] Footer has top border that spans full viewport width (no radius)
- [ ] Both support text color mode (auto/light/dark) and text size scaling
- [ ] Page-level override system works with new styling options
- [ ] Preview and published sites render styling correctly

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - can add new fields freely
- **Priority: Clean implementation** following existing patterns

---

## 6. Technical Requirements

### Functional Requirements
- User can adjust logo size via slider (24px to 80px, default 32px)
- User can enable styling mode for Header and Footer
- User can upload background image for Header/Footer sections
- User can set overlay color and opacity on backgrounds
- User can show/hide border line (bottom for header, top for footer)
- User can set border color and width
- User can adjust text size scaling
- User can set text color mode (auto/light/dark)

### Non-Functional Requirements
- **Responsive Design:** Logo size should scale proportionally on mobile
- **Theme Support:** Borders and overlays should use CSS variables
- **Performance:** No additional re-renders from styling changes

### Technical Constraints
- Must follow existing `enableStyling` pattern for consistency
- Border must span full viewport width (outside the max-w-6xl container)
- Border has no radius (just a horizontal line)
- Must integrate with existing page-level override system

---

## 7. Data & Database Changes

### Database Schema Changes
No database schema changes required - content is stored as JSONB.

### Data Model Updates

```typescript
// lib/section-types.ts - New types
export type LogoSize = number; // 24-80 pixels
export type HeaderFooterBorderWidth = "thin" | "medium" | "thick";

// Updated HeaderContent interface
export interface HeaderContent {
  // Existing content fields
  siteName: string;
  logoUrl?: string;
  links: NavLink[];
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;

  // Existing styling options
  layout?: HeaderLayout;
  sticky?: boolean;
  showLogoText?: boolean;

  // NEW: Logo size (24-80px, default 32)
  logoSize?: number;

  // NEW: Master styling toggle
  enableStyling?: boolean;

  // NEW: Text color mode
  textColorMode?: TextColorMode;

  // NEW: Background & overlay
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // NEW: Border options (bottom border only)
  showBorder?: boolean;
  borderWidth?: HeaderFooterBorderWidth;
  borderColor?: string;

  // NEW: Typography
  textSize?: TextSize;

  // Existing override flags
  overrideLayout?: boolean;
  overrideSticky?: boolean;
  overrideShowLogoText?: boolean;
  overrideCta?: boolean;

  // NEW: Override flags for styling
  overrideLogoSize?: boolean;
  overrideStyling?: boolean;
}

// Updated FooterContent interface
export interface FooterContent {
  // Existing content fields
  copyright: string;
  links: FooterLink[];

  // Existing styling option
  layout?: FooterLayout;

  // NEW: Master styling toggle
  enableStyling?: boolean;

  // NEW: Text color mode
  textColorMode?: TextColorMode;

  // NEW: Background & overlay
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // NEW: Border options (top border only)
  showBorder?: boolean;
  borderWidth?: HeaderFooterBorderWidth;
  borderColor?: string;

  // NEW: Typography
  textSize?: TextSize;

  // Existing override flag
  overrideLayout?: boolean;

  // NEW: Override flag for styling
  overrideStyling?: boolean;
}
```

### Data Migration Plan
No migration needed - new optional fields with sensible defaults.

---

## 8. Backend Changes & Background Jobs

No backend changes required. All changes are frontend-only (types, editors, renderers).

---

## 9. Frontend Changes

### Modified Components

#### `lib/section-types.ts`
- Add `HeaderFooterBorderWidth` type
- Extend `HeaderContent` with logo size and styling fields
- Extend `FooterContent` with styling fields

#### `lib/section-defaults.ts`
- Add default values for new header fields (logoSize: 32, enableStyling: false, etc.)
- Add default values for new footer fields

#### `components/editor/blocks/HeaderEditor.tsx`
- Add logo size slider (24-80px range)
- Add collapsible "Styling" section with Palette icon
- Add `enableStyling` toggle
- Add background image upload with overlay controls
- Add bottom border controls (show/width/color)
- Add text color mode and text size options
- Add page-mode override fields for new options

#### `components/editor/blocks/FooterEditor.tsx`
- Add collapsible "Styling" section with Palette icon
- Add `enableStyling` toggle
- Add background image upload with overlay controls
- Add top border controls (show/width/color)
- Add text color mode and text size options
- Add page-mode override field for styling

#### `components/render/blocks/HeaderBlock.tsx`
- Apply dynamic logo size from content.logoSize
- Render background image with overlay when enableStyling is true
- Render full-width bottom border when showBorder is true
- Apply text color mode and text size scaling
- Support both styled and plain (default) rendering modes

#### `components/render/blocks/FooterBlock.tsx`
- Render background image with overlay when enableStyling is true
- Render full-width top border when showBorder is true
- Apply text color mode and text size scaling
- Support both styled and plain (default) rendering modes

### State Management
No new state management needed - follows existing content update pattern.

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**HeaderBlock.tsx - Logo rendering:**
```typescript
{content.logoUrl && (
  <Image
    src={content.logoUrl}
    alt={content.siteName}
    width={120}
    height={32}
    className="h-8 w-auto"  // Fixed 32px height
    unoptimized
  />
)}
```

**HeaderBlock.tsx - Header wrapper:**
```typescript
<header
  className={cn("top-0 z-50 w-full border-b", isSticky && "sticky")}
  style={{
    backgroundColor: "var(--color-background)",
    borderColor: "var(--color-border)",
  }}
>
```

**FooterBlock.tsx - Footer wrapper:**
```typescript
<footer
  className="py-8 px-6"
  style={{
    backgroundColor: "var(--color-foreground)",  // Fixed dark background
    color: "var(--color-background)",
  }}
>
```

### 📂 **After Refactor**

**HeaderBlock.tsx - Dynamic logo size:**
```typescript
const logoSize = content.logoSize ?? 32;
const logoHeight = `${logoSize}px`;

{content.logoUrl && (
  <Image
    src={content.logoUrl}
    alt={content.siteName}
    width={Math.round(logoSize * 3.75)} // Maintain aspect ratio
    height={logoSize}
    style={{ height: logoHeight, width: 'auto' }}
    unoptimized
  />
)}
```

**HeaderBlock.tsx - Styled header with background and full-width border:**
```typescript
const enableStyling = content.enableStyling ?? false;
const showBorder = content.showBorder ?? true;

// Outer wrapper for full-width border
<div className="relative">
  {/* Background image with overlay */}
  {enableStyling && content.backgroundImage && (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${content.backgroundImage})` }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: content.overlayColor ?? '#000000',
          opacity: (content.overlayOpacity ?? 50) / 100,
        }}
      />
    </div>
  )}

  <header className={cn("relative top-0 z-50 w-full", isSticky && "sticky")}>
    <div className="max-w-6xl mx-auto px-6">
      {/* ... header content ... */}
    </div>
  </header>

  {/* Full-width bottom border */}
  {showBorder && (
    <div
      className="absolute bottom-0 left-0 right-0"
      style={{
        height: borderWidthMap[content.borderWidth ?? 'thin'],
        backgroundColor: content.borderColor || 'var(--color-border)',
      }}
    />
  )}
</div>
```

**FooterBlock.tsx - Styled footer with full-width top border:**
```typescript
const enableStyling = content.enableStyling ?? false;

// Outer wrapper for full-width border
<div className="relative">
  {/* Full-width top border */}
  {content.showBorder && (
    <div
      className="absolute top-0 left-0 right-0"
      style={{
        height: borderWidthMap[content.borderWidth ?? 'thin'],
        backgroundColor: content.borderColor || 'var(--color-border)',
      }}
    />
  )}

  {/* Background with overlay */}
  <footer
    className="relative py-8 px-6"
    style={{
      backgroundColor: enableStyling
        ? (content.backgroundImage ? 'transparent' : 'var(--color-foreground)')
        : 'var(--color-foreground)',
    }}
  >
    {/* ... footer content ... */}
  </footer>
</div>
```

### 🎯 **Key Changes Summary**
- [x] **Logo Size Slider:** New slider control (24-80px) in HeaderEditor, dynamic sizing in HeaderBlock
- [x] **Header Styling:** enableStyling toggle, background image/overlay, bottom border (full-width)
- [x] **Footer Styling:** enableStyling toggle, background image/overlay, top border (full-width)
- [x] **Typography:** textColorMode and textSize options for both blocks
- [x] **Override System:** New override fields for page-level customization
- [x] **Files Modified:** section-types.ts, section-defaults.ts, HeaderEditor.tsx, FooterEditor.tsx, HeaderBlock.tsx, FooterBlock.tsx

---

## 11. Implementation Plan

### Phase 1: Type Definitions ✅
**Goal:** Add new types and extend content interfaces

- [x] **Task 1.1:** Add `HeaderFooterBorderWidth` type to section-types.ts
- [x] **Task 1.2:** Extend `HeaderContent` with logoSize and styling fields
- [x] **Task 1.3:** Extend `FooterContent` with styling fields
- [x] **Task 1.4:** Update section-defaults.ts with new default values

### Phase 2: Header Editor Updates ✅
**Goal:** Add logo size slider and styling controls to HeaderEditor

- [x] **Task 2.1:** Add logo size slider control (24-80px range)
- [x] **Task 2.2:** Add collapsible "Styling" section with enableStyling toggle
- [x] **Task 2.3:** Add background image upload with overlay controls
- [x] **Task 2.4:** Add bottom border controls (show/width/color)
- [x] **Task 2.5:** Add text color mode and text size dropdowns
- [x] **Task 2.6:** Add page-mode override fields for new options

### Phase 3: Footer Editor Updates ✅
**Goal:** Add styling controls to FooterEditor

- [x] **Task 3.1:** Add collapsible "Styling" section with enableStyling toggle
- [x] **Task 3.2:** Add background image upload with overlay controls
- [x] **Task 3.3:** Add top border controls (show/width/color)
- [x] **Task 3.4:** Add text color mode and text size dropdowns
- [x] **Task 3.5:** Add page-mode override field for styling

### Phase 4: Header Renderer Updates ✅
**Goal:** Implement styled rendering in HeaderBlock

- [x] **Task 4.1:** Add dynamic logo sizing based on content.logoSize
- [x] **Task 4.2:** Add background image rendering with overlay
- [x] **Task 4.3:** Add full-width bottom border rendering
- [x] **Task 4.4:** Apply text color mode and text size scaling
- [x] **Task 4.5:** Ensure all three layout variants support styling

### Phase 5: Footer Renderer Updates ✅
**Goal:** Implement styled rendering in FooterBlock

- [x] **Task 5.1:** Add background image rendering with overlay
- [x] **Task 5.2:** Add full-width top border rendering
- [x] **Task 5.3:** Apply text color mode and text size scaling
- [x] **Task 5.4:** Ensure all three layout variants support styling

### Phase 6: Testing & Validation ✅
**Goal:** Verify all functionality works correctly

- [x] **Task 6.1:** TypeScript type check passed
- [x] **Task 6.2:** ESLint check passed (no new errors)
- [x] **Task 6.3:** Production build successful
- [ ] **Task 6.4:** Manual testing recommended: Test logo size slider updates preview
- [ ] **Task 6.5:** Manual testing recommended: Test header/footer styling on all layouts
- [ ] **Task 6.6:** Manual testing recommended: Test on published site pages

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

**Status: ✅ COMPLETE**

**Implementation Date:** 2025-12-31

**Files Modified:**
- `lib/section-types.ts` - Added HeaderFooterBorderWidth type and extended HeaderContent/FooterContent interfaces
- `lib/section-defaults.ts` - Added default values for new header/footer styling fields
- `components/editor/blocks/HeaderEditor.tsx` - Added logo size slider and styling section
- `components/editor/blocks/FooterEditor.tsx` - Added styling section
- `components/render/blocks/HeaderBlock.tsx` - Implemented styled rendering with dynamic logo size
- `components/render/blocks/FooterBlock.tsx` - Implemented styled rendering

**Validation:**
- ✅ TypeScript type check passed
- ✅ ESLint check passed (no new errors)
- ✅ Production build successful

---

## 13. File Structure & Organization

### Files to Modify
```
lib/
├── section-types.ts          # Add HeaderFooterBorderWidth, extend interfaces
└── section-defaults.ts       # Add default values for new fields

components/editor/blocks/
├── HeaderEditor.tsx          # Add logo slider + styling section
└── FooterEditor.tsx          # Add styling section

components/render/blocks/
├── HeaderBlock.tsx           # Implement styled rendering
└── FooterBlock.tsx           # Implement styled rendering
```

### Dependencies
No new dependencies required - uses existing shadcn/ui components (Slider, Switch, Select, ImageUpload).

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Invalid logo size values:** Clamp to 24-80 range
- [ ] **Missing background image:** Graceful fallback to solid color

### Edge Cases to Consider
- [ ] **Empty overlay color:** Default to #000000
- [ ] **Zero opacity:** Hide overlay entirely
- [ ] **Legacy content without new fields:** Use sensible defaults

### Security Considerations
- [ ] **Image URLs:** Use existing ImageUpload component which handles validation
- [ ] **Color values:** Sanitize hex color inputs

---

## 15. Deployment & Configuration

No deployment changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow the existing styling pattern from FeaturesEditor/CTAEditor
2. Use Slider component for logo size (min=24, max=80, step=1)
3. Full-width borders render outside the max-w-6xl container
4. Border has no radius - just a straight line across the viewport
5. Test each layout variant (header: left/right/center, footer: simple/columns/minimal)

### Code Quality Standards
- Follow TypeScript strict mode
- Use existing component patterns
- Maintain mobile-first responsive design
- Support both light and dark mode

---

## 17. Notes & Additional Context

### Reference Implementations
- `components/editor/blocks/FeaturesEditor.tsx` - Styling section pattern
- `components/render/blocks/FeaturesBlock.tsx` - Styled rendering pattern
- `components/editor/blocks/TextEditor.tsx` - Slider usage for settings

### Border Width Values
```typescript
const borderWidthMap = {
  thin: '1px',
  medium: '2px',
  thick: '4px',
};
```

### Logo Size Guidelines
- **Minimum (24px):** Compact icons/small logos
- **Default (32px):** Current size, works for most logos
- **Medium (48px):** Good for detailed logos
- **Maximum (80px):** Large banner-style logos

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **Existing content:** No breaking changes - new fields are optional with defaults

### Ripple Effects Assessment
- [ ] **Page-level overrides:** Must add new override fields to support page customization
- [ ] **Site settings:** Header/Footer in SettingsTab will show new controls

### Performance Implications
- [ ] **Background images:** Uses same lazy loading as other blocks
- [ ] **No new re-renders:** Styling controlled by content state

### User Experience Impacts
- [ ] **Progressive enhancement:** Existing sites unchanged until styling enabled
- [ ] **Discoverability:** Collapsible styling section keeps UI clean

---

*Template Version: 1.0*
*Created: 2025-12-31*
