# AI Task Template

> **Task:** Light/Dark Mode Support - Add site-level color mode control with dual palettes

---

## 1. Task Overview

### Task Title
**Title:** Light/Dark Mode Support

### Goal Statement
**Goal:** Allow site owners to control their site's color mode (light, dark, system, or user choice) and generate themes with both light and dark color palettes for seamless mode switching.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Currently, sites are only rendered in light mode. Users want:
- Control over site appearance (always light, always dark, follow system, or let visitors choose)
- Themes that look good in both light and dark modes
- Runtime switching without page reload

### Solution Options Analysis

#### Option 1: CSS Variables with Dual Palettes (Recommended)
**Approach:** Store both light and dark color palettes in ThemeData. Generate CSS variables for both modes. Use `prefers-color-scheme` media query and/or JavaScript toggle for runtime switching.

**Pros:**
- Runtime switching without page reload
- Native browser support for system preference
- Clean separation of concerns
- Works with existing inline style approach

**Cons:**
- Requires updating all style utilities to use CSS variables
- Need to regenerate existing themes with dark palettes

**Implementation Complexity:** Medium-High
**Risk Level:** Medium

#### Option 2: Server-Side Mode Detection
**Approach:** Detect mode on server, render appropriate colors inline.

**Pros:**
- Simpler implementation
- No CSS variable refactoring needed

**Cons:**
- Page reload required to switch modes
- Flash of wrong colors on initial load
- Poor UX for "User Choice" option

**Implementation Complexity:** Low
**Risk Level:** Low

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 1 - CSS Variables with Dual Palettes

**Why this is the best choice:**
1. **Best UX** - Instant switching, no reload needed
2. **System preference support** - Respects user's OS setting
3. **Future-proof** - CSS variables are the modern standard
4. **Visitor choice** - Toggle component enables per-visit preference

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **UI & Styling:** Tailwind CSS + inline styles via theme-styles.ts
- **Current Approach:** Theme colors applied as inline styles via utility functions

### Current State
- `sites` table has no color_mode field
- `ThemeData` has single `colors: ColorPalette`
- AI generates only light mode colors
- `theme-styles.ts` returns inline CSSProperties objects
- Published sites apply theme via `PageRenderer` with inline styles

### Key Files to Modify
- `lib/drizzle/schema/sites.ts` - Add color_mode field
- `lib/drizzle/schema/theme-types.ts` - Add darkColors to ThemeData
- `trigger/utils/theme-prompts.ts` - Update AI prompts for dual palettes
- `lib/theme-utils.ts` - Generate CSS variables for both modes
- `components/render/utilities/theme-styles.ts` - Use CSS variables
- `components/render/PageRenderer.tsx` - Inject CSS variables
- `app/(sites)/sites/[siteSlug]/layout.tsx` - Color mode script
- New: `components/render/ColorModeToggle.tsx`
- New: `components/render/ThemeStyles.tsx`

---

## 4. Technical Requirements

### Functional Requirements
1. Site-level setting: `light` | `dark` | `system` | `user_choice`
2. Themes store both light and dark color palettes
3. AI generates complementary dark palette when generating themes
4. Manual theme editor supports editing dark colors
5. Published sites respect the color mode setting
6. "User Choice" mode shows toggle component on site
7. Preview supports mode switching

### Non-Functional Requirements
- **Performance:** No layout shift on initial load
- **Accessibility:** Toggle must be keyboard accessible
- **UX:** Smooth transitions between modes

### Color Mode Definitions
- **Light:** Always use light palette
- **Dark:** Always use dark palette
- **System:** Follow `prefers-color-scheme` media query
- **User Choice:** Show toggle, persist preference in localStorage

---

## 5. Data & Database Changes

### Schema Change: sites table
Add `color_mode` column:

```sql
ALTER TABLE sites
ADD COLUMN color_mode TEXT NOT NULL DEFAULT 'light';
```

Values: `'light'` | `'dark'` | `'system'` | `'user_choice'`

### Schema Change: ThemeData type
Add optional `darkColors` to ThemeData interface:

```typescript
export interface ThemeData {
  colors: ColorPalette;       // Light mode (existing)
  darkColors?: ColorPalette;  // Dark mode (new, optional for backwards compat)
  // ... rest unchanged
}
```

---

## 6. Implementation Plan

### Phase 1: Database & Types
**Goal:** Add color_mode field and update ThemeData type

- [ ] **Task 1.1:** Add color_mode to sites schema
  - Files: `lib/drizzle/schema/sites.ts`
  - Migration: Add column with default 'light'
- [ ] **Task 1.2:** Update ThemeData interface
  - Files: `lib/drizzle/schema/theme-types.ts`
  - Add optional `darkColors?: ColorPalette`

### Phase 2: AI Theme Generation
**Goal:** Generate both light and dark palettes

- [ ] **Task 2.1:** Update theme prompts
  - Files: `trigger/utils/theme-prompts.ts`
  - Request both light and dark palettes from AI
- [ ] **Task 2.2:** Update theme parser
  - Files: `trigger/utils/theme-parser.ts`
  - Parse darkColors from AI response
- [ ] **Task 2.3:** Update theme-utils regeneration
  - Files: `lib/theme-utils.ts`
  - Generate CSS variables for both light and dark modes

### Phase 3: CSS Variables Approach
**Goal:** Refactor styling to use CSS custom properties

- [ ] **Task 3.1:** Create ThemeStyles component
  - Files: New `components/render/ThemeStyles.tsx`
  - Injects `<style>` with CSS variables for both modes
- [ ] **Task 3.2:** Update theme-styles utilities
  - Files: `components/render/utilities/theme-styles.ts`
  - Return CSS variable references instead of hardcoded colors
