# Task 040: Embed Block

> **Status:** Ready for Implementation
> **Created:** 2025-12-30
> **Backlog Item:** #25 - Embed Block

---

## 1. Task Overview

### Task Title
**Title:** Add Embed Block for Third-Party Content (Google Maps, YouTube, etc.)

### Goal Statement
**Goal:** Enable site owners to embed third-party content (Google Maps, YouTube videos, Vimeo, etc.) into their pages using a secure allowlist-based iframe approach. This is critical for local business SEO (Google Maps) and content embedding (YouTube videos).

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis Not Required
This is a straightforward implementation with a clear, user-specified approach:
- **Iframe only** - paste iframe embed code from third-party services
- **Allowlist approach** - only permit known, trusted domains
- No ambiguity in requirements

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Block System:** 12 existing block types defined in `lib/drizzle/schema/sections.ts`

### Current State
- 12 block types exist: header, hero, text, image, gallery, features, cta, testimonials, contact, footer, blog_featured, blog_grid
- No way to embed external content like Google Maps or YouTube
- Users must link to external content instead of embedding it inline

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- `lib/drizzle/schema/sections.ts` - BLOCK_TYPES array and BlockType enum
- `lib/section-types.ts` - Content interfaces for each block type
- `lib/section-defaults.ts` - Default content for each block type
- `lib/section-templates.ts` - Pre-designed templates for blocks
- `components/editor/blocks/ImageEditor.tsx` - Example editor pattern
- `components/render/blocks/ImageBlock.tsx` - Example renderer pattern
- `components/render/BlockRenderer.tsx` - Block routing logic
- `components/editor/SectionEditor.tsx` - Editor routing logic

---

## 4. Context & Problem Definition

### Problem Statement
Site owners cannot embed third-party content like Google Maps (critical for local business SEO), YouTube videos, Vimeo videos, or other iframe-based widgets. They must currently link to external content, which provides a poor user experience and hurts SEO for location-based businesses.

### Success Criteria
- [ ] New "embed" block type available in section picker
- [ ] User can paste iframe embed code from supported services
- [ ] Allowlist validation rejects iframes from untrusted domains
- [ ] Clear error message when domain is not allowed
- [ ] Supported services: YouTube, Vimeo, Google Maps, Spotify, SoundCloud
- [ ] Embed displays correctly on published sites
- [ ] Responsive container with configurable aspect ratio
- [ ] Preview works in editor

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - new block type, no existing data
- **Priority: Speed and simplicity** over edge case handling

---

## 6. Technical Requirements

### Functional Requirements
- User can add an "Embed" section to any page
- User pastes iframe embed code (e.g., from YouTube "Share > Embed" or Google Maps "Share > Embed a map")
- System validates the iframe src domain against allowlist
- System extracts and sanitizes iframe attributes (src, width, height, allow, allowfullscreen)
- Embed displays in a responsive container
- User can select aspect ratio: 16:9 (video), 4:3, 1:1, or custom height

### Non-Functional Requirements
- **Security:** Only allow iframes from trusted domains (allowlist)
- **Performance:** No impact on page load (iframes load lazily)
- **Usability:** Clear feedback when paste fails validation
- **Responsive Design:** Embed scales to container width

### Technical Constraints
- Must use existing block type system
- Must follow existing editor/renderer patterns
- No external dependencies for iframe parsing (use regex/DOM parsing)

---

## 7. Data & Database Changes

### Database Schema Changes
No migration required - just adding a new value to the BLOCK_TYPES array (handled in TypeScript, not DB enum).

### Data Model Updates

**Add to `lib/drizzle/schema/sections.ts`:**
```typescript
export const BLOCK_TYPES = [
  // ... existing types
  "embed",  // New block type
] as const;
```

**Add to `lib/section-types.ts`:**
```typescript
export type EmbedAspectRatio = "16:9" | "4:3" | "1:1" | "custom";

export interface EmbedContent {
  embedCode: string;        // Raw iframe HTML pasted by user
  src: string;              // Extracted/validated iframe src
  aspectRatio: EmbedAspectRatio;
  customHeight?: number;    // Height in pixels (when aspectRatio is "custom")
  title?: string;           // Optional title for accessibility
}
```

---

