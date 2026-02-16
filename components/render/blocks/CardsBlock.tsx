import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type {
  CardsContent,
  FeatureCardItem,
  TestimonialCardItem,
  ProductCardItem,
  ProductIconStyle,
} from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getSmallStyles,
  getCardStyles,
  getButtonStyles,
  getOutlineButtonStyles,
} from "../utilities/theme-styles";
import { Icon } from "../utilities/icon-resolver";
import {
  ProductIcon,
  PRODUCT_PLATFORM_LABELS,
} from "@/lib/product-icons";
import { transformUrl } from "@/lib/url-utils";
import { Quote } from "lucide-react";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
  TEXT_SIZES,
} from "@/lib/styling-utils";

interface CardsBlockProps {
  content: CardsContent;
  theme: ThemeData;
  basePath?: string;
}

// Layout utility maps
const gapMap = {
  small: "gap-4",
  medium: "gap-6",
  large: "gap-8",
};

const columnsMap = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

// Legacy aliases for existing code
const borderWidthMap = BORDER_WIDTHS;
const borderRadiusMap = BORDER_RADII;
const textSizeScale = {
  small: TEXT_SIZES.small.scale,
  normal: TEXT_SIZES.normal.scale,
  large: TEXT_SIZES.large.scale,
};

// Type guards for card items
function isFeatureCardItem(item: unknown): item is FeatureCardItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "icon" in item &&
    "title" in item &&
    "description" in item
  );
}

function isTestimonialCardItem(item: unknown): item is TestimonialCardItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "quote" in item &&
    "author" in item &&
    "role" in item
  );
}

function isProductCardItem(item: unknown): item is ProductCardItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "links" in item &&
    Array.isArray((item as ProductCardItem).links)
  );
}

// =============================================================================
// Feature Card Component
// =============================================================================
interface FeatureCardProps {
  item: FeatureCardItem;
  theme: ThemeData;
  basePath: string;
  titleColor: string;
  descriptionColor: string;
  textScale: number;
  cardStyles: React.CSSProperties;
}

