import type { BlockType } from "@/lib/drizzle/schema/sections";
import type {
  SectionContent,
  HeroContent,
  CTAContent,
  HeadingContent,
  HeroPrimitiveContent,
  FeaturesContent,
  TestimonialsContent,
  ProductGridContent,
  CardsContent,
  ImageContent,
  GalleryContent,
  EmbedContent,
  MediaContent,
  BlogFeaturedContent,
  BlogGridContent,
  BlogContent,
  FeatureCardItem,
  TestimonialCardItem,
  ProductCardItem,
} from "@/lib/section-types";

/** Block types that can be converted to new primitives */
export const CONVERTIBLE_BLOCK_TYPES = [
  "hero",
  "cta",
  "heading",
  "features",
  "testimonials",
  "product_grid",
  "image",
  "gallery",
  "embed",
  "blog_featured",
  "blog_grid",
] as const;

export type ConvertibleBlockType = (typeof CONVERTIBLE_BLOCK_TYPES)[number];

export function isConvertibleBlockType(
  blockType: BlockType
): blockType is ConvertibleBlockType {
  return CONVERTIBLE_BLOCK_TYPES.includes(blockType as ConvertibleBlockType);
}

/** Get the target primitive info for a convertible block type */
export function getConversionTarget(blockType: ConvertibleBlockType): {
  primitive: BlockType;
  preset: string;
  label: string;
} {
  const targets: Record<
    ConvertibleBlockType,
    { primitive: BlockType; preset: string; label: string }
  > = {
    hero: { primitive: "hero_primitive", preset: "full", label: "Hero (Flexible)" },
    cta: { primitive: "hero_primitive", preset: "cta", label: "Hero (Flexible)" },
    heading: {
      primitive: "hero_primitive",
      preset: "title-only",
      label: "Hero (Flexible)",
    },
    features: { primitive: "cards", preset: "feature", label: "Cards" },
    testimonials: { primitive: "cards", preset: "testimonial", label: "Cards" },
    product_grid: { primitive: "cards", preset: "product", label: "Cards" },
    image: { primitive: "media", preset: "single", label: "Media" },
    gallery: { primitive: "media", preset: "gallery", label: "Media" },
    embed: { primitive: "media", preset: "embed", label: "Media" },
    blog_featured: { primitive: "blog", preset: "featured", label: "Blog" },
    blog_grid: { primitive: "blog", preset: "grid", label: "Blog" },
  };
  return targets[blockType];
}

/** Generate a unique ID for card items */
function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Convert hero → hero_primitive (full layout) */
function convertHero(content: HeroContent): HeroPrimitiveContent {
  return {
    layout: "full",
    heading: content.heading,
    subheading: content.subheading,
    textAlignment: "center",
    buttons: content.buttons ?? [],
    titleMode: content.titleMode ?? "static",
    rotatingTitle: content.rotatingTitle,
    bodyText: content.bodyText ?? "",
    bodyTextAlignment: content.bodyTextAlignment ?? "center",
    heroBackgroundImage: content.backgroundImage ?? "",
    image: content.image ?? "",
    imageAlt: content.imageAlt ?? "",
    imagePosition: content.imagePosition ?? "top",
    imageMobileStack: content.imageMobileStack ?? "above",
    imageRounding: content.imageRounding ?? "none",
    imageBorderWidth: content.imageBorderWidth ?? "none",
    imageBorderColor: content.imageBorderColor ?? "",
    imageShadow: content.imageShadow ?? "none",
    imageSize: content.imageSize ?? 200,
    enableStyling: false,
    textColorMode: "auto",
  };
}

/** Convert cta → hero_primitive (cta layout) */
function convertCTA(content: CTAContent): HeroPrimitiveContent {
  return {
    layout: "cta",
    heading: content.heading,
    subheading: content.description,
    textAlignment: "center",
    buttons: [
      {
        id: generateId(),
        text: content.buttonText,
        url: content.buttonUrl,
        variant: "primary",
      },
    ],
    enableStyling: content.enableStyling ?? false,
    textColorMode: content.textColorMode ?? "auto",
    showBorder: content.showBorder,
    borderWidth: content.borderWidth,
    borderRadius: content.borderRadius,
    borderColor: content.borderColor,
    boxBackgroundColor: content.boxBackgroundColor,
    boxBackgroundOpacity: content.boxBackgroundOpacity,
    useThemeBackground: content.useThemeBackground,
    backgroundImage: content.backgroundImage,
    overlayColor: content.overlayColor,
    overlayOpacity: content.overlayOpacity,
    textSize: content.textSize,
  };
}

