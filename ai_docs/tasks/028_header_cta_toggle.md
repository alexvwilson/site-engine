# Task 028: Header CTA Button Toggle

> **Status:** Completed
> **Created:** 2025-12-29
> **Complexity:** Low

---

## 1. Task Overview

### Task Title
**Title:** Add Explicit CTA Button Toggle to Header

### Goal Statement
**Goal:** Add an explicit `showCta` boolean toggle to the header configuration, replacing the current implicit show/hide behavior (CTA shows when both `ctaText` AND `ctaUrl` have values). This gives users clear control over CTA visibility without having to clear field values.

---

## 2. Strategic Analysis & Solution Options

**Strategic analysis skipped** - This is a straightforward enhancement with a single obvious implementation approach. No architectural decisions needed.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State

**Current Behavior:**
- CTA button shows automatically when both `ctaText` AND `ctaUrl` have non-empty values
- To hide the CTA, users must manually clear both fields
- No explicit toggle exists

**Current Implementation:**
```typescript
// lib/section-types.ts - HeaderContent interface
export interface HeaderContent {
  siteName: string;
  logoUrl?: string;
  links: NavLink[];
  ctaText?: string;   // Optional - CTA shows if both this AND ctaUrl exist
  ctaUrl?: string;    // Optional
}

// components/render/blocks/HeaderBlock.tsx - Line 67
{content.ctaText && content.ctaUrl && (
  <a href={content.ctaUrl} ...>{content.ctaText}</a>
)}
```

**Problem:**
- Users don't realize clearing both fields hides the CTA
- No visual indicator of CTA visibility state
- Values are lost when hiding/showing CTA (must re-enter text/URL)

---

## 4. Context & Problem Definition

### Problem Statement
Header CTA button visibility is controlled implicitly by whether `ctaText` and `ctaUrl` fields have values. Users want an explicit toggle to show/hide the CTA without losing their configured text and URL.

### Success Criteria
- [ ] `showCta` boolean field added to HeaderContent interface
- [ ] Switch toggle added to HeaderEditor UI
- [ ] HeaderBlock checks `showCta` flag (not just field presence)
- [ ] Default value set in section-defaults.ts
- [ ] CTA text/URL fields preserved when toggle is off
- [ ] Existing headers without `showCta` continue to work (backwards compatible)

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns** - can make breaking changes
- **Data migration acceptable** - existing data can be handled with sensible defaults

---

## 6. Technical Requirements

### Functional Requirements
- User can toggle CTA visibility with a switch
- CTA text and URL fields remain editable regardless of toggle state
- CTA text and URL values are preserved when toggle is off
- Toggle defaults to `true` for new headers (show CTA by default)

### Non-Functional Requirements
- **Responsive Design:** Switch toggle works on mobile
- **Theme Support:** Uses existing shadcn/ui Switch component

### Technical Constraints
- Must not break existing headers (use sensible default for missing `showCta`)

---

## 7. Data & Database Changes

### Database Schema Changes
No database schema changes required. `showCta` will be stored in the existing JSONB `content` column.

### Data Model Updates
```typescript
// lib/section-types.ts - Updated HeaderContent interface
export interface HeaderContent {
  siteName: string;
  logoUrl?: string;
  links: NavLink[];
  showCta?: boolean;  // NEW - defaults to true if ctaText && ctaUrl exist
  ctaText?: string;
  ctaUrl?: string;
}
```

### Data Migration Plan
No migration needed. Existing headers without `showCta` will use fallback logic:
- If `showCta` is undefined AND both `ctaText` and `ctaUrl` have values → show CTA
- If `showCta` is explicitly `false` → hide CTA
- If `showCta` is `true` → show CTA (if text/url provided)

---

## 8. Backend Changes & Background Jobs

No backend changes required. This is a frontend-only enhancement.

---

## 9. Frontend Changes

### Files to Modify

