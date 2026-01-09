# AI Task Template

> **Instructions:** Add a rich text "Body Text" field to the hero section with text alignment options.

---

## 1. Task Overview

### Task Title
**Title:** Add Body Text Field with Alignment Options to Hero Section

### Goal Statement
**Goal:** Enhance the hero section by adding a rich text body field (using TiptapEditor with HTML mode) that appears after the subheading/image area, with alignment options (left, center, right). This allows users to add formatted descriptive text to their hero sections beyond just the heading and subheading.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - this is a straightforward enhancement with a clear implementation path following existing patterns (TiptapEditor is already used in TextEditor, alignment patterns exist in HeadingContent).

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Key Patterns:** TiptapEditor for rich text, dynamic imports for SSR safety

### Current State
The hero section currently supports:
- Static or rotating heading
- Plain text subheading (textarea, no formatting)
- Hero image with extensive styling options
- Multiple buttons (up to 4)
- Background image

**Missing:** There's no way to add formatted body text/description below the subheading. Users who want more detailed hero content are limited to the plain-text subheading.

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- [x] **`lib/section-types.ts`** - HeroContent interface at lines 129-152
- [x] **`lib/section-defaults.ts`** - Hero defaults at lines 49-74
- [x] **`components/editor/blocks/HeroEditor.tsx`** - Current editor implementation
- [x] **`components/render/blocks/HeroBlock.tsx`** - Current renderer
- [x] **`components/editor/TiptapEditor.tsx`** - Rich text editor with HTML mode
- [x] **`components/editor/blocks/TextEditor.tsx`** - Example of TiptapEditor integration

**Key Patterns to Reuse:**
- `HeadingAlignment` type already exists: `"left" | "center" | "right"`
- TiptapEditor dynamic import pattern from TextEditor
- Alignment styling from HeadingBlock/HeroBlock

---

## 4. Context & Problem Definition

### Problem Statement
Users need to add more detailed, formatted content to their hero sections beyond the simple heading and subheading. Currently, the subheading is a plain textarea with no formatting options, limiting creative expression and content richness in hero sections.

### Success Criteria
- [x] Body text field added to HeroContent type with alignment option ✓ 2026-01-09
- [x] TiptapEditor integrated in HeroEditor with HTML mode toggle ✓ 2026-01-09
- [x] Body text renders correctly in HeroBlock with formatting preserved ✓ 2026-01-09
- [x] Alignment option (left/center/right) works, defaulting to center ✓ 2026-01-09
- [x] Field appears in editor after the image section, before buttons ✓ 2026-01-09
- [x] Existing hero sections continue to work (backward compatible) ✓ 2026-01-09

---

## 5. Development Mode Context

- **No backwards compatibility concerns** - new optional field
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can enter rich text in a TiptapEditor field labeled "Body Text"
- User can toggle to HTML view to edit raw HTML
- User can select text alignment: Left, Center (default), or Right
- Body text renders on published page with formatting and alignment
- Field is optional - empty by default

### Non-Functional Requirements
- **Performance:** TiptapEditor loaded via dynamic import (no SSR)
- **Responsive Design:** Body text alignment works on all screen sizes
- **Theme Support:** Text color adapts based on background (like subheading)

---

## 7. Data & Database Changes

### Database Schema Changes
No database schema changes required - content is stored in JSONB `content` column.

### Data Model Updates

```typescript
// lib/section-types.ts - Add to HeroContent interface

// New type for body text alignment (can reuse HeadingAlignment or define separately)
export type HeroBodyTextAlignment = "left" | "center" | "right";

export interface HeroContent {
  heading: string;
  subheading: string;
  // NEW: Body text with rich formatting
  bodyText?: string;  // HTML content from TiptapEditor
  bodyTextAlignment?: HeroBodyTextAlignment;  // Default: "center"
  // ... existing fields unchanged
}
```

```typescript
// lib/section-defaults.ts - Add to hero defaults

hero: {
  heading: "Welcome to Your Site",
  subheading: "Create something amazing with Headstring Web",
  // NEW: Body text defaults
  bodyText: "",
  bodyTextAlignment: "center",
  // ... existing fields unchanged
}
```

---

## 8. Backend Changes & Background Jobs

No backend changes required - this is a frontend-only enhancement.

---

## 9. Frontend Changes

### Component Updates

#### HeroEditor.tsx Changes
- Add dynamic import for TiptapEditor (following TextEditor pattern)
- Add "Body Text" section after the image section
- Include TiptapEditor with label "Body Text"
- Add alignment Select (Left, Center, Right) below the editor
- Add descriptive helper text

