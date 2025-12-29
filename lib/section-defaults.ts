import type { BlockType } from "@/lib/drizzle/schema/sections";
import type { ContentTypeMap } from "./section-types";

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
    ctaText: "Get Started",
    ctaUrl: "#",
  },

  hero: {
    heading: "Welcome to Your Site",
    subheading: "Create something amazing with Site Engine",
    ctaText: "Get Started",
    ctaUrl: "#",
  },

  text: {
    body: "<p>Start writing your content here. You can add paragraphs, format text, and share your message with the world.</p>",
  },

  image: {
    src: "",
    alt: "Image description",
    caption: "",
  },

  gallery: {
    images: [],
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
  },

  cta: {
    heading: "Ready to get started?",
    description:
      "Join thousands of satisfied customers and take the next step today.",
    buttonText: "Sign Up Now",
    buttonUrl: "#",
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
  },

  contact: {
    heading: "Get in Touch",
    description:
      "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    fields: [
      { type: "text", label: "Name", required: true },
      { type: "email", label: "Email", required: true },
      { type: "textarea", label: "Message", required: true },
    ],
  },

  footer: {
    copyright: "© 2025 Your Company. All rights reserved.",
    links: [
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Terms of Service", url: "/terms" },
    ],
  },

  blog_featured: {
    postId: null,
  },

  blog_grid: {
    postCount: 6,
    showExcerpt: true,
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
