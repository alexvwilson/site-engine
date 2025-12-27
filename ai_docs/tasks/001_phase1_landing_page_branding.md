# Task 001: Phase 1 - Landing Page & Branding Update

> **Phase:** 1 of 9
> **Goal:** Transform Skribo.ai transcription branding to Site Engine website builder branding

---

## 1. Task Overview

### Task Title
**Title:** Rebrand Landing Page from Skribo.ai (Transcription) to Site Engine (Website Builder)

### Goal Statement
**Goal:** Update all landing page components, metadata, and legal pages to reflect Site Engine's identity as an AI-powered website builder for content managers. This establishes the brand foundation before building the actual application features.

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis Not Required
This is a straightforward rebranding task with a single clear approach: update existing copy and metadata. No architectural decisions or multiple viable approaches exist.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Framework:** Next.js 15.3 with React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Current State:** Fully functional landing page branded as "Skribo.ai" (transcription app)

### Current State Analysis

**What exists today:**
- `lib/metadata.ts` - Metadata referencing "Skribo.ai" and transcription keywords
- `components/Logo.tsx` - Logo component with "Skribo.ai" text
- `components/landing/HeroSection.tsx` - Transcription-focused hero with demo animation
- `components/landing/ProblemSection.tsx` - Pain points for transcription users
- `components/landing/FeaturesSection.tsx` - 6 transcription features
- `components/landing/FAQSection.tsx` - 6 transcription FAQs
- `components/landing/CTASection.tsx` - Transcription CTA messaging
- `components/landing/Footer.tsx` - Footer with social links and "Skribo.ai" branding
- `components/landing/Navbar.tsx` - Navbar using Logo component
- `app/(public)/terms/page.tsx` - Terms referencing ShipKit.ai/transcription
- `app/(public)/privacy/page.tsx` - Privacy policy referencing transcription
- `app/(public)/cookies/page.tsx` - Cookie policy referencing transcription

**Logo/Icon Status:** ✅ Already updated (no changes needed to image files)

---

## 4. Context & Problem Definition

### Problem Statement
The current landing page is branded for "Skribo.ai" - a transcription application. Site Engine is an AI-powered website builder with completely different value propositions, target audience, and features. All user-facing copy, metadata, and legal pages need to reflect the Site Engine brand.

### Success Criteria
- [ ] All metadata references Site Engine (title, description, keywords, OpenGraph)
- [ ] Logo component displays "Site Engine" text
- [ ] Hero section communicates website builder value proposition
- [ ] Problem/Solution section addresses content manager pain points
- [ ] Features section highlights 4 core features (AI Theme, Visual Editor, Page Builder, One-Click Publishing)
- [ ] FAQ section answers website builder questions
- [ ] CTA sections drive sign-up for Site Engine
- [ ] Footer displays Site Engine branding (no social links)
- [ ] Legal pages reference Site Engine and Headstring

---

## 5. Development Mode Context

- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** - this is a fresh rebrand
- **Priority: Speed and simplicity** - straightforward copy updates

---

## 6. Technical Requirements

### Functional Requirements
- All "Skribo.ai" references replaced with "Site Engine"
- All transcription-related copy replaced with website builder copy
- Company references updated to "Headstring" with domain "engine.headstring.com"
- Contact email: contact@headstring.com

### Non-Functional Requirements
- **Responsive Design:** Maintain existing responsive behavior
- **Theme Support:** Maintain existing light/dark mode support
- **SEO:** Update keywords for website builder discovery

---

## 7. Data & Database Changes

**No database changes required for this task.**

---

## 8. Backend Changes & Background Jobs

**No backend changes required for this task.** This is a frontend-only rebranding task.

---

## 9. Frontend Changes

### Files to Modify

