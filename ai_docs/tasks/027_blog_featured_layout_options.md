# AI Task Template

> Task document for enhancing the Blog Featured block with multiple layout options and content display settings.

---

## 1. Task Overview

### Task Title
**Title:** Blog Featured Block Layout Options & Content Display Enhancements

### Goal Statement
**Goal:** Enhance the `blog_featured` block to support multiple layout variants (split, stacked, hero, minimal) with configurable content display options including full post content rendering, character-based truncation, category badges, and a styled "Read More" link. This enables users to create "news website" style experiences by displaying full blog posts inline on any page without requiring navigation.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
This is a straightforward enhancement with a clear direction from the planning document and user feedback. The implementation approach is well-defined. **Strategic analysis not required.**

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4 for styling
- **Key Patterns:** Server Components for async data fetching, Client Components for editors

### Current State
The `blog_featured` block currently:
- Has a minimal interface: `{ postId: string | null }`
- Displays a split layout (image left, content right) with title, excerpt, author, and date
- Links the entire block to the full post page
- Does not support displaying full post content inline
- Does not support multiple layout variants
- Does not show category badges

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- [x] `lib/section-types.ts` - Current `BlogFeaturedContent` interface (line 99-101)
- [x] `lib/section-defaults.ts` - Current default: `{ postId: null }` (line 101-103)
- [x] `components/editor/BlogFeaturedEditor.tsx` - Simple post selector (79 lines)
- [x] `components/render/blocks/BlogFeaturedBlock.tsx` - Current split layout renderer (136 lines)
- [x] `components/render/blog/PostContent.tsx` - HTML content renderer with theme-aware prose styling
- [x] `components/render/PreviewBlockRenderer.tsx` - Shows placeholder for blog blocks in preview
- [x] `components/render/blocks/HeroBlock.tsx` - Reference for hero layout with background image overlay pattern

---

## 4. Context & Problem Definition

### Problem Statement
The current `blog_featured` block only shows a preview (title, excerpt, image) that links to the full post. Users want to display entire post content inline on any page, creating a "news website" style experience without requiring navigation to a separate post page.

### Success Criteria
- [ ] Four layout options available: `split`, `stacked`, `hero`, `minimal`
- [ ] Toggle to show full post content vs excerpt only
- [ ] Character-based content truncation with configurable limit
- [ ] "Read more..." link at truncation point (different from CTA styling)
- [ ] Category badge display toggle
- [ ] Hero layout has configurable overlay color and opacity
- [ ] All layouts work with site theme variables
- [ ] Preview placeholder updated to show selected layout type

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - existing `blog_featured` blocks will get new default values
- **Priority: Clean implementation** over migration complexity

---

## 6. Technical Requirements

### Functional Requirements
- User can select from 4 layout options in the editor
- User can toggle between showing full content or excerpt only
- User can set a character limit for content truncation (0 = no limit)
- User can toggle the "Read More" link visibility
- User can toggle category badge visibility
- For hero layout, user can set overlay color and opacity
- Content truncation adds ellipsis with optional "read more..." link

### Non-Functional Requirements
- **Performance:** No additional database queries (post already fetched)
- **Responsive Design:** All layouts must work on mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Theme Support:** Must use CSS variables for all colors/fonts

### Technical Constraints
- Must maintain async Server Component pattern for `BlogFeaturedBlock`
- Preview renderer cannot fetch async data (shows placeholder)
- Content stored as `{ html: string }` requires character-safe truncation

---

## 7. Data & Database Changes

### Database Schema Changes
**No database changes required.** The `BlogFeaturedContent` interface stores layout options in the existing JSONB `content` column on the `sections` table.

### Data Model Updates

```typescript
// lib/section-types.ts - Updated BlogFeaturedContent interface

export type BlogFeaturedLayout = 'split' | 'stacked' | 'hero' | 'minimal';

export interface BlogFeaturedContent {
  postId: string | null;
  layout: BlogFeaturedLayout;
  showFullContent: boolean;
  contentLimit: number;  // Character limit (0 = no limit)
  showReadMore: boolean;
  showCategory: boolean;
  // Hero layout specific
  overlayColor: string;  // Hex color, e.g., "#000000"
  overlayOpacity: number; // 0-100
}
```

