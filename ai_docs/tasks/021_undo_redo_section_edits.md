# Task 021: Undo/Redo for Section Edits

> **Status:** ✅ Implementation Complete - Awaiting User Testing
> **Priority:** P2 - Medium Priority
> **Complexity:** Medium-High
> **Completed:** 2025-12-27

---

## 1. Task Overview

### Task Title
**Title:** Implement Undo/Redo Functionality for Section Content Editing

### Goal Statement
**Goal:** Allow users to undo and redo changes made to section content while editing, preventing accidental loss of work and improving the editing experience. Users should be able to step backward and forward through their edit history using keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z) and/or UI buttons.

---

## 2. Strategic Analysis & Solution Options

### Problem Context

Currently, section edits are auto-saved after a 500ms debounce with no way to revert changes. If a user accidentally deletes content or makes unwanted changes, the only option is to manually re-enter the data. This is a common pain point that affects user confidence and editing speed.

Two fundamental approaches exist, with significant trade-offs between complexity, persistence, and implementation effort.

### Solution Options Analysis

#### Option 1: Browser-Level (React State + localStorage)

**Approach:** Maintain an edit history stack in React state with optional localStorage persistence. Each section editor tracks its own undo/redo history during the editing session.

**Pros:**
- ✅ No database schema changes required
- ✅ Instant undo/redo (no network latency)
- ✅ Simpler implementation - purely frontend changes
- ✅ localStorage can persist history across page refreshes (within same browser)
- ✅ Works offline - no server dependency for undo operations
- ✅ Lower complexity - fits current auto-save architecture

**Cons:**
- ❌ History lost when switching browsers/devices
- ❌ localStorage has size limits (~5MB total) - need to limit history depth
- ❌ Each section manages its own history - no global page-level undo
- ❌ May need careful memory management for large content

**Implementation Complexity:** Medium - Custom hook + UI integration
**Risk Level:** Low - No breaking changes, additive feature

#### Option 2: Database-Level (Version History Table)

**Approach:** Store section content versions in a new database table. Each save creates a version record, enabling retrieval of any historical state.

**Pros:**
- ✅ Complete audit trail of all changes
- ✅ Persists across sessions, browsers, and devices
- ✅ Can implement "view history" feature for full transparency
- ✅ Enables potential future features (compare versions, named checkpoints)
- ✅ No client-side storage limits

**Cons:**
- ❌ Database schema changes required (new table, migration)
- ❌ Network latency on each undo/redo operation
- ❌ Storage growth over time - needs cleanup strategy
- ❌ More complex implementation (server actions, queries, UI)
- ❌ Need to handle concurrent edits carefully
- ❌ Overkill for simple "oops, undo that" use case

**Implementation Complexity:** High - Schema changes + server actions + UI
**Risk Level:** Medium - Database changes, migration required

#### Option 3: Hybrid Approach

**Approach:** Browser-level undo for immediate edits (session-based), with periodic database snapshots for longer-term recovery.

**Pros:**
- ✅ Best of both worlds - fast local undo + persistent snapshots
- ✅ Could snapshot on significant events (section save, page close)

**Cons:**
- ❌ Most complex to implement
- ❌ Two systems to maintain and keep in sync
- ❌ User mental model may be confusing

**Implementation Complexity:** High - Both systems + synchronization logic
**Risk Level:** Medium-High - Complexity introduces more failure modes

### Recommendation & Rationale

**🎯 RECOMMENDED SOLUTION:** Option 1 - Browser-Level (React State + localStorage)

**Why this is the best choice:**

1. **Matches user expectations** - Users expect instant undo like in any text editor. Network latency would feel sluggish.

2. **Minimal risk** - Purely additive frontend changes with no database modifications. Can ship quickly and iterate.

3. **Development mode context** - Speed and simplicity are priorities. Database-level versioning is overengineered for current needs.

4. **Existing architecture fit** - The auto-save debounce pattern means we can capture history before saves trigger. No architectural conflicts.

5. **Future-compatible** - If database-level versioning becomes needed later, browser-level undo remains valuable and complementary.

**Key Decision Factors:**
- **Performance Impact:** None - all operations are local
- **User Experience:** Instant response, familiar Ctrl+Z behavior
- **Maintainability:** Single custom hook, minimal code surface
- **Scalability:** Per-section history keeps memory bounded
- **Security:** No concerns - purely client-side state

