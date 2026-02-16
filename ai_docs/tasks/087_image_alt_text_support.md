# Task 087: Image Alt Text Support

> **Backlog Reference:** Feature #89 - Image Alt Text Support

---

## 1. Task Overview

### Task Title
**Title:** Add Image Alt Text Support Across All Image Surfaces

### Goal Statement
**Goal:** Ensure every image in the system — uploaded images, blog featured images, cards block images, and all rendered blocks — has proper alt text support for accessibility (screen readers) and SEO (search engine image indexing). Alt text will be stored at the database level on the `images` table for reuse, and also at the block/content level for per-use overrides.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Alt text is partially implemented in the codebase. Media, Hero, and legacy Image blocks already have alt text fields. However, several important surfaces are missing alt text entirely: blog featured images, Cards block (testimonial avatars + product images), the images database table, and the image upload/picker UI.

### Recommendation & Rationale

**Approved Strategy: Database + Block Level Alt Text**

1. **Database level** — Add `alt_text` column to `images` table so every uploaded image can have reusable alt text
2. **Block level** — Keep existing per-block alt fields and add missing ones. When inserting an image from the library, pre-fill alt text from the database record but allow per-block override
3. **Blog level** — Add `featured_image_alt` column to `blog_posts` table

This approach maximizes accessibility coverage while keeping flexibility for context-specific alt text.

---

## 3. Project Analysis & Current State

### Current State

**Already has alt text support:**
| Block/Surface | Alt Field | Editor Input | Renderer Uses It |
|--------------|-----------|-------------|-----------------|
| Media block (single) | `alt?: string` | Yes (MediaEditor.tsx:704) | Yes (MediaBlock.tsx:166) |
| Media block (gallery) | `GalleryImage.alt` | Yes (MediaEditor.tsx:1175) | Yes (GalleryGrid.tsx:94) |
| Hero Primitive | `imageAlt?: string` | Yes (HeroPrimitiveEditor.tsx:451) | Yes (HeroPrimitiveBlock.tsx:144) |
| Legacy Image block | `alt: string` | Yes (ImageEditor.tsx:118) | Yes |

**Missing alt text support:**
| Block/Surface | Image Field | Current Alt | Gap |
|--------------|------------|-------------|-----|
| Blog featured image | `featured_image` | None | No DB column, no editor input |
| Cards - Testimonial | `avatar?: string` | Falls back to `item.author` | No alt field in type or editor |
| Cards - Product | `image?: string` | Falls back to `item.title` | No alt field in type or editor |
| Images table | N/A | None | No `alt_text` column |
| Image upload UI | N/A | None | No alt text prompt during upload |
| Header logo | `logoUrl` | Falls back to `siteName` | Acceptable fallback, low priority |

---

## 4. Context & Problem Definition

### Problem Statement
Images without alt text create two significant problems:
1. **Accessibility** — Screen reader users get no description of images, violating WCAG 2.1 Level A (Success Criterion 1.1.1)
2. **SEO** — Search engines cannot index images without alt text, reducing discoverability

### Success Criteria
- [ ] `images` table has `alt_text` column; image upload/edit UI allows setting it
- [ ] `blog_posts` table has `featured_image_alt` column; PostEditor has alt text input
- [ ] `TestimonialCardItem` and `ProductCardItem` types have `imageAlt` field
- [ ] CardsEditor has alt text inputs for testimonial avatars and product images
- [ ] CardsBlock renderer uses alt text from content (with fallback to author/title)
- [ ] Blog renderers use `featured_image_alt` for featured images
- [ ] Image picker pre-fills alt text from images table when inserting

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** — breaking changes acceptable
- **Data loss acceptable** — existing data can be wiped/migrated aggressively
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- User can set alt text when uploading an image to the image library
- User can edit alt text on existing images in the image library
- User can set alt text for blog post featured images
- User can set alt text for testimonial avatar and product images in Cards block
- When inserting an image from the library into a block, alt text pre-fills from the image record
- All published site renderers display proper alt attributes on `<img>` tags

### Non-Functional Requirements
- **Accessibility:** Alt text rendered as HTML `alt` attribute on all `<img>` and `<Image>` tags
- **SEO:** Alt text indexed by search engines for image search
- **Usability:** Alt text fields should be clearly labeled and easy to find in the editor
- **Responsive Design:** Alt text inputs work on mobile editor views

### Technical Constraints
- Must use existing Drizzle ORM migration patterns
- Must follow server/client separation rules
- JSONB content fields in sections table store block-level alt text

---

## 7. Data & Database Changes

### Database Schema Changes

**1. Add `alt_text` to `images` table:**
```sql
ALTER TABLE images ADD COLUMN alt_text text;
```

**2. Add `featured_image_alt` to `blog_posts` table:**
```sql
ALTER TABLE blog_posts ADD COLUMN featured_image_alt text;
```

### Data Model Updates

**`lib/drizzle/schema/images.ts`** — Add `alt_text` column:
```typescript
alt_text: text("alt_text"),
```

