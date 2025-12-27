# 🎨 Theme Generation Workflow: Trigger.dev Quick Reference

> **Purpose**: Quick-reference "digital twin" of the AI theme generation workflow to help AI understand the system without re-reading all code files.

---

## 📋 Workflow Overview

This is a Trigger.dev v4 background job workflow that generates Tailwind CSS themes with shadcn/ui compatible styles using AI. The workflow supports **two modes** based on user preference.

**Core Flow**: User describes desired theme → AI generates colors/typography/styles → User reviews/applies

**Two Generation Modes**:
- **Quick Generate** ("Feeling Lucky"): Single AI call generates complete theme, user previews and applies
- **Guided Generate**: Multi-stage process with human checkpoints at each stage (colors → typography → components)

**Key Decisions**:
- **Generation Mode**: User selects Quick or Guided at start
- **Human Checkpoints**: In Guided mode, user approves/adjusts each stage before continuing

**AI Provider Abstraction**: Supports multiple AI vendors (OpenAI, Anthropic Claude, Google Gemini) with configurable model selection.

**Database as Source of Truth**: All state lives in PostgreSQL via Drizzle ORM. Job progress, intermediate results, and final themes stored in database.

**Progress Tracking**:
- Quick Generate: Real-time progress via `metadata.set()` (0-100%)
- Guided Generate: Stage-based status (awaiting_color_approval, awaiting_typography_approval, etc.)

**Theme Versioning**: Each generation creates a new theme version. Users can save multiple themes, switch between them, and delete unwanted themes.

**Tech Stack**:
- Trigger.dev v4 (background jobs)
- OpenAI GPT-4.1 / Claude / Gemini (AI generation - configurable)
- Tailwind CSS (output format)
- shadcn/ui (component styles)
- PostgreSQL + Drizzle ORM (state)

---

## 🔗 Task Chain Diagram

### Quick Generate Mode ("Feeling Lucky")

```
[USER OPENS THEME GENERATOR MODAL]
        ↓
[Selects "Quick Generate" mode]
        ↓
┌────────────────────────────────────────┐
│ Frontend: Gather Requirements Form     │
│ • Brand/site name                      │
│ • Industry/use case                    │
│ • Style keywords (modern, playful...)  │
│ • Color preferences (optional)         │
│ • Target audience (optional)           │
└─────────────┬──────────────────────────┘
              ↓
[USER SUBMITS → Server Action creates theme_generation_job]
[Mode: quick, Status: pending]
              ↓
┌────────────────────────────────────────┐
│ Task: generate-theme-quick             │
│ • Single AI call with full prompt      │
│ • Generates complete theme:            │
│   - Color palette (5 colors)           │
│   - Typography settings                │
│   - Component styles                   │
│   - CSS variables                      │
│ • Progress: 0% → 100%                  │
│ • Saves to job record                  │
│ • Status: completed                    │
└─────────────┬──────────────────────────┘
              ↓
[USER SEES COMPLETE THEME PREVIEW]
├── "Apply Theme" → Save as active theme for site
├── "Save for Later" → Save to themes list (not active)
└── "Try Again" → Start new generation job
```

### Guided Generate Mode (Human-in-the-Loop)