**Alternative Consideration:**
Option 2 (Database-level) would be preferred if: (a) cross-device history is a hard requirement, (b) audit/compliance needs exist, or (c) "version history" is a planned feature. For typical website builder usage, these are not critical.

### Decision Request

**👤 USER DECISION REQUIRED:**
Based on this analysis, do you want to proceed with Option 1 (Browser-Level), or would you prefer a different approach?

**Questions for you to consider:**
- Is cross-device/session history persistence important for your users?
- Do you need audit trail / version history features in the future?
- Is the simpler, faster approach aligned with your current priorities?

**Next Steps:**
Once you approve the strategic direction, I'll complete the implementation plan details.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.x with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Key Patterns:** Auto-save with 500ms debounce, immutable state updates

### Current State

**Section Editing Flow (from codebase analysis):**
```
User Input (Block Editor)
    ↓
onChange() - immutable state update
    ↓
setContent() - local React state
    ↓
triggerSave() via useAutoSave hook
    ↓
[500ms debounce]
    ↓
updateSection() Server Action
    ↓
Database Update
```

**Key Files:**
- `components/editor/SectionEditor.tsx` - Main editor wrapper with auto-save
- `hooks/useAutoSave.ts` - Debounced save hook (500ms delay)
- `components/editor/blocks/*.tsx` - 10 block-type editors
- `app/actions/sections.ts` - Server actions for CRUD operations

**No existing undo/redo mechanisms** - Confirmed via codebase search.

### Existing Codebase Analysis

- [x] **Context Providers** - No relevant context for undo/redo
- [x] **Server Actions** (`app/actions/sections.ts`) - `updateSection()` is the save target
- [x] **Hooks** (`hooks/useAutoSave.ts`) - Integration point for history capture
- [x] **Component Patterns** - All block editors use immutable updates with `onChange`

---

## 4. Context & Problem Definition

### Problem Statement

Users editing section content have no way to undo accidental changes. Once content is auto-saved (after 500ms debounce), the previous state is lost. This creates anxiety when making edits and wastes time when mistakes happen.

Common scenarios:
- Accidentally deleting text while selecting
- Making multiple changes and wanting to revert to earlier state
- Experimenting with content and wanting to "undo all"

### Success Criteria

- [ ] Users can undo recent changes with Ctrl/Cmd+Z (up to 50 steps)
- [ ] Users can redo undone changes with Ctrl/Cmd+Shift+Z
- [ ] Undo/redo buttons visible in section editor UI
- [ ] History persists across page refreshes (localStorage)
- [ ] History is per-section (not global)
- [ ] Clear visual feedback when at history boundaries (nothing to undo/redo)
- [ ] Memory usage stays bounded (limit history depth)

---

## 5. Development Mode Context

- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Priority: Speed and simplicity** over data preservation
- **Aggressive refactoring allowed** - delete/recreate components as needed

---

## 6. Technical Requirements

### Functional Requirements

- User can press Ctrl/Cmd+Z to undo the last content change
- User can press Ctrl/Cmd+Shift+Z (or Ctrl/Cmd+Y) to redo
- User can click Undo/Redo buttons in the section editor toolbar
- Undo history tracks content changes, not structural changes (reorder, delete section)
- History persists in localStorage keyed by section ID
- Maximum 50 history entries per section
- History cleared when section is deleted

### Non-Functional Requirements

- **Performance:** Undo/redo operations complete in <10ms (local state)
- **Memory:** History limited to prevent memory bloat
- **Usability:** Standard keyboard shortcuts, clear button states
- **Accessibility:** Buttons have proper ARIA labels, keyboard accessible

### Technical Constraints

- Must integrate with existing `useAutoSave` hook without breaking auto-save
- Must work with all 10 block types (same history mechanism)
- localStorage key format: `section-history-{sectionId}`
- Cannot affect server-side rendering (client-only feature)

---

## 7. Data & Database Changes

### Database Schema Changes

**None required** - Browser-level implementation uses localStorage only.

### Data Model Updates

```typescript
// New type for history entry
interface HistoryEntry<T> {
  content: T;
  timestamp: number;
}

// History state shape
interface HistoryState<T> {
  past: HistoryEntry<T>[];    // Stack of previous states
  present: T;                  // Current state
  future: HistoryEntry<T>[];  // Stack of undone states (for redo)
}
```

### Data Migration Plan

**None required** - New feature with no existing data.

---

## 8. Backend Changes & Background Jobs

