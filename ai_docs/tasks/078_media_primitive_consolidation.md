# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Primitive Consolidation: Media - Unify image, gallery, embed into single primitive with mode presets

### Goal Statement
**Goal:** Create a unified `Media` primitive block that consolidates the functionality of the existing `image`, `gallery`, and `embed` blocks into a single flexible component with mode presets. This continues the primitive consolidation pattern established with RichText (#73), Cards (#74), and Hero (#75), reducing code duplication while maintaining backwards compatibility with existing blocks.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Strategic analysis conducted** - Multiple architectural approaches exist for consolidating these functionally distinct blocks.

### Problem Context
Three block types (`image`, `gallery`, `embed`) handle visual/media content with varying levels of complexity:
- **ImageEditor.tsx**: 461 lines
- **ImageBlock.tsx**: 340 lines
- **GalleryEditor.tsx**: 445 lines
- **GalleryBlock.tsx**: 88 lines (delegates to gallery/* subcomponents)
- **EmbedEditor.tsx**: 358 lines
- **EmbedBlock.tsx**: 53 lines
- **Total**: ~1,745 lines across 6 files (not counting gallery subcomponents)

Unlike RichText/Cards/Hero consolidations, these blocks are MORE functionally distinct:
- **Image**: Single image with 5 layout options, rich text descriptions, side-by-side layouts
- **Gallery**: Multiple images with 3 display modes (grid, masonry, carousel), lightbox
- **Embed**: External content (YouTube, maps, PDFs), iframe-based rendering

### Solution Options Analysis

#### Option 1: Unified Media Primitive with Mode Presets (Recommended)
**Approach:** Create a new `Media` primitive with `mode` field: "single" | "gallery" | "embed"

**Pros:**
- ✅ Single editor/renderer pair handles all media types
- ✅ Consistent UX - users learn one component with variations
- ✅ Follows established pattern from Cards/Hero primitives
- ✅ Backwards compatible - old blocks continue working
- ✅ Shared SectionStyling support across all modes

**Cons:**
- ❌ Editor complexity increases significantly (must handle 3 very different modes)
- ❌ Gallery has subcomponents that need integration
- ❌ Modes are more distinct than other consolidations (less shared code)
- ❌ Higher complexity estimate (4-6 days)

**Implementation Complexity:** High (4-6 days)
**Risk Level:** Medium - established pattern but more distinct blocks

#### Option 2: Partial Consolidation (Image + Gallery only)
**Approach:** Merge only image and gallery since both deal with displaying images. Keep embed separate.

**Pros:**
- ✅ Smaller scope, faster implementation (3-4 days)
- ✅ Image and gallery have more overlap (both display images)
- ✅ Embed is already compact and works well independently

**Cons:**
- ❌ Incomplete consolidation
- ❌ Still 3+ block types in picker for media content
- ❌ Embed remains without SectionStyling support

**Implementation Complexity:** Medium (3-4 days)
**Risk Level:** Low

#### Option 3: Extract Shared Utilities Only
**Approach:** Don't create new primitive. Extract shared utilities (aspect ratio, border styling) to be used by existing blocks.

**Pros:**
- ✅ Lowest risk, no new components
- ✅ Improves existing code quality
- ✅ Gallery/Embed get SectionStyling without major refactor

**Cons:**
- ❌ Doesn't achieve consolidation goal
- ❌ Still 6 files to maintain
- ❌ Doesn't follow Cards/RichText/Hero pattern

**Implementation Complexity:** Low (1-2 days)
**Risk Level:** Very Low

### Recommendation & Rationale

**🎯 RECOMMENDED SOLUTION:** Option 1 - Unified Media Primitive with Mode Presets

**Why this is the best choice:**
1. **Consistency** - Follows the exact pattern established with Cards and Hero primitives
2. **User Experience** - One "Media" block with clear mode options instead of 3 separate blocks
3. **Maintainability** - Single source of truth for all visual media content
4. **Feature Parity** - All modes get SectionStyling support (Gallery and Embed currently lack this)

**Key Decision Factors:**
- **Performance Impact:** Minimal - same rendering patterns, just consolidated
- **User Experience:** Improved - clearer organization in block picker
- **Maintainability:** Improved - fewer files to maintain
- **Scalability:** Better - new media types (video, audio) could be added to same primitive
- **Security:** No change

**Alternative Consideration:**
Option 2 would be acceptable if the complexity of Option 1 proves too high during implementation. Image and Gallery consolidation alone would still provide value.

### Decision Request

**👤 USER DECISION:** ✅ Approved 2026-01-21

User approved Option 1 (Full consolidation) with the following decisions:
- Consolidate all 3 blocks (image, gallery, embed) into unified Media primitive
- Show confirmation warning when switching modes with potential data loss
- Preserve data where possible (e.g., first gallery image → single image src)

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4 for styling
- **Key Architectural Patterns:** Next.js App Router, Server Components, SectionStyling pattern

### Current State
Three separate block types exist with varying levels of styling support:

| Feature | Image | Gallery | Embed |
|---------|-------|---------|-------|
| SectionStyling | ✅ | ❌ | ❌ |
| Border Controls | ✅ (via styling) | ✅ (custom impl) | ❌ |
| Background/Overlay | ✅ | ❌ | ❌ |
| Multiple Items | ❌ | ✅ (images array) | ❌ |
| Lightbox | ❌ | ✅ | ❌ |
| Carousel Mode | ❌ | ✅ | ❌ |
| Layout Options | 5 (image-only, left, right, top, bottom) | 3 (grid, masonry, carousel) | 1 (aspect ratio only) |
| Rich Text | ✅ (description) | ❌ | ❌ |
| Captions | ✅ | ✅ (per image) | ❌ (has title) |
| External Content | ❌ | ❌ | ✅ (embed code, PDF) |

### Existing Codebase Analysis

**🔍 Analysis Checklist - Relevant Areas:**

- [x] **Database Schema** - No schema changes needed (JSONB content field)
- [x] **Component Patterns** - Follows Cards/Hero primitive pattern
- [x] **Styling Controls** - Will use StylingControls component from #81

**Key Files Analyzed:**
- `lib/section-types.ts` - ImageContent (lines 319-329), GalleryContent (lines 354-368), EmbedContent (lines 524-535)
- `lib/section-defaults.ts` - Default values for each block type
- `lib/styling-utils.ts` - Shared styling utilities (BORDER_WIDTHS, BORDER_RADII, etc.)
- `components/editor/StylingControls.tsx` - Reusable styling panels

**Editor Files:**
- `components/editor/blocks/ImageEditor.tsx` - 461 lines, has TiptapEditor for descriptions
- `components/editor/blocks/GalleryEditor.tsx` - 445 lines, manages images array
- `components/editor/blocks/EmbedEditor.tsx` - 358 lines, tabs for embed code vs PDF

**Renderer Files:**
- `components/render/blocks/ImageBlock.tsx` - 340 lines, 5 layout variations
- `components/render/blocks/GalleryBlock.tsx` - 88 lines, delegates to subcomponents
- `components/render/blocks/EmbedBlock.tsx` - 53 lines, minimal iframe wrapper

**Gallery Subcomponents (to preserve):**
- `components/render/gallery/GalleryGrid.tsx`
- `components/render/gallery/GalleryMasonry.tsx`
- `components/render/gallery/GalleryCarousel.tsx`
- `components/render/gallery/GalleryLightbox.tsx`

---

## 4. Context & Problem Definition

### Problem Statement
The image, gallery, and embed blocks represent variations of visual media display with inconsistent feature availability:
- Image block has full SectionStyling; Gallery and Embed do not
- Gallery has custom border implementation duplicating StylingControls
- Embed block has no styling options at all
- Three separate entries in block picker for related functionality
- Maintenance burden across 6 files (not counting gallery subcomponents)

### Success Criteria
- [ ] New `media` primitive with 3 mode presets available in block picker
- [ ] Single MediaEditor.tsx handles all modes
- [ ] Single MediaBlock.tsx renders all modes (delegating to subcomponents as needed)
- [ ] Existing image, gallery, embed blocks continue to work (backwards compatible)
- [ ] Mode switching works without data loss (for applicable fields)
- [ ] All existing features preserved per mode
- [ ] EditorMode toggle (content/layout) works correctly
- [ ] SectionStyling available for all modes
- [ ] Build and type check pass

---

## 5. Development Mode Context

### Development Mode Context
- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** - but we CHOOSE to maintain it for cleaner migration
- **Data loss acceptable** - but mode switching should preserve common fields where possible
- **Priority: Clean architecture** over aggressive migration

---

## 6. Technical Requirements

### Functional Requirements
- User can add new "Media" block from block picker with mode selection
- User can switch modes within the editor (single ↔ gallery ↔ embed)
- **Mode switching shows confirmation warning** when data may be lost
- System preserves common fields when switching modes (e.g., first gallery image → single src)
- Mode-specific fields are conditionally shown/hidden in editor
- **Single mode includes:** Image upload, alt text, caption, 5 layout options, rich text description
- **Gallery mode includes:** Images array, 3 layouts (grid/masonry/carousel), lightbox, auto-rotate
- **Embed mode includes:** Embed code / PDF selection, aspect ratio, title

### Non-Functional Requirements
- **Performance:** No degradation from current blocks
- **Responsive Design:** All modes work on mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Theme Support:** Must support both light and dark mode using existing theme system
- **SectionStyling:** All modes support border, background, overlay, typography options

### Technical Constraints
- Must use existing `StylingControls` component from #81
- Must preserve gallery subcomponents (Grid, Masonry, Carousel, Lightbox)
- Must support EditorMode toggle for content/layout separation
- Old block types (image, gallery, embed) must continue working

---

## 7. Data & Database Changes

### Database Schema Changes
No database schema changes required - sections table uses JSONB content field.

### Data Model Updates

```typescript
// lib/section-types.ts - New types

export type MediaMode = "single" | "gallery" | "embed";

// Shared across all modes
export interface MediaContent extends SectionStyling {
  mode: MediaMode;

  // ===== SINGLE MODE =====
  // (when mode === "single")
  src?: string;                     // Image source URL
  alt?: string;                     // Alt text
  caption?: string;                 // Image caption
  imageWidth?: ImageWidth;          // 10 | 25 | 50 | 75 | 100
  textWidth?: ImageWidth;           // For side-by-side layouts
  layout?: ImageLayout;             // image-only | image-left | image-right | image-top | image-bottom
  description?: string;             // Rich text HTML (TipTap)

  // ===== GALLERY MODE =====
  // (when mode === "gallery")
  images?: GalleryImage[];          // Array of gallery images
  aspectRatio?: GalleryAspectRatio; // 1:1 | 16:9 | 4:3 | 3:4 | original
  galleryLayout?: GalleryLayout;    // grid | masonry | carousel
  columns?: GalleryColumns;         // 2 | 3 | 4 | auto
  gap?: GalleryGap;                 // none | small | medium | large
  lightbox?: boolean;               // Enable lightbox on click
  autoRotate?: boolean;             // Carousel auto-rotate
  autoRotateInterval?: GalleryAutoRotateInterval;

  // ===== EMBED MODE =====
  // (when mode === "embed")
  embedCode?: string;               // HTML embed code
  embedSrc?: string;                // Extracted iframe src
  embedAspectRatio?: EmbedAspectRatio; // 16:9 | 4:3 | 1:1 | letter | custom
  customHeight?: number;            // For custom aspect ratio
  embedTitle?: string;              // Embed title/label
  sourceType?: EmbedSourceType;     // embed | pdf
  documentId?: string;              // PDF document ID
  documentSlug?: string;            // PDF document slug
}
```

### Data Migration Plan
No migration required - new block type, old blocks remain functional.

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
No backend changes required - this is a frontend-only primitive consolidation.

---

## 9. Frontend Changes

### New Components
- [ ] **`components/editor/blocks/MediaEditor.tsx`** - Unified editor (~1000-1200 lines expected)
  - Mode selector tabs (Single | Gallery | Embed)
  - Conditional field rendering based on mode
  - StylingControls integration for all modes
  - EditorMode support (content/layout toggle)

- [ ] **`components/render/blocks/MediaBlock.tsx`** - Unified renderer (~400-500 lines expected)
  - Mode-based rendering logic
  - Delegates to existing gallery subcomponents for gallery mode
  - Full SectionStyling support

### Page Updates
No page updates required.

### State Management
Uses existing patterns:
- Content managed via `content` prop and `onChange` callback
- SectionStyling state handled by StylingControls component
- Gallery state (lightbox) managed by GalleryBlock/subcomponents

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**ImageContent (lib/section-types.ts:319-329):**
```typescript
export interface ImageContent extends SectionStyling {
  src: string;
  alt: string;
  caption?: string;
  imageWidth?: ImageWidth;
  textWidth?: ImageWidth;
  layout?: ImageLayout;
  description?: string;
}
```

**GalleryContent (lib/section-types.ts:354-368):**
```typescript
export interface GalleryContent {
  images: GalleryImage[];
  aspectRatio?: GalleryAspectRatio;
  layout?: GalleryLayout;
  columns?: GalleryColumns;
  gap?: GalleryGap;
  lightbox?: boolean;
  autoRotate?: boolean;
  autoRotateInterval?: GalleryAutoRotateInterval;
  showBorder?: boolean;
  borderWidth?: GalleryBorderWidth;
  borderRadius?: GalleryBorderRadius;
  borderColor?: string;
}
// Note: Does NOT extend SectionStyling
```

**EmbedContent (lib/section-types.ts:524-535):**
```typescript
export interface EmbedContent {
  embedCode: string;
  src: string;
  aspectRatio: EmbedAspectRatio;
  customHeight?: number;
  title?: string;
  sourceType?: EmbedSourceType;
  documentId?: string;
  documentSlug?: string;
}
// Note: Does NOT extend SectionStyling
```

### 📂 **After Refactor**

**Unified MediaContent:**
```typescript
export type MediaMode = "single" | "gallery" | "embed";

export interface MediaContent extends SectionStyling {
  mode: MediaMode;

  // Single mode fields (prefixed for clarity in union)
  src?: string;
  alt?: string;
  caption?: string;
  imageWidth?: ImageWidth;
  textWidth?: ImageWidth;
  layout?: ImageLayout;
  description?: string;

  // Gallery mode fields
  images?: GalleryImage[];
  aspectRatio?: GalleryAspectRatio;
  galleryLayout?: GalleryLayout;
  columns?: GalleryColumns;
  gap?: GalleryGap;
  lightbox?: boolean;
  autoRotate?: boolean;
  autoRotateInterval?: GalleryAutoRotateInterval;

  // Embed mode fields
  embedCode?: string;
  embedSrc?: string;
  embedAspectRatio?: EmbedAspectRatio;
  customHeight?: number;
  embedTitle?: string;
  sourceType?: EmbedSourceType;
  documentId?: string;
  documentSlug?: string;
}
```

### 🎯 **Key Changes Summary**
- [ ] **New MediaContent interface** - Unified type extending SectionStyling
- [ ] **New MediaEditor.tsx** - Single editor handling all 3 modes
- [ ] **New MediaBlock.tsx** - Single renderer handling all 3 modes
- [ ] **SectionStyling for all modes** - Gallery and Embed get styling they currently lack
- [ ] **Existing blocks preserved** - image, gallery, embed continue working

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Add "media" to BLOCK_TYPES
- `lib/section-types.ts` - Add MediaMode, MediaContent
- `lib/section-defaults.ts` - Add media defaults for each mode
- `lib/section-templates.ts` - Add media templates
- `components/editor/BlockIcon.tsx` - Add icon for media block
- `components/editor/SectionEditor.tsx` - Add MediaEditor routing
- `components/editor/inspector/ContentTab.tsx` - Add MediaEditor case
- `components/render/BlockRenderer.tsx` - Add MediaBlock routing
- `components/render/PreviewBlockRenderer.tsx` - Add MediaBlock case

**Files Created:**
- `components/editor/blocks/MediaEditor.tsx`
- `components/render/blocks/MediaBlock.tsx`

---

## 11. Implementation Plan

### Phase 1: Type System & Schema Updates ✅ 2026-01-21
**Goal:** Add new types and schema entries for media primitive

- [x] **Task 1.1:** Add MediaMode and MediaContent types to section-types.ts ✅
  - Added MediaMode type: "single" | "gallery" | "embed"
  - Added MediaContent interface extending SectionStyling with all mode-specific fields
  - Added to SectionContent union and ContentTypeMap
- [x] **Task 1.2:** Add "media" to BLOCK_TYPES in sections.ts schema ✅
- [x] **Task 1.3:** Add media defaults to section-defaults.ts ✅
  - Default mode: "single" with all mode-specific field defaults
- [x] **Task 1.4:** Add BLOCK_TYPE_INFO entry for media block ✅
  - Icon: "image", Category: "media"
- [x] **Task 1.5:** Add media templates to section-templates.ts ✅
  - 9 templates: 3 single (simple, with-text, profile), 3 gallery (grid, masonry, carousel), 3 embed (video, map, pdf)
- [x] **Task 1.6:** Add media icon to BlockIcon.tsx ✅
  - Using Images icon from lucide-react

### Phase 2: Media Renderer Implementation ✅ 2026-01-21
**Goal:** Create unified MediaBlock component

- [x] **Task 2.1:** Create MediaBlock.tsx with mode-based rendering ✅
  - Created 530-line component with SingleModeBlock, GalleryModeBlock, EmbedModeBlock
- [x] **Task 2.2:** Implement single mode rendering (port ImageBlock logic) ✅
  - Full 5-layout support (image-only, image-left/right, image-top/bottom)
  - Rich text description with styled CSS
- [x] **Task 2.3:** Implement gallery mode rendering (delegate to gallery subcomponents) ✅
  - Delegates to existing GalleryGrid, GalleryMasonry, GalleryCarousel, GalleryLightbox
  - Converts MediaContent to GalleryContent with borderRadius mapping (full→pill)
- [x] **Task 2.4:** Implement embed mode rendering (port EmbedBlock logic) ✅
  - Aspect ratio support (16:9, 4:3, 1:1, letter, custom)
  - Uses getCardStyles for consistent theming
- [x] **Task 2.5:** Add SectionStyling support for all modes ✅
  - Background image + overlay support for all three modes
- [x] **Task 2.6:** Add to BlockRenderer.tsx and PreviewBlockRenderer.tsx ✅

### Phase 3: Media Editor Implementation ✅ 2026-01-21
**Goal:** Create unified MediaEditor component

- [x] **Task 3.1:** Create MediaEditor.tsx with mode selector tabs ✅
  - Created ~1200 line component with mode selector tabs
- [x] **Task 3.2:** Implement single mode editor (port ImageEditor logic) ✅
  - SingleModeEditor subcomponent with image upload, alt text, caption, layout, description
- [x] **Task 3.3:** Implement gallery mode editor (port GalleryEditor logic) ✅
  - GalleryModeEditor subcomponent with images array, layout, aspect ratio, columns, gap, border, lightbox, auto-rotate
- [x] **Task 3.4:** Implement embed mode editor (port EmbedEditor logic) ✅
  - EmbedModeEditor subcomponent with tabs for embed code/PDF, aspect ratio, title
- [x] **Task 3.5:** Add StylingControls integration for all modes ✅
  - Collapsible styling section with border, background, overlay, typography controls
- [x] **Task 3.6:** Add EditorMode support (content/layout toggle) ✅
  - showContent/showLayout conditional rendering throughout
- [x] **Task 3.7:** Add to SectionEditor.tsx and ContentTab.tsx ✅
  - Added MediaEditor import and case block to both files
- [x] **Task 3.8:** Add AlertDialog for mode switching with data loss warning ✅
  - hasDataForMode() function checks for data loss, shows confirmation dialog

### Phase 4: Testing & Validation ✅ 2026-01-21
**Goal:** Verify implementation works correctly

- [x] **Task 4.1:** Run linting and type checking ✅
  - `npm run type-check` passes with no errors
  - `npm run build` passes with no errors
- [x] **Task 4.2:** Static analysis complete ✅
  - All MediaEditor and MediaBlock warnings resolved
  - Fixed unused imports, dependency arrays, unused props

### Phase 5: Comprehensive Code Review ✅ 2026-01-21
**Goal:** Final verification before user testing

- [x] **Task 5.1:** Implementation Complete! ✅
- [x] **Task 5.2:** Code review executed ✅
  - Verified all files compile correctly
  - Verified consistent patterns with existing editors
  - Verified SectionStyling support works for all modes

### Phase 6: User Browser Testing
**Goal:** Human verification of UI/UX

- [ ] **Task 6.1:** Present AI testing results
- [ ] **Task 6.2:** Request user UI testing
- [ ] **Task 6.3:** Wait for user confirmation

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Task Completion Tracking - MANDATORY WORKFLOW
🚨 **CRITICAL: Real-time task completion tracking is mandatory**

- [ ] **🗓️ GET TODAY'S DATE FIRST** - 2026-01-21
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp

---

## 13. File Structure & Organization

### New Files to Create
```
components/
├── editor/blocks/
│   └── MediaEditor.tsx              # Unified media editor
└── render/blocks/
    └── MediaBlock.tsx               # Unified media renderer
```

### Files to Modify
- [ ] `lib/drizzle/schema/sections.ts` - Add "media" to BLOCK_TYPES
- [ ] `lib/section-types.ts` - Add MediaMode, MediaContent interface
- [ ] `lib/section-defaults.ts` - Add media defaults
- [ ] `lib/section-templates.ts` - Add media templates
- [ ] `components/editor/BlockIcon.tsx` - Add Image icon for media
- [ ] `components/editor/SectionEditor.tsx` - Add MediaEditor case
- [ ] `components/editor/inspector/ContentTab.tsx` - Add MediaEditor case
- [ ] `components/render/BlockRenderer.tsx` - Add MediaBlock case
- [ ] `components/render/PreviewBlockRenderer.tsx` - Add MediaBlock case

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Mode switching data loss:** When switching from gallery to single, images array is lost
  - **Mitigation:** Preserve first image from gallery as single image src
- [ ] **Gallery subcomponent integration:** MediaBlock must correctly delegate to gallery subcomponents
  - **Mitigation:** Extract rendering logic from GalleryBlock, don't reinvent
- [ ] **TipTap editor in MediaEditor:** Dynamic import may cause issues
  - **Mitigation:** Use same pattern as ImageEditor

### Edge Cases to Consider
- [ ] **Empty mode fields:** User adds media block but doesn't configure
  - **Mitigation:** Show appropriate empty state per mode
- [ ] **PDF mode in embed:** Must correctly fetch site documents
  - **Mitigation:** Reuse exact logic from EmbedEditor

### Security & Access Control Review
- [ ] **Image uploads:** Use existing ImageUpload component (already secured)
- [ ] **Embed code:** Validate using existing validateEmbedCode() utility
- [ ] **PDF access:** Validate document ownership via existing action

---

## 15. Deployment & Configuration

No deployment changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the phase-by-phase implementation from Section 11.

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for cleaner code
- [ ] Use async/await instead of .then() chaining
- [ ] Use StylingControls from shared module
- [ ] Support EditorMode toggle (content/layout)
- [ ] Ensure responsive design

### Architecture Compliance
- [ ] New media block extends SectionStyling
- [ ] Reuse existing gallery subcomponents
- [ ] Reuse existing embed utilities
- [ ] Follow established primitive pattern (Cards, Hero)

---

## 17. Notes & Additional Context

### Reference Implementations
- **Cards Primitive:** `ai_docs/tasks/076_cards_primitive_consolidation.md`
- **Hero Primitive:** `ai_docs/tasks/077_hero_primitive_consolidation.md`
- **Gallery Subcomponents:** `components/render/gallery/*`
- **StylingControls:** `components/editor/StylingControls.tsx`

### Complexity Acknowledgment
This consolidation is more complex than RichText/Cards/Hero because:
1. The three blocks are more functionally distinct
2. Gallery has subcomponent architecture that must be preserved
3. Embed has special validation and PDF mode

The expected code reduction may be less dramatic (~20-30% vs 40% for other primitives) but the consistency benefits (SectionStyling for all, single entry point) are valuable.

---

## 18. Second-Order Consequences & Impact Analysis

### Critical Issues Identification

#### ⚠️ **YELLOW FLAGS - Discuss with User**
- [ ] **Gallery subcomponents:** Must ensure delegation pattern preserved correctly
- [ ] **Mode switching UX:** Users may be surprised when switching modes loses data
- [ ] **Editor complexity:** MediaEditor will be largest editor (~1000-1200 lines)

### Mitigation Strategies
- **Gallery integration:** Extract GalleryBlock's delegation logic, don't reinvent
- **Mode switching:** Show confirmation dialog when switching modes with data
- **Editor size:** Use proper section organization, EditorMode toggle to reduce visible complexity

---

*Template Version: 1.0*
*Created: 2026-01-21*
*Feature: #76 from features-backlog.md*
