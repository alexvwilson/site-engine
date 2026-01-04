# Task 059: Product/Catalog Grid Block

> **Status:** Planning
> **Created:** 2026-01-03
> **Feature Backlog Reference:** #47

---

## 1. Task Overview

### Task Title
**Title:** Product/Catalog Grid Block - Display items with action links

### Goal Statement
**Goal:** Create a new "Product Grid" block type that allows users to display products, albums, or portfolio items with images, titles, descriptions, and multiple action links (Amazon, Spotify, YouTube, etc.). This enables use cases like music labels showing album covers with streaming/purchase buttons, or portfolios with project links.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Users need to display items with clickable action buttons but the existing Gallery block only shows images without titles or links. This is a straightforward new block type - no strategic analysis needed as the approach is clear.

**Skipping strategic analysis** - Single obvious solution (new block type following established patterns).

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Language:** TypeScript 5.x with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Block System:** Established pattern with editor + renderer components

### Current State
- 10 existing block types with established patterns
- Gallery block shows images but no titles or action links
- Social links feature (#45) already has platform icon infrastructure in `lib/social-icons.tsx`
- Block styling options pattern established (border, background, overlay)

### Existing Codebase Analysis

**Relevant patterns to follow:**
- [ ] **Block Types:** `lib/drizzle/schema/sections.ts` - BLOCK_TYPES array
- [ ] **Content Types:** `lib/section-types.ts` - Content interfaces
- [ ] **Defaults:** `lib/section-defaults.ts` - Default content
- [ ] **Templates:** `lib/section-templates.ts` - Block templates
- [ ] **Editor Pattern:** `components/editor/blocks/*.tsx`
- [ ] **Renderer Pattern:** `components/render/blocks/*.tsx`
- [ ] **Icon Pattern:** `lib/social-icons.tsx` - Platform icons with brand colors

---

## 4. Context & Problem Definition

### Problem Statement
The Gallery block shows images but doesn't support:
- Titles or descriptions per item
- Action links/buttons (Buy, Stream, Watch, etc.)
- Platform-specific icons for common services

Users wanting to showcase products, albums, or portfolio items with call-to-action buttons must create awkward workarounds or use external solutions.

### Success Criteria
- [ ] New `product_grid` block type available in block picker
- [ ] Each item supports: image, title (optional), description (optional), up to 5 action links
- [ ] Platform icons for: Amazon, iTunes/Apple Music, Spotify, YouTube, SoundCloud, Tidal, Bandcamp, Custom
- [ ] Grid layout with 2/3/4 column options
- [ ] Drag-and-drop reordering of items in editor
- [ ] Styling options (border, background, overlay) following established pattern
- [ ] At least 2 templates (e.g., "Music Catalog", "Product Showcase")
- [ ] Responsive design (stacks on mobile)

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns**
- **Priority: Clean implementation following existing patterns**

---

## 6. Technical Requirements

### Functional Requirements
- User can add a Product Grid block to any page
- User can add/edit/remove items in the grid
- Each item can have an image, title, description, and 1-5 action links
- Each link has a platform type and URL
- User can reorder items via drag-and-drop
- User can choose column count (2, 3, 4, or auto)
- Links display as icon buttons below each item

### Non-Functional Requirements
- **Performance:** Lazy load images, efficient rendering for 20+ items
- **Responsive Design:** Grid stacks appropriately on mobile (1-2 columns)
- **Theme Support:** Icons support brand colors, monochrome, or theme primary (like social links)
- **Accessibility:** Proper alt text, keyboard navigation for links

### Technical Constraints
- Must follow existing block type patterns
- Reuse social icons infrastructure where applicable
- Maximum 5 action links per item (UI constraint)

---

## 7. Data & Database Changes

### Database Schema Changes
Add `product_grid` to BLOCK_TYPES enum in `lib/drizzle/schema/sections.ts`:

```typescript
export const BLOCK_TYPES = [
  "header",
  "hero",
  "text",
  "image",
  "gallery",
  "features",
  "cta",
  "testimonials",
  "contact",
  "footer",
  "embed",
  "heading",
  "markdown",
  "blog_grid",
  "blog_featured",
  "social_links",
  "product_grid", // NEW
] as const;
```

**No database migration required** - just adding to the TypeScript enum. Content is stored as JSONB.

### Data Model Updates

```typescript
// lib/section-types.ts

// Platform types for product links
export const PRODUCT_PLATFORMS = [
  "amazon",
  "itunes",
  "apple_music",
  "spotify",
  "youtube",
  "soundcloud",
  "tidal",
  "bandcamp",
  "custom",
] as const;

export type ProductPlatform = (typeof PRODUCT_PLATFORMS)[number];

// Individual action link
export interface ProductLink {
  platform: ProductPlatform;
  url: string;
  label?: string; // Optional custom label for "custom" platform
}

// Single product/catalog item
export interface ProductItem {
  id: string; // UUID for drag-drop
  image?: string;
  title?: string;
  description?: string;
  links: ProductLink[];
}

// Icon style options (reuse from social links)
export type ProductIconStyle = "brand" | "monochrome" | "primary";

// Column options
export type ProductGridColumns = 2 | 3 | 4 | "auto";

// Gap options
export type ProductGridGap = "small" | "medium" | "large";

// Full block content
export interface ProductGridContent {
  // Section header (optional)
  sectionTitle?: string;
  sectionSubtitle?: string;

  // Items
  items: ProductItem[];

  // Layout
  columns: ProductGridColumns;
  gap: ProductGridGap;

  // Icon styling
  iconStyle: ProductIconStyle;

  // Block styling (following established pattern)
  enableStyling?: boolean;
  showBorder?: boolean;
  borderWidth?: BorderWidth;
  borderRadius?: BorderRadius;
  borderColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColorMode?: TextColorMode;
  cardBackground?: string;
  cardBackgroundOpacity?: number;
}
```

---

## 8. Backend Changes & Background Jobs

### Server Actions
No new server actions needed - uses existing `addSection`, `updateSection`, `deleteSection` from `app/actions/sections.ts`.

### API Routes
None needed.

---

## 9. Frontend Changes

### New Components

#### `lib/product-icons.tsx`
Platform icons component (similar to social-icons.tsx but for product/streaming platforms):
- Amazon, iTunes, Apple Music, Spotify, YouTube, SoundCloud, Tidal, Bandcamp icons
- Brand colors for each platform
- Support for brand/monochrome/primary styles
- Size variants (small, medium, large)

#### `components/editor/blocks/ProductGridEditor.tsx`
Editor component with:
- Section title/subtitle fields
- Items list with drag-and-drop reordering (dnd-kit)
- Add/Edit/Delete item controls
- Per-item: image upload, title, description, links management
- Link management: platform picker + URL input (max 5)
- Layout controls: columns, gap
- Icon style selector
- Styling options collapsible (border, background, etc.)

#### `components/render/blocks/ProductGridBlock.tsx`
Renderer component with:
- Optional section title/subtitle
- Responsive grid layout
- Item cards with image, title, description
- Platform icon buttons below each item
- Hover states on links
- Theme-aware styling

### Files to Modify

- `lib/drizzle/schema/sections.ts` - Add "product_grid" to BLOCK_TYPES
- `lib/section-types.ts` - Add ProductGridContent and related types
- `lib/section-defaults.ts` - Add product_grid defaults
- `lib/section-templates.ts` - Add product_grid templates
- `components/editor/SectionEditor.tsx` - Route to ProductGridEditor
- `components/editor/BlockIcon.tsx` - Add icon for product_grid
- `components/render/BlockRenderer.tsx` - Route to ProductGridBlock

---

## 10. Code Changes Overview

### Current Implementation (Before)
No product grid block exists. Closest patterns:

```typescript
// lib/section-types.ts - Gallery for reference
export interface GalleryContent {
  images: GalleryImage[];
  layout: GalleryLayout;
  // ... no titles or action links
}

// lib/social-icons.tsx - Icon pattern for reference
export function SocialIcon({ platform, style, size, primaryColor }) {
  // Returns SVG icon for platform
}
```

### After Implementation

```typescript
// lib/section-types.ts - New types
export interface ProductGridContent {
  sectionTitle?: string;
  sectionSubtitle?: string;
  items: ProductItem[];
  columns: ProductGridColumns;
  gap: ProductGridGap;
  iconStyle: ProductIconStyle;
  // ... styling options
}

// lib/product-icons.tsx - New file
export function ProductIcon({ platform, style, size, primaryColor }) {
  // Returns SVG icon for Amazon, Spotify, etc.
}

// components/editor/blocks/ProductGridEditor.tsx - New file
export function ProductGridEditor({ content, onChange, siteId }) {
  // Full editor with item management, drag-drop, links
}

// components/render/blocks/ProductGridBlock.tsx - New file
export function ProductGridBlock({ content, theme }) {
  // Renders responsive grid with items and action links
}
```

### Key Changes Summary
- [ ] **New file:** `lib/product-icons.tsx` - Platform icons (Amazon, Spotify, etc.)
- [ ] **New file:** `components/editor/blocks/ProductGridEditor.tsx` - Editor UI
- [ ] **New file:** `components/render/blocks/ProductGridBlock.tsx` - Renderer
- [ ] **Modified:** `lib/drizzle/schema/sections.ts` - Add block type
- [ ] **Modified:** `lib/section-types.ts` - Add content types
- [ ] **Modified:** `lib/section-defaults.ts` - Add defaults
- [ ] **Modified:** `lib/section-templates.ts` - Add templates
- [ ] **Modified:** `components/editor/SectionEditor.tsx` - Editor routing
- [ ] **Modified:** `components/editor/BlockIcon.tsx` - Block picker icon
- [ ] **Modified:** `components/render/BlockRenderer.tsx` - Renderer routing

---

## 11. Implementation Plan

### Phase 1: Types and Schema
**Goal:** Add TypeScript types and update block type enum

- [ ] **Task 1.1:** Add "product_grid" to BLOCK_TYPES in `lib/drizzle/schema/sections.ts`
- [ ] **Task 1.2:** Add ProductGridContent and related types to `lib/section-types.ts`
- [ ] **Task 1.3:** Add BLOCK_TYPE_INFO entry for product_grid
- [ ] **Task 1.4:** Add defaults in `lib/section-defaults.ts`
- [ ] **Task 1.5:** Add templates in `lib/section-templates.ts` (Music Catalog, Product Showcase)

### Phase 2: Platform Icons
**Goal:** Create product platform icons component

- [ ] **Task 2.1:** Create `lib/product-icons.tsx` with:
  - Platform SVG icons (Amazon, iTunes, Apple Music, Spotify, YouTube, SoundCloud, Tidal, Bandcamp, Link/Custom)
  - Brand color constants
  - ProductIcon component with style/size props
  - Platform labels constant

### Phase 3: Editor Component
**Goal:** Build the ProductGridEditor

- [ ] **Task 3.1:** Create `components/editor/blocks/ProductGridEditor.tsx`
- [ ] **Task 3.2:** Implement section title/subtitle fields
- [ ] **Task 3.3:** Implement items list with drag-and-drop (dnd-kit)
- [ ] **Task 3.4:** Implement add/edit/delete item modal
- [ ] **Task 3.5:** Implement per-item link management (platform picker + URL, max 5)
- [ ] **Task 3.6:** Implement layout controls (columns, gap, icon style)
- [ ] **Task 3.7:** Implement styling options section
- [ ] **Task 3.8:** Add ProductGridEditor routing in SectionEditor.tsx
- [ ] **Task 3.9:** Add block icon in BlockIcon.tsx

### Phase 4: Renderer Component
**Goal:** Build the ProductGridBlock renderer

- [ ] **Task 4.1:** Create `components/render/blocks/ProductGridBlock.tsx`
- [ ] **Task 4.2:** Implement responsive grid layout
- [ ] **Task 4.3:** Implement item card rendering (image, title, description)
- [ ] **Task 4.4:** Implement action link buttons with platform icons
- [ ] **Task 4.5:** Implement styling options (border, background, overlay)
- [ ] **Task 4.6:** Add ProductGridBlock routing in BlockRenderer.tsx

### Phase 5: Testing & Validation
**Goal:** Verify implementation works correctly

- [ ] **Task 5.1:** Run type-check to verify no TypeScript errors
- [ ] **Task 5.2:** Run lint to verify code quality
- [ ] **Task 5.3:** Present implementation complete message

### Phase 6: Comprehensive Code Review
**Goal:** Thorough review of all changes

- [ ] **Task 6.1:** Review all modified files
- [ ] **Task 6.2:** Verify all success criteria met
- [ ] **Task 6.3:** Provide detailed review summary

### Phase 7: User Browser Testing
**Goal:** User validates in browser

- [ ] **Task 7.1:** User tests adding product grid block
- [ ] **Task 7.2:** User tests adding/editing/deleting items
- [ ] **Task 7.3:** User tests action links work correctly
- [ ] **Task 7.4:** User tests responsive layout
- [ ] **Task 7.5:** User tests on published site

---

## 12. Task Completion Tracking

Will be updated as tasks are completed with timestamps and notes.

---

## 13. File Structure & Organization

### New Files to Create
```
lib/
  product-icons.tsx              # Platform icons component

components/
  editor/
    blocks/
      ProductGridEditor.tsx      # Editor component
  render/
    blocks/
      ProductGridBlock.tsx       # Renderer component
```

### Files to Modify
```
lib/
  drizzle/schema/sections.ts     # Add block type
  section-types.ts               # Add content types
  section-defaults.ts            # Add defaults
  section-templates.ts           # Add templates

components/
  editor/
    SectionEditor.tsx            # Route to editor
    BlockIcon.tsx                # Add picker icon
  render/
    BlockRenderer.tsx            # Route to renderer
```

---

## 14. Potential Issues & Edge Cases

### Edge Cases
- [ ] **Empty items array:** Show placeholder message in editor and renderer
- [ ] **Missing image:** Show placeholder or title-only card
- [ ] **Invalid URLs:** Validate URL format in editor
- [ ] **Long titles/descriptions:** Truncate with ellipsis, full text on hover
- [ ] **Many items (20+):** Ensure efficient rendering, consider virtualization if needed

### Error Scenarios
- [ ] **Image upload failure:** Show error state, allow retry
- [ ] **Broken image URL:** Show fallback placeholder

---

## 15. Deployment & Configuration

No new environment variables needed.

---

## 16. AI Agent Instructions

Following standard workflow from template.

---

## 17. Notes & Additional Context

### Platform Icon Reference
- **Amazon:** Orange cart icon
- **iTunes/Apple Music:** Pink/gradient music note
- **Spotify:** Green circle with sound waves
- **YouTube:** Red play button
- **SoundCloud:** Orange cloud
- **Tidal:** Black wave
- **Bandcamp:** Blue/cyan "bc" or record icon
- **Custom:** Generic link icon

### Design Considerations
- Links should be icon buttons (no text labels needed for known platforms)
- Hover state shows platform name tooltip
- On mobile, consider 2 columns max
- Cards should have consistent height within a row

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [ ] **No breaking changes** - New block type, doesn't affect existing blocks

#### Ripple Effects Assessment
- [ ] **Minimal ripple effects** - Self-contained new feature

#### Performance Implications
- [ ] **Image loading:** Use next/image for optimization
- [ ] **Bundle size:** New icons file (~5-10KB), acceptable

#### Security Considerations
- [ ] **URL validation:** Ensure URLs are valid before rendering as links
- [ ] **No user input stored without sanitization**

### Critical Issues Identification
**No red flags identified** - This is a straightforward new block type following established patterns.

---

*Template Version: 1.0*
*Task Created: 2026-01-03*
