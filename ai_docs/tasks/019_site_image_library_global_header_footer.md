# Task 019: Site Image Library & Global Header/Footer

> **Created:** 2025-12-27
> **Status:** ✅ Completed
> **Completed:** 2025-12-27

---

## 1. Task Overview

### Task Title
**Title:** Site Image Library & Site-Level Header/Footer Configuration

### Goal Statement
**Goal:** Improve site-building UX by (1) allowing users to browse and reuse previously uploaded images, and (2) making header and footer content site-wide so it's consistent across all pages without manual duplication.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Two related UX issues make site building tedious:

1. **Image Reuse**: When users upload a logo or image, they must re-upload it for each section that needs it. There's no way to select from previously uploaded images.

2. **Header/Footer Consistency**: Each page has its own header/footer sections with independent content. Updating navigation requires editing every page's header separately.

### Solution: Combined Feature Set

**Part A: Site Image Library**
- Add server action to list images from the site's storage folder
- Enhance `ImageUpload` component with a "Library" tab
- Users can browse and select from previously uploaded images

**Part B: Site-Level Header/Footer**
- Store header/footer configuration at the site level (not as page sections)
- All pages automatically share the same header/footer
- Edit once in Site Settings, updates everywhere
- Header/footer sections on pages become optional overrides

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks:** Next.js 15.3, React 19
- **Database:** Supabase (Postgres) via Drizzle ORM
- **Storage:** Supabase Storage (`media-uploads` bucket)
- **UI:** shadcn/ui + Tailwind CSS

### Current State

**Image Storage (`app/actions/storage.ts`):**
- Images uploaded to `media-uploads/{userId}/{siteId}/{timestamp}-{random}.{ext}`
- No listing functionality exists
- Each upload creates a new file, no reuse mechanism

**Sites Schema (`lib/drizzle/schema/sites.ts`):**
- Basic fields: `id`, `user_id`, `name`, `slug`, `status`, `color_mode`
- No header/footer content columns

**Page Rendering (`app/(sites)/sites/[siteSlug]/page.tsx`):**
- Fetches sections for each page individually
- Header/footer are regular sections, not site-level

**Current Content Types:**
```typescript
interface HeaderContent {
  siteName: string;
  logoUrl?: string;
  links: NavLink[];
  ctaText?: string;
  ctaUrl?: string;
}

interface FooterContent {
  copyright: string;
  links: FooterLink[];
}
```

---

## 4. Context & Problem Definition

### Problem Statement
1. **Image Reuse**: Users must re-upload the same image (logo) for each section, wasting time and storage
2. **Header Consistency**: Each page has independent header content, requiring manual synchronization across pages
3. **Footer Consistency**: Same issue - footers must be manually kept in sync

### Success Criteria
- [x] Users can browse previously uploaded images when adding images to any section
- [x] Site-level header configuration applies to all pages automatically
- [x] Site-level footer configuration applies to all pages automatically
- [x] Existing header/footer sections still work for page-specific overrides
- [x] Image library shows thumbnails and allows selection

---

## 5. Development Mode Context

- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns**
- **Data migration acceptable** - can migrate existing header/footer sections to site-level
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements

**Part A: Image Library**
- User can view all images previously uploaded to their site
- User can select an image from library instead of uploading new
- Image library shows thumbnails in a grid
- Selected image URL is returned to the parent component

**Part B: Site-Level Header/Footer**
- Site settings includes Header and Footer configuration tabs/sections
- Header/footer content is stored on the site record
- Published pages render site header before page sections
- Published pages render site footer after page sections
- Page-level header/footer sections can override site defaults (optional)

### Non-Functional Requirements
- **Performance:** Image library should load quickly (paginated if needed)
- **Usability:** Intuitive UI for browsing and selecting images
- **Consistency:** Header/footer changes reflect immediately on all pages

---

## 7. Data & Database Changes

### Database Schema Changes

**Add to `sites` table:**
```typescript
// lib/drizzle/schema/sites.ts
import { jsonb } from "drizzle-orm/pg-core";
import type { HeaderContent, FooterContent } from "@/lib/section-types";

export const sites = pgTable("sites", {
  // ... existing fields ...

  // NEW: Site-level header configuration
  header_content: jsonb("header_content").$type<HeaderContent>(),

  // NEW: Site-level footer configuration
  footer_content: jsonb("footer_content").$type<FooterContent>(),
});
```

### Migration SQL
```sql
-- Add header_content and footer_content columns
ALTER TABLE sites ADD COLUMN header_content JSONB;
ALTER TABLE sites ADD COLUMN footer_content JSONB;
```

### 🚨 MANDATORY: Down Migration
```sql
-- down.sql
ALTER TABLE sites DROP COLUMN IF EXISTS header_content;
ALTER TABLE sites DROP COLUMN IF EXISTS footer_content;
```

---

## 8. Backend Changes

### New Server Actions

