import Link from "next/link";
import Image from "next/image";
import { getPublishedPostById } from "@/lib/queries/blog";
import type { BlogFeaturedContent, ImageFit } from "@/lib/section-types";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import { hexToRgba } from "@/lib/styling-utils";

interface BlogFeaturedBlockProps {
  content: BlogFeaturedContent;
  theme: ThemeData;
  basePath: string;
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

interface TruncateResult {
  text: string;
  paragraphs: string[];
  truncated: boolean;
}

interface LayoutProps {
  post: PostWithCategory;
  postContent: TruncateResult;
  postUrl: string;
  settings: Required<BlogFeaturedContent>;
  formattedDate: string;
  htmlContent: string | null;
  shouldRenderHtml: boolean;
}

/**
 * Extract paragraphs from HTML and optionally truncate
 * Preserves paragraph structure for better formatting
 */
function truncateContent(html: string, limit: number): TruncateResult {
  // Extract text content from each paragraph, preserving structure
  const paragraphMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];

  // Clean each paragraph - remove HTML tags but keep the paragraph text
  const paragraphs = paragraphMatches
    .map(p => p.replace(/<[^>]*>/g, "").trim())
    .filter(p => p.length > 0);

  // If no paragraphs found, fall back to stripping all HTML
  if (paragraphs.length === 0) {
    const text = html.replace(/<[^>]*>/g, "").trim();
    if (limit <= 0 || text.length <= limit) {
      return { text, paragraphs: [text], truncated: false };
    }
    const truncatedText = text.slice(0, limit);
    const lastSpace = truncatedText.lastIndexOf(" ");
    const finalText = lastSpace > limit * 0.8 ? truncatedText.slice(0, lastSpace) : truncatedText;
    return { text: finalText, paragraphs: [finalText], truncated: true };
  }

  // Join for full text (for truncation calculation)
  const fullText = paragraphs.join(" ");

  // No truncation needed
  if (limit <= 0 || fullText.length <= limit) {
    return { text: fullText, paragraphs, truncated: false };
  }

  // Truncate while preserving paragraph boundaries where possible
  let charCount = 0;
  const truncatedParagraphs: string[] = [];
  let wasTruncated = false;

  for (const para of paragraphs) {
    if (charCount + para.length <= limit) {
      truncatedParagraphs.push(para);
      charCount += para.length + 1; // +1 for space between paragraphs
    } else {
      // This paragraph would exceed the limit
      const remaining = limit - charCount;
      if (remaining > 50 && truncatedParagraphs.length === 0) {
        // If first paragraph and we have reasonable space, truncate it
        const truncatedPara = para.slice(0, remaining);
        const lastSpace = truncatedPara.lastIndexOf(" ");
        truncatedParagraphs.push(lastSpace > remaining * 0.5 ? truncatedPara.slice(0, lastSpace) : truncatedPara);
      }
      wasTruncated = true;
      break;
    }
  }

  const finalText = truncatedParagraphs.join(" ");
  return { text: finalText, paragraphs: truncatedParagraphs, truncated: wasTruncated };
}

