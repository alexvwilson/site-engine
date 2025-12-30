/**
 * Logo Prompt Generation Utilities
 *
 * Prompt engineering for AI-powered logo concept generation.
 * Based on SnapAI methodology for ChatGPT image prompts.
 *
 * Reference: .claude/commands/04_chatgpt_logo_generation.md
 */

import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

export interface LogoPromptContext {
  siteName: string;
  siteDescription?: string | null;
  brandPersonality?: string | null;
  primaryColor?: string | null;
}

// ============================================================================
// Zod Schema for AI Response
// ============================================================================

export const logoConceptSchema = z.object({
  id: z.number(),
  category: z.enum(["decomposed", "monogram", "snapai"]),
  prompt: z.string(),
  description: z.string(),
  recommendation: z.enum(["top", "alternative", "safe"]).optional(),
});

export const logoConceptsSchema = z.object({
  appContext: z.string().describe("Brief summary of app name, function, personality, and colors"),
  concepts: z.array(logoConceptSchema).length(10),
});

export type LogoConceptsResponse = z.infer<typeof logoConceptsSchema>;

// ============================================================================
// Brand Personality Mapping
// ============================================================================

const PERSONALITY_DESCRIPTIONS: Record<string, string> = {
  professional: "Clean geometry, professional gradients, structured layouts, corporate feel",
  consumer: "Soft gradients, organic shapes, approachable colors, friendly and inviting",
  tech: "Sparkles, nodes, connections, modern effects, AI/technology vibes",
  creative: "Abstract shapes, artistic elements, unique compositions, expressive design",
};

// ============================================================================
// Prompt Builder
// ============================================================================

export function buildLogoPrompt(context: LogoPromptContext): {
  system: string;
  user: string;
} {
  const personality = context.brandPersonality || "professional";
  const personalityDesc = PERSONALITY_DESCRIPTIONS[personality] || PERSONALITY_DESCRIPTIONS.professional;
  const color = context.primaryColor || "blue";
  const description = context.siteDescription || "A modern web application";

  const system = `You are an expert logo designer and prompt engineer specializing in creating ChatGPT-ready logo prompts.

Your task is to generate 10 unique logo concept prompts for an app, following the proven SnapAI methodology.

## Methodology

### Category 1: Decomposed (4 prompts)
Focus on functional visual metaphors that represent the core action/purpose of the app.
- Ask yourself: "What is the core action this app performs?"
- Use concrete, drawable objects (documents, shapes, symbols, tools)
- Create visual metaphors that make immediate sense

### Category 2: Monogram (3 prompts)
Focus on letter-based designs inspired by major brands (Airbnb, Facebook, DoorDash).
- Create visually unique treatments of the first letter
- Ensure readability at small sizes
- Match the personality (playful, professional, geometric, organic)

### Category 3: SnapAI Pattern (3 prompts)
Follow proven successful patterns with specific visual elements:
- "speech bubble composed of three overlapping, semi-transparent rounded rectangles"
- "stylized camera lens with concentric circles in warm sunset colors"
- "color-wheel flower made of evenly spaced, semi-transparent petals"

## Critical Requirements

DO:
- Use concrete visual elements that are drawable (pages, sparkles, geometric shapes)
- Include the primary color in prompts with descriptive terms
- Make each prompt completely unique from the others
- Match the brand personality throughout
- Think about app store appeal and scalability

DON'T:
- Use abstract business concepts (intelligence platform, productivity solutions)
- Over-describe with technical jargon
- Create similar prompts within categories

## Recommendations

You must provide exactly 3 recommendations:
1. **Top Choice** - Best overall considering visual appeal, brand fit, and memorability
2. **Alternative** - Strong second option with different aesthetic approach
3. **Safe Choice** - Reliable, proven pattern with broad appeal

## Required JSON Response Format

You MUST respond with a JSON object matching this exact structure:

\`\`\`json
{
  "appContext": "Brief 1-2 sentence summary of the app name, core function, personality, and primary color",
  "concepts": [
    {
      "id": 1,
      "category": "decomposed",
      "prompt": "The complete ChatGPT image generation prompt",
      "description": "Brief description of what this logo concept represents",
      "recommendation": "top"
    },
    ... (10 total concepts)
  ]
}
\`\`\`

Field requirements:
- "appContext": String summarizing the app context
- "concepts": Array of exactly 10 objects
- Each concept must have: "id" (1-10), "category" ("decomposed" | "monogram" | "snapai"), "prompt" (string), "description" (string)
- Exactly 3 concepts should have "recommendation": one with "top", one with "alternative", one with "safe"
- Other concepts should NOT have the recommendation field`;

  const user = `Generate 10 logo concept prompts for this app:

**App Name:** ${context.siteName}
**Core Function:** ${description}
**Brand Personality:** ${personality} (${personalityDesc})
**Primary Color:** ${color}

Generate exactly:
- 4 Decomposed concepts (functional visual metaphors)
- 3 Monogram concepts (letter-based designs)
- 3 SnapAI Pattern concepts (proven aesthetic patterns)

Mark exactly 3 concepts with recommendations: one "top", one "alternative", one "safe".

Each prompt should be a complete, ready-to-use ChatGPT image generation prompt that includes:
- Specific visual elements
- Color references (using "${color}" and complementary colors)
- Style descriptors (minimalist, gradient, clean, etc.)
- Composition guidance`;

  return { system, user };
}

// ============================================================================
// ChatGPT Prompt Wrapper
// ============================================================================

/**
 * Wraps a logo concept prompt in SnapAI's optimized format for ChatGPT.
 */
export function wrapForChatGPT(conceptPrompt: string): string {
  return `Create a full-bleed 1024x1024 px app icon: ${conceptPrompt}. Use crisp, minimal design with vibrant colors. Add a subtle inner bevel for gentle depth; no hard shadows or outlines. Center the design with comfortable breathing room from the edges. Solid, light-neutral background. IMPORTANT: Fill the entire canvas edge-to-edge with the design, no padding, no margins. Design elements should be centered with appropriate spacing from edges but the background must cover 100% of the canvas. Clean, minimal, Apple-style design. No borders, frames, or rounded corners.`;
}

/**
 * Generates the complete usage instructions for the logo generator output.
 */
export function getLogoUsageInstructions(): string {
  return `## How to Use Your Logo Prompt

### Step 1: Generate in ChatGPT
1. Copy the prompt above
2. Paste it into ChatGPT (requires ChatGPT Plus for image generation)
3. ChatGPT will generate your app icon
4. Download the generated image

### Step 2: Want to Tweak?
Ask ChatGPT to modify:
- "Update the logo with a blue color theme"
- "Make the design more minimal"
- "Add more contrast between elements"

### Step 3: Get Transparent Version
After you're happy with the design, ask ChatGPT:
"Remove the background (make it transparent) and crop tightly to remove any padding, margins, or whitespace around the logo."

### Step 4: Set Up Favicon
1. Go to realfavicongenerator.net/favicon-generator/nextjs
2. Upload your logo
3. Download the favicon files
4. Place favicon.ico and apple-icon.png in your app/ folder

### Step 5: Upload to Site Engine
Use the "Upload Logo" button to add your finished logo to your site's header.`;
}
