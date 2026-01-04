# Task 060: Article Block with Inline Images

> **Status:** Completed ✅
> **Created:** 2026-01-03
> **Completed:** 2026-01-03
> **Backlog Item:** #46 - Rich Content Editor (TipTap with Inline Images)

---

## 1. Task Overview

### Task Title
**Title:** New "Article" Block Type with TipTap Inline Image Support

### Goal Statement
**Goal:** Create a new "Article" block type that extends TipTap with image insertion capabilities, allowing users to create article-style layouts where images can float alongside text (like an About page with a photo next to a bio). This addresses a gap where the existing Text block only supports formatted text, and stacking separate Image + Text blocks doesn't allow text wrapping around images.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Users need to create rich article-style content with images embedded within text that wraps around them. Currently, they must stack separate Image and Text blocks, which creates rigid layouts without text flow around images.

### Solution Options Analysis

#### Option 1: Enhance Existing Text Block
**Approach:** Add image capabilities directly to the existing Text block

**Pros:**
- No new block type needed
- Simpler migration path for existing content

**Cons:**
- Increases complexity of Text block
- May confuse users who want simple text editing
- Harder to maintain two distinct use cases in one component

**Implementation Complexity:** Medium
**Risk Level:** Medium - could affect existing Text block users

#### Option 2: New "Article" Block Type (Selected)
**Approach:** Create a separate "article" block with enhanced TipTap editor including image support

**Pros:**
- Clean separation of concerns - Text for simple content, Article for rich layouts
- No risk to existing Text block functionality
- Can add more article-specific features in future (pull quotes, captions, etc.)
- Clearer user mental model

**Cons:**
- New block type to maintain
- Some code duplication with Text block

**Implementation Complexity:** Medium
**Risk Level:** Low - isolated new feature

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 2 - New "Article" Block Type

**Why this is the best choice:**
1. **User clarity** - Users can choose simple text or article layout based on their needs
2. **Future extensibility** - Article block can grow with more features without bloating Text block
3. **Risk mitigation** - No chance of breaking existing Text block functionality

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Rich Text Editor:** TipTap with StarterKit, Link, Placeholder extensions

### Current State
- TipTap editor exists at `components/editor/TiptapEditor.tsx` with:
  - Bold, Italic, H2, H3, Lists, Blockquote, Links
  - Markdown detection and conversion
  - Undo/Redo support
- Text block uses TipTap for rich text editing
- ImageUpload component supports Upload, Library, and URL tabs
- 17 block types currently exist in the system

### Existing Codebase Analysis

**Relevant Files:**
- `components/editor/TiptapEditor.tsx` - Current rich text editor (will extend for article)
- `components/editor/ImageUpload.tsx` - Image upload with Library support
- `components/editor/ImageLibrary.tsx` - Browse existing site images
- `lib/section-types.ts` - Block content type definitions
- `lib/section-defaults.ts` - Default content for blocks
- `lib/section-templates.ts` - Block templates
- `lib/drizzle/schema/sections.ts` - BLOCK_TYPES array

---

## 4. Context & Problem Definition

### Problem Statement
The current Text block only supports formatted text. Users cannot create article-style layouts with images floating alongside text. The only workaround is stacking separate Image + Text blocks, which creates rigid layouts without natural text wrapping around images.

### Success Criteria
- [x] New "article" block type appears in block picker
- [x] Article editor has image button in TipTap toolbar
- [x] Clicking image button opens modal with Upload/Library/URL options
- [x] Inserted images can be aligned: Left float, Right float, Center, Full-width
- [x] Text wraps around floated images naturally
- [x] Floated images stack above text on mobile (responsive)
- [x] Existing styling options (border, background, overlay) work with Article block
- [x] At least 2 templates available (4 templates created: Basic Article, Tutorial, Featured Article, Card Style)

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - new block type
- **Priority: Clean implementation** following existing patterns

---

## 6. Technical Requirements

### Functional Requirements
- User can add Article block from block picker
- User can insert images into TipTap content via toolbar button
- User can upload new images, select from Image Library, or enter URL
- User can set image alignment (left float, right float, center, full-width)
- User can resize images by selecting from width presets (25%, 50%, 75%, 100%)
- Images render inline with text wrapping in editor and published view
- Floated images stack above text on mobile devices

### Non-Functional Requirements
- **Performance:** Image insertion should be instant (no page reload)
- **Responsive Design:** Floated images stack on mobile (< 640px)
- **Theme Support:** Article block supports light/dark mode via existing patterns

