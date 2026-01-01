"use client";

import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import {
  getTypedContent,
  type BlogFeaturedContent,
  type BlogFeaturedLayout,
} from "@/lib/section-types";

import { HeaderBlock } from "./blocks/HeaderBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { HeroBlock } from "./blocks/HeroBlock";
import { TextBlock } from "./blocks/TextBlock";
import { MarkdownBlock } from "./blocks/MarkdownBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { CTABlock } from "./blocks/CTABlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { ContactBlock } from "./blocks/ContactBlock";
import { FooterBlock } from "./blocks/FooterBlock";

interface PreviewBlockRendererProps {
  section: Section;
  theme: ThemeData;
}

/**
 * Preview-safe block renderer that doesn't import server-side blog components.
 * Blog blocks show placeholders in preview mode.
 */
export function PreviewBlockRenderer({
  section,
  theme,
}: PreviewBlockRendererProps) {
  const { block_type, content } = section;

  switch (block_type) {
    case "header":
      return (
        <HeaderBlock
          content={getTypedContent("header", content)}
          theme={theme}
        />
      );
    case "heading":
      return (
        <HeadingBlock
          content={getTypedContent("heading", content)}
          theme={theme}
        />
      );
    case "hero":
      return (
        <HeroBlock content={getTypedContent("hero", content)} theme={theme} />
      );
    case "text":
      return (
        <TextBlock content={getTypedContent("text", content)} theme={theme} />
      );
    case "markdown":
      return (
        <MarkdownBlock
          content={getTypedContent("markdown", content)}
          theme={theme}
        />
      );
    case "image":
      return (
        <ImageBlock content={getTypedContent("image", content)} theme={theme} />
      );
    case "gallery":
      return (
        <GalleryBlock
          content={getTypedContent("gallery", content)}
          theme={theme}
        />
      );
    case "features":
      return (
        <FeaturesBlock
          content={getTypedContent("features", content)}
          theme={theme}
        />
      );
    case "cta":
      return (
        <CTABlock content={getTypedContent("cta", content)} theme={theme} />
      );
    case "testimonials":
      return (
        <TestimonialsBlock
          content={getTypedContent("testimonials", content)}
          theme={theme}
        />
      );
    case "contact":
      return (
        <ContactBlock
          content={getTypedContent("contact", content)}
          theme={theme}
        />
      );
    case "footer":
      return (
        <FooterBlock
          content={getTypedContent("footer", content)}
          theme={theme}
        />
      );
    case "blog_featured": {
      const blogContent = content as BlogFeaturedContent;
      const layout: BlogFeaturedLayout = blogContent.layout ?? "split";
      const layoutLabels: Record<BlogFeaturedLayout, string> = {
        split: "Split",
        stacked: "Stacked",
        hero: "Hero",
        minimal: "Minimal",
      };

      return (
        <div
          className="py-16 text-center border-2 border-dashed rounded-lg mx-4 my-8"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-muted)",
          }}
        >
          <div className="space-y-2">
            <div className="text-3xl">📰</div>
            <p
              className="font-medium"
              style={{ color: "var(--color-foreground)" }}
            >
              Featured Post
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {layoutLabels[layout]} layout • Displays on published site
            </p>
          </div>
        </div>
      );
    }
    case "blog_grid":
      return (
        <div
          className="py-16 text-center border-2 border-dashed rounded-lg mx-4 my-8"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-muted)",
          }}
        >
          <div className="space-y-2">
            <div className="text-3xl">📰</div>
            <p
              className="font-medium"
              style={{ color: "var(--color-foreground)" }}
            >
              Post Grid
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Blog posts will display on the published site
            </p>
          </div>
        </div>
      );
    default:
      return (
        <div className="p-8 text-center text-muted-foreground">
          Unknown block type: {block_type}
        </div>
      );
  }
}
