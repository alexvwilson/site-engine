import Link from "next/link";
import Image from "next/image";
import { getPublishedPostsBySite } from "@/lib/queries/blog";
import type { BlogGridContent, ImageFit } from "@/lib/section-types";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import { getHeadingStyles, getBodyStyles } from "../utilities/theme-styles";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
  TEXT_SIZES,
} from "@/lib/styling-utils";

interface BlogGridBlockProps {
  content: BlogGridContent;
  theme: ThemeData;
  siteId: string;
  basePath: string;
  pageId?: string;
  imageFit?: ImageFit;
}

// Legacy aliases for existing code
const borderWidthMap = BORDER_WIDTHS;
const borderRadiusMap = BORDER_RADII;
const textSizeScale = {
  small: TEXT_SIZES.small.scale,
  normal: TEXT_SIZES.normal.scale,
  large: TEXT_SIZES.large.scale,
};

// Helper to get card border color based on mode
function getCardBorderColor(
  mode: string | undefined,
  customColor: string | undefined
): string {
  switch (mode) {
    case "primary":
      return "var(--color-primary)";
    case "custom":
      return customColor || "#E5E7EB";
    case "default":
    default:
      return "var(--color-border)";
  }
}

export async function BlogGridBlock({
  content,
  theme,
  siteId,
  basePath,
  pageId,
  imageFit = "cover",
}: BlogGridBlockProps) {
  // Per-block author toggle (defaults to true for backwards compatibility)
  const showAuthor = content.showAuthor ?? true;
  // Resolve pageFilter to effective pageId for query
  let effectivePageId: string | null | undefined;

  const pageFilter = content.pageFilter ?? "all"; // Backwards compat for existing blocks

  if (pageFilter === "all") {
    effectivePageId = undefined; // No filter - all posts
  } else if (pageFilter === "current") {
    effectivePageId = pageId; // Use current page (undefined if no page context)
  } else if (pageFilter === "unassigned") {
    effectivePageId = null; // Only posts with no page assignment
  } else {
    effectivePageId = pageFilter; // Specific page ID
  }

  const posts = await getPublishedPostsBySite(
    siteId,
    content.postCount,
    0,
    effectivePageId
  );

  // Check if section header should be shown
  const hasSectionHeader = content.sectionTitle || content.sectionSubtitle;

  if (posts.length === 0) {
    return (
      <section
        className="py-16 text-center"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        {hasSectionHeader && (
          <div className="container mx-auto px-4 mb-8">
            {content.sectionTitle && (
              <h2
                className="mb-3"
                style={getHeadingStyles(theme, "h2")}
              >
                {content.sectionTitle}
              </h2>
            )}
            {content.sectionSubtitle && (
              <p
                style={{
                  ...getBodyStyles(theme),
                  color: "var(--color-muted-foreground)",
                  maxWidth: "600px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {content.sectionSubtitle}
              </p>
            )}
          </div>
        )}
        <p style={{ color: "var(--color-muted-foreground)" }}>
          No published posts yet.
        </p>
      </section>
    );
  }

  // Plain mode (styling disabled) - original behavior
  if (!content.enableStyling) {
    return (
      <section
        className="py-12 md:py-16"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <div className="container mx-auto px-4">
          {/* Section Header */}
          {hasSectionHeader && (
            <div className="text-center mb-10">
              {content.sectionTitle && (
                <h2
                  className="mb-3"
                  style={getHeadingStyles(theme, "h2")}
                >
                  {content.sectionTitle}
                </h2>
              )}
              {content.sectionSubtitle && (
                <p
                  style={{
                    ...getBodyStyles(theme),
                    color: "var(--color-muted-foreground)",
                    maxWidth: "600px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {content.sectionSubtitle}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const formattedDate = post.published_at
                ? new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "";

              return (
                <Link
                  key={post.id}
                  href={`${basePath}/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-lg border transition-all hover:shadow-lg"
                  style={{
                    borderColor: getCardBorderColor(
                      content.cardBorderMode,
                      content.cardBorderColor
                    ),
                    backgroundColor: "var(--color-background)",
                  }}
                >
                  {post.featured_image ? (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={post.featured_image}
                        alt={post.title}
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
                    <div className="aspect-video flex items-center justify-center bg-muted">
                      <svg
                        className="w-12 h-12"
                        style={{ color: "var(--color-muted-foreground)" }}
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
                  )}
                  <div className="p-5 space-y-3">
                    <h3
                      className="font-semibold text-lg line-clamp-2 group-hover:underline"
                      style={{
                        color: "var(--color-foreground)",
                        fontFamily: "var(--font-heading)",
                      }}
                    >
                      {post.title}
                    </h3>
                    {content.showExcerpt && post.excerpt && (
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
                    <div
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {showAuthor && post.authorName && (
                        <>
                          <span>{post.authorName}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Styled mode - full styling support
  const hasBackgroundImage = !!content.backgroundImage;
  const hasOverlay =
    (content.overlayOpacity ?? 0) > 0 ||
    (!hasBackgroundImage && content.overlayColor);
  const showBorder = content.showBorder ?? false;
  const showCardBackground = content.showCardBackground ?? true;
  const textScale = textSizeScale[content.textSize ?? "normal"];

  // Section background styles
  const sectionStyles: React.CSSProperties = {
    position: "relative",
  };

  if (hasBackgroundImage) {
    sectionStyles.backgroundImage = `url(${content.backgroundImage})`;
    sectionStyles.backgroundSize = "cover";
    sectionStyles.backgroundPosition = "center";
  }

  // Overlay color
  const overlayRgba = hasOverlay
    ? hexToRgba(content.overlayColor || "#000000", content.overlayOpacity ?? 0)
    : undefined;

  // Container styles (border + box background)
  const containerStyles: React.CSSProperties = {};

  if (showBorder) {
    const borderColor = content.borderColor || "var(--color-primary)";
    containerStyles.border = `${borderWidthMap[content.borderWidth ?? "medium"]} solid ${borderColor}`;
    containerStyles.borderRadius =
      borderRadiusMap[content.borderRadius ?? "medium"];
    containerStyles.padding = "2rem";

    // Box background
    if (content.useThemeBackground) {
      containerStyles.backgroundColor = "var(--color-background)";
    } else if (content.boxBackgroundColor) {
      containerStyles.backgroundColor = hexToRgba(
        content.boxBackgroundColor,
        content.boxBackgroundOpacity ?? 100
      );
    }
  }

  // Text color based on mode
  // When cards have backgrounds, text should be readable on the CARD, not the section
  let titleColor: string;
  let descriptionColor: string;

  switch (content.textColorMode) {
    case "light":
      titleColor = "#FFFFFF";
      descriptionColor = "rgba(255, 255, 255, 0.8)";
      break;
    case "dark":
      titleColor = "#1F2937";
      descriptionColor = "#6B7280";
      break;
    default: // auto
      if (showCardBackground) {
        // Cards have backgrounds - use theme colors (readable on card background)
        titleColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
      } else if (hasBackgroundImage) {
        // No card backgrounds, section has image - use light text
        titleColor = "#FFFFFF";
        descriptionColor = "rgba(255, 255, 255, 0.8)";
      } else {
        // No card backgrounds, no image - use theme colors
        titleColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
      }
  }

  // Card border color
  const cardBorderColor = getCardBorderColor(
    content.cardBorderMode,
    content.cardBorderColor
  );

  // Card styles
  const getCardStyle = (): React.CSSProperties => {
    if (!showCardBackground) {
      return {
        borderColor: "transparent",
        backgroundColor: "transparent",
      };
    }

    if (content.cardBackgroundColor) {
      return {
        borderColor: cardBorderColor,
        backgroundColor: content.cardBackgroundColor,
      };
    }

    return {
      borderColor: cardBorderColor,
      backgroundColor: "var(--color-background)",
    };
  };

  return (
    <section className="py-12 md:py-16" style={sectionStyles}>
      {/* Overlay layer */}
      {hasOverlay && overlayRgba && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayRgba }}
        />
      )}

      {/* Content container */}
      <div
        className="relative z-10 container mx-auto px-4"
        style={containerStyles}
      >
        {/* Section Header */}
        {hasSectionHeader && (
          <div className="text-center mb-10">
            {content.sectionTitle && (
              <h2
                className="mb-3"
                style={{
                  ...getHeadingStyles(theme, "h2"),
                  color: titleColor,
                  fontSize: `calc(${getHeadingStyles(theme, "h2").fontSize} * ${textScale})`,
                }}
              >
                {content.sectionTitle}
              </h2>
            )}
            {content.sectionSubtitle && (
              <p
                style={{
                  ...getBodyStyles(theme),
                  color: descriptionColor,
                  maxWidth: "600px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
                }}
              >
                {content.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const formattedDate = post.published_at
              ? new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "";

            const cardStyle = getCardStyle();

            return (
              <Link
                key={post.id}
                href={`${basePath}/blog/${post.slug}`}
                className="group block overflow-hidden rounded-lg border transition-all hover:shadow-lg"
                style={cardStyle}
              >
                {post.featured_image ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.featured_image}
                      alt={post.title}
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
                  <div className="aspect-video flex items-center justify-center bg-muted">
                    <svg
                      className="w-12 h-12"
                      style={{ color: descriptionColor }}
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
                )}
                <div className="p-5 space-y-3">
                  <h3
                    className="font-semibold line-clamp-2 group-hover:underline"
                    style={{
                      color: titleColor,
                      fontFamily: "var(--font-heading)",
                      fontSize: `calc(1.125rem * ${textScale})`,
                    }}
                  >
                    {post.title}
                  </h3>
                  {content.showExcerpt && post.excerpt && (
                    <p
                      className="line-clamp-2"
                      style={{
                        color: descriptionColor,
                        fontFamily: "var(--font-body)",
                        fontSize: `calc(0.875rem * ${textScale})`,
                      }}
                    >
                      {post.excerpt}
                    </p>
                  )}
                  <div
                    className="flex items-center gap-2"
                    style={{
                      color: descriptionColor,
                      fontSize: `calc(0.75rem * ${textScale})`,
                    }}
                  >
                    {showAuthor && post.authorName && (
                      <>
                        <span>{post.authorName}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
