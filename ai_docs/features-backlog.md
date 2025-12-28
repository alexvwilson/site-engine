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

_No items currently in P1_

---

## P2 - Medium Priority

### 4. Undo/Redo for Section Edits

**Problem:** No way to revert accidental changes to section content.

**Options:**
- Browser-level: Store edit history in state/localStorage
- Database-level: Version history for sections

**Complexity:** Medium-High

---

### 5. Guided Theme Generation Mode

**Problem:** Quick mode generates entire theme at once. Some users want more control.

**Current State:** Deferred from Phase 5. Prompts and schema support exists but UI not built.

**Requirements:**
- [ ] Multi-stage flow: Colors -> Typography -> Component Styles
- [ ] Approve/adjust/regenerate at each stage
- [ ] Build ColorReview, TypographyReview, ComponentPreview components

**Complexity:** High (significant UI work)

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

### 9. Form Submissions (Contact Section)

**Problem:** Contact forms render but don't actually submit anywhere.

**Requirements:**
- Store submissions in database
- Email notifications
- Spam protection (reCAPTCHA or similar)

**Complexity:** Medium

---

### 10. SEO Enhancements

- Sitemap generation
- robots.txt configuration
- Structured data / JSON-LD
- Social sharing previews

**Complexity:** Medium

---

### 11. Page Templates

**Problem:** Every page starts empty. Users might want common starting points.

**Idea:** Pre-built page templates (Landing Page, About, Contact, Blog Post)

**Complexity:** Low-Medium

---

### 12. Collaboration / Team Features

- Multiple users per site
- Role-based permissions
- Edit history / audit log

**Complexity:** High

---

### 13. Export / Backup

- Export site as static HTML/CSS
- JSON backup of site data
- Import from backup

**Complexity:** Medium

---

## Completed Features

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

**Last Updated:** 2025-12-27 (Section Templates completed)