/** Convert heading → hero_primitive (title-only layout) */
function convertHeading(content: HeadingContent): HeroPrimitiveContent {
  return {
    layout: "title-only",
    heading: content.title,
    subheading: content.subtitle ?? "",
    textAlignment: content.alignment ?? "center",
    headingLevel: content.level ?? 1,
    textColorMode: content.textColorMode ?? "auto",
    enableStyling: false,
  };
}

/** Convert features → cards (feature template) */
function convertFeatures(content: FeaturesContent): CardsContent {
  const items: FeatureCardItem[] = content.features.map((f) => ({
    id: generateId(),
    icon: f.icon,
    title: f.title,
    subtitle: f.subtitle,
    description: f.description,
    showButton: f.showButton,
    buttonText: f.buttonText,
    buttonUrl: f.buttonUrl,
    buttonVariant: f.buttonVariant,
  }));

  return {
    template: "feature",
    sectionTitle: content.sectionTitle ?? "",
    sectionSubtitle: content.sectionSubtitle ?? "",
    items,
    columns: 3,
    gap: "medium",
    enableStyling: content.enableStyling ?? false,
    textColorMode: content.textColorMode ?? "auto",
    showBorder: content.showBorder,
    borderWidth: content.borderWidth,
    borderRadius: content.borderRadius,
    borderColor: content.borderColor,
    boxBackgroundColor: content.boxBackgroundColor,
    boxBackgroundOpacity: content.boxBackgroundOpacity,
    useThemeBackground: content.useThemeBackground,
    backgroundImage: content.backgroundImage,
    overlayColor: content.overlayColor,
    overlayOpacity: content.overlayOpacity,
    showCardBackground: content.showCardBackground,
    cardBackgroundColor: content.cardBackgroundColor,
    textSize: content.textSize,
  };
}

/** Convert testimonials → cards (testimonial template) */
function convertTestimonials(content: TestimonialsContent): CardsContent {
  const items: TestimonialCardItem[] = content.testimonials.map((t) => ({
    id: generateId(),
    quote: t.quote,
    author: t.author,
    role: t.role,
    avatar: t.avatar,
  }));

  return {
    template: "testimonial",
    sectionTitle: "",
    sectionSubtitle: "",
    items,
    columns: 3,
    gap: "medium",
    enableStyling: content.enableStyling ?? false,
    textColorMode: content.textColorMode ?? "auto",
    showBorder: content.showBorder,
    borderWidth: content.borderWidth,
    borderRadius: content.borderRadius,
    borderColor: content.borderColor,
    boxBackgroundColor: content.boxBackgroundColor,
    boxBackgroundOpacity: content.boxBackgroundOpacity,
    useThemeBackground: content.useThemeBackground,
    backgroundImage: content.backgroundImage,
    overlayColor: content.overlayColor,
    overlayOpacity: content.overlayOpacity,
    showCardBackground: content.showCardBackground,
    cardBackgroundColor: content.cardBackgroundColor,
    textSize: content.textSize,
  };
}

/** Convert product_grid → cards (product template) */
function convertProductGrid(content: ProductGridContent): CardsContent {
  const items: ProductCardItem[] = content.items.map((p) => ({
    id: p.id || generateId(),
    image: p.image,
    title: p.title,
    description: p.description,
    links: p.links,
    featuredLinkIndex: p.featuredLinkIndex,
  }));

  return {
    template: "product",
    sectionTitle: content.sectionTitle ?? "",
    sectionSubtitle: content.sectionSubtitle ?? "",
    items,
    columns: content.columns === "auto" ? "auto" : content.columns,
    gap: content.gap,
    iconStyle: content.iconStyle,
    showItemTitles: content.showItemTitles,
    showItemDescriptions: content.showItemDescriptions,
    enableStyling: content.enableStyling ?? false,
    textColorMode: content.textColorMode ?? "auto",
    showBorder: content.showBorder,
    borderWidth: content.borderWidth,
    borderRadius: content.borderRadius,
    borderColor: content.borderColor,
    backgroundImage: content.backgroundImage,
    overlayColor: content.overlayColor,
    overlayOpacity: content.overlayOpacity,
    showCardBackground: content.showCardBackground,
    cardBackgroundColor: content.cardBackgroundColor,
  };
}

/** Convert image → media (single mode) */
function convertImage(content: ImageContent): MediaContent {
  return {
    mode: "single",
    src: content.src,
    alt: content.alt,
    caption: content.caption,
    imageWidth: content.imageWidth,
    textWidth: content.textWidth,
    layout: content.layout,
    description: content.description,
    enableStyling: content.enableStyling ?? false,
    textColorMode: content.textColorMode ?? "auto",
    showBorder: content.showBorder,
    borderWidth: content.borderWidth,
    borderRadius: content.borderRadius,
    borderColor: content.borderColor,
    backgroundImage: content.backgroundImage,
    overlayColor: content.overlayColor,
    overlayOpacity: content.overlayOpacity,
  };
}

