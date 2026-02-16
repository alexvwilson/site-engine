# Headstring Web - Features Backlog

> Post-MVP feature requests and enhancements, organized by priority.
> When ready to implement, create a task document in `ai_docs/tasks/`.

---

## Priority Tiers

- **P0 - Critical**: Blocking user experience, should do next
- **P1 - High**: Important for usability, do soon
- **P2 - Medium**: Nice to have, improves experience
- **P3 - Low**: Future consideration, backlog items

---

## P0 - Critical (Pre-Launch)

_No P0 items currently_

---

## P1 - High Priority

### 59. Hero Rotating Text Mobile Bounce (Known Limitation)

**Problem:** On mobile devices, the rotating text animation in the Hero block causes the page to bounce up and down. This happens when the rotating text wraps to a second line and then disappears during the animation cycle.

**Root Cause:** The width-based clip animation doesn't reserve vertical space. When width animates to 0 during the "hiding" phase, the line height can collapse, causing content below to shift.

**Attempted Fix (Reverted):** Setting `minWidth` to the longest word's width caused worse issues - huge gaps between words and misaligned text on desktop.

**Status:** Known limitation. The mobile bounce is a trade-off of the current width-based animation approach. A proper fix would require a fundamentally different animation technique (e.g., opacity-based crossfade, or fixed container height with absolute positioning).

**Workaround:** Users experiencing bounce on mobile can switch to the "typing" animation effect, which doesn't have this issue since it doesn't animate width.

**Complexity:** High (would require rewriting the animation approach)

---

### 89. Image Alt Text Support ✅ 2026-02-15

**Problem:** Images lacked proper alt text fields in several areas of the editor. Gallery/media blocks had alt text available, but blog post images (featured images), Cards block images (testimonial avatars, product images), and the images database table had no alt text support.

**Solution Implemented:**
- [x] Added `alt_text` column to `images` table for reusable alt text per uploaded image
- [x] Added `featured_image_alt` column to `blog_posts` table
- [x] Added `avatarAlt` to `TestimonialCardItem` and `imageAlt` to `ProductCardItem` types
- [x] Added alt text input in blog PostEditor (appears when featured image is set)
- [x] Added alt text input in CardsEditor for testimonial avatars and product images
- [x] Added `updateImageAltText` server action for updating image-level alt text
- [x] Updated all blog renderers (BlogBlock, BlogFeaturedBlock, BlogGridBlock, PublicPostCard, blog detail page) to use `featured_image_alt` with fallback to post title
- [x] Updated CardsBlock renderer to use `avatarAlt`/`imageAlt` with fallbacks
- [x] ImageLibrary uses stored alt text for image alt attributes

**Already had alt text support (no changes needed):**
- Media block (single + gallery), Hero Primitive, legacy Image block, Article inline images

**Deferred:** Pre-filling alt text from image library into block editors when selecting (requires ImageUpload interface refactor)

**Task Document:** `ai_docs/tasks/087_image_alt_text_support.md`

---

### 90. Light/Dark Mode Image Variants

**Problem:** Currently blocks and pages use the same images regardless of whether the site is in light or dark mode. Some designs benefit from different image variants per color scheme (e.g., a dark logo on light backgrounds, a light logo on dark backgrounds, or different hero images per mode).

**Solution:**
- Add optional `darkModeImageUrl` (or similar) field alongside existing image fields
- In the editor, show a secondary image picker when light/dark variants are enabled
- In published site renderers, use CSS `prefers-color-scheme` media queries or the site's theme mode to swap images
- Apply to: Hero images, Media block, Cards block images, Header logo, Blog featured images
- Keep it optional — if no dark variant is set, the default image is used for both modes

**Complexity:** Medium-High (schema changes across multiple block types, renderer updates, editor UI additions)

---

### 91. Rich Text Alignment Options

**Problem:** Text blocks (RichText, Heading) lack alignment controls. Users cannot center, right-align, or justify text, which limits layout flexibility — especially for headings, CTAs, and content sections that need centered or right-aligned text.

**Solution:**
- Add text alignment toolbar buttons (left, center, right, justify) to the RichText editor toolbar
- Add alignment option to the Heading block inspector
- Store alignment as part of the block content (e.g., `textAlign: "left" | "center" | "right" | "justify"`)
- Apply alignment in both the editor preview and published site renderers
- TipTap has built-in `TextAlign` extension — integrate it into the existing editor setup

**Complexity:** Low-Medium (TipTap has native support, mainly UI + renderer updates)

---

## P2 - Medium Priority

### 51. Admin Landing Page Content Management ✅ 2026-01-23

**Problem:** Landing page content (FAQ, features, etc.) is hardcoded in components. When users submit questions via the contact form, there's no easy way to update the FAQ or other landing page content without code changes.

**Solution Implemented:**
- [x] New `landing_faqs` and `landing_features` database tables
- [x] Admin-only content management at `/admin/dashboard`
- [x] FAQManager: Add/edit/delete/reorder FAQ items with drag-drop
- [x] FeatureManager: Add/edit/delete/reorder features with icon picker (10 Lucide icons)
- [x] Toggle active/inactive to show/hide items on landing page
- [x] FAQSection and FeaturesSection now fetch from database
- [x] Empty state handling (sections hide when no active items)
- [x] Seed script to populate initial content from hardcoded values

**Files Created:**
- `lib/drizzle/schema/landing-content.ts` - Database tables
- `lib/queries/landing-content.ts` - Query functions
- `app/actions/landing-content.ts` - Server actions (10 CRUD operations)
- `lib/feature-icons.ts` - Icon mapping utility
- `components/admin/FAQManager.tsx` - FAQ management UI
- `components/admin/FeatureManager.tsx` - Feature management UI
- `scripts/seed-landing-content.ts` - Initial data seed

**Files Modified:**
- `components/landing/FAQSection.tsx` - Now async, fetches from DB
- `components/landing/FeaturesSection.tsx` - Now async, fetches from DB
- `app/(protected)/admin/dashboard/page.tsx` - Added content management section

**Task Document:** `ai_docs/tasks/086_admin_landing_page_cms.md`

---

### 71. Inspector Panel Editing ✅ 2026-01-20 (Phase 1-2)

**Status:** Phase 1-2 complete - basic inspector panel with three tabs working. Design tab consolidation and polish pending.

**Problem:** Currently sections are edited by expanding accordion cards inline. With split view, a dedicated inspector panel (right sidebar) would be more efficient - see preview on left, edit properties on right.

**Solution Implemented:**
- Right-side inspector panel appears when section is selected (25% width)
- Panel structure: Content tab (routes to existing block editors), Design tab (placeholder), Advanced tab (anchor ID, visibility)
- Section list becomes compact clickable cards (no inline expansion)
- Dynamic layout: 40%/60% when no selection, 25%/50%/25% when inspector open
- Undo/redo and auto-save work in inspector
- Escape key closes inspector

**Known Issues / Future Enhancements:**
- See #83 for independent panel scrolling enhancement
- Design tab is placeholder; styling controls remain in Content tab within block editors

**Task Document:** `ai_docs/tasks/070_inspector_panel_editing.md`

---

### 83. Inspector Panel Independent Scrolling ✅ 2026-01-20

**Problem:** When editing a section positioned high on the page with a long inspector panel, users may need to scroll below the visible section to access all editing controls. The inspector scrolls with the page content.

**Solution Implemented:**
- [x] Fixed protected layout height chain (`h-screen` + `overflow-hidden/auto`)
- [x] Added `h-full` to inspector panel wrapper for proper height constraint
- [x] Fixed ScrollArea in InspectorPanel with proper flex/height constraints
- [x] Inspector panel now scrolls independently via internal ScrollArea
- [x] Header with section type label stays fixed while content scrolls

**Files Modified:**
- `app/(protected)/layout.tsx` - Changed `min-h-screen` to `h-screen overflow-hidden`, added `overflow-auto` to main
- `app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx` - Added `overflow-hidden` to page wrapper
- `components/editor/EditorLayout.tsx` - Added `h-full` to inspector wrapper
- `components/editor/InspectorPanel.tsx` - Wrapped ScrollArea with proper height constraints

**Task Document:** `ai_docs/tasks/071_inspector_panel_independent_scrolling.md`

---

### 72. Section Picker Improvements ✅ 2026-01-20

**Problem:** BlockPicker shows a flat grid of 18 block types. Finding the right one requires scanning all options. No way to quickly reuse recently used or favorite sections.

**Solution Implemented:**
- [x] Search input to filter section types by label/description
- [x] Category tabs: All, Layout, Content, Media, Cards, Blog, Utility
- [x] Added `category` field to `BlockTypeInfo` interface
- [x] Favorites: star button on each block, stored in localStorage
- [x] Recently used: track last 5 used block types in localStorage
- [x] Show Favorites and Recent sections at top of "All" tab
- [x] Compact card design (4 columns desktop, 3 mobile) with scrollable grid
- [x] Empty search state with "No blocks match" message

**Files Created:**
- `hooks/useBlockPickerStorage.ts` - localStorage hook for favorites/recent

**Files Modified:**
- `lib/section-types.ts` - Added `BlockCategory` type, `BLOCK_CATEGORIES` array, `category` field to all 18 blocks
- `components/editor/BlockPicker.tsx` - Complete refactor with search, tabs, favorites, recent

**Task Document:** `ai_docs/tasks/072_section_picker_improvements.md`

---

### 73. Primitive Consolidation: RichText ✅ COMPLETED (2026-01-21)

**Problem:** Three block types (`text`, `markdown`, `article`) are essentially the same thing with different input modes. They share 90% of the same styling fields but have separate editors and renderers.

**Solution Implemented:**
- Created unified `richtext` block type with mode: "visual" | "markdown" | "article"
- Single `RichTextEditor.tsx` with mode tabs and appropriate input for each mode
- Single `RichTextBlock.tsx` renderer using shared utilities from `lib/richtext-utils.ts`
- Database migration converted all existing text/markdown/article sections to richtext
- Old block types removed from picker, old files deleted
- **Follow-up enhancements:**
  - Colored mode tabs: Visual (blue), Markdown (green), Article (purple) for visual distinction
  - Pretty-printed HTML in source view (eye icon) for better readability and editing

**Files Created:**
- `lib/richtext-utils.ts` - Shared rendering utilities
- `components/editor/blocks/RichTextEditor.tsx` - Unified editor
- `components/render/blocks/RichTextBlock.tsx` - Unified renderer

**Code Reduction:** ~566 lines (41% reduction from original 1,368 lines)

**Task Document:** `ai_docs/tasks/075_richtext_primitive_consolidation.md`

---

### 74. Primitive Consolidation: Cards ✅ COMPLETED (2026-01-21)

**Problem:** Three block types (`features`, `testimonials`, `product_grid`) are all "array of items displayed in a grid" with slightly different card templates. Massive code duplication in editors and renderers.

**Solution Implemented:**
- Created unified `cards` block type with template: "feature" | "testimonial" | "product"
- Single `CardsEditor.tsx` (~900 lines) with template-specific field rendering and drag-drop for ALL templates
- Single `CardsBlock.tsx` (~700 lines) renderer with template-specific card layouts
- All templates get: section header, grid layout (columns, gap), drag-drop reordering
- Template-specific: icon/button (feature), avatar/quote (testimonial), image/links (product)
- Old blocks (`features`, `testimonials`, `product_grid`) remain functional for backwards compatibility
- `cards` is available as a new block type in the block picker

**Content Interface:**
```typescript
interface CardsContent extends SectionStyling {
  template: "feature" | "testimonial" | "product";
  sectionTitle?: string;
  sectionSubtitle?: string;
  items: CardItem[];  // Union type: FeatureCardItem | TestimonialCardItem | ProductCardItem
  columns?: 2 | 3 | 4 | "auto";
  gap?: "small" | "medium" | "large";
  showCardBackground?: boolean;
  cardBackgroundColor?: string;
  // Product template specific
  iconStyle?: ProductIconStyle;
  showItemTitles?: boolean;
  showItemDescriptions?: boolean;
}
```

**Files Created:**
- `components/render/blocks/CardsBlock.tsx`
- `components/editor/blocks/CardsEditor.tsx`

**Bugfix (also applied):** Fixed undefined CSS variables in ProductGridBlock.tsx - changed `--theme-foreground/background/muted-foreground` to `--color-foreground/background/muted-foreground` (these variables were never defined, causing white-on-white text issues).

**Task Document:** `ai_docs/tasks/076_cards_primitive_consolidation.md`

---

### 75. Primitive Consolidation: Hero ✅ COMPLETED (2026-01-21)

**Problem:** Three block types (`hero`, `cta`, `heading`) are all "heading + optional subheading + optional buttons" with different layouts. CTA is basically a compact hero. Heading is hero without buttons/background.

**Solution Implemented:**
- Created unified `hero_primitive` block type with layout presets: "full" | "compact" | "cta" | "title-only"
- `full`: All features - rotating text, hero image, multi-buttons (up to 4), body text, background image
- `compact`: Simpler hero with optional image, single button, no background
- `cta`: Call-to-action with SectionStyling support (plain/styled modes), single button
- `title-only`: Just heading + subtitle with H1/H2/H3 level selection
- Single editor with conditional fields based on layout (getLayoutFeatures pattern)
- EditorMode toggle support (content/layout separation)
- Backwards compatible - old hero, cta, heading blocks remain functional

**Files Created:**
- `components/render/blocks/HeroPrimitiveBlock.tsx` (657 lines) - Unified renderer
- `components/editor/blocks/HeroPrimitiveEditor.tsx` (1049 lines) - Unified editor

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Added hero_primitive to BLOCK_TYPES
- `lib/section-types.ts` - Added HeroLayout, HeroPrimitiveContent interface, BLOCK_TYPE_INFO entry
- `lib/section-defaults.ts` - Added hero_primitive defaults
- `lib/section-templates.ts` - Added 7 templates for different layout presets
- `components/editor/BlockIcon.tsx` - Added LayoutTemplate icon
- `components/render/BlockRenderer.tsx` - Added hero_primitive case
- `components/render/PreviewBlockRenderer.tsx` - Added hero_primitive case
- `components/editor/SectionEditor.tsx` - Added HeroPrimitiveEditor case
- `components/editor/inspector/ContentTab.tsx` - Added HeroPrimitiveEditor case

**Task Document:** `ai_docs/tasks/077_hero_primitive_consolidation.md`

---

### 76. Primitive Consolidation: Media ✅ 2026-01-21

**Problem:** Three block types (`image`, `gallery`, `embed`) handle visual content. While more distinct than other groups, they share layout patterns and could benefit from unified handling.

**Solution Implemented:**
- Created unified `Media` primitive with modes: "single" | "gallery" | "embed"
- `single`: Full image block functionality (src, alt, caption, 5 layout options, rich text description)
- `gallery`: Full gallery functionality (images array, grid/masonry/carousel, lightbox, auto-rotate)
- `embed`: Full embed functionality (YouTube, maps, PDFs, aspect ratios)
- Mode switching with confirmation warning when data would be lost
- SectionStyling support for all modes (Gallery and Embed now have styling they previously lacked)
- EditorMode support (content/layout toggle)

**Files Created:**
- `components/editor/blocks/MediaEditor.tsx` (~1200 lines) - Unified editor
- `components/render/blocks/MediaBlock.tsx` (~530 lines) - Unified renderer

**Task Document:** `ai_docs/tasks/078_media_primitive_consolidation.md`

---

## P3 - Low Priority / Future

### 77. Inline Field Editing in Preview