1. **`lib/section-types.ts`** - Add `showCta?: boolean` to HeaderContent interface
2. **`lib/section-defaults.ts`** - Set `showCta: true` in header defaults
3. **`components/editor/blocks/HeaderEditor.tsx`** - Add Switch toggle
4. **`components/render/blocks/HeaderBlock.tsx`** - Check `showCta` flag

### Component Changes

No new components needed. Using existing shadcn/ui `Switch` component.

---

## 10. Code Changes Overview

### Current Implementation (Before)

**lib/section-types.ts:13-19**
```typescript
export interface HeaderContent {
  siteName: string;
  logoUrl?: string;
  links: NavLink[];
  ctaText?: string;
  ctaUrl?: string;
}
```

**lib/section-defaults.ts:9-19**
```typescript
header: {
  siteName: "Your Site",
  logoUrl: "",
  links: [
    { label: "Home", url: "/" },
    { label: "About", url: "/about" },
    { label: "Contact", url: "/contact" },
  ],
  ctaText: "Get Started",
  ctaUrl: "#",
},
```

**components/editor/blocks/HeaderEditor.tsx:263-285** (CTA fields section)
```typescript
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="header-ctaText">CTA Button Text (optional)</Label>
    <Input
      id="header-ctaText"
      value={content.ctaText || ""}
      onChange={(e) => handleFieldChange("ctaText", e.target.value)}
      placeholder="Get Started"
      disabled={disabled}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="header-ctaUrl">CTA Button URL</Label>
    <Input
      id="header-ctaUrl"
      value={content.ctaUrl || ""}
      onChange={(e) => handleFieldChange("ctaUrl", e.target.value)}
      placeholder="/signup"
      disabled={disabled}
    />
  </div>
</div>
```

**components/render/blocks/HeaderBlock.tsx:66-75**
```typescript
{/* CTA Button */}
{content.ctaText && content.ctaUrl && (
  <a
    href={content.ctaUrl}
    className="hidden sm:inline-block hover:opacity-90 transition-opacity"
    style={getButtonStyles(theme)}
  >
    {content.ctaText}
  </a>
)}
```

### After Changes

**lib/section-types.ts:13-20**
```typescript
export interface HeaderContent {
  siteName: string;
  logoUrl?: string;
  links: NavLink[];
  showCta?: boolean;  // NEW - explicit toggle
  ctaText?: string;
  ctaUrl?: string;
}
```

**lib/section-defaults.ts:9-20**
```typescript
header: {
  siteName: "Your Site",
  logoUrl: "",
  links: [
    { label: "Home", url: "/" },
    { label: "About", url: "/about" },
    { label: "Contact", url: "/contact" },
  ],
  showCta: true,  // NEW
  ctaText: "Get Started",
  ctaUrl: "#",
},
```

**components/editor/blocks/HeaderEditor.tsx** (new CTA section with toggle)
```typescript
{/* CTA Button Section */}
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <Label htmlFor="header-showCta">Show CTA Button</Label>
    <Switch
      id="header-showCta"
      checked={content.showCta ?? true}
      onCheckedChange={(checked) => handleBooleanChange("showCta", checked)}
      disabled={disabled}
    />
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="header-ctaText">CTA Button Text</Label>
      <Input
        id="header-ctaText"
        value={content.ctaText || ""}
        onChange={(e) => handleFieldChange("ctaText", e.target.value)}
        placeholder="Get Started"
        disabled={disabled}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="header-ctaUrl">CTA Button URL</Label>
      <Input
        id="header-ctaUrl"
        value={content.ctaUrl || ""}
        onChange={(e) => handleFieldChange("ctaUrl", e.target.value)}
        placeholder="/signup"
        disabled={disabled}
      />
    </div>
  </div>
</div>
```