/** Convert gallery → media (gallery mode) */
function convertGallery(content: GalleryContent): MediaContent {
  return {
    mode: "gallery",
    images: content.images,
    galleryAspectRatio: content.aspectRatio ?? "1:1",
    galleryLayout: content.layout ?? "grid",
    columns: content.columns ?? "auto",
    gap: content.gap ?? "medium",
    lightbox: content.lightbox ?? false,
    autoRotate: content.autoRotate ?? false,
    autoRotateInterval: content.autoRotateInterval ?? 5,
    enableStyling: false,
    showBorder: content.showBorder,
    borderWidth: "medium",
    borderRadius:
      content.borderRadius === "pill" ? "full" : content.borderRadius ?? "medium",
    borderColor: content.borderColor,
  };
}

/** Convert embed → media (embed mode) */
function convertEmbed(content: EmbedContent): MediaContent {
  return {
    mode: "embed",
    embedCode: content.embedCode,
    embedSrc: content.src,
    embedAspectRatio: content.aspectRatio ?? "16:9",
    customHeight: content.customHeight,
    embedTitle: content.title,
    embedSourceType: content.sourceType ?? "embed",
    documentId: content.documentId,
    documentSlug: content.documentSlug,
    enableStyling: false,
  };
}

/** Convert blog_featured → blog (featured mode) */
function convertBlogFeatured(content: BlogFeaturedContent): BlogContent {
  return {
    mode: "featured",
    postId: content.postId,
    featuredLayout: content.layout,
    showFullContent: content.showFullContent,
    contentLimit: content.contentLimit,
    showReadMore: content.showReadMore,
    showCategory: content.showCategory,
    showAuthor: content.showAuthor ?? true,
    imageFit: content.imageFit ?? "cover",
    enableStyling: false,
    textColorMode: "auto",
    overlayColor: content.overlayColor,
    overlayOpacity: content.overlayOpacity,
  };
}

/** Convert blog_grid → blog (grid mode) */
function convertBlogGrid(content: BlogGridContent): BlogContent {
  return {
    mode: "grid",
    gridLayout: "grid",
    sectionTitle: content.sectionTitle ?? "",
    sectionSubtitle: content.sectionSubtitle ?? "",
    postCount: content.postCount,
    showExcerpt: content.showExcerpt,
    showAuthor: content.showAuthor ?? true,
    pageFilter: content.pageFilter,
    imageBackgroundMode: content.imageBackgroundMode,
    imageBackgroundColor: content.imageBackgroundColor,
    cardBorderMode: content.cardBorderMode,
    cardBorderColor: content.cardBorderColor,
    enableStyling: content.enableStyling ?? false,
    textColorMode: content.textColorMode ?? "auto",
    showBorder: content.showBorder,
    borderWidth: content.borderWidth,
    borderRadius: content.borderRadius,
    borderColor: content.borderColor,
    boxBackgroundColor: content.boxBackgroundColor,
    boxBackgroundOpacity: content.boxBackgroundOpacity,
    useThemeBackground: content.useThemeBackground,
    backgroundImage: content.backgroundImage,
    overlayColor: content.overlayColor,
    overlayOpacity: content.overlayOpacity,
    showCardBackground: content.showCardBackground,
    cardBackgroundColor: content.cardBackgroundColor,
    textSize: content.textSize,
  };
}

/** Main conversion function */
export function convertContent(
  blockType: ConvertibleBlockType,
  content: SectionContent
): SectionContent {
  switch (blockType) {
    case "hero":
      return convertHero(content as HeroContent);
    case "cta":
      return convertCTA(content as CTAContent);
    case "heading":
      return convertHeading(content as HeadingContent);
    case "features":
      return convertFeatures(content as FeaturesContent);
    case "testimonials":
      return convertTestimonials(content as TestimonialsContent);
    case "product_grid":
      return convertProductGrid(content as ProductGridContent);
    case "image":
      return convertImage(content as ImageContent);
    case "gallery":
      return convertGallery(content as GalleryContent);
    case "embed":
      return convertEmbed(content as EmbedContent);
    case "blog_featured":
      return convertBlogFeatured(content as BlogFeaturedContent);
    case "blog_grid":
      return convertBlogGrid(content as BlogGridContent);
  }
}