```
[USER OPENS THEME GENERATOR MODAL]
        ↓
[Selects "Guided Generate" mode]
        ↓
┌────────────────────────────────────────┐
│ Frontend: Gather Requirements Form     │
│ • Brand/site name                      │
│ • Industry/use case                    │
│ • Style keywords                       │
│ • Color preferences (optional)         │
│ • Target audience (optional)           │
└─────────────┬──────────────────────────┘
              ↓
[USER SUBMITS → Server Action creates theme_generation_job]
[Mode: guided, Status: pending, Stage: colors]
              ↓
┌────────────────────────────────────────┐
│ Task 1: generate-color-palette         │
│ • AI generates 5-color palette         │
│ • Colors: primary, secondary, accent,  │
│   background, foreground               │
│ • Includes color rationale             │
│ • Progress: 0% → 25%                   │
│ • Status: awaiting_color_approval      │
└─────────────┬──────────────────────────┘
              ↓
[USER REVIEWS COLORS IN UI]
├── Approve → Trigger Task 2
├── Adjust → Manual color picker, save adjustments
│            Then trigger Task 2 with adjusted colors
└── Regenerate → Re-run Task 1 with modified input
              ↓
┌────────────────────────────────────────┐
│ Task 2: generate-typography            │
│ • Uses approved colors as context      │
│ • Generates font families:             │
│   - Heading font                       │
│   - Body font                          │
│ • Font sizes, weights, line heights    │
│ • Progress: 25% → 50%                  │
│ • Status: awaiting_typography_approval │
└─────────────┬──────────────────────────┘
              ↓
[USER REVIEWS TYPOGRAPHY PREVIEW]
├── Approve → Trigger Task 3
├── Adjust → Manual font selection, save
│            Then trigger Task 3
└── Regenerate → Re-run Task 2
              ↓
┌────────────────────────────────────────┐
│ Task 3: generate-component-styles      │
│ • Uses colors + typography as context  │
│ • Generates shadcn/ui component styles:│
│   - Buttons (variants, sizes)          │
│   - Cards (padding, shadows)           │
│   - Inputs (borders, focus states)     │
│   - Badges, alerts, etc.               │
│ • Progress: 50% → 75%                  │
│ • Status: awaiting_styles_approval     │
└─────────────┬──────────────────────────┘
              ↓
[USER REVIEWS COMPONENT PREVIEW]
├── Approve → Trigger Task 4
├── Adjust → Style tweaks, save
│            Then trigger Task 4
└── Regenerate → Re-run Task 3
              ↓
┌────────────────────────────────────────┐
│ Task 4: finalize-theme                 │
│ • Compiles all approved pieces         │
│ • Generates final outputs:             │
│   - Tailwind config extends            │
│   - CSS variables (globals.css format) │
│   - shadcn/ui component overrides      │
│ • Progress: 75% → 100%                 │
│ • Status: completed                    │
└─────────────────────────────────────────┘
              ↓
[USER SEES COMPLETE THEME PREVIEW]
├── "Apply Theme" → Set as active theme for site
├── "Save for Later" → Keep in themes list (not active)
└── "Try Again" → Start new generation job
```

---

## 🌳 Critical Decision Points

### Decision 1: Generation Mode Selection (Frontend)

```typescript
// In theme generation modal
type GenerationMode = "quick" | "guided";

// User selects mode before submitting form
const handleSubmit = async (mode: GenerationMode, requirements: ThemeRequirements) => {
  const job = await createThemeGenerationJob(siteId, {
    mode,
    requirements,
    stage: mode === "guided" ? "colors" : null,
  });

  if (mode === "quick") {
    await triggerQuickGenerate(job.id);
  } else {
    await triggerColorPaletteGenerate(job.id);
  }
};
```

**Why two modes?** Quick Generate is for users who want speed and trust AI judgment. Guided Generate is for users who want control over each design decision.

### Decision 2: Stage Progression (Guided Mode)

```typescript
// Server Action: User approves current stage
export async function approveStageAndContinue(
  jobId: string,
  currentStage: ThemeStage,
  adjustments?: Partial<StageData>
) {
  // Save any manual adjustments
  if (adjustments) {
    await saveStageAdjustments(jobId, currentStage, adjustments);
  }

  // Determine next stage and trigger appropriate task
  switch (currentStage) {
    case "colors":
      await updateJobStage(jobId, "typography");
      await tasks.trigger("generate-typography", { jobId });
      break;
    case "typography":
      await updateJobStage(jobId, "components");
      await tasks.trigger("generate-component-styles", { jobId });
      break;
    case "components":
      await updateJobStage(jobId, "finalizing");
      await tasks.trigger("finalize-theme", { jobId });
      break;
  }
}
```

### Decision 3: Regenerate vs Adjust

```typescript
// User can either adjust manually or regenerate with AI
export async function handleStageAction(
  jobId: string,
  action: "approve" | "adjust" | "regenerate",
  stage: ThemeStage,
  data?: StageData
) {
  switch (action) {
    case "approve":
      // Use AI-generated values as-is
      await approveStageAndContinue(jobId, stage);
      break;
    case "adjust":
      // Use user's manual adjustments, then continue
      await approveStageAndContinue(jobId, stage, data);
      break;
    case "regenerate":
      // Re-run the same stage task with potentially modified requirements
      await regenerateStage(jobId, stage, data?.modifiedRequirements);
      break;
  }
}
```

---

## 📊 Core Data Flow

### Task Payloads

