/**
 * Theme Prompts
 *
 * AI prompt templates for each stage of theme generation.
 * Designed to produce consistent, parseable JSON responses.
 */

import type { ThemeRequirements, ColorPalette, TypographySettings } from "@/lib/drizzle/schema/theme-types";
import { HEADING_FONTS, BODY_FONTS } from "./font-list";

// ============================================================================
// System Prompts
// ============================================================================

const BASE_SYSTEM_PROMPT = `You are an expert UI/UX designer specializing in web design systems, color theory, and typography. You create beautiful, accessible, and cohesive themes for modern web applications.

Your responses must be valid JSON matching the exact structure specified. Be precise with hex color codes and CSS values.

Key principles:
- Ensure sufficient color contrast for accessibility (WCAG AA minimum)
- Create cohesive, professional designs that work across all components
- Consider the brand identity and target audience
- Provide clear rationale for design decisions`;

const COLOR_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

You are generating a color palette for a website. The palette should include:
- Primary: Main brand color, used for CTAs and key elements
- Secondary: Supporting color, often darker/neutral
- Accent: Highlight color for special elements
- Background: Main page background
- Foreground: Primary text color
- Muted: Subtle background for sections
- MutedForeground: Text on muted backgrounds
- Border: Default border color

Ensure all colors work well together and provide good contrast for readability.`;

const TYPOGRAPHY_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

You are generating typography settings for a website. Choose fonts that:
- Match the brand personality and industry
- Are highly readable at all sizes
- Work well together (heading + body pairing)
- Are from the Google Fonts library

Available heading fonts: ${HEADING_FONTS.slice(0, 20).join(", ")}
Available body fonts: ${BODY_FONTS.slice(0, 20).join(", ")}

Provide a consistent type scale using rem units.`;

const COMPONENTS_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

You are generating component styles for a shadcn/ui based design system. Define:
- Button: Border radius, padding, color variants
- Card: Border radius, padding, shadow, border
- Input: Border radius, border color, focus ring, padding
- Badge: Border radius, padding

Use CSS values (rem, px) and ensure consistency across components.`;

const QUICK_GENERATE_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

You are generating a complete theme including colors, typography, and component styles in a single response.

Available heading fonts: ${HEADING_FONTS.slice(0, 15).join(", ")}
Available body fonts: ${BODY_FONTS.slice(0, 15).join(", ")}

Create a cohesive design system that works as a unified whole.`;

// ============================================================================
// User Prompt Builders
// ============================================================================

/**
 * Format requirements into a readable prompt section
 */
function formatRequirements(requirements: ThemeRequirements): string {
  const parts: string[] = [];

  parts.push(`Brand/Site Name: ${requirements.brandName}`);
  parts.push(`Industry: ${requirements.industry}`);
  parts.push(`Style: ${requirements.styleKeywords.join(", ")}`);

  if (requirements.targetAudience) {
    parts.push(`Target Audience: ${requirements.targetAudience}`);
  }

  if (requirements.colorPreferences?.preferredColors?.length) {
    parts.push(`Preferred Colors: ${requirements.colorPreferences.preferredColors.join(", ")}`);
  }

  if (requirements.colorPreferences?.avoidColors?.length) {
    parts.push(`Colors to Avoid: ${requirements.colorPreferences.avoidColors.join(", ")}`);
  }

  if (requirements.additionalNotes) {
    parts.push(`Additional Notes: ${requirements.additionalNotes}`);
  }

  return parts.join("\n");
}

/**
 * Build prompt for color palette generation (Stage 1)
 */
export function buildColorPalettePrompt(requirements: ThemeRequirements): {
  system: string;
  user: string;
} {
  const user = `Generate a color palette for the following website:

${formatRequirements(requirements)}

Respond with JSON in this exact format:
{
  "primary": "#HEXCODE",
  "secondary": "#HEXCODE",
  "accent": "#HEXCODE",
  "background": "#HEXCODE",
  "foreground": "#HEXCODE",
  "muted": "#HEXCODE",
  "mutedForeground": "#HEXCODE",
  "border": "#HEXCODE",
  "rationale": "Explanation of why these colors work for this brand..."
}`;

  return { system: COLOR_SYSTEM_PROMPT, user };
}

/**
 * Build prompt for typography generation (Stage 2)
 */
export function buildTypographyPrompt(
  requirements: ThemeRequirements,
  colors: ColorPalette
): { system: string; user: string } {
  const user = `Generate typography settings for the following website:

${formatRequirements(requirements)}

The color palette is:
- Primary: ${colors.primary}
- Secondary: ${colors.secondary}
- Background: ${colors.background}
- Foreground: ${colors.foreground}

Choose fonts that complement these colors and match the brand style.

Respond with JSON in this exact format:
{
  "headingFont": {
    "family": "Font Name",
    "weights": [500, 600, 700]
  },
  "bodyFont": {
    "family": "Font Name",
    "weights": [400, 500, 600]
  },
  "scale": {
    "h1": "3rem",
    "h2": "2.25rem",
    "h3": "1.875rem",
    "h4": "1.5rem",
    "body": "1rem",
    "small": "0.875rem"
  },
  "lineHeights": {
    "tight": "1.25",
    "normal": "1.5",
    "relaxed": "1.75"
  },
  "rationale": "Explanation of font choices and why they work for this brand..."
}`;

  return { system: TYPOGRAPHY_SYSTEM_PROMPT, user };
}

/**
 * Build prompt for component styles generation (Stage 3)
 */
