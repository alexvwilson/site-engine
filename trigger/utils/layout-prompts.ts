/**
 * Layout Suggestion Prompt Templates
 *
 * Builds prompts for AI layout generation.
 * Provides context about available block types and expected output format.
 */

import { BLOCK_TYPE_INFO } from "@/lib/section-types";

// ============================================================================
// Types
// ============================================================================

export interface LayoutPromptResult {
  system: string;
  user: string;
}

// ============================================================================
// Content Templates
// ============================================================================

/**
 * Example content structures for each block type.
 * AI uses these to generate appropriate content for suggestions.
 */
const BLOCK_CONTENT_EXAMPLES = {
  hero: `{
  "heading": "Your main headline here",
  "subheading": "Supporting text that elaborates on the headline",
  "ctaText": "Get Started",
  "ctaUrl": "#"
}`,
  text: `{
  "body": "Your paragraph content here. Can include multiple paragraphs."
}`,
  image: `{
  "src": "https://placehold.co/800x400",
  "alt": "Descriptive alt text",
  "caption": "Optional caption text"
}`,
  gallery: `{
  "images": [
    { "src": "https://placehold.co/400x300", "alt": "Image 1", "caption": "Caption 1" },
    { "src": "https://placehold.co/400x300", "alt": "Image 2", "caption": "Caption 2" }
  ]
}`,
  features: `{
  "features": [
    { "icon": "star", "title": "Feature Title", "description": "Feature description text" },
    { "icon": "shield", "title": "Another Feature", "description": "Another description" }
  ]
}`,
  cta: `{
  "heading": "Call to Action Heading",
  "description": "Persuasive text encouraging action",
  "buttonText": "Take Action",
  "buttonUrl": "#"
}`,
  testimonials: `{
  "testimonials": [
    { "quote": "Customer quote here", "author": "Customer Name", "role": "Job Title, Company" },
    { "quote": "Another testimonial", "author": "Another Customer", "role": "Their Role" }
  ]
}`,
  contact: `{
  "heading": "Contact Us",
  "description": "We'd love to hear from you",
  "fields": [
    { "type": "text", "label": "Name", "required": true },
    { "type": "email", "label": "Email", "required": true },
    { "type": "textarea", "label": "Message", "required": true }
  ]
}`,
  footer: `{
  "copyright": "© 2024 Company Name. All rights reserved.",
  "links": [
    { "label": "Privacy", "url": "/privacy" },
    { "label": "Terms", "url": "/terms" }
  ]
}`,
} as const;

/**
 * Available Lucide icon names for features section.
 */
const AVAILABLE_ICONS = [
  "star",
  "heart",
  "shield",
  "zap",
  "award",
  "check-circle",
  "clock",
  "globe",
  "lock",
  "mail",
  "phone",
  "rocket",
  "sparkles",
  "target",
  "thumbs-up",
  "trending-up",
  "users",
  "gift",
  "leaf",
  "sun",
];

// ============================================================================
// Prompt Builder
// ============================================================================

/**
 * Build the system and user prompts for layout suggestion.
 */
export function buildLayoutSuggestionPrompt(
  description: string
): LayoutPromptResult {
  const blockTypesDescription = BLOCK_TYPE_INFO.map(
    (b) => `- **${b.type}**: ${b.description}`
  ).join("\n");

  const contentExamples = Object.entries(BLOCK_CONTENT_EXAMPLES)
    .map(([type, example]) => `**${type}**:\n\`\`\`json\n${example}\n\`\`\``)
    .join("\n\n");

  const system = `You are an expert web designer helping users build website pages. Your task is to suggest a logical sequence of page sections based on a user's description.

## Available Section Types
${blockTypesDescription}

## Content Structure Examples
${contentExamples}

## Available Icons (for features section)
${AVAILABLE_ICONS.join(", ")}

## Guidelines
1. Suggest 3-8 sections that make sense for the page purpose
2. Order sections logically:
   - Hero sections typically come first
   - Content sections (text, features, testimonials) in the middle
   - CTA sections near the end for conversion
   - Footer sections always last (if included)
3. Provide a brief rationale explaining why each section fits
4. Generate ACTUAL content tailored to the page description - don't use generic placeholders
5. For features, use 2-4 features with appropriate icons from the available list
6. For testimonials, create 2-3 realistic testimonials
7. Make the content specific and relevant to the described page purpose

## Response Format
Respond with a valid JSON object matching this exact schema:
{
  "suggestions": [
    {
      "blockType": "hero" | "text" | "image" | "gallery" | "features" | "cta" | "testimonials" | "contact" | "footer",
      "rationale": "Brief explanation why this section fits the page",
      "suggestedContent": { /* content matching the block type structure */ }
    }
  ],
  "overallRationale": "Brief explanation of the overall page structure and flow"
}`;

  const user = `Please suggest page sections for the following page:

"${description}"

Generate appropriate sections with content specifically tailored to this description. Create realistic, relevant content - not generic placeholders.`;

  return { system, user };
}
