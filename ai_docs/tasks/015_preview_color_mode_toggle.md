# AI Task Document

---

## 1. Task Overview

### Task Title
**Title:** Preview Mode Toggle for Light/Dark Testing

### Goal Statement
**Goal:** Add a light/dark mode toggle to the page preview interface so users can test how their pages look in both color modes before publishing, regardless of the site's configured color_mode setting.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Currently, light/dark mode works correctly on published sites based on the site's `color_mode` setting. However, there's no way to preview both modes in the editor - users can only see the default rendering. This makes it difficult to verify that content looks good in both light and dark modes before publishing.

Since this is a straightforward enhancement with a clear implementation path (following the existing DeviceToggle pattern), **strategic analysis is not needed** - we can proceed directly with implementation.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Key Architectural Patterns:** CSS variables for theme colors, client-side color mode toggling

### Current State
- **DeviceToggle** (`components/preview/DeviceToggle.tsx`) - Allows switching between desktop/tablet/mobile widths
- **PreviewFrame** (`components/preview/PreviewFrame.tsx`) - Renders PageRenderer with theme data, includes device toggle
- **PreviewHeader** (`components/preview/PreviewHeader.tsx`) - Header with back button, page title, edit link
- **ThemeStyles** (`components/render/ThemeStyles.tsx`) - Injects CSS variables for light/dark mode on published sites
- **ColorModeToggle** (`components/render/ColorModeToggle.tsx`) - Toggle button for published sites with user_choice mode

**Gap:** Preview uses `PageRenderer` which relies on CSS variables (`var(--color-xxx)`), but the preview doesn't inject `ThemeStyles` component, so CSS variables aren't defined in the preview context. Additionally, there's no toggle to switch between light/dark modes.

### Existing Codebase Analysis

**Relevant Files:**
- `components/preview/DeviceToggle.tsx` - Pattern to follow for color mode toggle
- `components/preview/PreviewFrame.tsx` - Where toggle will be added
- `components/render/ThemeStyles.tsx` - CSS variable injection to reuse
- `lib/theme-utils.ts` - `generateDefaultDarkPalette()` for fallback dark colors

---

## 4. Context & Problem Definition

### Problem Statement
Users cannot test how their pages look in dark mode during the editing/preview phase. This is problematic because:
1. They may not know their theme supports dark mode
2. They cannot verify content readability in both modes
3. They may publish sites without testing dark mode appearance

### Success Criteria
- [x] Light/dark toggle appears in preview alongside device toggle ✓
- [x] Toggle switches between light and dark color palettes in real-time ✓
- [x] Preview uses theme's `darkColors` (or auto-generated dark palette if not provided) ✓
- [x] Toggle is independent of site's `color_mode` setting (always shows both options in preview) ✓
- [x] No visual flash or flicker when switching modes ✓

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- [ ] User can toggle between light and dark mode in the preview
- [ ] Toggle appears next to the device toggle in the preview toolbar
- [ ] Switching mode instantly updates all theme colors
- [ ] Default to light mode when opening preview

### Non-Functional Requirements
- **Performance:** Mode switching should be instant (<50ms visual update)
- **Usability:** Clear visual indication of current mode (sun/moon icons)
- **Responsive Design:** Toggle should work on mobile preview widths

### Technical Constraints
- Must use CSS variables approach (matches published site implementation)
- Must scope styles to preview container to avoid affecting admin app
- Must work with themes that don't have explicit `darkColors` (use fallback generation)

---

## 7. Data & Database Changes

**No database changes required** - This is a frontend-only feature.

---

## 8. Backend Changes & Background Jobs

**No backend changes required** - This is a frontend-only feature.

---

## 9. Frontend Changes

### New Components
- [ ] **`components/preview/ColorModePreviewToggle.tsx`** - Toggle button for light/dark mode in preview
  - Similar pattern to DeviceToggle
  - Sun/Moon icons
  - Props: `colorMode: "light" | "dark"`, `onChange: (mode) => void`

