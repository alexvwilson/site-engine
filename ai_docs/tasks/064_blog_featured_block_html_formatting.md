# AI Task Template

> **Instructions:** Fix the BlogFeaturedBlock to properly render HTML content with full markdown formatting when `showFullContent` is enabled.

---

## 1. Task Overview

### Task Title
**Title:** Fix BlogFeaturedBlock HTML Formatting When Show Full Content Enabled

### Goal Statement
**Goal:** When the BlogFeaturedBlock has `showFullContent: true`, render the blog post content with full HTML/markdown formatting (headings, bold, lists, dividers, etc.) instead of stripping all formatting to plain text. The formatting should match the blog post detail page.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
This is a straightforward bug fix with one clear solution - skip strategic analysis.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4, prose classes for content

### Current State
**The Problem:**

In `BlogFeaturedBlock.tsx`, when `showFullContent: true`:
1. The `truncateContent()` function extracts paragraphs using regex: `html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi)`
2. It strips ALL HTML tags: `p.replace(/<[^>]*>/g, "").trim()`
3. Returns plain text strings with no formatting

**What's Lost:**
- **Headings** (`<h2>`, `<h3>`) - completely stripped (not even matched by paragraph regex)
- **Bold text** (`<strong>`, `<b>`) - stripped from within paragraphs
- **Horizontal rules** (`<hr>`) - not matched or preserved
- **Lists** (`<ul>`, `<ol>`, `<li>`) - not matched or preserved
- **Blockquotes** (`<blockquote>`) - stripped
- **Links** (`<a>`) - stripped
- **Code blocks** (`<pre>`, `<code>`) - stripped

**Working Reference:**
`PostContent.tsx` (blog post detail page) renders content correctly using:
- `dangerouslySetInnerHTML={{ __html: content.html }}`
- Tailwind's `prose prose-lg` classes for typography
- Theme-aware CSS variables for colors

### Existing Codebase Analysis

**Relevant Files:**
- `components/render/blocks/BlogFeaturedBlock.tsx` - The block with the issue
- `components/render/blog/PostContent.tsx` - Working reference implementation
- `lib/section-types.ts` - BlogFeaturedContent type definition

---

## 4. Context & Problem Definition

### Problem Statement
Users who enable "Show Full Content" on the BlogFeaturedBlock expect to see their blog post with full formatting - headings, bold text, lists, horizontal dividers, etc. Instead, all formatting is stripped and only plain paragraph text is displayed.

This creates a poor user experience where the content appears as a wall of unstyled text instead of the well-formatted blog post they wrote.

### Success Criteria
- [ ] When `showFullContent: true` with `contentLimit: 0`, HTML is rendered with full formatting
- [ ] Headings (`h2`, `h3`) display as headings with proper size/weight
- [ ] Bold text (`strong`) renders as bold
- [ ] Horizontal rules (`hr`) display as dividers
- [ ] Lists (`ul`, `ol`) display with bullets/numbers
- [ ] Links (`a`) are clickable
- [ ] Blockquotes display with proper styling
- [ ] Theme colors apply correctly (light/dark mode)
- [ ] Excerpt mode (showFullContent: false) continues to work as plain text

---

## 5. Development Mode Context

### Development Mode Context
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Data loss acceptable** - existing data can be wiped/migrated aggressively
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- When `showFullContent: true` and `contentLimit: 0` (no limit): Render full HTML with prose styling
- When `showFullContent: true` and `contentLimit > 0`: Truncate content but preserve some formatting
- When `showFullContent: false`: Continue using excerpt (plain text) as before
- All 4 layouts (split, stacked, hero, minimal) should support formatted content

### Non-Functional Requirements
- **Performance:** No additional API calls needed
- **Security:** Use `dangerouslySetInnerHTML` safely (content is already sanitized HTML from blog editor)
- **Responsive Design:** Prose styling should work at all breakpoints
- **Theme Support:** Use theme CSS variables for prose colors (like PostContent)

### Technical Constraints
- Must use the existing HTML content from `post.content.html`
- Must maintain backward compatibility with excerpt mode

---

## 7. Data & Database Changes

No database changes required.

---

## 8. Backend Changes & Background Jobs

No backend changes required.

---

## 9. Frontend Changes

### Files to Modify
- [ ] **`components/render/blocks/BlogFeaturedBlock.tsx`** - Main changes

### Component Changes

