import type { BlockType } from "@/lib/drizzle/schema/sections";

/**
 * Content type definitions for each section block type.
 * These interfaces define the JSONB structure stored in the sections table.
 */

export interface NavLink {
  label: string;
  url: string;
}

// Social link types
export type SocialPlatform =
  | "facebook"
  | "instagram"
  | "x"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "threads"
  | "pinterest"
  | "github"
  | "discord"
  | "snapchat"
  | "whatsapp"
  | "telegram"
  | "twitch"
  | "website"
  | "email";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export type SocialIconStyle = "brand" | "monochrome" | "primary";
export type SocialIconSize = "small" | "medium" | "large";

export type HeaderLayout = "left" | "right" | "center";
export type FooterLayout = "simple" | "columns" | "minimal";
export type HeaderFooterBorderWidth = "thin" | "medium" | "thick";

export interface HeaderContent {
  // Content (from site settings)
  siteName: string;
  logoUrl?: string;
  links: NavLink[];
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;

  // Layout options
  layout?: HeaderLayout;
  sticky?: boolean;
  showLogoText?: boolean;

  // Logo size (24-80px)
  logoSize?: number;

  // Master styling toggle
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Background & overlay options
  backgroundColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Border options (bottom border only, full-width)
  showBorder?: boolean;
  borderWidth?: HeaderFooterBorderWidth;
  borderColor?: string;

  // Typography
  textSize?: TextSize;

  // Override flags (only for page-level sections)
  overrideLayout?: boolean;
  overrideSticky?: boolean;
  overrideShowLogoText?: boolean;
  overrideCta?: boolean;
  overrideLogoSize?: boolean;
  overrideStyling?: boolean;
  overrideSocialLinks?: boolean;

  // Social links options
  showSocialLinks?: boolean;
  socialLinksPosition?: "left" | "right";
  socialLinksSize?: SocialIconSize;
}

// Hero title animation types
export type HeroTitleMode = "static" | "rotating";
export type HeroAnimationEffect = "clip" | "typing";
export type HeroAnimationMode = "loop" | "once";

export interface RotatingTitleConfig {
  beforeText: string;
  words: string[];
  afterText?: string;
  effect: HeroAnimationEffect;
  displayTime: number;
  animationMode: HeroAnimationMode;
}

// Hero button types
export type HeroButtonVariant = "primary" | "secondary";

export interface HeroButton {
  id: string;
  text: string;
  url: string;
  variant: HeroButtonVariant;
}

export const MAX_HERO_BUTTONS = 4;

// Hero image styling types
export type HeroImageRounding = "none" | "small" | "medium" | "large" | "full";
export type HeroImagePosition = "left" | "right" | "top" | "bottom" | "after-title";
export type HeroImageBorderWidth = "none" | "thin" | "medium" | "thick";
export type HeroImageShadow = "none" | "small" | "medium" | "large" | "xl";
export type HeroImageMobileStack = "above" | "below";
export type HeroBodyTextAlignment = "left" | "center" | "right";

export interface HeroContent {
  heading: string;
  subheading: string;
  // Multi-button support
  buttons?: HeroButton[];
  // Legacy single button fields (for backward compatibility)
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  // Rotating title configuration
  titleMode?: HeroTitleMode;
  rotatingTitle?: RotatingTitleConfig;
  // Hero image (profile/feature image, not background)
  image?: string;
  imageAlt?: string;
  imagePosition?: HeroImagePosition;
  imageMobileStack?: HeroImageMobileStack; // For left/right positions: where image goes on mobile
  imageRounding?: HeroImageRounding;
  imageBorderWidth?: HeroImageBorderWidth;
  imageBorderColor?: string;
  imageShadow?: HeroImageShadow;
  imageSize?: number; // Size in pixels (e.g., 150, 200, 300)
  // Body text with rich formatting
  bodyText?: string;
  bodyTextAlignment?: HeroBodyTextAlignment;
}

