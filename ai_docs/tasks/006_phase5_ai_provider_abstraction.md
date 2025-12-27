# AI Task Template

## 1. Task Overview

### Task Title
**Title:** Phase 5.2 - Build AI Provider Abstraction for Theme Generation

### Goal Statement
**Goal:** Create the utility layer for AI-powered theme generation including multi-provider support, prompt templates, response parsing, and Tailwind config generation. This provides the foundation for the Quick Generate and Guided Generate tasks.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Strategic analysis is needed to decide on AI provider implementation scope and structured output approach.

### Problem Context
The theme generation system needs to:
1. Call AI APIs to generate theme components (colors, typography, component styles)
2. Parse AI responses into typed TypeScript objects
3. Generate Tailwind CSS configuration and CSS variables from theme data

Key decisions:
- How many AI providers to support initially
- Whether to use OpenAI's JSON mode / structured outputs
- How to handle font validation (allowed fonts list)

### Solution Options Analysis

#### Option 1: OpenAI Only (Recommended for MVP)
**Approach:** Start with OpenAI GPT-4o only, design abstraction for future multi-provider support.

**Pros:**
- Faster implementation
- GPT-4o has excellent structured output support
- Already have OpenAI configured in the project
- Can add Anthropic/Google later without refactoring

**Cons:**
- Single provider dependency
- No fallback if OpenAI has issues

**Implementation Complexity:** Low
**Risk Level:** Low

#### Option 2: Full Multi-Provider Now
**Approach:** Implement OpenAI, Anthropic, and Google Gemini support immediately.

**Pros:**
- Complete solution from day one
- Fallback options available

**Cons:**
- More complex, longer implementation time
- Need additional API keys configured
- More testing required

**Implementation Complexity:** High
**Risk Level:** Medium

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 1 - OpenAI Only for MVP

**Why this is the best choice:**
1. **Speed** - Get theme generation working quickly
2. **Quality** - GPT-4o has excellent JSON mode for structured outputs
3. **Extensibility** - Design the abstraction interface for future providers
4. **Existing infrastructure** - OPENAI_API_KEY already configured

The abstraction layer will define interfaces that make adding Anthropic/Google later straightforward.

### Questions for User

**Q1: Confirm OpenAI-only approach for MVP?**
- **A) Yes** - Start with OpenAI, add other providers later
- **B) No** - Implement multiple providers now

**Q2: Font List Strategy**
For typography generation, should we:
- **A) Use Google Fonts** - Curated list of popular Google Fonts (Inter, Poppins, Open Sans, etc.)
- **B) System fonts only** - Safer but less variety
- **C) Any font** - Let AI suggest, validate availability later

Recommendation: **A** - Google Fonts are widely available and provide good variety.

**Q3: Structured Output Approach**
- **A) OpenAI JSON mode** (Recommended) - `response_format: { type: "json_object" }` with Zod validation
- **B) Function calling** - More structured but more complex
- **C) Regular text parsing** - More fragile

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Background Jobs:** Trigger.dev v4
- **AI Integration:** OpenAI API (OPENAI_API_KEY configured)
- **Existing Utilities:** `trigger/utils/openai.ts` - singleton OpenAI client

### Current State
- OpenAI client already exists as singleton in `trigger/utils/openai.ts`
- Theme types defined in `lib/drizzle/schema/theme-types.ts`
- No theme generation utilities exist yet
- Trigger.dev configured with FFmpeg extension

### Existing Codebase Analysis

- [x] **Trigger.dev Tasks** (`trigger/`)
  - `trigger/utils/openai.ts` - Singleton OpenAI client pattern
  - `trigger/index.ts` - Exports utilities
  - No tasks exist yet (cleaned up from template)

- [x] **Theme Types** (`lib/drizzle/schema/theme-types.ts`)
  - ThemeRequirements, ColorPalette, TypographySettings, ComponentStyles, ThemeData defined
  - AIProviderConfig interface defined

---

## 4. Context & Problem Definition

### Problem Statement
Theme generation tasks need utility functions to:
1. Call AI APIs with appropriate prompts
2. Parse and validate AI responses into typed objects
3. Generate Tailwind config extends and CSS variables from theme data

