import type { BlockType } from "@/lib/drizzle/schema/sections";
import type {
  ContentTypeMap,
  HeadingLevel,
  HeadingAlignment,
  TextColorMode,
  FeatureCardItem,
  HeroLayout,
  AccordionMode,
  AccordionIconStyle,
} from "./section-types";

/**
 * Default content for each block type when a new section is created.
 * These provide sensible starting values that users can customize.
 */
export const sectionDefaults: { [K in BlockType]: ContentTypeMap[K] } = {
  header: {
    siteName: "Your Site",
    logoUrl: "",
    links: [
      { label: "Home", url: "/" },
      { label: "About", url: "/about" },
      { label: "Contact", url: "/contact" },
    ],
    showCta: true,
    ctaText: "Get Started",
    ctaUrl: "#",
    layout: "left",
    sticky: true,
    showLogoText: true,
    // Logo size (24-80px)
    logoSize: 32,
    // Styling options (disabled by default)
    enableStyling: false,
    textColorMode: "auto",
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 50,
    showBorder: true,
    borderWidth: "thin",
    borderColor: "",
    textSize: "normal",
    // Social links
    showSocialLinks: true,
    socialLinksPosition: "right",
    socialLinksSize: "medium",
  },

  heading: {
    title: "Page Title",
    subtitle: "",
    level: 1 as HeadingLevel,
    alignment: "center" as HeadingAlignment,
    textColorMode: "auto" as TextColorMode,
  },

  hero: {
    heading: "Welcome to Your Site",
    subheading: "Create something amazing with Headstring Web",
    buttons: [
      { id: "btn-1", text: "Get Started", url: "#", variant: "primary" },
    ],
    titleMode: "static",
    rotatingTitle: {
      beforeText: "We specialize in",
      words: ["Design", "Development", "Marketing"],
      afterText: "",
      effect: "clip",
      displayTime: 2000,
      animationMode: "loop",
    },
    // Hero image defaults (profile/feature image)
    image: "",
    imageAlt: "",
    imagePosition: "top",
    imageMobileStack: "above",
    imageRounding: "none",
    imageBorderWidth: "none",
    imageBorderColor: "",
    imageShadow: "none",
    imageSize: 200,
    // Body text defaults
    bodyText: "",
    bodyTextAlignment: "center",
  },

  hero_primitive: {
    // Layout preset determines available features
    layout: "full" as HeroLayout,

    // Common fields (all layouts)
    heading: "Welcome to Your Site",
    subheading: "Create something amazing with our platform",
    textAlignment: "center" as HeadingAlignment,

    // Buttons (all layouts except title-only)
    buttons: [
      { id: "btn-1", text: "Get Started", url: "#", variant: "primary" },
    ],

    // Title-only specific
    headingLevel: 1 as HeadingLevel,

    // Full layout specific - rotating text
    titleMode: "static",
    rotatingTitle: {
      beforeText: "We specialize in",
      words: ["Design", "Development", "Marketing"],
      afterText: "",
      effect: "clip",
      displayTime: 2000,
      animationMode: "loop",
    },
    bodyText: "",
    bodyTextAlignment: "center",
    heroBackgroundImage: "",

    // Image support (full + compact layouts)
    image: "",
    imageAlt: "",
    imagePosition: "top",
    imageMobileStack: "above",
    imageRounding: "none",
    imageBorderWidth: "none",
    imageBorderColor: "",
    imageShadow: "none",
    imageSize: 200,

    // SectionStyling defaults (all layouts)
    enableStyling: false,
    textColorMode: "auto" as TextColorMode,
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    contentWidth: "medium",
    textSize: "normal",
  },

  richtext: {
    mode: "visual",
    body: "<p>Start writing your content here. You can switch between visual editor, markdown, or article mode with inline images.</p>",
    markdown: "",
    // Image styling (for article mode)
    imageRounding: "medium",
    // Master styling toggle (disabled by default for plain text)
    enableStyling: false,
    textColorMode: "auto",
    // Border options (disabled by default)
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    // Background & overlay (disabled by default)
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    // Layout
    contentWidth: "narrow",
    // Typography
    textSize: "normal",
  },

  text: {
    body: "<p>Start writing your content here. You can add paragraphs, format text, and share your message with the world.</p>",
    // Master styling toggle (disabled by default for plain text)
    enableStyling: false,
    textColorMode: "auto", // Auto-detects from background
    // Border options (disabled by default)
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "", // Empty = use theme primary
    boxBackgroundColor: "", // Empty = use theme background
    boxBackgroundOpacity: 100,
    useThemeBackground: true, // Adapts to light/dark mode by default
    // Background & overlay (disabled by default)
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    // Layout
    contentWidth: "narrow",
    // Typography
    textSize: "normal",
  },

  markdown: {
    markdown: `# Hello World

Start writing your markdown content here.

## Features

- **Bold** and *italic* text
- [Links](https://example.com)
- Code blocks with syntax highlighting

\`\`\`javascript
const greeting = 'Hello, World!';
console.log(greeting);
\`\`\`
`,
    // Master styling toggle (disabled by default for plain markdown)
    enableStyling: false,
    textColorMode: "auto",
    // Border options (disabled by default)
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    // Background & overlay (disabled by default)
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    // Layout
    contentWidth: "narrow",
    // Typography
    textSize: "normal",
  },

  image: {
    src: "",
    alt: "Image description",
    caption: "",
    // Layout options
    imageWidth: 50,
    textWidth: 50,
    layout: "image-only",
    description: "",
    // Styling options (disabled by default)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
  },

  gallery: {
    images: [],
    aspectRatio: "1:1",
    layout: "grid",
    columns: "auto",
    gap: "medium",
    lightbox: false,
    autoRotate: false,
    autoRotateInterval: 5,
    showBorder: true,
    borderWidth: "thin",
    borderRadius: "medium",
    borderColor: "",
  },

  features: {
    // Optional section header
    sectionTitle: "",
    sectionSubtitle: "",
    features: [
      {
        icon: "star",
        title: "Feature One",
        description: "Describe your first key feature or benefit here.",
      },
      {
        icon: "zap",
        title: "Feature Two",
        description: "Highlight another important aspect of your offering.",
      },
      {
        icon: "shield",
        title: "Feature Three",
        description: "Share what makes you different from the competition.",
      },
    ],
    // Styling options (disabled by default - renders with fixed muted background)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    showCardBackground: true,
    cardBackgroundColor: "",
    textSize: "normal",
  },

  cta: {
    heading: "Ready to get started?",
    description:
      "Join thousands of satisfied customers and take the next step today.",
    buttonText: "Sign Up Now",
    buttonUrl: "#",
    // Styling options (disabled by default - renders with fixed primary background)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    textSize: "normal",
  },

  testimonials: {
    testimonials: [
      {
        quote:
          "This product has completely transformed how we work. Highly recommended!",
        author: "Jane Smith",
        role: "CEO, Example Corp",
        avatar: "",
      },
    ],
    // Styling options (disabled by default - renders with theme background)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    showCardBackground: true,
    cardBackgroundColor: "",
    textSize: "normal",
  },

  contact: {
    heading: "Get in Touch",
    description:
      "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    variant: "simple",
    // Styling options (disabled by default - renders with muted background)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    showFormBackground: true,
    formBackgroundColor: "",
    textSize: "normal",
  },

  footer: {
    copyright: "© 2025 Your Company. All rights reserved.",
    links: [
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Terms of Service", url: "/terms" },
    ],
    layout: "simple",
    // Styling options (disabled by default)
    enableStyling: false,
    textColorMode: "auto",
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 50,
    showBorder: false,
    borderWidth: "thin",
    borderColor: "",
    textSize: "normal",
    // Social links
    showSocialLinks: true,
    socialLinksPosition: "above",
    socialLinksAlignment: "center",
    socialLinksSize: "medium",
  },

  blog_featured: {
    postId: null,
    layout: "split",
    showFullContent: false,
    contentLimit: 0,
    showReadMore: true,
    showCategory: true,
    showAuthor: true,
    overlayColor: "#000000",
    overlayOpacity: 50,
  },

  blog_grid: {
    // Optional section header
    sectionTitle: "",
    sectionSubtitle: "",
    postCount: 6,
    showExcerpt: true,
    showAuthor: true,
    pageFilter: "current",
    // Image background (for contain fit mode)
    imageBackgroundMode: "muted",
    imageBackgroundColor: "",
    // Post card border
    cardBorderMode: "default",
    cardBorderColor: "",
    // Styling options (disabled by default - renders with theme background)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    showCardBackground: true,
    cardBackgroundColor: "",
    textSize: "normal",
  },

  blog: {
    mode: "featured",

    // Section header
    sectionTitle: "",
    sectionSubtitle: "",

    // Featured mode defaults
    postId: null,
    featuredLayout: "split",
    showFullContent: false,
    contentLimit: 0,
    showReadMore: true,

    // Grid mode defaults
    gridLayout: "grid",
    postCount: 6,
    columns: 3,
    showExcerpt: true,
    pageFilter: "current",

    // Shared display
    showCategory: true,
    showAuthor: true,
    showDate: true,
    imageFit: "cover",

    // Card styling
    cardBorderMode: "default",
    cardBorderColor: "",
    imageBackgroundMode: "muted",
    imageBackgroundColor: "",

    // SectionStyling (Featured now gets these!)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    showCardBackground: true,
    cardBackgroundColor: "",
    textSize: "normal",
    contentWidth: "medium",
  },

  embed: {
    embedCode: "",
    src: "",
    aspectRatio: "16:9",
    customHeight: 400,
    title: "",
    sourceType: "embed",
  },

  social_links: {
    title: "",
    subtitle: "",
    alignment: "center",
    size: "medium",
    iconStyle: "brand",
    // Styling options (disabled by default)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
  },

  product_grid: {
    // Optional section header
    sectionTitle: "",
    sectionSubtitle: "",
    // Items (empty by default, user adds them)
    items: [],
    // Card display options
    showItemTitles: true,
    showItemDescriptions: true,
    // Layout
    columns: 3,
    gap: "medium",
    // Icon styling
    iconStyle: "brand",
    // Block styling (disabled by default)
    enableStyling: false,
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    textColorMode: "auto",
    // Card styling
    showCardBackground: true,
    cardBackgroundColor: "",
    cardBackgroundOpacity: 100,
  },

  article: {
    body: "<p>Start writing your article here. Use the image button in the toolbar to add inline images that text will wrap around.</p>",
    // Image styling
    imageRounding: "medium",
    // Master styling toggle (disabled by default for plain article)
    enableStyling: false,
    textColorMode: "auto",
    // Border options (disabled by default)
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    // Background & overlay (disabled by default)
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    // Layout
    contentWidth: "medium",
    // Typography
    textSize: "normal",
  },

  cards: {
    // Template determines card type
    template: "feature",
    // Optional section header (all templates)
    sectionTitle: "",
    sectionSubtitle: "",
    // Default items (feature template)
    items: [
      {
        id: "card-1",
        icon: "star",
        title: "Feature One",
        description: "Describe your first key feature or benefit here.",
      } as FeatureCardItem,
      {
        id: "card-2",
        icon: "zap",
        title: "Feature Two",
        description: "Highlight another important aspect of your offering.",
      } as FeatureCardItem,
      {
        id: "card-3",
        icon: "shield",
        title: "Feature Three",
        description: "Share what makes you different from the competition.",
      } as FeatureCardItem,
    ],
    // Grid layout
    columns: 3,
    gap: "medium",
    // Styling options (disabled by default)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    showCardBackground: true,
    cardBackgroundColor: "",
    textSize: "normal",
    // Product template specific (included for completeness)
    iconStyle: "brand",
    showItemTitles: true,
    showItemDescriptions: true,
  },

  media: {
    // Mode determines which fields are active
    mode: "single",

    // ===== SINGLE MODE defaults =====
    src: "",
    alt: "Image description",
    caption: "",
    imageWidth: 50,
    textWidth: 50,
    layout: "image-only",
    description: "",

    // ===== GALLERY MODE defaults =====
    images: [],
    galleryAspectRatio: "1:1",
    galleryLayout: "grid",
    columns: "auto",
    gap: "medium",
    lightbox: false,
    autoRotate: false,
    autoRotateInterval: 5,

    // ===== EMBED MODE defaults =====
    embedCode: "",
    embedSrc: "",
    embedAspectRatio: "16:9",
    customHeight: 400,
    embedTitle: "",
    embedSourceType: "embed",

    // ===== Styling (shared, disabled by default) =====
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    textSize: "normal",
  },

  accordion: {
    // Mode determines which fields are active
    mode: "faq" as AccordionMode,

    // Section header (all modes)
    sectionTitle: "",
    sectionSubtitle: "",

    // Behavior settings (all modes)
    iconStyle: "chevron" as AccordionIconStyle,
    allowMultipleOpen: false,
    showExpandAll: true,
    defaultExpandFirst: true,

    // FAQ mode defaults
    faqItems: [
      {
        id: "faq-1",
        title: "What is your return policy?",
        content:
          "<p>We offer a 30-day money-back guarantee on all purchases. If you're not satisfied, simply contact our support team for a full refund.</p>",
      },
      {
        id: "faq-2",
        title: "How long does shipping take?",
        content:
          "<p>Standard shipping takes 5-7 business days. Express shipping options are available at checkout for faster delivery.</p>",
      },
      {
        id: "faq-3",
        title: "Do you offer customer support?",
        content:
          "<p>Yes! Our support team is available Monday through Friday, 9am-5pm EST. You can reach us via email or live chat.</p>",
      },
    ],
    showNumbering: false,

    // Curriculum mode defaults
    modules: [],
    showLessonCount: true,
    showTotalDuration: true,

    // Custom mode defaults
    customItems: [],

    // Styling (disabled by default)
    enableStyling: false,
    textColorMode: "auto",
    showBorder: false,
    borderWidth: "medium",
    borderRadius: "medium",
    borderColor: "",
    boxBackgroundColor: "",
    boxBackgroundOpacity: 100,
    useThemeBackground: true,
    backgroundImage: "",
    overlayColor: "#000000",
    overlayOpacity: 0,
    textSize: "normal",
  },
};

/**
 * Get the default content for a specific block type
 */
export function getDefaultContent<T extends BlockType>(
  blockType: T
): ContentTypeMap[T] {
  return sectionDefaults[blockType];
}
