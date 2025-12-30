import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import { getTypedContent } from "@/lib/section-types";

import { HeaderBlock } from "./blocks/HeaderBlock";
import { HeroBlock } from "./blocks/HeroBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { CTABlock } from "./blocks/CTABlock";
import { TestimonialsBlock } from "./blocks/TestimonialsBlock";
import { ContactBlock } from "./blocks/ContactBlock";
import { ContactBlockPublished } from "./blocks/ContactBlockPublished";
import { FooterBlock } from "./blocks/FooterBlock";
import { BlogFeaturedBlock } from "./blocks/BlogFeaturedBlock";
import { BlogGridBlock } from "./blocks/BlogGridBlock";

interface BlockRendererProps {
  section: Section;
  theme: ThemeData;
  siteId?: string;
  siteSlug?: string;
  showBlogAuthor?: boolean;
}

export async function BlockRenderer({
  section,
  theme,
  siteId,
  siteSlug,
  showBlogAuthor = true,
}: BlockRendererProps) {
  const { block_type, content } = section;

  switch (block_type) {
    case "header":
      return (
        <HeaderBlock
          content={getTypedContent("header", content)}
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
        />
      );
    case "blog_featured":
      if (!siteSlug) {
        return (
          <div className="p-8 text-center text-muted-foreground">
            Blog featured block requires site context
          </div>
        );
      }
      return (
        <BlogFeaturedBlock
          content={getTypedContent("blog_featured", content)}
          theme={theme}
          siteSlug={siteSlug}
          showAuthor={showBlogAuthor}
        />
      );
    case "blog_grid":
      if (!siteId || !siteSlug) {
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
          siteSlug={siteSlug}
          showAuthor={showBlogAuthor}
        />
      );
    default:
      return (
        <div className="p-8 text-center text-muted-foreground">
          Unknown block type: {block_type}
        </div>
      );
  }
}
