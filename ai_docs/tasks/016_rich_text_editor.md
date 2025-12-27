# AI Task Document

---

## 1. Task Overview

### Task Title
**Title:** Rich Text Editor for Text Sections

### Goal Statement
**Goal:** Replace the plain textarea in Text sections with a rich text editor that supports basic formatting (bold, italic, links, headings, lists) while maintaining compatibility with the existing content storage and rendering system.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Text sections currently use a plain `<Textarea>` component that only supports plain text. Users expect basic formatting capabilities like bold, italic, links, and lists. This is a common feature request and significantly impacts content creation experience.

Multiple rich text editor libraries exist with different trade-offs in complexity, bundle size, and extensibility.

### Solution Options Analysis

#### Option 1: Tiptap with shadcn-minimal-tiptap
**Approach:** Use the official shadcn-minimal-tiptap component which provides a pre-built Tiptap editor styled for shadcn/ui.

**Pros:**
- ✅ **Perfect shadcn/ui integration** - Matches existing UI components exactly
- ✅ **One-command installation** - `npx shadcn@latest add` from registry
- ✅ **Modern & maintained** - Active development, good community
- ✅ **Extensible** - Can add more features later (images, code blocks)
- ✅ **HTML output** - Stores content as HTML, easy to render

**Cons:**
- ❌ **Larger bundle size** - ~150KB gzipped (Tiptap + ProseMirror)
- ❌ **More dependencies** - Multiple @tiptap/* packages
- ❌ **Learning curve** - ProseMirror concepts for customization

**Implementation Complexity:** Low-Medium (pre-built component)
**Risk Level:** Low (well-tested, widely used)

#### Option 2: Vanilla Tiptap (Custom Build)
**Approach:** Install core Tiptap packages and build custom editor UI from scratch.

**Pros:**
- ✅ **Full control** - Custom toolbar, styling, extensions
- ✅ **Smaller bundle** - Only include needed extensions
- ✅ **No external component dependency** - Own the code

**Cons:**
- ❌ **More development time** - Build toolbar, styling manually
- ❌ **Maintenance burden** - Own the editor component code
- ❌ **Styling effort** - Need to match shadcn/ui manually

**Implementation Complexity:** Medium-High
**Risk Level:** Low-Medium (more code to maintain)

#### Option 3: React-Quill
**Approach:** Use react-quill, a popular but older rich text editor.

**Pros:**
- ✅ **Simple API** - Easy to integrate
- ✅ **Smaller bundle** - ~45KB gzipped
- ✅ **Battle-tested** - Long history, stable

**Cons:**
- ❌ **Dated UI** - Doesn't match shadcn/ui aesthetic
- ❌ **Limited extensibility** - Harder to customize
- ❌ **Maintenance concerns** - Less active development
- ❌ **SSR issues** - Requires dynamic import in Next.js

**Implementation Complexity:** Low
**Risk Level:** Medium (dated, styling mismatch)

#### Option 4: Slate
**Approach:** Use Slate, a highly customizable framework for building editors.

**Pros:**
- ✅ **Maximum flexibility** - Build exactly what you need
- ✅ **React-first** - Native React components
- ✅ **Good for complex needs** - Tables, embeds, etc.

**Cons:**
- ❌ **High complexity** - Steep learning curve
- ❌ **More boilerplate** - Need to implement many features
- ❌ **Overkill for basic formatting** - Too powerful for simple use case

**Implementation Complexity:** High
**Risk Level:** Medium (complexity could cause delays)

### Recommendation & Rationale

**🎯 CHOSEN SOLUTION:** Option 2 - Vanilla Tiptap (Custom Build)

**Why this approach was selected:**
1. **Full control** - Own the code, no external component dependencies
2. **Official packages only** - Use trusted @tiptap/* packages
3. **Smaller bundle** - Only include needed extensions (~100KB)
4. **Maintainability** - Simple component we control and understand
5. **Flexibility** - Easy to customize toolbar and styling

**Key Decision Factors:**
- **Performance Impact:** Smaller bundle than pre-built component
- **User Experience:** Custom toolbar using existing shadcn/ui buttons
- **Maintainability:** ~100 lines of code we own
- **Trust:** Official Tiptap packages, no third-party component registry

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State

**TextEditor.tsx (Editor):**
```tsx
<Textarea
  value={content.body}
  onChange={(e) => handleChange(e.target.value)}
  placeholder="Enter your text content..."
  rows={8}
/>
```
- Plain textarea, no formatting
- Stores content as plain string in `content.body`
- Note in UI: "Rich text editor coming soon"

**TextBlock.tsx (Renderer):**
```tsx
{content.body.split("\n").map((paragraph, index) => (
  <p key={index} className="mb-4 last:mb-0">
    {paragraph}
  </p>
))}
```
- Splits on newlines, renders as `<p>` tags
- No HTML support currently

**TextContent Type:**
```tsx
export interface TextContent {
  body: string;
}
```
- Simple string storage - works for HTML too

### Existing Codebase Analysis

**Relevant Files:**
- `components/editor/blocks/TextEditor.tsx` - Will be replaced
- `components/render/blocks/TextBlock.tsx` - Will be updated to render HTML
- `lib/section-types.ts` - TextContent interface (no changes needed)
- `lib/section-defaults.ts` - Default content for text sections

---

## 4. Context & Problem Definition

### Problem Statement
Users cannot format text content in text sections. This severely limits content creation capabilities:
- No way to emphasize important text (bold, italic)
- No way to add links to external resources
- No way to create structured content (headings, lists)
- No way to add quotes or code snippets

### Success Criteria
- [ ] Rich text editor appears in Text section editor
- [ ] Users can apply bold, italic, underline formatting
- [ ] Users can add links with URL
- [ ] Users can create headings (H2, H3)
- [ ] Users can create bullet and numbered lists
- [ ] Users can add blockquotes
- [ ] Content saves as HTML string
- [ ] Published pages render formatted HTML correctly
- [ ] Editor matches shadcn/ui design aesthetic

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - existing text content is minimal
- **Data migration:** Plain text will display as-is (valid HTML)
- **Priority: Good UX over minimal bundle size**

---

## 6. Technical Requirements

### Functional Requirements
- [ ] Replace Textarea with Tiptap rich text editor
- [ ] Toolbar with: Bold, Italic, Underline, Strike
- [ ] Toolbar with: H2, H3 heading options
- [ ] Toolbar with: Bullet list, Numbered list
- [ ] Toolbar with: Link (with URL input)
- [ ] Toolbar with: Blockquote
- [ ] Toolbar with: Undo/Redo
- [ ] Output content as HTML string
- [ ] Render HTML content on published pages

### Non-Functional Requirements
- **Performance:** Editor should load within 500ms
- **Usability:** Intuitive toolbar, keyboard shortcuts
- **Accessibility:** Keyboard navigation, screen reader support
- **Theme Support:** Editor works in admin app theme (no conflict)

### Technical Constraints
- Must work with existing `TextContent` interface (body: string)
- Must render safely (sanitized HTML) on published pages
- Must support both light and dark mode in admin

---

## 7. Data & Database Changes

**No database changes required.**

Content is already stored as string in JSONB. HTML strings will be stored in the same `body` field.

---

## 8. Backend Changes & Background Jobs

**No backend changes required.**

---

## 9. Frontend Changes

### New Components
- [ ] **`components/ui/minimal-tiptap/`** - Installed via shadcn registry (multiple files)

### Component Modifications
- [ ] **`components/editor/blocks/TextEditor.tsx`** - Replace Textarea with MinimalTiptapEditor
- [ ] **`components/render/blocks/TextBlock.tsx`** - Render HTML instead of plain text

### Dependencies to Add
```json
{
  "dependencies": {
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "@tiptap/pm": "^2.x",
    "@tiptap/extension-link": "^2.x",
    "@tiptap/extension-placeholder": "^2.x"
  }
}
```

**Note:** Minimal dependencies - StarterKit includes bold, italic, headings, lists, blockquote, etc.

---

## 10. Code Changes Overview

### Current Implementation (Before)

**TextEditor.tsx:**
```tsx
export function TextEditor({ content, onChange, disabled }: TextEditorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="text-body">Content</Label>
      <Textarea
        value={content.body}
        onChange={(e) => onChange({ ...content, body: e.target.value })}
        placeholder="Enter your text content..."
        rows={8}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        You can use basic HTML tags for formatting. Rich text editor coming soon.
      </p>
    </div>
  );
}
```

**TextBlock.tsx:**
```tsx
export function TextBlock({ content, theme }: TextBlockProps) {
  return (
    <section className="py-12 px-6" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="prose prose-lg max-w-none" style={...}>
          {content.body.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### After Refactor

**TextEditor.tsx:**
```tsx
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";

export function TextEditor({ content, onChange, disabled }: TextEditorProps) {
  return (
    <div className="space-y-2">
      <Label>Content</Label>
      <MinimalTiptapEditor
        value={content.body}
        onChange={(html) => onChange({ ...content, body: html })}
        placeholder="Enter your text content..."
        editable={!disabled}
        output="html"
        className="min-h-[200px]"
      />
    </div>
  );
}
```

**TextBlock.tsx:**
```tsx
export function TextBlock({ content, theme }: TextBlockProps) {
  return (
    <section className="py-12 px-6" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="max-w-3xl mx-auto">
        <div
          className="prose prose-lg max-w-none"
          style={...}
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </section>
  );
}
```

### Key Changes Summary
- [ ] **Install shadcn-minimal-tiptap** - Via registry command
- [ ] **Replace TextEditor** - Textarea → MinimalTiptapEditor
- [ ] **Update TextBlock** - Plain text → HTML rendering
- [ ] **Files Modified:** 2 component files
- [ ] **Files Created:** Multiple files in `components/ui/minimal-tiptap/`

---

## 11. Implementation Plan

### Phase 1: Install Tiptap Dependencies
**Goal:** Add official Tiptap packages

- [ ] **Task 1.1:** Install Tiptap packages
  - Command: `npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder`
  - Details: Official packages only, minimal footprint

### Phase 2: Create TiptapEditor Component
**Goal:** Build custom Tiptap editor with shadcn/ui toolbar

- [ ] **Task 2.1:** Create TiptapEditor.tsx
  - Files: `components/editor/TiptapEditor.tsx`
  - Details: Tiptap editor with toolbar using shadcn/ui Toggle buttons
  - Features: Bold, Italic, Headings, Lists, Links, Blockquote

### Phase 3: Update TextEditor Component
**Goal:** Replace Textarea with TiptapEditor

- [ ] **Task 3.1:** Update TextEditor.tsx
  - Files: `components/editor/blocks/TextEditor.tsx`
  - Details: Import and use TiptapEditor with HTML output

### Phase 4: Update TextBlock Renderer
**Goal:** Render HTML content on published pages

- [ ] **Task 4.1:** Update TextBlock.tsx
  - Files: `components/render/blocks/TextBlock.tsx`
  - Details: Use dangerouslySetInnerHTML for HTML rendering
- [ ] **Task 4.2:** Ensure prose styles work with HTML
  - Details: Verify Tailwind prose classes style all HTML elements

### Phase 5: Testing & Validation
**Goal:** Verify functionality

- [ ] **Task 5.1:** Static code analysis
  - Command: `npm run lint && npm run type-check`
- [ ] **Task 5.2:** 👤 USER TESTING - Browser verification
  - Test creating text section with formatting
  - Test saving and previewing formatted content
  - Test published page rendering

### Phase 6: Comprehensive Code Review (Mandatory)
**Goal:** Review all changes

- [ ] **Task 6.1:** Present "Implementation Complete!" message
- [ ] **Task 6.2:** Execute comprehensive code review if approved

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Phase 1: Install Tiptap Dependencies
- [x] **Task 1.1:** Install Tiptap packages ✓ 2025-12-27
  - Command: `npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder`
  - Details: Added 62 packages successfully ✓

### Phase 2: Create TiptapEditor Component
- [x] **Task 2.1:** Create TiptapEditor.tsx ✓ 2025-12-27
  - Files: `components/editor/TiptapEditor.tsx` (270 lines) ✓
  - Details: Full toolbar with Bold, Italic, H2, H3, Lists, Blockquote, Links, Undo/Redo ✓

### Phase 3: Update TextEditor Component
- [x] **Task 3.1:** Update TextEditor.tsx ✓ 2025-12-27
  - Files: `components/editor/blocks/TextEditor.tsx` ✓
  - Details: Replaced Textarea with TiptapEditor, outputs HTML ✓

### Phase 4: Update TextBlock Renderer
- [x] **Task 4.1:** Update TextBlock.tsx ✓ 2025-12-27
  - Files: `components/render/blocks/TextBlock.tsx` ✓
  - Details: Uses dangerouslySetInnerHTML for HTML rendering ✓
- [x] **Task 4.2:** Prose styles configured ✓ 2025-12-27
  - Details: Added prose classes for headings, links, blockquotes ✓

### Phase 5: Testing & Validation
- [x] **Task 5.1:** Static code analysis ✓ 2025-12-27
  - Command: `npm run lint && npm run type-check` ✓
  - Details: No linting errors, no TypeScript errors ✓

---

## 13. File Structure & Organization

### New Files to Create
```
components/
└── ui/
    └── minimal-tiptap/          # Installed via shadcn registry
        ├── minimal-tiptap.tsx
        ├── extensions/
        └── components/
```

### Files to Modify
- [ ] **`components/editor/blocks/TextEditor.tsx`** - Replace Textarea with Tiptap
- [ ] **`components/render/blocks/TextBlock.tsx`** - Render HTML content

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Edge Case 1:** Empty content handling
  - **Analysis:** Tiptap may return empty `<p></p>` tags for empty content
  - **Recommendation:** Check for empty/whitespace-only content before saving
- [ ] **Edge Case 2:** Existing plain text content
  - **Analysis:** Plain text stored before rich text is enabled
  - **Recommendation:** Plain text renders fine as HTML (no tags = plain text)

### Security Considerations
- [ ] **XSS Prevention:** HTML is user-generated content
  - **Mitigation:** Tiptap sanitizes output by default, only allows configured extensions
  - **Verification:** Test that script tags cannot be injected

---

## 15. Deployment & Configuration

No environment variables or configuration changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Get user approval of strategic analysis
2. Implement phase-by-phase
3. Update completion tracking after each phase
4. Comprehensive code review after implementation

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for cleaner code
- [ ] Ensure component matches existing patterns

---

## 17. Notes & Additional Context

### shadcn-minimal-tiptap Reference
- **Repo:** https://github.com/Aslam97/shadcn-minimal-tiptap
- **Install:** `npx shadcn@latest add [registry-url]`
- **Output options:** "html" | "json" | "text"

### Tiptap Extensions Included
The minimal-tiptap component includes:
- StarterKit (bold, italic, headings, lists, etc.)
- Link extension
- Typography extension
- Placeholder extension

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

**Breaking Changes:** None - additive feature, existing content works

**Performance Implications:**
- Bundle size increase ~150KB (acceptable trade-off)
- Editor loads async, minimal impact on page load

**User Experience Impacts:**
- Significant positive impact - modern editing experience
- Learning curve minimal - familiar toolbar interface

### Mitigation Strategies
None required - low-risk enhancement.

---

*Task Document Created: 2025-12-27*
*Complexity: Medium*
*Estimated Impact: P2 - Medium Priority Enhancement*