### Component Modifications
- [ ] **`components/preview/PreviewFrame.tsx`** - Major updates:
  - Add `colorMode` state (default: "light")
  - Add `ColorModePreviewToggle` to toolbar
  - Create `PreviewThemeStyles` component for scoped CSS variables
  - Apply `dark` class to preview container when dark mode selected

### State Management
- Local component state for preview color mode preference
- No persistence needed (resets when leaving preview page)

---

## 10. Code Changes Overview

### Current Implementation (Before)

**PreviewFrame.tsx:**
```tsx
export function PreviewFrame({ sections, theme }: PreviewFrameProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center py-4 border-b bg-background">
        <DeviceToggle device={device} onChange={setDevice} />
      </div>

      <div className="flex-1 flex justify-center overflow-auto p-4 bg-muted/30">
        <div
          className={cn("bg-white shadow-lg transition-all duration-300 overflow-auto", ...)}
          style={{ width: DEVICE_WIDTHS[device], ... }}
        >
          <PageRenderer sections={sections} theme={theme} />
        </div>
      </div>
    </div>
  );
}
```

**Issue:** No CSS variables injected, no color mode toggle.

### After Refactor

**PreviewFrame.tsx:**
```tsx
export function PreviewFrame({ sections, theme }: PreviewFrameProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center gap-4 py-4 border-b bg-background">
        <DeviceToggle device={device} onChange={setDevice} />
        <ColorModePreviewToggle colorMode={colorMode} onChange={setColorMode} />
      </div>

      <div className="flex-1 flex justify-center overflow-auto p-4 bg-muted/30">
        <div
          className={cn(
            "shadow-lg transition-all duration-300 overflow-auto",
            device !== "desktop" && "border rounded-lg",
            colorMode === "dark" ? "preview-dark" : "preview-light"
          )}
          style={{ width: DEVICE_WIDTHS[device], ... }}
        >
          <PreviewThemeStyles theme={theme} colorMode={colorMode} />
          <PageRenderer sections={sections} theme={theme} />
        </div>
      </div>
    </div>
  );
}
```

**New ColorModePreviewToggle.tsx:**
```tsx
export function ColorModePreviewToggle({
  colorMode,
  onChange,
}: ColorModePreviewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("light")}
        className={cn("h-8 px-3 gap-2", colorMode === "light" && "bg-background shadow-sm")}
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Light</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("dark")}
        className={cn("h-8 px-3 gap-2", colorMode === "dark" && "bg-background shadow-sm")}
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Dark</span>
      </Button>
    </div>
  );
}
```

### Key Changes Summary
- [ ] **Change 1:** Add `ColorModePreviewToggle` component with light/dark buttons
- [ ] **Change 2:** Add color mode state and toggle to `PreviewFrame`
- [ ] **Change 3:** Create `PreviewThemeStyles` component that injects scoped CSS variables
- [ ] **Files Modified:** `components/preview/PreviewFrame.tsx`
- [ ] **Files Created:** `components/preview/ColorModePreviewToggle.tsx`
- [ ] **Impact:** Users can now test both light and dark modes in preview

---

## 11. Implementation Plan

### Phase 1: Create ColorModePreviewToggle Component
**Goal:** Build the toggle UI component

- [ ] **Task 1.1:** Create `components/preview/ColorModePreviewToggle.tsx`
  - Files: `components/preview/ColorModePreviewToggle.tsx`
  - Details: Sun/Moon icons, follows DeviceToggle pattern, accepts colorMode and onChange props

### Phase 2: Add PreviewThemeStyles Component
**Goal:** Inject scoped CSS variables for preview

- [ ] **Task 2.1:** Create scoped theme styles component within PreviewFrame
  - Files: `components/preview/PreviewFrame.tsx`
  - Details: Generate CSS variables for both light/dark modes, scope to preview container using class selectors

### Phase 3: Integrate Toggle into PreviewFrame
**Goal:** Wire up state and rendering

- [ ] **Task 3.1:** Add color mode state to PreviewFrame
  - Files: `components/preview/PreviewFrame.tsx`
  - Details: Add useState for colorMode, render toggle alongside DeviceToggle
