# Task 049: Markdown Block Type

## 1. Task Overview

### Task Title
**Title:** Add Markdown Block Type with Split-View Editor and Syntax Highlighting

### Goal Statement
**Goal:** Create a new "markdown" block type that allows users to write content in Markdown format (ideal for AI-generated content) and have it render as styled HTML on published pages. The editor provides a split-view experience (edit left, preview right) with full GitHub Flavored Markdown support including tables, code blocks with syntax highlighting, and task lists.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
This is a straightforward implementation following established patterns in the codebase. The approach is clear:
- Use `react-markdown` for rendering (de facto standard)
- Use `remark-gfm` for GitHub Flavored Markdown
- Use a syntax highlighting library for code blocks
- Follow the TextBlock styling pattern already in use

**Strategic analysis skipped** - only one obvious technical approach exists.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Block System:** 13 existing block types with unified editor/renderer pattern

### Current State
- 13 block types exist: header, hero, text, image, gallery, features, cta, testimonials, contact, footer, blog_featured, blog_grid, embed
- TextBlock has full styling options that can be reused
- TiptapEditor exists for rich text but outputs HTML, not suitable for markdown
- No markdown rendering capability currently exists

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- [x] `lib/drizzle/schema/sections.ts` - BLOCK_TYPES array needs "markdown" added
- [x] `lib/section-types.ts` - Content interfaces, BLOCK_TYPE_INFO array
- [x] `lib/section-defaults.ts` - Default content for each block type
- [x] `lib/section-templates.ts` - Template definitions
- [x] `components/render/BlockRenderer.tsx` - Routes sections to renderers
- [x] `components/editor/SectionEditor.tsx` - Routes sections to editors
- [x] `components/render/blocks/TextBlock.tsx` - Styling pattern to follow
- [x] `components/editor/blocks/TextEditor.tsx` - Editor pattern to follow

---

## 4. Context & Problem Definition

### Problem Statement
Users want to add AI-generated content or write in Markdown format. LLMs naturally output Markdown, making a dedicated markdown block ideal for AI-generated content workflows. The existing Text block uses Tiptap (rich text editor outputting HTML), which doesn't preserve the markdown source.

### Success Criteria
- [ ] New "markdown" block type appears in section builder
- [ ] Split-view editor shows raw markdown on left, live preview on right
- [ ] Full GFM support: tables, code blocks, task lists, strikethrough
- [ ] Code blocks have syntax highlighting (common languages)
- [ ] Styling options match TextBlock pattern (border, background, typography)
- [ ] Rendered output respects theme colors and typography
- [ ] Works in both light and dark mode

---

## 5. Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns** - new block type, no migration needed
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can add a "Markdown" block from the section builder
- User can write/paste markdown in the left pane of the editor
- User sees live preview in the right pane as they type
- Tables render properly with theme-appropriate borders
- Code blocks have syntax highlighting for common languages (JS, TS, Python, CSS, HTML, JSON, Bash)
- Task lists (checkboxes) render but are display-only
- Styling options available: border, background image/overlay, content width, text size, text color mode

### Non-Functional Requirements
- **Performance:** Preview updates in real-time without lag
- **Responsive Design:** Split view collapses to tabs on mobile
- **Theme Support:** Rendered markdown respects theme colors and dark mode
- **Bundle Size:** Keep syntax highlighting library minimal (~50KB acceptable)

### Technical Constraints
- Must follow existing block type patterns exactly
- Must use CSS variables for theme colors (existing pattern)
- Editor must be client component (uses state)
- Renderer can be server component

---

## 7. Data & Database Changes

### Database Schema Changes
No database migration required. The "markdown" string will be added to the BLOCK_TYPES constant, and content is stored as JSONB (already supported).

### Data Model Updates

```typescript
// lib/section-types.ts - New interface
export interface MarkdownContent {
  markdown: string;  // Raw markdown source

  // Master styling toggle
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background (when border is shown)
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Background & overlay options
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Layout options
  contentWidth?: TextContentWidth;

  // Typography options
  textSize?: TextSize;
}
```

---

## 8. Backend Changes & Background Jobs

No backend changes required. This is a frontend-only feature using existing JSONB storage.

---

## 9. Frontend Changes

### New Components
- [ ] `components/editor/blocks/MarkdownEditor.tsx` - Split-view markdown editor
- [ ] `components/render/blocks/MarkdownBlock.tsx` - Markdown renderer with styling

