import Link from "next/link";
import { getPublishedPostById, getPublishedPostsBySite } from "@/lib/queries/blog";
import type { BlogContent, ImageFit } from "@/lib/section-types";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import {
  truncateContent,
  getCardBorderColor,
  type TruncateResult,
} from "@/lib/blog-utils";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
} from "@/lib/styling-utils";
import {
  BlogPostImage,
  BlogPostMeta,
  BlogCategoryBadge,
  BlogPostExcerpt,
  BlogPostContentFull,
} from "../blog";
import { sectionDefaults } from "@/lib/section-defaults";

// =============================================================================
// Types
// =============================================================================

interface BlogBlockProps {
  content: BlogContent;
  theme: ThemeData;
  siteId: string;
  basePath: string;
  pageId?: string;
  siteImageFit?: ImageFit;
}

interface PostWithCategory {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: { html: string } | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  published_at: Date | null;
  authorName: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

interface FeaturedLayoutProps {
  post: PostWithCategory;
  postContent: TruncateResult;
  postUrl: string;
  settings: Required<BlogContent>;
  basePath: string;
}

interface GridLayoutProps {
  posts: PostWithCategory[];
  settings: Required<BlogContent>;
  basePath: string;
  theme: ThemeData;
  styled: boolean;
}

// =============================================================================
// Main BlogBlock Component
// =============================================================================

export async function BlogBlock({
  content,
  theme,
  siteId,
  basePath,
  pageId,
  siteImageFit = "cover",
}: BlogBlockProps): Promise<React.ReactElement> {
  // Merge with defaults
  const defaults = sectionDefaults.blog;
  const settings: Required<BlogContent> = {
    mode: content.mode ?? defaults.mode,
    sectionTitle: content.sectionTitle ?? defaults.sectionTitle,
    sectionSubtitle: content.sectionSubtitle ?? defaults.sectionSubtitle,
    postId: content.postId ?? defaults.postId,
    featuredLayout: content.featuredLayout ?? defaults.featuredLayout,
    showFullContent: content.showFullContent ?? defaults.showFullContent,
    contentLimit: content.contentLimit ?? defaults.contentLimit,
    showReadMore: content.showReadMore ?? defaults.showReadMore,
    gridLayout: content.gridLayout ?? defaults.gridLayout,
    postCount: content.postCount ?? defaults.postCount,
    columns: content.columns ?? defaults.columns,
    showExcerpt: content.showExcerpt ?? defaults.showExcerpt,
    pageFilter: content.pageFilter ?? defaults.pageFilter,
    showCategory: content.showCategory ?? defaults.showCategory,
    showAuthor: content.showAuthor ?? defaults.showAuthor,
    showDate: content.showDate ?? defaults.showDate,
    imageFit: content.imageFit ?? siteImageFit,
    cardBorderMode: content.cardBorderMode ?? defaults.cardBorderMode,
    cardBorderColor: content.cardBorderColor ?? defaults.cardBorderColor,
    imageBackgroundMode: content.imageBackgroundMode ?? defaults.imageBackgroundMode,
    imageBackgroundColor: content.imageBackgroundColor ?? defaults.imageBackgroundColor,
    enableStyling: content.enableStyling ?? defaults.enableStyling,
    textColorMode: content.textColorMode ?? defaults.textColorMode,
    showBorder: content.showBorder ?? defaults.showBorder,
    borderWidth: content.borderWidth ?? defaults.borderWidth,
    borderRadius: content.borderRadius ?? defaults.borderRadius,
    borderColor: content.borderColor ?? defaults.borderColor,
    boxBackgroundColor: content.boxBackgroundColor ?? defaults.boxBackgroundColor,
    boxBackgroundOpacity: content.boxBackgroundOpacity ?? defaults.boxBackgroundOpacity,
    useThemeBackground: content.useThemeBackground ?? defaults.useThemeBackground,
    backgroundImage: content.backgroundImage ?? defaults.backgroundImage,
    overlayColor: content.overlayColor ?? defaults.overlayColor,
    overlayOpacity: content.overlayOpacity ?? defaults.overlayOpacity,
    showCardBackground: content.showCardBackground ?? defaults.showCardBackground,
    cardBackgroundColor: content.cardBackgroundColor ?? defaults.cardBackgroundColor,
    textSize: content.textSize ?? defaults.textSize,
    contentWidth: content.contentWidth ?? defaults.contentWidth,
  } as Required<BlogContent>;

  // Route based on mode
  if (settings.mode === "featured") {
    return (
      <FeaturedRenderer
        settings={settings}
        theme={theme}
        basePath={basePath}
      />
    );
  }

  return (
    <GridRenderer
      settings={settings}
      theme={theme}
      siteId={siteId}
      basePath={basePath}
      pageId={pageId}
    />
  );
}

// =============================================================================
// Featured Renderer
// =============================================================================

async function FeaturedRenderer({
  settings,
  theme,
  basePath,
}: {
  settings: Required<BlogContent>;
  theme: ThemeData;
  basePath: string;
}): Promise<React.ReactElement> {
  if (!settings.postId) {
    return <EmptyState message="No post selected. Edit this section to choose a featured post." />;
  }

  const post = await getPublishedPostById(settings.postId);

  if (!post) {
    return <EmptyState message="Selected post is no longer available." />;
  }

  // Prepare content
  const postContent: TruncateResult =
    settings.showFullContent && post.content?.html
      ? truncateContent(post.content.html, settings.contentLimit)
      : { text: post.excerpt || "", paragraphs: [post.excerpt || ""], truncated: false };

  const shouldRenderHtml =
    settings.showFullContent &&
    !!post.content?.html &&
    !postContent.truncated;

  const postUrl = `${basePath}/blog/${post.slug}`;

  const layoutProps: FeaturedLayoutProps = {
    post,
    postContent,
    postUrl,
    settings,
    basePath,
  };

  // Wrap with styling if enabled
  const content = (() => {
    switch (settings.featuredLayout) {
      case "stacked":
        return <StackedLayout {...layoutProps} shouldRenderHtml={shouldRenderHtml} />;
      case "hero":
        return <HeroLayout {...layoutProps} />;
      case "minimal":
        return <MinimalLayout {...layoutProps} shouldRenderHtml={shouldRenderHtml} />;
      default:
        return <SplitLayout {...layoutProps} shouldRenderHtml={shouldRenderHtml} />;
    }
  })();

  // Apply SectionStyling wrapper if enabled
  if (settings.enableStyling) {
    return (
      <StyledSectionWrapper settings={settings} theme={theme}>
        {content}
      </StyledSectionWrapper>
    );
  }

  return content;
}

// =============================================================================
// Featured Layouts
// =============================================================================

function SplitLayout({
  post,
  postContent,
  postUrl,
  settings,
  basePath,
  shouldRenderHtml,
}: FeaturedLayoutProps & { shouldRenderHtml: boolean }): React.ReactElement {
  return (
    <section className="py-12 md:py-20" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <SectionHeader title={settings.sectionTitle} subtitle={settings.sectionSubtitle} />

        <div className="grid gap-8 md:grid-cols-2 items-center">
          <BlogPostImage
            src={post.featured_image}
            alt={post.featured_image_alt || post.title}
            className="aspect-video"
            linked
            url={postUrl}
            imageFit={settings.imageFit}
            imageBackgroundMode={settings.imageBackgroundMode}
            imageBackgroundColor={settings.imageBackgroundColor}
          />

          <div className="space-y-4">
            <BlogCategoryBadge
              name={post.categoryName}
              slug={post.categorySlug}
              basePath={basePath}
              linked={!!settings.showCategory}
            />
            {!settings.showCategory && <div />}

            <PostTitle post={post} url={postUrl} />

            {shouldRenderHtml && post.content?.html ? (
              <BlogPostContentFull html={post.content.html} />
            ) : postContent.text ? (
              <BlogPostExcerpt paragraphs={postContent.paragraphs} truncated={postContent.truncated} />
            ) : null}

            <BlogPostMeta
              authorName={post.authorName}
              publishedAt={post.published_at}
              showAuthor={settings.showAuthor}
              showDate={settings.showDate}
            />

            <ReadMoreLink
              show={settings.showReadMore}
              truncated={postContent.truncated}
              url={postUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function StackedLayout({
  post,
  postContent,
  postUrl,
  settings,
  basePath,
  shouldRenderHtml,
}: FeaturedLayoutProps & { shouldRenderHtml: boolean }): React.ReactElement {
  return (
    <section className="py-12 md:py-20" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionHeader title={settings.sectionTitle} subtitle={settings.sectionSubtitle} />

        <BlogPostImage
          src={post.featured_image}
          alt={post.featured_image_alt || post.title}
          className="aspect-video w-full mb-8"
          linked
          url={postUrl}
          imageFit={settings.imageFit}
          imageBackgroundMode={settings.imageBackgroundMode}
          imageBackgroundColor={settings.imageBackgroundColor}
        />

        <div className="space-y-4">
          <BlogCategoryBadge
            name={post.categoryName}
            slug={post.categorySlug}
            basePath={basePath}
            linked={!!settings.showCategory}
          />

          <PostTitle post={post} url={postUrl} size="lg" />

          <BlogPostMeta
            authorName={post.authorName}
            publishedAt={post.published_at}
            showAuthor={settings.showAuthor}
            showDate={settings.showDate}
          />

          {shouldRenderHtml && post.content?.html ? (
            <div className="mt-6">
              <BlogPostContentFull html={post.content.html} />
            </div>
          ) : postContent.text ? (
            <div className="mt-6">
              <BlogPostExcerpt paragraphs={postContent.paragraphs} truncated={postContent.truncated} />
            </div>
          ) : null}

          <ReadMoreLink
            show={settings.showReadMore}
            truncated={postContent.truncated}
            url={postUrl}
          />
        </div>
      </div>
    </section>
  );
}

function HeroLayout({
  post,
  postContent,
  postUrl,
  settings,
  basePath,
}: FeaturedLayoutProps): React.ReactElement {
  const hasImage = post.featured_image && post.featured_image.trim() !== "";
  const overlayRgba = hexToRgba(settings.overlayColor, settings.overlayOpacity / 100);

  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center py-20 px-6"
      style={{
        backgroundColor: hasImage ? undefined : "var(--color-primary)",
        backgroundImage: hasImage ? `url(${post.featured_image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: overlayRgba }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <SectionHeader
          title={settings.sectionTitle}
          subtitle={settings.sectionSubtitle}
          light
        />

        {settings.showCategory && (
          <BlogCategoryBadge
            name={post.categoryName}
            slug={post.categorySlug}
            basePath={basePath}
            variant="light"
          />
        )}

        <h2
          className="text-4xl md:text-5xl font-bold mb-4 mt-4"
          style={{ color: "#FFFFFF", fontFamily: "var(--font-heading)" }}
        >
          <Link href={postUrl} className="hover:underline">
            {post.title}
          </Link>
        </h2>

        {postContent.paragraphs.length > 0 && (
          <BlogPostExcerpt
            paragraphs={postContent.paragraphs}
            truncated={postContent.truncated}
            light
            className="mb-6 max-w-2xl mx-auto"
          />
        )}

        <BlogPostMeta
          authorName={post.authorName}
          publishedAt={post.published_at}
          showAuthor={settings.showAuthor}
          showDate={settings.showDate}
          light
          className="justify-center"
        />

        <ReadMoreLink
          show={settings.showReadMore}
          truncated={postContent.truncated}
          url={postUrl}
          light
          className="mt-6"
        />
      </div>
    </section>
  );
}

function MinimalLayout({
  post,
  postContent,
  postUrl,
  settings,
  basePath,
  shouldRenderHtml,
}: FeaturedLayoutProps & { shouldRenderHtml: boolean }): React.ReactElement {
  return (
    <section className="py-12 md:py-20" style={{ backgroundColor: "var(--color-background)" }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <SectionHeader title={settings.sectionTitle} subtitle={settings.sectionSubtitle} />

        <div className="space-y-4">
          <BlogCategoryBadge
            name={post.categoryName}
            slug={post.categorySlug}
            basePath={basePath}
            linked={!!settings.showCategory}
          />

          <PostTitle post={post} url={postUrl} size="lg" />

          <BlogPostMeta
            authorName={post.authorName}
            publishedAt={post.published_at}
            showAuthor={settings.showAuthor}
            showDate={settings.showDate}
          />

          {shouldRenderHtml && post.content?.html ? (
            <div className="border-t pt-6 mt-6" style={{ borderColor: "var(--color-border)" }}>
              <BlogPostContentFull html={post.content.html} />
            </div>
          ) : postContent.text ? (
            <div className="border-t pt-6 mt-6" style={{ borderColor: "var(--color-border)" }}>
              <BlogPostExcerpt paragraphs={postContent.paragraphs} truncated={postContent.truncated} />
            </div>
          ) : null}

          <ReadMoreLink
            show={settings.showReadMore}
            truncated={postContent.truncated}
            url={postUrl}
          />
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Grid Renderer
// =============================================================================

async function GridRenderer({
  settings,
  theme,
  siteId,
  basePath,
  pageId,
}: {
  settings: Required<BlogContent>;
  theme: ThemeData;
  siteId: string;
  basePath: string;
  pageId?: string;
}): Promise<React.ReactElement> {
  // Resolve pageFilter to effective pageId for query
  let effectivePageId: string | null | undefined;
  const pageFilter = settings.pageFilter;

  if (pageFilter === "all") {
    effectivePageId = undefined;
  } else if (pageFilter === "current") {
    effectivePageId = pageId;
  } else if (pageFilter === "unassigned") {
    effectivePageId = null;
  } else {
    effectivePageId = pageFilter;
  }

  const posts = await getPublishedPostsBySite(siteId, settings.postCount, 0, effectivePageId);

  if (posts.length === 0) {
    return (
      <section className="py-16 text-center" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="container mx-auto px-4">
          <SectionHeader title={settings.sectionTitle} subtitle={settings.sectionSubtitle} />
          <p style={{ color: "var(--color-muted-foreground)" }}>No published posts yet.</p>
        </div>
      </section>
    );
  }

  // Plain mode (styling disabled)
  if (!settings.enableStyling) {
    return (
      <section className="py-12 md:py-16" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="container mx-auto px-4">
          <SectionHeader title={settings.sectionTitle} subtitle={settings.sectionSubtitle} />
          <GridLayoutRenderer
            posts={posts}
            settings={settings}
            basePath={basePath}
            theme={theme}
          />
        </div>
      </section>
    );
  }

  // Styled mode
  return (
    <StyledSectionWrapper settings={settings} theme={theme}>
      <div className="container mx-auto px-4">
        <SectionHeader
          title={settings.sectionTitle}
          subtitle={settings.sectionSubtitle}
          textColorMode={settings.textColorMode}
          hasBackgroundImage={!!settings.backgroundImage}
          showCardBackground={settings.showCardBackground}
        />
        <GridLayoutRenderer
          posts={posts}
          settings={settings}
          basePath={basePath}
          theme={theme}
          styled
        />
      </div>
    </StyledSectionWrapper>
  );
}

// =============================================================================
// Grid Layouts
// =============================================================================

function GridLayoutRenderer({
  posts,
  settings,
  basePath,
  theme,
  styled = false,
}: {
  posts: PostWithCategory[];
  settings: Required<BlogContent>;
  basePath: string;
  theme: ThemeData;
  styled?: boolean;
}): React.ReactElement {
  switch (settings.gridLayout) {
    case "list":
      return <ListLayout posts={posts} settings={settings} basePath={basePath} theme={theme} styled={styled} />;
    case "magazine":
      return <MagazineLayout posts={posts} settings={settings} basePath={basePath} theme={theme} styled={styled} />;
    default:
      return <StandardGridLayout posts={posts} settings={settings} basePath={basePath} theme={theme} styled={styled} />;
  }
}

function StandardGridLayout({
  posts,
  settings,
  basePath,
  theme,
  styled,
}: GridLayoutProps): React.ReactElement {
  const columns = settings.columns;
  const gridCols = columns === 2
    ? "grid-cols-1 md:grid-cols-2"
    : columns === 4
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-6 ${gridCols}`}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          settings={settings}
          basePath={basePath}
          _theme={theme}
          _styled={styled}
        />
      ))}
    </div>
  );
}

function ListLayout({
  posts,
  settings,
  basePath,
  theme: _theme,
  styled: _styled,
}: GridLayoutProps): React.ReactElement {
  const cardBorderColor = getCardBorderColor(settings.cardBorderMode, settings.cardBorderColor);
  const showCardBackground = settings.showCardBackground;

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const postUrl = `${basePath}/blog/${post.slug}`;

        return (
          <Link
            key={post.id}
            href={postUrl}
            className="group flex gap-6 items-start rounded-lg border overflow-hidden transition-all hover:shadow-lg"
            style={{
              borderColor: cardBorderColor,
              backgroundColor: showCardBackground
                ? settings.cardBackgroundColor || "var(--color-background)"
                : "transparent",
            }}
          >
            <BlogPostImage
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-48 md:w-64 aspect-video shrink-0"
              imageFit={settings.imageFit}
              imageBackgroundMode={settings.imageBackgroundMode}
              imageBackgroundColor={settings.imageBackgroundColor}
            />

            <div className="flex-1 py-4 pr-4">
              {settings.showCategory && post.categoryName && (
                <span
                  className="inline-block px-2 py-0.5 text-xs font-medium rounded mb-2"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                  }}
                >
                  {post.categoryName}
                </span>
              )}