// Heading block types
export type HeadingLevel = 1 | 2 | 3;
export type HeadingAlignment = "left" | "center" | "right";

export interface HeadingContent {
  title: string;
  subtitle?: string;
  level: HeadingLevel;
  alignment: HeadingAlignment;
  textColorMode?: TextColorMode;
}

// =============================================================================
// Hero Primitive - Unified hero/cta/heading
// =============================================================================

/**
 * Layout presets for Hero primitive
 * - full: All features (rotating text, hero image, multi-buttons, body text, background)
 * - compact: Smaller hero with optional image, single button, no background
 * - cta: Conversion-focused section with single button, SectionStyling support
 * - title-only: Simple heading with subtitle, heading level selection, no buttons
 */
export type HeroLayout = "full" | "compact" | "cta" | "title-only";

/**
 * Unified Hero primitive content interface
 * Consolidates HeroContent, CTAContent, and HeadingContent patterns
 */
export interface HeroPrimitiveContent extends SectionStyling {
  /** Layout preset determines which features are available */
  layout: HeroLayout;

  // COMMON: All layouts have these
  /** Main heading text */
  heading: string;
  /** Supporting text below heading */
  subheading?: string;
  /** Text alignment for heading and subheading */
  textAlignment?: HeadingAlignment;

  // BUTTONS: All layouts except title-only
  /** Button array (multi-button for full layout, single for others) */
  buttons?: HeroButton[];

  // TITLE-ONLY: Heading level selection
  /** Semantic heading level (H1/H2/H3) - title-only layout */
  headingLevel?: HeadingLevel;

  // FULL LAYOUT: Rotating text, body text, hero background
  /** Static or rotating title mode */
  titleMode?: HeroTitleMode;
  /** Rotating title configuration */
  rotatingTitle?: RotatingTitleConfig;
  /** Rich text body content */
  bodyText?: string;
  /** Body text alignment */
  bodyTextAlignment?: HeroBodyTextAlignment;
  /** Hero section background image (separate from SectionStyling.backgroundImage) */
  heroBackgroundImage?: string;

  // FULL + COMPACT: Hero image support
  /** Hero/profile image URL */
  image?: string;
  /** Image alt text for accessibility */
  imageAlt?: string;
  /** Image position relative to text */
  imagePosition?: HeroImagePosition;
  /** Mobile stacking behavior for side-by-side layouts */
  imageMobileStack?: HeroImageMobileStack;
  /** Image corner rounding */
  imageRounding?: HeroImageRounding;
  /** Image border width */
  imageBorderWidth?: HeroImageBorderWidth;
  /** Image border color */
  imageBorderColor?: string;
  /** Image drop shadow */
  imageShadow?: HeroImageShadow;
  /** Image size in pixels */
  imageSize?: number;
}

// Text block styling types
export type TextBorderWidth = "thin" | "medium" | "thick";
export type TextBorderRadius = "none" | "small" | "medium" | "large" | "full";
export type TextContentWidth = "narrow" | "medium" | "full";
export type TextSize = "small" | "normal" | "large";
export type TextColorMode = "auto" | "light" | "dark";

/**
 * Base styling interface shared across styled section blocks.
 * Blocks that support styling extend this interface.
 *
 * This interface consolidates the common styling fields that were previously
 * duplicated across ~13 block content interfaces.
 */
export interface SectionStyling {
  // Master toggle - when false, renders with default theme colors
  enableStyling?: boolean;

  // Text/content color mode
  textColorMode?: TextColorMode;

  // Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background (container background when border is shown)
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Section background & overlay
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Layout
  contentWidth?: TextContentWidth;

  // Typography
  textSize?: TextSize;
}

export interface TextContent extends SectionStyling {
  body: string;
}

export interface MarkdownContent extends SectionStyling {
  markdown: string;
}

// =============================================================================
// RichText Primitive - Unified text/markdown/article
// =============================================================================

