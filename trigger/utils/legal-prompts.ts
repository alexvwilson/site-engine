/**
 * Legal Page Generation Utilities
 *
 * Prompt engineering for AI-powered legal content generation.
 * Generates Privacy Policy, Terms of Service, and Cookie Policy
 * tailored to business type, data practices, and jurisdiction.
 */

import { z } from "zod";
import type {
  BusinessType,
  DataCollectionType,
  Jurisdiction,
  LegalPageType,
} from "@/lib/drizzle/schema/legal-generation-jobs";

// ============================================================================
// Types
// ============================================================================

export interface LegalPromptContext {
  siteName: string;
  siteSlug: string;
  businessType: BusinessType;
  dataCollection: DataCollectionType[];
  jurisdiction: Jurisdiction;
  pagesToGenerate: LegalPageType[];
}

// ============================================================================
// Zod Schema for AI Response
// ============================================================================

export const legalContentSchema = z.object({
  privacy: z
    .string()
    .optional()
    .describe("Privacy Policy HTML content"),
  terms: z
    .string()
    .optional()
    .describe("Terms of Service HTML content"),
  cookies: z
    .string()
    .optional()
    .describe("Cookie Policy HTML content"),
});

export type LegalContentResponse = z.infer<typeof legalContentSchema>;

// ============================================================================
// Human-Readable Mappings
// ============================================================================

const BUSINESS_TYPE_DESCRIPTIONS: Record<BusinessType, string> = {
  ecommerce: "an e-commerce store selling products online with shopping cart and checkout",
  blog: "a blog or content website publishing articles and media",
  saas: "a Software-as-a-Service (SaaS) application providing online tools",
  portfolio: "a portfolio website showcasing work, projects, or services",
  service: "a service business website offering professional services",
  other: "a general website",
};

const DATA_COLLECTION_DESCRIPTIONS: Record<DataCollectionType, string> = {
  contact_forms: "contact forms that collect name, email, and messages",
  analytics: "analytics tools (like Google Analytics) to track visitor behavior",
  cookies: "cookies for functionality, preferences, and tracking",
  user_accounts: "user accounts requiring registration with email and password",
  payments: "payment processing for transactions (credit cards, payment services)",
};

const JURISDICTION_DESCRIPTIONS: Record<Jurisdiction, string> = {
  us: "United States (compliance with state laws like CCPA for California residents)",
  eu_gdpr: "European Union (full GDPR compliance with data subject rights)",
  uk: "United Kingdom (UK GDPR and Data Protection Act 2018)",
  canada: "Canada (PIPEDA - Personal Information Protection and Electronic Documents Act)",
  australia: "Australia (Privacy Act 1988 and Australian Privacy Principles)",
  other: "international best practices",
};

const JURISDICTION_SPECIFIC_REQUIREMENTS: Record<Jurisdiction, string> = {
  us: `- Include California Consumer Privacy Act (CCPA) disclosures if applicable
- Mention "Do Not Sell My Personal Information" rights for California residents
- Reference state-specific privacy laws where applicable`,
  eu_gdpr: `- Include all GDPR-required disclosures (Articles 13-14)
- Clearly state the legal basis for processing (consent, legitimate interest, contract)
- Include data subject rights (access, rectification, erasure, portability, objection)
- Mention right to lodge complaint with supervisory authority
- Include Data Protection Officer contact if applicable`,
  uk: `- Include UK GDPR and Data Protection Act 2018 compliance
- Reference the Information Commissioner's Office (ICO)
- Include data subject rights similar to GDPR`,
  canada: `- Include PIPEDA compliance disclosures
- Mention right to access and correct personal information
- Reference the Office of the Privacy Commissioner of Canada`,
  australia: `- Include Australian Privacy Principles (APPs) compliance
- Reference the Office of the Australian Information Commissioner (OAIC)
- Include rights to access and correct personal information`,
  other: `- Follow international privacy best practices
- Include clear data collection and use disclosures
- Provide contact information for privacy inquiries`,
};

// ============================================================================
// Prompt Builder
// ============================================================================

