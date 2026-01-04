# Task 058: Social Links (Settings + Header/Footer/Block)

## 1. Task Overview

### Task Title
**Title:** Social Links - Site-Level Configuration with Header/Footer Integration and Standalone Block

### Goal Statement
**Goal:** Allow site owners to configure social media links once in Settings, display them in header/footer with brand-colored icons, and optionally use a standalone "Social Links" block anywhere on the page. Users can reorder their social links via drag-and-drop, and choose between brand colors (default), monochrome, or theme primary color styles.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
This is a straightforward feature with a clear implementation path. Strategic analysis is **not required** as the approach is well-defined in the backlog.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Key Patterns:** Site-level JSONB columns for configuration (header_content, footer_content already exist)

### Current State
- Sites have `header_content` and `footer_content` JSONB columns for global configuration
- SettingsTab provides comprehensive site settings management
- dnd-kit is already used for drag-and-drop reordering (PagesList)
- No social link configuration currently exists
- Footer renders links but not social icons
- Header has nav links and CTA but no social icons

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- [x] `lib/drizzle/schema/sites.ts` - Site schema with JSONB columns
- [x] `lib/section-types.ts` - Content interfaces for header/footer
- [x] `components/sites/SettingsTab.tsx` - Settings UI pattern
- [x] `components/render/blocks/HeaderBlock.tsx` - Header renderer
- [x] `components/render/blocks/FooterBlock.tsx` - Footer renderer
- [x] `components/pages/PagesList.tsx` - dnd-kit reordering pattern

---

## 4. Context & Problem Definition

### Problem Statement
Users have no way to add social media links to their sites. This is a fundamental expectation for professional websites. Currently users would have to manually add social icons/links in footer content or create custom solutions.

### Success Criteria
- [ ] Users can configure social links in Settings with platform and URL
- [ ] Users can reorder social links via drag-and-drop
- [ ] Users can choose icon style: Brand Colors (default), Monochrome, or Theme Primary
- [ ] Social icons display in header (optional toggle)
- [ ] Social icons display in footer (optional toggle)
- [ ] New "Social Links" block available for standalone placement
- [ ] Brand colors render correctly for all supported platforms
- [ ] Links open in new tab with proper rel attributes

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- User can add/edit/remove social links in Settings
- User can reorder social links via drag-and-drop
- User can select icon color style (Brand Colors, Monochrome, Theme Primary)
- User can toggle social icons visibility in header
- User can toggle social icons visibility in footer
- User can add a standalone "Social Links" block to any page
- System renders brand-colored SVG icons for supported platforms

### Supported Platforms
1. Facebook
2. Instagram
3. X (Twitter)
4. LinkedIn
5. YouTube
6. TikTok
7. Threads
8. Pinterest
9. GitHub
10. Discord
11. Snapchat
12. WhatsApp
13. Telegram
14. Twitch
15. Website (custom link)

### Non-Functional Requirements
- **Performance:** Icons render as inline SVG (no external requests)
- **Responsive Design:** Icons scale appropriately on mobile
- **Accessibility:** Proper aria-labels for screen readers, links have descriptive titles

### Technical Constraints
- Must use existing dnd-kit for reordering
- Must follow existing JSONB pattern for site configuration
- Icons must be inline SVG (not external images) for brand color support

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- Add social_links JSONB column to sites table
ALTER TABLE sites ADD COLUMN social_links jsonb;
-- Add social_icon_style column to sites table
ALTER TABLE sites ADD COLUMN social_icon_style text DEFAULT 'brand';
-- Add header/footer toggle options to existing content columns (handled in JSONB)
```

### Data Model Updates

```typescript
// lib/drizzle/schema/sites.ts
export const SOCIAL_ICON_STYLES = ["brand", "monochrome", "primary"] as const;
export type SocialIconStyle = (typeof SOCIAL_ICON_STYLES)[number];

// Add to sites table
social_links: jsonb("social_links").$type<SocialLink[]>(),
social_icon_style: text("social_icon_style", { enum: SOCIAL_ICON_STYLES }).default("brand"),

// lib/section-types.ts - New types
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "x"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "threads"
  | "pinterest"
  | "github"
  | "discord"
  | "snapchat"
  | "whatsapp"
  | "telegram"
  | "twitch"
  | "website";

