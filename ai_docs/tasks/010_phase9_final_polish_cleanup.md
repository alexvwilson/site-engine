# AI Task Template

> **Instructions:** Phase 9 - Final Polish & Cleanup for Site Engine MVP

---

## 1. Task Overview

### Task Title
**Title:** Phase 9 - Final Polish & Cleanup

### Goal Statement
**Goal:** Complete the Site Engine MVP by removing remaining template artifacts (transcription references), updating documentation (CLAUDE.md), and performing integration testing to ensure all features work together seamlessly.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - this is cleanup and polish work with a clear, defined scope from the roadmap.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Language:** TypeScript 5.x with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Authentication:** Supabase Auth managed by middleware.ts
- **Background Jobs:** Trigger.dev v4 for theme generation and layout suggestions
- **AI Integration:** OpenAI API (GPT-4o for theme/layout generation)

### Current State
Site Engine has completed Phases 0-8:
- ✅ Landing page with Site Engine branding
- ✅ Dashboard with site management (CRUD)
- ✅ Page management with sections
- ✅ Section builder with 10 block types (including header)
- ✅ AI theme generation (Quick mode)
- ✅ Page preview with device toggle
- ✅ AI layout suggestions
- ✅ Published sites at `/sites/[slug]`

**Remaining work:**
- Template artifacts from transcription app still in codebase
- CLAUDE.md still references transcription app
- Integration testing needed to verify all features work together

---

## 4. Context & Problem Definition

### Problem Statement
The codebase was forked from a transcription app template. While all transcription-specific code was removed in Phase 2, there may be remaining references in comments, documentation, or configuration files. Additionally, CLAUDE.md needs updating to reflect Site Engine's architecture.

### Success Criteria
- [ ] No remaining "transcript" or "transcription" references in active code
- [ ] CLAUDE.md updated with Site Engine-specific instructions
- [ ] All integration tests pass (manual verification)
- [ ] Build completes without errors
- [ ] Type-check passes without errors

---

## 5. Development Mode Context

- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** - cleanup can be aggressive
- **Priority: Clean, maintainable codebase** for future development

---

## 6. Technical Requirements

### Functional Requirements
- Remove all remaining template references
- Update documentation to reflect current architecture
- Verify all features work together

### Non-Functional Requirements
- **Code Quality:** Clean, well-documented codebase
- **Maintainability:** Clear architecture documentation
- **Type Safety:** All types properly defined

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - Phase 9 is cleanup only, no schema changes.

---

## 8. Backend Changes & Background Jobs

### Server Actions
**No new server actions** - Phase 9 is cleanup only.

### Trigger.dev Tasks
**No new tasks** - existing tasks already complete.

---

## 9. Frontend Changes

### Components
**No new components** - Phase 9 focuses on cleanup and documentation.

---

## 10. Code Changes Overview

### Phase 9.1: Remove Template Artifacts

**Files to Search:**
- All `.ts`, `.tsx`, `.md` files for "transcript" references
- Configuration files for template-specific settings
- Comments that reference the old transcription app

**Expected Changes:**
- Remove or update any remaining references
- Clean up unused imports or dead code paths

### Phase 9.2: Update CLAUDE.md

**Current State:** References transcription app, Whisper API, audio processing
**Target State:** References Site Engine, theme generation, section builder, published sites

### Phase 9.3: Integration Testing

**Manual verification of complete user flows:**
1. Create site → Add pages → Add sections → Generate theme → Preview → Publish
2. AI theme generation (Quick mode)
3. AI layout suggestions
4. Auto-save functionality
5. Section drag-and-drop reordering
6. Theme switching
7. Published site rendering

---

## 11. Implementation Plan

### Phase 1: Remove Template Artifacts
**Goal:** Clean up all remaining transcription references

- [ ] **Task 1.1:** Search for "transcript" references
  - Command: `grep -r "transcript" --include="*.ts" --include="*.tsx" --include="*.md"`
  - Details: Identify all files with references
- [ ] **Task 1.2:** Search for "transcription" references
  - Command: `grep -r "transcription" --include="*.ts" --include="*.tsx" --include="*.md"`
  - Details: Identify all files with references
- [ ] **Task 1.3:** Search for "Whisper" references
  - Command: `grep -r "Whisper\|whisper" --include="*.ts" --include="*.tsx" --include="*.md"`
  - Details: Identify template-specific API references