```typescript
// Shared requirements interface
interface ThemeRequirements {
  brandName: string;
  industry: string;           // e.g., "technology", "healthcare", "e-commerce"
  styleKeywords: string[];    // e.g., ["modern", "minimal", "professional"]
  colorPreferences?: {
    preferredColors?: string[];   // Hex codes user wants to include
    avoidColors?: string[];       // Hex codes to avoid
  };
  targetAudience?: string;    // e.g., "young professionals", "enterprise clients"
  additionalNotes?: string;   // Free-form user input
}

// AI Provider configuration
interface AIProviderConfig {
  provider: "openai" | "anthropic" | "google";
  model: string;              // e.g., "gpt-4.1", "claude-3-opus", "gemini-pro"
}

// Task 1: generate-color-palette (Guided mode)
interface GenerateColorPalettePayload {
  jobId: string;
  siteId: string;
  requirements: ThemeRequirements;
  aiConfig: AIProviderConfig;
}

// Task 2: generate-typography (Guided mode)
interface GenerateTypographyPayload {
  jobId: string;
  siteId: string;
  requirements: ThemeRequirements;
  approvedColors: ColorPalette;   // From previous stage
  aiConfig: AIProviderConfig;
}

// Task 3: generate-component-styles (Guided mode)
interface GenerateComponentStylesPayload {
  jobId: string;
  siteId: string;
  requirements: ThemeRequirements;
  approvedColors: ColorPalette;
  approvedTypography: TypographySettings;
  aiConfig: AIProviderConfig;
}

// Task 4: finalize-theme (Guided mode)
interface FinalizeThemePayload {
  jobId: string;
  siteId: string;
  approvedColors: ColorPalette;
  approvedTypography: TypographySettings;
  approvedComponentStyles: ComponentStyles;
}

// Quick Generate task (single call)
interface GenerateThemeQuickPayload {
  jobId: string;
  siteId: string;
  requirements: ThemeRequirements;
  aiConfig: AIProviderConfig;
}
```

### Output Data Structures

```typescript
// Color Palette (Stage 1 output)
interface ColorPalette {
  primary: string;      // Hex code
  secondary: string;
  accent: string;
  background: string;
  foreground: string;   // Text color
  muted: string;        // Muted backgrounds
  mutedForeground: string;
  border: string;
  rationale: string;    // AI explanation of color choices
}

// Typography Settings (Stage 2 output)
interface TypographySettings {
  headingFont: {
    family: string;     // e.g., "Inter", "Poppins"
    weights: number[];  // e.g., [500, 600, 700]
  };
  bodyFont: {
    family: string;
    weights: number[];
  };
  scale: {
    h1: string;         // e.g., "3rem"
    h2: string;
    h3: string;
    h4: string;
    body: string;
    small: string;
  };
  lineHeights: {
    tight: string;      // e.g., "1.25"
    normal: string;
    relaxed: string;
  };
  rationale: string;
}

// Component Styles (Stage 3 output)
interface ComponentStyles {
  button: {
    borderRadius: string;
    paddingX: string;
    paddingY: string;
    variants: Record<string, { bg: string; text: string; border?: string }>;
  };
  card: {
    borderRadius: string;
    padding: string;
    shadow: string;
    border: string;
  };
  input: {
    borderRadius: string;
    borderColor: string;
    focusRing: string;
    padding: string;
  };
  badge: {
    borderRadius: string;
    padding: string;
  };
  rationale: string;
}

// Final Theme Output
interface ThemeData {
  colors: ColorPalette;
  typography: TypographySettings;
  components: ComponentStyles;
  tailwindExtends: Record<string, unknown>;  // For tailwind.config.ts
  cssVariables: string;                       // For globals.css
  generatedAt: string;
  aiProvider: string;
  aiModel: string;
}
```

### Database Tables

**theme_generation_jobs** - Tracks multi-stage generation progress
```typescript
// Key fields
interface ThemeGenerationJob {
  id: string;                 // UUID
  siteId: string;             // FK to sites
  userId: string;             // FK to users
  mode: "quick" | "guided";
  status: ThemeJobStatus;
  stage: ThemeStage | null;   // Current stage for guided mode
  requirements: ThemeRequirements;  // JSONB
  colorData: ColorPalette | null;   // JSONB - Stage 1 result
  typographyData: TypographySettings | null;  // JSONB - Stage 2 result
  componentData: ComponentStyles | null;      // JSONB - Stage 3 result
  finalThemeData: ThemeData | null;           // JSONB - Final result
  aiProvider: string;
  aiModel: string;
  progressPercentage: number;
  errorMessage: string | null;
  runId: string | null;       // Trigger.dev run ID for real-time updates
  createdAt: Date;
  updatedAt: Date;
}

type ThemeJobStatus =
  | "pending"
  | "generating_colors"
  | "awaiting_color_approval"
  | "generating_typography"
  | "awaiting_typography_approval"
  | "generating_components"
  | "awaiting_styles_approval"
  | "finalizing"
  | "completed"
  | "failed";

type ThemeStage = "colors" | "typography" | "components" | "finalizing";
```

