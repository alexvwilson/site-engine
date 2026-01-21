"use client";

import type { EditorMode } from "./EditorModeToggle";
import { HeaderEditor } from "../blocks/HeaderEditor";
import { HeadingEditor } from "../blocks/HeadingEditor";
import { HeroEditor } from "../blocks/HeroEditor";
import { HeroPrimitiveEditor } from "../blocks/HeroPrimitiveEditor";
import { RichTextEditor } from "../blocks/RichTextEditor";
import { ImageEditor } from "../blocks/ImageEditor";
import { GalleryEditor } from "../blocks/GalleryEditor";
import { FeaturesEditor } from "../blocks/FeaturesEditor";
import { CTAEditor } from "../blocks/CTAEditor";
import { TestimonialsEditor } from "../blocks/TestimonialsEditor";
import { ContactEditor } from "../blocks/ContactEditor";
import { FooterEditor } from "../blocks/FooterEditor";
import { EmbedEditor } from "../blocks/EmbedEditor";
import { SocialLinksEditor } from "../blocks/SocialLinksEditor";
import { ProductGridEditor } from "../blocks/ProductGridEditor";
import { CardsEditor } from "../blocks/CardsEditor";
import { MediaEditor } from "../blocks/MediaEditor";
import { BlogFeaturedEditor } from "../BlogFeaturedEditor";
import { BlogGridEditor } from "../BlogGridEditor";
import { BlogEditor } from "../blocks/BlogEditor";
import type { Section } from "@/lib/drizzle/schema/sections";
import type { SectionContent } from "@/lib/section-types";

interface ContentTabProps {
  section: Section;
  content: SectionContent;
  onChange: (content: SectionContent) => void;
  siteId: string;
  disabled?: boolean;
  editorMode: EditorMode;
}

export function ContentTab({
  section,
  content,
  onChange,
  siteId,
  disabled,
  editorMode,
}: ContentTabProps): React.ReactElement {
  const editorProps = {
    content,
    onChange,
    disabled,
    siteId,
    editorMode,
  };

  // Route to the appropriate block editor based on block_type
  // Note: Currently using full editors. In Phase 3, we'll extract content-only versions.
  switch (section.block_type) {
    case "header":
      return (
        <HeaderEditor
          {...editorProps}
          content={content as Parameters<typeof HeaderEditor>[0]["content"]}
          mode="page"
        />
      );
    case "heading":
      return (
        <HeadingEditor
          {...editorProps}
          content={content as Parameters<typeof HeadingEditor>[0]["content"]}
        />
      );
    case "hero":
      return (
        <HeroEditor
          {...editorProps}
          content={content as Parameters<typeof HeroEditor>[0]["content"]}
        />
      );
    case "hero_primitive":
      return (
        <HeroPrimitiveEditor
          {...editorProps}
          content={content as Parameters<typeof HeroPrimitiveEditor>[0]["content"]}
        />
      );
    case "richtext":
      return (
        <RichTextEditor
          {...editorProps}
          content={content as Parameters<typeof RichTextEditor>[0]["content"]}
        />
      );
    case "image":
      return (
        <ImageEditor
          {...editorProps}
          content={content as Parameters<typeof ImageEditor>[0]["content"]}
        />
      );
    case "gallery":
      return (
        <GalleryEditor
          {...editorProps}
          content={content as Parameters<typeof GalleryEditor>[0]["content"]}
        />
      );
    case "features":
      return (
        <FeaturesEditor
          {...editorProps}
          content={content as Parameters<typeof FeaturesEditor>[0]["content"]}
        />
      );
    case "cta":
      return (
        <CTAEditor
          {...editorProps}
          content={content as Parameters<typeof CTAEditor>[0]["content"]}
        />
      );
    case "testimonials":
      return (
        <TestimonialsEditor
          {...editorProps}
          content={content as Parameters<typeof TestimonialsEditor>[0]["content"]}
        />
      );
    case "contact":
      return (
        <ContactEditor
          {...editorProps}
          content={content as Parameters<typeof ContactEditor>[0]["content"]}
        />
      );
    case "footer":
      return (
        <FooterEditor
          {...editorProps}
          content={content as Parameters<typeof FooterEditor>[0]["content"]}
          mode="page"
        />
      );
    case "blog_featured":
      return (
        <BlogFeaturedEditor
          {...editorProps}
          content={content as Parameters<typeof BlogFeaturedEditor>[0]["content"]}
        />
      );
    case "blog_grid":
      return (
        <BlogGridEditor
          {...editorProps}
          content={content as Parameters<typeof BlogGridEditor>[0]["content"]}
          currentPageId={section.page_id}
        />
      );
    case "blog":
      return (
        <BlogEditor
          {...editorProps}
          content={content as Parameters<typeof BlogEditor>[0]["content"]}
          currentPageId={section.page_id}
        />
      );
    case "embed":
      return (
        <EmbedEditor
          {...editorProps}
          content={content as Parameters<typeof EmbedEditor>[0]["content"]}
        />
      );
    case "social_links":
      return (
        <SocialLinksEditor
          {...editorProps}
          content={content as Parameters<typeof SocialLinksEditor>[0]["content"]}
        />
      );
    case "product_grid":
      return (
        <ProductGridEditor
          {...editorProps}
          content={content as Parameters<typeof ProductGridEditor>[0]["content"]}
        />
      );
    case "cards":
      return (
        <CardsEditor
          {...editorProps}
          content={content as Parameters<typeof CardsEditor>[0]["content"]}
        />
      );
    case "media":
      return (
        <MediaEditor
          {...editorProps}
          content={content as Parameters<typeof MediaEditor>[0]["content"]}
        />
      );
    default:
      return (
        <div className="text-sm text-muted-foreground p-4 text-center">
          <p>Unknown block type: {section.block_type}</p>
          <p className="text-xs mt-1">No editor available for this block type.</p>
        </div>
      );
  }
}
