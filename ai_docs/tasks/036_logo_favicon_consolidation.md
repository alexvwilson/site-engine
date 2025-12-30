# Task 036: Logo & Favicon Consolidation

> **Status:** Planning
> **Created:** 2025-12-30
> **Complexity:** Low

---

## 1. Task Overview

### Task Title
**Title:** Consolidate Logo & Favicon into Single "Branding" Section

### Goal Statement
**Goal:** Improve UX by combining logo and favicon configuration into a single "Branding" card in Site Settings. By default, the same image will be used for both logo and favicon, with an optional toggle to use a different image for favicon. This simplifies the common case where site owners want the same image for both.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Logo and favicon are currently configured in different places:
- **Logo:** Settings → Site Header & Footer → Header Configuration
- **Favicon:** Settings → Appearance (separate card)

This is unintuitive because:
1. Users often want the same image for both
2. Logo is buried inside "Header Configuration" which isn't obvious for branding
3. Two separate uploads when one would suffice in most cases

### Recommended Solution: Option A - New Branding Card

**Approach:** Create a new "Logo & Branding" card near the top of Settings that:
- Contains the logo upload (moved from HeaderEditor)
- Contains favicon with toggle "Use different image for favicon"
- When toggle is OFF: favicon automatically uses the logo image
- When toggle is ON: shows separate favicon upload

**Implementation Complexity:** Low
**Risk Level:** Low - UI restructuring only, no breaking changes

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS

### Current State

**Logo Configuration:**
- Stored in: `headerContent.logoUrl` (JSONB field in `sites.header_content`)
- Edited in: `HeaderEditor` component (lines 379-388)
- Located in: "Site Header & Footer" card in SettingsTab

**Favicon Configuration:**
- Stored in: `sites.favicon_url` (separate column)
- Edited in: Separate "Favicon" card in SettingsTab (lines 691-722)
- Used by: Published site metadata for browser tabs

### Existing Codebase Analysis

**Files to Modify:**
- [x] `lib/drizzle/schema/sites.ts` - Add `use_separate_favicon` boolean
- [x] `components/sites/SettingsTab.tsx` - Create Branding card, remove Favicon card, reorder
- [x] `components/editor/blocks/HeaderEditor.tsx` - Remove logo upload (reference Branding instead)
- [x] `app/actions/sites.ts` - Handle new field in updateSiteSettings

---

## 4. Context & Problem Definition

### Problem Statement
Site owners need to configure branding (logo + favicon) in two separate places. The logo is hidden inside "Header Configuration" and favicon is in a separate "Appearance" section. Most users want the same image for both, but currently must upload it twice.

### Success Criteria
- [ ] New "Logo & Branding" card appears near the top of Settings (after URL Settings)
- [ ] Logo upload is in the Branding card
- [ ] Toggle "Use different image for favicon" is available
- [ ] When toggle OFF: favicon automatically uses logo image
- [ ] When toggle ON: separate favicon upload appears
- [ ] Existing logo data migrates correctly (no data loss)
- [ ] HeaderBlock still renders logo correctly
- [ ] Published sites still show correct favicon

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns** for this change
- **Data migration:** Existing favicon_url values should be preserved
- **Priority:** Clean UX over complexity

---

## 6. Technical Requirements

### Functional Requirements
- User can upload logo in the new Branding card
- User can toggle "Use different image for favicon"
- When toggle is OFF, favicon uses the logo image automatically
- When toggle is ON, user can upload a separate favicon
- Header still displays the logo correctly on published sites
- Favicon still shows in browser tabs on published sites

### Non-Functional Requirements
- **Performance:** No impact (simple UI restructuring)
- **Responsive Design:** Branding card works on mobile
- **Theme Support:** Works in light/dark mode