**themes** - Saved theme versions per site
```typescript
interface Theme {
  id: string;                 // UUID
  siteId: string;             // FK to sites
  userId: string;             // FK to users
  name: string;               // User-editable name
  data: ThemeData;            // JSONB - complete theme
  isActive: boolean;          // Only one active per site
  generationJobId: string | null;  // FK to theme_generation_jobs
  createdAt: Date;
  updatedAt: Date;
}
```

### Sample Data

```typescript
// Example ThemeRequirements
const sampleRequirements: ThemeRequirements = {
  brandName: "TechFlow",
  industry: "technology",
  styleKeywords: ["modern", "minimal", "professional"],
  colorPreferences: {
    preferredColors: ["#3B82F6"],  // User wants blue
    avoidColors: ["#EF4444"],      // No red
  },
  targetAudience: "B2B SaaS companies",
  additionalNotes: "Clean, trustworthy feel. Similar to Linear or Vercel."
};

// Example ColorPalette output
const sampleColorPalette: ColorPalette = {
  primary: "#3B82F6",
  secondary: "#1E293B",
  accent: "#8B5CF6",
  background: "#FFFFFF",
  foreground: "#0F172A",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  border: "#E2E8F0",
  rationale: "Blue primary conveys trust and technology. Dark secondary adds sophistication. Purple accent provides visual interest without overwhelming."
};
```

---

## 📁 File Locations

### Task Definitions
```
trigger/tasks/generate-theme-quick.ts       - Quick mode: single AI call
trigger/tasks/generate-color-palette.ts     - Guided Stage 1: colors
trigger/tasks/generate-typography.ts        - Guided Stage 2: typography
trigger/tasks/generate-component-styles.ts  - Guided Stage 3: components
trigger/tasks/finalize-theme.ts             - Guided Stage 4: compile final theme
```

### Utility Functions
```
trigger/utils/ai-providers.ts               - Multi-vendor AI abstraction
trigger/utils/theme-prompts.ts              - AI prompt templates for each stage
trigger/utils/theme-parser.ts               - Parse AI responses to typed objects
trigger/utils/tailwind-generator.ts         - Generate Tailwind config from theme
trigger/utils/css-variables-generator.ts    - Generate CSS variables for globals.css
```

### Server-Side Libraries
```
lib/theme-jobs.ts                           - Job creation, status updates, stage management
lib/themes.ts                               - Theme CRUD, activation, versioning
```

### Database Schema
```
lib/drizzle/schema/theme-generation-jobs.ts - Job tracking table
lib/drizzle/schema/themes.ts                - Theme versions table
```

### Server Actions
```
app/actions/theme.ts                        - Theme generation actions
  - triggerThemeGeneration()                - Start new generation job
  - approveStageAndContinue()               - Approve stage, trigger next
  - regenerateStage()                       - Re-run current stage
  - applyTheme()                            - Set theme as active
  - saveThemeForLater()                     - Save without activating
  - deleteTheme()                           - Remove saved theme
  - updateThemeManually()                   - Manual color/font changes
```

### Frontend Components
```
components/theme/theme-generator-modal.tsx  - Main generation modal
components/theme/mode-selector.tsx          - Quick vs Guided toggle
components/theme/requirements-form.tsx      - Input form for requirements
components/theme/color-review.tsx           - Color palette review/adjust
components/theme/typography-review.tsx      - Typography review/adjust
components/theme/component-preview.tsx      - Component styles preview
components/theme/theme-preview.tsx          - Full theme preview
components/theme/saved-themes-list.tsx      - List of saved themes
```

---

## 🔧 Key Utility Functions

### AI Provider Abstraction (trigger/utils/ai-providers.ts)
- `getAIClient(config: AIProviderConfig)` - Get configured client for provider
- `generateStructuredOutput<T>(client, prompt, schema)` - Get typed JSON response
- `SUPPORTED_PROVIDERS` - List of available providers with models

