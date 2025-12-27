# Wireframe Reference Doc

## ASCII / Markdown Mock-ups

### Dashboard `/app`

```
+----------------------------------------------------------+
| Logo          Dashboard                    [Avatar ▼]    |
|----------------------------------------------------------|
| Sidebar       |  My Sites                                |
|---------------|------------------------------------------|
| • Dashboard   |  [+ New Site]                            |
|   (active)    |                                          |
|               |  +----------------+  +----------------+  |
|               |  | Site Name 1    |  | Site Name 2    |  |
|               |  | [Published]    |  | [Draft]        |  |
|               |  | 5 pages        |  | 2 pages        |  |
|               |  | Updated: 2h ago|  | Updated: 1d ago|  |
|               |  +----------------+  +----------------+  |
|               |                                          |
|               |  +----------------+  +----------------+  |
|               |  | Site Name 3    |  | + Create Site  |  |
|               |  | [Draft]        |  | (empty state)  |  |
|               |  | 0 pages        |  |                |  |
|               |  +----------------+  +----------------+  |
+----------------------------------------------------------+
```

### Create Site Modal

```
+----------------------------------------+
|  Create New Site                   [X] |
|----------------------------------------|
|  Site Name *                           |
|  [________________________]            |
|                                        |
|  Description (optional)                |
|  [________________________]            |
|  [________________________]            |
|                                        |
|           [Cancel]  [Create Site]      |
+----------------------------------------+
```

### Site Detail - Pages Tab `/app/sites/[siteId]`

```
+----------------------------------------------------------+
| Logo    Dashboard > Site Name                [Avatar ▼]  |
|----------------------------------------------------------|
| Sidebar         |  Site Name              [Published ▼]  |
|-----------------|  [Publish/Unpublish] [Delete Site]     |
| • Dashboard     |----------------------------------------|
| --------------- |  [Pages]  [Theme]  [Settings]          |
| Site Name       |----------------------------------------|
|   • Pages       |                                        |
|   • Theme       |  Pages                    [+ Add Page] |
|   • Settings    |                                        |
|                 |  +------------------------------------+ |
|                 |  | Home                   [Published] | |
|                 |  | /                    Updated: 1h   | |
|                 |  | [Edit] [Duplicate] [Delete]       | |
|                 |  +------------------------------------+ |
|                 |  | About Us                  [Draft]  | |
|                 |  | /about               Updated: 2d   | |
|                 |  | [Edit] [Duplicate] [Delete]       | |
|                 |  +------------------------------------+ |
|                 |  | Contact                   [Draft]  | |
|                 |  | /contact             Updated: 3d   | |
|                 |  +------------------------------------+ |
+----------------------------------------------------------+
```

### Site Detail - Theme Tab `/app/sites/[siteId]?tab=theme`

```
+----------------------------------------------------------+
| Logo    Dashboard > Site Name                [Avatar ▼]  |
|----------------------------------------------------------|
| Sidebar         |  [Pages]  [Theme]  [Settings]          |
|-----------------|----------------------------------------|
|                 |  Current Theme                         |
|                 |                                        |
|                 |  Color Palette                         |
|                 |  [■ Primary] [■ Secondary] [■ Accent]  |
|                 |  [■ Background] [■ Text]               |
|                 |                                        |
|                 |  Typography                            |
|                 |  Headings: Inter Bold                  |
|                 |  Body: Inter Regular                   |
|                 |                                        |
|                 |  Component Preview                     |
|                 |  +----------------------------------+  |
|                 |  | [Button] [Card Sample] [Input]  |  |
|                 |  +----------------------------------+  |
|                 |                                        |
|                 |  [Generate New Theme]  [Save Changes]  |
+----------------------------------------------------------+
```

### AI Theme Generation Modal

```
+------------------------------------------------+
|  Generate New Theme                        [X] |
|------------------------------------------------|
|  Describe your desired look and feel:          |
|  +------------------------------------------+  |
|  | Modern, clean aesthetic with deep blue   |  |
|  | primary color. Professional but friendly.|  |
|  | Rounded corners, subtle shadows.         |  |
|  +------------------------------------------+  |
|                                                |
|  [=============>                    ] 45%      |
|  Creating typography settings...               |
|                                                |
|  ✓ Analyzing description                       |
|  ✓ Generating color palette                    |
|  → Creating typography settings                |
|  ○ Building component styles                   |
|  ○ Finalizing theme files                      |
|                                                |
|              [Cancel Generation]               |
+------------------------------------------------+
```

### AI Theme Generation Modal (Complete State)

```
+------------------------------------------------+
|  Theme Generated!                          [X] |
|------------------------------------------------|
|  Preview:                                      |
|  [■ Primary] [■ Secondary] [■ Accent]          |
|  Headings: Poppins | Body: Open Sans           |
|                                                |
|  +------------------------------------------+  |
|  | [Sample Button] [Sample Card]            |  |
|  +------------------------------------------+  |
|                                                |
|         [Try Again]  [Apply Theme]             |
+------------------------------------------------+
```