**`lib/drizzle/schema/blog-posts.ts`** — Add `featured_image_alt` column:
```typescript
featured_image_alt: text("featured_image_alt"),
```

**`lib/section-types.ts`** — Add `imageAlt` to card item types:
```typescript
interface TestimonialCardItem {
  // ... existing fields
  imageAlt?: string;
}

interface ProductCardItem {
  // ... existing fields
  imageAlt?: string;
}
```

### Down Migration Safety Protocol
- [ ] **Step 1:** Generate migration with `npm run db:generate`
- [ ] **Step 2:** Create down migration following `drizzle_down_migration.md`
- [ ] **Step 3:** Create subdirectory for down.sql
- [ ] **Step 4:** Generate down.sql (DROP COLUMN IF EXISTS for both columns)
- [ ] **Step 5:** Verify safety
- [ ] **Step 6:** Apply migration with `npm run db:migrate`

---

## 8. Backend Changes & Background Jobs

### Server Actions

**`app/actions/storage.ts`** — Modify:
- [ ] `updateImageAltText(imageId: string, altText: string)` — New action to update alt text on an image record
- [ ] Update `uploadImage` to accept optional `altText` parameter

**`app/actions/blog.ts`** — Modify:
- [ ] Update `createBlogPost` / `updateBlogPost` to handle `featured_image_alt` field

### Database Queries
- [ ] Update image queries to include `alt_text` field
- [ ] Update blog post queries to include `featured_image_alt` field

No Trigger.dev tasks needed — all operations are fast synchronous DB updates.

---

## 9. Frontend Changes

### Components to Modify

**1. `components/editor/blocks/CardsEditor.tsx`**
- Add alt text input for testimonial avatar images
- Add alt text input for product card images
- Wire up `imageAlt` field in content updates

**2. `components/blog/PostEditor.tsx`**
- Add alt text input below featured image picker
- Save/load `featured_image_alt` from blog post record

**3. `components/render/blocks/CardsBlock.tsx`**
- Use `item.imageAlt` for testimonial avatar `alt` attribute (fallback to `item.author`)
- Use `item.imageAlt` for product image `alt` attribute (fallback to `item.title`)

**4. `components/render/blog/BlogPostImage.tsx`**
- Ensure `alt` prop is properly used (already accepts it)

**5. `components/render/blog/BlogFeaturedBlock.tsx` / `BlogGridBlock.tsx`**
- Pass `featured_image_alt` as alt text to blog post images

**6. Image Library / Image Picker UI**
- Add alt text display/edit in image management
- When selecting an image for a block, return alt text for pre-filling

### State Management
- Alt text stored in block content JSONB (existing pattern)
- Blog alt text stored in blog_posts table column
- Image library alt text stored in images table column

---

## 10. Code Changes Overview

### Key Changes Summary
- [ ] **Database migration:** Add 2 columns (`images.alt_text`, `blog_posts.featured_image_alt`)
- [ ] **Type definitions:** Add `imageAlt` to `TestimonialCardItem` and `ProductCardItem`
- [ ] **CardsEditor:** Add alt text inputs for testimonial avatars and product images
- [ ] **PostEditor:** Add alt text input for featured image
- [ ] **CardsBlock renderer:** Use `imageAlt` with fallbacks
- [ ] **Blog renderers:** Pass `featured_image_alt` to image components
- [ ] **Storage actions:** Add `updateImageAltText` action
- [ ] **Image picker:** Surface alt text from images table

---

## 11. Implementation Plan

### Phase 1: Database Changes
**Goal:** Add alt_text columns to images and blog_posts tables

- [x] **Task 1.1:** Update `lib/drizzle/schema/images.ts` — add `alt_text` column ✓ 2026-02-15
- [x] **Task 1.2:** Update `lib/drizzle/schema/blog-posts.ts` — add `featured_image_alt` column ✓ 2026-02-15
- [x] **Task 1.3:** Generate migration with `npm run db:generate` ✓ 2026-02-15
  - Migration: `drizzle/migrations/0038_tired_steve_rogers.sql`
- [x] **Task 1.4:** Create down migration (MANDATORY) ✓ 2026-02-15
  - File: `drizzle/migrations/0038_tired_steve_rogers/down.sql`
- [x] **Task 1.5:** Apply migration with `npm run db:migrate` ✓ 2026-02-15

### Phase 2: Type Definitions & Server Actions
**Goal:** Update TypeScript types and backend actions

- [x] **Task 2.1:** Update `lib/section-types.ts` — add `avatarAlt` to `TestimonialCardItem`, `imageAlt` to `ProductCardItem` ✓ 2026-02-15
- [x] **Task 2.2:** Update `app/actions/storage.ts` — add `updateImageAltText` action, `altText` to `ImageFile` ✓ 2026-02-15
- [x] **Task 2.3:** Update `app/actions/blog.ts` — handle `featured_image_alt` in `UpdatePostData` and `updatePost` ✓ 2026-02-15
- [x] **Task 2.4:** Blog queries auto-include `featured_image_alt` via `BlogPost` type inference — no changes needed ✓ 2026-02-15