## 8. Backend Changes & Background Jobs

### Server Actions
No new server actions required - uses existing `updateSection` action.

### New Utility: `lib/embed-utils.ts`
```typescript
// Allowlist of trusted embed domains
export const ALLOWED_EMBED_DOMAINS = [
  // YouTube
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",

  // Vimeo
  "player.vimeo.com",

  // Google Maps
  "google.com",
  "www.google.com",
  "maps.google.com",

  // Spotify
  "open.spotify.com",

  // SoundCloud
  "w.soundcloud.com",
];

export interface ParsedEmbed {
  src: string;
  width?: string;
  height?: string;
  allow?: string;
  allowFullscreen?: boolean;
  title?: string;
}

// Parse iframe HTML and extract attributes
export function parseIframeCode(html: string): ParsedEmbed | null;

// Validate that src domain is in allowlist
export function isAllowedDomain(src: string): boolean;

// Validate and sanitize embed code
export function validateEmbedCode(html: string): {
  valid: boolean;
  parsed?: ParsedEmbed;
  error?: string;
};
```

---

## 9. Frontend Changes

### New Components

**`components/editor/blocks/EmbedEditor.tsx`**
- Textarea for pasting iframe embed code
- Real-time validation with error display
- Aspect ratio selector (16:9, 4:3, 1:1, Custom)
- Custom height input (shown when "Custom" selected)
- Preview of the embed in editor
- Help text with supported services list

**`components/render/blocks/EmbedBlock.tsx`**
- Responsive iframe container
- Aspect ratio handling via CSS
- Lazy loading attribute
- Accessibility title

### File Modifications

**`lib/drizzle/schema/sections.ts`:**
- Add "embed" to BLOCK_TYPES array

**`lib/section-types.ts`:**
- Add EmbedAspectRatio type
- Add EmbedContent interface
- Add to SectionContent union
- Add to ContentTypeMap
- Add to BLOCK_TYPE_INFO array

**`lib/section-defaults.ts`:**
- Add default content for embed block

**`lib/section-templates.ts`:**
- Add templates: "Google Maps", "YouTube Video", "Blank"

**`components/render/BlockRenderer.tsx`:**
- Add case for "embed" block type

**`components/editor/SectionEditor.tsx`:**
- Add case for "embed" block type

---

## 10. Code Changes Overview

### Current Implementation (Before)

**`lib/drizzle/schema/sections.ts`:**
```typescript
export const BLOCK_TYPES = [
  "header",
  "hero",
  "text",
  "image",
  "gallery",
  "features",
  "cta",
  "testimonials",
  "contact",
  "footer",
  "blog_featured",
  "blog_grid",
] as const;
```

### After Implementation

**`lib/drizzle/schema/sections.ts`:**
```typescript
export const BLOCK_TYPES = [
  "header",
  "hero",
  "text",
  "image",
  "gallery",
  "features",
  "cta",
  "testimonials",
  "contact",
  "footer",
  "blog_featured",
  "blog_grid",
  "embed",  // NEW
] as const;
```

### Key Changes Summary
- [ ] **Add "embed" to BLOCK_TYPES** - Enable new block type
- [ ] **Create EmbedContent interface** - Define content structure
- [ ] **Create embed-utils.ts** - Allowlist validation and iframe parsing
- [ ] **Create EmbedEditor.tsx** - Editor component with paste & validation
- [ ] **Create EmbedBlock.tsx** - Renderer with responsive iframe
- [ ] **Update BlockRenderer.tsx** - Route to EmbedBlock
- [ ] **Update SectionEditor.tsx** - Route to EmbedEditor
- [ ] **Add templates** - Google Maps, YouTube, Blank

---

## 11. Implementation Plan

### Phase 1: Core Types & Utilities
**Goal:** Define types and create validation utilities

- [ ] **Task 1.1:** Add "embed" to BLOCK_TYPES in `lib/drizzle/schema/sections.ts`
- [ ] **Task 1.2:** Add EmbedContent interface and types to `lib/section-types.ts`
- [ ] **Task 1.3:** Add default content in `lib/section-defaults.ts`
- [ ] **Task 1.4:** Create `lib/embed-utils.ts` with allowlist and parsing functions

### Phase 2: Editor Component
**Goal:** Create the embed editor with validation

