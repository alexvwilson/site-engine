import { pgTable, text, timestamp, uuid, index, jsonb, boolean } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import type { HeaderContent, FooterContent, SocialLink } from "@/lib/section-types";

export const SITE_STATUSES = ["draft", "published"] as const;
export type SiteStatus = (typeof SITE_STATUSES)[number];

export const COLOR_MODES = ["light", "dark", "system", "user_choice"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const BRAND_PERSONALITIES = ["professional", "consumer", "tech", "creative"] as const;
export type BrandPersonality = (typeof BRAND_PERSONALITIES)[number];

export const DOMAIN_VERIFICATION_STATUSES = ["pending", "verified", "failed"] as const;
export type DomainVerificationStatus = (typeof DOMAIN_VERIFICATION_STATUSES)[number];

export const DOMAIN_SSL_STATUSES = ["pending", "issued", "failed"] as const;
export type DomainSslStatus = (typeof DOMAIN_SSL_STATUSES)[number];

export const SOCIAL_ICON_STYLES = ["brand", "monochrome", "primary"] as const;

// Vercel API verification challenge structure
export interface VercelVerificationChallenge {
  type: "TXT" | "CNAME" | "A";
  domain: string;
  value: string;
  reason: string;
}

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    status: text("status", { enum: SITE_STATUSES }).notNull().default("draft"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    published_at: timestamp("published_at", { withTimezone: true }),
    custom_domain: text("custom_domain").unique(),
    meta_title: text("meta_title"),
    meta_description: text("meta_description"),
    color_mode: text("color_mode", { enum: COLOR_MODES }).notNull().default("light"),
    // Site-level header configuration (shared across all pages)
    header_content: jsonb("header_content").$type<HeaderContent>(),
    // Site-level footer configuration (shared across all pages)
    footer_content: jsonb("footer_content").$type<FooterContent>(),
    // Under construction mode - show Coming Soon page to public visitors
    under_construction: boolean("under_construction").notNull().default(false),
    construction_title: text("construction_title"),
    construction_description: text("construction_description"),
    // Blog settings
    show_blog_author: boolean("show_blog_author").notNull().default(true),
    // Default category for new blog posts (FK to blog_categories.id, set via migration)
    default_blog_category_id: uuid("default_blog_category_id"),
    // Blog page SEO metadata
    blog_meta_title: text("blog_meta_title"),
    blog_meta_description: text("blog_meta_description"),
    // Brand personality for AI features (logo generation, etc.)
    brand_personality: text("brand_personality", { enum: BRAND_PERSONALITIES }),
    // Email address for contact form notifications
    contact_notification_email: text("contact_notification_email"),
    // Favicon for browser tabs and iOS bookmarks
    favicon_url: text("favicon_url"),
    // When false, logo is used as favicon; when true, use separate favicon_url
    use_separate_favicon: boolean("use_separate_favicon").notNull().default(false),
    // Social links - array of {platform, url} objects for site-wide social media
    social_links: jsonb("social_links").$type<SocialLink[]>().default([]),
    // Icon style for social links (brand colors, monochrome, or theme primary)
    social_icon_style: text("social_icon_style", { enum: SOCIAL_ICON_STYLES }).default("brand"),
    // Custom domain verification fields
    domain_verification_status: text("domain_verification_status", {
      enum: DOMAIN_VERIFICATION_STATUSES,
    }),
    domain_verification_challenges: jsonb(
      "domain_verification_challenges"
    ).$type<VercelVerificationChallenge[]>(),
    domain_verified_at: timestamp("domain_verified_at", { withTimezone: true }),
    domain_ssl_status: text("domain_ssl_status", { enum: DOMAIN_SSL_STATUSES }),
    domain_error_message: text("domain_error_message"),
  },
  (t) => [
    index("sites_user_id_idx").on(t.user_id),
    index("sites_slug_idx").on(t.slug),
    index("sites_status_idx").on(t.status),
    index("sites_updated_at_idx").on(t.updated_at),
    index("sites_custom_domain_idx").on(t.custom_domain),
  ]
);

export type Site = InferSelectModel<typeof sites>;
export type NewSite = InferInsertModel<typeof sites>;