**None required** - This is a purely frontend feature.

---

## 9. Frontend Changes

### New Components

- [x] **`hooks/useHistory.ts`** - Generic undo/redo hook with localStorage persistence ✓ 2025-12-27
- [x] **`components/editor/UndoRedoButtons.tsx`** - Undo/Redo button pair for toolbar ✓ 2025-12-27

### Component Updates

- [x] **`components/editor/SectionEditor.tsx`** - Integrate useHistory hook, add toolbar buttons ✓ 2025-12-27
- [ ] **`components/editor/SaveIndicator.tsx`** - Consider combining with undo/redo buttons into unified toolbar

### State Management

**New `useHistory` hook API:**
```typescript
const {
  state,           // Current content state
  set,             // Set new state (adds to history)
  undo,            // Go back one step
  redo,            // Go forward one step
  canUndo,         // Boolean - history available
  canRedo,         // Boolean - future available
  clear,           // Clear all history
} = useHistory<SectionContent>({
  initialState: section.content,
  storageKey: `section-history-${section.id}`,
  maxHistory: 50,
});
```

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**`components/editor/SectionEditor.tsx`:**
```typescript
export function SectionEditor({ section, siteId }: SectionEditorProps) {
  const [content, setContent] = useState<SectionContent>(section.content);

  const saveContent = async (newContent: SectionContent) => {
    return await updateSection(section.id, newContent);
  };

  const { saveStatus, triggerSave, retryLastSave } = useAutoSave({
    onSave: saveContent,
    debounceMs: 500,
  });

  const handleContentChange = (newContent: SectionContent) => {
    setContent(newContent);
    triggerSave(newContent);
  };

  // ... renders block editor with onChange={handleContentChange}
}
```

### 📂 **After Implementation**

**New `hooks/useHistory.ts`:**
```typescript
export function useHistory<T>({
  initialState,
  storageKey,
  maxHistory = 50,
}: UseHistoryOptions<T>) {
  const [history, setHistory] = useState<HistoryState<T>>(() => {
    // Load from localStorage if available
    const stored = storageKey ? localStorage.getItem(storageKey) : null;
    if (stored) {
      return JSON.parse(stored);
    }
    return { past: [], present: initialState, future: [] };
  });

  const set = useCallback((newState: T) => {
    setHistory(h => ({
      past: [...h.past.slice(-maxHistory + 1), { content: h.present, timestamp: Date.now() }],
      present: newState,
      future: [], // Clear redo stack on new change
    }));
  }, [maxHistory]);

  const undo = useCallback(() => { /* pop from past, push to future */ }, []);
  const redo = useCallback(() => { /* pop from future, push to past */ }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(history));
    }
  }, [history, storageKey]);

  return {
    state: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    clear: () => setHistory({ past: [], present: initialState, future: [] }),
  };
}
```

**Updated `components/editor/SectionEditor.tsx`:**
```typescript
export function SectionEditor({ section, siteId }: SectionEditorProps) {
  const {
    state: content,
    set: setContent,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<SectionContent>({
    initialState: section.content,
    storageKey: `section-history-${section.id}`,
    maxHistory: 50,
  });

  // ... same auto-save logic, but uses history state

  return (
    <div>
      <div className="flex items-center gap-2">
        <UndoRedoButtons
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <SaveIndicator status={saveStatus} onRetry={retryLastSave} />
      </div>
      {/* Block editor */}
    </div>
  );
}
```

### 🎯 **Key Changes Summary**

- [ ] **New `useHistory` hook:** Generic undo/redo state management with localStorage
- [ ] **New `UndoRedoButtons` component:** UI buttons with disabled states
- [ ] **Updated `SectionEditor`:** Integrate history hook, add keyboard shortcuts
- [ ] **Files Modified:** 2 existing files, 2 new files
- [ ] **Impact:** Additive feature, no breaking changes to existing behavior

---

## 11. Implementation Plan

### Phase 1: Core History Hook
**Goal:** Create reusable undo/redo hook with localStorage persistence

- [ ] **Task 1.1:** Create `hooks/useHistory.ts`
  - Files: `hooks/useHistory.ts`
  - Details: Generic TypeScript hook with past/present/future stacks, localStorage sync, max history limit

- [ ] **Task 1.2:** Add keyboard shortcut handling
  - Files: `hooks/useHistory.ts` (or separate `hooks/useUndoRedoKeyboard.ts`)
  - Details: Listen for Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z, call undo/redo