#### HeroBlock.tsx Changes
- Add BodyTextElement that renders bodyText HTML
- Apply alignment styles via `textAlign` CSS property
- Position after SubheadingElement, before ButtonsElement
- Apply same color logic as subheading (muted on light, white-ish on background image)

### State Management
No new state management needed - uses existing `content` prop pattern.

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**lib/section-types.ts (lines 129-152):**
```typescript
export interface HeroContent {
  heading: string;
  subheading: string;
  buttons?: HeroButton[];
  // ... image and other fields
  imageSize?: number;
}
```

**components/editor/blocks/HeroEditor.tsx (structure):**
```typescript
// Current order:
// 1. Title Mode Toggle
// 2. Heading (static) or Rotating Title Config
// 3. Subheading (Textarea)
// 4. Hero Image section
// 5. Buttons section
// 6. Background Image
```

**components/render/blocks/HeroBlock.tsx (TextContent):**
```typescript
const TextContent = (
  <div>
    {HeadingElement}
    {imagePosition === "after-title" && HeroImage && (...)}
    {SubheadingElement}
    {ButtonsElement}
  </div>
);
```

### 📂 **After Changes**

**lib/section-types.ts:**
```typescript
export type HeroBodyTextAlignment = "left" | "center" | "right";

export interface HeroContent {
  heading: string;
  subheading: string;
  // NEW
  bodyText?: string;
  bodyTextAlignment?: HeroBodyTextAlignment;
  buttons?: HeroButton[];
  // ... rest unchanged
}
```

**components/editor/blocks/HeroEditor.tsx (new section after image):**
```typescript
{/* Body Text - NEW SECTION */}
<div className="space-y-4">
  <div className="space-y-2">
    <Label>Body Text</Label>
    <TiptapEditor
      value={content.bodyText ?? ""}
      onChange={(html) => handleChange("bodyText", html)}
      placeholder="Add detailed content to your hero section..."
      disabled={disabled}
    />
  </div>

  <div className="space-y-2">
    <Label>Text Alignment</Label>
    <Select
      value={content.bodyTextAlignment ?? "center"}
      onValueChange={(value) =>
        onChange({ ...content, bodyTextAlignment: value })
      }
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="left">Left</SelectItem>
        <SelectItem value="center">Center</SelectItem>
        <SelectItem value="right">Right</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>
```

**components/render/blocks/HeroBlock.tsx:**
```typescript
// New BodyTextElement
const BodyTextElement = content.bodyText ? (
  <div
    className="mt-6 prose prose-sm max-w-none"
    style={{
      textAlign: content.bodyTextAlignment ?? "center",
      color: hasBackgroundImage
        ? "rgba(255,255,255,0.9)"
        : "var(--color-muted-foreground)",
    }}
    dangerouslySetInnerHTML={{ __html: content.bodyText }}
  />
) : null;

// Updated TextContent
const TextContent = (
  <div>
    {HeadingElement}
    {imagePosition === "after-title" && HeroImage && (...)}
    {SubheadingElement}
    {BodyTextElement}  {/* NEW */}
    {ButtonsElement}
  </div>
);
```

### 🎯 **Key Changes Summary**
- [ ] **Change 1:** Add `bodyText` and `bodyTextAlignment` to HeroContent type
- [ ] **Change 2:** Add defaults in section-defaults.ts
- [ ] **Change 3:** Add TiptapEditor section to HeroEditor after image section
- [ ] **Change 4:** Add BodyTextElement rendering in HeroBlock
- [ ] **Files Modified:** 4 files (section-types.ts, section-defaults.ts, HeroEditor.tsx, HeroBlock.tsx)
- [ ] **Impact:** Adds optional rich text body to hero sections with alignment control

---

## 11. Implementation Plan

### Phase 1: Type Definitions & Defaults
**Goal:** Update TypeScript types and default values

- [x] **Task 1.1:** Add HeroBodyTextAlignment type to section-types.ts ✓ 2026-01-09
  - Files: `lib/section-types.ts` (line 128)
  - Details: Added `export type HeroBodyTextAlignment = "left" | "center" | "right";`
- [x] **Task 1.2:** Add bodyText and bodyTextAlignment to HeroContent interface ✓ 2026-01-09
  - Files: `lib/section-types.ts` (lines 153-155)
  - Details: Added optional fields after imageSize
- [x] **Task 1.3:** Add defaults to section-defaults.ts ✓ 2026-01-09
  - Files: `lib/section-defaults.ts` (lines 74-76)
  - Details: Added `bodyText: ""` and `bodyTextAlignment: "center"`

