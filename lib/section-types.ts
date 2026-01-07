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

// Text block styling types
export type TextBorderWidth = "thin" | "medium" | "thick";
export type TextBorderRadius = "none" | "small" | "medium" | "large" | "full";
export type TextContentWidth = "narrow" | "medium" | "full";
export type TextSize = "small" | "normal" | "large";
export type TextColorMode = "auto" | "light" | "dark";

export interface TextContent {
  body: string;

  // Master styling toggle - when false, renders as plain text with theme colors
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode; // 'auto' detects from background, 'light'/'dark' forces color

  // Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string; // Hex color, defaults to theme primary if not set

  // Box background (when border is shown)
  boxBackgroundColor?: string; // Hex color for the bordered box, empty = use theme
  boxBackgroundOpacity?: number; // 0-100, defaults to 100
  useThemeBackground?: boolean; // If true, uses theme background color (adapts to light/dark mode)

  // Background & overlay options (for section background)
  backgroundImage?: string;
  overlayColor?: string; // Hex color
  overlayOpacity?: number; // 0-100

  // Layout options
  contentWidth?: TextContentWidth;

  // Typography options
  textSize?: TextSize;
}

export interface MarkdownContent {
  markdown: string;

  // Master styling toggle - when false, renders as plain markdown with theme colors
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background (when border is shown)
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Background & overlay options (for section background)
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Layout options
  contentWidth?: TextContentWidth;

  // Typography options
  textSize?: TextSize;
}

export interface ImageContent {
  src: string;
  alt: string;
  caption?: string;

  // Layout options
  imageWidth?: ImageWidth;
  textWidth?: ImageWidth; // Only used for side-by-side layouts (image-left, image-right)
  layout?: ImageLayout;
  description?: string; // Rich text HTML for text layouts

  // Master styling toggle
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Background & overlay options
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
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

export interface Feature {
  icon: string;
  title: string;
  subtitle?: string;
  description: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface FeaturesContent {
  // Optional section header
  sectionTitle?: string;
  sectionSubtitle?: string;

  features: Feature[];

  // Master styling toggle - when false, renders with fixed muted background
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options (for the features container)
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background (for the features container)
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Section background & overlay
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Feature card options
  showCardBackground?: boolean; // When false, cards are transparent
  cardBackgroundColor?: string; // Custom card background (empty = use theme)

  // Typography
  textSize?: TextSize;
}

export interface CTAContent {
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;

  // Master styling toggle - when false, renders with fixed primary background
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options (for the CTA container)
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background (for the CTA container)
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Section background & overlay
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Typography
  textSize?: TextSize;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export interface TestimonialsContent {
  testimonials: Testimonial[];

  // Master styling toggle - when false, renders with theme background
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options (for the testimonials container)
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background (for the testimonials container)
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Section background & overlay
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Testimonial card options
  showCardBackground?: boolean;
  cardBackgroundColor?: string;

  // Typography
  textSize?: TextSize;
}

export type ContactVariant = "simple" | "detailed";

export interface ContactContent {
  heading: string;
  description: string;
  variant: ContactVariant;

  // Master styling toggle - when false, renders with muted background
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options (for the contact container)
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background (for the contact container)
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Section background & overlay
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Form card options
  showFormBackground?: boolean;
  formBackgroundColor?: string;

  // Typography
  textSize?: TextSize;
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

export interface BlogFeaturedContent {
  postId: string | null;
  layout: BlogFeaturedLayout;
  showFullContent: boolean;
  contentLimit: number; // Character limit (0 = no limit)
  showReadMore: boolean;
  showCategory: boolean;
  showAuthor?: boolean; // Per-block author toggle (default: true)
  // Hero layout specific
  overlayColor: string; // Hex color, e.g., "#000000"
  overlayOpacity: number; // 0-100
}

export type BlogGridPageFilter = "all" | "current" | "unassigned" | string;

export interface BlogGridContent {
  postCount: 3 | 6 | 9;
  showExcerpt: boolean;
  showAuthor?: boolean; // Per-block author toggle (default: true)
  pageFilter?: BlogGridPageFilter;
}

export type EmbedAspectRatio = "16:9" | "4:3" | "1:1" | "custom";

export interface EmbedContent {
  embedCode: string;
  src: string;
  aspectRatio: EmbedAspectRatio;
  customHeight?: number;
  title?: string;
}

export interface SocialLinksContent {
  // Section title and subtitle
  title?: string;
  subtitle?: string;