**Option A: No Character Limit (Full Content)**
When `showFullContent: true` and `contentLimit: 0`, render HTML directly with prose styling.

**Option B: With Character Limit**
When `showFullContent: true` and `contentLimit > 0`, we need a smarter truncation that preserves some formatting. For simplicity, we could:
1. Still render HTML but add CSS to limit visible height, OR
2. Fall back to plain text truncation (current behavior)

### New Helper Component

Add a `PostContentFull` component or modify `PostText` to accept HTML mode:

```tsx
function PostContentFull({ html }: { html: string }) {
  return (
    <div
      className="prose prose-lg max-w-none [&_p]:mb-4 [&_p]:mt-0 [&_p:last-child]:mb-0 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:my-4 [&_ol]:my-4 [&_blockquote]:my-6"
      style={{
        "--tw-prose-body": "var(--theme-text)",
        "--tw-prose-headings": "var(--theme-text)",
        "--tw-prose-lead": "var(--theme-muted-text)",
        "--tw-prose-links": "var(--theme-primary)",
        "--tw-prose-bold": "var(--theme-text)",
        "--tw-prose-counters": "var(--theme-muted-text)",
        "--tw-prose-bullets": "var(--theme-muted-text)",
        "--tw-prose-hr": "var(--theme-border)",
        "--tw-prose-quotes": "var(--theme-text)",
        "--tw-prose-quote-borders": "var(--theme-primary)",
        "--tw-prose-captions": "var(--theme-muted-text)",
        "--tw-prose-code": "var(--theme-text)",
        "--tw-prose-pre-code": "var(--theme-text)",
        "--tw-prose-pre-bg": "var(--theme-muted)",
        "--tw-prose-th-borders": "var(--theme-border)",
        "--tw-prose-td-borders": "var(--theme-border)",
        fontFamily: "var(--theme-font-body)",
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

### Logic Changes

Modify content preparation logic (~line 160-164):

```tsx
// Current (broken):
const postContent: TruncateResult =
  settings.showFullContent && post.content?.html
    ? truncateContent(post.content.html, settings.contentLimit)
    : { text: post.excerpt || "", paragraphs: [post.excerpt || ""], truncated: false };

// New approach:
// If showFullContent and no limit, render HTML directly
// If showFullContent with limit, truncate to plain text
// If not showFullContent, use excerpt
const shouldRenderHtml = settings.showFullContent &&
                         settings.contentLimit === 0 &&
                         post.content?.html;

const postContent: TruncateResult = settings.showFullContent && post.content?.html
  ? truncateContent(post.content.html, settings.contentLimit)
  : { text: post.excerpt || "", paragraphs: [post.excerpt || ""], truncated: false };
```

Then update layout components to check `shouldRenderHtml` and render `PostContentFull` instead of `PostText`.

---

## 10. Code Changes Overview

### Current Implementation (Before)

**`components/render/blocks/BlogFeaturedBlock.tsx`** (lines 160-164):
```tsx
// Prepare content text
const postContent: TruncateResult =
  settings.showFullContent && post.content?.html
    ? truncateContent(post.content.html, settings.contentLimit)
    : { text: post.excerpt || "", paragraphs: [post.excerpt || ""], truncated: false };
```

**`truncateContent` function** strips all HTML:
```tsx
// Clean each paragraph - remove HTML tags but keep the paragraph text
const paragraphs = paragraphMatches
  .map(p => p.replace(/<[^>]*>/g, "").trim())
  .filter(p => p.length > 0);