export async function BlogFeaturedBlock({
  content,
  basePath,
  siteImageFit = "cover",
}: BlogFeaturedBlockProps) {
  // Merge with defaults for backwards compatibility
  // Use block-level imageFit if set, otherwise fall back to site-level setting
  const settings: Required<BlogFeaturedContent> = {
    postId: content.postId ?? null,
    layout: content.layout ?? "split",
    showFullContent: content.showFullContent ?? false,
    contentLimit: content.contentLimit ?? 0,
    showReadMore: content.showReadMore ?? true,
    showCategory: content.showCategory ?? true,
    showAuthor: content.showAuthor ?? true,
    imageFit: content.imageFit ?? siteImageFit,
    overlayColor: content.overlayColor ?? "#000000",
    overlayOpacity: content.overlayOpacity ?? 50,
  };

  if (!settings.postId) {
    return (
      <section
        className="py-16 text-center"
        style={{ backgroundColor: "var(--theme-muted)" }}
      >
        <p style={{ color: "var(--theme-muted-text)" }}>
          No post selected. Edit this section to choose a featured post.
        </p>
      </section>
    );
  }

  const post = await getPublishedPostById(settings.postId);

  if (!post) {
    return (
      <section
        className="py-16 text-center"
        style={{ backgroundColor: "var(--theme-muted)" }}
      >
        <p style={{ color: "var(--theme-muted-text)" }}>
          Selected post is no longer available.
        </p>
      </section>
    );
  }

  // Prepare content text (used for plain text rendering or when truncating)
  const postContent: TruncateResult =
    settings.showFullContent && post.content?.html
      ? truncateContent(post.content.html, settings.contentLimit)
      : { text: post.excerpt || "", paragraphs: [post.excerpt || ""], truncated: false };

  // Determine if we should render full HTML content
  // Render HTML when: showFullContent is true, HTML exists, AND content wasn't truncated
  // (either no limit set, or content fits within the limit)
  const shouldRenderHtml =
    settings.showFullContent &&
    !!post.content?.html &&
    !postContent.truncated;

  const postUrl = `${basePath}/blog/${post.slug}`;
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const layoutProps: LayoutProps = {
    post,
    postContent,
    postUrl,
    settings,
    formattedDate,
    htmlContent: post.content?.html ?? null,
    shouldRenderHtml,
  };

  switch (settings.layout) {
    case "stacked":
      return <StackedLayout {...layoutProps} showAuthor={settings.showAuthor} imageFit={settings.imageFit} />;
    case "hero":
      return <HeroLayout {...layoutProps} showAuthor={settings.showAuthor} />;
    case "minimal":
      return <MinimalLayout {...layoutProps} showAuthor={settings.showAuthor} />;
    default:
      return <SplitLayout {...layoutProps} showAuthor={settings.showAuthor} imageFit={settings.imageFit} />;
  }
}

