import type { BlockType } from "@/lib/drizzle/schema/sections";
import type { ContentTypeMap } from "./section-types";

/**
 * A pre-designed template for a section block type.
 * Templates provide curated starting content that users can customize.
 */
export interface SectionTemplate<T extends BlockType = BlockType> {
  id: string;
  name: string;
  description: string;
  content: ContentTypeMap[T];
}

/**
 * Section templates organized by block type.
 * Each block type has multiple template variations.
 */
export const sectionTemplates: { [K in BlockType]: SectionTemplate<K>[] } = {
  // ============================================================================
  // Header Templates
  // ============================================================================
  header: [
    {
      id: "header-standard",
      name: "Standard",
      description: "Logo, navigation links, and CTA button",
      content: {
        siteName: "Your Site",
        logoUrl: "",
        links: [
          { label: "Home", url: "/" },
          { label: "About", url: "/about" },
          { label: "Services", url: "/services" },
          { label: "Contact", url: "/contact" },
        ],
        ctaText: "Get Started",
        ctaUrl: "#",
      },
    },
    {
      id: "header-minimal",
      name: "Minimal",
      description: "Clean header with just logo and links",
      content: {
        siteName: "Your Site",
        logoUrl: "",
        links: [
          { label: "Home", url: "/" },
          { label: "About", url: "/about" },
          { label: "Contact", url: "/contact" },
        ],
        ctaText: "",
        ctaUrl: "",
      },
    },
  ],

  // ============================================================================
  // Heading Templates
  // ============================================================================
  heading: [
    {
      id: "heading-page-title",
      name: "Page Title",
      description: "Centered H1 for page titles",
      content: {
        title: "About Us",
        subtitle: "Learn more about our story and mission",
        level: 1 as const,
        alignment: "center" as const,
        textColorMode: "auto" as const,
      },
    },
    {
      id: "heading-section",
      name: "Section Divider",
      description: "Left-aligned H2 for content sections",
      content: {
        title: "Our Services",
        subtitle: "",
        level: 2 as const,
        alignment: "left" as const,
        textColorMode: "auto" as const,
      },
    },
    {
      id: "heading-minimal",
      name: "Minimal",
      description: "Simple centered heading without subtitle",
      content: {
        title: "Welcome",
        subtitle: "",
        level: 1 as const,
        alignment: "center" as const,
        textColorMode: "auto" as const,
      },
    },
  ],

  // ============================================================================
  // Hero Templates
  // ============================================================================
  hero: [
    {
      id: "hero-centered",
      name: "Centered",
      description: "Classic centered layout with heading and CTA",
      content: {
        heading: "Build Something Amazing",
        subheading:
          "Create beautiful websites in minutes with our intuitive platform. No coding required.",
        ctaText: "Start Free Trial",
        ctaUrl: "#",
      },
    },
    {
      id: "hero-bold",
      name: "Bold Statement",
      description: "Large impactful heading with minimal text",
      content: {
        heading: "The Future Is Here",
        subheading: "Experience the next generation of web design.",
        ctaText: "Learn More",
        ctaUrl: "#",
      },
    },
    {
      id: "hero-tagline",
      name: "With Tagline",
      description: "Includes a tagline above the main heading",
      content: {
        heading: "Transform Your Business",
        subheading:
          "Join thousands of companies using our platform to grow faster, work smarter, and achieve more. Start your journey today.",
        ctaText: "Get Started Free",
        ctaUrl: "#",
      },
    },
    {
      id: "hero-product",
      name: "Product Launch",
      description: "Perfect for announcing a new product or feature",
      content: {
        heading: "Introducing Our Latest Innovation",
        subheading:
          "Designed for performance. Built for scale. Ready for your business.",
        ctaText: "See It In Action",
        ctaUrl: "#",
      },
    },
  ],

  // ============================================================================
  // Hero Primitive Templates (Unified hero/cta/heading)
  // ============================================================================
  hero_primitive: [
    {
      id: "hero-primitive-full",
      name: "Full Hero",
      description: "Complete hero with all features: images, rotating text, multiple buttons",
      content: {
        layout: "full" as const,
        heading: "Welcome to Your Site",
        subheading: "Create something amazing with our intuitive platform",
        textAlignment: "center" as const,
        buttons: [
          { id: "btn-1", text: "Get Started", url: "#", variant: "primary" as const },
          { id: "btn-2", text: "Learn More", url: "#about", variant: "secondary" as const },
        ],
        titleMode: "static" as const,
      },
    },
    {
      id: "hero-primitive-rotating",
      name: "Rotating Text Hero",
      description: "Animated hero with rotating words",
      content: {
        layout: "full" as const,
        heading: "",
        subheading: "Transform your business with cutting-edge solutions",
        textAlignment: "center" as const,
        buttons: [
          { id: "btn-1", text: "Start Now", url: "#", variant: "primary" as const },
        ],
        titleMode: "rotating" as const,
        rotatingTitle: {
          beforeText: "We build",
          words: ["websites", "apps", "brands", "experiences"],
          afterText: "that convert",
          effect: "clip" as const,
          displayTime: 2000,
          animationMode: "loop" as const,
        },
      },
    },
    {
      id: "hero-primitive-compact",
      name: "Compact Hero",
      description: "Smaller hero section, perfect for inner pages",
      content: {
        layout: "compact" as const,
        heading: "Page Title Here",
        subheading: "A brief description of what this page is about",
        textAlignment: "center" as const,
        buttons: [
          { id: "btn-1", text: "Take Action", url: "#", variant: "primary" as const },
        ],
      },
    },
    {
      id: "hero-primitive-cta",
      name: "Call to Action",
      description: "Conversion-focused section with prominent button",
      content: {
        layout: "cta" as const,
        heading: "Ready to Get Started?",
        subheading: "Join thousands of satisfied customers and take the next step today.",
        textAlignment: "center" as const,
        buttons: [
          { id: "btn-1", text: "Sign Up Free", url: "#", variant: "primary" as const },
        ],
      },
    },
    {
      id: "hero-primitive-cta-styled",
      name: "Styled CTA",
      description: "Call to action with custom background styling",
      content: {
        layout: "cta" as const,
        heading: "Transform Your Business Today",
        subheading: "Get instant access to powerful tools that will help you grow.",
        textAlignment: "center" as const,
        buttons: [
          { id: "btn-1", text: "Start Free Trial", url: "#", variant: "primary" as const },
        ],
        enableStyling: true,
        showBorder: true,
        borderRadius: "medium" as const,
        useThemeBackground: true,
      },
    },
    {
      id: "hero-primitive-title-h1",
      name: "Page Title (H1)",
      description: "Simple heading for page titles",
      content: {
        layout: "title-only" as const,
        heading: "Page Title",
        subheading: "Supporting text that provides context",
        textAlignment: "center" as const,
        headingLevel: 1 as const,
      },
    },
    {
      id: "hero-primitive-title-h2",
      name: "Section Heading (H2)",
      description: "Section divider heading",
      content: {
        layout: "title-only" as const,
        heading: "Section Title",
        subheading: "",
        textAlignment: "left" as const,
        headingLevel: 2 as const,
      },
    },
  ],

  // ============================================================================
  // Rich Text Templates (Unified visual/markdown/article)
  // ============================================================================
  richtext: [
    {
      id: "richtext-visual",
      name: "Visual Editor",
      description: "Rich text with WYSIWYG formatting",
      content: {
        mode: "visual" as const,
        body: "<h2>About Us</h2><p>We're a passionate team dedicated to creating exceptional experiences. Start editing this content using the visual editor toolbar above.</p><p>Format your text with <strong>bold</strong>, <em>italic</em>, and more.</p>",
      },
    },
    {
      id: "richtext-markdown",
      name: "Markdown",
      description: "Write content in Markdown with live preview",
      content: {
        mode: "markdown" as const,
        markdown: `# Welcome

Start writing your content in Markdown. You'll see a live preview as you type.

## Features

- **Bold** and *italic* text
- [Links](https://example.com)
- Lists and more

> Use blockquotes for emphasis.`,
      },
    },
    {
      id: "richtext-article",
      name: "Article",
      description: "Long-form content with inline images",
      content: {
        mode: "article" as const,
        body: "<h2>Article Title</h2><p>This is an article block that supports inline images. Use the image button in the toolbar to add photos that text will wrap around.</p><p>Perfect for blog posts, portfolios, and long-form content where you want images integrated with your text.</p>",
        imageRounding: "medium" as const,
      },
    },
    {
      id: "richtext-card",
      name: "Styled Card",
      description: "Bordered container with theme-aware background",
      content: {
        mode: "visual" as const,
        body: "<h2>Card Title</h2><p>This is a card-style block with a border and theme-aware background. Great for highlighting important content.</p>",
        enableStyling: true,
        textColorMode: "dark" as const,
        showBorder: true,
        borderWidth: "thin" as const,
        borderRadius: "medium" as const,
        useThemeBackground: true,
        contentWidth: "narrow" as const,
      },
    },
  ],

  // ============================================================================
  // Text Templates
  // ============================================================================
  text: [
    {
      id: "text-intro",
      name: "Introduction",
      description: "Welcome paragraph for about sections",
      content: {
        body: "<h2>About Us</h2><p>We're a passionate team dedicated to creating exceptional experiences. Founded with a vision to make technology accessible to everyone, we've grown into a trusted partner for businesses worldwide.</p><p>Our mission is simple: empower people to achieve more through innovative solutions and outstanding support.</p>",
      },
    },
    {
      id: "text-story",
      name: "Our Story",
      description: "Company history or background narrative",
      content: {
        body: "<h2>Our Story</h2><p>It all started with a simple idea: what if we could make things better? That question drove us to build something different.</p><p>Today, we're proud to serve customers across the globe, but we haven't forgotten our roots. We still approach every challenge with the same curiosity and determination that got us here.</p>",
      },
    },
    {
      id: "text-values",
      name: "Values & Mission",
      description: "Company values or mission statement",
      content: {
        body: "<h2>What We Believe</h2><p><strong>Quality First:</strong> We never compromise on quality. Every detail matters.</p><p><strong>Customer Focus:</strong> Your success is our success. We're here to help you win.</p><p><strong>Innovation:</strong> We're always looking for better ways to solve problems.</p>",
      },
    },
    {
      id: "text-card",
      name: "Card",
      description: "Bordered container that adapts to light/dark mode",
      content: {
        body: "<h2>Card Title</h2><p>This is a card-style text block with a border and theme-aware background. Great for highlighting important content or creating visual separation between sections.</p>",
        enableStyling: true,
        textColorMode: "dark",
        showBorder: true,
        borderWidth: "thin",
        borderRadius: "medium",
        borderColor: "",
        useThemeBackground: true,
        boxBackgroundOpacity: 100,
        overlayColor: "#F5F5F5",
        overlayOpacity: 50,
        contentWidth: "narrow",
        textSize: "normal",
      },
    },
    {
      id: "text-featured",
      name: "Featured",
      description: "Background image with dark overlay",
      content: {
        body: "<h2>Featured Content</h2><p>Add a background image to create an impactful featured section. The overlay ensures your text remains readable against any background.</p>",
        enableStyling: true,
        textColorMode: "light",
        showBorder: false,
        backgroundImage: "",
        overlayColor: "#000000",
        overlayOpacity: 50,
        contentWidth: "medium",
        textSize: "large",
      },
    },
    {
      id: "text-highlight",
      name: "Highlight",
      description: "Accent border with tinted background",
      content: {
        body: "<h2>Important Notice</h2><p>Use this style to highlight important information that needs to stand out from the rest of your content. The accent border draws attention while the tinted background provides visual separation.</p>",
        enableStyling: true,
        textColorMode: "dark",
        showBorder: true,
        borderWidth: "thick",
        borderRadius: "none",
        borderColor: "",
        useThemeBackground: false,
        boxBackgroundColor: "#EFF6FF",
        boxBackgroundOpacity: 100,
        overlayColor: "",
        overlayOpacity: 0,
        contentWidth: "narrow",
        textSize: "normal",
      },
    },
  ],

  // ============================================================================
  // Markdown Templates
  // ============================================================================
  markdown: [
    {
      id: "markdown-blank",
      name: "Blank",
      description: "Empty markdown block",
      content: {
        markdown: "",
      },
    },
    {
      id: "markdown-article",
      name: "Article",
      description: "Blog post or article format",
      content: {
        markdown: `# Article Title

Write your introduction paragraph here. This template is perfect for blog posts, articles, or any long-form content.

## Section Heading

Add your content with **bold**, *italic*, and [links](https://example.com).

### Subsection

- Bullet point one
- Bullet point two
- Bullet point three

> This is a blockquote for highlighting important quotes or callouts.

## Conclusion

Wrap up your article with a conclusion paragraph.`,
      },
    },
    {
      id: "markdown-documentation",
      name: "Documentation",
      description: "Technical documentation with code examples",
      content: {
        markdown: `# Getting Started

Welcome to the documentation. Follow these steps to get started.

## Installation

\`\`\`bash
npm install your-package
\`\`\`

## Usage

\`\`\`typescript
import { something } from 'your-package';

const result = something();
console.log(result);
\`\`\`

## API Reference

| Method | Description | Returns |
|--------|-------------|---------|
| \`init()\` | Initialize the library | \`void\` |
| \`getData()\` | Fetch data | \`Promise<Data>\` |

## Notes

- [x] Feature one is complete
- [x] Feature two is complete
- [ ] Feature three is in progress`,
      },
    },
    {
      id: "markdown-code-snippet",
      name: "Code Snippet",
      description: "Focused code example with explanation",
      content: {
        markdown: `## Code Example

Here's how to implement this feature:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Usage
const message = greet('World');
console.log(message); // Output: Hello, World!
\`\`\`

**Key points:**
- The function takes a \`name\` parameter
- It returns a formatted greeting string
- Template literals make string interpolation easy`,
      },
    },
  ],

  // ============================================================================
  // Image Templates
  // ============================================================================
  image: [
    {
      id: "image-simple",
      name: "Simple",
      description: "Clean image with optional caption",
      content: {
        src: "",
        alt: "Image description",
        caption: "",
        imageWidth: 50,
        layout: "image-only",
      },
    },
    {
      id: "image-small",
      name: "Small",
      description: "Small image for profiles or thumbnails",
      content: {
        src: "",
        alt: "Image description",
        caption: "",
        imageWidth: 25,
        layout: "image-only",
      },
    },
    {
      id: "image-card",
      name: "Card",
      description: "Image with description in a styled card",
      content: {
        src: "",
        alt: "Image description",
        caption: "",
        imageWidth: 50,
        layout: "image-top",
        description:
          "<p>Add a detailed description of your image here. This text appears below the image in a card-style layout.</p>",
        enableStyling: true,
        showBorder: true,
        borderWidth: "thin",
        borderRadius: "medium",
        borderColor: "",
      },
    },
    {
      id: "image-feature",
      name: "Feature Image",
      description: "Side-by-side image and text layout (50/50)",
      content: {
        src: "",
        alt: "Feature image",
        caption: "",
        imageWidth: 50,
        textWidth: 50,
        layout: "image-left",
        description:
          "<h2>Feature Title</h2><p>Describe this feature or showcase item. The text appears alongside the image on desktop and below on mobile devices.</p>",
      },
    },
    {
      id: "image-profile",
      name: "Profile",
      description: "Small image with larger text area",
      content: {
        src: "",
        alt: "Profile image",
        caption: "",
        imageWidth: 25,
        textWidth: 75,
        layout: "image-left",
        description:
          "<h2>Name Here</h2><p>Bio or description text goes here. Great for team member profiles, about sections, or author bios.</p>",
      },
    },
    {
      id: "image-banner",
      name: "Full-width Banner",
      description: "Edge-to-edge image with overlay",
      content: {
        src: "",
        alt: "Banner image",
        caption: "",
        imageWidth: 100,
        layout: "image-only",
        enableStyling: true,
        overlayColor: "#000000",
        overlayOpacity: 30,
      },
    },
  ],

  // ============================================================================
  // Gallery Templates
  // ============================================================================
  gallery: [
    {
      id: "gallery-portfolio",
      name: "Portfolio",
      description: "Masonry layout for showcasing work",
      content: {
        images: [],
        aspectRatio: "original",
        layout: "masonry",
        columns: 3,
        gap: "medium",
        lightbox: true,
      },
    },
    {
      id: "gallery-team",
      name: "Team Photos",
      description: "Grid of square portraits",
      content: {
        images: [],
        aspectRatio: "1:1",
        layout: "grid",
        columns: 4,
        gap: "medium",
        lightbox: true,
      },
    },
    {
      id: "gallery-showcase",
      name: "Product Showcase",
      description: "Carousel for featured images",
      content: {
        images: [],
        aspectRatio: "16:9",
        layout: "carousel",
        columns: 3,
        gap: "medium",
        lightbox: true,
        autoRotate: true,
        autoRotateInterval: 5,
      },
    },
    {
      id: "gallery-simple",
      name: "Simple Grid",
      description: "Basic responsive grid layout",
      content: {
        images: [],
        aspectRatio: "4:3",
        layout: "grid",
        columns: "auto",
        gap: "medium",
        lightbox: false,
      },
    },
  ],

  // ============================================================================
  // Features Templates
  // ============================================================================
  features: [
    {
      id: "features-benefits",
      name: "Key Benefits",
      description: "Highlight 3 main benefits",
      content: {
        features: [
          {
            icon: "zap",
            title: "Lightning Fast",
            description:
              "Experience blazing fast performance that keeps you ahead of the competition.",
          },
          {
            icon: "shield",
            title: "Secure & Reliable",
            description:
              "Enterprise-grade security you can trust. Your data is always protected.",
          },
          {
            icon: "heart",
            title: "Built with Care",
            description:
              "Crafted with attention to every detail. Quality you can feel.",
          },
        ],
      },
    },
    {
      id: "features-how-it-works",
      name: "How It Works",
      description: "Step-by-step process explanation",
      content: {
        features: [
          {
            icon: "user-plus",
            title: "1. Sign Up",
            description:
              "Create your free account in seconds. No credit card required.",
          },
          {
            icon: "settings",
            title: "2. Customize",
            description:
              "Configure your settings and personalize your experience.",
          },
          {
            icon: "rocket",
            title: "3. Launch",
            description:
              "Go live and start seeing results immediately.",
          },
        ],
      },
    },
    {
      id: "features-services",
      name: "Services",
      description: "Showcase your service offerings",
      content: {
        features: [
          {
            icon: "palette",
            title: "Design",
            description:
              "Beautiful, intuitive designs that engage and convert visitors.",
          },
          {
            icon: "code",
            title: "Development",
            description:
              "Clean, efficient code built with the latest technologies.",
          },
          {
            icon: "trending-up",
            title: "Growth",
            description:
              "Strategic solutions to help your business scale and succeed.",
          },
        ],
      },
    },
    {
      id: "features-four-column",
      name: "Four Features",
      description: "Extended feature grid with 4 items",
      content: {
        features: [
          {
            icon: "clock",
            title: "Save Time",
            description: "Automate repetitive tasks and focus on what matters.",
          },
          {
            icon: "dollar-sign",
            title: "Reduce Costs",
            description: "Optimize resources and maximize your ROI.",
          },
          {
            icon: "users",
            title: "Team Collaboration",
            description: "Work together seamlessly from anywhere.",
          },
          {
            icon: "bar-chart",
            title: "Analytics",
            description: "Make data-driven decisions with powerful insights.",
          },
        ],
      },
    },
  ],

  // ============================================================================
  // CTA Templates
  // ============================================================================
  cta: [
    {
      id: "cta-signup",
      name: "Sign Up",
      description: "Encourage users to create an account",
      content: {
        heading: "Ready to Get Started?",
        description:
          "Join thousands of satisfied customers. Start your free trial today and see the difference.",
        buttonText: "Start Free Trial",
        buttonUrl: "#",
      },
    },
    {
      id: "cta-contact",
      name: "Contact Us",
      description: "Invite users to get in touch",
      content: {
        heading: "Let's Talk",
        description:
          "Have questions? Our team is here to help. Reach out and we'll get back to you within 24 hours.",
        buttonText: "Contact Us",
        buttonUrl: "#contact",
      },
    },
    {
      id: "cta-demo",
      name: "Book Demo",
      description: "Schedule a product demonstration",
      content: {
        heading: "See It In Action",
        description:
          "Schedule a personalized demo with our team and discover how we can help you achieve your goals.",
        buttonText: "Book a Demo",
        buttonUrl: "#",
      },
    },
  ],

  // ============================================================================
  // Testimonials Templates
  // ============================================================================
  testimonials: [
    {
      id: "testimonials-single",
      name: "Featured Quote",
      description: "Single prominent testimonial",
      content: {
        testimonials: [
          {
            quote:
              "This platform completely transformed how we do business. The results speak for themselves - 40% increase in productivity within the first month.",
            author: "Sarah Johnson",
            role: "CEO, TechStart Inc.",
            avatar: "",
          },
        ],
      },
    },
    {
      id: "testimonials-multiple",
      name: "Customer Stories",
      description: "Multiple testimonials from different customers",
      content: {
        testimonials: [
          {
            quote:
              "The best investment we've made for our team. Highly recommended!",
            author: "Michael Chen",
            role: "Product Manager, Innovate Co",
            avatar: "",
          },
          {
            quote:
              "Incredible support and an amazing product. Our workflow has never been smoother.",
            author: "Emily Rodriguez",
            role: "Founder, Creative Labs",
            avatar: "",
          },
          {
            quote:
              "We tried many solutions before finding this one. Nothing else comes close.",
            author: "David Park",
            role: "CTO, Growth Dynamics",
            avatar: "",
          },
        ],
      },
    },
    {
      id: "testimonials-detailed",
      name: "Case Study Style",
      description: "Longer testimonial with more context",
      content: {
        testimonials: [
          {
            quote:
              "When we started looking for a solution, we had specific requirements that seemed impossible to meet. Not only did this platform deliver on all of them, but it exceeded our expectations in ways we didn't anticipate. The ROI has been remarkable.",
            author: "Jennifer Walsh",
            role: "Director of Operations, Enterprise Solutions",
            avatar: "",
          },
        ],
      },
    },
  ],

  // ============================================================================
  // Contact Templates
  // ============================================================================
  contact: [
    {
      id: "contact-simple",
      name: "Simple",
      description: "Name, Email, and Message fields",
      content: {
        heading: "Get in Touch",
        description:
          "Have a question or want to work together? Fill out the form below and we'll get back to you soon.",
        variant: "simple",
      },
    },
    {
      id: "contact-detailed",
      name: "Detailed",
      description: "Includes Company and Phone fields",
      content: {
        heading: "Contact Us",
        description:
          "Tell us about your project and we'll schedule a call to discuss how we can help.",
        variant: "detailed",
      },
    },
  ],

  // ============================================================================
  // Footer Templates
  // ============================================================================
  footer: [
    {
      id: "footer-standard",
      name: "Standard",
      description: "Copyright with policy links",
      content: {
        copyright: "© 2025 Your Company. All rights reserved.",
        links: [
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms of Service", url: "/terms" },
        ],
      },
    },
    {
      id: "footer-extended",
      name: "Extended",
      description: "Additional navigation links",
      content: {
        copyright: "© 2025 Your Company. All rights reserved.",
        links: [
          { label: "About", url: "/about" },
          { label: "Contact", url: "/contact" },
          { label: "Privacy", url: "/privacy" },
          { label: "Terms", url: "/terms" },
        ],
      },
    },
  ],

  // Blog blocks are data-driven, no templates needed
  blog_featured: [],
  blog_grid: [],

  // Blog primitive templates
  blog: [
    // Featured mode templates
    {
      id: "blog-hero-spotlight",
      name: "Hero Spotlight",
      description: "Full-width background with overlay for featured article",
      content: {
        mode: "featured",
        featuredLayout: "hero",
        showFullContent: false,
        contentLimit: 200,
        showReadMore: true,
        showCategory: true,
        showAuthor: true,
        showDate: true,
        overlayColor: "#000000",
        overlayOpacity: 50,
        enableStyling: false,
      },
    },
    {
      id: "blog-split-feature",
      name: "Split Feature",
      description: "Image left, content right - classic blog featured style",
      content: {
        mode: "featured",
        featuredLayout: "split",
        showFullContent: false,
        contentLimit: 300,
        showReadMore: true,
        showCategory: true,
        showAuthor: true,
        showDate: true,
        imageFit: "cover",
        enableStyling: false,
      },
    },
    {
      id: "blog-stacked-highlight",
      name: "Stacked Highlight",
      description: "Image top, content below - works well in narrow columns",
      content: {
        mode: "featured",
        featuredLayout: "stacked",
        showFullContent: false,
        contentLimit: 250,
        showReadMore: true,
        showCategory: true,
        showAuthor: true,
        showDate: true,
        imageFit: "cover",
        enableStyling: false,
      },
    },
    {
      id: "blog-minimal-quote",
      name: "Minimal Quote",
      description: "Text only, large typography style",
      content: {
        mode: "featured",
        featuredLayout: "minimal",
        showFullContent: true,
        contentLimit: 0,
        showReadMore: false,
        showCategory: true,
        showAuthor: true,
        showDate: true,
        enableStyling: false,
      },
    },
    // Grid mode templates
    {
      id: "blog-standard-grid",
      name: "Standard Blog Grid",
      description: "3 posts in 3 columns with excerpts and author",
      content: {
        mode: "grid",
        gridLayout: "grid",
        postCount: 3,
        columns: 3,
        showExcerpt: true,
        showCategory: true,
        showAuthor: true,
        showDate: true,
        pageFilter: "current",
        cardBorderMode: "default",
        enableStyling: false,
      },
    },
    {
      id: "blog-compact-overview",
      name: "Compact Overview",
      description: "6 posts, no excerpts - quick overview of recent content",
      content: {
        mode: "grid",
        gridLayout: "grid",
        postCount: 6,
        columns: 3,
        showExcerpt: false,
        showCategory: true,
        showAuthor: false,
        showDate: true,
        pageFilter: "all",
        cardBorderMode: "default",
        enableStyling: false,
      },
    },
    {
      id: "blog-two-column-cards",
      name: "Two-Column Cards",
      description: "2 large cards per row for more visual impact",
      content: {
        mode: "grid",
        gridLayout: "grid",
        postCount: 6,
        columns: 2,
        showExcerpt: true,
        showCategory: true,
        showAuthor: true,
        showDate: true,
        pageFilter: "current",
        cardBorderMode: "default",
        enableStyling: false,
      },
    },
    {
      id: "blog-magazine-layout",
      name: "Magazine Layout",
      description: "First post large, rest in smaller grid - editorial feel",
      content: {
        mode: "grid",
        gridLayout: "magazine",
        postCount: 6,
        columns: 3,
        showExcerpt: true,
        showCategory: true,
        showAuthor: true,
        showDate: true,
        pageFilter: "all",
        cardBorderMode: "default",
        enableStyling: false,
      },
    },
    {
      id: "blog-list-view",
      name: "List View",
      description: "Single column, horizontal cards with image left",
      content: {
        mode: "grid",
        gridLayout: "list",
        postCount: 6,
        columns: 3,
        showExcerpt: true,
        showCategory: true,
        showAuthor: true,
        showDate: true,
        pageFilter: "current",
        cardBorderMode: "default",
        enableStyling: false,
      },
    },
  ],

  // Social links block - uses site-level social links, no templates needed
  social_links: [],

  // Product grid templates
  product_grid: [
    {
      id: "product-grid-music-catalog",
      name: "Music Catalog",
      description: "Display albums with streaming links",
      content: {
        sectionTitle: "Our Music",
        sectionSubtitle: "Listen on your favorite platform",
        items: [],
        columns: 3,
        gap: "medium",
        iconStyle: "brand",
      },
    },
    {
      id: "product-grid-portfolio",
      name: "Portfolio Showcase",
      description: "Display projects or products with action links",
      content: {
        sectionTitle: "Our Work",
        sectionSubtitle: "",
        items: [],
        columns: 4,
        gap: "medium",
        iconStyle: "monochrome",
      },
    },
  ],

  // Embed templates
  embed: [
    {
      id: "embed-youtube",
      name: "YouTube Video",
      description: "Embed a YouTube video (16:9 aspect ratio)",
      content: {
        embedCode: "",
        src: "",
        aspectRatio: "16:9",
        customHeight: 400,
        title: "YouTube video",
      },
    },
    {
      id: "embed-google-maps",
      name: "Google Maps",
      description: "Embed a Google Maps location (4:3 aspect ratio)",
      content: {
        embedCode: "",
        src: "",
        aspectRatio: "4:3",
        customHeight: 450,
        title: "Location map",
      },
    },
    {
      id: "embed-blank",
      name: "Blank",
      description: "Empty embed block",
      content: {
        embedCode: "",
        src: "",
        aspectRatio: "16:9",
        customHeight: 400,
        title: "",
      },
    },
  ],

  // ============================================================================
  // Article Templates
  // ============================================================================
  article: [
    {
      id: "article-basic",
      name: "Basic Article",
      description: "Simple article layout for long-form content",
      content: {
        body: "<h2>Article Title</h2><p>Start writing your article here. Use the toolbar to format text, add headings, lists, and insert images that text can wrap around.</p><p>The article block is designed for longer content like blog posts, news articles, or documentation. Add inline images using the image button in the toolbar.</p>",
        contentWidth: "medium",
        textSize: "normal",
      },
    },
    {
      id: "article-tutorial",
      name: "Tutorial",
      description: "Step-by-step guide with sections",
      content: {
        body: "<h2>Getting Started Guide</h2><p>Welcome to this tutorial. Follow the steps below to get started.</p><h3>Step 1: Setup</h3><p>Begin by setting up your environment. Make sure you have all the necessary tools installed.</p><h3>Step 2: Configuration</h3><p>Configure your settings according to your needs. You can customize various options to match your preferences.</p><h3>Step 3: Implementation</h3><p>Now you're ready to implement. Follow the guidelines below for best practices.</p><blockquote>Tip: Take your time with each step. It's better to understand fully than to rush through.</blockquote>",
        contentWidth: "medium",
        textSize: "normal",
      },
    },
    {
      id: "article-featured",
      name: "Featured Article",
      description: "Article with background image and overlay",
      content: {
        body: "<h2>Featured Story</h2><p>This template is perfect for featured articles that need to stand out. Add a background image and adjust the overlay to ensure text readability.</p><p>The light text mode makes your content pop against darker backgrounds, creating a dramatic visual effect for important stories.</p>",
        enableStyling: true,
        textColorMode: "light" as const,
        showBorder: false,
        backgroundImage: "",
        overlayColor: "#000000",
        overlayOpacity: 50,
        contentWidth: "medium",
        textSize: "large",
      },
    },
    {
      id: "article-card",
      name: "Card Style",
      description: "Article in a bordered card container",
      content: {
        body: "<h2>Card Article</h2><p>This article style features a subtle border and background, making it stand out from the surrounding content. Great for highlighting important information or creating visual separation.</p><p>The card adapts to your theme's light or dark mode automatically.</p>",
        enableStyling: true,
        textColorMode: "auto" as const,
        showBorder: true,
        borderWidth: "thin" as const,
        borderRadius: "medium" as const,
        borderColor: "",
        useThemeBackground: true,
        boxBackgroundOpacity: 100,
        contentWidth: "medium",
        textSize: "normal",
      },
    },
  ],

  // ============================================================================
  // Cards Templates (Unified cards primitive with template switching)
  // ============================================================================
  cards: [
    {
      id: "cards-feature-benefits",
      name: "Key Benefits",
      description: "Feature cards highlighting main benefits",
      content: {
        template: "feature" as const,
        sectionTitle: "",
        sectionSubtitle: "",
        items: [
          {
            id: "card-1",
            icon: "zap",
            title: "Lightning Fast",
            description:
              "Experience blazing fast performance that keeps you ahead of the competition.",
          },
          {
            id: "card-2",
            icon: "shield",
            title: "Secure & Reliable",
            description:
              "Enterprise-grade security you can trust. Your data is always protected.",
          },
          {
            id: "card-3",
            icon: "heart",
            title: "Built with Care",
            description:
              "Crafted with attention to every detail. Quality you can feel.",
          },
        ],
        columns: 3,
        gap: "medium",
      },
    },
    {
      id: "cards-feature-how-it-works",
      name: "How It Works",
      description: "Step-by-step process explanation",
      content: {
        template: "feature" as const,
        sectionTitle: "How It Works",
        sectionSubtitle: "Simple steps to get started",
        items: [
          {
            id: "card-1",
            icon: "user-plus",
            title: "1. Sign Up",
            description:
              "Create your free account in seconds. No credit card required.",
          },
          {
            id: "card-2",
            icon: "settings",
            title: "2. Customize",
            description:
              "Configure your settings and personalize your experience.",
          },
          {
            id: "card-3",
            icon: "rocket",
            title: "3. Launch",
            description: "Go live and start seeing results immediately.",
          },
        ],
        columns: 3,
        gap: "medium",
      },
    },
    {
      id: "cards-testimonial-single",
      name: "Featured Quote",
      description: "Single prominent testimonial",
      content: {
        template: "testimonial" as const,
        sectionTitle: "",
        sectionSubtitle: "",
        items: [
          {
            id: "card-1",
            quote:
              "This platform completely transformed how we do business. The results speak for themselves - 40% increase in productivity within the first month.",
            author: "Sarah Johnson",
            role: "CEO, TechStart Inc.",
            avatar: "",
          },
        ],
        columns: 3,
        gap: "medium",
      },
    },
    {
      id: "cards-testimonial-multiple",
      name: "Customer Stories",
      description: "Multiple testimonials from different customers",
      content: {
        template: "testimonial" as const,
        sectionTitle: "What Our Customers Say",
        sectionSubtitle: "",
        items: [
          {
            id: "card-1",
            quote:
              "The best investment we've made for our team. Highly recommended!",
            author: "Michael Chen",
            role: "Product Manager, Innovate Co",
            avatar: "",
          },
          {
            id: "card-2",
            quote:
              "Incredible support and an amazing product. Our workflow has never been smoother.",
            author: "Emily Rodriguez",
            role: "Founder, Creative Labs",
            avatar: "",
          },
          {
            id: "card-3",
            quote:
              "We tried many solutions before finding this one. Nothing else comes close.",
            author: "David Park",
            role: "CTO, Growth Dynamics",
            avatar: "",
          },
        ],
        columns: 3,
        gap: "medium",
      },
    },
    {
      id: "cards-product-music",
      name: "Music Catalog",
      description: "Display albums with streaming links",
      content: {
        template: "product" as const,
        sectionTitle: "Our Music",
        sectionSubtitle: "Listen on your favorite platform",
        items: [],
        columns: 3,
        gap: "medium",
        iconStyle: "brand" as const,
        showItemTitles: true,
        showItemDescriptions: true,
      },
    },
    {
      id: "cards-product-portfolio",
      name: "Portfolio Showcase",
      description: "Display projects or products with action links",
      content: {
        template: "product" as const,
        sectionTitle: "Our Work",
        sectionSubtitle: "",
        items: [],
        columns: 4,
        gap: "medium",
        iconStyle: "monochrome" as const,
        showItemTitles: true,
        showItemDescriptions: true,
      },
    },
  ],

  // ============================================================================
  // Media Templates (unified image/gallery/embed)
  // ============================================================================
  media: [
    // Single Image Templates
    {
      id: "media-image-simple",
      name: "Simple Image",
      description: "Single image with optional caption",
      content: {
        mode: "single" as const,
        src: "",
        alt: "Image description",
        caption: "",
        imageWidth: 100,
        layout: "image-only" as const,
      },
    },
    {
      id: "media-image-with-text",
      name: "Image with Text",
      description: "Image alongside descriptive text",
      content: {
        mode: "single" as const,
        src: "",
        alt: "Image description",
        caption: "",
        imageWidth: 50,
        textWidth: 50,
        layout: "image-left" as const,
        description: "<p>Add your description here...</p>",
      },
    },
    {
      id: "media-image-profile",
      name: "Profile Image",
      description: "Profile photo with bio text",
      content: {
        mode: "single" as const,
        src: "",
        alt: "Profile photo",
        imageWidth: 25,
        textWidth: 75,
        layout: "image-left" as const,
        description: "<p>Tell your story...</p>",
        enableStyling: true,
        showBorder: true,
        borderWidth: "thin" as const,
        borderRadius: "full" as const,
      },
    },
    // Gallery Templates
    {
      id: "media-gallery-grid",
      name: "Photo Grid",
      description: "Grid layout for multiple images",
      content: {
        mode: "gallery" as const,
        images: [],
        galleryAspectRatio: "1:1" as const,
        galleryLayout: "grid" as const,
        columns: "auto" as const,
        gap: "medium" as const,
        lightbox: true,
      },
    },
    {
      id: "media-gallery-masonry",
      name: "Masonry Gallery",
      description: "Pinterest-style masonry layout",
      content: {
        mode: "gallery" as const,
        images: [],
        galleryAspectRatio: "original" as const,
        galleryLayout: "masonry" as const,
        columns: 3,
        gap: "small" as const,
        lightbox: true,
      },
    },
    {
      id: "media-gallery-carousel",
      name: "Image Carousel",
      description: "Sliding carousel with auto-rotate",
      content: {
        mode: "gallery" as const,
        images: [],
        galleryAspectRatio: "16:9" as const,
        galleryLayout: "carousel" as const,
        autoRotate: true,
        autoRotateInterval: 5,
        lightbox: false,
      },
    },
    // Embed Templates
    {
      id: "media-embed-video",
      name: "Video Embed",
      description: "YouTube or Vimeo video embed",
      content: {
        mode: "embed" as const,
        embedCode: "",
        embedSrc: "",
        embedAspectRatio: "16:9" as const,
        embedTitle: "",
        embedSourceType: "embed" as const,
      },
    },
    {
      id: "media-embed-map",
      name: "Map Embed",
      description: "Google Maps or location embed",
      content: {
        mode: "embed" as const,
        embedCode: "",
        embedSrc: "",
        embedAspectRatio: "4:3" as const,
        embedTitle: "Location",
        embedSourceType: "embed" as const,
      },
    },
    {
      id: "media-embed-pdf",
      name: "PDF Document",
      description: "Embedded PDF viewer",
      content: {
        mode: "embed" as const,
        embedCode: "",
        embedSrc: "",
        embedAspectRatio: "letter" as const,
        embedTitle: "Document",
        embedSourceType: "pdf" as const,
      },
    },
  ],

  // ============================================================================
  // Accordion Templates
  // ============================================================================
  accordion: [
    // FAQ Templates
    {
      id: "accordion-faq-simple",
      name: "FAQ - Simple",
      description: "Clean FAQ section with chevron icons",
      content: {
        mode: "faq" as const,
        sectionTitle: "Frequently Asked Questions",
        sectionSubtitle: "Find answers to common questions",
        iconStyle: "chevron" as const,
        allowMultipleOpen: false,
        showExpandAll: true,
        defaultExpandFirst: true,
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
        modules: [],
        showLessonCount: true,
        showTotalDuration: true,
        customItems: [],
        enableStyling: false,
      },
    },
    {
      id: "accordion-faq-styled",
      name: "FAQ - Styled Card",
      description: "FAQ with border and background styling",
      content: {
        mode: "faq" as const,
        sectionTitle: "Common Questions",
        sectionSubtitle: "",
        iconStyle: "plus-minus" as const,
        allowMultipleOpen: true,
        showExpandAll: false,
        defaultExpandFirst: false,
        faqItems: [
          {
            id: "faq-1",
            title: "How do I get started?",
            content:
              "<p>Getting started is easy! Simply sign up for an account and follow our step-by-step onboarding guide.</p>",
          },
          {
            id: "faq-2",
            title: "What payment methods do you accept?",
            content:
              "<p>We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.</p>",
          },
          {
            id: "faq-3",
            title: "Can I cancel my subscription?",
            content:
              "<p>Yes, you can cancel your subscription at any time from your account settings. No questions asked.</p>",
          },
        ],
        showNumbering: false,
        modules: [],
        showLessonCount: true,
        showTotalDuration: true,
        customItems: [],
        enableStyling: true,
        showBorder: true,
        borderWidth: "thin" as const,
        borderRadius: "medium" as const,
        textColorMode: "auto" as const,
      },
    },
    {
      id: "accordion-faq-numbered",
      name: "FAQ - Numbered",
      description: "FAQ with numbered questions",
      content: {
        mode: "faq" as const,
        sectionTitle: "Help Center",
        sectionSubtitle: "Top questions answered",
        iconStyle: "chevron" as const,
        allowMultipleOpen: false,
        showExpandAll: true,
        defaultExpandFirst: true,
        faqItems: [
          {
            id: "faq-1",
            title: "How do I reset my password?",
            content:
              "<p>Click on 'Forgot Password' on the login page and enter your email. We'll send you a reset link within minutes.</p>",
          },
          {
            id: "faq-2",
            title: "How do I update my billing information?",
            content:
              "<p>Go to Account Settings → Billing to update your payment method or billing address.</p>",
          },
          {
            id: "faq-3",
            title: "Where can I find my invoices?",
            content:
              "<p>All invoices are available in your Account Settings under the Billing History section.</p>",
          },
        ],
        showNumbering: true,
        modules: [],
        showLessonCount: true,
        showTotalDuration: true,
        customItems: [],
        enableStyling: false,
      },
    },
    // Curriculum Template
    {
      id: "accordion-curriculum",
      name: "Course Curriculum",
      description: "Course outline with modules and lessons",
      content: {
        mode: "curriculum" as const,
        sectionTitle: "Course Curriculum",
        sectionSubtitle: "3 modules · 12 lessons · 2.5 hours",
        iconStyle: "chevron" as const,
        allowMultipleOpen: true,
        showExpandAll: true,
        defaultExpandFirst: true,
        faqItems: [],
        showNumbering: false,
        modules: [
          {
            id: "mod-1",
            title: "Module 1: Getting Started",
            description: "Learn the fundamentals",
            lessons: [
              { id: "l1-1", title: "Welcome & Introduction", duration: "5:00", isCompleted: true },
              { id: "l1-2", title: "Setting Up Your Environment", duration: "12:00", isCompleted: true },
              { id: "l1-3", title: "Your First Project", duration: "15:00", isCompleted: false },
            ],
          },
          {
            id: "mod-2",
            title: "Module 2: Core Concepts",
            description: "Deep dive into the essentials",
            lessons: [
              { id: "l2-1", title: "Understanding the Basics", duration: "18:00", isLocked: false },
              { id: "l2-2", title: "Advanced Techniques", duration: "22:00", isLocked: false },
              { id: "l2-3", title: "Best Practices", duration: "14:00", isLocked: false },
            ],
          },
          {
            id: "mod-3",
            title: "Module 3: Advanced Topics",
            description: "Take your skills to the next level",
            lessons: [
              { id: "l3-1", title: "Performance Optimization", duration: "20:00", isLocked: true },
              { id: "l3-2", title: "Scaling Your Project", duration: "25:00", isLocked: true },
              { id: "l3-3", title: "Final Project", duration: "30:00", isLocked: true },
            ],
          },
        ],
        showLessonCount: true,
        showTotalDuration: true,
        customItems: [],
        enableStyling: false,
      },
    },
    // Custom Templates
    {
      id: "accordion-specs",
      name: "Product Specifications",
      description: "Technical specs in collapsible categories",
      content: {
        mode: "custom" as const,
        sectionTitle: "Specifications",
        sectionSubtitle: "",
        iconStyle: "plus-minus" as const,
        allowMultipleOpen: true,
        showExpandAll: false,
        defaultExpandFirst: false,
        faqItems: [],
        showNumbering: false,
        modules: [],
        showLessonCount: false,
        showTotalDuration: false,
        customItems: [
          {
            id: "spec-1",
            title: "Dimensions & Weight",
            content:
              "<ul><li>Height: 5.78 inches</li><li>Width: 2.82 inches</li><li>Depth: 0.31 inches</li><li>Weight: 6.14 ounces</li></ul>",
          },
          {
            id: "spec-2",
            title: "Display",
            content:
              "<ul><li>6.1-inch Super Retina XDR display</li><li>2532x1170 resolution at 460 ppi</li><li>HDR display with True Tone</li></ul>",
          },
          {
            id: "spec-3",
            title: "Battery & Charging",
            content:
              "<ul><li>Up to 20 hours video playback</li><li>Fast-charge capable</li><li>Wireless charging</li></ul>",
          },
        ],
        enableStyling: true,
        showBorder: true,
        borderWidth: "thin" as const,
        borderRadius: "small" as const,
      },
    },
    {
      id: "accordion-docs",
      name: "Documentation Sections",
      description: "Help documentation with expandable sections",
      content: {
        mode: "custom" as const,
        sectionTitle: "Documentation",
        sectionSubtitle: "Learn how to use our platform",
        iconStyle: "chevron" as const,
        allowMultipleOpen: false,
        showExpandAll: true,
        defaultExpandFirst: true,
        faqItems: [],
        showNumbering: false,
        modules: [],
        showLessonCount: false,
        showTotalDuration: false,
        customItems: [
          {
            id: "doc-1",
            title: "Getting Started",
            content:
              "<p>Welcome to our platform! This guide will walk you through the initial setup process.</p><ol><li>Create your account</li><li>Complete your profile</li><li>Start your first project</li></ol>",
          },
          {
            id: "doc-2",
            title: "Account Settings",
            content:
              "<p>Manage your account preferences, security settings, and notification options from the Settings page.</p>",
          },
          {
            id: "doc-3",
            title: "Troubleshooting",
            content:
              "<p>Having issues? Check our common solutions:</p><ul><li>Clear your browser cache</li><li>Disable browser extensions</li><li>Contact support if issues persist</li></ul>",
          },
        ],
        enableStyling: false,
      },
    },
  ],

  // ============================================================================
  // Pricing Templates
  // ============================================================================
  pricing: [
    {
      id: "pricing-saas",
      name: "SaaS Starter",
      description: "Free/Pro/Enterprise tiers with monthly/annual toggle",
      content: {
        mode: "toggle",
        sectionTitle: "Simple, Transparent Pricing",
        sectionSubtitle: "Choose the plan that works best for you",
        currency: "$",
        period: "monthly",
        showPeriod: true,
        defaultPeriod: "monthly",
        toggleLabels: { monthly: "Monthly", annual: "Annually" },
        columns: 3,
        gap: "medium",
        equalHeight: true,
        showCardBackground: true,
        cardBorderRadius: "medium",
        comparisonFeatures: [],
        tiers: [
          {
            id: "saas-free",
            name: "Free",
            description: "For individuals and hobbyists",
            price: "0",
            priceMonthly: "0",
            priceAnnual: "0",
            features: [
              { id: "sf1", text: "1 project", status: "included" },
              { id: "sf2", text: "Basic analytics", status: "included" },
              { id: "sf3", text: "Community support", status: "included" },
              { id: "sf4", text: "API access", status: "excluded" },
              { id: "sf5", text: "Custom domain", status: "excluded" },
            ],
            buttonText: "Get Started Free",
            buttonUrl: "#",
            buttonVariant: "outline",
          },
          {
            id: "saas-pro",
            name: "Pro",
            description: "For professionals and small teams",
            price: "29",
            priceMonthly: "29",
            priceAnnual: "290",
            annualSavings: "Save $58/year",
            isPopular: true,
            popularLabel: "Most Popular",
            features: [
              { id: "sp1", text: "Unlimited projects", status: "included" },
              { id: "sp2", text: "Advanced analytics", status: "included" },
              { id: "sp3", text: "Priority email support", status: "included" },
              { id: "sp4", text: "API access", status: "included" },
              { id: "sp5", text: "Custom domain", status: "excluded" },
            ],
            buttonText: "Start Free Trial",
            buttonUrl: "#",
            buttonVariant: "primary",
          },
          {
            id: "saas-enterprise",
            name: "Enterprise",
            description: "For large teams and organizations",
            price: "99",
            priceMonthly: "99",
            priceAnnual: "990",
            annualSavings: "Save $198/year",
            features: [
              { id: "se1", text: "Unlimited everything", status: "included" },
              { id: "se2", text: "Custom integrations", status: "included" },
              { id: "se3", text: "Dedicated support", status: "included" },
              { id: "se4", text: "API access", status: "included" },
              { id: "se5", text: "Custom domain", status: "included" },
            ],
            buttonText: "Contact Sales",
            buttonUrl: "#",
            buttonVariant: "secondary",
          },
        ],
        enableStyling: false,
      },
    },
    {
      id: "pricing-course",
      name: "Course Pricing",
      description: "Basic/Premium/Bundle tiers for online courses",
      content: {
        mode: "simple",
        sectionTitle: "Invest in Your Future",
        sectionSubtitle: "Choose your learning path",
        currency: "$",
        period: "one-time",
        showPeriod: false,
        columns: 3,
        gap: "medium",
        equalHeight: true,
        showCardBackground: true,
        cardBorderRadius: "medium",
        comparisonFeatures: [],
        tiers: [
          {
            id: "course-basic",
            name: "Basic",
            description: "Self-paced learning",
            price: "97",
            features: [
              { id: "cb1", text: "Full course access", status: "included" },
              { id: "cb2", text: "Downloadable resources", status: "included" },
              { id: "cb3", text: "Community forum access", status: "included" },
              { id: "cb4", text: "Live Q&A sessions", status: "excluded" },
              { id: "cb5", text: "1-on-1 coaching", status: "excluded" },
            ],
            buttonText: "Enroll Now",
            buttonUrl: "#",
            buttonVariant: "outline",
          },
          {
            id: "course-premium",
            name: "Premium",
            description: "Interactive learning experience",
            price: "197",
            isPopular: true,
            popularLabel: "Best Value",
            features: [
              { id: "cp1", text: "Full course access", status: "included" },
              { id: "cp2", text: "Downloadable resources", status: "included" },
              { id: "cp3", text: "Community forum access", status: "included" },
              { id: "cp4", text: "Weekly live Q&A", status: "included" },
              { id: "cp5", text: "1-on-1 coaching", status: "excluded" },
            ],
            buttonText: "Get Premium",
            buttonUrl: "#",
            buttonVariant: "primary",
          },
          {
            id: "course-vip",
            name: "VIP Bundle",
            description: "Complete transformation package",
            price: "497",
            features: [
              { id: "cv1", text: "Full course access", status: "included" },
              { id: "cv2", text: "All bonus materials", status: "included" },
              { id: "cv3", text: "Private community", status: "included" },
              { id: "cv4", text: "Unlimited Q&A access", status: "included" },
              { id: "cv5", text: "3 coaching calls", status: "included" },
            ],
            buttonText: "Join VIP",
            buttonUrl: "#",
            buttonVariant: "secondary",
          },
        ],
        enableStyling: false,
      },
    },
    {
      id: "pricing-services",
      name: "Service Packages",
      description: "Starter/Professional/Enterprise for service businesses",
      content: {
        mode: "simple",
        sectionTitle: "Our Services",
        sectionSubtitle: "Professional solutions for every need",
        currency: "$",
        period: "monthly",
        showPeriod: true,
        columns: 3,
        gap: "medium",
        equalHeight: true,
        showCardBackground: true,
        cardBorderRadius: "medium",
        comparisonFeatures: [],
        tiers: [
          {
            id: "svc-starter",
            name: "Starter",
            description: "Perfect for small projects",
            price: "499",
            features: [
              { id: "ss1", text: "5 hours of work", status: "included" },
              { id: "ss2", text: "1 revision round", status: "included" },
              { id: "ss3", text: "Email support", status: "included" },
              { id: "ss4", text: "Priority delivery", status: "excluded" },
              { id: "ss5", text: "Dedicated manager", status: "excluded" },
            ],
            buttonText: "Get Started",
            buttonUrl: "#",
            buttonVariant: "outline",
          },
          {
            id: "svc-professional",
            name: "Professional",
            description: "For growing businesses",
            price: "999",
            isPopular: true,
            popularLabel: "Most Popular",
            features: [
              { id: "spf1", text: "15 hours of work", status: "included" },
              { id: "spf2", text: "3 revision rounds", status: "included" },
              { id: "spf3", text: "Priority support", status: "included" },
              { id: "spf4", text: "Priority delivery", status: "included" },
              { id: "spf5", text: "Dedicated manager", status: "excluded" },
            ],
            buttonText: "Choose Professional",
            buttonUrl: "#",
            buttonVariant: "primary",
          },
          {
            id: "svc-enterprise",
            name: "Enterprise",
            description: "Full-service solution",
            price: "2,499",
            features: [
              { id: "sent1", text: "40 hours of work", status: "included" },
              { id: "sent2", text: "Unlimited revisions", status: "included" },
              { id: "sent3", text: "24/7 support", status: "included" },
              { id: "sent4", text: "Express delivery", status: "included" },
              { id: "sent5", text: "Dedicated manager", status: "included" },
            ],
            buttonText: "Contact Us",
            buttonUrl: "#",
            buttonVariant: "secondary",
          },
        ],
        enableStyling: false,
      },
    },
    {
      id: "pricing-simple",
      name: "Simple Two-Tier",
      description: "Free vs Paid comparison (2 columns)",
      content: {
        mode: "simple",
        sectionTitle: "Get Started Today",
        sectionSubtitle: "Free forever, upgrade when you're ready",
        currency: "$",
        period: "monthly",
        showPeriod: true,
        columns: 2,
        gap: "large",
        equalHeight: true,
        showCardBackground: true,
        cardBorderRadius: "large",
        comparisonFeatures: [],
        tiers: [
          {
            id: "simple-free",
            name: "Free",
            description: "Everything you need to get started",
            price: "0",
            features: [
              { id: "stf1", text: "Core features", status: "included" },
              { id: "stf2", text: "Up to 100 items", status: "included" },
              { id: "stf3", text: "Community support", status: "included" },
              { id: "stf4", text: "Advanced features", status: "excluded" },
              { id: "stf5", text: "Priority support", status: "excluded" },
            ],
            buttonText: "Start Free",
            buttonUrl: "#",
            buttonVariant: "outline",
          },
          {
            id: "simple-pro",
            name: "Pro",
            description: "For power users who need more",
            price: "19",
            isPopular: true,
            popularLabel: "Recommended",
            features: [
              { id: "stp1", text: "All core features", status: "included" },
              { id: "stp2", text: "Unlimited items", status: "included" },
              { id: "stp3", text: "Priority support", status: "included" },
              { id: "stp4", text: "Advanced features", status: "included" },
              { id: "stp5", text: "Early access", status: "included" },
            ],
            buttonText: "Upgrade to Pro",
            buttonUrl: "#",
            buttonVariant: "primary",
          },
        ],
        enableStyling: false,
      },
    },
    {
      id: "pricing-comparison",
      name: "Feature Comparison",
      description: "Full feature matrix table for detailed comparison",
      content: {
        mode: "comparison",
        sectionTitle: "Compare Plans",
        sectionSubtitle: "Find the right plan for your needs",
        currency: "$",
        period: "monthly",
        showPeriod: true,
        columns: 4,
        gap: "small",
        equalHeight: true,
        showCardBackground: true,
        cardBorderRadius: "small",
        comparisonFeatures: [
          "Projects",
          "Team members",
          "Storage",
          "API access",
          "Custom domain",
          "Priority support",
          "Analytics",
          "Integrations",
        ],
        tiers: [
          {
            id: "comp-free",
            name: "Free",
            price: "0",
            features: [
              { id: "cf1", text: "3 projects", status: "limited" },
              { id: "cf2", text: "1 member", status: "included" },
              { id: "cf3", text: "1 GB", status: "included" },
              { id: "cf4", text: "API access", status: "excluded" },
              { id: "cf5", text: "Custom domain", status: "excluded" },
              { id: "cf6", text: "Priority support", status: "excluded" },
              { id: "cf7", text: "Basic", status: "included" },
              { id: "cf8", text: "5 integrations", status: "limited" },
            ],
            buttonText: "Start Free",
            buttonUrl: "#",
            buttonVariant: "outline",
          },
          {
            id: "comp-starter",
            name: "Starter",
            price: "15",
            features: [
              { id: "cs1", text: "10 projects", status: "included" },
              { id: "cs2", text: "5 members", status: "included" },
              { id: "cs3", text: "10 GB", status: "included" },
              { id: "cs4", text: "API access", status: "included" },
              { id: "cs5", text: "Custom domain", status: "excluded" },
              { id: "cs6", text: "Priority support", status: "excluded" },
              { id: "cs7", text: "Advanced", status: "included" },
              { id: "cs8", text: "20 integrations", status: "included" },
            ],
            buttonText: "Get Starter",
            buttonUrl: "#",
            buttonVariant: "outline",
          },
          {
            id: "comp-pro",
            name: "Pro",
            price: "49",
            isPopular: true,
            popularLabel: "Popular",
            features: [
              { id: "cpro1", text: "Unlimited", status: "included" },
              { id: "cpro2", text: "20 members", status: "included" },
              { id: "cpro3", text: "100 GB", status: "included" },
              { id: "cpro4", text: "API access", status: "included" },
              { id: "cpro5", text: "Custom domain", status: "included" },
              { id: "cpro6", text: "Priority support", status: "included" },
              { id: "cpro7", text: "Advanced", status: "included" },
              { id: "cpro8", text: "Unlimited", status: "included" },
            ],
            buttonText: "Get Pro",
            buttonUrl: "#",
            buttonVariant: "primary",
          },
          {
            id: "comp-enterprise",
            name: "Enterprise",
            price: "199",
            features: [
              { id: "ce1", text: "Unlimited", status: "included" },
              { id: "ce2", text: "Unlimited", status: "included" },
              { id: "ce3", text: "Unlimited", status: "included" },
              { id: "ce4", text: "API access", status: "included" },
              { id: "ce5", text: "Custom domain", status: "included" },
              { id: "ce6", text: "24/7 support", status: "included" },
              { id: "ce7", text: "Custom", status: "included" },
              { id: "ce8", text: "Unlimited", status: "included" },
            ],
            buttonText: "Contact Sales",
            buttonUrl: "#",
            buttonVariant: "secondary",
          },
        ],
        enableStyling: false,
      },
    },
    {
      id: "pricing-contact",
      name: "Contact Pricing",
      description: "Includes Contact Us tier for enterprise deals",
      content: {
        mode: "simple",
        sectionTitle: "Flexible Plans",
        sectionSubtitle: "Solutions for businesses of all sizes",
        currency: "$",
        period: "monthly",
        showPeriod: true,
        columns: 3,
        gap: "medium",
        equalHeight: true,
        showCardBackground: true,
        cardBorderRadius: "medium",
        comparisonFeatures: [],
        tiers: [
          {
            id: "contact-starter",
            name: "Starter",
            description: "For small teams",
            price: "49",
            features: [
              { id: "ct1", text: "Up to 5 users", status: "included" },
              { id: "ct2", text: "Basic features", status: "included" },
              { id: "ct3", text: "Email support", status: "included" },
              { id: "ct4", text: "Advanced features", status: "excluded" },
            ],
            buttonText: "Get Started",
            buttonUrl: "#",
            buttonVariant: "outline",
          },
          {
            id: "contact-business",
            name: "Business",
            description: "For growing companies",
            price: "149",
            isPopular: true,
            popularLabel: "Most Popular",
            features: [
              { id: "ctb1", text: "Up to 25 users", status: "included" },
              { id: "ctb2", text: "All features", status: "included" },
              { id: "ctb3", text: "Priority support", status: "included" },
              { id: "ctb4", text: "API access", status: "included" },
            ],
            buttonText: "Choose Business",
            buttonUrl: "#",
            buttonVariant: "primary",
          },
          {
            id: "contact-enterprise",
            name: "Enterprise",
            description: "Custom solutions for large organizations",
            price: "Contact us",
            features: [
              { id: "cte1", text: "Unlimited users", status: "included" },
              { id: "cte2", text: "Custom features", status: "included" },
              { id: "cte3", text: "Dedicated support", status: "included" },
              { id: "cte4", text: "SLA guarantee", status: "included" },
            ],
            buttonText: "Contact Sales",
            buttonUrl: "#",
            buttonVariant: "secondary",
          },
        ],
        enableStyling: false,
      },
    },
  ],
};

/**
 * Get templates for a specific block type
 */
export function getTemplatesForBlockType<T extends BlockType>(
  blockType: T
): SectionTemplate<T>[] {
  return sectionTemplates[blockType] as SectionTemplate<T>[];
}

/**
 * Get a specific template by block type and template ID
 */
export function getTemplateById<T extends BlockType>(
  blockType: T,
  templateId: string
): SectionTemplate<T> | undefined {
  const templates = sectionTemplates[blockType] as SectionTemplate<T>[];
  return templates.find((t) => t.id === templateId);
}