              <h3
                className="font-semibold text-lg md:text-xl line-clamp-2 group-hover:underline"
                style={{
                  color: "var(--color-foreground)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {post.title}
              </h3>

              {settings.showExcerpt && post.excerpt && (
                <p
                  className="text-sm line-clamp-2 mt-2"
                  style={{
                    color: "var(--color-muted-foreground)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {post.excerpt}
                </p>
              )}

              <BlogPostMeta
                authorName={post.authorName}
                publishedAt={post.published_at}
                showAuthor={settings.showAuthor}
                showDate={settings.showDate}
                className="mt-3 text-xs"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function MagazineLayout({
  posts,
  settings,
  basePath,
  theme: _theme,
  styled: _styled,
}: GridLayoutProps): React.ReactElement {
  const [featured, ...rest] = posts;
  const cardBorderColor = getCardBorderColor(settings.cardBorderMode, settings.cardBorderColor);
  const showCardBackground = settings.showCardBackground;

  if (!featured) {
    return <div />;
  }

  const featuredUrl = `${basePath}/blog/${featured.slug}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Featured post - large */}
      <Link
        href={featuredUrl}
        className="group lg:row-span-2 rounded-lg border overflow-hidden transition-all hover:shadow-lg"
        style={{
          borderColor: cardBorderColor,
          backgroundColor: showCardBackground
            ? settings.cardBackgroundColor || "var(--color-background)"
            : "transparent",
        }}
      >
        <BlogPostImage
          src={featured.featured_image}
          alt={featured.featured_image_alt || featured.title}
          className="aspect-[4/3] w-full"
          imageFit={settings.imageFit}
          imageBackgroundMode={settings.imageBackgroundMode}
          imageBackgroundColor={settings.imageBackgroundColor}
        />

        <div className="p-5 space-y-3">
          {settings.showCategory && featured.categoryName && (
            <span
              className="inline-block px-2 py-0.5 text-xs font-medium rounded"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
              }}
            >
              {featured.categoryName}
            </span>
          )}

          <h2
            className="text-2xl font-bold line-clamp-2 group-hover:underline"
            style={{
              color: "var(--color-foreground)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {featured.title}
          </h2>

          {settings.showExcerpt && featured.excerpt && (
            <p
              className="text-sm line-clamp-3"
              style={{
                color: "var(--color-muted-foreground)",
                fontFamily: "var(--font-body)",
              }}
            >
              {featured.excerpt}
            </p>
          )}

          <BlogPostMeta
            authorName={featured.authorName}
            publishedAt={featured.published_at}
            showAuthor={settings.showAuthor}
            showDate={settings.showDate}
          />
        </div>
      </Link>

      {/* Rest in smaller cards */}
      <div className="space-y-4">
        {rest.slice(0, 4).map((post) => {
          const postUrl = `${basePath}/blog/${post.slug}`;

          return (
            <Link
              key={post.id}
              href={postUrl}
              className="group flex gap-4 rounded-lg border overflow-hidden transition-all hover:shadow-md"
              style={{
                borderColor: cardBorderColor,
                backgroundColor: showCardBackground
                  ? settings.cardBackgroundColor || "var(--color-background)"
                  : "transparent",
              }}
            >
              <BlogPostImage
                src={post.featured_image}
                alt={post.featured_image_alt || post.title}
                className="w-32 aspect-video shrink-0"
                imageFit={settings.imageFit}
                imageBackgroundMode={settings.imageBackgroundMode}
                imageBackgroundColor={settings.imageBackgroundColor}
              />

              <div className="flex-1 py-2 pr-3">
                <h3
                  className="font-semibold text-sm line-clamp-2 group-hover:underline"
                  style={{
                    color: "var(--color-foreground)",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  {post.title}
                </h3>

                <BlogPostMeta
                  authorName={post.authorName}
                  publishedAt={post.published_at}
                  showAuthor={settings.showAuthor}
                  showDate={settings.showDate}
                  className="mt-1 text-xs"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Shared Components
// =============================================================================

function PostCard({
  post,
  settings,
  basePath,
  _theme,
  _styled,
}: {
  post: PostWithCategory;
  settings: Required<BlogContent>;
  basePath: string;
  _theme: ThemeData;
  _styled: boolean;
}): React.ReactElement {
  const postUrl = `${basePath}/blog/${post.slug}`;
  const cardBorderColor = getCardBorderColor(settings.cardBorderMode, settings.cardBorderColor);
  const showCardBackground = settings.showCardBackground;

  return (
    <Link
      href={postUrl}
      className="group block overflow-hidden rounded-lg border transition-all hover:shadow-lg"
      style={{
        borderColor: cardBorderColor,
        backgroundColor: showCardBackground
          ? settings.cardBackgroundColor || "var(--color-background)"
          : "transparent",
      }}
    >
      <BlogPostImage
        src={post.featured_image}
        alt={post.featured_image_alt || post.title}
        className="aspect-video w-full"
        imageFit={settings.imageFit}
        imageBackgroundMode={settings.imageBackgroundMode}
        imageBackgroundColor={settings.imageBackgroundColor}
      />

      <div className="p-5 space-y-3">
        {settings.showCategory && post.categoryName && (
          <span
            className="inline-block px-2 py-0.5 text-xs font-medium rounded"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            {post.categoryName}
          </span>
        )}

        <h3
          className="font-semibold text-lg line-clamp-2 group-hover:underline"
          style={{
            color: "var(--color-foreground)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {post.title}
        </h3>

        {settings.showExcerpt && post.excerpt && (
          <p
            className="text-sm line-clamp-2"
            style={{
              color: "var(--color-muted-foreground)",
              fontFamily: "var(--font-body)",
            }}
          >
            {post.excerpt}
          </p>
        )}

        <BlogPostMeta
          authorName={post.authorName}
          publishedAt={post.published_at}
          showAuthor={settings.showAuthor}
          showDate={settings.showDate}
          className="text-xs"
        />
      </div>
    </Link>
  );
}

function PostTitle({
  post,
  url,
  size = "default",
}: {
  post: PostWithCategory;
  url: string;
  size?: "default" | "lg";
}): React.ReactElement {
  const sizeClasses = size === "lg" ? "text-3xl md:text-4xl lg:text-5xl" : "text-3xl md:text-4xl";

  return (
    <h2
      className={`${sizeClasses} font-bold`}
      style={{
        color: "var(--color-foreground)",
        fontFamily: "var(--font-heading)",
      }}
    >
      <Link href={url} className="hover:underline">
        {post.title}
      </Link>
    </h2>
  );
}

function ReadMoreLink({
  show,
  truncated,
  url,
  light = false,
  className = "",
}: {
  show: boolean;
  truncated: boolean;
  url: string;
  light?: boolean;
  className?: string;
}): React.ReactElement | null {
  if (!show) {
    return null;
  }

  return (
    <div className={className}>
      <Link
        href={url}
        className="inline-flex items-center gap-1 text-sm font-medium hover:underline transition-colors"
        style={{
          color: light ? "rgba(255, 255, 255, 0.9)" : "var(--color-primary)",
        }}
      >
        {truncated ? "Read more" : "View post"}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  light = false,
  textColorMode,
  hasBackgroundImage,
  showCardBackground,
}: {
  title?: string;
  subtitle?: string;
  light?: boolean;
  textColorMode?: string;
  hasBackgroundImage?: boolean;
  showCardBackground?: boolean;
}): React.ReactElement | null {
  if (!title && !subtitle) {
    return null;
  }

  let titleColor = "var(--color-foreground)";
  let subtitleColor = "var(--color-muted-foreground)";

  if (light) {
    titleColor = "#FFFFFF";
    subtitleColor = "rgba(255, 255, 255, 0.8)";
  } else if (textColorMode === "light") {
    titleColor = "#FFFFFF";
    subtitleColor = "rgba(255, 255, 255, 0.8)";
  } else if (textColorMode === "dark") {
    titleColor = "#1F2937";
    subtitleColor = "#6B7280";
  } else if (hasBackgroundImage && !showCardBackground) {
    titleColor = "#FFFFFF";
    subtitleColor = "rgba(255, 255, 255, 0.8)";
  }

  return (
    <div className="text-center mb-10">
      {title && (
        <h2
          className="text-3xl font-bold mb-3"
          style={{ color: titleColor, fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className="max-w-2xl mx-auto"
          style={{ color: subtitleColor, fontFamily: "var(--font-body)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }): React.ReactElement {
  return (
    <section className="py-16 text-center" style={{ backgroundColor: "var(--color-muted)" }}>
      <p style={{ color: "var(--color-muted-foreground)" }}>{message}</p>
    </section>
  );
}

// =============================================================================
// Styled Section Wrapper
// =============================================================================

function StyledSectionWrapper({
  settings,
  theme,
  children,
}: {
  settings: Required<BlogContent>;
  theme: ThemeData;
  children: React.ReactNode;
}): React.ReactElement {
  const hasBackgroundImage = !!settings.backgroundImage;
  const hasOverlay = (settings.overlayOpacity ?? 0) > 0 || (!hasBackgroundImage && settings.overlayColor);
  const showBorder = settings.showBorder ?? false;

  const sectionStyles: React.CSSProperties = {
    position: "relative",
  };

  if (hasBackgroundImage) {
    sectionStyles.backgroundImage = `url(${settings.backgroundImage})`;
    sectionStyles.backgroundSize = "cover";
    sectionStyles.backgroundPosition = "center";
  } else if (!showBorder) {
    sectionStyles.backgroundColor = "var(--color-background)";
  }

  const overlayRgba = hasOverlay
    ? hexToRgba(settings.overlayColor || "#000000", settings.overlayOpacity ?? 0)
    : undefined;

  const containerStyles: React.CSSProperties = {};

  if (showBorder) {
    const borderColor = settings.borderColor || "var(--color-primary)";
    containerStyles.border = `${BORDER_WIDTHS[settings.borderWidth ?? "medium"]} solid ${borderColor}`;
    containerStyles.borderRadius = BORDER_RADII[settings.borderRadius ?? "medium"];
    containerStyles.padding = "2rem";

    if (settings.useThemeBackground) {
      containerStyles.backgroundColor = "var(--color-background)";
    } else if (settings.boxBackgroundColor) {
      containerStyles.backgroundColor = hexToRgba(
        settings.boxBackgroundColor,
        settings.boxBackgroundOpacity ?? 100
      );
    }
  }

  return (
    <section className="py-12 md:py-16" style={sectionStyles}>
      {hasOverlay && (
        <div className="absolute inset-0" style={{ backgroundColor: overlayRgba }} />
      )}
      <div className="relative z-10" style={containerStyles}>
        {children}
      </div>
    </section>
  );
}
