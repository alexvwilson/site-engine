"use client";

import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import {
  getTypedContent,
  type BlogFeaturedContent,
  type BlogFeaturedLayout,
  type BlogContent,
  type BlogMode,
  type BlogGridLayout,
} from "@/lib/section-types";
import { SectionHighlight } from "@/components/preview/SectionHighlight";

import { HeaderBlock } from "./blocks/HeaderBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { HeroBlock } from "./blocks/HeroBlock";
import { HeroPrimitiveBlock } from "./blocks/HeroPrimitiveBlock";
import { RichTextBlock } from "./blocks/RichTextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { CTABlock } from "./blocks/CTABlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { ContactBlock } from "./blocks/ContactBlock";
import { FooterBlock } from "./blocks/FooterBlock";
import { EmbedBlock } from "./blocks/EmbedBlock";
import { ProductGridBlock } from "./blocks/ProductGridBlock";
import { CardsBlock } from "./blocks/CardsBlock";
import { MediaBlock } from "./blocks/MediaBlock";
import { AccordionBlock } from "./blocks/AccordionBlock";
import PricingBlock from "./blocks/PricingBlock";
import { ShowcaseBlock } from "./blocks/ShowcaseBlock";
import { CalendarBlock } from "./blocks/CalendarBlock";

interface PreviewBlockRendererProps {
  section: Section;
  theme: ThemeData;
}

/**
 * Preview-safe block renderer that doesn't import server-side blog components.
 * Blog blocks show placeholders in preview mode.
 * Wraps all blocks with SectionHighlight for editor selection/highlighting.
 */
export function PreviewBlockRenderer({
  section,
  theme,
}: PreviewBlockRendererProps): React.ReactElement {
  const { block_type, content } = section;

  const renderBlock = (): React.ReactNode => {
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
      case "hero_primitive":
        return (
          <HeroPrimitiveBlock
            content={getTypedContent("hero_primitive", content)}
            theme={theme}
          />
        );
      case "richtext":
        return (
          <RichTextBlock content={getTypedContent("richtext", content)} theme={theme} />
        );
      case "image":
        return (
          <ImageBlock
            content={getTypedContent("image", content)}
            theme={theme}
          />
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
      case "embed":
        return (
          <EmbedBlock
            content={getTypedContent("embed", content)}
            theme={theme}
          />
        );
      case "social_links":
        return (
          <div
            className="py-8 text-center border-2 border-dashed rounded-lg mx-4 my-4"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-muted)",
            }}
          >
            <div className="space-y-2">
              <div className="text-2xl">🔗</div>
              <p
                className="font-medium text-sm"
                style={{ color: "var(--color-foreground)" }}
              >
                Social Links
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Links from Site Settings display on published site
              </p>
            </div>
          </div>
        );
      case "product_grid":
        return (
          <ProductGridBlock
            content={getTypedContent("product_grid", content)}
            theme={theme}
          />
        );
      case "cards":
        return (
          <CardsBlock
            content={getTypedContent("cards", content)}
            theme={theme}
          />
        );
      case "media":
        return (
          <MediaBlock
            content={getTypedContent("media", content)}
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
      case "blog": {
        const blogContent = content as BlogContent;
        const mode: BlogMode = blogContent.mode ?? "featured";
        const modeLabels: Record<BlogMode, string> = {
          featured: "Featured Post",
          grid: "Post Grid",
        };
        const featuredLayoutLabels: Record<BlogFeaturedLayout, string> = {
          split: "Split",
          stacked: "Stacked",
          hero: "Hero",
          minimal: "Minimal",
        };
        const gridLayoutLabels: Record<BlogGridLayout, string> = {
          grid: "Grid",
          list: "List",
          magazine: "Magazine",
        };
        const layoutLabel =
          mode === "featured"
            ? featuredLayoutLabels[blogContent.featuredLayout ?? "split"]
            : gridLayoutLabels[blogContent.gridLayout ?? "grid"];

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
                {modeLabels[mode]}
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {layoutLabel} layout • Displays on published site
              </p>
            </div>
          </div>
        );
      }
      case "accordion":
        return (
          <AccordionBlock
            content={getTypedContent("accordion", content)}
            theme={theme}
          />
        );
      case "pricing":
        return (
          <PricingBlock
            content={getTypedContent("pricing", content)}
            theme={theme}
          />
        );
      case "showcase":
        return (
          <ShowcaseBlock content={getTypedContent("showcase", content)} />
        );
      case "calendar":
        return (
          <CalendarBlock content={getTypedContent("calendar", content)} />
        );
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            Unknown block type: {block_type}
          </div>
        );
    }
  };

  return (
    <SectionHighlight sectionId={section.id} blockType={block_type}>
      {renderBlock()}
    </SectionHighlight>
  );
}