### Phase 2: Editor Implementation
**Goal:** Add TiptapEditor and alignment controls to HeroEditor

- [x] **Task 2.1:** Add dynamic TiptapEditor import ✓ 2026-01-09
  - Files: `components/editor/blocks/HeroEditor.tsx` (lines 3, 35-50)
  - Details: Added `dynamic` import and TiptapEditor component
- [x] **Task 2.2:** Add Body Text section after image section ✓ 2026-01-09
  - Files: `components/editor/blocks/HeroEditor.tsx` (lines 598-632)
  - Details: TiptapEditor + alignment Select, positioned before Buttons section
- [x] **Task 2.3:** Import HeroBodyTextAlignment type ✓ 2026-01-09
  - Files: `components/editor/blocks/HeroEditor.tsx` (line 30)
  - Details: Added to type imports

### Phase 3: Renderer Implementation
**Goal:** Display body text in HeroBlock with formatting and alignment

- [x] **Task 3.1:** Create BodyTextElement in HeroBlock ✓ 2026-01-09
  - Files: `components/render/blocks/HeroBlock.tsx` (lines 216-228)
  - Details: Renders HTML with alignment, prose styling, and color adaptation
- [x] **Task 3.2:** Add BodyTextElement to TextContent ✓ 2026-01-09
  - Files: `components/render/blocks/HeroBlock.tsx` (line 254)
  - Details: Positioned after SubheadingElement, before ButtonsElement

### Phase 4: Testing & Validation
**Goal:** Verify implementation works correctly

- [x] **Task 4.1:** Type check passes ✓ 2026-01-09
  - Command: `npm run type-check` - No errors
- [x] **Task 4.2:** Lint passes ✓ 2026-01-09
  - Command: `npm run lint` - 0 errors (3 pre-existing warnings in unrelated files)

### Phase 5: Comprehensive Code Review (Mandatory)
**Goal:** Present implementation completion and request thorough code review

- [ ] **Task 5.1:** Present "Implementation Complete!" Message (MANDATORY)
- [ ] **Task 5.2:** Execute Comprehensive Code Review (If Approved)

### Phase 6: User Browser Testing (Only After Code Review)
**Goal:** Request human testing for UI/UX functionality

- [ ] **Task 6.1:** User tests adding body text to a hero section
- [ ] **Task 6.2:** User tests HTML mode toggle
- [ ] **Task 6.3:** User tests alignment options (left, center, right)
- [ ] **Task 6.4:** User previews/publishes to verify rendering

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

🚨 **CRITICAL: Real-time task completion tracking is mandatory**

- [ ] Update task document immediately after each completed subtask
- [ ] Mark checkboxes as [x] with completion timestamp
- [ ] Add brief completion notes (file paths, key changes, etc.)

---

## 13. File Structure & Organization

### Files to Modify
- [ ] **`lib/section-types.ts`** - Add type and interface fields
- [ ] **`lib/section-defaults.ts`** - Add default values
- [ ] **`components/editor/blocks/HeroEditor.tsx`** - Add TiptapEditor section
- [ ] **`components/render/blocks/HeroBlock.tsx`** - Add BodyTextElement

### No New Files Required
All changes are modifications to existing files.

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty body text:** Should render nothing (handled by conditional)
- [ ] **Very long content:** Prose styling handles overflow appropriately
- [ ] **HTML sanitization:** TiptapEditor already produces safe HTML

### Security Considerations
- [ ] **XSS Prevention:** TiptapEditor generates sanitized HTML; dangerouslySetInnerHTML is safe with editor output
- [ ] **No user-submitted raw HTML:** Content goes through TiptapEditor validation

---

## 15. Deployment & Configuration

No environment variables or deployment changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow phases in order
2. Update task document after each task
3. Run type-check and lint after code changes
4. Present completion message before user testing

### Code Quality Standards
- [ ] Follow existing patterns (TiptapEditor dynamic import from TextEditor)
- [ ] Use early returns where appropriate
- [ ] Match existing code style in each file

---

## 17. Notes & Additional Context

### Reference Implementations
- **TiptapEditor integration:** See `components/editor/blocks/TextEditor.tsx` lines 32-46 for dynamic import pattern
- **Alignment styling:** See `components/render/blocks/HeadingBlock.tsx` for alignment CSS

### Key Design Decisions
- Body text positioned after image section to maintain visual hierarchy (Heading → Subheading → Image → Body Text → Buttons)
- Default alignment is center to match typical hero section design
- Uses same color logic as subheading for consistency

---

*Task Created: 2025-01-09*