### Files to Modify
- [ ] `lib/drizzle/schema/sections.ts` - Add "markdown" to BLOCK_TYPES
- [ ] `lib/section-types.ts` - Add MarkdownContent interface, update ContentTypeMap, add BLOCK_TYPE_INFO
- [ ] `lib/section-defaults.ts` - Add markdown defaults
- [ ] `lib/section-templates.ts` - Add markdown templates
- [ ] `components/render/BlockRenderer.tsx` - Add markdown case
- [ ] `components/editor/SectionEditor.tsx` - Add markdown case

### Dependencies to Add
```json
{
  "dependencies": {
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0"
  }
}
```

Note: `highlight.js` comes as a peer dependency of `rehype-highlight` and includes language definitions.

---

## 10. Code Changes Overview

### Current Implementation (Before)

**lib/drizzle/schema/sections.ts:**
```typescript
export const BLOCK_TYPES = [
  "header",
  "hero",
  "text",
  // ... 10 more types
  "embed",
] as const;
```

**lib/section-types.ts:**
```typescript
export type SectionContent =
  | HeaderContent
  | HeroContent
  // ... other content types
  | EmbedContent;

export interface ContentTypeMap {
  header: HeaderContent;
  // ... other mappings
  embed: EmbedContent;
}

export const BLOCK_TYPE_INFO: BlockTypeInfo[] = [
  // ... existing block types
];
```

### After Implementation

**lib/drizzle/schema/sections.ts:**
```typescript
export const BLOCK_TYPES = [
  "header",
  "hero",
  "text",
  "markdown",  // NEW
  // ... rest
] as const;
```

**lib/section-types.ts:**
```typescript
// NEW INTERFACE
export interface MarkdownContent {
  markdown: string;
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

export type SectionContent =
  | HeaderContent
  // ...
  | MarkdownContent  // NEW
  | EmbedContent;

export interface ContentTypeMap {
  // ...
  markdown: MarkdownContent;  // NEW
}

export const BLOCK_TYPE_INFO: BlockTypeInfo[] = [
  // ... after "text" entry
  {
    type: "markdown",
    label: "Markdown",
    description: "Write content in Markdown with live preview",
    icon: "file-text",
  },
  // ...
];
```

**New: components/editor/blocks/MarkdownEditor.tsx:**
```typescript
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Textarea } from "@/components/ui/textarea";
// ... styling controls similar to TextEditor

export function MarkdownEditor({ content, onChange, disabled, siteId }: Props) {
  return (
    <div className="space-y-6">
      {/* Split view: Editor | Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Markdown</Label>
          <Textarea
            value={content.markdown}
            onChange={(e) => onChange({ ...content, markdown: e.target.value })}
            rows={20}
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="border rounded-md p-4 min-h-[200px] prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {content.markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Styling section (collapsible) - same pattern as TextEditor */}
    </div>
  );
}
```

**New: components/render/blocks/MarkdownBlock.tsx:**
```typescript
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { MarkdownContent } from "@/lib/section-types";

// Styling logic same as TextBlock (plain vs styled modes)

export function MarkdownBlock({ content, theme }: Props) {
  // Empty check
  if (!content.markdown?.trim()) return null;

  // Render with styling based on enableStyling flag
  // Use CSS variables for theme colors
  // Apply prose styles for typography
}
```

### Key Changes Summary
- [ ] **Add block type:** "markdown" to BLOCK_TYPES array
- [ ] **Add content interface:** MarkdownContent with markdown field + styling options
- [ ] **Create editor:** Split-view with textarea left, ReactMarkdown preview right
- [ ] **Create renderer:** MarkdownBlock with plain/styled modes like TextBlock
- [ ] **Add routing:** Cases in BlockRenderer and SectionEditor
- [ ] **Add templates:** 3-4 markdown templates (Blank, Article, Documentation, Code Snippet)

---

## 11. Implementation Plan

### Phase 1: Dependencies & Types
**Goal:** Install packages and add type definitions

- [ ] **Task 1.1:** Install npm packages
  - Command: `npm install react-markdown remark-gfm rehype-highlight`
- [ ] **Task 1.2:** Add "markdown" to BLOCK_TYPES
  - File: `lib/drizzle/schema/sections.ts`
- [ ] **Task 1.3:** Add MarkdownContent interface and update ContentTypeMap
  - File: `lib/section-types.ts`
- [ ] **Task 1.4:** Add BLOCK_TYPE_INFO entry for markdown
  - File: `lib/section-types.ts`

### Phase 2: Defaults & Templates
**Goal:** Create default content and template variations

- [ ] **Task 2.1:** Add markdown defaults
  - File: `lib/section-defaults.ts`
- [ ] **Task 2.2:** Add markdown templates
  - File: `lib/section-templates.ts`
  - Templates: Blank, Article, Documentation, Code Snippet