export function buildComponentStylesPrompt(
  requirements: ThemeRequirements,
  colors: ColorPalette,
  typography: TypographySettings
): { system: string; user: string } {
  const user = `Generate component styles for the following website:

${formatRequirements(requirements)}

The design system uses:
- Primary Color: ${colors.primary}
- Secondary Color: ${colors.secondary}
- Accent Color: ${colors.accent}
- Border Color: ${colors.border}
- Heading Font: ${typography.headingFont.family}
- Body Font: ${typography.bodyFont.family}

Create component styles that work cohesively with these colors and fonts.

Respond with JSON in this exact format:
{
  "button": {
    "borderRadius": "0.5rem",
    "paddingX": "1rem",
    "paddingY": "0.5rem",
    "variants": {
      "default": { "bg": "${colors.primary}", "text": "#FFFFFF" },
      "secondary": { "bg": "${colors.secondary}", "text": "#FFFFFF" },
      "outline": { "bg": "transparent", "text": "${colors.primary}", "border": "${colors.primary}" },
      "ghost": { "bg": "transparent", "text": "${colors.foreground}" }
    }
  },
  "card": {
    "borderRadius": "0.75rem",
    "padding": "1.5rem",
    "shadow": "0 1px 3px rgba(0,0,0,0.1)",
    "border": "1px solid ${colors.border}"
  },
  "input": {
    "borderRadius": "0.375rem",
    "borderColor": "${colors.border}",
    "focusRing": "${colors.primary}",
    "padding": "0.75rem"
  },
  "badge": {
    "borderRadius": "9999px",
    "padding": "0.25rem 0.75rem"
  },
  "rationale": "Explanation of component style choices..."
}`;

  return { system: COMPONENTS_SYSTEM_PROMPT, user };
}

/**
 * Build prompt for quick generate (complete theme in one call)
 */
export function buildQuickGeneratePrompt(requirements: ThemeRequirements): {
  system: string;
  user: string;
} {
  const user = `Generate a complete theme for the following website:

${formatRequirements(requirements)}

Create a cohesive design system including colors, typography, and component styles.

Respond with JSON in this exact format:
{
  "colors": {
    "primary": "#HEXCODE",
    "secondary": "#HEXCODE",
    "accent": "#HEXCODE",
    "background": "#HEXCODE",
    "foreground": "#HEXCODE",
    "muted": "#HEXCODE",
    "mutedForeground": "#HEXCODE",
    "border": "#HEXCODE",
    "rationale": "Color palette explanation..."
  },
  "typography": {
    "headingFont": {
      "family": "Font Name",
      "weights": [500, 600, 700]
    },
    "bodyFont": {
      "family": "Font Name",
      "weights": [400, 500, 600]
    },
    "scale": {
      "h1": "3rem",
      "h2": "2.25rem",
      "h3": "1.875rem",
      "h4": "1.5rem",
      "body": "1rem",
      "small": "0.875rem"
    },
    "lineHeights": {
      "tight": "1.25",
      "normal": "1.5",
      "relaxed": "1.75"
    },
    "rationale": "Typography explanation..."
  },
  "components": {
    "button": {
      "borderRadius": "0.5rem",
      "paddingX": "1rem",
      "paddingY": "0.5rem",
      "variants": {
        "default": { "bg": "#PRIMARY", "text": "#FFFFFF" },
        "secondary": { "bg": "#SECONDARY", "text": "#FFFFFF" },
        "outline": { "bg": "transparent", "text": "#PRIMARY", "border": "#PRIMARY" },
        "ghost": { "bg": "transparent", "text": "#FOREGROUND" }
      }
    },
    "card": {
      "borderRadius": "0.75rem",
      "padding": "1.5rem",
      "shadow": "0 1px 3px rgba(0,0,0,0.1)",
      "border": "1px solid #BORDER"
    },
    "input": {
      "borderRadius": "0.375rem",
      "borderColor": "#BORDER",
      "focusRing": "#PRIMARY",
      "padding": "0.75rem"
    },
    "badge": {
      "borderRadius": "9999px",
      "padding": "0.25rem 0.75rem"
    },
    "rationale": "Component styles explanation..."
  }
}

Replace #PRIMARY, #SECONDARY, #BORDER, #FOREGROUND with actual hex color codes you generate.`;

  return { system: QUICK_GENERATE_SYSTEM_PROMPT, user };
}

// ============================================================================
// Prompt Utilities
// ============================================================================

/**
 * Truncate additional notes to prevent overly long prompts
 */
export function truncateNotes(notes: string | undefined, maxLength: number = 500): string | undefined {
  if (!notes) return undefined;
  if (notes.length <= maxLength) return notes;
  return notes.substring(0, maxLength) + "...";
}

/**
 * Sanitize user input for use in prompts (prevent injection)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML
    .replace(/```/g, "") // Remove code blocks
    .trim();
}

/**
 * Prepare requirements for prompt use (sanitize and truncate)
 */
export function prepareRequirements(requirements: ThemeRequirements): ThemeRequirements {
  return {
    ...requirements,
    brandName: sanitizeInput(requirements.brandName),
    industry: sanitizeInput(requirements.industry),
    styleKeywords: requirements.styleKeywords.map(sanitizeInput),
    targetAudience: requirements.targetAudience
      ? sanitizeInput(requirements.targetAudience)
      : undefined,
    additionalNotes: truncateNotes(
      requirements.additionalNotes
        ? sanitizeInput(requirements.additionalNotes)
        : undefined
    ),
  };
}