| File | Changes |
|------|---------|
| `lib/metadata.ts` | Update title, description, keywords, OpenGraph for Site Engine |
| `components/Logo.tsx` | Change "Skribo.ai" text to "Site Engine" |
| `components/landing/HeroSection.tsx` | New headline, subheadline, CTA, and demo animation for website builder |
| `components/landing/ProblemSection.tsx` | New pain points for content managers |
| `components/landing/FeaturesSection.tsx` | 4 new features (AI Theme, Visual Editor, Page Builder, Publishing) |
| `components/landing/FAQSection.tsx` | New FAQs for website builder |
| `components/landing/CTASection.tsx` | Updated CTA messaging |
| `components/landing/Footer.tsx` | Remove social links, update branding |
| `app/(public)/terms/page.tsx` | Update for Site Engine/Headstring |
| `app/(public)/privacy/page.tsx` | Update for Site Engine/Headstring |
| `app/(public)/cookies/page.tsx` | Update for Site Engine/Headstring |

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

#### `lib/metadata.ts`
```typescript
export const metadata: Metadata = {
  title: {
    template: "%s | Skribo.ai",
    default: "Skribo.ai - AI-Powered Transcription for Creators",
  },
  description: "Turn audio and video into accurate text in minutes...",
  keywords: ["AI Transcription", "Audio to Text", ...],
  openGraph: {
    title: "Skribo.ai - AI-Powered Transcription for Creators",
    siteName: "Skribo.ai",
    ...
  },
};
```

#### `components/Logo.tsx`
```typescript
<span className="hidden sm:block text-2xl font-bold text-primary">
  Skribo.ai
</span>
```

#### `components/landing/HeroSection.tsx`
```typescript
<h1>Fast, Affordable Transcriptions and Summaries</h1>
<p>Transcripts and summaries for your podcasts, meetings...</p>
<Button>Start Transcribing Free</Button>
```

#### `components/landing/Footer.tsx`
```typescript
<div className="text-xl font-bold">Skribo.ai</div>
<p>AI-powered transcription for creators...</p>
<SocialIcon url="https://twitter.com" />
<SocialIcon url="https://linkedin.com" />
<SocialIcon url="https://github.com" />
<p>&copy; 2025 Skribo.ai. All rights reserved.</p>
```

### 📂 **After Refactor**

#### `lib/metadata.ts`
```typescript
export const metadata: Metadata = {
  title: {
    template: "%s | Site Engine",
    default: "Site Engine - AI-Powered Website Builder",
  },
  description: "Build beautiful websites without code. AI-powered theme generation and intuitive content management for creators and businesses.",
  keywords: ["Website Builder", "AI Website", "No Code", "Content Management", ...],
  openGraph: {
    title: "Site Engine - AI-Powered Website Builder",
    siteName: "Site Engine",
    ...
  },
};
```

#### `components/Logo.tsx`
```typescript
<span className="hidden sm:block text-2xl font-bold text-primary">
  Site Engine
</span>
```

#### `components/landing/HeroSection.tsx`
```typescript
<h1>Build Beautiful Websites Without Code</h1>
<p>AI-powered theme generation and intuitive content management...</p>
<Button>Get Started</Button>
// Demo animation updated for website building workflow
```

#### `components/landing/Footer.tsx`
```typescript
<div className="text-xl font-bold">Site Engine</div>
<p>AI-powered website builder for content managers...</p>
// Social icons removed
<p>&copy; 2025 Headstring. All rights reserved.</p>
```

### 🎯 **Key Changes Summary**
- [ ] **Metadata:** All SEO and OpenGraph updated for "Site Engine" + website builder keywords
- [ ] **Logo:** Text changed from "Skribo.ai" to "Site Engine"
- [ ] **Hero:** New headline, subheadline, CTA, and demo animation showing website building flow
- [ ] **Problems/Solutions:** Updated for content manager pain points (slow updates, developer dependency, rigid templates)
- [ ] **Features:** Reduced from 6 to 4 core features with new descriptions
- [ ] **FAQ:** All 6 questions replaced with website builder context
- [ ] **Footer:** Social links removed, copyright updated to Headstring
- [ ] **Legal Pages:** All 3 pages updated with Site Engine/Headstring references

---

## 11. Implementation Plan