/**
 * Editor mode for RichText primitive
 * - visual: WYSIWYG TipTap editor (HTML output)
 * - markdown: Markdown textarea with live preview
 * - article: TipTap with inline image support (HTML output with float images)
 */
export type RichTextMode = "visual" | "markdown" | "article";

/**
 * Unified RichText content interface
 * Consolidates TextContent, MarkdownContent, and ArticleContent
 */
export interface RichTextContent extends SectionStyling {
  /** Editor mode determines input UI and rendering behavior */
  mode: RichTextMode;
  /** HTML content for visual/article modes */
  body?: string;
  /** Raw markdown for markdown mode */
  markdown?: string;
  /** Border radius for inline images (article mode only) */
  imageRounding?: TextBorderRadius;
}

export interface ImageContent extends SectionStyling {
  src: string;
  alt: string;
  caption?: string;

  // Layout options
  imageWidth?: ImageWidth;
  textWidth?: ImageWidth; // Only used for side-by-side layouts (image-left, image-right)
  layout?: ImageLayout;
  description?: string; // Rich text HTML for text layouts
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

// Image block types
export type ImageWidth = 10 | 25 | 50 | 75 | 100;
export type ImageLayout =
  | "image-only"
  | "image-left"
  | "image-right"
  | "image-top"
  | "image-bottom";

export type GalleryAspectRatio = "1:1" | "16:9" | "4:3" | "3:4" | "original";
export type GalleryLayout = "grid" | "masonry" | "carousel";
export type GalleryColumns = 2 | 3 | 4 | "auto";
export type GalleryGap = "none" | "small" | "medium" | "large";
export type GalleryBorderWidth = "thin" | "medium" | "thick";
export type GalleryBorderRadius = "none" | "small" | "medium" | "large" | "pill";
export type GalleryAutoRotateInterval = 3 | 5 | 7 | 10;

export interface GalleryContent {
  images: GalleryImage[];
  aspectRatio?: GalleryAspectRatio;
  layout?: GalleryLayout;
  columns?: GalleryColumns;
  gap?: GalleryGap;
  lightbox?: boolean;
  autoRotate?: boolean;
  autoRotateInterval?: GalleryAutoRotateInterval;
  // Border styling options
  showBorder?: boolean;
  borderWidth?: GalleryBorderWidth;
  borderRadius?: GalleryBorderRadius;
  borderColor?: string; // Hex color, defaults to theme primary if empty
}

export type FeatureButtonVariant = "primary" | "secondary";

export interface Feature {
  icon: string;
  title: string;
  subtitle?: string;
  description: string;
  showButton?: boolean;
  buttonText?: string;
  buttonUrl?: string;
  buttonVariant?: FeatureButtonVariant;
}

export interface FeaturesContent extends SectionStyling {
  // Optional section header
  sectionTitle?: string;
  sectionSubtitle?: string;

  features: Feature[];

  // Feature card options (not in base SectionStyling)
  showCardBackground?: boolean;
  cardBackgroundColor?: string;
}

export interface CTAContent extends SectionStyling {
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface TestimonialsContent extends SectionStyling {
  testimonials: Testimonial[];

  // Testimonial card options (not in base SectionStyling)
  showCardBackground?: boolean;
  cardBackgroundColor?: string;
}

export type ContactVariant = "simple" | "detailed";

export interface ContactContent extends SectionStyling {
  heading: string;
  description: string;
  variant: ContactVariant;