// Add to HeaderContent
export interface HeaderContent {
  // ... existing fields
  showSocialLinks?: boolean;
  socialLinksPosition?: "left" | "right"; // Position relative to nav (default: right)
  socialLinksSize?: "small" | "medium" | "large"; // Icon size for header
}

// Add to FooterContent
export interface FooterContent {
  // ... existing fields
  showSocialLinks?: boolean;
  socialLinksPosition?: "above" | "below"; // Position relative to links/copyright (default: above)
  socialLinksSize?: "small" | "medium" | "large"; // Icon size for footer
}

// New block content type
export interface SocialLinksContent {
  alignment?: "left" | "center" | "right";
  size?: "small" | "medium" | "large";

  // Icon style override (if not set, uses site-level style)
  iconStyle?: SocialIconStyle;

  // Master styling toggle - follows same pattern as other blocks
  enableStyling?: boolean;

  // Text/icon color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Section background & overlay
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}
```

### Data Migration Plan
- [ ] Generate migration for new columns
- [ ] Create down migration before applying
- [ ] Apply migration

---

## 8. Backend Changes

### Server Actions

```typescript
// app/actions/sites.ts - Update updateSiteSettings
- [ ] Handle socialLinks array in updateSiteSettings
- [ ] Handle socialIconStyle in updateSiteSettings
```

### No API Routes Needed
All operations handled via existing Server Actions pattern.

---

## 9. Frontend Changes

### New Components

#### `lib/social-icons.tsx`
- SVG icon components for all 15 platforms
- Brand color constants
- `getSocialIcon(platform, style)` function

#### `components/sites/SocialLinksManager.tsx`
- Drag-and-drop list of social links
- Add new link button with platform selector
- URL input for each link
- Delete button for each link
- Reorder via dnd-kit

#### `components/render/SocialIconsRow.tsx`
- Renders a row of social icons
- Supports all three style modes
- Used by HeaderBlock, FooterBlock, and SocialLinksBlock

#### `components/render/blocks/SocialLinksBlock.tsx`
- Standalone block for social links
- Alignment options (left/center/right)
- Size options (small/medium/large)

#### `components/editor/blocks/SocialLinksEditor.tsx`
- Editor for standalone Social Links block
- Alignment and size controls

### Page Updates
- [ ] `components/sites/SettingsTab.tsx` - Add Social Links card
- [ ] `components/render/blocks/HeaderBlock.tsx` - Integrate social icons
- [ ] `components/render/blocks/FooterBlock.tsx` - Integrate social icons
- [ ] `components/editor/blocks/HeaderEditor.tsx` - Add social links toggle
- [ ] `components/editor/blocks/FooterEditor.tsx` - Add social links toggle

### New Block Type Registration
- [ ] `lib/drizzle/schema/sections.ts` - Add "social_links" to BLOCK_TYPES
- [ ] `lib/section-types.ts` - Add SocialLinksContent to union types
- [ ] `lib/section-defaults.ts` - Add social_links defaults
- [ ] `lib/section-templates.ts` - Add social_links templates
- [ ] `components/editor/BlockIcon.tsx` - Add icon
- [ ] `components/editor/SectionEditor.tsx` - Add routing
- [ ] `components/render/BlockRenderer.tsx` - Add routing

---

## 10. Code Changes Overview

### Brand Colors Reference

```typescript
export const SOCIAL_BRAND_COLORS: Record<SocialPlatform, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F", // Gradient simplified to main color
  x: "#000000",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  tiktok: "#000000",
  threads: "#000000",
  pinterest: "#E60023",
  github: "#181717",
  discord: "#5865F2",
  snapchat: "#FFFC00",
  whatsapp: "#25D366",
  telegram: "#26A5E4",
  twitch: "#9146FF",
  website: "#6B7280", // Gray for custom website
};
```

### Settings UI Structure

```
┌─────────────────────────────────────────────────┐
│ Social Links                                    │
│ Add social media links to your site             │
├─────────────────────────────────────────────────┤
│ Icon Style: [Brand Colors ▼]                    │
│                                                 │
│ ┌───────────────────────────────────────────┐   │
│ │ ☰ [fb] Facebook    https://facebook...  🗑️ │   │
│ │ ☰ [ig] Instagram   https://instagr...   🗑️ │   │
│ │ ☰ [X]  X           https://x.com/...    🗑️ │   │
│ └───────────────────────────────────────────┘   │
│                                                 │
│ [+ Add Social Link]                             │
└─────────────────────────────────────────────────┘
```

---

## 11. Implementation Plan

### Phase 1: Database Schema
**Goal:** Add social links storage to sites table

- [ ] **Task 1.1:** Update sites schema with new columns
  - Files: `lib/drizzle/schema/sites.ts`
  - Details: Add `social_links` JSONB and `social_icon_style` enum
- [ ] **Task 1.2:** Generate database migration
  - Command: `npm run db:generate`
- [ ] **Task 1.3:** Create down migration
  - Files: `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Task 1.4:** Apply migration
  - Command: `npm run db:migrate`