- [ ] **Task 2.1:** Create `components/editor/blocks/EmbedEditor.tsx`
  - Textarea for pasting iframe code
  - Real-time validation display
  - Aspect ratio selector
  - Custom height input
  - Inline preview
- [ ] **Task 2.2:** Update `components/editor/SectionEditor.tsx` to route to EmbedEditor

### Phase 3: Renderer Component
**Goal:** Create the published site renderer

- [ ] **Task 3.1:** Create `components/render/blocks/EmbedBlock.tsx`
  - Responsive iframe container
  - Aspect ratio CSS handling
  - Lazy loading
- [ ] **Task 3.2:** Update `components/render/BlockRenderer.tsx` to route to EmbedBlock

### Phase 4: Templates
**Goal:** Add pre-configured templates

- [ ] **Task 4.1:** Add embed templates to `lib/section-templates.ts`
  - Google Maps template
  - YouTube Video template
  - Blank template

### Phase 5: Testing & Validation
**Goal:** Verify implementation works correctly

- [ ] **Task 5.1:** Test adding embed block in editor
- [ ] **Task 5.2:** Test pasting valid YouTube embed code
- [ ] **Task 5.3:** Test pasting valid Google Maps embed code
- [ ] **Task 5.4:** Test pasting invalid/disallowed domain (should error)
- [ ] **Task 5.5:** Test embed displays on published site
- [ ] **Task 5.6:** Test aspect ratio options

---

## 12. Allowed Embed Domains

The following domains will be permitted in the allowlist:

| Service | Domains |
|---------|---------|
| YouTube | `youtube.com`, `www.youtube.com`, `youtube-nocookie.com`, `www.youtube-nocookie.com` |
| Vimeo | `player.vimeo.com` |
| Google Maps | `google.com`, `www.google.com`, `maps.google.com` |
| Spotify | `open.spotify.com` |
| SoundCloud | `w.soundcloud.com` |

**Future expansion:** Additional domains can be added to the allowlist as needed.

---

## 13. File Structure

### New Files to Create
```
lib/
  embed-utils.ts                    # Allowlist validation, iframe parsing

components/
  editor/blocks/
    EmbedEditor.tsx                 # Editor component
  render/blocks/
    EmbedBlock.tsx                  # Renderer component
```

### Files to Modify
```
lib/drizzle/schema/sections.ts      # Add "embed" to BLOCK_TYPES
lib/section-types.ts                # Add EmbedContent, types, BLOCK_TYPE_INFO
lib/section-defaults.ts             # Add embed defaults
lib/section-templates.ts            # Add embed templates
components/render/BlockRenderer.tsx # Add embed case
components/editor/SectionEditor.tsx # Add embed case
```

---

## 14. Potential Issues & Security Review

### Security Considerations
- [ ] **Allowlist validation:** Strictly validate iframe src against domain allowlist
- [ ] **XSS prevention:** Never render raw HTML; extract only safe attributes
- [ ] **No `javascript:` URLs:** Reject any src with javascript: protocol
- [ ] **Sandbox attribute:** Consider adding sandbox attribute to iframes

### Edge Cases
- [ ] **Empty embed code:** Show helpful placeholder
- [ ] **Malformed HTML:** Graceful error message
- [ ] **Multiple iframes in paste:** Extract only the first iframe
- [ ] **URL without iframe wrapper:** Reject (require full iframe tag)

---

## 15. AI Agent Instructions

### Implementation Notes
- Follow existing editor/renderer patterns exactly
- Use `cn()` utility for conditional classes
- Follow responsive design patterns from other blocks
- Test with actual embed codes from YouTube and Google Maps

### Validation Priority
1. Security first - never allow untrusted domains
2. User feedback - clear error messages
3. Graceful degradation - show placeholder if embed fails

---

## 16. Notes & Additional Context

### How Users Will Use This

1. Go to YouTube/Google Maps/etc.
2. Click "Share" → "Embed" → Copy iframe code
3. Add "Embed" section in Site Engine
4. Paste the iframe code
5. System validates and displays preview
6. Save and publish

### Example Embed Codes

**YouTube:**
```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
```

**Google Maps:**
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
```

---

*Task Version: 1.0*
*Created: 2025-12-30*