### Phase 2: UI Components
**Goal:** Create undo/redo button component

- [ ] **Task 2.1:** Create `UndoRedoButtons` component
  - Files: `components/editor/UndoRedoButtons.tsx`
  - Details: Undo/Redo icon buttons using shadcn/ui, disabled states, tooltips

### Phase 3: Integration
**Goal:** Integrate history into section editor

- [ ] **Task 3.1:** Update SectionEditor to use history hook
  - Files: `components/editor/SectionEditor.tsx`
  - Details: Replace useState with useHistory, wire up auto-save to history state

- [ ] **Task 3.2:** Add UndoRedoButtons to editor toolbar
  - Files: `components/editor/SectionEditor.tsx`
  - Details: Add buttons next to SaveIndicator, handle keyboard events

### Phase 4: Testing & Polish
**Goal:** Verify functionality and edge cases

- [ ] **Task 4.1:** Test all 10 block types
  - Details: Verify undo/redo works for each block type's content structure

- [ ] **Task 4.2:** Test edge cases
  - Details: Empty history, max history limit, localStorage quota, page refresh persistence

- [ ] **Task 4.3:** Cleanup localStorage on section delete
  - Files: `app/actions/sections.ts` (optional - client-side cleanup may suffice)
  - Details: Remove history when section is deleted

### Phase 5: Code Review
**Goal:** Comprehensive review before user testing

- [ ] **Task 5.1:** Present "Implementation Complete!" message
- [ ] **Task 5.2:** Execute comprehensive code review

### Phase 6: User Browser Testing
**Goal:** User verifies functionality in browser

- [ ] **Task 6.1:** Present testing checklist to user
- [ ] **Task 6.2:** Wait for user confirmation

---

## 12. Task Completion Tracking

_To be updated during implementation_

---

## 13. File Structure & Organization

### New Files to Create
```
hooks/
└── useHistory.ts                    # Undo/redo state management hook

components/editor/
└── UndoRedoButtons.tsx              # Undo/Redo button pair
```

### Files to Modify
- `components/editor/SectionEditor.tsx` - Integrate history hook and buttons

### Dependencies to Add

**None required** - Uses only React and existing shadcn/ui components.

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider

- [ ] **Large content objects:** JSONB content could be large for gallery/features with many items
  - **Mitigation:** Limit history depth (50), consider content size check

- [ ] **Rapid edits:** User typing quickly creates many history entries
  - **Mitigation:** Debounce history entries (only save after 300ms pause, like auto-save)

- [ ] **localStorage quota:** 5MB limit could be exceeded with many sections
  - **Mitigation:** LRU eviction of oldest entries, try-catch localStorage operations

- [ ] **SSR compatibility:** localStorage not available during SSR
  - **Mitigation:** Guard localStorage access with typeof window check

### Security Considerations

- [ ] **No security concerns:** All data stays client-side, no new attack surface
- [ ] **localStorage is per-origin:** Users can only access their own history

---

## 15. Deployment & Configuration

**No environment variables required.**

**No deployment changes required** - Purely frontend feature.

---

## 16. AI Agent Instructions

_Standard workflow applies - see template._

---

## 17. Notes & Additional Context

### Design Decisions

1. **Per-section history vs global:** Per-section keeps memory bounded and matches mental model (each section is independent)

2. **localStorage vs sessionStorage:** localStorage persists across tabs/refreshes, better for "oops" recovery

3. **History depth of 50:** Balance between usefulness and memory. Most undo needs are <10 steps.

4. **Keyboard shortcuts:** Standard Ctrl/Cmd+Z pattern is universally expected

### Future Enhancements (Not in scope)

- Named checkpoints / manual saves
- Visual history timeline
- Diff viewer between versions
- Cross-section undo (page-level history)

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [x] **No breaking changes** - Purely additive feature

#### Performance Implications
- [x] **localStorage sync:** Minimal impact, only on state changes
- [x] **Memory:** Bounded by 50-entry limit per section

#### User Experience Impacts
- [x] **Positive:** Reduces editing anxiety, familiar shortcuts
- [x] **Learning curve:** None - standard Ctrl+Z behavior

### Critical Issues Identification

**🟢 No red or yellow flags identified.**

This is a low-risk, high-value enhancement with no database changes, no breaking changes, and minimal complexity.

---

*Created: 2025-12-27*
*Template Version: 1.0*
