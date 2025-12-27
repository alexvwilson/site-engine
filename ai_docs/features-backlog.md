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

### 1. Light/Dark Mode Support

**Problem:** Sites are only rendered in light mode. Users want control over appearance.

**Requirements:**
- [ ] Site-level setting: Always Light / Always Dark / System Default / User Choice
- [ ] If "User Choice": Add toggle component on published site
- [ ] Theme schema needs dual color palettes (light + dark variants)
- [ ] Preview should support testing both modes
- [ ] CSS variables approach for runtime switching

**Scope:**
- Database: Add `color_mode` field to sites or themes table
- Theme Schema: Add `darkColors` object alongside existing colors
- AI Generation: Update prompts to generate both light and dark palettes
- Renderer: Apply correct palette based on mode
- Published Site: Conditional toggle component
- Preview: Device toggle + mode toggle

**Complexity:** Medium-High (touches many files)

**Files Affected:**
- `lib/drizzle/schema/sites.ts` or `themes.ts`
- `trigger/utils/theme-prompts.ts`
- `trigger/utils/theme-parser.ts`
- `components/render/utilities/theme-styles.ts`
- `components/render/PageRenderer.tsx`
- New: `components/render/ColorModeToggle.tsx`
- `app/(sites)/sites/[siteSlug]/layout.tsx`

---

## P2 - Medium Priority

### 2. Rich Text Editor for Text Sections

**Problem:** Text sections use plain textarea. Users expect basic formatting (bold, italic, links).

**Options:**
- Tiptap (modern, extensible, good DX)
- Slate (powerful but complex)
- react-quill (simple but dated)

**Scope:**
- Replace textarea in TextEditor with rich text editor
- Store HTML or JSON content format
- Update TextBlock renderer to handle formatted content

**Complexity:** Medium

---

### 3. Image Upload (Supabase Storage)

**Problem:** Images require external URLs. Users want to upload directly.

**Current State:** All image fields accept URLs only. Supabase storage config deferred.

**Requirements:**
- [ ] Configure Supabase storage bucket
- [ ] Build upload component with drag-and-drop
- [ ] Image optimization/resizing
- [ ] Progress indicator during upload
- [ ] Replace URL inputs with upload + URL option

**Complexity:** Medium

---

### 4. Undo/Redo for Section Edits

**Problem:** No way to revert accidental changes to section content.

**Options:**
- Browser-level: Store edit history in state/localStorage
- Database-level: Version history for sections

**Complexity:** Medium-High

---

### 5. Section Templates / Presets

**Problem:** AI suggestions are one way to get started, but users might want pre-designed section variations.

**Idea:** Curated section presets per block type (e.g., 3 hero styles, 4 feature layouts)

**Complexity:** Medium

---

### 6. Guided Theme Generation Mode

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

**Last Updated:** 2025-12-27 (Manual Theme Editing completed)