**Problem:** Even with inspector panel, editing requires using form fields rather than direct manipulation. For simple fields (headlines, button labels), inline editing in the preview would be faster.

**Solution:**
- Click on text in preview to edit inline (contenteditable)
- Only for simple fields: headings, subheadings, button text, labels
- TipTap integration for rich text fields (complex - may cause focus issues)
- Escape to cancel, click outside or Enter to save
- Visual indicator showing editable regions on hover

**Prerequisites:** #68 (Split View), #69 (Section Selection)

**Risks:** TipTap focus management in iframe is notoriously tricky. Start with plain text fields only.

**Complexity:** High (2-3 days)

---

### 78. Layout vs Content Mode Toggle ✅ 2025-01-20

**Problem:** The inspector could get overwhelming with both content fields and styling options visible. Power users might want to focus on just content or just layout.

**Solution Implemented:**
- [x] Created EditorModeToggle component with 3-state toggle (All/Content/Layout)
- [x] Integrated toggle into InspectorPanel's Content tab header
- [x] Mode persists to localStorage (`editor-mode-preference`)
- [x] Updated all block editors with conditional rendering:
  - Simple editors: TextEditor, MarkdownEditor, HeadingEditor
  - Medium editors: FeaturesEditor, CTAEditor, TestimonialsEditor, ContactEditor
  - Complex editors: HeroEditor, ImageEditor, GalleryEditor
  - Remaining editors: EmbedEditor, SocialLinksEditor, ProductGridEditor, ArticleEditor
- [x] Content mode shows: text fields, images, links, buttons, content items
- [x] Layout mode shows: spacing, alignment, colors, borders, backgrounds, StylingControls
- [x] HeaderEditor/FooterEditor skipped (have their own site/page mode system)

**Key Files:**
- `components/editor/inspector/EditorModeToggle.tsx` - Toggle component
- `components/editor/inspector/InspectorPanel.tsx` - State management
- `components/editor/inspector/ContentTab.tsx` - Passes editorMode to editors
- All `components/editor/blocks/*Editor.tsx` files updated

**Prerequisites:** #71 (Inspector Panel) ✅

**Complexity:** Medium (1 day)

---

### 79. Dual-Format Rich Text Storage

**Problem:** TipTap outputs HTML which is stored directly. If we ever want to migrate editors or enable advanced features (collaborative editing, versioned content), ProseMirror JSON format is better.

**Solution:**
- Store both formats for rich text fields:
  - `body_html`: HTML for rendering (current)
  - `body_doc`: ProseMirror JSON for editing
- On save: write both formats
- On load: prefer doc format if available, fall back to HTML
- Migration task: convert existing HTML to doc format on first edit
- Enables future features: diff viewing, version history, real-time collab

**Prerequisites:** #73 (RichText Primitive) - easier to implement for one type

**Complexity:** High (3-5 days including migration)

---

### 80. ~~Primitive Consolidation: Blog~~ ✅ COMPLETED (2026-01-21)

**Status:** Implemented in task `ai_docs/tasks/079_blog_primitive_consolidation.md`

**What was done:**
- Created unified `Blog` primitive with mode-based architecture ("featured" | "grid")
- Featured mode: 4 layouts (split, stacked, hero, minimal)
- Grid mode: 3 layouts (grid, list, magazine)
- Full SectionStyling support for both modes
- 9 curated templates for common use cases
- Mode switching with data loss confirmation
- Shared components extracted to `components/render/blog/`

**Files Created:**
- `components/render/blocks/BlogBlock.tsx` - Unified renderer (~1000 lines)
- `components/editor/blocks/BlogEditor.tsx` - Unified editor (~800 lines)
- `components/render/blog/BlogPostImage.tsx` - Shared image component
- `components/render/blog/BlogPostMeta.tsx` - Shared meta component
- `components/render/blog/BlogCategoryBadge.tsx` - Shared badge component
- `components/render/blog/BlogPostExcerpt.tsx` - Shared excerpt component

**Files Modified:**
- `lib/section-types.ts` - Added BlogContent, BlogMode, BlogGridLayout, BLOCK_TYPE_INFO
- `lib/section-defaults.ts` - Added blog defaults
- `lib/section-templates.ts` - Added 9 blog templates
- `components/render/BlockRenderer.tsx` - Added blog case
- `components/render/PreviewBlockRenderer.tsx` - Added blog case
- `components/editor/inspector/ContentTab.tsx` - Added BlogEditor
- `components/editor/BlockIcon.tsx` - Added Rss icon

---

### 81. ~~Shared Styling Interface Extraction~~ ✅ COMPLETED (2026-01-20)

**Status:** Implemented in task `ai_docs/tasks/073_shared_styling_interface.md`

**What was done:**
- Created `SectionStyling` base interface in `lib/section-types.ts`
- Created `lib/styling-utils.ts` with shared utilities (hexToRgba, BORDER_WIDTHS, etc.)
- Created `components/editor/StylingControls.tsx` with composable panels
- Refactored 11 block interfaces to extend SectionStyling
- Refactored 12 renderers to use shared utilities
- Refactored 8 editors to use StylingControls component

**Skipped (different patterns):** ImageEditor, SocialLinksEditor, ProductGridEditor

---

### 82. Database Migration to Primitives ✅ COMPLETED (2026-01-21)

**Problem:** After primitive consolidation, the database still has old `block_type` values ("text", "markdown", etc.). Clean data would have `primitive` + `preset` columns.

**Solution Implemented:**
- Added `primitive` and `preset` columns to sections table (nullable)
- Created `lib/primitive-utils.ts` with block_type → primitive/preset mapping
- Backfilled all 75 existing sections with correct primitive/preset values
- Updated `addSection` and `duplicateSection` to write primitive/preset on create
- Added indexes for efficient primitive-based queries
- Created down migration for rollback capability
- Old `block_type` column preserved for backward compatibility

**Block Type Mapping:**
- `text/markdown/article` → `richtext` primitive with `visual/markdown/article` preset
- `hero/cta/heading` → `hero_primitive` with `full/cta/title-only` preset
- `features/testimonials/product_grid` → `cards` with `feature/testimonial/product` preset
- `image/gallery/embed` → `media` with `single/gallery/embed` preset
- `blog_featured/blog_grid` → `blog` with `featured/grid` preset
- `header/footer/contact/social_links` → standalone primitives (no preset)

**Files Created:**
- `lib/primitive-utils.ts` - Mapping utility (~80 lines)
- `drizzle/migrations/0035_ordinary_loners.sql` - Add columns + indexes
- `drizzle/migrations/0035_ordinary_loners/down.sql` - Rollback migration

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Added PRIMITIVES array, primitive/preset columns, indexes
- `app/actions/sections.ts` - Updated addSection/duplicateSection to write new columns

**Task Document:** `ai_docs/tasks/080_database_migration_to_primitives.md`

---

### 84. Block Type Migration UI ✅ COMPLETED (2026-01-21)

**Problem:** After creating new unified primitives (hero_primitive, cards, media, blog), users have existing sections using old block types. Before hiding old types from the block picker, users need a way to convert existing sections to new primitives.

**Solution Implemented:**
- "Convert" button appears in InspectorPanel header for old block types
- Confirmation dialog shows old type → new primitive/preset mapping
- Server action transforms content and updates block_type/primitive/preset columns
- 11 block types supported: hero, cta, heading, features, testimonials, product_grid, image, gallery, embed, blog_featured, blog_grid
- Content is preserved during conversion (field mapping handled automatically)
- Page reloads after conversion to show new primitive's editor

**Files Created:**
- `lib/block-migration.ts` (~320 lines) - Content transformation functions and type guards
- `components/editor/ConvertBlockDialog.tsx` (~85 lines) - Confirmation dialog

**Files Modified:**
- `app/actions/sections.ts` - Added `convertSectionToPrimitive` server action
- `components/editor/InspectorPanel.tsx` - Added convert button for old block types

**Bugfix Also Applied:** Fixed autosave disabling inputs while saving, which caused focus loss when typing in inspector fields.

**Next Step:** After converting all live site sections, hide old block types from `BLOCK_TYPE_INFO` in `lib/section-types.ts`.

**Task Document:** `ai_docs/tasks/081_block_type_migration_ui.md`

---

### 32. Media Primitive Extension: Video/Audio Modes

**Problem:** Users want to showcase audio/video content beyond YouTube/Spotify embeds. The existing embed block supports YouTube, Vimeo, Spotify, SoundCloud but lacks native player features.

**Approach:** Extend the existing Media primitive with `video` and `audio` modes (currently: `single`, `gallery`, `embed`).

**Video Mode Features:**
- Custom video player UI (play/pause, progress bar, volume, fullscreen)
- Playback speed control (0.5x, 1x, 1.25x, 1.5x, 2x)
- Chapter markers/timestamps (clickable list)
- Poster image (thumbnail before play)
- Autoplay, loop, muted options
- Responsive aspect ratios

**Audio Mode Features:**
- Custom styled audio player
- Track title, artist, cover image display
- Playlist support (multiple tracks)
- Download button option
- Duration display

**Implementation Notes:**
- HTML5 `<video>` and `<audio>` with custom controls, or use Plyr/Video.js library
- Storage: Supabase Storage for self-hosted, or support external URLs (Bunny, Mux, etc.)

**Storage Considerations:**
- Vercel Free: No file storage
- Supabase Free: 1GB storage, 2GB bandwidth
- Supabase Pro ($25/mo): 100GB storage

**Related Document:** `ai_docs/refs/course-platform-roadmap.md` (Phase 0, Section 1)

**Complexity:** High (storage infrastructure + custom player)

---

### 8. Site Analytics

**Problem:** No visibility into site traffic/engagement.

**Options:**
- Integrate with external (Google Analytics, Plausible)
- Build simple internal analytics

**Complexity:** Medium-High

---

### 11. Collaboration / Team Features

- Multiple users per site
- Role-based permissions
- Edit history / audit log

**Complexity:** High

---

### 12. Export / Backup

- Export site as static HTML/CSS
- JSON backup of site data
- Import from backup

**Complexity:** Medium

---

### 86. Pricing Primitive ✅ 2026-01-23

**Problem:** No block for displaying pricing tiers, plans, or service packages.

**Solution Implemented:**
- 3 modes: Simple (basic cards), Toggle (monthly/annual switch), Comparison (feature matrix table)
- 2-4 pricing columns with responsive layout
- Monthly/annual toggle with savings badge
- Feature checklist with check/x/limited icons
- Highlighted "popular" tier with customizable badge
- CTA buttons per tier with primary/secondary/outline styles
- Currency formatting ($, €, £, ¥, custom)
- Custom price label support ("Contact us", "Free")
- Drag-drop reordering for tiers and features
- 6 templates: SaaS, Course, Services, Simple, Comparison, Contact

**Files Created:**
- `components/render/blocks/PricingBlock.tsx`
- `components/editor/blocks/PricingEditor.tsx`

**Task Document:** `ai_docs/tasks/083_pricing_primitive.md`

**Complexity:** Medium

---

### 88. Calendar Primitive ✅ 2026-01-23

**Problem:** No block for displaying upcoming events, webinars, or scheduling.

**Solution Implemented:**
- **List mode**: Upcoming events with drag-drop reordering, date/time pickers, timezone selection
- **Countdown mode**: Real-time ticking countdown (updates every second), configurable target date/time, completion message
- **Embed mode**: Calendly and Cal.com scheduling widget embeds with custom URL input

**Features Implemented:**
- "Add to Calendar" dropdown (Google Calendar, Outlook Web, ICS download)
- Timezone display with 16 common timezone presets
- Virtual vs. in-person event type indicators with location/meeting link fields
- Simple and detailed event card styles
- Section title/subtitle support
- StylingControls integration for custom backgrounds, borders, etc.
- 6 templates: Events List Simple/Detailed, Webinar/Launch Countdown, Calendly/Cal.com Booking

**Files Created/Modified:**
- `components/render/blocks/CalendarBlock.tsx` - Full renderer (~650 lines)
- `components/editor/blocks/CalendarEditor.tsx` - Full editor (~900 lines)
- `lib/section-types.ts` - CalendarContent interface and types
- `lib/section-defaults.ts` - Calendar defaults
- `lib/section-templates.ts` - 6 calendar templates
- `components/editor/BlockIcon.tsx` - Calendar icon
- `components/render/BlockRenderer.tsx` - Calendar case
- `components/render/PreviewBlockRenderer.tsx` - Calendar case
- `components/editor/inspector/ContentTab.tsx` - CalendarEditor case

**Task Document:** `ai_docs/tasks/085_calendar_primitive.md`

**Complexity:** Medium

---

## Future Exploration

### Course/Training Platform Capabilities

**Status:** Exploratory - Not committed. Content blocks above (Phase 0) may be implemented independently.

**Overview:** Site Engine could evolve from a website builder into a platform that enables users to create and sell online courses, memberships, and training programs (Kajabi/Teachable model).

**Architecture Vision:**
```
Headstringweb.com (Platform)
├── Site Owners (course creators)
│   └── Sites
│       ├── Pages → Sections (current)
│       ├── Courses
│       │   └── Modules → Lessons
│       └── Students (site-scoped)
│           └── Enrollments, Progress, Payments
```

**Phase 1: Student Accounts (Foundation)**
- Students table scoped to sites
- Course, module, lesson database schema
- Student authentication (magic link or email/password)
- Student dashboard with enrolled courses
- Enrollment and progress tracking

**Phase 2: Payments (Stripe)**
- Stripe Connect or direct API keys
- One-time course purchases
- Checkout flow integration
- Payment/enrollment webhooks

**Phase 3: Advanced Features**
- Recurring subscriptions for memberships
- Drip content (time-based unlocking)
- Quizzes/assessments with scoring
- Completion certificates (PDF generation)
- Community features (comments, forums)

**Open Questions:**
1. Student auth strategy: Separate table vs. Supabase auth with roles?
2. Video hosting: Self-hosted (Supabase Storage), Bunny Stream, Mux, or Cloudflare Stream?
3. Stripe approach: Direct keys or Stripe Connect?
4. Pricing model: Per-site fee, per-student fee, or transaction percentage?
5. Scope: Full LMS or "website builder with course pages" (lighter)?

**Related Document:** `ai_docs/refs/course-platform-roadmap.md` (Full detailed roadmap)

**Complexity:** Very High (multi-phase, 6+ months)

---

## Completed Features

### 85. Accordion Primitive ✅ 2026-01-23

**Problem:** No collapsible section block for FAQ, curriculum outlines, or expandable content.

**Solution Implemented:**
- [x] Created unified Accordion primitive with mode-based architecture ("faq" | "curriculum" | "custom")
- [x] FAQ mode: Question/answer pairs with optional numbering
- [x] Curriculum mode: Nested modules with lessons, duration display, lock/complete icons
- [x] Custom mode: Generic collapsible sections
- [x] Expand/collapse animations via Radix UI Accordion
- [x] "Expand All" / "Collapse All" toggle
- [x] Icon styles (chevron, plus/minus)
- [x] Keyboard accessible (Radix UI built-in)
- [x] Full SectionStyling support
- [x] 6 curated templates (FAQ Simple, FAQ Styled, FAQ Numbered, Course Curriculum, Product Specs, Documentation)

**Files Created:**
- `components/render/blocks/AccordionBlock.tsx` - Unified renderer (~400 lines)
- `components/editor/blocks/AccordionEditor.tsx` - Unified editor (~1000 lines)

