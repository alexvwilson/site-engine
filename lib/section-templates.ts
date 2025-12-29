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
  ],

  // ============================================================================
  // Image Templates
  // ============================================================================
  image: [
    {
      id: "image-hero",
      name: "Hero Image",
      description: "Large featured image with caption",
      content: {
        src: "",
        alt: "Featured image showcasing our product",
        caption: "Discover the difference quality makes",
      },
    },
    {
      id: "image-simple",
      name: "Simple",
      description: "Clean image without caption",
      content: {
        src: "",
        alt: "Descriptive image",
        caption: "",
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
      description: "Showcase your work or projects",
      content: {
        images: [],
      },
    },
    {
      id: "gallery-team",
      name: "Team Photos",
      description: "Display team member photos",
      content: {
        images: [],
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
      description: "Basic contact form with essential fields",
      content: {
        heading: "Get in Touch",
        description:
          "Have a question or want to work together? Fill out the form below and we'll get back to you soon.",
        fields: [
          { type: "text", label: "Name", required: true },
          { type: "email", label: "Email", required: true },
          { type: "textarea", label: "Message", required: true },
        ],
      },
    },
    {
      id: "contact-detailed",
      name: "Detailed",
      description: "Extended form with additional fields",
      content: {
        heading: "Contact Us",
        description:
          "Tell us about your project and we'll schedule a call to discuss how we can help.",
        fields: [
          { type: "text", label: "Full Name", required: true },
          { type: "email", label: "Work Email", required: true },
          { type: "text", label: "Company", required: false },
          { type: "text", label: "Phone Number", required: false },
          { type: "textarea", label: "How can we help?", required: true },
        ],
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