  alignment?: "left" | "center" | "right";
  size?: SocialIconSize;

  // Icon style override (if not set, uses site-level style)
  iconStyle?: SocialIconStyle;

  // Master styling toggle - follows same pattern as other blocks
  enableStyling?: boolean;

  // Text/icon color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Section background & overlay
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
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
export interface ProductGridContent {
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

  // Block styling (following established pattern)
  enableStyling?: boolean;
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColorMode?: TextColorMode;

  // Card styling
  showCardBackground?: boolean;
  cardBackgroundColor?: string;
  cardBackgroundOpacity?: number;
}

// Article block content - rich text with inline images
export interface ArticleContent {
  // HTML content from TipTap (includes image nodes with alignment/width)
  body: string;

  // Image styling for inline images
  imageRounding?: TextBorderRadius;

  // Master styling toggle - when false, renders as plain article with theme colors
  enableStyling?: boolean;

  // Text color mode when styling is enabled
  textColorMode?: TextColorMode;

  // Border options
  showBorder?: boolean;
  borderWidth?: TextBorderWidth;
  borderRadius?: TextBorderRadius;
  borderColor?: string;

  // Box background (when border is shown)
  boxBackgroundColor?: string;
  boxBackgroundOpacity?: number;
  useThemeBackground?: boolean;

  // Background & overlay options (for section background)
  backgroundImage?: string;
  overlayColor?: string;
  overlayOpacity?: number;

  // Layout options
  contentWidth?: TextContentWidth;

  // Typography options
  textSize?: TextSize;
}

/**
 * Union type of all possible section content types
 */
export type SectionContent =
  | HeaderContent
  | HeadingContent
  | HeroContent
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
  | ArticleContent;

/**
 * Maps block type to its corresponding content interface
 */
export interface ContentTypeMap {
  header: HeaderContent;
  heading: HeadingContent;
  hero: HeroContent;
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
 * Block type display information
 */
export interface BlockTypeInfo {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
}

export const BLOCK_TYPE_INFO: BlockTypeInfo[] = [
  {
    type: "header",
    label: "Header",
    description: "Site navigation with logo and links",
    icon: "panel-top",
  },
  {
    type: "heading",
    label: "Heading",
    description: "Page title or section heading with optional subtitle",
    icon: "heading",
  },
  {
    type: "hero",
    label: "Hero",
    description: "Large header section with heading, subheading, and CTA",
    icon: "layout",
  },
  {
    type: "text",
    label: "Text",
    description: "Rich text content block",
    icon: "type",
  },
  {
    type: "markdown",
    label: "Markdown",
    description: "Write content in Markdown with live preview",
    icon: "file-text",
  },
  {
    type: "image",
    label: "Image",
    description: "Single image with caption",
    icon: "image",
  },
  {
    type: "gallery",
    label: "Gallery",
    description: "Grid of multiple images",
    icon: "grid-3x3",
  },
  {
    type: "features",
    label: "Features",
    description: "Feature cards with icons",
    icon: "sparkles",
  },
  {
    type: "cta",
    label: "Call to Action",
    description: "Conversion-focused section with button",
    icon: "mouse-pointer-click",
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "Customer quotes and reviews",
    icon: "quote",
  },
  {
    type: "contact",
    label: "Contact Form",
    description: "Contact form with configurable fields",
    icon: "mail",
  },
  {
    type: "footer",
    label: "Footer",
    description: "Page footer with links and copyright",
    icon: "panel-bottom",
  },
  {
    type: "blog_featured",
    label: "Featured Post",
    description: "Display a single blog post as a hero section",
    icon: "newspaper",
  },
  {
    type: "blog_grid",
    label: "Post Grid",
    description: "Grid of recent blog posts",
    icon: "layout-grid",
  },
  {
    type: "embed",
    label: "Embed",
    description: "Embed YouTube, Google Maps, and other content",
    icon: "code",
  },
  {
    type: "social_links",
    label: "Social Links",
    description: "Display social media links with icons",
    icon: "share-2",
  },
  {
    type: "product_grid",
    label: "Product Grid",
    description: "Display products or items with action links",
    icon: "shopping-bag",
  },
  {
    type: "article",
    label: "Article",
    description: "Rich content with inline images and text wrapping",
    icon: "book-open",
  },
];