- [ ] **Task 1.4:** Search for "audio" references in non-essential files
  - Command: `grep -r "audio" --include="*.ts" --include="*.tsx" --include="*.md"`
  - Details: Identify remaining media processing references
- [ ] **Task 1.5:** Clean up identified files
  - Files: [To be determined from search results]
  - Details: Remove or update references as appropriate
- [ ] **Task 1.6:** Verify cleanup complete
  - Command: Re-run searches to confirm no remaining references

### Phase 2: Update CLAUDE.md
**Goal:** Update documentation to reflect Site Engine architecture

- [ ] **Task 2.1:** Read current CLAUDE.md
  - Files: `CLAUDE.md`
  - Details: Analyze current content
- [ ] **Task 2.2:** Update Project Overview section
  - Details: Change from transcription app to Site Engine description
- [ ] **Task 2.3:** Update Tech Stack section
  - Details: Replace Whisper with OpenAI GPT-4o for theme generation
- [ ] **Task 2.4:** Update Architecture Overview section
  - Details: Document Site Engine route structure, database schema
- [ ] **Task 2.5:** Update Trigger.dev Tasks section
  - Details: Document theme generation and layout suggestion tasks
- [ ] **Task 2.6:** Remove transcription-specific sections
  - Details: Remove audio processing, transcript flow documentation
- [ ] **Task 2.7:** Add Site Engine-specific sections
  - Details: Theme system, section types, published sites

### Phase 3: Integration Testing
**Goal:** Verify all features work together

- [ ] **Task 3.1:** Test site creation flow
  - Details: Create new site, verify dashboard updates
- [ ] **Task 3.2:** Test page management
  - Details: Add pages, set homepage, edit page metadata
- [ ] **Task 3.3:** Test section builder
  - Details: Add each block type, reorder sections, delete sections
- [ ] **Task 3.4:** Test AI theme generation
  - Details: Generate theme with Quick mode, verify theme applies
- [ ] **Task 3.5:** Test AI layout suggestions
  - Details: Request suggestions, apply selected sections
- [ ] **Task 3.6:** Test page preview
  - Details: Preview with different device sizes
- [ ] **Task 3.7:** Test publishing flow
  - Details: Publish site, verify public URL works
- [ ] **Task 3.8:** Test theme switching
  - Details: Activate different theme, verify changes apply

### Phase 4: Final Verification
**Goal:** Ensure build and type-check pass

- [ ] **Task 4.1:** Run type-check
  - Command: `npm run type-check`
  - Details: Verify no TypeScript errors
- [ ] **Task 4.2:** Run lint
  - Command: `npm run lint`
  - Details: Verify no linting errors
- [ ] **Task 4.3:** Run build (if needed)
  - Command: `npm run build`
  - Details: Verify production build succeeds

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

**Date:** 2025-12-27

### Completion Log
(To be filled in as tasks are completed)

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `CLAUDE.md` - Update for Site Engine
- [ ] Any files with remaining template references (TBD from search)

### Files to Delete
- [ ] Any remaining transcription-related files missed in Phase 2 (TBD from search)

---

## 14. Potential Issues & Security Review

### Error Scenarios
- **Accidental deletion:** May accidentally remove code that's still needed
  - **Mitigation:** Review each change carefully before applying

### Edge Cases
- **Hidden references:** Template references in comments or strings
  - **Approach:** Use comprehensive regex searches

---

## 15. Deployment & Configuration

No deployment changes required - this is cleanup only.

---

## 16. AI Agent Instructions

### Workflow
1. Execute Phase 1 (Template Artifacts) - search and clean
2. Execute Phase 2 (CLAUDE.md) - update documentation
3. Execute Phase 3 (Integration Testing) - this requires USER browser testing
4. Execute Phase 4 (Final Verification) - type-check and lint

### Important Notes
- **Phase 3 requires user testing** - AI cannot test browser interactions
- **Be conservative with deletions** - review each file before removing
- **Update task document** as each task is completed

---

## 17. Notes & Additional Context

### Reference
- Roadmap: `ai_docs/prep/roadmap.md` - Phase 9 section
- Previous tasks: `ai_docs/tasks/001-009_*.md`

---

*Task Created: 2025-12-27*
*Phase: 9 - Final Polish & Cleanup*