### Page Editor `/app/sites/[siteId]/pages/[pageId]`

```
+----------------------------------------------------------+
| ← Back to Site Name    Page Title [editable]   [Saved ✓] |
|                                    [Preview] [Publish ▼] |
|----------------------------------------------------------|
|                                                          |
|  Sections                      [Suggest Layout]          |
|                                                          |
|  +------------------------------------------------------+|
|  | ≡ Hero Section                              [Delete] ||
|  |   "Welcome to Our Site"                              ||
|  |   [Click to expand and edit]                         ||
|  +------------------------------------------------------+|
|                                                          |
|  +------------------------------------------------------+|
|  | ≡ Features Section (expanded)               [Delete] ||
|  |------------------------------------------------------|
|  |  Heading: [Our Features________________]             ||
|  |                                                      ||
|  |  Feature 1:                                          ||
|  |  Icon: [icon-picker]  Title: [Fast________]          ||
|  |  Description: [Lightning quick performance]          ||
|  |                                                      ||
|  |  Feature 2:                                          ||
|  |  Icon: [icon-picker]  Title: [Secure_____]           ||
|  |  Description: [Enterprise-grade security]            ||
|  |                                                      ||
|  |  [+ Add Feature]                                     ||
|  +------------------------------------------------------+|
|                                                          |
|  +------------------------------------------------------+|
|  | ≡ Text Section                              [Delete] ||
|  |   "Lorem ipsum dolor sit amet..."                    ||
|  +------------------------------------------------------+|
|                                                          |
|  +------------------------------------------------------+|
|  |              [+ Add Section]                         ||
|  +------------------------------------------------------+|
+----------------------------------------------------------+
```

### Block Picker (Add Section)

```
+------------------------------------------------+
|  Add Section                               [X] |
|------------------------------------------------|
|  Choose a block type:                          |
|                                                |
|  [Hero]      [Text]       [Image]              |
|  Headline    Rich text    Single image         |
|  + CTA       content      + caption            |
|                                                |
|  [Gallery]   [Features]   [CTA]                |
|  Image grid  Icon + text  Call to              |
|              list         action               |
|                                                |
|  [Testimonials] [Contact] [Footer]             |
|  Quotes +       Form      Links +              |
|  authors        builder   copyright            |
+------------------------------------------------+
```

### AI Layout Suggestions Modal

```
+------------------------------------------------+
|  Suggest Layout                            [X] |
|------------------------------------------------|
|  What is this page for?                        |
|  +------------------------------------------+  |
|  | A landing page for our SaaS product.     |  |
|  | Should highlight features, show pricing, |  |
|  | and have a strong call to action.        |  |
|  +------------------------------------------+  |
|                                                |
|              [Cancel]  [Generate Suggestions]  |
+------------------------------------------------+
```

### AI Layout Suggestions Modal (Loading State)

```
+------------------------------------------------+
|  Suggest Layout                            [X] |
|------------------------------------------------|
|                                                |
|  [Spinner] Generating layout suggestions...    |
|                                                |
+------------------------------------------------+
```

### AI Layout Suggestions Modal (Complete State)

```
+------------------------------------------------+
|  Suggested Layout                          [X] |
|------------------------------------------------|
|  Based on your description:                    |
|                                                |
|  ☑ Hero Section                                |
|    Eye-catching headline with CTA button       |
|                                                |
|  ☑ Features Section                            |
|    3-column feature highlights                 |
|                                                |
|  ☑ Testimonials Section                        |
|    Customer quotes to build trust              |
|                                                |
|  ☑ CTA Section                                 |
|    Final call to action before footer          |
|                                                |
|       [Dismiss]  [Add Selected Sections]       |
+------------------------------------------------+
```

### Page Preview `/app/sites/[siteId]/pages/[pageId]/preview`

```
+----------------------------------------------------------+
| ← Back to Editor      [Desktop] [Tablet] [Mobile]        |
|                                              [Publish]   |
|----------------------------------------------------------|
|                                                          |
|  +----------------------------------------------------+  |
|  |                                                    |  |
|  |          (Rendered page with theme applied)        |  |
|  |                                                    |  |
|  |  +----------------------------------------------+  |  |
|  |  |              HERO SECTION                    |  |  |
|  |  |         Welcome to Our Site                  |  |  |
|  |  |            [Get Started]                     |  |  |
|  |  +----------------------------------------------+  |  |
|  |                                                    |  |
|  |  +----------------------------------------------+  |  |
|  |  |            FEATURES SECTION                  |  |  |
|  |  |   [Icon]    [Icon]    [Icon]                 |  |  |
|  |  |   Fast      Secure    Simple                 |  |  |
|  |  +----------------------------------------------+  |  |
|  |                                                    |  |
|  +----------------------------------------------------+  |
|                                                          |
+----------------------------------------------------------+
```

### Login Page `/auth/login`