### Phase 3: Editor Component
**Goal:** Create the split-view markdown editor

- [ ] **Task 3.1:** Create MarkdownEditor component
  - File: `components/editor/blocks/MarkdownEditor.tsx`
  - Features: Split view, styling controls (following TextEditor pattern)
- [ ] **Task 3.2:** Add MarkdownEditor to SectionEditor routing
  - File: `components/editor/SectionEditor.tsx`

### Phase 4: Renderer Component
**Goal:** Create the markdown renderer with styling support

- [ ] **Task 4.1:** Create MarkdownBlock component
  - File: `components/render/blocks/MarkdownBlock.tsx`
  - Features: Plain/styled modes, theme-aware prose styles, syntax highlighting CSS
- [ ] **Task 4.2:** Add MarkdownBlock to BlockRenderer routing
  - File: `components/render/BlockRenderer.tsx`

### Phase 5: Testing & Validation
**Goal:** Verify implementation works correctly

- [ ] **Task 5.1:** Run type-check
  - Command: `npm run type-check`
- [ ] **Task 5.2:** Run linting
  - Command: `npm run lint`

### Phase 6: Comprehensive Code Review
**Goal:** Review all changes for quality and correctness

- [ ] **Task 6.1:** Present "Implementation Complete!" message
- [ ] **Task 6.2:** Execute comprehensive code review if approved

### Phase 7: User Browser Testing
**Goal:** User validates in browser

- [ ] **Task 7.1:** User creates a new page and adds Markdown block
- [ ] **Task 7.2:** User tests split-view editing experience
- [ ] **Task 7.3:** User tests GFM features (tables, code blocks, task lists)
- [ ] **Task 7.4:** User tests styling options
- [ ] **Task 7.5:** User previews published output in light/dark mode

---

## 12. Task Completion Tracking

*(Will be updated during implementation)*

---

## 13. File Structure & Organization

### New Files to Create
```
components/
  editor/
    blocks/
      MarkdownEditor.tsx     # Split-view markdown editor
  render/
    blocks/
      MarkdownBlock.tsx      # Markdown renderer with styling
```

### Files to Modify
```
lib/
  drizzle/schema/
    sections.ts              # Add "markdown" to BLOCK_TYPES
  section-types.ts           # Add MarkdownContent interface
  section-defaults.ts        # Add markdown defaults
  section-templates.ts       # Add markdown templates
components/
  editor/
    SectionEditor.tsx        # Add MarkdownEditor routing
  render/
    BlockRenderer.tsx        # Add MarkdownBlock routing
```

### Dependencies to Add
```json
{
  "react-markdown": "^9.0.1",
  "remark-gfm": "^4.0.0",
  "rehype-highlight": "^7.0.0"
}
```

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Empty markdown:** Handle gracefully (return null like TextBlock)
- [ ] **Invalid markdown:** react-markdown handles gracefully by design
- [ ] **Large content:** Consider virtual scrolling for very large documents (future enhancement)

### Edge Cases
- [ ] **Code blocks without language:** Should render as plain preformatted text
- [ ] **Deeply nested lists:** Test rendering doesn't break layout
- [ ] **Wide tables:** May overflow on mobile - apply horizontal scroll

### Security Considerations
- [ ] **XSS Prevention:** react-markdown sanitizes by default - no raw HTML unless explicitly enabled
- [ ] **Link Safety:** Consider rel="noopener noreferrer" on external links (automatic in react-markdown)

---

## 15. Deployment & Configuration

No additional environment variables or configuration required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow the established block type pattern exactly
2. Model MarkdownEditor after TextEditor for styling controls
3. Model MarkdownBlock after TextBlock for rendering patterns
4. Use CSS variables consistently for theme colors
5. Include syntax highlighting CSS in the component

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for empty/invalid content
- [ ] Use async/await (not .then chains)
- [ ] No fallback behavior - fail fast with clear errors
- [ ] Professional comments explaining business logic only

---

## 17. Notes & Additional Context

### Reference Implementations
- **TextEditor.tsx** - Styling controls pattern
- **TextBlock.tsx** - Plain/styled rendering modes
- **EmbedEditor.tsx** - Simple content + preview pattern

### Syntax Highlighting Theme
Use highlight.js's CSS. Include both light and dark mode styles. The `github` and `github-dark` themes work well with the existing design system.

### Mobile Considerations
The split view should collapse to a tabbed interface on mobile (< md breakpoint). Use Tabs component from shadcn/ui for this.

---

*Task Document Created: 2025-12-31*
*Template Version: 1.0*