- [ ] **Task 3.3:** Update PageRenderer
  - Files: `components/render/PageRenderer.tsx`
  - Include ThemeStyles component

### Phase 4: Color Mode Toggle
**Goal:** Enable user choice mode with toggle

- [ ] **Task 4.1:** Create ColorModeToggle component
  - Files: New `components/render/ColorModeToggle.tsx`
  - Sun/Moon icons, keyboard accessible
  - Persists preference to localStorage
- [ ] **Task 4.2:** Update published site layout
  - Files: `app/(sites)/sites/[siteSlug]/layout.tsx`
  - Add color mode initialization script
  - Conditionally render toggle based on site setting

### Phase 5: Admin UI Updates
**Goal:** Allow site owners to configure color mode

- [ ] **Task 5.1:** Add color mode setting to SettingsTab
  - Files: `components/sites/SettingsTab.tsx`
  - Dropdown: Light / Dark / System / User Choice
- [ ] **Task 5.2:** Add updateColorMode action
  - Files: `app/actions/sites.ts`
  - Server action to update site color_mode
- [ ] **Task 5.3:** Update theme editor for dark colors
  - Files: `components/theme/ThemeEditor.tsx`
  - Tab or section for editing dark palette

### Phase 6: Preview Updates
**Goal:** Test modes in preview

- [ ] **Task 6.1:** Add mode toggle to preview
  - Files: `components/preview/DeviceToggle.tsx` or new component
  - Light/Dark toggle alongside device selector

### Phase 7: Testing & Validation

- [ ] **Task 7.1:** Run linting and type-check
- [ ] **Task 7.2:** Browser testing
  - Test all 4 color modes
  - Test toggle persistence
  - Test system preference detection
  - Test existing sites (backwards compat)

---

## 7. Code Changes Overview

### New: `components/render/ThemeStyles.tsx`
```tsx
"use client";

import type { ThemeData } from "@/lib/drizzle/schema/theme-types";

interface ThemeStylesProps {
  theme: ThemeData;
  colorMode: "light" | "dark" | "system" | "user_choice";
}

export function ThemeStyles({ theme, colorMode }: ThemeStylesProps) {
  const lightColors = theme.colors;
  const darkColors = theme.darkColors || generateDefaultDarkPalette(lightColors);

  return (
    <style jsx global>{`
      :root {
        --color-primary: ${lightColors.primary};
        --color-secondary: ${lightColors.secondary};
        --color-accent: ${lightColors.accent};
        --color-background: ${lightColors.background};
        --color-foreground: ${lightColors.foreground};
        --color-muted: ${lightColors.muted};
        --color-muted-foreground: ${lightColors.mutedForeground};
        --color-border: ${lightColors.border};
        --font-heading: "${theme.typography.headingFont.family}", sans-serif;
        --font-body: "${theme.typography.bodyFont.family}", sans-serif;
      }

      .dark {
        --color-primary: ${darkColors.primary};
        --color-secondary: ${darkColors.secondary};
        --color-accent: ${darkColors.accent};
        --color-background: ${darkColors.background};
        --color-foreground: ${darkColors.foreground};
        --color-muted: ${darkColors.muted};
        --color-muted-foreground: ${darkColors.mutedForeground};
        --color-border: ${darkColors.border};
      }

      ${colorMode === "system" ? `
        @media (prefers-color-scheme: dark) {
          :root {
            --color-primary: ${darkColors.primary};
            --color-secondary: ${darkColors.secondary};
            --color-accent: ${darkColors.accent};
            --color-background: ${darkColors.background};
            --color-foreground: ${darkColors.foreground};
            --color-muted: ${darkColors.muted};
            --color-muted-foreground: ${darkColors.mutedForeground};
            --color-border: ${darkColors.border};
          }
        }
      ` : ""}
    `}</style>
  );
}
```

### Modified: `lib/drizzle/schema/sites.ts`
```typescript
export const COLOR_MODES = ["light", "dark", "system", "user_choice"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const sites = pgTable("sites", {
  // ... existing fields
  color_mode: text("color_mode", { enum: COLOR_MODES }).notNull().default("light"),
});
```

### Modified: `lib/drizzle/schema/theme-types.ts`
```typescript
export interface ThemeData {
  colors: ColorPalette;
  darkColors?: ColorPalette;  // Optional for backwards compatibility
  // ... rest unchanged
}
```

---

## 8. Backwards Compatibility

- Existing sites default to `color_mode: 'light'`
- Existing themes without `darkColors` use generated fallback
- No breaking changes to published sites

### Default Dark Palette Generation
When `darkColors` is missing, generate sensible defaults:
- Invert background/foreground
- Adjust primary/secondary for dark backgrounds
- Reduce brightness of accent colors

---

## 9. Potential Issues & Security Review

### Error Scenarios
- [ ] **Scenario 1:** Existing themes without darkColors
  - **Fix:** Generate fallback dark palette automatically
- [ ] **Scenario 2:** localStorage not available
  - **Fix:** Graceful fallback to system/light mode

### Edge Cases
- [ ] **Edge Case 1:** User switches mode mid-scroll
  - **Analysis:** CSS transitions prevent jarring changes
- [ ] **Edge Case 2:** Flash of wrong color on load
  - **Analysis:** Inline script in `<head>` sets class before render

---

## 10. Notes & Additional Context

### Color Mode Script (Prevents Flash)
```html
<script>
  (function() {
    const mode = localStorage.getItem('color-mode');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (mode === 'dark' || (!mode && systemDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### Future Enhancements
- Color palette suggestions based on light palette
- Automatic contrast checking for dark mode
- Per-page color mode overrides

---

*Task Created: 2025-12-27*
*Priority: P1 - High*
*Estimated Effort: High (~4-6 hours)*