**Files Modified:**
- `lib/section-types.ts` - Added AccordionContent, AccordionMode, AccordionItem, CurriculumModule, CurriculumLesson
- `lib/drizzle/schema/sections.ts` - Added "accordion" to BLOCK_TYPES
- `lib/section-defaults.ts` - Added accordion defaults
- `lib/section-templates.ts` - Added 6 accordion templates
- `components/render/BlockRenderer.tsx`, `PreviewBlockRenderer.tsx`, `ContentTab.tsx`, `BlockIcon.tsx`

**Task Document:** `ai_docs/tasks/082_accordion_primitive.md`

---

### 87. Showcase Primitive ✅ 2026-01-23

**Problem:** No block for animated stats/counters or file download lists.

**Solution Implemented:**
- [x] Created unified Showcase primitive with mode-based architecture ("stats" | "downloads")
- [x] Stats mode: Animated count-up numbers on scroll into view
- [x] Stats mode: Multiple stats in a row (2/3/4/auto columns)
- [x] Stats mode: Lucide icon support, prefix/suffix ("+", "K", "%", "$")
- [x] Stats mode: Configurable animation speed (fast/medium/slow)
- [x] Downloads mode: File list or grid layout
- [x] Downloads mode: Document picker integration with site documents
- [x] Downloads mode: Manual URL entry support
- [x] Downloads mode: File type icons (PDF, ZIP, DOC, XLS, IMG, Video, Audio, Other)
- [x] Downloads mode: File size display, custom button text
- [x] Full SectionStyling support
- [x] 6 curated templates (Stats Simple, Stats with Icons, Stats Styled, Downloads List, Downloads Grid, Resource Library)
- [x] Drag-drop reordering for stats and downloads

**Files Created:**
- `components/render/blocks/ShowcaseBlock.tsx` - Unified renderer with Intersection Observer animation (~500 lines)
- `components/editor/blocks/ShowcaseEditor.tsx` - Unified editor with document picker (~1000 lines)
- `lib/file-icons.tsx` - File type icon utility with color-coded icons

**Files Modified:**
- `lib/section-types.ts` - Added ShowcaseContent, ShowcaseMode, StatItem, DownloadItem, etc.
- `lib/drizzle/schema/sections.ts` - Added "showcase" to BLOCK_TYPES
- `lib/section-defaults.ts` - Added showcase defaults
- `lib/section-templates.ts` - Added 6 showcase templates
- `components/render/BlockRenderer.tsx`, `PreviewBlockRenderer.tsx`, `ContentTab.tsx`, `BlockIcon.tsx`

**Task Document:** `ai_docs/tasks/084_showcase_primitive.md`

---

### 80. Primitive Consolidation: Blog ✅ 2026-01-21

**Problem:** `blog_featured` and `blog_grid` both display blog posts with different layouts but were separate blocks.

**Solution Implemented:**
- [x] Created unified `Blog` primitive with mode-based architecture ("featured" | "grid")
- [x] Featured mode: 4 layouts (split, stacked, hero, minimal)
- [x] Grid mode: 3 layouts (grid, list, magazine)
- [x] Full SectionStyling support for both modes
- [x] 9 curated templates for common use cases
- [x] Mode switching with data loss confirmation dialog
- [x] Shared components extracted to `components/render/blog/`

**Files Created:**
- `components/render/blocks/BlogBlock.tsx` - Unified renderer
- `components/editor/blocks/BlogEditor.tsx` - Unified editor
- `components/render/blog/` - Shared components (BlogPostImage, BlogPostMeta, BlogCategoryBadge, BlogPostExcerpt)

**Files Modified:**
- `lib/section-types.ts` - Added BlogContent, BlogMode, BlogGridLayout
- `lib/section-defaults.ts` - Added blog defaults
- `lib/section-templates.ts` - Added 9 blog templates
- `components/render/BlockRenderer.tsx`, `PreviewBlockRenderer.tsx`, `ContentTab.tsx`, `BlockIcon.tsx`

**Task Document:** `ai_docs/tasks/079_blog_primitive_consolidation.md`

---

### 68. Live Preview Split View Mode ✅ 2026-01-20

**Problem:** The current editor was a single-column list of collapsible section cards. Preview was on a separate route (`/preview`). Users couldn't see how edits looked in real-time without switching between pages.

**Solution Implemented:**
- [x] Split view layout: editor panel (left, 40%) + live preview (right, 60%)
- [x] Three view modes: "Builder" (editor only), "Split" (both), "Preview" (preview only)
- [x] Preview updates immediately as content is edited (leverages existing auto-save)
- [x] Device toggle (desktop/tablet/mobile) in header when preview visible
- [x] Color mode toggle (light/dark) in header when preview visible
- [x] Responsive: screens < 1024px show Builder or Preview only (no split)
- [x] View mode preference persisted in localStorage
- [x] Keyboard shortcut: Cmd/Ctrl+Shift+P to cycle view modes

**Files Created:**
- `components/editor/EditorLayout.tsx` - Main split view layout with view mode state
- `components/editor/ViewModeToggle.tsx` - Toggle button group for view modes
- `hooks/useMediaQuery.ts` - Responsive breakpoint detection hook
- `components/ui/toggle.tsx`, `components/ui/toggle-group.tsx` - shadcn components

**Files Modified:**
- `app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx` - Added theme/header/footer fetching, uses EditorLayout
- `components/editor/EditorHeader.tsx` - Added ViewModeToggle, device/color controls
- `components/preview/PreviewFrame.tsx` - Accept external device/colorMode props, hideControls option

**Task Document:** `ai_docs/tasks/068_live_preview_split_view.md`

---

### 69. Section Selection & Highlighting ✅ 2026-01-20

**Problem:** No visual connection between the section card being edited and its rendered output in preview. Users couldn't click on the preview to jump to editing a section.

**Solution Implemented:**
- [x] Hover sync: hovering a section card highlights the corresponding section in preview (and vice versa)
- [x] Click-to-edit: clicking a section in the preview expands that section's editor card
- [x] Visual feedback: highlighted sections show ring outline + floating section type label
- [x] Scroll sync: selecting a section scrolls both panels to center it
- [x] Data attributes: `data-section-id` and `data-section-type` on preview sections
- [x] Graceful fallback: components work without context (for non-editor contexts)

**Files Created:**
- `contexts/EditorSelectionContext.tsx` - Shared state for hover/selection across panels
- `components/preview/SectionHighlight.tsx` - Wrapper component with highlight UI and click handlers

**Files Modified:**
- `components/editor/EditorLayout.tsx` - Added EditorSelectionProvider wrapper
- `components/editor/SectionCard.tsx` - Connected to context, refactored expansion state
- `components/render/PreviewBlockRenderer.tsx` - Wrapped blocks with SectionHighlight

**Task Document:** `ai_docs/tasks/069_section_selection_highlighting.md`

---

### 70. Add Section Between Sections ✅ 2026-01-20

**Problem:** Users could only add sections at the bottom of the page. The `addSection()` action already supported a `position` parameter, but there was no UI to insert between existing sections.

**Solution Implemented:**
- [x] Added InsertionPoint component with hover-activated "+" button
- [x] Subtle horizontal line appears between section cards on hover
- [x] Clicking "+" opens BlockPicker dialog with target position
- [x] New section inserts at correct position, existing sections shift down
- [x] Updated BlockPicker to accept `position`, `trigger`, and `onClose` props

**Files Modified:**
- `components/editor/BlockPicker.tsx` - Added position, trigger, onClose props
- `components/editor/SectionsList.tsx` - Added InsertionPoint components between cards
- `components/editor/InsertionPoint.tsx` - New component for insertion UI

**Task Document:** `ai_docs/tasks/067_add_section_between_sections.md`

---

### 67. OG Image Support for Social Sharing ✅ 2026-01-09

**Problem:** When sites were shared on Twitter, Facebook, LinkedIn, etc., no image appeared. Twitter Cards were missing from published site pages entirely, and Open Graph metadata was incomplete.

**Solution Implemented:**
- [x] Added `og_image_url` column to sites table
- [x] Added Twitter Card metadata to all published site pages (homepage, subpages, blog listing, blog categories)
- [x] Enhanced Open Graph metadata with `siteName` and `images` fields
- [x] Twitter card type dynamically switches: `summary_large_image` when OG image exists, `summary` otherwise
- [x] OG image upload in Settings → SEO Settings with ImageUpload component
- [x] Live social share preview showing how links will appear when shared
- [x] Recommended size guidance (1200x630 pixels)

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added `og_image_url` column
- `app/actions/sites.ts` - Added `ogImageUrl` to `UpdateSiteSettingsData`
- `components/sites/SettingsTab.tsx` - Added OG image upload UI with preview
- `app/(sites)/sites/[siteSlug]/page.tsx` - Added Twitter Card + enhanced OG metadata
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Added Twitter Card + enhanced OG metadata
- `app/(sites)/sites/[siteSlug]/blog/page.tsx` - Added Twitter Card + enhanced OG metadata
- `app/(sites)/sites/[siteSlug]/blog/category/[categorySlug]/page.tsx` - Added Twitter Card + enhanced OG metadata

**Database Migration:** `0033_abandoned_aqueduct` - Added og_image_url column to sites table

---

### 66. Hero Body Text Field with Alignment ✅ 2026-01-09

**Problem:** Users needed to add more detailed, formatted content to hero sections beyond the simple heading and plain-text subheading. The subheading field was a textarea with no formatting options.

**Solution Implemented:**
- [x] New `bodyText` field (HTML string) for rich formatted content
- [x] TiptapEditor integration with full formatting (bold, italic, headings, lists, blockquotes, links)
- [x] HTML mode toggle to view/edit raw HTML
- [x] Text alignment option (Left, Center, Right) - defaults to Center
- [x] Body text renders after subheading, before buttons
- [x] Color adapts based on background (white on background image, muted on light)
- [x] Prose styling for proper rich text display
- [x] Backward compatible - existing hero sections work unchanged

**Files Modified:**
- `lib/section-types.ts` - Added `HeroBodyTextAlignment` type, `bodyText` and `bodyTextAlignment` fields to HeroContent
- `lib/section-defaults.ts` - Added defaults (`bodyText: ""`, `bodyTextAlignment: "center"`)
- `components/editor/blocks/HeroEditor.tsx` - Added TiptapEditor section with alignment Select after image section
- `components/render/blocks/HeroBlock.tsx` - Added BodyTextElement with prose styling and alignment

**Task Document:** `ai_docs/tasks/066_hero_body_text_field.md`

---

### 65. Embed Block PDF Document Support ✅ 2026-01-08

**Problem:** Users wanted to display PDF documents (resumes, brochures, reports) on their site pages. PDFs could be uploaded and shared via URL from Settings → Documents, but there was no way to embed them visually on a page. Creating a new "PDF block" would add another block causing unwanted scrolling.

**Solution Implemented:**
- [x] Extended embed block with source type toggle: "Embed Code" | "PDF Document"
- [x] PDF Document mode shows picker with uploaded site documents
- [x] Added "Letter (8.5:11)" aspect ratio option for document-friendly display
- [x] Document picker fetches from existing `listSiteDocuments()` action
- [x] Updated action to also return site slug for building PDF URLs
- [x] PDFs render in iframe using browser's native PDF viewer
- [x] Existing embed functionality (YouTube, Vimeo, etc.) unchanged
- [x] Empty state shows "No documents uploaded" with guidance

**Files Modified:**
- `lib/section-types.ts` - Added `EmbedSourceType`, `"letter"` ratio, `sourceType`, `documentId`, `documentSlug` fields
- `lib/section-defaults.ts` - Added `sourceType: "embed"` default
- `app/actions/storage.ts` - Updated `listSiteDocuments()` to return `siteSlug`
- `components/editor/blocks/EmbedEditor.tsx` - Added tabs UI, document picker, letter ratio option
- `components/render/blocks/EmbedBlock.tsx` - Handle letter aspect ratio

**Task Document:** `ai_docs/tasks/065_embed_block_pdf_support.md`

---

### 64. Blog Featured Block Full HTML Rendering ✅ 2026-01-08

**Problem:** When using the BlogFeaturedBlock with "Show Full Content" enabled, all HTML formatting was stripped - headings became plain text, bold/italic was lost, horizontal rules disappeared, and lists rendered as separate paragraphs without bullets.

**Root Cause:** The `truncateContent()` function stripped ALL HTML tags from content, even when no truncation was needed. It only extracted `<p>` tags and removed all formatting within them.

**Solution Implemented:**
- [x] Added `PostContentFull` component with full prose styling (matching blog post detail page)
- [x] Added `shouldRenderHtml` flag - renders HTML when showFullContent=true AND content wasn't truncated
- [x] Updated SplitLayout, StackedLayout, MinimalLayout to conditionally render HTML or plain text
- [x] HeroLayout kept as plain text (text overlay on images works better with simple text)
- [x] Theme-aware prose styling with CSS variables for light/dark mode support

**Files Modified:**
- `components/render/blocks/BlogFeaturedBlock.tsx` - Added PostContentFull component, shouldRenderHtml logic, updated all layouts

**Task Document:** `ai_docs/tasks/064_blog_featured_block_html_formatting.md`

---

### 62. Post Grid Block Title/Subtitle & Styling ✅ 2026-01-08

**Problem:** The Post Grid (Blog Grid) block had no section header (title/subtitle) and lacked the basic styling options that other blocks like Features, CTA, and Testimonials have.

**Solution Implemented:**
- [x] Added `sectionTitle` and `sectionSubtitle` fields to BlogGridContent
- [x] Section header renders centered above the post grid when title/subtitle provided
- [x] Added **card border color** control:
  - Three options: Blog Default (theme border), Theme Primary, Custom Color
  - Custom color picker when "Custom" is selected
  - Applies to individual post card borders
- [x] Added full styling options matching other blocks:
  - Master `enableStyling` toggle (disabled by default)
  - Border options: show/hide, width (thin/medium/thick), radius, color
  - Box background: theme-adaptive or custom with opacity
  - Section background image with overlay color/opacity
  - Post card background: show/hide, custom color
  - Typography: text size scaling (small/normal/large), text color mode (auto/light/dark)
- [x] Plain mode (default) preserves original appearance
- [x] Styled mode enables all customization options
- [x] Card styling respects text color mode for readability

**Note on Border Styling:** The border styling requires TWO toggles to be enabled:
1. Turn ON the main "Styling" toggle (at the top of the Styling collapsible)
2. Turn ON the "Show Border" toggle inside the Border section
Then you can configure border width, corners, and color.

**CSS Variable Fix:** Initial implementation used incorrect CSS variable names (`var(--theme-primary)`, `var(--theme-border)`, etc.) which don't exist in the codebase. Fixed to use correct naming convention:
- `--theme-background` → `--color-background`
- `--theme-muted-text` → `--color-muted-foreground`
- `--theme-text` → `--color-foreground`
- `--theme-primary` → `--color-primary`
- `--theme-muted` → `--color-muted`
- `--theme-font-heading` → `--font-heading`
- `--theme-font-body` → `--font-body`

**Files Modified:**
- `lib/section-types.ts` - Extended BlogGridContent with sectionTitle, sectionSubtitle, cardBorderMode, cardBorderColor, and all styling fields
- `lib/section-defaults.ts` - Added default values for new blog_grid fields
- `components/editor/BlogGridEditor.tsx` - Added title/subtitle inputs, card border color controls, and full styling controls collapsible section
- `components/render/blocks/BlogGridBlock.tsx` - Renders section header, uses card border settings, implements plain/styled mode rendering, fixed CSS variable names

---

### 61. Blog Image Fit Setting ✅ 2026-01-07