### Theme Prompts (trigger/utils/theme-prompts.ts)
- `buildColorPalettePrompt(requirements)` - Prompt for color generation
- `buildTypographyPrompt(requirements, colors)` - Prompt for typography
- `buildComponentStylesPrompt(requirements, colors, typography)` - Prompt for components
- `buildQuickGeneratePrompt(requirements)` - Full theme in one prompt

### Theme Parsing (trigger/utils/theme-parser.ts)
- `parseColorPaletteResponse(response)` - Extract ColorPalette from AI response
- `parseTypographyResponse(response)` - Extract TypographySettings
- `parseComponentStylesResponse(response)` - Extract ComponentStyles
- `validateThemeData(data)` - Validate complete theme structure

### Output Generation (trigger/utils/tailwind-generator.ts)
- `generateTailwindExtends(theme)` - Create Tailwind config extends object
- `generateCSSVariables(theme)` - Create CSS custom properties string
- `generateShadcnOverrides(theme)` - Create shadcn/ui component overrides

### Job Management (lib/theme-jobs.ts)
- `createThemeGenerationJob(siteId, options)` - Create new job record
- `updateJobStage(jobId, stage, data)` - Update stage and save data
- `updateJobProgress(jobId, progress, status)` - Update progress percentage
- `getJobWithData(jobId)` - Get job with all stage data
- `saveStageAdjustments(jobId, stage, adjustments)` - Save user modifications

### Theme Management (lib/themes.ts)
- `createTheme(siteId, name, data, jobId)` - Save new theme version
- `activateTheme(themeId)` - Set as active, deactivate others
- `getThemesBySite(siteId)` - List all themes for site
- `getActiveTheme(siteId)` - Get currently active theme
- `deleteTheme(themeId)` - Remove theme (prevent deleting active)

---

## 🎯 Progress Tracking Pattern

### Quick Generate Mode

Uses real-time metadata updates for continuous progress:

```typescript
// In generate-theme-quick.ts
export const generateThemeQuickTask = task({
  id: "generate-theme-quick",
  run: async (payload: GenerateThemeQuickPayload) => {
    const { jobId, siteId, requirements, aiConfig } = payload;

    // Update progress as we go
    metadata.set("progress", 10);
    metadata.set("currentStep", "Analyzing requirements");
    await updateJobProgress(jobId, 10, "processing");

    // Generate theme with AI
    metadata.set("progress", 30);
    metadata.set("currentStep", "Generating color palette");

    const theme = await generateFullTheme(requirements, aiConfig);

    metadata.set("progress", 80);
    metadata.set("currentStep", "Compiling theme files");

    // Generate output files
    const tailwindExtends = generateTailwindExtends(theme);
    const cssVariables = generateCSSVariables(theme);

    // Save to database
    await saveThemeGenerationResult(jobId, {
      ...theme,
      tailwindExtends,
      cssVariables,
    });

    metadata.set("progress", 100);
    metadata.set("currentStep", "Complete");
    await updateJobProgress(jobId, 100, "completed");

    return { success: true, themeId: theme.id };
  },
});
```

**Progress Ranges (Quick Mode)**:
- 0-10%: Initializing, validating requirements
- 10-30%: Generating color palette
- 30-50%: Generating typography
- 50-70%: Generating component styles
- 70-90%: Compiling theme files
- 90-100%: Saving and finalizing

### Guided Generate Mode

Uses stage-based status tracking (not continuous progress):

```typescript
// In generate-color-palette.ts
export const generateColorPaletteTask = task({
  id: "generate-color-palette",
  run: async (payload: GenerateColorPalettePayload) => {
    const { jobId, requirements, aiConfig } = payload;

    // Update job status
    await updateJobProgress(jobId, 15, "generating_colors");
    metadata.set("progress", 15);
    metadata.set("currentStep", "Generating color palette");

    // Generate colors with AI
    const colorPalette = await generateColorPalette(requirements, aiConfig);

    // Save to job and update status
    await updateJobStage(jobId, "colors", colorPalette);
    await updateJobProgress(jobId, 25, "awaiting_color_approval");

    metadata.set("progress", 25);
    metadata.set("currentStep", "Awaiting your approval");

    return { success: true, colors: colorPalette };
  },
});
```

**Progress Ranges (Guided Mode)**:
- 0-25%: Color palette generation and approval
- 25-50%: Typography generation and approval
- 50-75%: Component styles generation and approval
- 75-100%: Finalization

**Frontend Integration**:

