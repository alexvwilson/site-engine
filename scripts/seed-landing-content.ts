/**
 * Seed script to populate initial landing page content from hardcoded values.
 *
 * Run with: npx dotenv-cli -e .env.local -- tsx scripts/seed-landing-content.ts
 */

import { db } from "../lib/drizzle/db";
import { landingFaqs, landingFeatures } from "../lib/drizzle/schema";

const INITIAL_FAQS = [
  {
    question: "How does AI theme generation work?",
    answer:
      "Simply describe your brand, target audience, and style preferences in plain language. Our AI analyzes your input and generates a complete theme including color palette, typography, and component styles that match your vision.",
    display_order: 0,
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes! You can connect your custom domain to any published site. We handle SSL certificates automatically, so your site is secure from day one.",
    display_order: 1,
  },
  {
    question: "Do I need coding experience?",
    answer:
      "Not at all. Headstring Web is designed for content managers and creators who want full control without writing code. Everything is visual - drag sections, click to edit text, and see changes in real-time.",
    display_order: 2,
  },
  {
    question: "What types of pages can I create?",
    answer:
      "You can create any type of page using our 9 block types: Hero, Text, Image, Gallery, Features, CTA, Testimonials, Contact, and Footer sections. Combine them in any order to build landing pages, about pages, portfolios, and more.",
    display_order: 3,
  },
  {
    question: "Can I preview before publishing?",
    answer:
      "Absolutely. Our preview mode lets you see exactly how your page will look on desktop, tablet, and mobile devices before you publish. No surprises for your visitors.",
    display_order: 4,
  },
  {
    question: "Is my content secure?",
    answer:
      "Yes. All content is stored securely with enterprise-grade encryption. Your sites and data are backed up regularly, and you maintain full ownership of everything you create.",
    display_order: 5,
  },
];

const INITIAL_FEATURES = [
  {
    title: "AI Theme Generation",
    description:
      "Describe your brand in words and let AI create a unique, cohesive theme with colors, typography, and component styles.",
    icon_name: "sparkles",
    display_order: 0,
  },
  {
    title: "Visual Page Editor",
    description:
      "Drag-and-drop sections, edit content inline, and see changes instantly. No coding required.",
    icon_name: "layout",
    display_order: 1,
  },
  {
    title: "Instant Preview",
    description:
      "Preview your pages on desktop, tablet, and mobile before publishing. What you see is what your visitors get.",
    icon_name: "eye",
    display_order: 2,
  },
  {
    title: "One-Click Publishing",
    description:
      "When you're ready, publish to your custom domain with a single click. Your changes go live instantly.",
    icon_name: "rocket",
    display_order: 3,
  },
];

async function seed() {
  console.log("🌱 Seeding landing page content...\n");

  // Check existing data
  const existingFaqs = await db.select().from(landingFaqs);
  const existingFeatures = await db.select().from(landingFeatures);

  if (existingFaqs.length > 0 || existingFeatures.length > 0) {
    console.log("⚠️  Landing content already exists:");
    console.log(`   - ${existingFaqs.length} FAQ(s)`);
    console.log(`   - ${existingFeatures.length} feature(s)`);
    console.log("\n   Skipping seed to avoid duplicates.");
    console.log("   To reset, delete existing rows first.\n");
    process.exit(0);
  }

  // Insert FAQs
  console.log("📝 Inserting FAQs...");
  await db.insert(landingFaqs).values(INITIAL_FAQS);
  console.log(`   ✓ Inserted ${INITIAL_FAQS.length} FAQ items`);

  // Insert Features
  console.log("✨ Inserting features...");
  await db.insert(landingFeatures).values(INITIAL_FEATURES);
  console.log(`   ✓ Inserted ${INITIAL_FEATURES.length} feature items`);

  console.log("\n✅ Seed complete!\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