### Phase 3: Editor UI — Cards Block
**Goal:** Add alt text inputs to CardsEditor

- [x] **Task 3.1:** Add alt text input for testimonial avatar images in CardsEditor ✓ 2026-02-15
- [x] **Task 3.2:** Add alt text input for product card images in ProductItemEditorDialog ✓ 2026-02-15
- [x] **Task 3.3:** Fields wired up via existing `onUpdate` / `setEditItem` patterns ✓ 2026-02-15

### Phase 4: Editor UI — Blog Featured Image
**Goal:** Add alt text input to blog post editor

- [x] **Task 4.1:** Add alt text input below featured image in PostEditor ✓ 2026-02-15
- [x] **Task 4.2:** Save/load `featured_image_alt` in blog post form state ✓ 2026-02-15

### Phase 5: Renderers
**Goal:** Ensure all published site renderers use alt text

- [x] **Task 5.1:** Update `CardsBlock.tsx` — use `avatarAlt` for testimonial avatars (fallback to `author`) ✓ 2026-02-15
- [x] **Task 5.2:** Update `CardsBlock.tsx` — use `imageAlt` for product images (fallback to `title`) ✓ 2026-02-15
- [x] **Task 5.3:** Update blog renderers to use `featured_image_alt` with fallback to `title` ✓ 2026-02-15
  - Files: BlogBlock.tsx, BlogFeaturedBlock.tsx, BlogGridBlock.tsx, PublicPostCard.tsx, blog post detail page

### Phase 6: Image Library Alt Text
**Goal:** Surface alt text from images table

- [x] **Task 6.1:** `ImageFile` type now includes `altText` field, `listSiteImages` returns it ✓ 2026-02-15
- [x] **Task 6.2:** ImageLibrary uses `image.altText || image.name` as alt attribute ✓ 2026-02-15
- **Note:** Pre-filling alt text from image record into block editors when selecting from library requires refactoring the `ImageUpload.onChange` interface (currently only passes URL). Deferred as follow-up enhancement.

### Phase 7: Comprehensive Code Review (Mandatory)
**Goal:** Verify all changes and ensure quality

- [x] **Task 7.1:** TypeScript type-check passes with zero errors ✓ 2026-02-15
- [x] **Task 7.2:** ESLint passes with zero errors (7 pre-existing warnings in BlogBlock.tsx) ✓ 2026-02-15

### Phase 8: User Browser Testing
**Goal:** User verifies UI/UX in browser

- [ ] **Task 8.1:** Present testing checklist
- [ ] **Task 8.2:** Wait for user confirmation

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] Get today's date before adding timestamps
- [ ] Update task document after each completed subtask
- [ ] Mark checkboxes as [x] with completion timestamp

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `lib/drizzle/schema/images.ts` — Add `alt_text` column
- [ ] `lib/drizzle/schema/blog-posts.ts` — Add `featured_image_alt` column
- [ ] `lib/section-types.ts` — Add `imageAlt` to card item types
- [ ] `lib/section-defaults.ts` — Add default `imageAlt` values if needed
- [ ] `app/actions/storage.ts` — Add `updateImageAltText` action
- [ ] `app/actions/blog.ts` — Handle `featured_image_alt`
- [ ] `components/editor/blocks/CardsEditor.tsx` — Add alt text inputs
- [ ] `components/blog/PostEditor.tsx` — Add featured image alt text input
- [ ] `components/render/blocks/CardsBlock.tsx` — Use `imageAlt` in rendering
- [ ] `components/render/blog/BlogFeaturedBlock.tsx` — Pass alt text
- [ ] `components/render/blog/BlogGridBlock.tsx` — Pass alt text
- [ ] Image picker/library components — Surface alt text

### No New Dependencies Required

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] **Empty alt text:** Should render `alt=""` (decorative image) vs omitting `alt` (accessibility violation). Decision: always render `alt` attribute, empty string is valid for decorative images.
- [ ] **Existing images:** Old images won't have alt text. Renderers must have sensible fallbacks.
- [ ] **Image reuse:** Same image used in multiple blocks may need different alt text per context.

### Security
- [ ] Alt text input must be sanitized to prevent XSS in rendered HTML
- [ ] Server actions must validate user owns the image before updating alt text

---

## 15. Deployment & Configuration

No new environment variables required. Database migration must be run in production after deployment.

---

## 16. AI Agent Instructions

Follow the standard task template workflow (sections apply as documented in the template).

---

## 17. Notes & Additional Context

### WCAG Reference
- **WCAG 2.1 Success Criterion 1.1.1 (Non-text Content):** All non-text content must have a text alternative that serves the equivalent purpose.
- Alt text should be concise, descriptive, and contextual (not just filename).

### Existing Patterns to Follow
- MediaEditor.tsx alt text input pattern (line 704-714) — use as reference for new alt text inputs
- HeroPrimitiveEditor.tsx alt text pattern (line 451-463) — another good reference

---

*Task Created: 2026-02-15*