export function buildLegalPrompt(context: LegalPromptContext): {
  system: string;
  user: string;
} {
  const businessDesc = BUSINESS_TYPE_DESCRIPTIONS[context.businessType];
  const jurisdictionDesc = JURISDICTION_DESCRIPTIONS[context.jurisdiction];
  const jurisdictionReqs = JURISDICTION_SPECIFIC_REQUIREMENTS[context.jurisdiction];

  const dataCollectionList = context.dataCollection.length > 0
    ? context.dataCollection.map((dc) => `- ${DATA_COLLECTION_DESCRIPTIONS[dc]}`).join("\n")
    : "- Basic website functionality only (no personal data collection)";

  const pagesToGenerateList = context.pagesToGenerate
    .map((page) => {
      switch (page) {
        case "privacy":
          return "Privacy Policy";
        case "terms":
          return "Terms of Service";
        case "cookies":
          return "Cookie Policy";
      }
    })
    .join(", ");

  const system = `You are an expert legal content writer specializing in website legal documents.
Your task is to generate professional, comprehensive legal page content for websites.

IMPORTANT: You must respond with valid JSON containing the requested legal pages.

## Critical Requirements

1. **HTML Format**: Return content as clean, semantic HTML using:
   - <h2> for main section headings
   - <h3> for subsections
   - <p> for paragraphs
   - <ul> and <li> for lists
   - <strong> for emphasis where needed
   - Do NOT include <html>, <head>, <body>, or <style> tags

2. **Professional Tone**: Write in clear, professional language that is:
   - Legally sound but understandable to non-lawyers
   - Comprehensive yet not overly verbose
   - Appropriate for a professional business website

3. **AI Disclaimer**: Include a brief notice at the end stating:
   "This document was generated with AI assistance. We recommend reviewing it with legal counsel to ensure it meets your specific requirements."

4. **Current Date Reference**: Use "[Current Date]" as a placeholder for the effective date.

5. **Company Reference**: Use the provided site name as the company/website name throughout.

## Content Guidelines by Page Type

### Privacy Policy
- Information we collect (what types of data)
- How we use the information
- How we protect the information
- Third-party sharing (if applicable)
- User rights based on jurisdiction
- How to contact us about privacy
- Policy update procedures

### Terms of Service
- Acceptance of terms
- Description of services
- User responsibilities and acceptable use
- Intellectual property rights
- Limitation of liability
- Dispute resolution
- Termination provisions
- Governing law
- Changes to terms

### Cookie Policy
- What are cookies (brief explanation)
- Types of cookies used (essential, functional, analytics, marketing)
- How we use cookies
- Third-party cookies (if applicable)
- How to manage/disable cookies
- Cookie consent information`;

  const user = `Generate legal page content for the following website:

**Website Name:** ${context.siteName}
**Website URL:** /sites/${context.siteSlug}
**Business Type:** This is ${businessDesc}
**Jurisdiction:** ${jurisdictionDesc}

**Data Collection Practices:**
${dataCollectionList}

**Jurisdiction-Specific Requirements:**
${jurisdictionReqs}

**Pages to Generate:** ${pagesToGenerateList}

Please generate the requested legal page(s) in HTML format. Only include the pages specified above.

Return a JSON object with the following structure:
${context.pagesToGenerate.includes("privacy") ? '- "privacy": string containing Privacy Policy HTML content' : ""}
${context.pagesToGenerate.includes("terms") ? '- "terms": string containing Terms of Service HTML content' : ""}
${context.pagesToGenerate.includes("cookies") ? '- "cookies": string containing Cookie Policy HTML content' : ""}

Return ONLY the requested pages in the JSON response. Do not include pages that were not requested.`;

  return { system, user };
}

// ============================================================================
// Page Configuration
// ============================================================================

export const LEGAL_PAGE_CONFIG: Record<
  LegalPageType,
  { title: string; slug: string }
> = {
  privacy: { title: "Privacy Policy", slug: "privacy-policy" },
  terms: { title: "Terms of Service", slug: "terms-of-service" },
  cookies: { title: "Cookie Policy", slug: "cookie-policy" },
};
