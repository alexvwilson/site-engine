# Task 056: Blog Author Toggle Per-Block

> **Backlog Item:** #43 Blog Author Toggle Per-Block
> **Created:** 2026-01-03
> **Completed:** 2026-01-03
> **Status:** Complete

---

## 1. Task Overview

### Task Title
Per-Block Author Display Toggle for Blog Components

### Goal Statement
Move the "Show Author" setting from site-level to per-block control for BlogGrid and BlogFeatured blocks. Each block independently controls whether author names are displayed, while individual blog post pages continue using the site-level setting.

---

## 2. Current State Analysis

### How It Works Now
- `show_blog_author` is stored in the `sites` table as a boolean (default: true)
- Setting is configured in Settings → Blog Settings
- Flows through: Site → PageRenderer → BlockRenderer → BlogGridBlock/BlogFeaturedBlock
- All blog blocks and post pages use this single global setting

### What's Changing
- BlogGrid and BlogFeatured blocks get independent `showAuthor` settings
- Each block controls its own author display
- Individual post pages (`/blog/[postSlug]`) keep using site.show_blog_author
- Site-level setting UI updated to clarify it only affects post pages

---

## 3. Technical Requirements

### Functional Requirements
- BlogGridEditor has a "Show Author" toggle
- BlogFeaturedEditor has a "Show Author" toggle
- New blocks default to `showAuthor: true`
- Existing blocks without `showAuthor` field default to `true` (backwards compatible)
- Individual blog post pages still respect site.show_blog_author

### Non-Functional Requirements
- **Backwards Compatibility:** Existing blocks without the field show author by default
- **No Database Migration:** All changes are to block content (JSONB), not schema

---

## 4. Implementation Plan

### Phase 1: Type & Default Updates

**Task 1.1:** Update section-types.ts
- Add `showAuthor?: boolean` to `BlogGridContent` interface
- Add `showAuthor?: boolean` to `BlogFeaturedContent` interface

**Task 1.2:** Update section-defaults.ts
- Add `showAuthor: true` to blog_grid defaults
- Add `showAuthor: true` to blog_featured defaults

### Phase 2: Editor UI Updates

**Task 2.1:** Update BlogGridEditor
- Add "Show Author" Switch toggle
- Place after "Show Excerpts" toggle

**Task 2.2:** Update BlogFeaturedEditor
- Add "Show Author" Switch toggle
- Place in "Content Display Options" section

### Phase 3: Block Renderer Updates

**Task 3.1:** Update BlogGridBlock
- Use `content.showAuthor ?? true` instead of `showAuthor` prop
- Remove `showAuthor` prop from interface

**Task 3.2:** Update BlogFeaturedBlock
- Use `content.showAuthor ?? true` instead of `showAuthor` prop
- Remove `showAuthor` prop from interface

### Phase 4: Clean Up Prop Chain

**Task 4.1:** Update BlockRenderer
- Remove `showBlogAuthor` prop from BlogGridBlock call
- Remove `showBlogAuthor` prop from BlogFeaturedBlock call
- Keep prop in interface for now (used by other components)

**Task 4.2:** Update SettingsTab
- Update "Show Author on Posts" label/description to clarify it affects post pages only

### Phase 5: Verification

**Task 5.1:** Type checking - `npm run type-check`
**Task 5.2:** Linting - `npm run lint`

---

## 5. Code Changes Overview

### Files to Modify

| File | Change |
|------|--------|
| `lib/section-types.ts` | Add `showAuthor?: boolean` to BlogGridContent and BlogFeaturedContent |
| `lib/section-defaults.ts` | Add `showAuthor: true` to both defaults |
| `components/editor/BlogGridEditor.tsx` | Add showAuthor toggle |
| `components/editor/BlogFeaturedEditor.tsx` | Add showAuthor toggle |
| `components/render/blocks/BlogGridBlock.tsx` | Use content.showAuthor, remove prop |
| `components/render/blocks/BlogFeaturedBlock.tsx` | Use content.showAuthor, remove prop |
| `components/render/BlockRenderer.tsx` | Remove showAuthor prop from blog block calls |
| `components/sites/SettingsTab.tsx` | Clarify setting scope in UI |

### No New Files Required

---

## 6. Edge Cases

- **Existing blocks without showAuthor:** Default to `true` via nullish coalescing (`??`)
- **New blocks:** Get explicit `showAuthor: true` from defaults
- **Individual post pages:** Continue using site.show_blog_author unchanged

---

## 7. Testing Scenarios

1. New BlogGrid block → should have "Show Author" toggle defaulted to ON
2. New BlogFeatured block → should have "Show Author" toggle defaulted to ON
3. Existing BlogGrid block (no showAuthor) → should display author (backwards compat)
4. Toggle OFF on BlogGrid → author names hidden on that block only
5. Other BlogGrid blocks → unaffected by first block's setting
6. Individual post page → still uses site setting

---

*Task Document Version: 1.0*
*Created: 2026-01-03*