```
+------------------------------------------+
|              Site Engine                 |
|                                          |
|  +------------------------------------+  |
|  |          Welcome Back              |  |
|  |                                    |  |
|  |  Email                             |  |
|  |  [_________________________]       |  |
|  |                                    |  |
|  |  Password                          |  |
|  |  [_________________________]       |  |
|  |                                    |  |
|  |  [Forgot Password?]                |  |
|  |                                    |  |
|  |  [        Sign In        ]         |  |
|  |                                    |  |
|  |  ─────── or continue with ───────  |  |
|  |                                    |  |
|  |  [Google]          [GitHub]        |  |
|  +------------------------------------+  |
+------------------------------------------+
```

---

## Navigation Flow Map

```
/auth/login → Success → /app (Dashboard)

/app (Dashboard)
  ├─ [+ New Site] → Create Site Modal → /app/sites/[siteId]
  └─ Click Site Card → /app/sites/[siteId]

/app/sites/[siteId] (Site Detail - Tabbed)
  │
  ├─ [Pages Tab] (default)
  │   ├─ [+ Add Page] → Create Page Modal → /app/sites/[siteId]/pages/[pageId]
  │   └─ Click Page Row → /app/sites/[siteId]/pages/[pageId]
  │
  ├─ [Theme Tab]
  │   ├─ [Generate New Theme] → Theme Generation Modal (real-time progress)
  │   │                          ↓
  │   │                       Preview → [Apply Theme] → Saves to site
  │   └─ Manual color/font pickers → [Save Changes]
  │
  └─ [Settings Tab]
      ├─ Site info form → [Save Changes]
      └─ [Delete Site] → Confirmation → /app (Dashboard)

/app/sites/[siteId]/pages/[pageId] (Page Editor)
  │
  ├─ [← Back to Site] → /app/sites/[siteId]
  │
  ├─ [Suggest Layout] → Layout Suggestions Modal
  │                      ↓
  │                   [Add Selected Sections] → Sections added to page
  │
  ├─ [+ Add Section] → Block Picker Modal → Section added
  │
  ├─ Click Section → Inline Editor (expand in place)
  │   └─ Auto-save on field change (debounced)
  │
  ├─ Drag Section → Reorder (auto-save)
  │
  └─ [Preview] → /app/sites/[siteId]/pages/[pageId]/preview

/app/sites/[siteId]/pages/[pageId]/preview (Page Preview)
  ├─ [← Back to Editor] → /app/sites/[siteId]/pages/[pageId]
  ├─ Device Toggle: Desktop | Tablet | Mobile
  └─ [Publish] → Page published

(Phase 2 - Published Sites)
Custom Domain → Middleware lookup → /sites/[siteSlug]/[pageSlug]
```

---

## Page Summary

| Page | Route | Purpose |
|------|-------|---------|
| Login | `/auth/login` | Email/password + OAuth authentication |
| Dashboard | `/app` | Sites grid with create/manage actions |
| Site Detail | `/app/sites/[siteId]` | Tabbed interface: Pages, Theme, Settings |
| Page Editor | `/app/sites/[siteId]/pages/[pageId]` | Section builder with inline editing |
| Page Preview | `/app/sites/[siteId]/pages/[pageId]/preview` | Device-responsive preview |
| Published Site | `/sites/[siteSlug]/[pageSlug]` | Public-facing rendered pages (Phase 2) |

---

## AI Feature Modals

| Modal | Trigger | Real-time Progress | Output |
|-------|---------|-------------------|--------|
| Theme Generation | "Generate New Theme" button on Theme tab | Yes (5 stages, 0-100%) | Theme config to apply |
| Layout Suggestions | "Suggest Layout" button in Page Editor | No (simple spinner) | Section recommendations |

---

## Content Hierarchy

```
Sites (top-level container)
  └─ Pages (individual pages within site)
       └─ Sections (ordered content blocks)
            └─ Blocks (content type: Hero, Text, Image, etc.)
```

---

## Block Types Available

| Block | Description | Fields |
|-------|-------------|--------|
| Hero | Headline + CTA | Heading, subheading, CTA button, background image |
| Text | Rich text content | Rich text editor |
| Image | Single image | Image upload, optional caption |
| Gallery | Multiple images | Image grid layout |
| Features | Icon + text list | Multiple items with icon, title, description |
| CTA | Call to action | Heading, description, button |
| Testimonials | Customer quotes | Multiple items with quote, author |
| Contact | Form builder | Form field configuration |
| Footer | Site footer | Links, copyright text |

---

## Key Design Patterns

**Navigation:**
- Adaptive sidebar based on context (Dashboard vs Site vs Page Editor)
- Breadcrumb navigation always visible
- Page Editor collapses sidebar, uses top bar

**Editing:**
- Inline section editing (expand in place)
- Auto-save with debouncing (500ms delay)
- Drag-and-drop section reordering

**AI Features:**
- Theme generation: Modal with real-time progress (5 stages)
- Layout suggestions: Modal with simple loading spinner
- Both return results for user to accept/modify/reject

**Total Pages: 6 pages**
- Auth: 1 page (login)
- Protected: 4 pages (dashboard, site detail, page editor, page preview)
- Public: 1 page structure for published sites (Phase 2)