  // Form card options (not in base SectionStyling)
  showFormBackground?: boolean;
  formBackgroundColor?: string;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterContent {
  // Content (from site settings)
  copyright: string;
  links: FooterLink[];

  // Layout options
  layout?: FooterLayout;

  // Master styling toggle
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Background & overlay options
  backgroundColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Border options (top border only, full-width)
  showBorder?: boolean;
  borderWidth?: HeaderFooterBorderWidth;
  borderColor?: string;

  // Typography
  textSize?: TextSize;

  // Override flags (only for page-level sections)
  overrideLayout?: boolean;
  overrideStyling?: boolean;
  overrideSocialLinks?: boolean;

  // Social links options
  showSocialLinks?: boolean;
  socialLinksPosition?: "above" | "below";
  socialLinksAlignment?: "left" | "center" | "right";
  socialLinksSize?: SocialIconSize;
}

export type BlogFeaturedLayout = "split" | "stacked" | "hero" | "minimal";

// Image fit options for blog images
export type ImageFit = "cover" | "contain" | "fill";

export interface BlogFeaturedContent {
  postId: string | null;
  layout: BlogFeaturedLayout;
  showFullContent: boolean;
  contentLimit: number; // Character limit (0 = no limit)
  showReadMore: boolean;
  showCategory: boolean;
  showAuthor?: boolean; // Per-block author toggle (default: true)
  imageFit?: ImageFit; // How the featured image is displayed (default: cover)
  // Hero layout specific
  overlayColor: string; // Hex color, e.g., "#000000"
  overlayOpacity: number; // 0-100
}

export type BlogGridPageFilter = "all" | "current" | "unassigned" | string;

// Image background mode for contain fit
export type ImageBackgroundMode = "muted" | "primary" | "custom";

export interface BlogGridContent extends SectionStyling {
  // Optional section header
  sectionTitle?: string;
  sectionSubtitle?: string;

  postCount: 3 | 6 | 9;
  showExcerpt: boolean;
  showAuthor?: boolean;
  pageFilter?: BlogGridPageFilter;

  // Image background (for contain fit mode letterboxing)
  imageBackgroundMode?: ImageBackgroundMode;
  imageBackgroundColor?: string;

  // Post card border color (not in base SectionStyling)
  cardBorderMode?: "default" | "primary" | "custom";
  cardBorderColor?: string;

  // Post card options (not in base SectionStyling)
  showCardBackground?: boolean;
  cardBackgroundColor?: string;
}

export type EmbedSourceType = "embed" | "pdf";
export type EmbedAspectRatio = "16:9" | "4:3" | "1:1" | "letter" | "custom";

export interface EmbedContent {
  embedCode: string;
  src: string;
  aspectRatio: EmbedAspectRatio;
  customHeight?: number;
  title?: string;

  // PDF document support
  sourceType?: EmbedSourceType;
  documentId?: string;
  documentSlug?: string;
}

export interface SocialLinksContent extends SectionStyling {
  // Section title and subtitle
  title?: string;
  subtitle?: string;

  alignment?: "left" | "center" | "right";
  size?: SocialIconSize;

  // Icon style override (if not set, uses site-level style)
  iconStyle?: SocialIconStyle;
}

// ============== PRODUCT GRID TYPES ==============

// Platform types for product/catalog action links
export const PRODUCT_PLATFORMS = [
  "amazon",
  "itunes",
  "apple_music",
  "spotify",
  "youtube",
  "soundcloud",
  "tidal",
  "bandcamp",
  "custom",
] as const;

export type ProductPlatform = (typeof PRODUCT_PLATFORMS)[number];

// Individual action link for a product
export interface ProductLink {
  platform: ProductPlatform;
  url: string;
  label?: string; // Custom label for "custom" platform
}

// Single product/catalog item
export interface ProductItem {
  id: string; // UUID for drag-drop reordering
  image?: string;
  title?: string;
  description?: string;
  links: ProductLink[];
  featuredLinkIndex?: number; // Index of the link to use when clicking the image
}

// Icon style options (same as social links)
export type ProductIconStyle = "brand" | "monochrome" | "primary";

// Column options
export type ProductGridColumns = 2 | 3 | 4 | "auto";

// Gap options
export type ProductGridGap = "small" | "medium" | "large";

// Article block types for inline images
export type ArticleImageAlignment = "left" | "right" | "center" | "full";
export type ArticleImageWidth = 25 | 50 | 75 | 100;

// Full product grid block content
export interface ProductGridContent extends SectionStyling {
  // Optional section header
  sectionTitle?: string;
  sectionSubtitle?: string;