### Phase 2: Social Icons Library
**Goal:** Create reusable social icon components

- [ ] **Task 2.1:** Create social icons library
  - Files: `lib/social-icons.tsx`
  - Details: SVG components for all 15 platforms, brand colors, icon getter function
- [ ] **Task 2.2:** Create SocialIconsRow renderer
  - Files: `components/render/SocialIconsRow.tsx`
  - Details: Reusable row component for header/footer/block

### Phase 3: Settings Integration
**Goal:** Add social links management to Settings

- [ ] **Task 3.1:** Create SocialLinksManager component
  - Files: `components/sites/SocialLinksManager.tsx`
  - Details: Drag-and-drop list with add/edit/delete
- [ ] **Task 3.2:** Update SettingsTab with Social Links card
  - Files: `components/sites/SettingsTab.tsx`
  - Details: Add card with style selector and SocialLinksManager
- [ ] **Task 3.3:** Update updateSiteSettings action
  - Files: `app/actions/sites.ts`
  - Details: Handle socialLinks and socialIconStyle

### Phase 4: Header/Footer Integration
**Goal:** Display social icons in header and footer

- [ ] **Task 4.1:** Update HeaderContent type
  - Files: `lib/section-types.ts`
  - Details: Add showSocialLinks and socialLinksPosition fields
- [ ] **Task 4.2:** Update FooterContent type
  - Files: `lib/section-types.ts`
  - Details: Add showSocialLinks field
- [ ] **Task 4.3:** Update HeaderBlock renderer
  - Files: `components/render/blocks/HeaderBlock.tsx`
  - Details: Render SocialIconsRow when enabled
- [ ] **Task 4.4:** Update FooterBlock renderer
  - Files: `components/render/blocks/FooterBlock.tsx`
  - Details: Render SocialIconsRow when enabled
- [ ] **Task 4.5:** Update HeaderEditor
  - Files: `components/editor/blocks/HeaderEditor.tsx`
  - Details: Add toggle, position selector (left/right), and size selector
- [ ] **Task 4.6:** Update FooterEditor
  - Files: `components/editor/blocks/FooterEditor.tsx`
  - Details: Add toggle, position selector (above/below), and size selector

### Phase 5: Social Links Block
**Goal:** Create standalone Social Links block type

- [ ] **Task 5.1:** Add block type to schema
  - Files: `lib/drizzle/schema/sections.ts`
  - Details: Add "social_links" to BLOCK_TYPES
- [ ] **Task 5.2:** Add content types
  - Files: `lib/section-types.ts`
  - Details: Add SocialLinksContent interface and to union types
- [ ] **Task 5.3:** Add defaults
  - Files: `lib/section-defaults.ts`
  - Details: Add social_links defaults
- [ ] **Task 5.4:** Add templates
  - Files: `lib/section-templates.ts`
  - Details: Add social_links templates (Centered, Left-aligned)
- [ ] **Task 5.5:** Add block icon
  - Files: `components/editor/BlockIcon.tsx`
  - Details: Add Share2 icon for social_links
- [ ] **Task 5.6:** Create SocialLinksEditor
  - Files: `components/editor/blocks/SocialLinksEditor.tsx`
  - Details: Alignment, size, icon style override, and full styling options (border, background, overlay)
- [ ] **Task 5.7:** Create SocialLinksBlock renderer
  - Files: `components/render/blocks/SocialLinksBlock.tsx`
  - Details: Render social icons with block-specific options