- [ ] **Task 3.2:** Apply CSS variables and class to preview container
  - Files: `components/preview/PreviewFrame.tsx`
  - Details: Inject PreviewThemeStyles, apply preview-light/preview-dark class based on mode

### Phase 4: Testing & Validation
**Goal:** Verify functionality

- [ ] **Task 4.1:** Static code analysis
  - Command: `npm run lint && npm run type-check`
  - Details: Ensure no TypeScript errors or linting issues
- [ ] **Task 4.2:** 👤 USER TESTING - Browser verification
  - Details: User tests preview page with light/dark toggle, verifies colors update correctly

### Phase 5: Comprehensive Code Review (Mandatory)
**Goal:** Present implementation completion and request thorough code review

- [ ] **Task 5.1:** Present "Implementation Complete!" message
- [ ] **Task 5.2:** Execute comprehensive code review if approved

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Phase 1: Create ColorModePreviewToggle Component
- [x] **Task 1.1:** Create `components/preview/ColorModePreviewToggle.tsx` ✓ 2025-12-27
  - Files: `components/preview/ColorModePreviewToggle.tsx` (45 lines) ✓
  - Details: Sun/Moon toggle following DeviceToggle pattern ✓

### Phase 2: Add PreviewThemeStyles and Update PreviewFrame
- [x] **Task 2.1:** Add PreviewThemeStyles component ✓ 2025-12-27
  - Files: `components/preview/PreviewFrame.tsx` ✓
  - Details: Scoped CSS variable injection using `.preview-container` class ✓
- [x] **Task 2.2:** Add color mode state and toggle to PreviewFrame ✓ 2025-12-27
  - Details: Added `colorMode` state, `ColorModePreviewToggle`, updated container styling ✓

### Phase 3: Testing & Validation
- [x] **Task 3.1:** Static code analysis ✓ 2025-12-27
  - Command: `npm run lint && npm run type-check` ✓
  - Details: No linting errors, no TypeScript errors ✓

---

## 13. File Structure & Organization

### New Files to Create
```
components/
└── preview/
    └── ColorModePreviewToggle.tsx  # New toggle component
```

### Files to Modify
- [ ] **`components/preview/PreviewFrame.tsx`** - Add state, toggle, and scoped theme styles

### Dependencies to Add
None - uses existing lucide-react icons.

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Edge Case 1:** Theme without darkColors
  - **Analysis Approach:** Check if `theme.darkColors` exists
  - **Recommendation:** Use `generateDefaultDarkPalette()` from `lib/theme-utils.ts` as fallback
- [ ] **Edge Case 2:** Preview container style scoping
  - **Analysis Approach:** Ensure CSS variables don't leak to admin app
  - **Recommendation:** Use unique class selectors (`.preview-light`, `.preview-dark`) and scoped style injection

### Security Considerations
- No security concerns - this is a cosmetic preview feature with no data access

---

## 15. Deployment & Configuration

No environment variables or configuration changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard workflow:
1. Create task document (this document)
2. Get user approval
3. Implement phase-by-phase
4. Update completion tracking after each phase
5. Comprehensive code review after implementation

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for cleaner code
- [ ] Follow existing component patterns (DeviceToggle)
- [ ] Use CSS variables consistently

---

## 17. Notes & Additional Context

### Reference Implementation
- **DeviceToggle** - Follow this exact pattern for the new toggle
- **ThemeStyles** - Reuse CSS variable generation logic, but scope to preview container

### Design Decisions
1. **Scoped CSS Variables:** Use class selectors (`.preview-light`, `.preview-dark`) to prevent CSS variable conflicts with the admin app's own theme
2. **No Persistence:** Preview color mode resets when leaving - this is intentional as it's for testing only
3. **Always Available:** Toggle shows regardless of site's `color_mode` setting - users should always be able to preview both modes

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

**Breaking Changes:** None - additive feature only

**Performance Implications:** Minimal - CSS variable updates are instant

**User Experience Impacts:** Positive - users gain ability to test dark mode before publishing

### Mitigation Strategies
None required - low-risk feature addition.

---

*Task Document Created: 2025-12-27*
*Complexity: Low*
*Estimated Impact: P2 - Medium Priority Enhancement*