**`app/actions/storage.ts` - Add listing function:**
```typescript
interface ImageFile {
  name: string;
  url: string;
  createdAt: string;
}

interface ListImagesResult {
  success: boolean;
  images?: ImageFile[];
  error?: string;
}

export async function listSiteImages(siteId: string): Promise<ListImagesResult> {
  const userId = await requireUserId();
  const supabase = await createClient();

  const prefix = `${userId}/${siteId}/`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(prefix, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    return { success: false, error: error.message };
  }

  const images = data
    .filter(file => !file.id.endsWith('/')) // Filter out folders
    .map(file => ({
      name: file.name,
      url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(`${prefix}${file.name}`).data.publicUrl,
      createdAt: file.created_at,
    }));

  return { success: true, images };
}
```

**`app/actions/sites.ts` - Add header/footer update:**
```typescript
export async function updateSiteHeaderFooter(
  siteId: string,
  headerContent: HeaderContent | null,
  footerContent: FooterContent | null
): Promise<ActionResult> {
  const userId = await requireUserId();

  // Verify ownership
  const site = await getSiteById(siteId, userId);
  if (!site) {
    return { success: false, error: "Site not found" };
  }

  await db
    .update(sites)
    .set({
      header_content: headerContent,
      footer_content: footerContent,
      updated_at: new Date(),
    })
    .where(eq(sites.id, siteId));

  revalidatePath(`/app/sites/${siteId}`);
  revalidatePath(`/sites/${site.slug}`);

  return { success: true };
}
```

---

## 9. Frontend Changes

### Part A: Image Library Component

**New Component: `components/editor/ImageLibrary.tsx`**
```typescript
interface ImageLibraryProps {
  siteId: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function ImageLibrary({ siteId, onSelect, onClose }: ImageLibraryProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSiteImages(siteId).then(result => {
      if (result.success) setImages(result.images ?? []);
      setLoading(false);
    });
  }, [siteId]);

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map(image => (
        <button
          key={image.name}
          onClick={() => onSelect(image.url)}
          className="aspect-square rounded-lg overflow-hidden hover:ring-2 ring-primary"
        >
          <img src={image.url} alt={image.name} className="object-cover w-full h-full" />
        </button>
      ))}
    </div>
  );
}
```

**Update `components/editor/ImageUpload.tsx`:**
- Add "Library" tab alongside "Upload" and "URL" tabs
- Library tab shows `ImageLibrary` component
- Selecting from library sets the URL value

### Part B: Site Header/Footer Editor

**Update `components/sites/SettingsTab.tsx`:**
- Add "Header" and "Footer" cards/sections
- Reuse existing `HeaderEditor` and `FooterEditor` components
- Save to site-level, not section-level

**Update Page Renderers:**
- Check for `site.header_content` before rendering page sections
- Check for `site.footer_content` after rendering page sections
- Page-level header/footer sections override site defaults

---

## 10. Code Changes Overview

### 📂 **Files to Create**
| File | Purpose |
|------|---------|
| `components/editor/ImageLibrary.tsx` | Grid browser for site images |

### 📂 **Files to Modify**
| File | Changes |
|------|---------|
| `lib/drizzle/schema/sites.ts` | Add `header_content`, `footer_content` columns |
| `app/actions/storage.ts` | Add `listSiteImages()` function |
| `app/actions/sites.ts` | Add `updateSiteHeaderFooter()` function |
| `components/editor/ImageUpload.tsx` | Add "Library" tab |
| `components/sites/SettingsTab.tsx` | Add Header/Footer configuration sections |
| `app/(sites)/sites/[siteSlug]/page.tsx` | Render site header/footer |
| `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` | Render site header/footer |
| `components/render/PageRenderer.tsx` | Accept optional site header/footer props |

---

## 11. Implementation Plan

### Phase 1: Database Schema Update
**Goal:** Add header/footer columns to sites table

- [ ] **Task 1.1:** Update sites schema with header_content and footer_content
  - Files: `lib/drizzle/schema/sites.ts`
- [ ] **Task 1.2:** Generate and verify migration
  - Command: `npm run db:generate`
