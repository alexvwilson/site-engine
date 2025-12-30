# Task 037: Feature Block Icon Picker

> **Instructions:** Replace text input with visual icon picker for Features block editor.

---

## 1. Task Overview

### Task Title
**Title:** Feature Block Icon Picker - Visual Lucide Icon Selection

### Goal Statement
**Goal:** Replace the current text input for icon names in the Features editor with a visual icon picker that shows icon previews, supports search/filter, and groups icons by category. This improves user experience by eliminating the need to know Lucide icon names.

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis Decision
**SKIP** - This is a straightforward UI enhancement with a clear implementation path. The codebase already has:
- A curated icon set in `icon-resolver.tsx` (~65 icons)
- Category organization via comments
- Helper functions (`getAvailableIconNames()`, `isValidIconName()`)

Only one viable technical approach exists: build a popover-based icon picker using the existing icon map.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Relevant Existing Components:**
  - `components/ui/popover.tsx` - Popover component
  - `components/ui/input.tsx` - Search input
  - `components/ui/button.tsx` - Trigger button
  - `components/render/utilities/icon-resolver.tsx` - Existing icon map

### Current State
The FeaturesEditor has a basic text input where users must type Lucide icon names (e.g., "star", "zap", "shield"). Users have no way to discover available icons without external documentation.

**Current Implementation (FeaturesEditor.tsx lines 66-78):**
```tsx
<div className="space-y-2">
  <Label htmlFor={`feature-${index}-icon`}>Icon Name</Label>
  <Input
    id={`feature-${index}-icon`}
    value={feature.icon}
    onChange={(e) => handleFeatureChange(index, "icon", e.target.value)}
    placeholder="star, zap, shield..."
    disabled={disabled}
  />
  <p className="text-xs text-muted-foreground">
    Lucide icon name
  </p>
</div>
```

### Existing Codebase Analysis

**Icon Map Analysis (`icon-resolver.tsx`):**
- 65 curated icons organized by category (via comments)
- Categories: action, contact, e-commerce, nature, tech, media, analytics, navigation, education, design
- Aliases exist for common variations (e.g., "email" → Mail, "mobile" → Smartphone)
- Already exports `getAvailableIconNames()` for listing all icons

---

## 4. Context & Problem Definition

### Problem Statement
Users must know Lucide icon names to set icons for features. There's no discoverability - they can't browse available options or see previews before selecting. This creates friction and often results in users sticking with the default "star" icon.

### Success Criteria
- [ ] Text input replaced with icon picker button showing current icon
- [ ] Popover opens with searchable grid of all available icons
- [ ] Icons grouped by category with visual headers
- [ ] Search filters icons in real-time
- [ ] Clicking an icon selects it and closes popover
- [ ] Selected icon preview shown on trigger button
- [ ] Keyboard accessible (arrow keys, enter to select, escape to close)

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - icon data format unchanged
- **Priority: Speed and simplicity** over elaborate features

---

## 6. Technical Requirements

### Functional Requirements
- User can click a button to open icon picker popover
- User can search/filter icons by name
- User can browse icons grouped by category
- User can click an icon to select it
- Selected icon is immediately reflected in the feature card
- Popover closes after selection

### Non-Functional Requirements
- **Performance:** Icon grid should render smoothly (65 icons is manageable)
- **Usability:** Categories help users find relevant icons quickly
- **Responsive Design:** Popover should work on mobile (may need full-screen on small screens)
- **Accessibility:** Keyboard navigation, proper ARIA labels

### Technical Constraints
- Must use existing `ICON_MAP` from `icon-resolver.tsx` (single source of truth)
- Must use shadcn/ui Popover component for consistency
- Must not add new dependencies

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - The `icon` field in Feature interface remains a string.

---

## 8. Backend Changes & Background Jobs

**None required** - This is a pure frontend change.

---

## 9. Frontend Changes

### New Components
- [ ] **`components/editor/IconPicker.tsx`** - Reusable icon picker popover component
  - Props: `value: string`, `onChange: (icon: string) => void`, `disabled?: boolean`
  - Internal state: search query, popover open state
  - Renders: trigger button with current icon, popover with search + categorized grid

### Component Organization
The IconPicker will be placed in `components/editor/` since it's an editor-specific component (not a generic UI component).

### Files to Modify
- [ ] **`components/editor/blocks/FeaturesEditor.tsx`** - Replace Input with IconPicker
- [ ] **`components/render/utilities/icon-resolver.tsx`** - Export categorized icon data

---

## 10. Code Changes Overview

### Current Implementation (Before)

**FeaturesEditor.tsx (lines 66-78):**
```tsx
<div className="space-y-2">
  <Label htmlFor={`feature-${index}-icon`}>Icon Name</Label>
  <Input
    id={`feature-${index}-icon`}
    value={feature.icon}
    onChange={(e) => handleFeatureChange(index, "icon", e.target.value)}
    placeholder="star, zap, shield..."
    disabled={disabled}
  />
  <p className="text-xs text-muted-foreground">
    Lucide icon name
  </p>
</div>
```

**icon-resolver.tsx (current structure):**
```tsx
const ICON_MAP: Record<string, LucideIcon> = {
  // Common action icons
  star: Star,
  zap: Zap,
  // ... more icons with category comments
};
```

### After Refactor

**FeaturesEditor.tsx:**
```tsx
import { IconPicker } from "@/components/editor/IconPicker";

// In the render:
<div className="space-y-2">
  <Label>Icon</Label>
  <IconPicker
    value={feature.icon}
    onChange={(icon) => handleFeatureChange(index, "icon", icon)}
    disabled={disabled}
  />
</div>
```