```typescript
// For Quick mode - real-time updates
const { run } = useRealtimeRun(runId, { accessToken });
const progress = run?.metadata?.progress;
const currentStep = run?.metadata?.currentStep;

// For Guided mode - poll job status
const { data: job } = useSWR(
  `/api/theme-jobs/${jobId}`,
  fetcher,
  { refreshInterval: job?.status.includes("awaiting") ? 0 : 2000 }
);
```

---

## 🚨 Common Failure Points

1. **AI returns invalid JSON**: Parser can't extract structured data → Retry with same prompt (max 3 times), then fail with user-friendly message

2. **AI returns off-brand colors**: Colors don't match user preferences → User can adjust manually or regenerate with refined input

3. **Typography fonts unavailable**: AI suggests font not in allowed list → Fall back to safe system fonts, warn user

4. **Rate limit exceeded**: Provider rate limit hit → Exponential backoff, retry after delay

5. **Conflicting color contrast**: AI generates low-contrast combinations → Validate contrast ratios, warn user in preview

6. **CSS variable syntax error**: Generated CSS is invalid → Validate before saving, regenerate if invalid

7. **Job stuck in awaiting state**: User abandons modal → Jobs older than 24 hours in awaiting state are auto-cleaned

---

## 💡 Key Architecture Principles

1. **Two Modes for Different Users**: Quick Generate for speed/trust, Guided Generate for control. Both produce same output format.

2. **Human-in-the-Loop Checkpoints**: In Guided mode, user approves each stage. This builds trust and allows fine-tuning without regenerating everything.

3. **AI Provider Abstraction**: Unified interface for OpenAI, Anthropic, Google. Easy to add new providers or switch defaults.

4. **Theme Versioning**: Users can save multiple themes, switch between them, delete old ones. Never lose a theme they liked.

5. **Progressive Enhancement**: Even if user only wants to change colors, they can do it manually without AI. AI is an enhancement, not requirement.

6. **Stage Data Persistence**: Each stage's output is saved to database immediately. If user closes modal, they can resume where they left off.

7. **Structured Output**: All AI calls use JSON mode / structured output. Reduces parsing errors and ensures type safety.

8. **Rationale Included**: AI provides reasoning for design choices. Helps users understand and trust the suggestions.

---

## 📝 Quick Implementation Checklist

### Initial Setup
- [ ] Create `theme_generation_jobs` table with Drizzle migration
- [ ] Create `themes` table with Drizzle migration
- [ ] Add AI provider configuration (env variables for API keys)
- [ ] Create AI provider abstraction utility
- [ ] Export tasks from `trigger/index.ts`

### Quick Generate Mode
- [ ] Create `generate-theme-quick.ts` task
- [ ] Build prompt templates for full theme generation
- [ ] Implement response parsing and validation
- [ ] Add Tailwind config generation
- [ ] Add CSS variables generation
- [ ] Test with different requirement combinations

### Guided Generate Mode
- [ ] Create `generate-color-palette.ts` task
- [ ] Create `generate-typography.ts` task
- [ ] Create `generate-component-styles.ts` task
- [ ] Create `finalize-theme.ts` task
- [ ] Implement stage progression server actions
- [ ] Test stage transitions and data persistence

### Frontend
- [ ] Create theme generator modal with mode selector
- [ ] Create requirements form with validation
- [ ] Create color review component with color pickers
- [ ] Create typography review with font previews
- [ ] Create component preview with live samples
- [ ] Create full theme preview
- [ ] Implement real-time progress (Quick mode)
- [ ] Implement stage-based UI (Guided mode)
- [ ] Create saved themes list with activate/delete

### Theme Management
- [ ] Implement theme activation (deactivate others)
- [ ] Implement theme deletion (prevent deleting active)
- [ ] Apply theme to site's `globals.css` and `tailwind.config.ts`
- [ ] Add theme switcher to site settings

### Testing
- [ ] Test Quick mode with various requirements
- [ ] Test Guided mode full flow (all 4 stages)
- [ ] Test stage adjustments (manual overrides)
- [ ] Test regeneration within a stage
- [ ] Test theme versioning (save, switch, delete)
- [ ] Test AI provider fallback/switching
- [ ] Test error handling (invalid responses, rate limits)

---

**Last Updated**: December 2025
**Current State**: Design Complete - Ready for Implementation
**Estimated Tasks**: 5 Trigger.dev tasks (1 quick + 4 guided stages)
**Estimated Duration**: 30s-2min (Quick), 2-5min with human review (Guided)
