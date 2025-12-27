## Master Idea Document

### End Goal

My app helps **content managers and frequent website administrators** achieve **full control over their site's look, feel, and content with fast, easy updates** using **AI-powered theme generation and design assistance**.

### Specific Problem

Content managers and website administrators are stuck because **existing website tools either require technical expertise (code, complex builders) or lock them into rigid templates with limited customization**, leading to **hours of frustration per update, dependency on developers for simple changes, and delayed content that hurts engagement and conversions**.

### All User Types

#### Primary Users: Content Managers / Website Administrators

- **Who:** Marketing team members, small business owners, or solo operators who update websites regularly (for this MVP: sole developer/user)
- **Frustrations:**
  - Stuck waiting on developers for design changes
  - Current tools too complex or too limiting
  - Updating content feels slow and clunky
- **Urgent Goals:**
  - Make site updates in minutes, not days
  - Customize design without coding knowledge
  - Maintain a professional, on-brand look independently

#### System Administrators _(future consideration)_

- **Who:** Technical leads or agency owners who manage the site engine platform itself
- **Frustrations:**
  - No visibility into how sites are performing or being used
  - Difficult to manage multiple client sites
  - Hard to control costs or resource usage
- **Urgent Goals:**
  - Monitor all sites from one dashboard
  - Configure features and permissions per client/site
  - Scale operations efficiently

### Business Model & Revenue Strategy

- **Model Type:** None (Personal-use MVP)
- **Rationale:** This is a first attempt at the idea with a single user (the developer). No payment or subscription system needed for initial version.
- **Future Consideration:** Subscription tiers if the tool proves valuable and is opened to other users.

### Core Functionalities by Role (MVP)

- **Content Manager (Primary User)**
  - Can create and manage multiple websites/pages
  - Can edit page content quickly (text, images, layout)
  - Can use AI to generate theme options and design elements
  - Can use AI to get layout suggestions based on content description
  - Can preview changes before publishing
  - Can publish/unpublish pages and sites
  - Can organize content with a simple structure (pages, sections, blocks)

- **System/Background**
  - Sites are rendered and served efficiently
  - Theme/design assets are generated and stored (Tailwind CSS + shadcn/ui compatible)
  - Content changes are saved and versioned

### Key User Stories

#### Content Manager

1. **Create New Site**
   _As a_ content manager,
   _I want_ to create a new site with a few clicks,
   _So that_ I can start building content immediately without setup friction.

2. **AI Theme Generation**
   _As a_ content manager,
   _I want_ to describe my desired look/feel and have AI generate theme options,
   _So that_ I get professional designs without needing design skills.

3. **AI Layout Suggestions**
   _As a_ content manager,
   _I want_ to describe my content and get AI-recommended page layouts,
   _So that_ I can structure content effectively without design expertise.

4. **Edit Page Content**
   _As a_ content manager,
   _I want_ to edit text, images, and layout directly on a page,
   _So that_ I can update content quickly without navigating complex menus.

5. **Preview Before Publish**
   _As a_ content manager,
   _I want_ to preview my changes across devices before publishing,
   _So that_ I can catch issues before they go live.

6. **Publish/Unpublish**
   _As a_ content manager,
   _I want_ to publish or unpublish pages with one click,
   _So that_ I control what's visible without delays.

#### System/Background

1. **Theme Asset Generation** - When AI generates a theme, the system produces Tailwind CSS configurations and shadcn/ui-compatible component styles (following the existing Next.js 15 + Tailwind + shadcn/ui stack).
2. **Content Auto-Save** - When content is edited, changes are automatically saved as drafts.
3. **Site Rendering** - When a page is published, the system renders and serves it efficiently.

### Technical Constraints

- **Stack:** Next.js 15 (App Router) with React 19
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Drizzle ORM with PostgreSQL
- **Authentication:** Supabase
- **Background Jobs:** Trigger.dev
- **AI Integration:** OpenAI API for theme/layout generation

### Value-Adding Features

#### MVP

- **AI Layout Suggestions:** Describe content and get AI-recommended page layouts to structure pages effectively

#### Future Versions

- **Version History:** Roll back content or design changes to previous states for safe experimentation
- **Export/Backup:** Export sites as static files or backup configurations for data ownership
- **Content Templates:** Save and reuse page/section templates across sites to reduce repetitive work
- **Component Library Browser:** Browse and insert pre-styled shadcn/ui components directly
- **Multi-Site Dashboard:** Manage all sites from one central view