```

**`PostText` component** renders plain text:
```tsx
function PostText({ paragraphs, truncated = false }: { paragraphs: string[]; truncated?: boolean }) {
  return (
    <div className="space-y-4" style={{ color: "var(--theme-muted-text)", fontFamily: "var(--theme-font-body)" }}>
      {paragraphs.map((para, index) => (
        <p key={index} className="text-lg leading-relaxed">{para}</p>
      ))}
    </div>
  );
}
```

### After Refactor

**Add new helper component:**
```tsx
function PostContentFull({ html }: { html: string }) {
  return (
    <div
      className="prose prose-lg max-w-none [&_p]:mb-4 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:my-4 [&_ol]:my-4 [&_blockquote]:my-6"
      style={{
        "--tw-prose-body": "var(--theme-text)",
        "--tw-prose-headings": "var(--theme-text)",
        // ... full prose theme variables
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

**Update layout components to conditionally render HTML:**
```tsx
// In SplitLayout, StackedLayout, MinimalLayout:
{shouldRenderHtml ? (
  <PostContentFull html={post.content!.html} />
) : postContent.text ? (
  <PostText paragraphs={postContent.paragraphs} truncated={postContent.truncated} />
) : null}
```

### Key Changes Summary
- [ ] **Add `PostContentFull` component** - Renders HTML with prose styling (matching PostContent.tsx)
- [ ] **Add `shouldRenderHtml` flag** - Determine when to render full HTML vs plain text
- [ ] **Update all 4 layout components** - Conditionally render HTML or plain text
- [ ] **Files Modified:** `components/render/blocks/BlogFeaturedBlock.tsx`
- [ ] **Impact:** Full markdown formatting now displays when "Show Full Content" is enabled

---

## 11. Implementation Plan

### Phase 1: Add HTML Rendering Component
**Goal:** Add helper component for rendering formatted HTML content

- [ ] **Task 1.1:** Add `PostContentFull` component to BlogFeaturedBlock.tsx
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Copy prose styling from PostContent.tsx, adapt for inline use

### Phase 2: Update Content Logic
**Goal:** Add flag to determine when to render HTML vs plain text

- [ ] **Task 2.1:** Add `shouldRenderHtml` boolean calculation
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Check if showFullContent && contentLimit === 0 && has HTML

- [ ] **Task 2.2:** Pass flag to layout props
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Add to LayoutProps interface and pass to each layout

### Phase 3: Update Layout Components
**Goal:** Render formatted HTML in each layout variant

- [ ] **Task 3.1:** Update SplitLayout
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Conditionally render PostContentFull or PostText

- [ ] **Task 3.2:** Update StackedLayout
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Conditionally render PostContentFull or PostText

- [ ] **Task 3.3:** Update MinimalLayout
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Conditionally render PostContentFull or PostText

- [ ] **Task 3.4:** Update HeroLayout (if applicable)
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Hero may keep plain text for overlay readability (design decision)

### Phase 4: Testing & Validation
**Goal:** Verify formatting works correctly

- [ ] **Task 4.1:** Run linting
  - Command: `npm run lint`
  - Details: Ensure no linting errors

- [ ] **Task 4.2:** Run type checking
  - Command: `npm run type-check`
  - Details: Ensure no TypeScript errors

### Phase 5: User Browser Testing
**Goal:** Request human testing for UI verification

- [ ] **Task 5.1:** Present testing instructions to user
  - Details: User tests the BlogFeaturedBlock with showFullContent enabled

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes, etc.)

---

## 13. File Structure & Organization

### Files to Modify
- [ ] **`components/render/blocks/BlogFeaturedBlock.tsx`** - All changes in this single file

No new files needed - changes are contained within the existing block component.

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Error Scenario 1:** Malformed HTML in content
  - **Code Review Focus:** The HTML comes from the blog editor which already sanitizes content
  - **Potential Fix:** Content is pre-sanitized, no additional sanitization needed

### Edge Cases to Consider
- [ ] **Edge Case 1:** Empty content when showFullContent is true
  - **Analysis Approach:** Check if content?.html exists before rendering
  - **Recommendation:** Fall back to excerpt or empty state

- [ ] **Edge Case 2:** contentLimit > 0 with showFullContent
  - **Analysis Approach:** Current truncation logic still runs
  - **Recommendation:** Keep current behavior (plain text) when limit is set

### Security & Access Control Review
- [ ] **XSS Prevention:** HTML is from trusted source (blog editor with sanitization)
- [ ] **No user input injection:** Content is stored HTML, not user-provided raw input

---

## 15. Deployment & Configuration

No environment variable changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Read the current BlogFeaturedBlock.tsx implementation
2. Add the PostContentFull helper component
3. Add the shouldRenderHtml flag logic
4. Update each layout component to conditionally render HTML
5. Run linting and type checking
6. Request user browser testing

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use proper type annotations
- [ ] Maintain consistent code style with existing file

---

## 17. Notes & Additional Context

### Related Files
- `components/render/blog/PostContent.tsx` - Reference implementation for prose styling
- Task 027 created the BlogFeaturedBlock layouts but didn't implement proper HTML rendering

### Design Decision: HeroLayout
The HeroLayout shows content over a background image with an overlay. Rendering full HTML with headings may not work well visually. Consider keeping HeroLayout as plain text excerpt for readability, or discuss with user.

---

*Template Version: 1.0*
*Created: 2026-01-08*