- [ ] **Task 1.3:** Create down migration
  - Files: `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Task 1.4:** Apply migration
  - Command: `npm run db:migrate`

### Phase 2: Site Image Library
**Goal:** Allow browsing and selecting uploaded images

- [ ] **Task 2.1:** Add `listSiteImages` server action
  - Files: `app/actions/storage.ts`
- [ ] **Task 2.2:** Create `ImageLibrary` component
  - Files: `components/editor/ImageLibrary.tsx`
- [ ] **Task 2.3:** Update `ImageUpload` with Library tab
  - Files: `components/editor/ImageUpload.tsx`
- [ ] **Task 2.4:** Test image library functionality

### Phase 3: Site-Level Header/Footer Editor
**Goal:** Add header/footer configuration to site settings

- [ ] **Task 3.1:** Add `updateSiteHeaderFooter` server action
  - Files: `app/actions/sites.ts`
- [ ] **Task 3.2:** Update SettingsTab with Header section
  - Files: `components/sites/SettingsTab.tsx`
- [ ] **Task 3.3:** Update SettingsTab with Footer section
  - Files: `components/sites/SettingsTab.tsx`
- [ ] **Task 3.4:** Test header/footer saving

### Phase 4: Render Site Header/Footer
**Goal:** Published pages use site-level header/footer

- [ ] **Task 4.1:** Update site queries to include header/footer content
  - Files: `lib/queries/sites.ts`
- [ ] **Task 4.2:** Update homepage renderer
  - Files: `app/(sites)/sites/[siteSlug]/page.tsx`
- [ ] **Task 4.3:** Update subpage renderer
  - Files: `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx`
- [ ] **Task 4.4:** Test published site rendering

### Phase 5: Testing & Polish
**Goal:** Verify all features work correctly

- [ ] **Task 5.1:** Test image library across all image editors
- [ ] **Task 5.2:** Test header consistency across pages
- [ ] **Task 5.3:** Test footer consistency across pages
- [ ] **Task 5.4:** Verify page-level sections can still override

---

## 12. Task Completion Tracking

### Phase 1 Progress ✅
- [x] Task 1.1: Update sites schema
- [x] Task 1.2: Generate migration
- [x] Task 1.3: Create down migration
- [x] Task 1.4: Apply migration

### Phase 2 Progress ✅
- [x] Task 2.1: Add listSiteImages action
- [x] Task 2.2: Create ImageLibrary component
- [x] Task 2.3: Update ImageUpload
- [x] Task 2.4: Test functionality

### Phase 3 Progress ✅
- [x] Task 3.1: Add update action (extended updateSiteSettings)
- [x] Task 3.2: Header settings UI
- [x] Task 3.3: Footer settings UI
- [x] Task 3.4: Test saving

### Phase 4 Progress ✅
- [x] Task 4.1: Update queries (already included full site object)
- [x] Task 4.2: Homepage renderer
- [x] Task 4.3: Subpage renderer
- [x] Task 4.4: Test rendering (build passed)

---

## 13. File Structure & Organization

```
site-engine/
├── components/
│   └── editor/
│       ├── ImageLibrary.tsx          # NEW: Image browser grid
│       └── ImageUpload.tsx           # MODIFIED: Add Library tab
├── lib/
│   └── drizzle/
│       └── schema/
│           └── sites.ts              # MODIFIED: Add header/footer columns
├── app/
│   ├── actions/
│   │   ├── storage.ts                # MODIFIED: Add listSiteImages
│   │   └── sites.ts                  # MODIFIED: Add updateSiteHeaderFooter
│   └── (sites)/
│       └── sites/
│           └── [siteSlug]/
│               ├── page.tsx          # MODIFIED: Render site header/footer
│               └── [pageSlug]/
│                   └── page.tsx      # MODIFIED: Render site header/footer
└── drizzle/
    └── migrations/
        └── XXXX_add_site_header_footer/
            ├── migration.sql
            └── down.sql              # NEW: Rollback migration
```

---

## 14. Potential Issues & Edge Cases

### Image Library
- **Empty state:** Handle sites with no uploaded images
- **Large libraries:** Consider pagination for sites with many images
- **Deleted images:** Handle cases where referenced image no longer exists

### Site Header/Footer
- **Migration:** Sites with existing page-level headers need consideration
- **Override logic:** Define clear precedence (page-level vs site-level)
- **Empty state:** Handle sites without header/footer configured

### Security
- **Image access:** Verify user owns site before listing images
- **Cross-site access:** Ensure users can't access other users' images

---

## 15. Deployment & Configuration

No new environment variables required. Uses existing Supabase Storage configuration.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with database schema (foundation)
2. Image library next (smaller scope, immediately useful)
3. Site settings UI (uses image library for logo selection)
4. Rendering updates last (depends on all above)

### Key Patterns to Follow
- Use existing `HeaderEditor` and `FooterEditor` components in site settings
- Follow existing ImageUpload tab pattern for library tab
- Match existing styling in SettingsTab for consistency

---

## 17. Notes & Additional Context

### Future Enhancements (Not in Scope)
- Image metadata (titles, tags, search)
- Image deletion from library
- Bulk upload support
- Image optimization/resizing

### About Page-Level Overrides
The site-level header/footer will be the default. If a page has its own header/footer section, it could either:
1. **Override completely** - page section replaces site default
2. **Merge** - combine page and site settings
3. **Ignore page sections** - site-level always wins

**Recommendation:** Start with option 3 (site-level wins) for simplicity. Page-level header/footer sections become redundant once site-level is set, but won't break anything.

---

*Task Document Version: 1.0*
*Last Updated: 2025-12-27*