- [ ] **Task 5.8:** Wire up editor routing
  - Files: `components/editor/SectionEditor.tsx`
  - Details: Add SocialLinksEditor case
- [ ] **Task 5.9:** Wire up renderer routing
  - Files: `components/render/BlockRenderer.tsx`
  - Details: Add SocialLinksBlock case

### Phase 6: Testing & Verification
**Goal:** Verify all functionality works correctly

- [ ] **Task 6.1:** Test Settings configuration
  - Details: Add/edit/delete/reorder social links
- [ ] **Task 6.2:** Test Header integration
  - Details: Toggle visibility, verify icons render
- [ ] **Task 6.3:** Test Footer integration
  - Details: Toggle visibility, verify icons render
- [ ] **Task 6.4:** Test standalone block
  - Details: Add block, configure alignment/size
- [ ] **Task 6.5:** Test all icon styles
  - Details: Brand, Monochrome, Primary color modes

---

## 12. Task Completion Tracking

*Will be updated as tasks are completed*

---

## 13. File Structure & Organization

### New Files to Create
```
lib/
  social-icons.tsx                    # SVG icons and brand colors

components/
  sites/
    SocialLinksManager.tsx            # Settings drag-and-drop manager
  render/
    SocialIconsRow.tsx                # Reusable icons row
    blocks/
      SocialLinksBlock.tsx            # Block renderer
  editor/
    blocks/
      SocialLinksEditor.tsx           # Block editor
```

### Files to Modify
- `lib/drizzle/schema/sites.ts` - Add columns
- `lib/section-types.ts` - Add types
- `lib/section-defaults.ts` - Add defaults
- `lib/section-templates.ts` - Add templates
- `lib/drizzle/schema/sections.ts` - Add block type
- `app/actions/sites.ts` - Handle new fields
- `components/sites/SettingsTab.tsx` - Add Social Links card
- `components/render/blocks/HeaderBlock.tsx` - Integrate icons
- `components/render/blocks/FooterBlock.tsx` - Integrate icons
- `components/editor/blocks/HeaderEditor.tsx` - Add controls
- `components/editor/blocks/FooterEditor.tsx` - Add controls
- `components/editor/BlockIcon.tsx` - Add icon
- `components/editor/SectionEditor.tsx` - Add routing
- `components/render/BlockRenderer.tsx` - Add routing

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty social links:** Should not render icons row when no links configured
- [ ] **Invalid URLs:** Validate URL format before saving
- [ ] **Platform duplicates:** Allow multiple links to same platform? (Yes - some users have multiple accounts)

### Security Considerations
- [ ] **URL validation:** Validate URLs are properly formatted
- [ ] **XSS prevention:** URLs should be sanitized (already handled by React)
- [ ] **External links:** All social links open in new tab with `rel="noopener noreferrer"`

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard workflow from the task template:
1. Complete each phase sequentially
2. Update task document after each completed subtask
3. Present phase completion summary
4. Wait for "proceed" before next phase

### Code Quality Standards
- Use inline SVG for icons (no external requests)
- Follow existing dnd-kit pattern from PagesList
- Maintain proper TypeScript types
- Use CSS variables for theme colors

---

## 17. Notes & Additional Context

### Design Decisions
- **Site-level configuration:** Social links are configured once and shared across header/footer/blocks
- **Site-level icon style:** Default icon style (brand/monochrome/primary) set in Settings
- **Block override option:** Standalone block can override icon style for specific use cases
- **Brand colors default:** Most users will want recognizable brand colors
- **Per-section size control:** Header, Footer, and Block each have their own size settings
- **Header position options:** Left or Right (default: right)
- **Footer position options:** Above or Below existing content (default: above)
- **Block full styling:** Standalone block supports all standard styling options (border, background, overlay) like other blocks

### Platform Icon Sources
Icons will be simple path-based SVGs. The design follows common social icon conventions.

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

**Breaking Changes:** None - new additive feature

**Ripple Effects:**
- HeaderContent and FooterContent types are extended (backwards compatible with optional fields)
- New block type registered (no impact on existing blocks)

**Performance:** Minimal - inline SVG icons add ~2-3KB to page
**Security:** Standard external link handling

### Critical Issues: None identified

---

*Task Document Created: 2026-01-03*
*Backlog Item: #45*
