/**
 * Theme Data Type Definitions
 *
 * TypeScript interfaces for AI-generated theme data structures.
 * Used by theme generation jobs, saved themes, Trigger.dev tasks, and frontend components.
 */

// ============================================================================
// Theme Requirements (User Input)
// ============================================================================

/**
 * User-provided requirements for theme generation.
 * Sent to AI as context for generating appropriate theme styles.
 */
export interface ThemeRequirements {
  /** Brand or site name for context */
  brandName: string;
  /** Industry/use case (e.g., "technology", "healthcare", "e-commerce") */
  industry: string;
  /** Style descriptors (e.g., ["modern", "minimal", "professional"]) */
  styleKeywords: string[];
  /** Optional color preferences */
  colorPreferences?: {
    /** Hex codes user wants to include */
    preferredColors?: string[];
    /** Hex codes to avoid */
    avoidColors?: string[];
  };
  /** Target audience description (e.g., "young professionals", "enterprise clients") */
  targetAudience?: string;
  /** Free-form additional context from user */
  additionalNotes?: string;
}

// ============================================================================
// Stage 1: Color Palette
// ============================================================================

/**
 * AI-generated color palette.
 * Contains all color values needed for a cohesive theme.
 */
export interface ColorPalette {
  /** Primary brand color (hex) */
  primary: string;
  /** Secondary color for accents (hex) */
  secondary: string;
  /** Accent color for highlights (hex) */
  accent: string;
  /** Main background color (hex) */
  background: string;
  /** Primary text color (hex) */
  foreground: string;
  /** Muted background for subtle areas (hex) */
  muted: string;
  /** Text color for muted backgrounds (hex) */
  mutedForeground: string;
  /** Border color (hex) */
  border: string;
  /** AI explanation of color choices */
  rationale: string;
}

// ============================================================================
// Stage 2: Typography Settings
// ============================================================================

/**
 * Font family configuration with weights.
 */
export interface FontConfig {
  /** Font family name (e.g., "Inter", "Poppins") */
  family: string;
  /** Available font weights (e.g., [400, 500, 600, 700]) */
  weights: number[];
}

/**
 * Font size scale for headings and body text.
 */
export interface FontScale {
  /** H1 size (e.g., "3rem") */
  h1: string;
  /** H2 size (e.g., "2.25rem") */
  h2: string;
  /** H3 size (e.g., "1.875rem") */
  h3: string;
  /** H4 size (e.g., "1.5rem") */
  h4: string;
  /** Body text size (e.g., "1rem") */
  body: string;
  /** Small text size (e.g., "0.875rem") */
  small: string;
}

/**
 * Line height options for different contexts.
 */
export interface LineHeights {
  /** Tight line height for headings (e.g., "1.25") */
  tight: string;
  /** Normal line height for body (e.g., "1.5") */
  normal: string;
  /** Relaxed line height for readability (e.g., "1.75") */
  relaxed: string;
}

/**
 * AI-generated typography settings.
 * Defines fonts, sizes, and spacing for text elements.
 */
export interface TypographySettings {
  /** Heading font configuration */
  headingFont: FontConfig;
  /** Body text font configuration */
  bodyFont: FontConfig;
  /** Font size scale */
  scale: FontScale;
  /** Line height options */
  lineHeights: LineHeights;
  /** AI explanation of typography choices */
  rationale: string;
}

// ============================================================================
// Stage 3: Component Styles
// ============================================================================

/**
 * Button variant styling (for different button types).
 */
export interface ButtonVariant {
  /** Background color or CSS value */
  bg: string;
  /** Text color */
  text: string;
  /** Optional border color */
  border?: string;
}

/**
 * Button component styles.
 */
export interface ButtonStyles {
  /** Border radius (e.g., "0.5rem") */
  borderRadius: string;
  /** Horizontal padding (e.g., "1rem") */
  paddingX: string;
  /** Vertical padding (e.g., "0.5rem") */
  paddingY: string;
  /** Style variants (default, secondary, outline, ghost, etc.) */
  variants: Record<string, ButtonVariant>;
}

/**
 * Card component styles.
 */
export interface CardStyles {
  /** Border radius (e.g., "0.75rem") */
  borderRadius: string;
  /** Internal padding (e.g., "1.5rem") */
  padding: string;
  /** Box shadow (e.g., "0 1px 3px rgba(0,0,0,0.1)") */
  shadow: string;
  /** Border color or CSS value */
  border: string;
}

/**
 * Input/form field styles.
 */
export interface InputStyles {
  /** Border radius (e.g., "0.375rem") */
  borderRadius: string;
  /** Border color */
  borderColor: string;
  /** Focus ring color */
  focusRing: string;
  /** Internal padding (e.g., "0.75rem") */
  padding: string;
}

/**
 * Badge component styles.
 */
export interface BadgeStyles {
  /** Border radius (e.g., "9999px" for pill shape) */
  borderRadius: string;
  /** Internal padding (e.g., "0.25rem 0.5rem") */
  padding: string;
}

/**
 * AI-generated component styles.
 * Defines styling for shadcn/ui components.
 */
export interface ComponentStyles {
  /** Button styles */
  button: ButtonStyles;
  /** Card styles */
  card: CardStyles;
  /** Input/form field styles */
  input: InputStyles;
  /** Badge styles */
  badge: BadgeStyles;
  /** AI explanation of component style choices */
  rationale: string;
}

// ============================================================================
// Final Theme Data
// ============================================================================

/**
 * Complete theme data structure.
 * Contains all generated styles plus output formats.
 */
export interface ThemeData {
  /** Color palette (light mode) */
  colors: ColorPalette;
  /** Dark mode color palette (optional for backwards compatibility) */
  darkColors?: ColorPalette;
  /** Typography settings */
  typography: TypographySettings;
  /** Component styles */
  components: ComponentStyles;
  /** Tailwind config extends object (for tailwind.config.ts) */
  tailwindExtends: Record<string, unknown>;
  /** CSS custom properties string (for globals.css) */
  cssVariables: string;
  /** ISO timestamp of generation */
  generatedAt: string;
  /** AI provider used (e.g., "openai") */
  aiProvider: string;
  /** AI model used (e.g., "gpt-4o") */
  aiModel: string;
}

// ============================================================================
// AI Provider Configuration
// ============================================================================

/**
 * Supported AI providers for theme generation.
 */
export const AI_PROVIDERS = ["openai", "anthropic", "google"] as const;
export type AIProvider = (typeof AI_PROVIDERS)[number];

/**
 * AI provider and model configuration for a generation job.
 */
export interface AIProviderConfig {
  /** AI provider name */
  provider: AIProvider;
  /** Model identifier (e.g., "gpt-4o", "claude-3-opus", "gemini-pro") */
  model: string;
}
