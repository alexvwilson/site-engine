import type { Section } from "@/lib/drizzle/schema/sections";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import { getTypedContent, type SocialLink, type SocialIconStyle, type ImageFit } from "@/lib/section-types";

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
import { ContactBlockPublished } from "./blocks/ContactBlockPublished";
import { FooterBlock } from "./blocks/FooterBlock";
import { EmbedBlock } from "./blocks/EmbedBlock";
import { BlogFeaturedBlock } from "./blocks/BlogFeaturedBlock";
import { BlogGridBlock } from "./blocks/BlogGridBlock";
import { SocialLinksBlock } from "./blocks/SocialLinksBlock";
import { ProductGridBlock } from "./blocks/ProductGridBlock";
import { CardsBlock } from "./blocks/CardsBlock";
import { MediaBlock } from "./blocks/MediaBlock";
import { BlogBlock } from "./blocks/BlogBlock";
import { AccordionBlock } from "./blocks/AccordionBlock";
import PricingBlock from "./blocks/PricingBlock";
import { ShowcaseBlock } from "./blocks/ShowcaseBlock";

interface BlockRendererProps {
  section: Section;
  theme: ThemeData;
  siteId?: string;
  basePath?: string;
  pageId?: string;
  socialLinks?: SocialLink[];
  socialIconStyle?: SocialIconStyle;
  imageFit?: ImageFit;
}

export async function BlockRenderer({
  section,
  theme,
  siteId,
  basePath = "",
  pageId,
  socialLinks = [],
  socialIconStyle = "brand",
  imageFit = "cover",
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
          socialLinks={socialLinks}
          socialIconStyle={socialIconStyle}
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
    case "hero_primitive":
      return (
        <HeroPrimitiveBlock
          content={getTypedContent("hero_primitive", content)}
          theme={theme}
          basePath={basePath}
        />
      );
    case "richtext":
      return (
        <RichTextBlock
          content={getTypedContent("richtext", content)}
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
          basePath={basePath}
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
          socialLinks={socialLinks}
          socialIconStyle={socialIconStyle}
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
          siteImageFit={imageFit}
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
          pageId={pageId}
          imageFit={imageFit}
        />
      );
    case "social_links":
      return (
        <SocialLinksBlock
          content={getTypedContent("social_links", content)}
          theme={theme}
          socialLinks={socialLinks}
          siteIconStyle={socialIconStyle}
        />
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
          basePath={basePath}
        />
      );
    case "media":
      return (
        <MediaBlock
          content={getTypedContent("media", content)}
          theme={theme}
        />
      );
    case "blog":
      if (!siteId) {
        return (
          <div className="p-8 text-center text-muted-foreground">
            Blog block requires site context
          </div>
        );
      }
      return (
        <BlogBlock
          content={getTypedContent("blog", content)}
          theme={theme}
          siteId={siteId}
          basePath={basePath}
          pageId={pageId}
          siteImageFit={imageFit}
        />
      );
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
          basePath={basePath}
        />
      );
    case "showcase":
      return (
        <ShowcaseBlock content={getTypedContent("showcase", content)} />
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
