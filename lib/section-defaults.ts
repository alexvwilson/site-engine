import type { BlockType } from "@/lib/drizzle/schema/sections";
import type { ContentTypeMap, HeadingLevel, HeadingAlignment, TextColorMode } from "./section-types";

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
    subheading: "Create something amazing with Site Engine",
    showCta: true,
    ctaText: "Get Started",
    ctaUrl: "#",
    titleMode: "static",
    rotatingTitle: {
      beforeText: "We specialize in",
      words: ["Design", "Development", "Marketing"],
      afterText: "",
      effect: "clip",
      displayTime: 2000,
      animationMode: "loop",
    },
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
  },

  blog_featured: {
    postId: null,
    layout: "split",
    showFullContent: false,
    contentLimit: 0,
    showReadMore: true,
    showCategory: true,
    overlayColor: "#000000",
    overlayOpacity: 50,
  },

  blog_grid: {
    postCount: 6,
    showExcerpt: true,
  },

  embed: {
    embedCode: "",
    src: "",
    aspectRatio: "16:9",
    customHeight: 400,
    title: "",
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