### Technical Constraints
- Must keep `headerContent.logoUrl` for HeaderBlock rendering compatibility
- Must keep `favicon_url` column for metadata generation

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- Add use_separate_favicon column to sites table
ALTER TABLE sites ADD COLUMN use_separate_favicon BOOLEAN NOT NULL DEFAULT false;
```

### Data Model Updates

```typescript
// lib/drizzle/schema/sites.ts
export const sites = pgTable("sites", {
  // ... existing columns ...
  use_separate_favicon: boolean("use_separate_favicon").notNull().default(false),
});
```

### Data Migration Plan
- [ ] Add `use_separate_favicon` column with default `false`
- [ ] Existing sites with favicon_url that differs from logo will need manual toggle
- [ ] No automatic data migration needed (defaults work correctly)

### Down Migration Safety Protocol
- [ ] Create down migration before running `npm run db:migrate`

---

## 8. Backend Changes

### Server Actions

Update `app/actions/sites.ts`:
- [ ] Add `useSeparateFavicon` to updateSiteSettings params
- [ ] When `useSeparateFavicon` is false and logo changes, also update favicon_url

---

## 9. Frontend Changes

### Component Changes

#### 1. New Branding Card in SettingsTab

Create a new card after "URL Settings" containing:
- Logo upload (moved from HeaderEditor)
- "Use different image for favicon" toggle
- Conditional favicon upload (when toggle is ON)

#### 2. Update HeaderEditor

- Remove the logo upload section (lines 379-388)
- Add informational text: "Logo is configured in Site Settings → Branding"
- Keep all other header configuration (site name, nav links, CTA, styling)

#### 3. Remove Favicon Card

- Delete the standalone "Favicon" card (lines 691-722)
- Functionality moves to Branding card

### State Management

In SettingsTab:
- Add `useSeparateFavicon` state
- Logo updates `headerContent.logoUrl`
- When `useSeparateFavicon` is false: `faviconUrl` syncs from `headerContent.logoUrl`
- When `useSeparateFavicon` is true: `faviconUrl` is independent

---

## 10. Code Changes Overview

### Current Implementation (Before)

**SettingsTab.tsx - Favicon Card (lines 691-722):**
```tsx
{/* Favicon */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Globe className="h-5 w-5" />
      Favicon
    </CardTitle>
    ...
  </CardHeader>
  <CardContent>
    <ImageUpload
      value={faviconUrl}
      onChange={setFaviconUrl}
      ...
    />
  </CardContent>
</Card>
```

**HeaderEditor.tsx - Logo Upload (lines 379-388):**
```tsx
<div className="space-y-2">
  <Label>Logo (optional)</Label>
  <ImageUpload
    value={content.logoUrl || ""}
    onChange={(url) => handleFieldChange("logoUrl", url)}
    siteId={siteId}
    disabled={disabled}
    placeholder="Drag & drop your logo"
  />
</div>
```

### After Refactor

**SettingsTab.tsx - New Branding Card (after URL Settings):**
```tsx
{/* Logo & Branding */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <ImageIcon className="h-5 w-5" />
      Logo & Branding
    </CardTitle>
    <CardDescription>
      Your site logo and favicon (browser tab icon)
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Logo Upload */}
    <div className="space-y-2">
      <Label>Logo</Label>
      <ImageUpload
        value={headerContent.logoUrl || ""}
        onChange={handleLogoChange}
        siteId={site.id}
        disabled={loading}
      />
      <p className="text-sm text-muted-foreground">
        Your logo appears in the site header
      </p>
    </div>

    <Separator />

    {/* Favicon Section */}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="useSeparateFavicon">Use different image for favicon</Label>
          <p className="text-sm text-muted-foreground">
            {useSeparateFavicon
              ? "Upload a separate favicon image"
              : "Logo will be used as favicon"}
          </p>
        </div>
        <Switch
          id="useSeparateFavicon"
          checked={useSeparateFavicon}
          onCheckedChange={setUseSeparateFavicon}
          disabled={loading}
        />
      </div>

      {useSeparateFavicon && (
        <div className="space-y-2">
          <Label>Favicon</Label>
          <ImageUpload
            value={faviconUrl}
            onChange={setFaviconUrl}
            siteId={site.id}
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            Square image recommended (512x512px)
          </p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

**HeaderEditor.tsx - Remove Logo, Add Reference:**
```tsx
{/* Logo info - configured in Branding */}
<p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
  Logo is configured in Site Settings → Logo & Branding section above.
</p>
```

### Key Changes Summary
- [ ] **New Branding Card:** Combined logo + favicon with toggle
- [ ] **Remove Favicon Card:** Functionality moved to Branding
- [ ] **Update HeaderEditor:** Remove logo upload, add reference text
- [ ] **New DB Column:** `use_separate_favicon` boolean
- [ ] **Sync Logic:** When toggle OFF, favicon = logo

---

## 11. Implementation Plan

### Phase 1: Database Changes
**Goal:** Add new column for tracking separate favicon preference

- [ ] **Task 1.1:** Update schema with `use_separate_favicon` column
  - Files: `lib/drizzle/schema/sites.ts`
- [ ] **Task 1.2:** Generate migration
  - Command: `npm run db:generate`
- [ ] **Task 1.3:** Create down migration
  - Files: `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Task 1.4:** Apply migration
  - Command: `npm run db:migrate`

### Phase 2: Backend Updates
**Goal:** Update server action to handle new field

- [ ] **Task 2.1:** Update Site type export
  - Files: `lib/drizzle/schema/sites.ts`
- [ ] **Task 2.2:** Update updateSiteSettings action
  - Files: `app/actions/sites.ts`
  - Add `useSeparateFavicon` parameter handling

### Phase 3: Frontend - Branding Card
**Goal:** Create new Branding card and remove old Favicon card

- [ ] **Task 3.1:** Add state for `useSeparateFavicon`
  - Files: `components/sites/SettingsTab.tsx`
- [ ] **Task 3.2:** Create Branding card with logo upload
  - Files: `components/sites/SettingsTab.tsx`
- [ ] **Task 3.3:** Add favicon toggle and conditional upload
  - Files: `components/sites/SettingsTab.tsx`
- [ ] **Task 3.4:** Implement sync logic (logo → favicon when toggle OFF)
  - Files: `components/sites/SettingsTab.tsx`
- [ ] **Task 3.5:** Remove old Favicon card
  - Files: `components/sites/SettingsTab.tsx`
- [ ] **Task 3.6:** Update hasChanges detection
  - Files: `components/sites/SettingsTab.tsx`

### Phase 4: Frontend - HeaderEditor Update
**Goal:** Remove logo upload from HeaderEditor

- [ ] **Task 4.1:** Remove logo upload section
  - Files: `components/editor/blocks/HeaderEditor.tsx`
- [ ] **Task 4.2:** Add informational text about branding location
  - Files: `components/editor/blocks/HeaderEditor.tsx`

### Phase 5: Testing & Validation
**Goal:** Verify all functionality works correctly

- [ ] **Task 5.1:** Test logo upload in Branding card
- [ ] **Task 5.2:** Test favicon sync when toggle is OFF
- [ ] **Task 5.3:** Test separate favicon upload when toggle is ON
- [ ] **Task 5.4:** Verify header renders logo on published site
- [ ] **Task 5.5:** Verify favicon shows in browser tab
- [ ] **Task 5.6:** Test existing sites (backward compatibility)

---

## 12. Task Completion Tracking

*(Will be updated during implementation)*

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `lib/drizzle/schema/sites.ts` - Add column
- [ ] `app/actions/sites.ts` - Handle new field
- [ ] `components/sites/SettingsTab.tsx` - Major UI changes
- [ ] `components/editor/blocks/HeaderEditor.tsx` - Remove logo section

### No New Files Required
This task only modifies existing files.

---

## 14. Potential Issues & Edge Cases

### Edge Cases
- [ ] **Existing sites with favicon but no logo:** Toggle should default to ON
- [ ] **Sites with matching logo and favicon:** Toggle defaults to OFF
- [ ] **Empty logo with existing favicon:** Favicon should not be cleared

### Security Review
- [ ] No new security concerns (existing auth/upload patterns)

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

Follow the standard task workflow:
1. Execute phases sequentially
2. Update task document after each phase
3. Present completion message after Phase 4
4. Request code review approval
5. Request user browser testing

---

## 17. Notes

**Reference:** Feature #22 from `ai_docs/features-backlog.md`

**UX Improvement:** This consolidation simplifies the common case (same image for logo and favicon) while still allowing flexibility when needed.

---

*Template Version: 1.0*