```typescript
// lib/section-defaults.ts - Updated default

blog_featured: {
  postId: null,
  layout: 'split',
  showFullContent: false,
  contentLimit: 0,
  showReadMore: true,
  showCategory: true,
  overlayColor: '#000000',
  overlayOpacity: 50,
},
```

### Data Migration Plan
- [x] No migration needed - new fields get default values when accessed
- [x] Existing sections with old format will use defaults via spread operator pattern

---

## 8. Backend Changes & Background Jobs

**No backend changes required.** This is a frontend-only enhancement.

---

## 9. Frontend Changes

### New Components
None - modifying existing components only.

### Component Modifications

#### `components/editor/BlogFeaturedEditor.tsx`
Add controls for:
- Layout selector (4 options with visual preview)
- Show Full Content toggle
- Content Limit number input (shown when showFullContent is true)
- Show Read More toggle
- Show Category toggle
- Overlay Color picker (shown when layout is 'hero')
- Overlay Opacity slider (shown when layout is 'hero')

#### `components/render/blocks/BlogFeaturedBlock.tsx`
Implement 4 layout variants:
1. **Split** - Current layout (image left, content right on desktop)
2. **Stacked** - Image on top, full content below
3. **Hero** - Full-width background image with configurable overlay
4. **Minimal** - No image, text content only

Add content rendering logic:
- Fetch and render full HTML content when `showFullContent` is true
- Truncate at character limit with ellipsis
- Add "read more..." link when `showReadMore` is true

#### `components/render/PreviewBlockRenderer.tsx`
Update placeholder to show selected layout type.

### State Management
No new state management - editor uses existing `content` / `onChange` pattern.

---

## 10. Code Changes Overview

### Current Implementation (Before)

```typescript
// lib/section-types.ts (lines 99-101)
export interface BlogFeaturedContent {
  postId: string | null;
}
```

```typescript
// lib/section-defaults.ts (lines 101-103)
blog_featured: {
  postId: null,
},
```

```tsx
// components/editor/BlogFeaturedEditor.tsx (simplified)
export function BlogFeaturedEditor({ content, onChange, siteId }) {
  // Only has post selector dropdown
  return (
    <div className="space-y-4">
      <Select value={content.postId || "none"} onValueChange={...}>
        {/* Post options */}
      </Select>
    </div>
  );
}
```

```tsx
// components/render/blocks/BlogFeaturedBlock.tsx (simplified)
export async function BlogFeaturedBlock({ content, siteSlug }) {
  const post = await getPublishedPostById(content.postId);
  // Only renders split layout with title, excerpt, image
  return (
    <section>
      <div className="grid md:grid-cols-2">
        {/* Image */}
        {/* Title, excerpt, author, date */}
      </div>
    </section>
  );
}
```

### After Refactor

```typescript
// lib/section-types.ts
export type BlogFeaturedLayout = 'split' | 'stacked' | 'hero' | 'minimal';

export interface BlogFeaturedContent {
  postId: string | null;
  layout: BlogFeaturedLayout;
  showFullContent: boolean;
  contentLimit: number;
  showReadMore: boolean;
  showCategory: boolean;
  overlayColor: string;
  overlayOpacity: number;
}
```

```typescript
// lib/section-defaults.ts
blog_featured: {
  postId: null,
  layout: 'split',
  showFullContent: false,
  contentLimit: 0,
  showReadMore: true,
  showCategory: true,
  overlayColor: '#000000',
  overlayOpacity: 50,
},
```

```tsx
// components/editor/BlogFeaturedEditor.tsx (new structure)
export function BlogFeaturedEditor({ content, onChange, siteId }) {
  return (
    <div className="space-y-6">
      {/* Post selector */}
      {/* Layout selector with 4 options */}
      {/* Content Display section */}
      {/* Category toggle */}
      {/* Hero overlay settings (conditional) */}
    </div>
  );
}
```