Without this layer, each task would need to handle prompt construction, API calls, and response parsing independently.

### Success Criteria
- [ ] AI provider abstraction created with extensible interface
- [ ] Prompt templates for each theme generation stage (colors, typography, components, full theme)
- [ ] Response parsers with Zod validation for each stage output
- [ ] Tailwind config generator producing valid extends object
- [ ] CSS variables generator producing valid CSS custom properties
- [ ] Type-safe integration with existing theme types

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- Generate color palettes based on brand/style requirements
- Generate typography settings with validated font families
- Generate component styles (buttons, cards, inputs, badges)
- Generate complete themes in single AI call (Quick mode)
- Parse AI JSON responses into typed TypeScript objects
- Generate Tailwind config extends object
- Generate CSS custom properties string

### Non-Functional Requirements
- **Reliability:** Zod validation ensures AI responses match expected schema
- **Performance:** Single AI call for Quick mode, minimal API calls for Guided mode
- **Maintainability:** Clean abstraction allows adding providers later

### Technical Constraints
- Must use existing OpenAI client from `trigger/utils/openai.ts`
- Must integrate with types from `lib/drizzle/schema/theme-types.ts`
- Must work within Trigger.dev task context

---

## 7. Data & Database Changes

No database changes required for this task. Uses existing theme types.

---

## 8. Backend Changes & Background Jobs

### Utilities to Create

1. **`trigger/utils/ai-providers.ts`** - AI provider abstraction
   - `generateThemeContent<T>(prompt, schema)` - Call AI and validate response
   - Provider configuration and model selection
   - Error handling with retries

2. **`trigger/utils/theme-prompts.ts`** - Prompt templates
   - `buildColorPalettePrompt(requirements)` - Colors only
   - `buildTypographyPrompt(requirements, colors)` - Typography with color context
   - `buildComponentStylesPrompt(requirements, colors, typography)` - Component styles
   - `buildQuickGeneratePrompt(requirements)` - Full theme in one call

3. **`trigger/utils/theme-parser.ts`** - Response parsing/validation
   - Zod schemas for each output type
   - `parseColorPaletteResponse(json)` - Validate and return ColorPalette
   - `parseTypographyResponse(json)` - Validate and return TypographySettings
   - `parseComponentStylesResponse(json)` - Validate and return ComponentStyles
   - `parseThemeDataResponse(json)` - Validate full theme

4. **`trigger/utils/tailwind-generator.ts`** - Output generation
   - `generateTailwindExtends(theme)` - Create Tailwind config extends object
   - `generateCSSVariables(theme)` - Create CSS custom properties string

---

## 9. Frontend Changes

No frontend changes in this task. Utilities are backend-only.

---

## 10. Code Changes Overview

### Files to Create

1. **`trigger/utils/ai-providers.ts`** (~80 lines)
   - AI client abstraction with OpenAI implementation
   - Structured output generation with Zod validation

2. **`trigger/utils/theme-prompts.ts`** (~200 lines)
   - Prompt templates for each generation stage
   - System prompts explaining output format

3. **`trigger/utils/theme-parser.ts`** (~150 lines)
   - Zod schemas matching theme types
   - Validation functions with error handling

4. **`trigger/utils/tailwind-generator.ts`** (~120 lines)
   - Tailwind extends object generation
   - CSS variables string generation

5. **`trigger/utils/font-list.ts`** (~50 lines)
   - Curated list of Google Fonts for validation

### Files to Modify

1. **`trigger/index.ts`**
   - Add exports for new utilities

---

## 11. Implementation Plan

### Phase 1: AI Provider Abstraction
**Goal:** Create the AI client wrapper with structured output support

- [x] **Task 1.1:** Create `trigger/utils/ai-providers.ts` ✓ 2025-12-26
  - OpenAI client wrapper with JSON mode
  - `generateStructuredOutput<T>()` function with Zod validation
  - `generateTextOutput()` for non-structured responses (~150 lines)