function FeatureCard({
  item,
  theme,
  basePath,
  titleColor,
  descriptionColor,
  textScale,
  cardStyles,
}: FeatureCardProps) {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={cardStyles}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
        style={{
          backgroundColor: "var(--color-primary)",
          transform: `scale(${textScale})`,
        }}
      >
        <Icon name={item.icon} className="text-white" size={28} />
      </div>
      <h3
        className="mb-1"
        style={{
          ...getHeadingStyles(theme, "h4"),
          color: titleColor,
          fontSize: `calc(${getHeadingStyles(theme, "h4").fontSize} * ${textScale})`,
        }}
      >
        {item.title}
      </h3>
      {item.subtitle && (
        <p
          className="mb-2"
          style={{
            ...getBodyStyles(theme),
            color: "var(--color-primary)",
            fontWeight: 500,
            fontSize: `calc(${theme.typography.scale.small} * ${textScale})`,
          }}
        >
          {item.subtitle}
        </p>
      )}
      <p
        style={{
          ...getBodyStyles(theme),
          color: descriptionColor,
          fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
        }}
      >
        {item.description}
      </p>
      {item.showButton && item.buttonText && item.buttonUrl && (
        <>
          <div className="flex-grow" />
          <a
            href={transformUrl(basePath, item.buttonUrl)}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              ...(item.buttonVariant === "primary"
                ? getButtonStyles(theme)
                : getOutlineButtonStyles(theme)),
              fontSize: `calc(0.875rem * ${textScale})`,
            }}
          >
            {item.buttonText}
          </a>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Testimonial Card Component
// =============================================================================
interface TestimonialCardProps {
  item: TestimonialCardItem;
  theme: ThemeData;
  quoteColor: string;
  authorColor: string;
  roleColor: string;
  textScale: number;
  cardStyles: React.CSSProperties;
}

function TestimonialCard({
  item,
  theme,
  quoteColor,
  authorColor,
  roleColor,
  textScale,
  cardStyles,
}: TestimonialCardProps) {
  return (
    <div className="flex flex-col" style={cardStyles}>
      <Quote
        className="mb-4 opacity-20"
        size={32 * textScale}
        style={{ color: "var(--color-primary)" }}
      />
      <blockquote
        className="flex-1 mb-6"
        style={{
          ...getBodyStyles(theme),
          fontStyle: "italic",
          color: quoteColor,
          fontSize: `calc(${getBodyStyles(theme).fontSize || "1rem"} * ${textScale})`,
        }}
      >
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        {item.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.avatar}
            alt={item.avatarAlt || item.author}
            className="w-12 h-12 rounded-full object-cover"
            style={{ transform: `scale(${textScale})` }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
            style={{
              backgroundColor: "var(--color-primary)",
              transform: `scale(${textScale})`,
            }}
          >
            {item.author.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p
            style={{
              ...getHeadingStyles(theme, "h4"),
              fontSize: `calc(${theme.typography.scale.body} * ${textScale})`,
              color: authorColor,
            }}
          >
            {item.author}
          </p>
          {item.role && (
            <p
              style={{
                ...getSmallStyles(theme),
                color: roleColor,
                fontSize: `calc(${getSmallStyles(theme).fontSize || "0.875rem"} * ${textScale})`,
              }}
            >
              {item.role}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Product Card Component
// =============================================================================
interface ProductCardProps {
  item: ProductCardItem;
  iconStyle: ProductIconStyle;
  themePrimaryColor: string;
  showTitle: boolean;
  showDescription: boolean;
}

function ProductCard({
  item,
  iconStyle,
  themePrimaryColor,
  showTitle,
  showDescription,
}: ProductCardProps) {
  const hasTextContent =
    (showTitle && item.title) || (showDescription && item.description);

  // Get the featured link URL if set
  const featuredLink =
    item.featuredLinkIndex !== undefined &&
    item.featuredLinkIndex >= 0 &&
    item.featuredLinkIndex < item.links.length
      ? item.links[item.featuredLinkIndex]
      : null;

  // Image content component
  const imageContent = item.image ? (
    <div className="relative aspect-square overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt={item.imageAlt || item.title || "Product"}
        className="w-full h-full object-cover"
      />
    </div>
  ) : (
    <div className="aspect-square bg-muted flex items-center justify-center">
      <span className="text-muted-foreground text-sm">No image</span>
    </div>
  );

  return (
    <div className="flex flex-col bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
      {/* Image - wrapped in link if featuredLinkIndex is set */}
      {featuredLink ? (
        <a
          href={featuredLink.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          {imageContent}
        </a>
      ) : (
        imageContent
      )}

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {showTitle && item.title && (
          <h3
            className="font-semibold text-lg mb-1 line-clamp-2 text-center"
            style={{ color: "var(--color-foreground)" }}
          >
            {item.title}
          </h3>
        )}

        {showDescription && item.description && (
          <p
            className="text-sm mb-4 flex-1 line-clamp-2 text-center"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {item.description}
          </p>
        )}

        {/* Action Links - Centered */}
        {item.links.length > 0 && (
          <div
            className={`flex flex-wrap gap-2 justify-center ${hasTextContent ? "mt-auto pt-2" : ""}`}
          >
            {item.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title={
                  link.platform === "custom" && link.label
                    ? link.label
                    : PRODUCT_PLATFORM_LABELS[link.platform]
                }
              >
                <ProductIcon
                  platform={link.platform}
                  style={iconStyle}
                  size="medium"
                  primaryColor={themePrimaryColor}
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Section Header Component
// =============================================================================
interface SectionHeaderProps {
  title?: string;
  subtitle?: string;
  theme: ThemeData;
  titleColor: string;
  descriptionColor: string;
  textScale: number;
}

function SectionHeader({
  title,
  subtitle,
  theme,
  titleColor,
  descriptionColor,
  textScale,
}: SectionHeaderProps) {
  if (!title && !subtitle) return null;

  return (
    <div className="text-center mb-12">
      {title && (
        <h2
          className="mb-3"
          style={{
            ...getHeadingStyles(theme, "h2"),
            color: titleColor,
            fontSize: `calc(${getHeadingStyles(theme, "h2").fontSize} * ${textScale})`,
          }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
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
          {subtitle}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// Main CardsBlock Component
// =============================================================================
export function CardsBlock({
  content,
  theme,
  basePath = "",
}: CardsBlockProps) {
  const { template, items } = content;

  // Empty state
  if (!items || items.length === 0) {
    return (
      <section
        className="py-16 px-6"
        style={{
          backgroundColor:
            template === "product"
              ? "var(--color-background)"
              : "var(--color-background)",
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: "var(--color-muted-foreground)" }}>
            No{" "}
            {template === "feature"
              ? "features"
              : template === "testimonial"
                ? "testimonials"
                : "items"}{" "}
            added
          </p>
        </div>
      </section>
    );
  }

  // Product template uses CSS grid layout (different from flex)
  if (template === "product") {
    return <ProductGridRenderer content={content} theme={theme} />;
  }

  // Feature and Testimonial templates share similar flex layout
  return (
    <FlexCardsRenderer
      content={content}
      theme={theme}
      basePath={basePath}
    />
  );
}

// =============================================================================
// Flex-based renderer for Feature & Testimonial templates
// =============================================================================
interface FlexCardsRendererProps {
  content: CardsContent;
  theme: ThemeData;
  basePath: string;
}

function FlexCardsRenderer({
  content,
  theme,
  basePath,
}: FlexCardsRendererProps) {
  const { template, items, sectionTitle, sectionSubtitle } = content;
  const isFeature = template === "feature";

  // Plain mode (styling disabled) - original behavior
  if (!content.enableStyling) {
    return (
      <section
        className="py-16 px-6"
        style={{
          backgroundColor: isFeature
            ? "var(--color-muted)"
            : "var(--color-background)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          {(sectionTitle || sectionSubtitle) && (
            <div className="text-center mb-12">
              {sectionTitle && (
                <h2 className="mb-3" style={getHeadingStyles(theme, "h2")}>
                  {sectionTitle}
                </h2>
              )}
              {sectionSubtitle && (
                <p
                  style={{
                    ...getBodyStyles(theme),
                    color: "var(--color-muted-foreground)",
                    maxWidth: "600px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  {sectionSubtitle}
                </p>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              justifyContent: "center",
            }}
          >
            {items.map((item, index) => {
              if (isFeature && isFeatureCardItem(item)) {
                return (
                  <div
                    key={item.id || index}
                    className="flex flex-col items-center text-center"
                    style={{
                      ...getCardStyles(theme),
                      flex: "1 1 280px",
                      maxWidth: "400px",
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      <Icon name={item.icon} className="text-white" size={28} />
                    </div>
                    <h3 className="mb-1" style={getHeadingStyles(theme, "h4")}>
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p
                        className="mb-2"
                        style={{
                          ...getBodyStyles(theme),
                          color: "var(--color-primary)",
                          fontWeight: 500,
                          fontSize: theme.typography.scale.small,
                        }}
                      >
                        {item.subtitle}
                      </p>
                    )}
                    <p
                      style={{
                        ...getBodyStyles(theme),
                        color: "var(--color-muted-foreground)",
                      }}
                    >
                      {item.description}
                    </p>
                    {item.showButton && item.buttonText && item.buttonUrl && (
                      <>
                        <div className="flex-grow" />
                        <a
                          href={transformUrl(basePath, item.buttonUrl)}
                          className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                          style={
                            item.buttonVariant === "primary"
                              ? getButtonStyles(theme)
                              : getOutlineButtonStyles(theme)
                          }
                        >
                          {item.buttonText}
                        </a>
                      </>
                    )}
                  </div>
                );
              }

              if (!isFeature && isTestimonialCardItem(item)) {
                return (
                  <div
                    key={item.id || index}
                    className="flex flex-col"
                    style={{
                      ...getCardStyles(theme),
                      flex: "1 1 280px",
                      maxWidth: "400px",
                    }}
                  >
                    <Quote
                      className="mb-4 opacity-20"
                      size={32}
                      style={{ color: "var(--color-primary)" }}
                    />
                    <blockquote
                      className="flex-1 mb-6"
                      style={{
                        ...getBodyStyles(theme),
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      {item.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.avatar}
                          alt={item.avatarAlt || item.author}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          {item.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p
                          style={{
                            ...getHeadingStyles(theme, "h4"),
                            fontSize: theme.typography.scale.body,
                          }}
                        >
                          {item.author}
                        </p>
                        {item.role && (
                          <p style={getSmallStyles(theme)}>{item.role}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
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
    ? hexToRgba(
        content.overlayColor || "#000000",
        content.overlayOpacity ?? 0
      )
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

  // Card styles
  const cardStyles: React.CSSProperties = {
    flex: "1 1 280px",
    maxWidth: "400px",
  };

  if (showCardBackground) {
    if (content.cardBackgroundColor) {
      cardStyles.backgroundColor = content.cardBackgroundColor;
      cardStyles.padding = "1.5rem";
      cardStyles.borderRadius = "0.5rem";
    } else {
      Object.assign(cardStyles, getCardStyles(theme));
    }
  }

  // Text colors based on mode
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
        titleColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
      } else if (hasBackgroundImage) {
        titleColor = "#FFFFFF";
        descriptionColor = "rgba(255, 255, 255, 0.8)";
      } else {
        titleColor = "var(--color-foreground)";
        descriptionColor = "var(--color-muted-foreground)";
      }
  }

  return (
    <section className="py-16 px-6" style={sectionStyles}>
      {/* Overlay layer */}
      {hasOverlay && overlayRgba && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayRgba }}
        />
      )}

      {/* Content container */}
      <div
        className="relative z-10 max-w-6xl mx-auto"
        style={containerStyles}
      >
        {/* Section Header */}
        <SectionHeader
          title={sectionTitle}
          subtitle={sectionSubtitle}
          theme={theme}
          titleColor={titleColor}
          descriptionColor={descriptionColor}
          textScale={textScale}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "center",
          }}
        >
          {items.map((item, index) => {
            if (isFeature && isFeatureCardItem(item)) {
              return (
                <FeatureCard
                  key={item.id || index}
                  item={item}
                  theme={theme}
                  basePath={basePath}
                  titleColor={titleColor}
                  descriptionColor={descriptionColor}
                  textScale={textScale}
                  cardStyles={cardStyles}
                />
              );
            }

            if (!isFeature && isTestimonialCardItem(item)) {
              return (
                <TestimonialCard
                  key={item.id || index}
                  item={item}
                  theme={theme}
                  quoteColor={descriptionColor}
                  authorColor={titleColor}
                  roleColor={descriptionColor}
                  textScale={textScale}
                  cardStyles={cardStyles}
                />
              );
            }

            return null;
          })}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Grid-based renderer for Product template
// =============================================================================
interface ProductGridRendererProps {
  content: CardsContent;
  theme: ThemeData;
}

function ProductGridRenderer({ content, theme }: ProductGridRendererProps) {
  const {
    items,
    sectionTitle,
    sectionSubtitle,
    columns = 3,
    gap = "medium",
    iconStyle = "brand",
    showItemTitles = true,
    showItemDescriptions = true,
  } = content;

  const themePrimaryColor = theme.colors.primary;
  const hasHeader = sectionTitle || sectionSubtitle;

  return (
    <section
      className="py-12 md:py-16 px-6"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        {hasHeader && (
          <div className="text-center mb-10">
            {sectionTitle && (
              <h2
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ color: "var(--color-foreground)" }}
              >
                {sectionTitle}
              </h2>
            )}
            {sectionSubtitle && (
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        <div className={`grid ${columnsMap[columns]} ${gapMap[gap]}`}>
          {items.map((item, index) => {
            if (isProductCardItem(item)) {
              return (
                <ProductCard
                  key={item.id || index}
                  item={item}
                  iconStyle={iconStyle}
                  themePrimaryColor={themePrimaryColor}
                  showTitle={showItemTitles}
                  showDescription={showItemDescriptions}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </section>
  );
}