  // Items array
  items: ProductItem[];

  // Card display options
  showItemTitles?: boolean;
  showItemDescriptions?: boolean;

  // Layout
  columns: ProductGridColumns;
  gap: ProductGridGap;

  // Icon styling
  iconStyle: ProductIconStyle;

  // Card styling (not in base SectionStyling)
  showCardBackground?: boolean;
  cardBackgroundColor?: string;
  cardBackgroundOpacity?: number;
}

// Article block content - rich text with inline images
export interface ArticleContent extends SectionStyling {
  // HTML content from TipTap (includes image nodes with alignment/width)
  body: string;

  // Image styling for inline images (not in base SectionStyling)
  imageRounding?: TextBorderRadius;
}

// =============================================================================
// Cards Primitive - Unified features/testimonials/product_grid
// =============================================================================

/**
 * Template type for Cards primitive
 * - feature: Icon + title + subtitle + description + optional button
 * - testimonial: Quote + author + role + avatar
 * - product: Image + title + description + platform links
 */
export type CardsTemplate = "feature" | "testimonial" | "product";

/**
 * Feature card item (icon-based)
 */
export interface FeatureCardItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  description: string;
  showButton?: boolean;
  buttonText?: string;
  buttonUrl?: string;
  buttonVariant?: FeatureButtonVariant;
}

/**
 * Testimonial card item (quote-based)
 */
export interface TestimonialCardItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

/**
 * Product card item (image + links)
 * Reuses existing ProductLink type
 */
export interface ProductCardItem {
  id: string;
  image?: string;
  title?: string;
  description?: string;
  links: ProductLink[];
  featuredLinkIndex?: number;
}

/**
 * Union type for card items - discriminated by parent template
 */
export type CardItem = FeatureCardItem | TestimonialCardItem | ProductCardItem;

/**
 * Grid column options (unified across templates)
 */
export type CardsColumns = 2 | 3 | 4 | "auto";

/**
 * Grid gap options (unified across templates)
 */
export type CardsGap = "small" | "medium" | "large";

/**
 * Unified Cards content interface
 */
export interface CardsContent extends SectionStyling {
  /** Template determines item fields and card layout */
  template: CardsTemplate;

  /** Optional section header (all templates) */
  sectionTitle?: string;
  sectionSubtitle?: string;

  /** Items array - structure depends on template */
  items: CardItem[];

  /** Grid layout (unified across templates) */
  columns?: CardsColumns;
  gap?: CardsGap;

  /** Card styling (not in base SectionStyling) */
  showCardBackground?: boolean;
  cardBackgroundColor?: string;

