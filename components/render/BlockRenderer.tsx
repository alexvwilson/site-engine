import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import { getTypedContent } from "@/lib/section-types";

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
import { ContactBlockPublished } from "./blocks/ContactBlockPublished";
import { FooterBlock } from "./blocks/FooterBlock";
import { EmbedBlock } from "./blocks/EmbedBlock";
import { BlogFeaturedBlock } from "./blocks/BlogFeaturedBlock";
import { BlogGridBlock } from "./blocks/BlogGridBlock";

interface BlockRendererProps {
  section: Section;
  theme: ThemeData;
  siteId?: string;
  basePath?: string;
  showBlogAuthor?: boolean;
  pageId?: string;
}

export async function BlockRenderer({
  section,
  theme,
  siteId,
  basePath = "",
  showBlogAuthor = true,
  pageId,
}: BlockRendererProps) {
  const { block_type, content, anchor_id } = section;

  const renderBlock = (): React.ReactNode => {
    switch (block_type) {
    case "header":
      return (
        <HeaderBlock
          content={getTypedContent("header", content)}
          theme={theme}
          basePath={basePath}
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
        <HeroBlock
          content={getTypedContent("hero", content)}
          theme={theme}
          basePath={basePath}
        />
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
        <CTABlock
          content={getTypedContent("cta", content)}
          theme={theme}
          basePath={basePath}
        />
      );
    case "testimonials":
      return (
        <TestimonialsBlock
          content={getTypedContent("testimonials", content)}
          theme={theme}
        />
      );
    case "contact":
      // Use functional form on published sites (siteId available), display-only in preview
      if (siteId) {
        return (
          <ContactBlockPublished
            content={getTypedContent("contact", content)}
            theme={theme}
            siteId={siteId}
          />
        );
      }
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
          basePath={basePath}
        />
      );
    case "embed":
      return (
        <EmbedBlock
          content={getTypedContent("embed", content)}
          theme={theme}
        />
      );
    case "blog_featured":
      return (
        <BlogFeaturedBlock
          content={getTypedContent("blog_featured", content)}
          theme={theme}
          basePath={basePath}
          showAuthor={showBlogAuthor}
        />
      );
    case "blog_grid":
      if (!siteId) {
        return (
          <div className="p-8 text-center text-muted-foreground">
            Blog grid block requires site context
          </div>
        );
      }
      return (
        <BlogGridBlock
          content={getTypedContent("blog_grid", content)}
          theme={theme}
          siteId={siteId}
          basePath={basePath}
          showAuthor={showBlogAuthor}
          pageId={pageId}
        />
      );
    default:
      return (
        <div className="p-8 text-center text-muted-foreground">
          Unknown block type: {block_type}
        </div>
      );
    }
  };

  const blockContent = renderBlock();

  if (anchor_id) {
    return (
      <div id={anchor_id} className="scroll-mt-16">
        {blockContent}
      </div>
    );
  }

  return blockContent;
}