**Problem:** Blog featured images with non-16:9 aspect ratios (e.g., 1200x800 = 3:2) were being cropped when displayed in blog posts, blog listing pages, and blog grid blocks due to hardcoded `aspect-video` (16:9) with `object-cover`.

**Solution Implemented:**
- [x] New site-level "Featured Image Display" setting in Blog Settings
- [x] Three options: Cover (crops to fill), Contain (shows full image), Fill (stretches)
- [x] Applied to: individual blog posts, blog listing page, category listing page, Blog Grid block, Blog Featured block
- [x] Per-block override option in Blog Featured Editor for split/stacked layouts
- [x] Contain mode adds muted background color for letterboxing effect
- [x] Setting flows through PageRenderer → BlockRenderer → BlogGridBlock chain

**Files Modified:**
- `lib/section-types.ts` - Added `ImageFit` type, `imageFit` field to `BlogFeaturedContent`
- `lib/drizzle/schema/sites.ts` - Added `blog_image_fit` column with `BLOG_IMAGE_FIT_OPTIONS`
- `app/actions/sites.ts` - Added `blogImageFit` to `UpdateSiteSettingsData`
- `components/sites/SettingsTab.tsx` - Added Featured Image Display dropdown in Blog Settings
- `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx` - Uses site imageFit setting
- `app/(sites)/sites/[siteSlug]/blog/page.tsx` - Passes imageFit to BlogListingPage
- `app/(sites)/sites/[siteSlug]/blog/category/[categorySlug]/page.tsx` - Passes imageFit to CategoryListingPage
- `app/(sites)/sites/[siteSlug]/page.tsx` - Passes imageFit to PageRenderer
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Passes imageFit to PageRenderer
- `components/render/PageRenderer.tsx` - Added imageFit prop
- `components/render/BlockRenderer.tsx` - Added imageFit prop, passes to BlogGridBlock
- `components/render/blocks/BlogGridBlock.tsx` - Uses imageFit for post card images
- `components/render/blocks/BlogFeaturedBlock.tsx` - Uses imageFit for split/stacked layouts
- `components/render/blog/PublicPostCard.tsx` - Added imageFit prop
- `components/render/blog/BlogListingPage.tsx` - Added imageFit prop
- `components/render/blog/CategoryListingPage.tsx` - Added imageFit prop
- `components/editor/BlogFeaturedEditor.tsx` - Added Image Display dropdown for per-block override

**Database Migration:** `0030_plain_squadron_supreme` - Added `blog_image_fit` column to sites table

---

### 60. Features Block Optional Button ✅ 2026-01-07

**Problem:** The Features block allows adding feature cards with icon, title, subtitle, and description, but there's no way to add a call-to-action button to individual features.

**Solution Implemented:**
- [x] Added optional `buttonText` and `buttonUrl` fields to Feature interface
- [x] Added button URL and text inputs in FeaturesEditor (in grid layout after description)
- [x] Button renders below description in FeaturesBlock when text/url provided
- [x] Secondary button style (outline) using theme primary color

**Files Modified:**
- `lib/section-types.ts` - Added buttonText and buttonUrl to Feature interface
- `components/editor/blocks/FeaturesEditor.tsx` - Added button text and URL inputs
- `components/render/blocks/FeaturesBlock.tsx` - Renders optional button link

---

### 58. Blog Featured Block Formatting Fix ✅ 2026-01-07

**Problem:** When using the "Blog Featured" block to display a post, the entire content was converted to a single solid paragraph with no line breaks or formatting.

**Solution Implemented:**
- [x] Updated `truncateContent()` to extract and preserve paragraph structure
- [x] Returns `paragraphs` array alongside `text` string
- [x] Updated `PostText` component to render multiple paragraphs with proper spacing
- [x] Truncation respects paragraph boundaries where possible

**Files Modified:**
- `components/render/blocks/BlogFeaturedBlock.tsx` - Updated truncateContent function and PostText component

---

### 57. Blog Post Paragraph Spacing Fix ✅ 2026-01-07

**Problem:** Blog post content written in the TipTap editor with proper paragraph spacing rendered on the published page with all paragraphs collapsed together.

**Solution Implemented:**
- [x] Added explicit paragraph margin styles to PostContent component
- [x] Using Tailwind arbitrary selectors: `[&_p]:mb-4`, `[&_h2]:mt-8`, etc.
- [x] Proper spacing for paragraphs, headings, lists, and blockquotes

**Files Modified:**
- `components/render/blog/PostContent.tsx` - Added explicit paragraph/heading margin classes

---

### 56. Hero Block Profile/Feature Image ✅ 2026-01-06

**Problem:** Hero section only supported a background image. Users building portfolios wanted to add a profile photo or feature image alongside their hero content with styling options like borders and rounding.

**Solution Implemented:**
- [x] New profile/feature image upload (separate from background image)
- [x] Position options: Above Text, After Title, Below Text, Left of Text, Right of Text
- [x] Size control slider (80px to 400px)
- [x] Rounding options: None, Small, Medium, Large, Full (circle/pill for profile pics)
- [x] Border width options: None, Thin (1px), Medium (2px), Thick (4px)
- [x] Border color: Theme Primary or Custom color picker
- [x] Shadow options: None, Small, Medium, Large, Extra Large (using CSS filter drop-shadow)
- [x] Alt text field for accessibility
- [x] Responsive layout handling for horizontal (left/right) vs vertical (top/bottom/after-title) positions
- [x] Mobile stacking option for left/right positions: choose image above or below text on small screens

**Files Modified:**
- `lib/section-types.ts` - Added HeroImageRounding, HeroImagePosition, HeroImageBorderWidth, HeroImageShadow, HeroImageMobileStack types and fields to HeroContent
- `lib/section-defaults.ts` - Added default values for new image fields
- `components/editor/blocks/HeroEditor.tsx` - Added image upload, position, size, rounding, border, and shadow controls
- `components/render/blocks/HeroBlock.tsx` - Renders image with configured styles, handles all position layouts

---

### 55. Social Links Block Enhancements ✅ 2026-01-05

**Problem:** Social links block had no section title/subtitle, and email wasn't available as a social link option.