### Phase 1: Core Branding Updates
**Goal:** Update metadata and logo - the foundation of the brand

- [ ] **Task 1.1:** Update `lib/metadata.ts`
  - Change title template to "Site Engine"
  - Update description for website builder
  - Replace keywords with website builder terms
  - Update OpenGraph metadata
  - Update Twitter card metadata
  - Update `generateLegalMetadata` function

- [ ] **Task 1.2:** Update `components/Logo.tsx`
  - Change "Skribo.ai" text to "Site Engine"
  - Update alt text

### Phase 2: Hero Section Redesign
**Goal:** Create compelling hero for website builder product

- [ ] **Task 2.1:** Update `components/landing/HeroSection.tsx`
  - New headline: "Build Beautiful Websites Without Code"
  - New subheadline about AI themes and content management
  - Update CTA button text to "Get Started"
  - Redesign demo animation for website building workflow:
    - Step 1: "Design" - AI theme generation
    - Step 2: "Build" - Page/section editing
    - Step 3: "Preview" - Responsive preview
    - Step 4: "Publish" - One-click deployment

### Phase 3: Problem/Solution Section
**Goal:** Address content manager pain points

- [ ] **Task 3.1:** Update `components/landing/ProblemSection.tsx`
  - Update section header
  - New problems array:
    - Waiting days for simple website updates
    - Expensive developer dependency for changes
    - Rigid templates that don't match brand
    - No preview before publishing
  - New solutions array:
    - Make changes instantly with visual editor
    - No coding required - full content control
    - AI generates themes matching your brand
    - Preview on any device before publishing

### Phase 4: Features Section
**Goal:** Highlight 4 core Site Engine features

- [ ] **Task 4.1:** Update `components/landing/FeaturesSection.tsx`
  - Update section header for website builder
  - Replace 6 features with 4 new features:
    1. **AI Theme Generation** - Describe unique themes from brand description
    2. **Visual Page Editor** - Drag-and-drop sections, inline editing
    3. **Instant Preview** - See changes on desktop, tablet, mobile
    4. **One-Click Publishing** - Deploy to custom domain instantly
  - Update icons to match new features

### Phase 5: FAQ Section
**Goal:** Answer common website builder questions

- [ ] **Task 5.1:** Update `components/landing/FAQSection.tsx`
  - Replace all 6 FAQs with website builder questions:
    1. How does AI theme generation work?
    2. Can I use my own domain?
    3. Do I need coding experience?
    4. What types of pages can I create?
    5. Can I preview before publishing?
    6. Is my content secure?

### Phase 6: CTA and Footer
**Goal:** Update final call-to-action and footer branding

- [ ] **Task 6.1:** Update `components/landing/CTASection.tsx`
  - New headline about building websites
  - Update supporting text
  - Verify CTA buttons point to correct auth routes

- [ ] **Task 6.2:** Update `components/landing/Footer.tsx`
  - Change "Skribo.ai" to "Site Engine"
  - Update tagline for website builder
  - Remove all social media icons (SocialIcon components)
  - Remove react-social-icons import
  - Update copyright to "Headstring"

### Phase 7: Legal Pages
**Goal:** Update legal documentation for Site Engine

- [ ] **Task 7.1:** Update `app/(public)/terms/page.tsx`
  - Replace all "ShipKit.ai" and "Skribo.ai" with "Site Engine"
  - Update service description for website builder
  - Update company references to "Headstring"
  - Update contact email to contact@headstring.com

- [ ] **Task 7.2:** Update `app/(public)/privacy/page.tsx`
  - Replace all brand references with "Site Engine"
  - Update data collection descriptions for website builder
  - Update company references to "Headstring"
  - Update DPO email to privacy@headstring.com

- [ ] **Task 7.3:** Update `app/(public)/cookies/page.tsx`
  - Replace all brand references with "Site Engine"
  - Update cookie descriptions for website builder context
  - Update company references to "Headstring"

### Phase 8: Verification & Code Review
**Goal:** Ensure all changes are complete and working