**components/render/blocks/HeaderBlock.tsx**
```typescript
{/* CTA Button - check showCta flag with backwards compatibility */}
{(content.showCta ?? (content.ctaText && content.ctaUrl)) &&
  content.ctaText &&
  content.ctaUrl && (
    <a
      href={content.ctaUrl}
      className="hidden sm:inline-block hover:opacity-90 transition-opacity"
      style={getButtonStyles(theme)}
    >
      {content.ctaText}
    </a>
  )}
```

### Key Changes Summary
- [ ] **Change 1:** Add `showCta?: boolean` to HeaderContent interface
- [ ] **Change 2:** Set `showCta: true` in header defaults
- [ ] **Change 3:** Add Switch toggle with handler in HeaderEditor
- [ ] **Change 4:** Update CTA visibility logic in HeaderBlock with backwards compatibility
- [ ] **Files Modified:** 4 files total

---

## 11. Implementation Plan

### Phase 1: Type and Default Updates
**Goal:** Add the new field to types and defaults

- [x] **Task 1.1:** Update `lib/section-types.ts` ✓ 2025-12-29
  - Files: `lib/section-types.ts`
  - Details: Added `showCta?: boolean` to HeaderContent interface (line 17)

- [x] **Task 1.2:** Update `lib/section-defaults.ts` ✓ 2025-12-29
  - Files: `lib/section-defaults.ts`
  - Details: Added `showCta: true` to header defaults (line 17)

### Phase 2: Editor UI Updates
**Goal:** Add the toggle switch to HeaderEditor

- [x] **Task 2.1:** Update `components/editor/blocks/HeaderEditor.tsx` ✓ 2025-12-29
  - Files: `components/editor/blocks/HeaderEditor.tsx`
  - Details: Added Switch import (line 24), handleBooleanChange handler (lines 155-157), toggle UI with description (lines 268-283)

### Phase 3: Renderer Updates
**Goal:** Update HeaderBlock to use the new flag

- [x] **Task 3.1:** Update `components/render/blocks/HeaderBlock.tsx` ✓ 2025-12-29
  - Files: `components/render/blocks/HeaderBlock.tsx`
  - Details: Updated CTA visibility logic with backwards compatibility (lines 66-77)

### Phase 4: Verification
**Goal:** Verify implementation works correctly

- [x] **Task 4.1:** Run linting ✓ 2025-12-29
  - Command: `npm run lint`
  - Details: No lint errors

- [x] **Task 4.2:** Run type checking ✓ 2025-12-29
  - Command: `npm run type-check`
  - Details: No TypeScript errors

---

## 12. Task Completion Tracking

Will be updated during implementation with timestamps.

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `lib/section-types.ts` - Add showCta field to interface
- [ ] `lib/section-defaults.ts` - Add showCta default value
- [ ] `components/editor/blocks/HeaderEditor.tsx` - Add Switch toggle
- [ ] `components/render/blocks/HeaderBlock.tsx` - Update visibility logic

### Dependencies to Add
None - Switch component already exists in shadcn/ui.

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Existing headers without showCta field** - Handled by fallback logic
- [ ] **showCta true but no text/url** - CTA won't render (text/url still required)

### Security & Access Control Review
No security concerns - this is a display toggle only.

---

## 15. Deployment & Configuration

No deployment or environment changes required.

---

## 16. AI Agent Instructions

Follow standard task template workflow. This is a low-complexity task with 4 file modifications.

---

## 17. Notes & Additional Context

This task sets the groundwork for Task 029 (Header/Footer Override System) which will add layout variants, sticky behavior, and per-page overrides.

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

**Breaking Changes:** None - backwards compatible with fallback logic

**Ripple Effects:**
- Site-level header in Settings Tab uses same HeaderContent interface
- SettingsTab.tsx may need similar update (out of scope for this task, but noted)

**Performance:** Negligible - one additional boolean check

**Security:** None

### Mitigation Strategies
None required - low risk change.

---

*Task Document Version: 1.0*
*Created: 2025-12-29*
