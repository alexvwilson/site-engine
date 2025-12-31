import type { BlockType } from "@/lib/drizzle/schema/sections";

/**
 * Content type definitions for each section block type.
 * These interfaces define the JSONB structure stored in the sections table.
 */

export interface NavLink {
  label: string;
  url: string;
}

export type HeaderLayout = "left" | "right" | "center";
export type FooterLayout = "simple" | "columns" | "minimal";

export interface HeaderContent {
  // Content (from site settings)
  siteName: string;
  logoUrl?: string;
  links: NavLink[];
  showCta?: boolean;
  ctaText?: string;
  ctaUrl?: string;

  // Styling options
  layout?: HeaderLayout;
  sticky?: boolean;
  showLogoText?: boolean;

  // Override flags (only for page-level sections)
  overrideLayout?: boolean;
  overrideSticky?: boolean;
  overrideShowLogoText?: boolean;
  overrideCta?: boolean;
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

export interface HeroContent {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaUrl: string;
  backgroundImage?: string;
  // Rotating title configuration
  titleMode?: HeroTitleMode;
  rotatingTitle?: RotatingTitleConfig;
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

export interface ImageContent {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export type GalleryAspectRatio = "1:1" | "16:9" | "4:3" | "3:4" | "original";
export type GalleryLayout = "grid" | "masonry" | "carousel";
export type GalleryColumns = 2 | 3 | 4 | "auto";
export type GalleryGap = "small" | "medium" | "large";
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
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesContent {
  features: Feature[];
}

export interface CTAContent {
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

export interface TestimonialsContent {
  testimonials: Testimonial[];
}

export type ContactVariant = "simple" | "detailed";

export interface ContactContent {
  heading: string;
  description: string;
  variant: ContactVariant;
}

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterContent {
  // Content (from site settings)
  copyright: string;
  links: FooterLink[];

  // Styling options
  layout?: FooterLayout;

  // Override flags (only for page-level sections)
  overrideLayout?: boolean;
}

export type BlogFeaturedLayout = "split" | "stacked" | "hero" | "minimal";

export interface BlogFeaturedContent {
  postId: string | null;
  layout: BlogFeaturedLayout;
  showFullContent: boolean;
  contentLimit: number; // Character limit (0 = no limit)
  showReadMore: boolean;
  showCategory: boolean;
  // Hero layout specific
  overlayColor: string; // Hex color, e.g., "#000000"
  overlayOpacity: number; // 0-100
}

export interface BlogGridContent {
  postCount: 3 | 6 | 9;
  showExcerpt: boolean;
}

export type EmbedAspectRatio = "16:9" | "4:3" | "1:1" | "custom";

export interface EmbedContent {
  embedCode: string;
  src: string;
  aspectRatio: EmbedAspectRatio;
  customHeight?: number;
  title?: string;
}

/**
 * Union type of all possible section content types
 */
export type SectionContent =
  | HeaderContent
  | HeroContent
  | TextContent
  | ImageContent
  | GalleryContent
  | FeaturesContent
  | CTAContent
  | TestimonialsContent
  | ContactContent
  | FooterContent
  | BlogFeaturedContent
  | BlogGridContent
  | EmbedContent;

/**
 * Maps block type to its corresponding content interface
 */
export interface ContentTypeMap {
  header: HeaderContent;
  hero: HeroContent;
  text: TextContent;
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
];