**Solution Implemented:**
- [x] Added "email" to SocialPlatform type
- [x] Email brand color (#EA4335 - Gmail red)
- [x] Email placeholder: `mailto:hello@example.com`
- [x] Envelope icon SVG for email
- [x] Added optional `title` field to SocialLinksContent
- [x] Added optional `subtitle` field to SocialLinksContent
- [x] Title/subtitle render above social icons with alignment support
- [x] Text color adapts to styling mode (auto/light/dark)
- [x] Works in both plain mode and styled mode

**Files Modified:**
- `lib/section-types.ts` - Added email to SocialPlatform, title/subtitle to SocialLinksContent
- `lib/social-icons.tsx` - Added email brand color, label, placeholder, icon path
- `lib/section-defaults.ts` - Added title/subtitle defaults
- `components/editor/blocks/SocialLinksEditor.tsx` - Added title/subtitle inputs
- `components/render/blocks/SocialLinksBlock.tsx` - Renders title/subtitle with alignment

---

### 54. PDF Document Upload ✅ 2026-01-05

**Problem:** Users building portfolio sites needed to upload and share PDF documents (resumes, portfolios, brochures) but could only upload images. No way to get downloadable document URLs for use in header links, CTA buttons, or footer.

**Solution Implemented:**
- [x] New `documents` database table to track uploaded PDFs
- [x] PDF upload via drag-and-drop or file picker (10MB max)
- [x] Documents section in Site Settings (after Image Library)
- [x] List of uploaded documents with filename, size, date
- [x] Full URL displayed for each document
- [x] "Copy URL" button for easy copying to use anywhere
- [x] Open in new tab button to preview PDF
- [x] Delete button to remove documents
- [x] Same Supabase Storage bucket as images (`media-uploads`)
- [x] Storage path: `{userId}/{siteId}/documents/`

**Files Created:**
- `lib/drizzle/schema/documents.ts` - Documents table schema
- `components/editor/DocumentUpload.tsx` - Upload component with list/copy/delete UI
- `drizzle/migrations/0029_dazzling_grey_gargoyle.sql` - Database migration
- `drizzle/migrations/0029_dazzling_grey_gargoyle/down.sql` - Rollback migration

**Files Modified:**
- `lib/drizzle/schema/index.ts` - Export documents schema
- `app/actions/storage.ts` - Added `uploadDocument()`, `listSiteDocuments()`, `deleteDocument()`
- `components/sites/SettingsTab.tsx` - Added Documents card section

**Database Migration:** `0029_dazzling_grey_gargoyle` - Added documents table

**Supabase Configuration:** Added `application/pdf` to allowed MIME types in `media-uploads` bucket

---

### 52. Hero Multi-Button Support ✅ 2026-01-05

**Problem:** Hero section only supported a single CTA button. Users wanted multiple buttons (e.g., "Get Started" primary + "Learn More" secondary).

**Solution Implemented:**
- [x] New `HeroButton` interface with id, text, url, and variant (primary/secondary)
- [x] `buttons` array replaces legacy single button fields (backwards compatible)
- [x] Maximum of 4 buttons per hero section
- [x] Primary buttons render with filled style, secondary with outline style
- [x] Secondary buttons adapt to white outline when hero has background image
- [x] Add/remove buttons dynamically in editor
- [x] Per-button style selector (Primary/Secondary)
- [x] Buttons render in flex container with gap, wrap on mobile

**Files Modified:**
- `lib/section-types.ts` - Added HeroButton, HeroButtonVariant types, MAX_HERO_BUTTONS constant
- `lib/section-defaults.ts` - Updated hero defaults to use buttons array
- `components/editor/blocks/HeroEditor.tsx` - Multi-button management UI
- `components/render/blocks/HeroBlock.tsx` - Multi-button rendering with variant styles

---

### 53. Features Block Section Header + Per-Feature Subtitles ✅ 2026-01-05

**Problem:** Features block had no section title/subtitle, and individual features only had title + description with no way to add a short tagline.

**Solution Implemented:**
- [x] Added optional `sectionTitle` and `sectionSubtitle` to FeaturesContent
- [x] Section header renders centered above feature cards when provided
- [x] Added optional `subtitle` field to Feature interface
- [x] Per-feature subtitle renders in theme primary color between title and description
- [x] Works in both plain mode and styled mode
- [x] Subtitle inherits text size scaling in styled mode

**Files Modified:**
- `lib/section-types.ts` - Added sectionTitle, sectionSubtitle to FeaturesContent; subtitle to Feature
- `lib/section-defaults.ts` - Added default empty values for new fields
- `components/editor/blocks/FeaturesEditor.tsx` - Added section header inputs and per-feature subtitle field
- `components/render/blocks/FeaturesBlock.tsx` - Renders section header and feature subtitles

---

### 49 & 50. Landing Page Contact Form + Showcase Section ✅ 2026-01-05

**Problem:** Sign-ups were disabled but visitors had no way to reach out. Landing page CTAs led nowhere, and there was no social proof showing sites built with the platform.

**Solution Implemented:**
- [x] New `/contact` page with form (Name, Email, Company optional, Message)
- [x] `landing_contacts` table stores name, email, company (not message)
- [x] Email notification via Resend to alex@headstringweb.com
- [x] Honeypot + rate limiting spam protection
- [x] All 3 CTAs changed: "Get Started Free" → "Let's Talk" → `/contact`
- [x] "Built with Headstring Web" showcase section on landing page
- [x] Queries sites with verified custom domains
- [x] Auto-hides if no verified sites exist
- [x] Login page: "Sign up" link → "Let's Talk" → `/contact`
- [x] Sign-up page redirects to `/contact` (sign-ups disabled)
- [x] Added `/contact` to public routes in middleware

**Task Document:** `ai_docs/tasks/062_landing_contact_and_showcase.md`

**Files Created:**
- `lib/drizzle/schema/landing-contacts.ts` - Landing contacts table schema
- `app/actions/landing-contact.ts` - Contact form server action
- `lib/queries/showcase.ts` - Verified sites query
- `components/landing/ContactForm.tsx` - Contact form component
- `components/landing/ShowcaseSection.tsx` - Sites showcase grid
- `app/(public)/contact/page.tsx` - Contact page

**Files Modified:**
- `lib/drizzle/schema/index.ts` - Export landing-contacts
- `lib/email.ts` - Added `sendLandingContactNotification()`
- `components/landing/Navbar.tsx` - CTA → "Let's Talk"
- `components/landing/HeroSection.tsx` - CTA → "Let's Talk"
- `components/landing/CTASection.tsx` - CTA → "Let's Talk"
- `app/(public)/page.tsx` - Added ShowcaseSection
- `components/auth/LoginForm.tsx` - Sign up link → Let's Talk
- `app/(auth)/auth/sign-up/page.tsx` - Redirect to /contact
- `lib/supabase/middleware.ts` - Added /contact to public routes

**Database Migration:** `0028_glorious_blonde_phantom` - Added landing_contacts table

---

### 48. Rebrand to Headstring Web + Emerald Theme ✅ 2026-01-04

**Problem:** App was branded as "Site Engine" with a purple/violet color scheme. Needed to rebrand to "Headstring Web" with emerald green (#10B981) to match the new logo.

**Solution Implemented:**
- [x] Updated primary color from violet (hsl 265) to emerald green (hsl 160, #10B981)
- [x] Updated all CSS variables in globals.css (light and dark mode)
- [x] Updated default-theme.ts with new emerald color palette
- [x] Renamed "Site Engine" to "Headstring Web" across all user-facing components
- [x] Updated Logo component with larger size (68x68) and new branding
- [x] Updated metadata.ts for SEO (title, OpenGraph, Twitter cards)
- [x] Updated landing page components (Footer, FAQSection, ProblemSection)
- [x] Updated section defaults for hero subheading

**Files Modified:**
- `app/globals.css` - Emerald green color scheme for light/dark modes
- `lib/default-theme.ts` - Updated default theme colors
- `lib/metadata.ts` - SEO metadata rebrand
- `lib/section-defaults.ts` - Updated hero default subheading
- `components/Logo.tsx` - New branding, larger logo size
- `components/landing/Footer.tsx` - Headstring Web branding
- `components/landing/FAQSection.tsx` - Updated references
- `components/landing/ProblemSection.tsx` - Updated references

---

### 46. Rich Content Editor - Article Block ✅ 2026-01-03

**Problem:** Current Text block only supports formatted text. Users couldn't create article-style layouts with images floating alongside text (like an About page with a photo next to a bio).

**Solution Implemented:**
- [x] New "Article" block type with extended TipTap editor
- [x] Image button in toolbar opens ImageInsertModal
- [x] Image sources: Upload new, select from Image Library, or enter URL
- [x] 4 alignment options: Left float, Right float, Center, Full-width
- [x] 4 width presets: 25%, 50%, 75%, 100%
- [x] Text wraps around floated images naturally (CSS with !important for reliable float behavior)
- [x] Responsive: floated images stack above text on mobile (< 640px)
- [x] Image rounding option: Configurable border-radius for inline images
- [x] Full styling options: border, background, overlay, typography
- [x] 4 templates: Basic Article, Tutorial, Featured Article, Card Style
- [x] Click-to-edit image popover: Click any image to change alignment, width, or delete
- [x] WYSIWYG editor styling: H2, H3, blockquotes, lists render styled in editor
- [x] HTML source mode: Toggle to view/edit raw HTML directly
- [x] Multiple images supported: Insert at cursor position, not replacing existing

**Task Document:** `ai_docs/tasks/060_article_block_inline_images.md`

**Files Created:**
- `components/editor/ArticleTiptapEditor.tsx` - Extended TipTap with custom Image extension, WYSIWYG CSS, HTML mode
- `components/editor/ArticleImageNodeView.tsx` - React NodeView with click-to-edit popover
- `components/editor/ImageInsertModal.tsx` - Image insertion dialog with alignment/width controls
- `components/editor/blocks/ArticleEditor.tsx` - Block editor component
- `components/render/blocks/ArticleBlock.tsx` - Block renderer with CSS float behavior

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Added "article" to BLOCK_TYPES
- `lib/section-types.ts` - Added ArticleContent interface, ArticleImageAlignment, ArticleImageWidth types
- `lib/section-defaults.ts` - Added article defaults
- `lib/section-templates.ts` - Added 4 article templates
- `components/editor/SectionEditor.tsx` - Added ArticleEditor routing
- `components/editor/BlockIcon.tsx` - Added BookOpen icon for article
- `components/render/BlockRenderer.tsx` - Added ArticleBlock routing

**Dependencies Added:** `@tiptap/extension-image`

---

### 47. Product/Catalog Grid Block ✅ 2026-01-03

**Problem:** No way to display products, albums, or items with purchase/action links. The Gallery block shows images but doesn't support titles or clickable action buttons (like "Buy on Amazon" or "Listen on Spotify").

**Solution Implemented:**
- [x] New `product_grid` block type with ProductGridContent interface
- [x] Each item has: Image, Title (optional), Description (optional), up to 5 action links
- [x] Predefined platform icons: Amazon, iTunes, Apple Music, Spotify, YouTube, SoundCloud, Tidal, Bandcamp, Custom
- [x] Icon style options: Brand colors, Monochrome, Theme primary
- [x] Layout options: 2/3/4/auto columns with small/medium/large gap
- [x] Card display toggles for title and description visibility
- [x] Drag-drop reordering for items and action links within items
- [x] Featured link option: designate one link to make image clickable
- [x] Templates: Music Catalog, Portfolio Showcase

**Task Document:** `ai_docs/tasks/059_product_catalog_grid_block.md`

**Files Created:**
- `lib/product-icons.tsx` - Platform icons component with brand SVGs
- `components/editor/blocks/ProductGridEditor.tsx` - Full editor with item dialog, drag-drop
- `components/render/blocks/ProductGridBlock.tsx` - Grid renderer with clickable images

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Added "product_grid" to BLOCK_TYPES
- `lib/section-types.ts` - Added ProductGridContent, ProductItem, ProductLink, ProductPlatform types
- `lib/section-defaults.ts` - Added product_grid defaults
- `lib/section-templates.ts` - Added Music Catalog and Portfolio Showcase templates
- `components/editor/SectionEditor.tsx` - Added ProductGridEditor routing
- `components/editor/BlockIcon.tsx` - Added ShoppingBag icon for product_grid
- `components/render/BlockRenderer.tsx` - Added ProductGridBlock routing

---

### 45. Social Links (Settings + Header/Footer/Block) ✅ 2026-01-03

**Problem:** No way to add social media links to sites. Users need to manually add social icons/links in footer content or create custom solutions.

**Solution Implemented:**
- [x] Settings → Social Links card with platform URL configuration
- [x] Supported platforms: Facebook, Instagram, X/Twitter, LinkedIn, YouTube, TikTok, Threads, Pinterest, GitHub, Website
- [x] Site-level icon style setting (Brand colors / Monochrome / Theme primary)
- [x] Header integration with toggle, position (left/right), and size options
- [x] Footer integration with toggle, position (above/below), alignment (left/center/right), and size
- [x] New "Social Links" block type for standalone use anywhere on page
- [x] Block styling options: border, background image, overlay, text color mode
- [x] Custom SVG icons for each platform with brand colors
- [x] Page-level header/footer merge preserves social link settings

**Task Document:** `ai_docs/tasks/058_social_links.md`

**Files Created:**
- `lib/social-icons.tsx` - Social icon component with platform SVGs
- `components/sites/SocialLinksManager.tsx` - Settings UI for managing links
- `components/editor/blocks/SocialLinksEditor.tsx` - Block editor
- `components/render/blocks/SocialLinksBlock.tsx` - Block renderer

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added social_links JSONB, social_icon_style columns
- `lib/drizzle/schema/sections.ts` - Added "social_links" block type
- `lib/section-types.ts` - Added SocialLinksContent, SocialLink, SocialIconStyle types
- `lib/section-defaults.ts` - Added social_links defaults
- `lib/section-templates.ts` - Added social links templates
- `lib/header-footer-utils.ts` - Added social link fields to merge functions
- `components/sites/SettingsTab.tsx` - Added SocialLinksManager
- `components/editor/blocks/HeaderEditor.tsx` - Added social links controls
- `components/editor/blocks/FooterEditor.tsx` - Added social links controls with alignment
- `components/render/blocks/HeaderBlock.tsx` - Social icons rendering
- `components/render/blocks/FooterBlock.tsx` - Social icons rendering with alignment
- `components/render/BlockRenderer.tsx` - SocialLinksBlock routing
- `components/editor/SectionEditor.tsx` - SocialLinksEditor routing
- `components/editor/BlockIcon.tsx` - Added Share2 icon

**Database Migration:** `0027_light_boom_boom` - Added social_links and social_icon_style columns

---

### 39. Image Library Albums / Categories ✅ 2026-01-03

**Problem:** As users upload more images, the flat image library becomes hard to navigate. Users wanted to organize images into folders/albums for easier management.

**Solution Implemented:**
- [x] Database-backed album system (`image_albums` and `images` tables)
- [x] Album CRUD in Settings > Image Library (create, rename, delete)
- [x] Album selector dropdown in ImageUpload (`showAlbumSelector` prop)
- [x] Album filter in ImageLibrary picker and ImageLibraryManager
- [x] "Move to Album" bulk action for selected images
- [x] Lazy sync: existing storage images auto-imported to database
- [x] ON DELETE SET NULL: deleted albums leave images as Uncategorized
- [x] One album per image (folder-like organization)
- [x] Albums scoped per-site with unique names

**Task Document:** `ai_docs/tasks/057_image_library_albums.md`

**Files Created:**
- `lib/drizzle/schema/image-albums.ts` - Album table schema
- `lib/drizzle/schema/images.ts` - Image tracking table schema
- `app/actions/albums.ts` - Album CRUD server actions
- `components/sites/AlbumManager.tsx` - Album management UI
- `components/editor/AlbumSelector.tsx` - Reusable album dropdown

**Files Modified:**
- `lib/drizzle/schema/index.ts` - Added exports
- `app/actions/storage.ts` - Database integration, album support
- `components/editor/ImageUpload.tsx` - Album selector integration
- `components/editor/ImageLibrary.tsx` - Album filter
- `components/sites/ImageLibraryManager.tsx` - Filter + move actions
- `components/sites/SettingsTab.tsx` - AlbumManager integration

**Database Migration:** `0026_overjoyed_apocalypse` - Added image_albums and images tables

---

### 43. Blog Author Toggle Per-Block ✅ 2026-01-03

**Problem:** The "Show Author" toggle was at the site level only, but users wanted per-block control to show author on some blog displays but not others.

**Solution Implemented:**
- [x] Added `showAuthor` field to BlogGridContent and BlogFeaturedContent types
- [x] Added "Show Author" toggle to BlogGridEditor and BlogFeaturedEditor
- [x] Blog blocks now use `content.showAuthor ?? true` (backwards compatible)
- [x] Removed `showBlogAuthor` prop chain from PageRenderer/BlockRenderer
- [x] Site-level setting retained for individual post pages only
- [x] Updated SettingsTab label to clarify scope

**Task Document:** `ai_docs/tasks/056_blog_author_toggle_per_block.md`

**Files Modified:**
- `lib/section-types.ts` - Added showAuthor to BlogGridContent and BlogFeaturedContent
- `lib/section-defaults.ts` - Added showAuthor: true defaults
- `components/editor/BlogGridEditor.tsx` - Added Show Author toggle
- `components/editor/BlogFeaturedEditor.tsx` - Added Show Author toggle
- `components/render/blocks/BlogGridBlock.tsx` - Use content.showAuthor
- `components/render/blocks/BlogFeaturedBlock.tsx` - Use content.showAuthor
- `components/render/BlockRenderer.tsx` - Removed showBlogAuthor prop
- `components/render/PageRenderer.tsx` - Removed showBlogAuthor prop
- `app/(sites)/sites/[siteSlug]/page.tsx` - Removed showBlogAuthor from PageRenderer
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Removed showBlogAuthor from PageRenderer
- `components/sites/SettingsTab.tsx` - Clarified setting scope in UI

---

### 44. Blog Page Assignment (Blog Feeds per Page) ✅ 2026-01-03

**Problem:** Blog posts could be assigned to pages in the dashboard, but this assignment had no effect on the public site. The Blog Grid block always showed all published posts, ignoring page assignments.

**Solution Implemented:**
- [x] Added `pageFilter` field to BlogGridContent type with options: All Posts, This Page (current), Unassigned, or specific page ID
- [x] Blog Grid block auto-detects current page context when set to "This Page"
- [x] BlogGridEditor shows page filter dropdown with all available options
- [x] Default behavior for NEW blocks is "This Page" (auto-detect)
- [x] Existing blocks continue to show all posts (backwards compatible via "all" default)
- [x] PageId flows from page route → PageRenderer → BlockRenderer → BlogGridBlock
- [x] Query function `getPublishedPostsBySite` supports optional pageId parameter
- [x] API route supports `pageId` query parameter for infinite scroll compatibility

**Task Document:** `ai_docs/tasks/055_blog_page_assignment_public.md`

**Files Modified:**
- `lib/section-types.ts` - Added BlogGridPageFilter type and pageFilter field to BlogGridContent
- `lib/section-defaults.ts` - Set pageFilter default to "current" for new blocks
- `lib/queries/blog.ts` - Added optional pageId parameter to getPublishedPostsBySite
- `app/api/blog/[siteId]/posts/route.ts` - Added pageId query param support
- `components/render/PageRenderer.tsx` - Added pageId prop
- `components/render/BlockRenderer.tsx` - Added pageId prop, passes to BlogGridBlock
- `components/render/blocks/BlogGridBlock.tsx` - Resolves pageFilter to query filter
- `app/(sites)/sites/[siteSlug]/page.tsx` - Passes page.id to PageRenderer
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Passes page.id to PageRenderer
- `app/actions/pages.ts` - Added getPagesForSite server action
- `components/editor/BlogGridEditor.tsx` - Added page filter dropdown with all options
- `components/editor/SectionEditor.tsx` - Passes currentPageId to BlogGridEditor

---

### 42. Blog Post Sorting Options & Page Filter ✅ 2026-01-02

**Problem:** Blog posts in the dashboard had no sort options. Users wanted to view posts by different criteria and filter by page assignment.

**Solution Implemented:**
- [x] Sort dropdown with 5 options: Newest, Oldest, Recently Updated, Alphabetical (A-Z), By Status
- [x] Page filter dropdown: All Pages, Unassigned, or specific page
- [x] Sort/filter preferences persist per site in localStorage
- [x] Added `page_id` column to blog_posts with FK to pages table
- [x] Page assignment in post editor sidebar
- [x] BlogFilterBar component for sort/filter controls

**Task Document:** `ai_docs/tasks/054_blog_post_sorting_page_filter.md`

**Files Created:**
- `components/blog/BlogFilterBar.tsx` - Sort and page filter dropdowns
- `components/blog/PageSelector.tsx` - Page assignment dropdown

**Files Modified:**
- `lib/drizzle/schema/blog-posts.ts` - Added page_id column with FK
- `lib/queries/blog.ts` - Added pageName to query results via JOIN
- `components/blog/BlogTab.tsx` - Filter state, localStorage persistence
- `components/blog/PostEditor.tsx` - Page assignment in sidebar
- `components/sites/SiteTabs.tsx` - Pass pages prop to BlogTab
- `app/actions/blog.ts` - Handle page_id in updatePost
- `app/(protected)/app/sites/[siteId]/blog/[postId]/page.tsx` - Pass pages to PostEditor

**Database Migration:** `0025_handy_shen` - Added page_id column to blog_posts table

---

### 41. Image Block Enhancements ✅ 2026-01-02

**Problem:** The Image block lacked styling options (unlike Text, Features, CTA blocks) and had no layout flexibility.

**Solution Implemented:**
- [x] Percentage-based image width control (10%, 25%, 50%, 75%, 100%)
- [x] Layout options: Image Only, Image Left + Text Right, Image Right + Text Left, Image Top + Text Below, Text Top + Image Below
- [x] Separate text width control for side-by-side layouts (10-100%)
- [x] Warning when image + text widths exceed 100%
- [x] Rich text description field using TipTap (only shown for layouts with text)
- [x] Styling options: border (width, radius, color), background image with overlay, text color mode
- [x] 6 templates: Simple, Small, Card, Feature Image (50/50), Profile (25/75), Full-width Banner

**Task Document:** `ai_docs/tasks/053_image_block_enhancements.md`

**Files Modified:**
- `lib/section-types.ts` - Added ImageWidth, ImageLayout types; extended ImageContent with textWidth and styling fields
- `lib/section-defaults.ts` - Updated image defaults with new fields
- `lib/section-templates.ts` - Added 6 image templates including Profile layout
- `components/editor/blocks/ImageEditor.tsx` - Complete rewrite with all controls
- `components/render/blocks/ImageBlock.tsx` - Complete rewrite with layout variants and flex-based sizing

---

### 40. Manual Page Ordering ✅ 2026-01-02

**Problem:** Pages were displayed in a fixed order (by updated date). Users wanted to organize pages in their own preferred order for better site organization.

**Solution Implemented:**
- [x] Added `display_order` column to pages table
- [x] Drag-and-drop reordering in Pages list using dnd-kit
- [x] Converted PagesList from table to card layout
- [x] Order persists in database and reflects in navigation
- [x] New pages added to end of list
- [x] Home page freely reorderable (not locked)

**Task Document:** `ai_docs/tasks/052_manual_page_ordering.md`

**Files Created:**
- `drizzle/migrations/0024_freezing_peter_parker.sql` - Add display_order column
- `drizzle/migrations/0024_freezing_peter_parker/down.sql` - Rollback migration

**Files Modified:**
- `lib/drizzle/schema/pages.ts` - Added display_order column
- `lib/queries/pages.ts` - Changed ordering to display_order ASC
- `app/actions/pages.ts` - Added reorderPages(), updated createPage()
- `components/pages/PagesList.tsx` - Card layout with dnd-kit
- `components/pages/PageRow.tsx` - Sortable card with drag handle

**Database Migration:** `0024_freezing_peter_parker` - Added display_order column to pages table

---

### 9. SEO Enhancements ✅ 2026-01-01

**Problem:** Search engines had difficulty discovering all pages on child sites without a sitemap.

**Solution Implemented:**
- [x] Structured data / JSON-LD (Article schema on blog posts) - previously done
- [x] Social sharing previews (OpenGraph metadata on all pages) - previously done
- [x] Dynamic sitemap.xml per child site (`/sites/[slug]/sitemap.xml`)
- [x] Dynamic robots.txt per child site (`/sites/[slug]/robots.txt`)
- [x] Sitemap includes: homepage, pages, blog listing, posts, categories
- [x] Custom domain URLs used when configured
- [x] 1-hour cache revalidation for auto-updates
- [x] SEO Files links shown in Settings when domain is verified (quick access to sitemap.xml and robots.txt)

**Task Document:** `ai_docs/tasks/051_sitemap_robots_txt.md`

**Files Created:**
- `lib/queries/sitemap.ts` - Efficient sitemap data fetching
- `app/(sites)/sites/[siteSlug]/sitemap.xml/route.ts` - Dynamic XML sitemap
- `app/(sites)/sites/[siteSlug]/robots.txt/route.ts` - Dynamic robots.txt

**Files Modified:**
- `components/sites/SettingsTab.tsx` - Added SEO Files links section for verified domains

---

### 7. Custom Domain Support ✅ 2025-12-30

**Problem:** Sites only accessible via `/sites/[slug]`. Users wanted custom domains for professional branding.

**Solution Implemented:**
- [x] User can enter custom domain in Settings
- [x] Domain added to Vercel project via API
- [x] DNS instructions shown when manual verification needed
- [x] Background task polls for verification status (Trigger.dev)
- [x] Verified domains route correctly via middleware
- [x] SSL certificates provisioned automatically by Vercel
- [x] Both custom domain AND `/sites/[slug]` URLs work
- [x] User can remove a custom domain

**Task Document:** `ai_docs/tasks/032_custom_domain_support.md`

**Files Created:**
- `app/actions/domains.ts` - Domain management server actions
- `trigger/tasks/verify-domain.ts` - Background verification polling
- `lib/vercel.ts` - Vercel API client
- `lib/domain-utils.ts` - Domain validation utilities
- `components/sites/DnsInstructionsCard.tsx` - DNS configuration display

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added domain verification columns
- `middleware.ts` - Custom domain routing
- `components/sites/SettingsTab.tsx` - Domain configuration UI

---

### 37. Page Meta Field Character Count Guidance ✅ 2026-01-01

**Problem:** The Edit Page modal had Meta Title and Meta Description fields with no indication of ideal lengths for SEO. Users discovered length issues only after saving via the SEO Health Check.

**Solution Implemented:**
- [x] Live character counter below Meta Title field showing "X/60 characters (aim for 50-60)"
- [x] Live character counter below Meta Description field showing "X/160 characters (aim for 120-160)"
- [x] Color coding: green (optimal range), amber (too short or slightly over), red (too long)
- [x] Helper function for determining color based on SEO optimal ranges

**Files Modified:**
- `components/pages/EditPageModal.tsx` - Added getCharCountColor helper and character counters

---

### 34. Markdown Block Type ✅ 2026-01-01

**Problem:** Users want to add AI-generated content or write in Markdown format and have it render as styled HTML on published pages.

**Solution Implemented:**
- [x] New `markdown` block type with raw Markdown input
- [x] Markdown editor with live preview toggle
- [x] Full GFM support (tables, code blocks, task lists)
- [x] Styling options matching Text block (border, background, typography)
- [x] `react-markdown` for rendering with theme-aware styles
- [x] 4 templates: Blank, Article, Documentation, Code Snippet

**Files Created:**
- `components/editor/blocks/MarkdownEditor.tsx` - Editor with preview toggle
- `components/render/blocks/MarkdownBlock.tsx` - Renderer with react-markdown

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Added "markdown" to BLOCK_TYPES
- `lib/section-types.ts` - Added MarkdownContent interface
- `lib/section-defaults.ts` - Added markdown defaults
- `lib/section-templates.ts` - Added markdown templates
- `components/editor/BlockIcon.tsx` - Added FileText icon
- `components/editor/SectionEditor.tsx` - Added MarkdownEditor routing
- `components/render/BlockRenderer.tsx` - Added MarkdownBlock routing

---

### 36. Heading Block Type ✅ 2026-01-01

**Problem:** Not every page has a Hero section, but every page needs an H1 for SEO. Pages like About, Services, or simple content pages often just have a Header, Text blocks, and Footer - leaving no H1 on the page.

**Solution Implemented:**
- [x] New `heading` block type with configurable heading level (H1, H2, H3)
- [x] Title field (required) + optional subtitle field
- [x] Alignment options (left, center, right)
- [x] Text color mode (auto/light/dark)
- [x] Uses theme heading font and colors
- [x] 3 templates: Page Title, Section Divider, Minimal

**Files Created:**
- `components/editor/blocks/HeadingEditor.tsx` - Editor component
- `components/render/blocks/HeadingBlock.tsx` - Renderer component

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Added "heading" to BLOCK_TYPES
- `lib/section-types.ts` - Added HeadingContent interface
- `lib/section-defaults.ts` - Added heading defaults
- `lib/section-templates.ts` - Added heading templates
- `components/editor/BlockIcon.tsx` - Added Heading1 icon
- `components/editor/SectionEditor.tsx` - Added HeadingEditor routing
- `components/render/BlockRenderer.tsx` - Added HeadingBlock routing

---

### 38. Blog Page SEO Metadata ✅ 2026-01-01

**Problem:** The main blog listing page (`/sites/[slug]/blog`) had hardcoded meta title and description ("Blog | {site name}" and "Latest blog posts from {site name}"). Site owners couldn't customize SEO metadata for their blog index page.

**Solution Implemented:**
- [x] Added `blog_meta_title` and `blog_meta_description` columns to sites table
- [x] Added Blog Page Meta Title and Description fields in Settings → Blog Settings
- [x] Character limits: 60 for title, 160 for description (with maxLength on inputs)
- [x] Blog page uses custom values with fallback to default auto-generated text
- [x] OpenGraph metadata also uses the custom values

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added blog_meta_title and blog_meta_description columns
- `app/actions/sites.ts` - Handle new fields in updateSiteSettings
- `components/sites/SettingsTab.tsx` - Added Blog SEO fields in Blog Settings card
- `app/(sites)/sites/[siteSlug]/blog/page.tsx` - Use custom metadata with fallbacks

**Database Migration:** `0023_equal_sandman` - Added blog_meta_title and blog_meta_description columns

---

### 35. Markdown Detection & Conversion in Rich Text Editor ✅ 2026-01-01

**Problem:** Users pasting AI-generated content (which is typically in Markdown format) into text blocks or blog posts would see malformed rendering (e.g., text appearing as blockquotes with italic styling) because the editor stored raw markdown syntax as HTML.

**Solution Implemented:**
- [x] Automatic markdown pattern detection in TiptapEditor
- [x] Detects headers (`#`), bold (`**`), italic (`*`), lists (`-`, `1.`), links, blockquotes, code blocks
- [x] Amber warning banner: "This content has special formatting"
- [x] One-click "Convert to Text" button converts markdown to proper HTML
- [x] Dismiss button to keep content as-is
- [x] Works in both Text blocks and Blog post editor (shared TiptapEditor component)
- [x] Uses `marked` library for accurate markdown-to-HTML conversion
- [x] Converts h1 → h2, h4+ → h3 to match TipTap's supported heading levels

**Files Created:**
- `lib/markdown-utils.ts` - Detection and conversion utilities

**Files Modified:**
- `components/editor/TiptapEditor.tsx` - Added banner UI and conversion logic

**Dependencies Added:** `marked`

---

### 33. Header & Footer Styling Options ✅ 2025-12-31

**Problem:** Header had a fixed small logo (32px), and neither header nor footer had styling customization options like background color, borders, or text customization.

**Solution Implemented:**
- [x] Logo size slider (24-80px) with dynamic header height adjustment
- [x] Background color picker for header/footer
- [x] Full-width border controls (bottom for header, top for footer)
- [x] Border width options: Thin (1px), Medium (2px), Thick (4px)
- [x] Border color picker with theme primary as default
- [x] Background image upload with overlay color/opacity
- [x] Text color mode: Auto (from theme), Light, Dark
- [x] Text size scaling: Small, Normal, Large
- [x] "Enable Advanced Styling" toggle for background/text options
- [x] Border controls accessible without enabling advanced styling
- [x] Page-level override support for styling options
- [x] Reset button for border color to revert to theme primary

**Task Document:** `ai_docs/tasks/048_header_footer_styling_options.md`

**Files Modified:**
- `lib/section-types.ts` - Added backgroundColor field, HeaderFooterBorderWidth type
- `lib/section-defaults.ts` - Added default styling values
- `lib/header-footer-utils.ts` - Updated merge functions to pass through all styling fields
- `components/editor/blocks/HeaderEditor.tsx` - Added logo slider and styling controls
- `components/editor/blocks/FooterEditor.tsx` - Added styling controls
- `components/render/blocks/HeaderBlock.tsx` - Dynamic height, background/border rendering
- `components/render/blocks/FooterBlock.tsx` - Background/border rendering

---

### 31b. SEO AI-Powered Analysis ✅ 2025-12-31

**Problem:** While the manual SEO checklist provides immediate feedback, site owners may benefit from deeper AI-powered analysis of their content.

**Solution Implemented:**
- [x] "Analyze with AI" button in SEO Health Check card
- [x] Trigger.dev background task analyzes site content with GPT-4o
- [x] AI reviews all pages, sections, and meta data
- [x] Returns overall score (0-100) with color-coded badge
- [x] Summary of findings and list of strengths
- [x] Priority-ranked recommendations (high/medium/low)
- [x] Recommendations categorized: content, technical, keywords, meta
- [x] Expandable recommendation items with current state and suggested fix
- [x] Page-specific recommendations tagged with page slug
- [x] Progress bar during analysis (30-60 seconds)
- [x] Re-analyze button to run fresh analysis
- [x] Previous analysis results persist and display on return

**Task Document:** `ai_docs/tasks/047_seo_checklist_guidance.md`

**Files Created:**
- `lib/drizzle/schema/seo-analysis-jobs.ts` - Job tracking table schema
- `trigger/tasks/analyze-seo.ts` - Trigger.dev background task
- `trigger/utils/seo-prompts.ts` - AI prompts and Zod schemas

**Files Modified:**
- `app/actions/seo.ts` - Added startSeoAnalysis, getSeoAnalysisJob, getLatestSeoAnalysisForSite
- `components/sites/SeoScorecard.tsx` - Added AI analysis section with full UI
- `trigger/index.ts` - Registered new task and prompts
- `lib/drizzle/schema/index.ts` - Export seo-analysis-jobs schema

**Database Migration:** `0022_needy_tony_stark` - Added seo_analysis_jobs table

---

### 31a. SEO Checklist & Guidance ✅ 2025-12-31

**Problem:** Site owners don't know if their child sites are well-optimized for search engines.

**Solution Implemented:**
- [x] SEO Health Check card in Settings tab (after SEO Settings)
- [x] Progress bar with score (0-100%) and color coding (green/yellow/red)
- [x] Site-level checks: meta title, meta description, favicon
- [x] Page-level checks: per-page meta title and description
- [x] Content checks: image alt text, logo alt text
- [x] Collapsible sections for each check category
- [x] Expandable guidance text for each failed/warning check
- [x] Refresh button to re-run audit after making changes

**Task Document:** `ai_docs/tasks/047_seo_checklist_guidance.md`

**Files Created:**
- `lib/seo-checks.ts` - Check definitions and analysis logic
- `lib/queries/seo.ts` - Data fetching for SEO audit
- `app/actions/seo.ts` - Server action to run audit
- `components/sites/SeoScorecard.tsx` - Main scorecard UI
- `components/sites/SeoCheckItem.tsx` - Individual check display

**Files Modified:**
- `components/sites/SettingsTab.tsx` - Added SeoScorecard component

---

### 29. Gallery Styling Options ✅ 2025-12-31

**Problem:** Gallery images have fixed borders and gaps. Users want seamless/compact gallery options.

**Solution Implemented:**
- [x] Toggle to show/hide image borders (default: show)
- [x] Toggle for gap between images (default: with gap)
- [x] Apply to all gallery layouts: Grid, Masonry, Carousel
- [x] Independent controls (can have no border but still have gap, etc.)
- [x] Border options: None, Thin, Medium, Thick with border radius
- [x] Gap options: None, Small, Medium, Large

**Files Modified:**
- `lib/section-types.ts` - Added GalleryBorderWidth type, extended GalleryContent with border/gap toggles
- `lib/section-defaults.ts` - Added default border/gap values
- `components/editor/blocks/GalleryEditor.tsx` - Added border and gap toggle controls
- `components/render/blocks/gallery/GalleryGrid.tsx` - Applied border/gap styling
- `components/render/blocks/gallery/GalleryMasonry.tsx` - Applied border/gap styling
- `components/render/blocks/gallery/GalleryCarousel.tsx` - Applied border/gap styling

---

### 30. Block Styling Options (Multi-Block) ✅ 2025-12-31

**Problem:** Sections look uniform. Users want visual variety between sections to guide visitors through the page.

**Solution Implemented:**
- [x] Added styling options to 4 block types following Text block (#28) pattern
- [x] Features block: border, background image/overlay, card backgrounds, typography
- [x] CTA block: border, background image/overlay, box background, typography
- [x] Testimonials block: border, background image/overlay, card backgrounds, typography
- [x] Contact block: border, background image/overlay, form card background, typography
- [x] Each block has master `enableStyling` toggle (disabled by default)
- [x] Border controls: show/hide, width (thin/medium/thick), radius, color
- [x] Box background: theme-adaptive or custom with opacity
- [x] Section background image with overlay color/opacity
- [x] Card/Form background controls for nested elements
- [x] Typography: text size scaling, text color mode (auto/light/dark)
- [x] Fixed ContactBlockPublished to support styling on published sites
- [x] Fixed preview page revalidation when section content is updated

**Files Modified:**
- `lib/section-types.ts` - Extended content interfaces with styling fields
- `lib/section-defaults.ts` - Added default styling values
- `components/editor/blocks/FeaturesEditor.tsx` - Added styling controls
- `components/editor/blocks/CTAEditor.tsx` - Added styling controls
- `components/editor/blocks/TestimonialsEditor.tsx` - Added styling controls
- `components/editor/blocks/ContactEditor.tsx` - Added styling controls
- `components/render/blocks/FeaturesBlock.tsx` - Plain/styled mode rendering
- `components/render/blocks/CTABlock.tsx` - Plain/styled mode rendering
- `components/render/blocks/TestimonialsBlock.tsx` - Plain/styled mode rendering
- `components/render/blocks/ContactBlock.tsx` - Plain/styled mode rendering
- `components/render/blocks/ContactBlockPublished.tsx` - Added full styling support
- `app/actions/sections.ts` - Added preview page revalidation

---

### 26. Legal Pages for Child Sites ✅ 2025-12-31

**Problem:** Footer legal links (Privacy Policy, Terms) currently link to Site Engine's legal pages, not the child site's own policies.

**Solution Implemented:**
- [x] Site owner selects which legal pages to generate (checkboxes)
- [x] Privacy Policy, Terms of Service, Cookie Policy options
- [x] Business type selector for industry-specific content
- [x] Data collection practices checkboxes (Contact Forms, Cookies, Payments, Analytics, User Accounts)
- [x] Primary jurisdiction selector (determines GDPR, CCPA references)
- [x] AI generates legal content via Trigger.dev background task
- [x] Auto-creates pages with generated content
- [x] "Exists" badges show which pages already exist
- [x] Regenerate option to update existing pages
- [x] Ability to edit generated content in Pages tab

**Files Created/Modified:**
- Legal Pages card in Settings tab
- Trigger.dev task for AI generation
- Server actions for page creation

---

### 28. Text Block Styling Options ✅ 2025-12-31

**Problem:** Text blocks were plain with no visual styling options. Users wanted to create visually distinct text sections with borders, background images, and color overlays.

**Solution Implemented:**
- [x] Border toggle with width options (Thin/Medium/Thick)
- [x] Border radius options (None/Small/Medium/Large/Pill)
- [x] Border color picker (defaults to theme primary)
- [x] Background image upload via ImageUpload component
- [x] Overlay color picker with opacity slider (0-100%)
- [x] Content width options (Narrow/Medium/Full)
- [x] Overlay sits on top of background image (tinted effect)
- [x] Text color automatically adjusts for readability on backgrounds
- [x] Collapsible "Styling" section in editor UI
- [x] 3 new templates: Card, Featured, Highlight

**Task Document:** `ai_docs/tasks/044_text_block_styling_options.md`

**Files Modified:**
- `lib/section-types.ts` - Added TextBorderWidth, TextBorderRadius, TextContentWidth types; extended TextContent
- `lib/section-defaults.ts` - Added default styling values
- `lib/section-templates.ts` - Added Card, Featured, Highlight templates
- `components/render/blocks/TextBlock.tsx` - Full styling support with overlay and borders
- `components/editor/blocks/TextEditor.tsx` - Collapsible styling controls

---

### 27. Hero Rotating Text Animation ✅ 2025-12-30

**Problem:** Hero section headings are static. Users wanted animated text effects where words cycle through with visual transitions (like "Specialists in [Production | Remixing | Editing]").

**Solution Implemented:**
- [x] Toggle between static heading OR rotating title mode
- [x] Rotating title structure: Before Text + Rotation Words + After Text
- [x] Two animation effects: Clip (width-based reveal/hide) and Typing (typewriter with untype)
- [x] Display time scales all animation speeds proportionally (500-10000ms range)
- [x] Animation mode: Loop or Once
- [x] Hover-to-pause for accessibility
- [x] Respects prefers-reduced-motion preference
- [x] Editor UI with full configuration controls

**Task Document:** `ai_docs/tasks/043_hero_rotating_text_animation.md`

**Files Created:**
- `components/render/blocks/RotatingText.tsx` - Animation component with Clip and Typing effects

**Files Modified:**
- `lib/section-types.ts` - Added HeroTitleMode, HeroAnimationEffect, HeroAnimationMode, RotatingTitleConfig types
- `lib/section-defaults.ts` - Added default rotating title configuration
- `components/render/blocks/HeroBlock.tsx` - Conditional rendering for rotating titles
- `components/editor/blocks/HeroEditor.tsx` - Full rotating title configuration UI

---

### 24. Gallery Layout Options ✅ 2025-12-30

**Problem:** Gallery had fixed layout (flex wrap, object-cover). No control over aspect ratio or display style.

**Solution Implemented:**
- [x] Aspect ratio options: Square (1:1), Landscape (16:9, 4:3), Portrait (3:4), Original
- [x] Layout variants: Grid (improved), Masonry (Pinterest-style), Carousel (arrows + dots)
- [x] Columns setting: 2, 3, 4, Auto
- [x] Gap/spacing control: Small, Medium, Large
- [x] Lightbox on click with keyboard navigation (arrows, escape)
- [x] Touch swipe support for carousel and lightbox
- [x] Responsive design (mobile-first breakpoints)
- [x] 4 gallery templates: Portfolio (masonry), Team (grid), Showcase (carousel), Simple (grid)

**Task Document:** `ai_docs/tasks/041_gallery_layout_options.md`

**Files Created:**
- `components/render/blocks/gallery/GalleryGrid.tsx` - Grid layout with aspect ratios and columns
- `components/render/blocks/gallery/GalleryMasonry.tsx` - CSS columns masonry layout
- `components/render/blocks/gallery/GalleryCarousel.tsx` - Slider with keyboard/touch nav
- `components/render/blocks/gallery/GalleryLightbox.tsx` - Fullscreen modal with navigation

**Files Modified:**
- `lib/section-types.ts` - Added GalleryAspectRatio, GalleryLayout, GalleryColumns, GalleryGap types
- `lib/section-defaults.ts` - Added default gallery settings
- `lib/section-templates.ts` - Added 4 gallery templates with layout presets
- `components/editor/blocks/GalleryEditor.tsx` - Added settings panel with dropdowns and toggle
- `components/render/blocks/GalleryBlock.tsx` - Routes to layout variants, manages lightbox state

---

### 25. Embed Block ✅ 2025-12-30

**Problem:** No way to embed third-party content like Google Maps, YouTube videos, or other iframes.

**Solution Implemented:**
- [x] New "embed" block type added to section builder
- [x] Paste iframe embed code with real-time validation
- [x] Allowlist-based security (YouTube, Vimeo, Google Maps, Spotify, SoundCloud)
- [x] Clear error message when domain is not allowed
- [x] Aspect ratio options: 16:9 (video), 4:3, 1:1, custom height
- [x] Live preview in editor
- [x] Responsive iframe container on published sites
- [x] Templates: YouTube Video, Google Maps, Blank

**Task Document:** `ai_docs/tasks/040_embed_block.md`

**Files Created:**
- `lib/embed-utils.ts` - Allowlist validation and iframe parsing utilities
- `components/editor/blocks/EmbedEditor.tsx` - Editor with paste validation and preview
- `components/render/blocks/EmbedBlock.tsx` - Responsive iframe renderer

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Added "embed" to BLOCK_TYPES
- `lib/section-types.ts` - Added EmbedContent interface and BLOCK_TYPE_INFO
- `lib/section-defaults.ts` - Added embed defaults
- `lib/section-templates.ts` - Added embed templates
- `components/editor/SectionEditor.tsx` - Added EmbedEditor routing
- `components/editor/BlockIcon.tsx` - Added embed icon
- `components/render/BlockRenderer.tsx` - Added EmbedBlock routing

---

### 23. Anchor Links for Same-Page Navigation ✅ 2025-12-30

**Problem:** Header nav links could only point to other pages. Single-page sites needed links to sections on the same page.

**Solution Implemented:**
- [x] Added `anchor_id` column to sections table with page index
- [x] Optional "Section ID" field in editor (click badge to edit)
- [x] Visual indicator (badge) shows `#section-id` when set
- [x] Header nav links support `#section-id` syntax (manual entry)
- [x] Smooth scroll behavior on published sites
- [x] Client + server validation (alphanumeric + hyphens)
- [x] Duplicate ID check within same page

**Task Document:** `ai_docs/tasks/039_anchor_links_same_page_navigation.md`

**Files Created:**
- `components/editor/AnchorIdInput.tsx` - Inline anchor ID editor with validation
- `lib/anchor-utils.ts` - Validation utilities

**Files Modified:**
- `lib/drizzle/schema/sections.ts` - Added anchor_id column + index
- `app/actions/sections.ts` - Added updateSectionAnchorId action
- `components/editor/SectionCard.tsx` - Added AnchorIdInput to header
- `components/render/BlockRenderer.tsx` - Added id attribute wrapper
- `app/(sites)/sites/[siteSlug]/layout.tsx` - Added smooth scroll CSS

**Database Migration:** `0020_plain_white_queen` - Added anchor_id column to sections table

---

### 21. Image Library Management ✅ 2025-12-30

**Problem:** No way to view all uploaded images or delete unused/duplicate ones. Testing creates clutter.

**Solution Implemented:**
- [x] "Image Library" card in Settings tab with "Manage Images" button
- [x] Modal shows grid of all site images with thumbnails
- [x] Each image displays filename, file size, and upload date
- [x] Search input filters images by filename
- [x] Multi-select with checkboxes (Select All / Clear buttons)
- [x] Bulk delete with confirmation dialog
- [x] Extended ImageFile interface to include size from Supabase metadata
- [x] Added deleteImages server action for bulk deletion

**Task Document:** `ai_docs/tasks/038_image_library_management.md`

**Files Created:**
- `components/sites/ImageLibraryManager.tsx` - Full management UI with search, selection, delete
- `components/sites/ImageLibraryModal.tsx` - Dialog wrapper with trigger button

**Files Modified:**
- `app/actions/storage.ts` - Added size to ImageFile, added deleteImages action
- `components/sites/SettingsTab.tsx` - Added Image Library card

---

### 20. Feature Block Icon Picker ✅ 2025-12-30

**Problem:** Features editor had "Icon Name" text input expecting Lucide icon names. Users didn't know available icon names.

**Solution Implemented:**
- [x] Replaced text input with visual icon picker popover
- [x] Shows icon preview alongside name in trigger button
- [x] Searchable/filterable list of icons
- [x] Grouped into 10 categories (Common, Business, Contact, E-commerce, Tech, Media, Analytics, Navigation, Nature, Design)
- [x] Currently selected icon highlighted in picker grid
- [x] 65 curated icons available (subset of Lucide library)

**Task Document:** `ai_docs/tasks/037_feature_block_icon_picker.md`

**Files Created:**
- `components/editor/IconPicker.tsx` - Reusable icon picker popover component

**Files Modified:**
- `components/render/utilities/icon-resolver.tsx` - Added ICON_CATEGORIES export with categorized icon data
- `components/editor/blocks/FeaturesEditor.tsx` - Replaced Input with IconPicker component

---

### 22. Logo & Favicon Consolidation ✅ 2025-12-30

**Problem:** Logo and Favicon were configured separately in different places (Header for logo, Appearance for favicon). Often they should be the same image.

**Solution Implemented:**
- [x] New "Logo & Branding" card in Settings (after URL Settings)
- [x] Logo upload moved from HeaderEditor to Branding card
- [x] Toggle "Use different image for favicon" (default: OFF)
- [x] When toggle OFF: favicon automatically syncs to logo
- [x] When toggle ON: separate favicon upload appears
- [x] Removed standalone Favicon card
- [x] HeaderEditor shows reference text to Branding section
- [x] Added `use_separate_favicon` boolean column to sites table

**Task Document:** `ai_docs/tasks/036_logo_favicon_consolidation.md`

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added use_separate_favicon column
- `app/actions/sites.ts` - Handle new field in updateSiteSettings
- `components/sites/SettingsTab.tsx` - New Branding card, removed Favicon card
- `components/editor/blocks/HeaderEditor.tsx` - Replaced logo upload with info text

**Database Migration:** `0019_condemned_gorgon` - Added use_separate_favicon column to sites table

---

### 19. Contact Form Simple vs Detailed Fix ✅ 2025-12-30

**Problem:** Contact form had Simple and Detailed options, but both rendered identically. Neither included a Message field.

**Solution Implemented:**
- [x] Added `ContactVariant` type with "simple" and "detailed" options
- [x] Replaced broken custom fields system with variant selector dropdown
- [x] Simple variant shows: Name, Email (required), Message (required)
- [x] Detailed variant shows: Name, Email (required), Company, Phone, Message (required)
- [x] Message field is textarea, sent via email notification only
- [x] Message is NOT stored in database (contact info still stored)
- [x] Legacy data fallback for existing sections (defaults to "detailed")
- [x] Updated preview (ContactBlock) and published (ContactBlockPublished) forms
- [x] Simplified ContactEditor from 159 to 89 lines

**Task Document:** `ai_docs/tasks/035_contact_form_simple_detailed_fix.md`

**Files Modified:**
- `lib/section-types.ts` - Added ContactVariant type, simplified ContactContent
- `lib/section-defaults.ts` - Updated default to use variant
- `lib/section-templates.ts` - Updated contact templates
- `app/actions/contact.ts` - Added message validation and email handling
- `lib/email.ts` - Added message to notification
- `components/editor/blocks/ContactEditor.tsx` - Replaced with variant selector
- `components/render/blocks/ContactBlock.tsx` - Updated to render by variant
- `components/render/blocks/ContactBlockPublished.tsx` - Fixed rendering + Message field

---

### 18. Favicon Support for Child Sites ✅ 2025-12-30

**Problem:** Published child sites couldn't display custom favicons. Browser tabs showed default/no icon, lacking professional branding.

**Solution Implemented:**
- [x] Favicon upload in Site Settings (Appearance section)
- [x] Uses existing ImageUpload component for consistency
- [x] Favicon displays in browser tabs for all published pages
- [x] Same image serves as Apple Touch Icon for iOS bookmarks
- [x] Link to realfavicongenerator.net for creating favicons from logos
- [x] Moved static favicon from `app/` to `public/` so child sites can override

**Task Document:** `ai_docs/tasks/034_favicon_support_child_sites.md`

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added `favicon_url` column
- `app/actions/sites.ts` - Handle faviconUrl in updateSiteSettings
- `components/sites/SettingsTab.tsx` - Added Favicon card with ImageUpload
- `app/(sites)/sites/[siteSlug]/page.tsx` - Added icons to metadata
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Added icons to metadata
- `app/(sites)/sites/[siteSlug]/blog/page.tsx` - Added icons to metadata
- `app/(sites)/sites/[siteSlug]/blog/[postSlug]/page.tsx` - Added icons to metadata
- `app/(sites)/sites/[siteSlug]/blog/category/[categorySlug]/page.tsx` - Added icons to metadata
- `lib/queries/blog.ts` - Added favicon_url to blog post site query

**Database Migration:** `0018_violet_aqueduct` - Added favicon_url column to sites table

---

### 17. Contact Form Submissions ✅ 2025-12-29

**Problem:** Contact forms rendered but didn't actually submit anywhere.

**Solution Implemented:**
- [x] Functional contact forms on published sites
- [x] Submissions stored in database (unique per email per site, upsert pattern)
- [x] Fixed contact fields: Name, Email (required), Company, Phone
- [x] Email notifications via Resend (optional - works without API key)
- [x] Configured to send from verified domain: `noreply@updates.alexvwilson.com`
- [x] Reply-To header set to contact's email for easy replies
- [x] Spam protection: Honeypot field + rate limiting (5 per IP per 15 min)
- [x] Notification email configurable per site in Settings
- [x] Success/error feedback on form submission
- [x] "Submit another response" option after success

**Task Document:** `ai_docs/tasks/031_contact_form_submissions.md`

**Files Created:**
- `lib/drizzle/schema/contact-submissions.ts` - New table schema
- `lib/email.ts` - Resend client and notification function
- `lib/rate-limit.ts` - In-memory rate limiter
- `app/actions/contact.ts` - Form submission server action
- `components/render/blocks/ContactBlockPublished.tsx` - Interactive form component

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added `contact_notification_email` column
- `lib/drizzle/schema/index.ts` - Export contact-submissions schema
- `lib/env.ts` - Added optional `RESEND_API_KEY`
- `app/actions/sites.ts` - Handle notification email in settings
- `components/sites/SettingsTab.tsx` - Added Contact Form Notifications card
- `components/render/BlockRenderer.tsx` - Use ContactBlockPublished on published sites

**Database Migration:** `0016_cloudy_vector` - Added contact_submissions table and notification email column

**Dependencies Added:** `resend`

---

### 16. Logo Generation Assistant ✅ 2025-12-29

**Problem:** Site owners need logos/favicons but lack design skills. Currently they must manually create or hire designers.

**Solution Implemented:**
- [x] AI-powered logo prompt generator using OpenAI GPT-4o
- [x] Multi-step wizard modal: Context → Generating → Selection → Output
- [x] Auto-populates site name and primary color from active theme
- [x] User selects brand personality (Professional, Consumer, Tech, Creative)
- [x] Generates 10 unique concepts across 3 categories:
  - Decomposed (4): Functional visual metaphors
  - Monogram (3): Letter-based designs
  - SnapAI Pattern (3): Proven aesthetic patterns
- [x] Expert recommendations: Top, Alternative, and Safe choices highlighted
- [x] User can select 1-3 favorites and get ChatGPT-ready prompts
- [x] Copy button for each selected prompt
- [x] Transparent background prompt helper with copy button
- [x] Favicon instructions with realfavicongenerator.net link
- [x] Trimmy.io link for cropping
- [x] Previous Generations section to revisit past jobs
- [x] Progress tracking with Trigger.dev background task
- [x] Brand personality persists in database for reuse
- [x] Instructions point to Settings → Header Configuration for logo upload

**Task Document:** `ai_docs/tasks/030_logo_generation_assistant.md`

**Files Created:**
- `components/theme/LogoBrandingCard.tsx` - Logo & Branding card in Theme Tab
- `components/theme/LogoGeneratorModal.tsx` - Multi-step wizard modal
- `components/theme/LogoConceptCard.tsx` - Individual concept display card
- `app/actions/logo-generation.ts` - Server actions for triggering and polling jobs
- `lib/logo-jobs.ts` - Database helpers for logo generation jobs
- `lib/drizzle/schema/logo-generation-jobs.ts` - Job tracking table schema
- `trigger/tasks/generate-logo-prompts.ts` - Trigger.dev background task
- `trigger/utils/logo-prompts.ts` - OpenAI prompt engineering (SnapAI methodology)

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added `description`, `brand_personality` columns
- `lib/drizzle/schema/index.ts` - Export logo generation schema
- `components/theme/ThemeTab.tsx` - Integrated LogoBrandingCard and LogoGeneratorModal
- `trigger/index.ts` - Registered new task

**Database Migration:** `0012_*` - Added logo_generation_jobs table and site columns

**Reference:** Based on `.claude/commands/04_chatgpt_logo_generation.md` methodology

---

### 14 & 15. Header/Footer Layout Variants & Override System ✅ 2025-12-29

**Problem:** Header CTA visibility was implicit (based on field values). Header/footer had no layout variants. Page-level sections couldn't override site-level settings.

**Solution Implemented:**

**Task 028 - Header CTA Toggle:**
- [x] Add explicit `showCta` boolean field to HeaderContent interface
- [x] Add Switch toggle in HeaderEditor (site and page level)
- [x] Update HeaderBlock to check `showCta` flag with backwards compatibility

**Task 029 - Header/Footer Override System:**
- [x] Header layout variants: Left, Right, Center (logo centered with nav below)
- [x] Footer layout variants: Simple, Columns, Minimal
- [x] Sticky header toggle
- [x] Show/hide site name text toggle
- [x] Page-level override system using merge utilities
- [x] OverrideField component for page-level override toggles
- [x] Site-level content (name, logo, links) always from settings
- [x] Page sections can override: layout, sticky, showLogoText, CTA

**Task Documents:**
- `ai_docs/tasks/028_header_cta_toggle.md`
- `ai_docs/tasks/029_header_footer_override_system.md`

**Files Created:**
- `lib/header-footer-utils.ts` - Merge utilities for combining site and page settings
- `components/editor/OverrideField.tsx` - Toggle-based override control component

**Files Modified:**
- `lib/section-types.ts` - Added HeaderLayout, FooterLayout types, override flags
- `lib/section-defaults.ts` - Added default styling values
- `app/actions/sections.ts` - Updated getHeaderContentWithSiteData
- `components/editor/blocks/HeaderEditor.tsx` - Added styling options and page mode
- `components/editor/blocks/FooterEditor.tsx` - Added layout option and page mode
- `components/editor/SectionEditor.tsx` - Pass mode="page" for header/footer
- `components/render/blocks/HeaderBlock.tsx` - Layout variants rendering
- `components/render/blocks/FooterBlock.tsx` - Layout variants rendering
- `app/(sites)/sites/[siteSlug]/page.tsx` - Merge logic for published homepage
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Merge logic for published subpages
- `app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/page.tsx` - Merge logic for preview

---

### 10. Under Construction Mode ✅ 2025-12-28

**Problem:** Deployed sites are publicly accessible while still being built. Need a way to hide sites under development.

**Solution Implemented:**
- [x] Site-level toggle: "Under Construction" on/off in Settings
- [x] When enabled, public visitors see a "Coming Soon" page instead of site content
- [x] Owner (authenticated user) can still view the actual site
- [x] Customizable Coming Soon title and description
- [x] Dashboard shows 🚧 badge on sites under construction
- [x] Preview mode works normally regardless of construction status

**Task Document:** `ai_docs/tasks/022_under_construction_mode.md`
**Files Created:**
- `components/render/ComingSoonPage.tsx` - Coming Soon placeholder page

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added `under_construction`, `construction_title`, `construction_description` columns
- `app/actions/sites.ts` - Added handling for new settings fields
- `components/sites/SettingsTab.tsx` - Added Under Construction card with toggle and customization
- `app/(sites)/sites/[siteSlug]/page.tsx` - Added construction check for homepage
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Added construction check for subpages
- `components/sites/SiteCard.tsx` - Added construction badge
- `lib/queries/sites.ts` - Added `under_construction` to `getSitesWithPageCounts` query

**Database Migration:** `0011_nosy_vin_gonzales` - Added under_construction columns

---

### 9. Undo/Redo for Section Edits ✅ 2025-12-27

**Problem:** No way to revert accidental changes to section content.

**Solution Implemented:**
- [x] Browser-level undo/redo using React state + localStorage
- [x] Undo/Redo buttons in section editor toolbar
- [x] Keyboard shortcuts: Ctrl/Cmd+Z (undo), Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y (redo)
- [x] 50-step history limit per section
- [x] History persists across page refreshes via localStorage
- [x] Smart keyboard handling - doesn't interfere with text input undo
- [x] Stale history detection - clears localStorage if database content changed

**Task Document:** `ai_docs/tasks/021_undo_redo_section_edits.md`
**Files Created:**
- `hooks/useHistory.ts` - Generic undo/redo hook with localStorage persistence
- `components/editor/UndoRedoButtons.tsx` - Undo/Redo button pair with tooltips

**Files Modified:**
- `components/editor/SectionEditor.tsx` - Integrated history hook, keyboard shortcuts, toolbar buttons

---

### 8. Section Templates / Presets ✅ 2025-12-27

**Problem:** AI suggestions are one way to get started, but users might want pre-designed section variations.

**Solution Implemented:**
- [x] Created `lib/section-templates.ts` with 2-4 templates per block type
- [x] Two-step "Add Section" flow: select block type → select template
- [x] "Blank" option for default content
- [x] Templates include: Hero (4), Features (4), CTA (3), Testimonials (3), Text (3), Contact (2), Image (2), Gallery (2), Header (2), Footer (2)

**Task Document:** `ai_docs/tasks/020_section_templates.md`
**Files Created:**
- `lib/section-templates.ts` - Template definitions for all block types
- `components/editor/TemplateSelector.tsx` - Template selection UI

**Files Modified:**
- `app/actions/sections.ts` - Added optional `templateContent` parameter to `addSection`
- `components/editor/BlockPicker.tsx` - Two-step flow with template selection

---

### 7. Site Image Library & Global Header/Footer ✅ 2025-12-27

**Problem:** Users had to re-upload images for each section. Header/footer content had to be manually synchronized across pages.

**Solution Implemented:**
- [x] Image Library - Browse and select from previously uploaded images
- [x] New "Library" tab in ImageUpload component alongside Upload and URL
- [x] Site-level header/footer configuration in Settings tab
- [x] Header/footer applies automatically to all pages (published + preview)
- [x] Page-level header/footer sections filtered out when site-level is configured

**Task Document:** `ai_docs/tasks/019_site_image_library_global_header_footer.md`
**Files Created:**
- `components/editor/ImageLibrary.tsx` - Grid browser for site images

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added `header_content`, `footer_content` JSONB columns
- `app/actions/storage.ts` - Added `listSiteImages()` function
- `app/actions/sites.ts` - Extended `updateSiteSettings()` for header/footer
- `components/editor/ImageUpload.tsx` - Added "Library" tab
- `components/sites/SettingsTab.tsx` - Added Site Header & Footer configuration card
- `app/(sites)/sites/[siteSlug]/page.tsx` - Render site header/footer on published homepage
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Render site header/footer on published subpages
- `app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/page.tsx` - Pass site header/footer to preview
- `components/preview/PreviewFrame.tsx` - Render site header/footer in preview

**Database Migration:** `0010_pink_exodus` - Added header_content and footer_content columns

---

### 6. Image Upload (Supabase Storage) ✅ 2025-12-27

**Problem:** Images required external URLs. Users wanted to upload directly.

**Solution Implemented:**
- [x] Reusable ImageUpload component with drag-and-drop
- [x] Click to browse functionality
- [x] Upload progress indicator
- [x] Tab toggle between Upload and URL modes
- [x] Image preview after upload with remove button
- [x] Server action with file type and size validation
- [x] Files organized by userId/siteId in Supabase Storage
- [x] Integrated into all 5 image editors (Image, Hero, Gallery, Header, Testimonials)

**Task Document:** `ai_docs/tasks/017_image_upload_supabase_storage.md`
**Files Created:**
- `app/actions/storage.ts` - Upload/delete server actions
- `components/editor/ImageUpload.tsx` - Drag-drop upload component

**Files Modified:**
- `components/editor/SectionEditor.tsx` - Added siteId to editorProps
- `components/editor/SectionsList.tsx` - Pass siteId prop
- `components/editor/SectionCard.tsx` - Pass siteId prop
- `components/editor/blocks/ImageEditor.tsx` - Use ImageUpload
- `components/editor/blocks/HeroEditor.tsx` - Use ImageUpload for background
- `components/editor/blocks/GalleryEditor.tsx` - Use ImageUpload per image
- `components/editor/blocks/HeaderEditor.tsx` - Use ImageUpload for logo
- `components/editor/blocks/TestimonialsEditor.tsx` - Use ImageUpload for avatars

**Supabase Configuration Required:**
- Storage bucket with image mime types allowed
- RLS policy for authenticated uploads
- Public read access policy

---

### 5. Rich Text Editor for Text Sections ✅ 2025-12-27

**Problem:** Text sections used plain textarea. Users expected basic formatting (bold, italic, links, headings).

**Solution Implemented:**
- [x] Custom Tiptap editor with shadcn/ui-styled toolbar
- [x] Bold, Italic, H2, H3, Bullet/Numbered lists, Blockquote, Links
- [x] Undo/Redo support
- [x] HTML output stored in existing content.body field
- [x] Content normalization to handle plain text migration and proper paragraph structure
- [x] Proper HTML rendering on published pages with theme-aware styling

**Task Document:** `ai_docs/tasks/016_rich_text_editor.md`
**Files Created:**
- `components/editor/TiptapEditor.tsx` - Rich text editor with toolbar

**Files Modified:**
- `components/editor/blocks/TextEditor.tsx` - Dynamic import of TiptapEditor
- `components/render/blocks/TextBlock.tsx` - HTML rendering with theme-aware prose styles

**Dependencies Added:**
- `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`

---

### 4. Preview Mode Toggle for Light/Dark Testing ✅ 2025-12-27

**Problem:** While light/dark mode works on published sites, there was no way to test both modes in the editor preview.

**Solution Implemented:**
- [x] Added light/dark toggle to preview page (alongside device toggle)
- [x] Preview respects the toggle regardless of site's color_mode setting
- [x] Uses scoped CSS variables to avoid conflicts with admin app styles
- [x] Falls back to auto-generated dark palette if theme doesn't have darkColors

**Task Document:** `ai_docs/tasks/015_preview_color_mode_toggle.md`
**Files Created:**
- `components/preview/ColorModePreviewToggle.tsx` - Sun/Moon toggle button for preview

**Files Modified:**
- `components/preview/PreviewFrame.tsx` - Added PreviewThemeStyles, color mode state, toggle integration

---

### 3. Light/Dark Mode Support ✅ 2025-12-27

**Problem:** Sites were only rendered in light mode. Users wanted control over appearance.

**Solution Implemented:**
- [x] Site-level setting: Always Light / Always Dark / System Default / User Choice
- [x] If "User Choice": Toggle component appears on published site (top-right corner)
- [x] Theme schema supports dual color palettes (light + dark variants)
- [x] CSS variables approach for runtime switching
- [x] ColorModeScript prevents flash of wrong color mode on page load
- [x] Auto-generates dark palette if AI doesn't provide one

**Files Created:**
- `components/render/ThemeStyles.tsx` - Injects CSS variables for theme colors
- `components/render/ColorModeToggle.tsx` - Sun/Moon toggle button with localStorage persistence

**Files Modified:**
- `lib/drizzle/schema/sites.ts` - Added `color_mode` field
- `lib/drizzle/schema/theme-types.ts` - Added optional `darkColors` to ThemeData
- `trigger/utils/theme-prompts.ts` - Updated to request both light and dark palettes
- `trigger/utils/theme-parser.ts` - Added darkColors parsing
- `lib/theme-utils.ts` - Added `generateDefaultDarkPalette()` fallback
- `components/render/utilities/theme-styles.ts` - Changed to use CSS variables
- `components/render/blocks/*.tsx` - All blocks updated to use CSS variables
- `components/sites/SettingsTab.tsx` - Added Appearance card with color mode selector
- `app/(sites)/sites/[siteSlug]/page.tsx` - Added ThemeStyles, ColorModeScript, ColorModeToggle
- `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` - Same as above
- `app/actions/sites.ts` - Added colorMode to settings, improved revalidation

---

### 2. Manual Theme Editing ✅ 2025-12-27

**Problem:** Generated themes couldn't be manually adjusted. The "Duplicate Theme" feature was less useful without the ability to tweak the copy.

**Solution Implemented:**
- [x] Color pickers for all 8 theme colors (primary, secondary, accent, background, text, muted, muted text, border)
- [x] Font family dropdowns from curated Google Fonts list (categorized by Sans-Serif, Serif, Display)
- [x] Border radius slider for component roundness (0-24px)
- [x] Live preview while editing
- [x] Save/Cancel buttons with loading state
- [x] Edit from active theme section or saved themes dropdown

**Task Document:** `ai_docs/tasks/013_manual_theme_editing.md`
**Files Created:**
- `components/theme/ThemeEditor.tsx`
- `components/theme/ColorPickerField.tsx`
- `components/theme/FontSelect.tsx`
- `lib/theme-utils.ts`
**Files Modified:**
- `components/theme/ThemeTab.tsx`
- `components/theme/SavedThemesList.tsx`

---

### 1. Editor UX - Section Editing Discoverability ✅ 2025-12-27

**Problem:** Users didn't realize they could edit section content. The expand/collapse pattern using only the chevron icon was not intuitive.

**Solution Implemented:**
- [x] Made entire section header clickable to expand (not just chevron)
- [x] Added "Click to edit" hint on hover (collapsed state)
- [x] Added hover color change (icon + label turn primary color)
- [x] Added visual distinction for expanded state (subtle background)
- [x] Fixed drag handle to prevent accidental expand

**Task Document:** `ai_docs/tasks/012_editor_ux_section_discoverability.md`
**Files Modified:** `components/editor/SectionCard.tsx`

---

## Notes

- Features should be implemented one at a time to maintain stability
- Create a task document in `ai_docs/tasks/` before starting implementation
- Test thoroughly before marking complete
- Update this backlog as priorities shift

---

**Last Updated:** 2026-01-23 (Completed #85 Accordion Primitive)

---

## Related Documents

- [Blog System Planning](./blog-system-planning.md) - Detailed planning for the blog module
- [Course Platform Roadmap](./refs/course-platform-roadmap.md) - Exploratory roadmap for course/LMS capabilities