### Technical Constraints
- Must use existing TipTap architecture (extend, don't replace)
- Must use existing ImageUpload/ImageLibrary components
- Must follow established block type patterns

---

## 7. Data & Database Changes

### Database Schema Changes
Add "article" to BLOCK_TYPES array in `lib/drizzle/schema/sections.ts`:

```typescript
export const BLOCK_TYPES = [
  // ... existing types
  "article", // New
] as const;
```

**Note:** No database migration required - this is just a TypeScript enum change. The block_type column uses `text` type, so any string is valid.

### Data Model Updates

**`lib/section-types.ts`:**
```typescript
// Image alignment options for inline images
export type ArticleImageAlignment = "left" | "right" | "center" | "full";
export type ArticleImageWidth = 25 | 50 | 75 | 100;

// Inline image data stored in TipTap JSON
export interface ArticleInlineImage {
  src: string;
  alt: string;
  alignment: ArticleImageAlignment;
  width: ArticleImageWidth;
}

export interface ArticleContent {
  // HTML content from TipTap (includes image nodes)
  body: string;

  // Same styling options as TextContent
  enableStyling?: boolean;
  textColorMode?: TextColorMode;
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  contentWidth?: TextContentWidth;
  textSize?: TextSize;
}
```

---

## 8. Backend Changes & Background Jobs

### Server Actions
No new server actions required. Article block uses existing:
- `uploadImage` from `app/actions/storage.ts`
- `updateSectionContent` from `app/actions/sections.ts`

---

## 9. Frontend Changes

### New Components

- [ ] **`components/editor/ArticleTiptapEditor.tsx`** - Extended TipTap with image support
  - Extends existing TiptapEditor
  - Adds Image toolbar button
  - Opens ImageInsertModal on click
  - Renders inline images with alignment controls

- [ ] **`components/editor/ImageInsertModal.tsx`** - Modal for inserting images
  - Reuses ImageUpload component internals (tabs)
  - Adds alignment selector (left/right/center/full)
  - Adds width selector (25/50/75/100%)
  - Insert button adds image to TipTap

- [ ] **`components/editor/blocks/ArticleEditor.tsx`** - Block editor wrapper
  - Same structure as TextEditor
  - Uses ArticleTiptapEditor instead of TiptapEditor
  - All styling options from TextEditor

- [ ] **`components/render/blocks/ArticleBlock.tsx`** - Published renderer
  - Renders HTML with inline image styles
  - Handles float clearing
  - Responsive stacking on mobile

### Component Organization
- `components/editor/ArticleTiptapEditor.tsx` - TipTap with image extension
- `components/editor/ImageInsertModal.tsx` - Reusable image insertion dialog
- `components/editor/blocks/ArticleEditor.tsx` - Block editor
- `components/render/blocks/ArticleBlock.tsx` - Block renderer

### Files to Modify

- [ ] **`lib/drizzle/schema/sections.ts`** - Add "article" to BLOCK_TYPES
- [ ] **`lib/section-types.ts`** - Add ArticleContent interface and types
- [ ] **`lib/section-defaults.ts`** - Add article defaults
- [ ] **`lib/section-templates.ts`** - Add article templates
- [ ] **`components/editor/SectionEditor.tsx`** - Route to ArticleEditor
- [ ] **`components/editor/BlockIcon.tsx`** - Add icon for article block
- [ ] **`components/render/BlockRenderer.tsx`** - Route to ArticleBlock

---

## 10. Code Changes Overview

### TipTap Image Extension

We'll use `@tiptap/extension-image` with custom node view for alignment:

```typescript
// ArticleTiptapEditor.tsx - Key changes
import Image from "@tiptap/extension-image";

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: "center",
        parseHTML: element => element.getAttribute("data-alignment"),
        renderHTML: attributes => ({
          "data-alignment": attributes.alignment,
        }),
      },
      width: {
        default: 100,
        parseHTML: element => parseInt(element.getAttribute("data-width") || "100"),
        renderHTML: attributes => ({
          "data-width": attributes.width,
        }),
      },
    };
  },
});
```

### Image Insertion Flow

```
User clicks Image button in toolbar
  → ImageInsertModal opens
    → User selects/uploads image
    → User chooses alignment (left/right/center/full)
    → User chooses width (25/50/75/100%)
    → Click "Insert"
  → TipTap inserts image node at cursor
  → Editor re-renders with floated image
```

### CSS for Float Behavior

```css
/* Editor and Renderer styles */
.article-image[data-alignment="left"] {
  float: left;
  margin: 0 1rem 1rem 0;
}

.article-image[data-alignment="right"] {
  float: right;
  margin: 0 0 1rem 1rem;
}

.article-image[data-alignment="center"] {
  display: block;
  margin: 1rem auto;
  float: none;
}

.article-image[data-alignment="full"] {
  display: block;
  width: 100%;
  margin: 1rem 0;
  float: none;
}

/* Mobile: Stack floated images above text */
@media (max-width: 640px) {
  .article-image[data-alignment="left"],
  .article-image[data-alignment="right"] {
    float: none;
    width: 100%;
    margin: 1rem 0;
  }
}
```

---

## 11. Implementation Plan

### Phase 1: Type System & Schema ✅
**Goal:** Add article block type to the system

- [x] **Task 1.1:** Add "article" to BLOCK_TYPES in `lib/drizzle/schema/sections.ts`
- [x] **Task 1.2:** Add ArticleContent interface to `lib/section-types.ts`
- [x] **Task 1.3:** Add article defaults to `lib/section-defaults.ts`
- [x] **Task 1.4:** Add BLOCK_TYPE_INFO entry for article
- [x] **Task 1.5:** Update ContentTypeMap and SectionContent union

### Phase 2: TipTap Image Extension ✅
**Goal:** Create extended TipTap editor with image support

- [x] **Task 2.1:** Install `@tiptap/extension-image` package
- [x] **Task 2.2:** Create `ArticleTiptapEditor.tsx` with custom Image extension
- [x] **Task 2.3:** Add Image button to toolbar
- [x] **Task 2.4:** Create `ImageInsertModal.tsx` for image selection
- [x] **Task 2.5:** Add alignment/width controls to modal
- [x] **Task 2.6:** Implement image node insertion

### Phase 3: Editor Integration ✅
**Goal:** Create ArticleEditor block component

- [x] **Task 3.1:** Create `ArticleEditor.tsx` following TextEditor pattern
- [x] **Task 3.2:** Add ArticleEditor routing in `SectionEditor.tsx`
- [x] **Task 3.3:** Add article icon in `BlockIcon.tsx`
- [x] **Task 3.4:** Add CSS for editor float behavior

### Phase 4: Renderer ✅
**Goal:** Create ArticleBlock renderer for published sites

- [x] **Task 4.1:** Create `ArticleBlock.tsx` renderer
- [x] **Task 4.2:** Add ArticleBlock routing in `BlockRenderer.tsx`
- [x] **Task 4.3:** Add responsive CSS for mobile stacking
- [x] **Task 4.4:** Test float clearing between images

### Phase 5: Templates ✅
**Goal:** Add article templates to block picker

- [x] **Task 5.1:** Add article templates to `section-templates.ts`
- [x] **Task 5.2:** Test template selection in block picker

### Phase 6: Testing & Polish ✅
**Goal:** Verify all functionality works

- [x] **Task 6.1:** Type check passed
- [x] **Task 6.2:** Lint check passed (no new errors)
- [x] **Task 6.3:** Build completed successfully
- [x] **Task 6.4:** All styling options implemented (border, background, etc.)
- [x] **Task 6.5:** Responsive CSS for mobile stacking included

### Phase 7: Code Review ✅
- [x] **Task 7.1:** Reviewed all new components for correctness
- [x] **Task 7.2:** Verified patterns match existing codebase

---

## 12. Dependencies to Add

```json
{
  "dependencies": {
    "@tiptap/extension-image": "^2.10.4"
  }
}
```

---

## 13. File Structure

```
components/
  editor/
    ArticleTiptapEditor.tsx    # NEW - TipTap with image extension
    ImageInsertModal.tsx       # NEW - Image insertion dialog
    blocks/
      ArticleEditor.tsx        # NEW - Block editor
  render/
    blocks/
      ArticleBlock.tsx         # NEW - Block renderer
```

---

## 14. Templates

### Blank Article
```typescript
{
  id: "article-blank",
  name: "Blank",
  description: "Empty article for custom content",
  content: {
    body: "<p>Start writing your article here. Click the image button to add inline images.</p>",
    enableStyling: false,
    // ... other defaults
  }
}
```

### About Page
```typescript
{
  id: "article-about",
  name: "About Page",
  description: "Classic about page with profile image",
  content: {
    body: '<p><img src="" alt="Your photo" data-alignment="left" data-width="50">Write your bio here. This text will wrap around the image on desktop and stack below it on mobile.</p><p>Add more paragraphs about your experience, values, and what drives you.</p>',
    enableStyling: false,
    // ... other defaults
  }
}
```

### Feature Article
```typescript
{
  id: "article-feature",
  name: "Feature Article",
  description: "Magazine-style article layout",
  content: {
    body: '<h2>Article Title</h2><p>Lead paragraph introducing your topic...</p><p><img src="" alt="Feature image" data-alignment="full" data-width="100"></p><p>Continue with your article content...</p>',
    enableStyling: true,
    showBorder: true,
    borderWidth: "thin",
    borderRadius: "medium",
    // ... other defaults
  }
}
```

---

## 15. Potential Issues & Mitigation

### Float Clearing
**Issue:** Multiple floated images may cause layout issues
**Mitigation:** Add `clear: both` after paragraphs containing floats, use clearfix on container

### Image Loading in Editor
**Issue:** Large images may slow down TipTap
**Mitigation:** Use next/image optimization, lazy loading for images not in viewport

### Responsive Breakpoint
**Issue:** When to switch from float to stack
**Mitigation:** Use 640px breakpoint (Tailwind `sm:`), test on real devices

---

## 16. Notes

### Alternative Names Considered
- "Content" - too generic
- "Rich Text" - confusing with Text block
- "Article" - **selected** - clearly indicates long-form content

### Future Enhancements (Not in Scope)
- Image captions within TipTap
- Pull quote styling
- Video embeds inline
- Image cropping before insert

---

*Template Version: 1.0*
*Created: 2026-01-03*
