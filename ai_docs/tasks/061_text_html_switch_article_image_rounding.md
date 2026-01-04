# AI Task Template

---

## 1. Task Overview

### Task Title
**Title:** Add HTML Switch to Text Block & Image Rounding to Article Block

### Goal Statement
**Goal:** Enhance the Text block editor with an HTML source editing toggle (matching the Article block's functionality) and add configurable image rounding options to the Article block for inline images.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
This task involves two related but independent enhancements to text/content blocks. Both are straightforward additions that follow existing patterns in the codebase.

**Analysis Determination:** Since these are feature additions following established patterns (HTML switch already exists in ArticleTiptapEditor, rounding options exist in other blocks like Gallery), strategic analysis is NOT needed. The implementation path is clear.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State

**Text Block (TiptapEditor):**
- Uses `TiptapEditor` component (`components/editor/TiptapEditor.tsx`)
- Has WYSIWYG toolbar with formatting options (bold, italic, headings, lists, links, etc.)
- Does NOT have HTML mode toggle - only visual editing
- The ArticleTiptapEditor already has this feature (lines 131-133, 253-273, 444-452)

**Article Block (ArticleTiptapEditor):**
- Uses `ArticleTiptapEditor` component with inline image support
- Images are rendered with hardcoded `border-radius: 0.375rem` (6px)
- Image CSS is defined in `ArticleBlock.tsx` (lines 69, 76, 83, 90) and `ArticleTiptapEditor.tsx` (line 89)
- No user-configurable rounding option exists

### Existing Patterns for Reuse
- **HTML Mode Toggle:** Already implemented in `ArticleTiptapEditor.tsx`:
  - State: `const [htmlMode, setHtmlMode] = useState(false);`
  - State: `const [htmlSource, setHtmlSource] = useState("");`
  - Toggle function, apply function, toolbar button with Code/Eye icons

- **Border Radius Options:** Already defined in `section-types.ts`:
  - Type: `TextBorderRadius = "none" | "small" | "medium" | "large" | "full"`
  - Mapping in render blocks: `{ none: "0", small: "4px", medium: "8px", large: "16px", full: "9999px" }`

---

## 4. Context & Problem Definition

### Problem Statement

1. **Text Block lacks HTML editing:** Power users who want to paste or edit raw HTML cannot do so in the Text block, even though this feature exists in the Article block. This creates an inconsistent user experience.

2. **Article images have no rounding control:** Inline images in articles always have a fixed small border radius. Users may want square images, more rounded images, or pill-shaped images to match their design aesthetic.

### Success Criteria
- [ ] Text block TiptapEditor has HTML mode toggle button in toolbar
- [ ] Users can switch between visual editor and HTML source view in Text block
- [ ] HTML changes are applied when switching back to visual mode
- [ ] Article block has image rounding control option
- [ ] All inline images in an article respect the rounding setting
- [ ] Editor preview reflects the rounding setting
- [ ] Published articles render images with the selected rounding

---

## 5. Development Mode Context

- **IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** - existing content will use default values
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements

**Text Block HTML Switch:**
- User can click a Code icon in the toolbar to enter HTML mode
- HTML mode shows a textarea with the raw HTML content
- User can edit the HTML directly
- Clicking Apply or switching back applies changes to the visual editor
- Eye icon switches back to visual mode

**Article Block Image Rounding:**
- User can select image rounding level in the Article block editor
- Options: None (square), Small, Medium (default), Large, Full (pill)
- Rounding applies to ALL inline images in the article
- Preview and published view both respect the setting

### Non-Functional Requirements
- **Responsive Design:** Rounding should look good on mobile and desktop
- **Theme Support:** No color dependencies (rounding is geometry-only)

---

## 7. Data & Database Changes

### Database Schema Changes
**No database migrations required** - changes use existing JSONB content structure.

### Data Model Updates

```typescript
// lib/section-types.ts - Add to ArticleContent interface
export interface ArticleContent {
  body: string;
  // ... existing fields ...

  // NEW: Image rounding for inline images
  imageRounding?: TextBorderRadius; // Reuse existing type
}
```

---

## 8. Backend Changes & Background Jobs

**No backend changes required.** All changes are frontend-only.

---

## 9. Frontend Changes

### Component Updates

**TiptapEditor.tsx** - Add HTML mode toggle:
- Add `htmlMode` and `htmlSource` state
- Add `toggleHtmlMode`, `handleHtmlSourceChange`, `applyHtmlChanges` functions
- Add `useEffect` to sync HTML source when entering HTML mode
- Add Code/Eye toolbar button
- Conditionally render textarea or EditorContent based on htmlMode
- Disable formatting buttons when in HTML mode

**ArticleEditor.tsx** - Add image rounding control:
- Add Select dropdown for imageRounding in the styling section
- Options: None, Small, Medium (default), Large, Full

**ArticleBlock.tsx** - Apply image rounding:
- Read `imageRounding` from content with default "medium"
- Apply to the CSS for `.article-block img` selectors

**ArticleTiptapEditor.tsx** - Apply rounding in editor preview:
- Read `imageRounding` prop
- Apply to editor image styles

**ArticleImageNodeView.tsx** - Apply rounding in node view:
- Read rounding from block context or prop
- Apply to the rendered image

---

## 10. Code Changes Overview

### 📂 **TiptapEditor.tsx - Current (Before)**
```typescript
// No HTML mode state or toggle
export function TiptapEditor({...}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  // ... no htmlMode, no htmlSource ...

  // Toolbar has no Code button
  {/* Undo/Redo */}
  <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
    <Undo className="h-4 w-4" />
  </ToolbarButton>
  {/* End of toolbar - no HTML toggle */}
```

### 📂 **TiptapEditor.tsx - After Refactor**
```typescript
export function TiptapEditor({...}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [htmlMode, setHtmlMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState("");

  // Sync HTML source when switching to HTML mode
  useEffect(() => {
    if (htmlMode && editor) {
      setHtmlSource(editor.getHTML());
    }
  }, [htmlMode, editor]);

  // Toggle HTML mode
  const toggleHtmlMode = useCallback(() => {
    if (htmlMode && editor) {
      editor.commands.setContent(htmlSource);
      onChange(htmlSource);
    }
    setHtmlMode(!htmlMode);
  }, [htmlMode, htmlSource, editor, onChange]);

  // Toolbar with HTML toggle
  {/* Undo/Redo */}
  <ToolbarButton ...>
    <Undo className="h-4 w-4" />
  </ToolbarButton>

  <div className="flex-1" />

  {/* HTML Mode Toggle */}
  <ToolbarButton
    onClick={toggleHtmlMode}
    active={htmlMode}
    title={htmlMode ? "Switch to Visual Editor" : "Edit HTML Source"}
  >
    {htmlMode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
  </ToolbarButton>
```

### 📂 **ArticleContent type - Add field**
```typescript
// Before: No imageRounding field
export interface ArticleContent {
  body: string;
  enableStyling?: boolean;
  // ...
}

// After: Add imageRounding
export interface ArticleContent {
  body: string;
  enableStyling?: boolean;
  imageRounding?: TextBorderRadius; // NEW
  // ...
}
```

### 🎯 **Key Changes Summary**
- [ ] **TiptapEditor.tsx:** Add ~60 lines for HTML mode (state, effects, handlers, UI)
- [ ] **section-types.ts:** Add 1 field to ArticleContent
- [ ] **section-defaults.ts:** Add default value for imageRounding
- [ ] **ArticleEditor.tsx:** Add ~20 lines for rounding selector UI
- [ ] **ArticleBlock.tsx:** Update CSS to use dynamic rounding values
- [ ] **ArticleTiptapEditor.tsx:** Pass rounding prop, update editor styles
- [ ] **ArticleImageNodeView.tsx:** Apply rounding to preview image
- **Files Modified:** 7 files total
- **Impact:** Non-breaking enhancement, existing content uses defaults

---

## 11. Implementation Plan

### Phase 1: Text Block HTML Switch ✅ Completed 2026-01-03
**Goal:** Add HTML source editing mode to TiptapEditor

- [x] **Task 1.1:** Add HTML mode state and handlers to TiptapEditor.tsx ✓
  - Files: `components/editor/TiptapEditor.tsx`
  - Details: Added htmlMode, htmlSource state; toggleHtmlMode, handleHtmlSourceChange, applyHtmlChanges functions; useEffect for sync
- [x] **Task 1.2:** Add HTML toggle button to toolbar ✓
  - Files: `components/editor/TiptapEditor.tsx`
  - Details: Added Code/Eye icon button, imported icons, added spacer
- [x] **Task 1.3:** Add HTML textarea view ✓
  - Files: `components/editor/TiptapEditor.tsx`
  - Details: Conditional rendering of Textarea vs EditorContent, Apply/Reset buttons
- [x] **Task 1.4:** Disable formatting buttons in HTML mode ✓
  - Files: `components/editor/TiptapEditor.tsx`
  - Details: Added `disabled={disabled || htmlMode}` to all toolbar buttons

### Phase 2: Article Block Image Rounding ✅ Completed 2026-01-03
**Goal:** Add configurable image rounding to Article block

- [x] **Task 2.1:** Add imageRounding to ArticleContent type ✓
  - Files: `lib/section-types.ts`
  - Details: Added `imageRounding?: TextBorderRadius;` to ArticleContent interface
- [x] **Task 2.2:** Add default value for imageRounding ✓
  - Files: `lib/section-defaults.ts`
  - Details: Added `imageRounding: "medium"` to article defaults
- [x] **Task 2.3:** Add rounding selector to ArticleEditor ✓
  - Files: `components/editor/blocks/ArticleEditor.tsx`
  - Details: Added Select dropdown in Images section within styling collapsible
- [x] **Task 2.4:** Update ArticleBlock CSS for dynamic rounding ✓
  - Files: `components/render/blocks/ArticleBlock.tsx`
  - Details: Replaced hardcoded `0.375rem` with dynamic value using BORDER_RADII mapping
  - **Bug Fix:** Added base `.article-block img` CSS rule to apply rounding to ALL images, not just those with `data-alignment` attribute
- [x] **Task 2.5:** Pass rounding to ArticleTiptapEditor ✓
  - Files: `components/editor/blocks/ArticleEditor.tsx`, `components/editor/ArticleTiptapEditor.tsx`
  - Details: Added imageRounding prop, set CSS variable on container, updated image styles
- [x] **Task 2.6:** Apply rounding in ArticleImageNodeView ✓
  - Files: `components/editor/ArticleImageNodeView.tsx`
  - Details: Applied CSS variable for rounding to image and overlay elements

### Phase 3: Testing & Validation
**Goal:** Verify both features work correctly

- [ ] **Task 3.1:** Test HTML switch in Text block
  - Verify toggle between modes works
  - Verify HTML changes are applied
  - Verify formatting buttons disabled in HTML mode
- [ ] **Task 3.2:** Test image rounding in Article block
  - Verify all rounding options render correctly
  - Verify editor preview shows correct rounding
  - Verify published article shows correct rounding

---

## 12. Design Decisions (Confirmed)

### Decision 1: Image Rounding Scope
**✅ Block-level** - One setting that applies to ALL images in the article
- Simpler implementation
- Consistent look across all images
- Setting stored in ArticleContent

### Decision 2: Rounding Options
**✅ Use existing TextBorderRadius options:**
- None (0px) - Square
- Small (4px)
- Medium (8px)
- Large (16px)
- Full (9999px) - Pill

### Decision 3: Default Rounding
**✅ Medium (8px)** - Matches current hardcoded value approximately (was 6px)

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `components/editor/TiptapEditor.tsx` - Add HTML mode
- [ ] `lib/section-types.ts` - Add imageRounding to ArticleContent
- [ ] `lib/section-defaults.ts` - Add default imageRounding value
- [ ] `components/editor/blocks/ArticleEditor.tsx` - Add rounding UI
- [ ] `components/render/blocks/ArticleBlock.tsx` - Apply dynamic rounding
- [ ] `components/editor/ArticleTiptapEditor.tsx` - Pass rounding prop, update styles
- [ ] `components/editor/ArticleImageNodeView.tsx` - Apply rounding to preview

### No New Files Required
All changes fit within existing file structure.

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty HTML in source mode:** Handled by existing content normalization
- [ ] **Invalid HTML:** TipTap will sanitize and normalize
- [ ] **Rounding with full-width images:** Should still look good

### Security Considerations
- [ ] **HTML injection:** TipTap already sanitizes HTML, no new risk

---

## 15. AI Agent Instructions

### Implementation Approach
This is a straightforward feature addition following established patterns. Both features:
1. Have working reference implementations in the codebase
2. Use existing types and components
3. Require no database changes

Once the clarifying questions are answered, proceed with implementation phase by phase.

---

*Template Version: 1.0*
*Created: 2026-01-03*
