# Site Engine - Features Backlog

> Post-MVP feature requests and enhancements, organized by priority.
> When ready to implement, create a task document in `ai_docs/tasks/`.

---

## Priority Tiers

- **P0 - Critical**: Blocking user experience, should do next
- **P1 - High**: Important for usability, do soon
- **P2 - Medium**: Nice to have, improves experience
- **P3 - Low**: Future consideration, backlog items

---

## P1 - High Priority

*(No items currently in P1)*

---

## P2 - Medium Priority

### 24. Gallery Layout Options

**Problem:** Gallery has fixed layout (flex wrap, object-cover). No control over aspect ratio or display style.

**Current State:** Images display at fixed height with object-cover, responsive flex layout.

**Requirements:**
- Aspect ratio options: Square (1:1, default), Landscape (16:9, 4:3), Portrait (3:4), Original
- Layout variants:
  - Grid (current behavior, improved)
  - Masonry (Pinterest-style)
  - Carousel/Slider (arrows or dots navigation)
- Columns setting (2, 3, 4, auto)
- Gap/spacing control
- Lightbox option on click

**Complexity:** Medium-High

---

### 25. Embed Block

**Problem:** No way to embed third-party content like Google Maps, chat widgets, or other iframes.

**Use Case:** Google Maps embed for business SEO, social media feeds, booking widgets.

**Requirements:**
- New block type: "embed"
- Paste iframe/embed code from third-party services
- Sanitize/validate embed code for security
- Preview in editor (may need sandboxing)
- Common presets: Google Maps, YouTube, etc.
- Responsive container options

**Complexity:** Medium (security considerations for arbitrary HTML)

---

### 26. Legal Pages for Child Sites

**Problem:** Footer legal links (Privacy Policy, Terms) currently link to Site Engine's legal pages, not the child site's own policies.

**Requirements:**
- Site owner selects which legal pages to generate (checkboxes):
  - Privacy Policy
  - Terms of Service
  - Cookie Policy
- AI generates legal content specific to the child site's business
- Trigger.dev background task for generation
- Auto-creates pages with generated content
- Footer links point to child site's legal pages
- Ability to edit generated content

**Complexity:** Medium-High (AI generation + page creation)

---

## P3 - Low Priority / Future

### 7. Custom Domain Support

**Problem:** Sites only accessible via `/sites/[slug]`. Users want custom domains.

**Current State:** `custom_domain` field exists in sites table but unused.

**Requirements:**
- DNS configuration UI
- SSL certificate provisioning (via hosting platform)
- Domain verification flow
- Middleware updates for domain routing

**Complexity:** High (infrastructure-dependent)

---

### 8. Site Analytics

**Problem:** No visibility into site traffic/engagement.

**Options:**
- Integrate with external (Google Analytics, Plausible)
- Build simple internal analytics

**Complexity:** Medium-High

---

### 9. SEO Enhancements

- Sitemap generation
- robots.txt configuration
- Structured data / JSON-LD
- Social sharing previews

**Complexity:** Medium

---

### 10. Page Templates

**Problem:** Every page starts empty. Users might want common starting points.

**Idea:** Pre-built page templates (Landing Page, About, Contact, Blog Post)

**Complexity:** Low-Medium

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

## Completed Features

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

**Last Updated:** 2025-12-30 (Completed #23 Anchor Links for Same-Page Navigation)

---

## Related Documents

- [Blog System Planning](./blog-system-planning.md) - Detailed planning for the blog module
