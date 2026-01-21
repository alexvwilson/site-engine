import type { BlockType } from "@/lib/drizzle/schema/sections";
import type { SectionContent } from "@/lib/section-types";

export interface PrimitiveInfo {
  primitive: string;
  preset: string | null;
}

/**
 * Maps old block_type values to normalized primitive/preset format.
 * Used for backfill migration and new section creation.
 */
const BLOCK_TYPE_TO_PRIMITIVE: Record<string, PrimitiveInfo> = {
  // RichText primitive (text/markdown/article → richtext)
  text: { primitive: "richtext", preset: "visual" },
  markdown: { primitive: "richtext", preset: "markdown" },
  article: { primitive: "richtext", preset: "article" },

  // Hero primitive (hero/cta/heading → hero_primitive)
  hero: { primitive: "hero_primitive", preset: "full" },
  cta: { primitive: "hero_primitive", preset: "cta" },
  heading: { primitive: "hero_primitive", preset: "title-only" },

  // Cards primitive (features/testimonials/product_grid → cards)
  features: { primitive: "cards", preset: "feature" },
  testimonials: { primitive: "cards", preset: "testimonial" },
  product_grid: { primitive: "cards", preset: "product" },

  // Media primitive (image/gallery/embed → media)
  image: { primitive: "media", preset: "single" },
  gallery: { primitive: "media", preset: "gallery" },
  embed: { primitive: "media", preset: "embed" },

  // Blog primitive (blog_featured/blog_grid → blog)
  blog_featured: { primitive: "blog", preset: "featured" },
  blog_grid: { primitive: "blog", preset: "grid" },

  // Standalone blocks (no preset needed)
  header: { primitive: "header", preset: null },
  footer: { primitive: "footer", preset: null },
  contact: { primitive: "contact", preset: null },
  social_links: { primitive: "social_links", preset: null },
};

/**
 * Computes normalized primitive and preset from block_type and content.
 * Handles both old block types (direct mapping) and new primitive types
 * (extracts preset from content JSON).
 */
export function computePrimitiveAndPreset(
  blockType: BlockType,
  content: SectionContent
): PrimitiveInfo {
  // Check if it's an old block type with direct mapping
  if (blockType in BLOCK_TYPE_TO_PRIMITIVE) {
    return BLOCK_TYPE_TO_PRIMITIVE[blockType];
  }

  // New primitive types - extract preset from content
  switch (blockType) {
    case "richtext":
      return {
        primitive: "richtext",
        preset: (content as { mode?: string }).mode ?? "visual",
      };
    case "hero_primitive":
      return {
        primitive: "hero_primitive",
        preset: (content as { layout?: string }).layout ?? "full",
      };
    case "cards":
      return {
        primitive: "cards",
        preset: (content as { template?: string }).template ?? "feature",
      };
    case "media":
      return {
        primitive: "media",
        preset: (content as { mode?: string }).mode ?? "single",
      };
    case "blog":
      return {
        primitive: "blog",
        preset: (content as { mode?: string }).mode ?? "featured",
      };
    default:
      // Fallback for any unexpected block type
      return { primitive: blockType, preset: null };
  }
}