```tsx
// components/render/blocks/BlogFeaturedBlock.tsx (new structure)
export async function BlogFeaturedBlock({ content, siteSlug }) {
  const post = await getPublishedPostById(content.postId);
  const layout = content.layout || 'split';

  switch (layout) {
    case 'split': return <SplitLayout post={post} content={content} ... />;
    case 'stacked': return <StackedLayout post={post} content={content} ... />;
    case 'hero': return <HeroLayout post={post} content={content} ... />;
    case 'minimal': return <MinimalLayout post={post} content={content} ... />;
  }
}
```

### Key Changes Summary
- [ ] **Interface expansion:** `BlogFeaturedContent` grows from 1 to 8 properties
- [ ] **Editor controls:** Add ~150 lines for new editor controls
- [ ] **Layout variants:** Implement 4 distinct layout rendering functions
- [ ] **Content truncation:** Add HTML-safe character truncation utility
- [ ] **Files Modified:** 4 files (`section-types.ts`, `section-defaults.ts`, `BlogFeaturedEditor.tsx`, `BlogFeaturedBlock.tsx`, `PreviewBlockRenderer.tsx`)

---

## 11. Implementation Plan

### Phase 1: Data Model Updates
**Goal:** Update TypeScript interfaces and defaults

- [ ] **Task 1.1:** Update `BlogFeaturedContent` interface in `lib/section-types.ts`
  - Files: `lib/section-types.ts`
  - Details: Add layout type, all new properties
- [ ] **Task 1.2:** Update defaults in `lib/section-defaults.ts`
  - Files: `lib/section-defaults.ts`
  - Details: Add sensible defaults for all new properties

### Phase 2: Editor Enhancements
**Goal:** Add all configuration controls to the editor

- [ ] **Task 2.1:** Add layout selector with visual indicators
  - Files: `components/editor/BlogFeaturedEditor.tsx`
  - Details: Radio group or segmented control with layout icons/names
- [ ] **Task 2.2:** Add content display controls
  - Files: `components/editor/BlogFeaturedEditor.tsx`
  - Details: Show Full Content toggle, Content Limit input, Show Read More toggle
- [ ] **Task 2.3:** Add category badge toggle
  - Files: `components/editor/BlogFeaturedEditor.tsx`
  - Details: Simple switch control
- [ ] **Task 2.4:** Add hero overlay controls (conditional)
  - Files: `components/editor/BlogFeaturedEditor.tsx`
  - Details: Color picker and opacity slider, only shown when layout='hero'

### Phase 3: Block Renderer Layouts
**Goal:** Implement all 4 layout variants

- [ ] **Task 3.1:** Create HTML truncation utility
  - Files: `lib/html-utils.ts` (new file) or inline in block
  - Details: Safely truncate HTML content at character limit, add ellipsis
- [ ] **Task 3.2:** Refactor BlogFeaturedBlock with layout switch
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Add layout routing, extract common post data prep
- [ ] **Task 3.3:** Implement Split layout (refactor existing)
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Enhance existing layout with full content support
- [ ] **Task 3.4:** Implement Stacked layout
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Image on top, content below, full width
- [ ] **Task 3.5:** Implement Hero layout
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Full-width background image, configurable overlay, centered content
- [ ] **Task 3.6:** Implement Minimal layout
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: No image, clean text-focused layout
- [ ] **Task 3.7:** Add "Read more..." link styling
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Subtle link style, different from CTA buttons
- [ ] **Task 3.8:** Add category badge rendering
  - Files: `components/render/blocks/BlogFeaturedBlock.tsx`
  - Details: Show category pill when enabled and category exists

### Phase 4: Preview Updates
**Goal:** Update preview placeholder

- [ ] **Task 4.1:** Update PreviewBlockRenderer placeholder
  - Files: `components/render/PreviewBlockRenderer.tsx`
  - Details: Show selected layout type in placeholder text

### Phase 5: Testing & Validation
**Goal:** Verify all layouts work correctly