**icon-resolver.tsx (add category exports):**
```tsx
export interface IconCategory {
  name: string;
  icons: { name: string; component: LucideIcon }[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    name: "Common",
    icons: [
      { name: "star", component: Star },
      { name: "zap", component: Zap },
      // ...
    ],
  },
  // ... more categories
];
```

**New IconPicker.tsx:**
```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon, ICON_CATEGORIES } from "@/components/render/utilities/icon-resolver";
import { Search, ChevronDown } from "lucide-react";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filter icons based on search
  const filteredCategories = ICON_CATEGORIES.map(category => ({
    ...category,
    icons: category.icons.filter(icon =>
      icon.name.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(category => category.icons.length > 0);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <Icon name={value} size={18} />
            <span className="text-muted-foreground">{value}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* Search input */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Icon grid by category */}
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredCategories.map(category => (
            <div key={category.name} className="mb-3">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {category.name}
              </div>
              <div className="grid grid-cols-6 gap-1">
                {category.icons.map(icon => (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleSelect(icon.name)}
                    className={cn(
                      "p-2 rounded hover:bg-accent",
                      value === icon.name && "bg-accent"
                    )}
                    title={icon.name}
                  >
                    <Icon name={icon.name} size={18} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Key Changes Summary
- [ ] **Change 1:** Create `IconPicker.tsx` - New reusable component with popover, search, categorized grid
- [ ] **Change 2:** Refactor `icon-resolver.tsx` - Add `ICON_CATEGORIES` export with structured category data
- [ ] **Change 3:** Update `FeaturesEditor.tsx` - Replace Input with IconPicker component
- [ ] **Files Modified:** 3 files (1 new, 2 modified)
- [ ] **Impact:** Improves UX for feature icon selection without changing data format

---

## 11. Implementation Plan

### Phase 1: Extend Icon Resolver
**Goal:** Add categorized icon data structure for the picker

- [ ] **Task 1.1:** Create `IconCategory` interface and `ICON_CATEGORIES` array
  - Files: `components/render/utilities/icon-resolver.tsx`
  - Details: Organize existing icons into named categories, export for picker use

### Phase 2: Create Icon Picker Component
**Goal:** Build the reusable icon picker popover

- [ ] **Task 2.1:** Create `IconPicker.tsx` component
  - Files: `components/editor/IconPicker.tsx`
  - Details: Popover with search, categorized grid, selection handling

### Phase 3: Integrate with Features Editor
**Goal:** Replace text input with icon picker

- [ ] **Task 3.1:** Update FeaturesEditor to use IconPicker
  - Files: `components/editor/blocks/FeaturesEditor.tsx`
  - Details: Import IconPicker, replace Input component

### Phase 4: Testing & Validation
**Goal:** Verify functionality

- [ ] **Task 4.1:** Run linting and type-checking
  - Command: `npm run lint && npm run type-check`
- [ ] **Task 4.2:** User Testing (browser)
  - Details: Test icon selection, search, category browsing, keyboard navigation

---

## 12. Task Completion Tracking

*(Will be updated during implementation)*

---

## 13. File Structure & Organization

### New Files to Create
```
components/
  editor/
    IconPicker.tsx          # New icon picker popover component
```

### Files to Modify
- [ ] `components/render/utilities/icon-resolver.tsx` - Add ICON_CATEGORIES export
- [ ] `components/editor/blocks/FeaturesEditor.tsx` - Use IconPicker

### Dependencies to Add
**None** - Uses existing shadcn/ui Popover component

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Empty search results:** Show "No icons found" message
- [ ] **Invalid current icon value:** Display fallback (Star) with the name
- [ ] **Long icon names:** Truncate in trigger button if needed

### Error Scenarios
- [ ] **Category has no matching icons after filter:** Hide empty categories

---

## 15. Deployment & Configuration

### Environment Variables
**None required**

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with Phase 1 (icon resolver changes)
2. Create IconPicker component in Phase 2
3. Integrate with FeaturesEditor in Phase 3
4. Run linting/type-checking in Phase 4
5. Request user browser testing

### Code Quality Standards
- Use early returns for cleaner code
- Proper TypeScript types for all props
- Accessible keyboard navigation
- Mobile-responsive popover

---

## 17. Notes & Additional Context

### Design Decisions
- **Popover over Modal:** Better UX for quick selection, stays in form context
- **Categories from existing comments:** Leveraging the organization already in icon-resolver.tsx
- **6-column grid:** Fits ~18 icons per scroll view, good balance of density and usability
- **Search first, categories second:** Users can quickly find known icons or browse

### Reference
- shadcn/ui Popover: https://ui.shadcn.com/docs/components/popover
- Lucide icons: https://lucide.dev/icons

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [ ] **Existing API Contracts:** No changes - icon stored as string
- [ ] **Database Dependencies:** None - data format unchanged
- [ ] **Component Dependencies:** Only FeaturesEditor affected

#### Ripple Effects Assessment
- [ ] **Data Flow Impact:** None - same string value flows through
- [ ] **UI/UX Cascading Effects:** None - isolated to Features section editor

#### Performance Implications
- [ ] **Bundle Size:** Minimal - reusing existing icon imports
- [ ] **Rendering:** 65 icons in popover is negligible

### Critical Issues Identification
**None identified** - This is a low-risk UI enhancement.

---

*Template Version: 1.0*
*Created: 2025-12-30*
*Backlog Reference: #20 Feature Block Icon Picker*