  /** Product template specific */
  iconStyle?: ProductIconStyle;
  showItemTitles?: boolean;
  showItemDescriptions?: boolean;
}

/**
 * Union type of all possible section content types
 */
export type SectionContent =
  | HeaderContent
  | HeadingContent
  | HeroContent
  | HeroPrimitiveContent
  | RichTextContent
  | TextContent
  | MarkdownContent
  | ImageContent
  | GalleryContent
  | FeaturesContent
  | CTAContent
  | TestimonialsContent
  | ContactContent
  | FooterContent
  | BlogFeaturedContent
  | BlogGridContent
  | EmbedContent
  | SocialLinksContent
  | ProductGridContent
  | ArticleContent
  | CardsContent;

/**
 * Maps block type to its corresponding content interface
 */
export interface ContentTypeMap {
  header: HeaderContent;
  heading: HeadingContent;
  hero: HeroContent;
  hero_primitive: HeroPrimitiveContent;
  richtext: RichTextContent;
  text: TextContent;
  markdown: MarkdownContent;
  image: ImageContent;
  gallery: GalleryContent;
  features: FeaturesContent;
  cta: CTAContent;
  testimonials: TestimonialsContent;
  contact: ContactContent;
  footer: FooterContent;
  blog_featured: BlogFeaturedContent;
  blog_grid: BlogGridContent;
  embed: EmbedContent;
  social_links: SocialLinksContent;
  product_grid: ProductGridContent;
  article: ArticleContent;
  cards: CardsContent;
}

/**
 * Type-safe content accessor for a specific block type
 */
export function getTypedContent<T extends BlockType>(
  blockType: T,
  content: unknown
): ContentTypeMap[T] {
  return content as ContentTypeMap[T];
}

/**
 * Block categories for organizing the section picker
 */
export type BlockCategory =
  | "layout"
  | "content"
  | "media"
  | "cards"
  | "blog"
  | "utility";

/**
 * Category display info for tabs in section picker
 */
export const BLOCK_CATEGORIES: { id: BlockCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "layout", label: "Layout" },
  { id: "content", label: "Content" },
  { id: "media", label: "Media" },
  { id: "cards", label: "Cards" },
  { id: "blog", label: "Blog" },
  { id: "utility", label: "Utility" },
];

/**
 * Block type display information
 */
export interface BlockTypeInfo {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  category: BlockCategory;
}

export const BLOCK_TYPE_INFO: BlockTypeInfo[] = [
  {
    type: "header",
    label: "Header",
    description: "Site navigation with logo and links",
    icon: "panel-top",
    category: "layout",
  },
  {
    type: "heading",
    label: "Heading",
    description: "Page title or section heading with optional subtitle",
    icon: "heading",
    category: "layout",
  },
  {
    type: "hero",
    label: "Hero",
    description: "Large header section with heading, subheading, and CTA",
    icon: "layout",
    category: "layout",
  },
  {
    type: "hero_primitive",
    label: "Hero (Flexible)",
    description: "Flexible hero with layout presets: full, compact, CTA, or title-only",
    icon: "layout-template",
    category: "layout",
  },
  {
    type: "richtext",
    label: "Rich Text",
    description: "Formatted text with visual editor, markdown, or inline images",
    icon: "text",
    category: "content",
  },
  {
    type: "image",
    label: "Image",
    description: "Single image with caption",
    icon: "image",
    category: "media",
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Grid of multiple images",
    icon: "grid-3x3",
    category: "media",
  },
  {
    type: "features",
    label: "Features",
    description: "Feature cards with icons",
    icon: "sparkles",
    category: "cards",
  },
  {
    type: "cta",
    label: "Call to Action",
    description: "Conversion-focused section with button",
    icon: "mouse-pointer-click",
    category: "layout",
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "Customer quotes and reviews",
    icon: "quote",
    category: "cards",
  },
  {
    type: "contact",
    label: "Contact Form",
    description: "Contact form with configurable fields",
    icon: "mail",
    category: "utility",
  },
  {
    type: "footer",
    label: "Footer",
    description: "Page footer with links and copyright",
    icon: "panel-bottom",
    category: "layout",
  },
  {
    type: "blog_featured",
    label: "Featured Post",
    description: "Display a single blog post as a hero section",
    icon: "newspaper",
    category: "blog",
  },
  {
    type: "blog_grid",
    label: "Post Grid",
    description: "Grid of recent blog posts",
    icon: "layout-grid",
    category: "blog",
  },
  {
    type: "embed",
    label: "Embed",
    description: "Embed YouTube, Google Maps, and other content",
    icon: "code",
    category: "media",
  },
  {
    type: "social_links",
    label: "Social Links",
    description: "Display social media links with icons",
    icon: "share-2",
    category: "utility",
  },
  {
    type: "product_grid",
    label: "Product Grid",
    description: "Display products or items with action links",
    icon: "shopping-bag",
    category: "cards",
  },
  {
    type: "cards",
    label: "Cards",
    description: "Feature cards, testimonials, or product grid with templates",
    icon: "layout-grid",
    category: "cards",
  },
];