- [ ] **Task 5.1:** Test all 4 layouts with published posts
- [ ] **Task 5.2:** Test content truncation at various limits
- [ ] **Task 5.3:** Test hero overlay color/opacity combinations
- [ ] **Task 5.4:** Test responsive behavior on mobile/tablet/desktop
- [ ] **Task 5.5:** Verify theme variable application across layouts

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes)

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `lib/section-types.ts` - Add layout type, expand interface
- [ ] `lib/section-defaults.ts` - Add defaults for new properties
- [ ] `components/editor/BlogFeaturedEditor.tsx` - Add all editor controls
- [ ] `components/render/blocks/BlogFeaturedBlock.tsx` - Implement 4 layouts
- [ ] `components/render/PreviewBlockRenderer.tsx` - Update placeholder

### Potential New Files
- [ ] `lib/html-utils.ts` - HTML truncation utility (optional, could be inline)

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Edge Case 1:** Post with no featured image in hero layout
  - **Analysis:** Hero layout needs fallback background color
  - **Decision:** Use solid theme color background (e.g., theme primary or muted) when no image
- [ ] **Edge Case 2:** Very short post content with high character limit
  - **Analysis:** Should not show "read more" if content is under limit
  - **Recommendation:** Only show "read more" when content was actually truncated
- [ ] **Edge Case 3:** HTML truncation breaking mid-tag
  - **Analysis:** Naive character truncation could produce invalid HTML
  - **Decision:** Strip HTML tags first, truncate plain text (simpler, avoids broken tags)
- [ ] **Edge Case 4:** Post with no category when showCategory is true
  - **Analysis:** Should gracefully hide badge, not show empty pill
  - **Recommendation:** Conditional rendering based on category existence

### Security Considerations
- [ ] **HTML Injection:** Post content is already sanitized by TiptapEditor, no additional risk
- [ ] **Overlay Color Input:** Validate hex color format to prevent CSS injection

---

## 15. Deployment & Configuration

No new environment variables or deployment changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard workflow from the task template:
1. Update data models first (Phase 1)
2. Build editor controls (Phase 2)
3. Implement layouts (Phase 3)
4. Update preview (Phase 4)
5. Test thoroughly (Phase 5)

### Code Quality Standards
- Use early returns for edge cases
- Keep layout components focused and readable
- Use theme CSS variables consistently
- Ensure responsive design with Tailwind breakpoints

---

## 17. Notes & Additional Context

### Layout Visual Reference

**Split Layout (Current):**
```
┌─────────────────────────────────────────┐
│  ┌──────────┐  Title                    │
│  │  Image   │  Excerpt or full content  │
│  │          │  Author • Date            │
│  └──────────┘  [Category]               │
└─────────────────────────────────────────┘
```

**Stacked Layout:**
```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │
│  │          Image                  │    │
│  └─────────────────────────────────┘    │
│  Title                                  │
│  Excerpt or full content...             │
│  Author • Date  [Category]              │
└─────────────────────────────────────────┘
```

**Hero Layout:**
```
┌─────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░  Title  ░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░  Excerpt or content  ░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────────┘
  (Background image with color overlay)
```

**Minimal Layout:**
```
┌─────────────────────────────────────────┐
│  Title                                  │
│  Full content rendered as prose...      │
│  ...multiple paragraphs possible...     │
│  Author • Date  [Category]              │
└─────────────────────────────────────────┘
```

### User Feedback Summary
1. All 4 layouts needed (though uncertain about hero with background)
2. Hero needs opacity/color controls due to unpredictable background images
3. Character count truncation preferred
4. Ellipsis or "read more." link at truncation
5. Category badge flexible, just needs toggle
6. "Read More" button should be different from CTA (more subtle)
7. Plan scope confirmed as good

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [ ] **Existing blog_featured sections:** Will receive new default values. No breaking changes - old format (`{ postId }`) is subset of new format.

#### Ripple Effects Assessment
- [ ] **PreviewBlockRenderer:** Minor update to show layout type - low impact
- [ ] **No database changes:** No migration needed

#### Performance Implications
- [ ] **No additional queries:** Post data already fetched
- [ ] **Bundle size:** Minimal increase (~5KB) from additional editor controls

### Risk Assessment
**Overall Risk: Low**
- No database changes
- No breaking API changes
- Additive feature enhancement
- Existing functionality preserved with defaults

---

*Template Version: 1.0*
*Created: 2025-12-29*
*Status: Ready for Review*
*Priority: P2 - Medium*
