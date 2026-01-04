import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type {
  ProductGridContent,
  ProductItem,
  ProductIconStyle,
} from "@/lib/section-types";
import {
  ProductIcon,
  PRODUCT_PLATFORM_LABELS,
} from "@/lib/product-icons";

interface ProductGridBlockProps {
  content: ProductGridContent;
  theme: ThemeData;
}

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

function ProductCard({
  item,
  iconStyle,
  themePrimaryColor,
  showTitle,
  showDescription,
}: {
  item: ProductItem;
  iconStyle: ProductIconStyle;
  themePrimaryColor: string;
  showTitle: boolean;
  showDescription: boolean;
}) {
  const hasTextContent = (showTitle && item.title) || (showDescription && item.description);

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
        alt={item.title ?? "Product"}
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
            style={{ color: "var(--theme-foreground)" }}
          >
            {item.title}
          </h3>
        )}

        {showDescription && item.description && (
          <p
            className="text-sm mb-4 flex-1 line-clamp-2 text-center"
            style={{ color: "var(--theme-muted-foreground)" }}
          >
            {item.description}
          </p>
        )}

        {/* Action Links - Centered */}
        {item.links.length > 0 && (
          <div className={`flex flex-wrap gap-2 justify-center ${hasTextContent ? "mt-auto pt-2" : ""}`}>
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

export function ProductGridBlock({ content, theme }: ProductGridBlockProps) {
  const columns = content.columns ?? 3;
  const gap = content.gap ?? "medium";
  const iconStyle = content.iconStyle ?? "brand";
  const themePrimaryColor = theme.colors.primary;
  const showItemTitles = content.showItemTitles ?? true;
  const showItemDescriptions = content.showItemDescriptions ?? true;

  // No items to display
  if (!content.items || content.items.length === 0) {
    return null;
  }

  const hasHeader = content.sectionTitle || content.sectionSubtitle;

  return (
    <section
      className="py-12 md:py-16 px-6"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        {hasHeader && (
          <div className="text-center mb-10">
            {content.sectionTitle && (
              <h2
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ color: "var(--theme-foreground)" }}
              >
                {content.sectionTitle}
              </h2>
            )}
            {content.sectionSubtitle && (
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "var(--theme-muted-foreground)" }}
              >
                {content.sectionSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        <div className={`grid ${columnsMap[columns]} ${gapMap[gap]}`}>
          {content.items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              iconStyle={iconStyle}
              themePrimaryColor={themePrimaryColor}
              showTitle={showItemTitles}
              showDescription={showItemDescriptions}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