// ============================================
// SPLIT LAYOUT - Image left, content right
// ============================================
function SplitLayout({
  post,
  postContent,
  postUrl,
  settings,
  formattedDate,
  showAuthor,
  imageFit = "cover",
  htmlContent,
  shouldRenderHtml,
}: LayoutProps & { showAuthor: boolean; imageFit?: ImageFit }) {
  return (
    <section
      className="py-12 md:py-20"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          {/* Image */}
          <PostImage post={post} className="aspect-video" linked url={postUrl} imageFit={imageFit} />

          {/* Content */}
          <div className="space-y-4">
            <CategoryBadge post={post} show={settings.showCategory} />
            <PostTitle post={post} url={postUrl} />
            {shouldRenderHtml && htmlContent ? (
              <PostContentFull html={htmlContent} />
            ) : postContent.text ? (
              <PostText paragraphs={postContent.paragraphs} truncated={postContent.truncated} />
            ) : null}
            <PostMeta
              post={post}
              date={formattedDate}
              showAuthor={showAuthor}
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

// ============================================
// STACKED LAYOUT - Image on top, content below
// ============================================
function StackedLayout({
  post,
  postContent,
  postUrl,
  settings,
  formattedDate,
  showAuthor,
  imageFit = "cover",
  htmlContent,
  shouldRenderHtml,
}: LayoutProps & { showAuthor: boolean; imageFit?: ImageFit }) {
  return (
    <section
      className="py-12 md:py-20"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Image - full width */}
        <PostImage
          post={post}
          className="aspect-video w-full mb-8"
          linked
          url={postUrl}
          imageFit={imageFit}
        />

        {/* Content */}
        <div className="space-y-4">
          <CategoryBadge post={post} show={settings.showCategory} />
          <PostTitle post={post} url={postUrl} size="lg" />
          <PostMeta post={post} date={formattedDate} showAuthor={showAuthor} />
          {shouldRenderHtml && htmlContent ? (
            <div className="mt-6">
              <PostContentFull html={htmlContent} />
            </div>
          ) : postContent.text ? (
            <div className="mt-6">
              <PostText paragraphs={postContent.paragraphs} truncated={postContent.truncated} />
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

// ============================================
// HERO LAYOUT - Full-width background image
// ============================================
function HeroLayout({
  post,
  postContent,
  postUrl,
  settings,
  formattedDate,
  showAuthor,
}: LayoutProps & { showAuthor: boolean }) {
  const hasImage = post.featured_image && post.featured_image.trim() !== "";
  const overlayRgba = hexToRgba(
    settings.overlayColor,
    settings.overlayOpacity / 100
  );

  return (
    <section
      className="relative min-h-[500px] flex items-center justify-center py-20 px-6"
      style={{
        backgroundColor: hasImage ? undefined : "var(--theme-primary)",
        backgroundImage: hasImage
          ? `url(${post.featured_image})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayRgba }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <CategoryBadge post={post} show={settings.showCategory} light />

        <h2
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{
            color: "#FFFFFF",
            fontFamily: "var(--theme-font-heading)",
          }}
        >
          <Link href={postUrl} className="hover:underline">
            {post.title}
          </Link>
        </h2>

        {postContent.text && (
          <p
            className="text-lg mb-6 max-w-2xl mx-auto"
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontFamily: "var(--theme-font-body)",
            }}
          >
            {postContent.text}
            {postContent.truncated && "..."}
          </p>
        )}

        <PostMeta
          post={post}
          date={formattedDate}
          showAuthor={showAuthor}
          light
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

// ============================================
// MINIMAL LAYOUT - Text only, no image
// ============================================
function MinimalLayout({
  post,
  postContent,
  postUrl,
  settings,
  formattedDate,
  showAuthor,
  htmlContent,
  shouldRenderHtml,
}: LayoutProps & { showAuthor: boolean }) {
  return (
    <section
      className="py-12 md:py-20"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="space-y-4">
          <CategoryBadge post={post} show={settings.showCategory} />
          <PostTitle post={post} url={postUrl} size="lg" />
          <PostMeta post={post} date={formattedDate} showAuthor={showAuthor} />

          {shouldRenderHtml && htmlContent ? (
            <div
              className="border-t pt-6 mt-6"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <PostContentFull html={htmlContent} />
            </div>
          ) : postContent.text ? (
            <div
              className="border-t pt-6 mt-6"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <PostText paragraphs={postContent.paragraphs} truncated={postContent.truncated} />
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

// ============================================
// HELPER COMPONENTS
// ============================================

function PostImage({
  post,
  className,
  linked = false,
  url,
  imageFit = "cover",
}: {
  post: PostWithCategory;
  className?: string;
  linked?: boolean;
  url?: string;
  imageFit?: ImageFit;
}) {
  const imageContent = post.featured_image ? (
    <div
      className={`relative rounded-lg overflow-hidden ${className || ""}`}
      style={{ backgroundColor: imageFit === "contain" ? "var(--theme-muted)" : undefined }}
    >
      <Image
        src={post.featured_image}
        alt={post.featured_image_alt || post.title}
        fill
        className={`transition-transform duration-300 group-hover:scale-105 ${
          imageFit === "cover"
            ? "object-cover"
            : imageFit === "contain"
              ? "object-contain"
              : "object-fill"
        }`}
      />
    </div>
  ) : (
    <div
      className={`rounded-lg flex items-center justify-center ${className || ""}`}
      style={{ backgroundColor: "var(--theme-muted)" }}
    >
      <svg
        className="w-16 h-16"
        style={{ color: "var(--theme-muted-text)" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>
    </div>
  );

  if (linked && url) {
    return (
      <Link href={url} className="group block">
        {imageContent}
      </Link>
    );
  }

  return imageContent;
}

function PostTitle({
  post,
  url,
  size = "default",
}: {
  post: PostWithCategory;
  url: string;
  size?: "default" | "lg";
}) {
  const sizeClasses =
    size === "lg" ? "text-3xl md:text-4xl lg:text-5xl" : "text-3xl md:text-4xl";

  return (
    <h2
      className={`${sizeClasses} font-bold`}
      style={{
        color: "var(--theme-text)",
        fontFamily: "var(--theme-font-heading)",
      }}
    >
      <Link href={url} className="hover:underline">
        {post.title}
      </Link>
    </h2>
  );
}

function PostText({
  paragraphs,
  truncated = false,
}: {
  paragraphs: string[];
  truncated?: boolean;
}) {
  // If only one paragraph, render as before
  if (paragraphs.length <= 1) {
    return (
      <p
        className="text-lg leading-relaxed"
        style={{
          color: "var(--theme-muted-text)",
          fontFamily: "var(--theme-font-body)",
        }}
      >
        {paragraphs[0] || ""}
        {truncated && "..."}
      </p>
    );
  }

  // Multiple paragraphs - render with proper spacing
  return (
    <div
      className="space-y-4"
      style={{
        color: "var(--theme-muted-text)",
        fontFamily: "var(--theme-font-body)",
      }}
    >
      {paragraphs.map((para, index) => (
        <p key={index} className="text-lg leading-relaxed">
          {para}
          {truncated && index === paragraphs.length - 1 && "..."}
        </p>
      ))}
    </div>
  );
}

function PostContentFull({ html }: { html: string }) {
  return (
    <div
      className="prose prose-lg max-w-none [&_p]:mb-4 [&_p]:mt-0 [&_p:last-child]:mb-0 [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:my-4 [&_ol]:my-4 [&_blockquote]:my-6"
      style={{
        "--tw-prose-body": "var(--theme-text)",
        "--tw-prose-headings": "var(--theme-text)",
        "--tw-prose-lead": "var(--theme-muted-text)",
        "--tw-prose-links": "var(--theme-primary)",
        "--tw-prose-bold": "var(--theme-text)",
        "--tw-prose-counters": "var(--theme-muted-text)",
        "--tw-prose-bullets": "var(--theme-muted-text)",
        "--tw-prose-hr": "var(--theme-border)",
        "--tw-prose-quotes": "var(--theme-text)",
        "--tw-prose-quote-borders": "var(--theme-primary)",
        "--tw-prose-captions": "var(--theme-muted-text)",
        "--tw-prose-code": "var(--theme-text)",
        "--tw-prose-pre-code": "var(--theme-text)",
        "--tw-prose-pre-bg": "var(--theme-muted)",
        "--tw-prose-th-borders": "var(--theme-border)",
        "--tw-prose-td-borders": "var(--theme-border)",
        fontFamily: "var(--theme-font-body)",
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function PostMeta({
  post,
  date,
  showAuthor,
  light = false,
}: {
  post: PostWithCategory;
  date: string;
  showAuthor: boolean;
  light?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 text-sm"
      style={{ color: light ? "rgba(255, 255, 255, 0.8)" : "var(--theme-muted-text)" }}
    >
      {showAuthor && post.authorName && (
        <>
          <span>{post.authorName}</span>
          <span>•</span>
        </>
      )}
      <span>{date}</span>
    </div>
  );
}

function CategoryBadge({
  post,
  show,
  light = false,
}: {
  post: PostWithCategory;
  show: boolean;
  light?: boolean;
}) {
  if (!show || !post.categoryName) {
    return null;
  }

  return (
    <span
      className="inline-block px-3 py-1 text-xs font-medium rounded-full"
      style={{
        backgroundColor: light
          ? "rgba(255, 255, 255, 0.2)"
          : "var(--theme-primary)",
        color: light ? "#FFFFFF" : "var(--theme-primary-text)",
      }}
    >
      {post.categoryName}
    </span>
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
}) {
  // Only show if explicitly enabled AND content was truncated (or always show if showReadMore is true and there's content)
  if (!show) {
    return null;
  }

  return (
    <div className={className}>
      <Link
        href={url}
        className="inline-flex items-center gap-1 text-sm font-medium hover:underline transition-colors"
        style={{
          color: light ? "rgba(255, 255, 255, 0.9)" : "var(--theme-primary)",
        }}
      >
        {truncated ? "Read more" : "View post"}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