- [ ] **Task 8.1:** Run linting on all modified files
- [ ] **Task 8.2:** Visual verification checklist
  - Navbar displays "Site Engine" logo
  - Hero section displays new headline/subheadline
  - Demo animation shows website building flow
  - Problems/Solutions reflect content manager pain points
  - 4 features displayed with correct icons/descriptions
  - FAQs answer website builder questions
  - Footer shows "Site Engine" and "Headstring" copyright (no social links)
  - Terms page references Site Engine/Headstring
  - Privacy page references Site Engine/Headstring
  - Cookies page references Site Engine/Headstring

---

## 12. Task Completion Tracking

### Completion Format
```
- [x] **Task X.X:** Description ✓ YYYY-MM-DD
  - Files: `path/to/file.ts` ✓
  - Details: Brief notes about changes ✓
```

---

## 13. File Structure

### Files to Modify (No new files needed)
```
site-engine/
├── lib/
│   └── metadata.ts                      # Metadata updates
├── components/
│   ├── Logo.tsx                         # Logo text update
│   └── landing/
│       ├── HeroSection.tsx              # Complete rewrite
│       ├── ProblemSection.tsx           # Copy updates
│       ├── FeaturesSection.tsx          # Features rewrite
│       ├── FAQSection.tsx               # FAQ rewrite
│       ├── CTASection.tsx               # Copy updates
│       └── Footer.tsx                   # Branding + remove socials
└── app/(public)/
    ├── terms/page.tsx                   # Legal updates
    ├── privacy/page.tsx                 # Legal updates
    └── cookies/page.tsx                 # Legal updates
```

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Dark mode compatibility:** Ensure all new copy works in both themes
- [ ] **Responsive text:** Verify headlines don't break on mobile
- [ ] **Link integrity:** Verify all CTA links point to correct auth routes

### No Security Changes
This task only modifies static copy - no security implications.

---

## 15. Deployment & Configuration

**No environment variable changes required.**

---

## 16. AI Agent Instructions

### Implementation Approach
1. Work through phases sequentially (1-8)
2. Update task document with completion timestamps after each phase
3. Run linting after each file modification
4. Present phase completion summaries between phases

### Code Quality Standards
- Maintain existing component structure
- Keep all responsive classes intact
- Preserve animation patterns in HeroSection
- Use semantic HTML for legal page content

---

## 17. Notes & Additional Context

### Brand Information
- **App Name:** Site Engine
- **Domain:** engine.headstring.com
- **Company:** Headstring
- **Contact:** contact@headstring.com
- **Privacy Contact:** privacy@headstring.com

### Feature Descriptions (for FeaturesSection)
1. **AI Theme Generation** - Describe your brand in words and let AI create a unique, cohesive theme with colors, typography, and component styles.
2. **Visual Page Editor** - Drag-and-drop sections, edit content inline, and see changes instantly. No coding required.
3. **Instant Preview** - Preview your pages on desktop, tablet, and mobile before publishing. What you see is what your visitors get.
4. **One-Click Publishing** - When you're ready, publish to your custom domain with a single click. Your changes go live instantly.

### Demo Animation Steps (for HeroSection)
1. **Design** - "Describe your brand" → AI generates theme
2. **Build** - "Add sections" → Visual editor interface
3. **Preview** - "Check all devices" → Responsive preview
4. **Publish** - "Go live" → Published site

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [ ] **No breaking changes** - This is purely a copy/content update

#### Ripple Effects Assessment
- [ ] **Navbar:** Uses Logo component - will automatically show "Site Engine"
- [ ] **Other pages:** May reference "Skribo" in protected routes - out of scope for Phase 1

#### Performance Implications
- [ ] **Reduced bundle size** - Removing react-social-icons from Footer
- [ ] **No new dependencies** - Only copy changes

### No Critical Issues
This is a low-risk frontend copy update with no database, API, or architectural changes.

---

*Template Version: 1.0*
*Created: December 2025*
*Phase: 1 of Site Engine Development Roadmap*