### Phase 2: Font List and Validation
**Goal:** Define allowed fonts for typography generation

- [x] **Task 2.1:** Create `trigger/utils/font-list.ts` ✓ 2025-12-26
  - Curated Google Fonts: sans-serif, serif, display, monospace categories
  - Font validation functions and fallbacks
  - Font pairing suggestions (~200 lines)

### Phase 3: Zod Schemas and Parsers
**Goal:** Create validation layer for AI responses

- [x] **Task 3.1:** Create `trigger/utils/theme-parser.ts` ✓ 2025-12-26
  - Zod schemas for ColorPalette, TypographySettings, ComponentStyles, ThemeData
  - Parse functions with validation and safe parse variants
  - Hex color normalization and font fallback transforms (~250 lines)

### Phase 4: Prompt Templates
**Goal:** Create all prompt templates for theme generation

- [x] **Task 4.1:** Create `trigger/utils/theme-prompts.ts` ✓ 2025-12-26
  - Color palette prompt with stage 1 JSON format
  - Typography prompt with color context
  - Component styles prompt with colors + typography context
  - Quick generate prompt for complete theme (~280 lines)

### Phase 5: Output Generators
**Goal:** Create Tailwind config and CSS variable generators

- [x] **Task 5.1:** Create `trigger/utils/tailwind-generator.ts` ✓ 2025-12-26
  - `generateTailwindExtends()` - colors, fonts, sizes, radii, shadows
  - `generateCSSVariables()` - complete CSS custom properties
  - `generateGoogleFontsUrl/Link/Import()` - font loading helpers (~200 lines)

### Phase 6: Update Exports and Verify
**Goal:** Export utilities and verify with type-check

- [x] **Task 6.1:** Update `trigger/index.ts` ✓ 2025-12-26
  - Added exports for all new utility files with section comments
- [x] **Task 6.2:** Run type-check and lint ✓ 2025-12-26
  - `npm run type-check` passed
  - `npm run lint` passed (0 errors, 2 pre-existing warnings)

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] Update task document immediately after each completed subtask
- [ ] Mark checkboxes as [x] with completion timestamp
- [ ] Add brief completion notes

---

## 13. File Structure & Organization

### New Files to Create
```
trigger/utils/
├── openai.ts               # (existing) OpenAI client
├── ai-providers.ts         # AI abstraction layer
├── font-list.ts            # Allowed fonts for validation
├── theme-prompts.ts        # Prompt templates
├── theme-parser.ts         # Zod schemas and validators
└── tailwind-generator.ts   # Output generators
```

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **AI returns invalid JSON:** Zod validation catches, throw descriptive error
- [ ] **AI suggests unavailable font:** Validate against font list, use fallback
- [ ] **AI returns colors with wrong format:** Validate hex codes in Zod schema

### Edge Cases
- [ ] **Empty requirements:** Provide sensible defaults in prompts
- [ ] **Very long additional notes:** Truncate to reasonable length

### Security
- [ ] **API keys:** Already handled via environment variables
- [ ] **Input sanitization:** Escape user input in prompts

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables needed. OPENAI_API_KEY already configured.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Wait for user answers to Q1, Q2, Q3
2. Implement in phase order
3. Each utility should be self-contained and testable

### Code Quality Standards
- Use Zod for all AI response validation
- Add JSDoc comments for public functions
- Follow existing openai.ts pattern

---

## 17. Notes & Additional Context

### Reference Documents
- `ai_docs/prep/trigger_workflow_theme_generation.md` - Detailed prompts and output formats
- `lib/drizzle/schema/theme-types.ts` - TypeScript interfaces to match

### Key Design Decisions
- Use OpenAI's JSON mode for reliable structured output
- Curated Google Fonts list prevents unavailable font issues
- Zod validation ensures type safety at runtime

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **No breaking changes** - Adding new utilities only

### Ripple Effects Assessment
- [ ] **Theme tasks will depend on these utilities** - Must be complete before task implementation
- [ ] **Types must match existing theme-types.ts** - Careful alignment required

---

*Task Created: December 2025*
*Phase: 5.2 - AI Provider Abstraction*
