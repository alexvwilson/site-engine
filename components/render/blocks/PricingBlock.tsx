"use client";

import { useState } from "react";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type {
  PricingContent,
  PricingTier,
  PricingFeature,
  PricingFeatureStatus,
} from "@/lib/section-types";
import { cn } from "@/lib/utils";
import { Check, X, Minus } from "lucide-react";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
  TEXT_SIZES,
} from "@/lib/styling-utils";
import {
  getButtonStyles,
  getOutlineButtonStyles,
} from "../utilities/theme-styles";

// Security: Validate URLs to prevent XSS via javascript: scheme
function getSafeHref(url: string, basePath: string): string {
  const trimmedUrl = url.trim().toLowerCase();
  if (trimmedUrl.startsWith("javascript:") || trimmedUrl.startsWith("data:")) {
    return "#";
  }
  return url.startsWith("/") ? `${basePath}${url}` : url;
}

interface PricingBlockProps {
  content: PricingContent;
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
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  auto: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

const borderRadiusMap = {
  none: "0",
  small: "0.375rem",
  medium: "0.5rem",
  large: "0.75rem",
};

const textSizeScale = {
  small: TEXT_SIZES.small.scale,
  normal: TEXT_SIZES.normal.scale,
  large: TEXT_SIZES.large.scale,
};

// =============================================================================
// PricingHeader Component
// =============================================================================
function PricingHeader({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  textScale,
}: {
  title?: string;
  subtitle?: string;
  titleColor: string;
  subtitleColor: string;
  textScale: number;
}) {
  if (!title && !subtitle) return null;

  return (
    <div className="mb-10 text-center">
      {title && (
        <h2
          className="mb-3 font-heading text-3xl font-bold md:text-4xl"
          style={{
            color: titleColor,
            fontSize: `calc(2.25rem * ${textScale})`,
          }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className="mx-auto max-w-2xl text-lg"
          style={{
            color: subtitleColor,
            fontSize: `calc(1.125rem * ${textScale})`,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// PricingToggle Component
// =============================================================================
function PricingToggle({
  labels,
  selected,
  onChange,
  primaryColor,
}: {
  labels: { monthly: string; annual: string };
  selected: "monthly" | "annual";
  onChange: (period: "monthly" | "annual") => void;
  primaryColor: string;
}) {
  return (
    <div className="mb-8 flex items-center justify-center gap-3">
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          selected === "monthly" ? "opacity-100" : "opacity-60"
        )}
      >
        {labels.monthly}
      </span>
      <button
        onClick={() => onChange(selected === "monthly" ? "annual" : "monthly")}
        className="relative h-7 w-14 rounded-full bg-muted transition-colors"
        style={{
          backgroundColor:
            selected === "annual" ? primaryColor : "var(--color-muted)",
        }}
        aria-label={`Switch to ${selected === "monthly" ? "annual" : "monthly"} billing`}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            selected === "annual" ? "translate-x-8" : "translate-x-1"
          )}
        />
      </button>
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          selected === "annual" ? "opacity-100" : "opacity-60"
        )}
      >
        {labels.annual}
      </span>
    </div>
  );
}

// =============================================================================
// PricingFeatureItem Component
// =============================================================================
function PricingFeatureItem({
  feature,
  textColor,
}: {
  feature: PricingFeature;
  textColor: string;
}) {
  const getStatusIcon = (status: PricingFeatureStatus) => {
    switch (status) {
      case "included":
        return <Check className="h-5 w-5 text-green-500" />;
      case "excluded":
        return <X className="h-5 w-5 text-muted-foreground opacity-50" />;
      case "limited":
        return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <li className="flex items-start gap-3 py-2">
      <span className="mt-0.5 shrink-0">{getStatusIcon(feature.status)}</span>
      <span
        className={cn(
          "text-sm",
          feature.status === "excluded" && "text-muted-foreground line-through"
        )}
        style={{ color: feature.status !== "excluded" ? textColor : undefined }}
        title={feature.tooltip}
      >
        {feature.text}
      </span>
    </li>
  );
}

// =============================================================================
// PricingCard Component
// =============================================================================
function PricingCard({
  tier,
  currency,
  customCurrency,
  period,
  customPeriod,
  showPeriod,
  isToggleMode,
  selectedPeriod,
  theme,
  basePath,
  cardRadius,
  showCardBackground,
  cardBackgroundColor,
  popularHighlightColor,
  textColor,
  textScale,
}: {
  tier: PricingTier;
  currency?: string;
  customCurrency?: string;
  period?: string;
  customPeriod?: string;
  showPeriod?: boolean;
  isToggleMode: boolean;
  selectedPeriod: "monthly" | "annual";
  theme: ThemeData;
  basePath: string;
  cardRadius: string;
  showCardBackground?: boolean;
  cardBackgroundColor?: string;
  popularHighlightColor?: string;
  textColor: string;
  textScale: number;
}) {
  // Determine which price to display
  const displayPrice = isToggleMode
    ? selectedPeriod === "annual"
      ? tier.priceAnnual || tier.price
      : tier.priceMonthly || tier.price
    : tier.price;

  // Determine currency symbol
  const currencySymbol =
    currency === "custom" ? customCurrency || "$" : currency || "$";

  // Determine period label
  const getPeriodLabel = () => {
    if (!showPeriod) return "";
    if (period === "custom") return customPeriod || "";
    switch (period) {
      case "monthly":
        return "/mo";
      case "annual":
        return "/year";
      case "one-time":
        return "";
      default:
        return "/mo";
    }
  };

  // Check if price is numeric
  const isNumericPrice = /^[\d,.\s]+$/.test(displayPrice);

  // Get button styles
  const getButtonStyle = () => {
    switch (tier.buttonVariant) {
      case "primary":
        return {
          ...getButtonStyles(theme),
          width: "100%",
          textAlign: "center" as const,
        };
      case "outline":
        return {
          ...getOutlineButtonStyles(theme),
          width: "100%",
          textAlign: "center" as const,
        };
      case "secondary":
      default:
        return {
          backgroundColor: "var(--color-muted)",
          color: "var(--color-foreground)",
          borderRadius: theme.components.button.borderRadius,
          padding: `${theme.components.button.paddingY} ${theme.components.button.paddingX}`,
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          display: "block",
          width: "100%",
          textAlign: "center" as const,
          textDecoration: "none",
          border: "none",
          cursor: "pointer",
        };
    }
  };

  // Card styles
  const cardStyles: React.CSSProperties = {
    borderRadius: cardRadius,
    backgroundColor: showCardBackground
      ? cardBackgroundColor || "var(--color-card)"
      : "transparent",
    border: tier.isPopular
      ? `2px solid ${popularHighlightColor || "var(--color-primary)"}`
      : "1px solid var(--color-border)",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col p-6",
        tier.isPopular && "ring-2 ring-offset-2"
      )}
      style={{
        ...cardStyles,
        ...(tier.isPopular && {
          boxShadow: `0 0 0 2px ${popularHighlightColor || "var(--color-primary)"}`,
        }),
      }}
    >
      {/* Popular Badge */}
      {tier.isPopular && tier.popularLabel && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-semibold text-white"
          style={{
            backgroundColor: popularHighlightColor || "var(--color-primary)",
          }}
        >
          {tier.popularLabel}
        </div>
      )}

      {/* Tier Name & Description */}
      <div className="mb-4">
        <h3
          className="text-xl font-bold"
          style={{
            color: textColor,
            fontSize: `calc(1.25rem * ${textScale})`,
          }}
        >
          {tier.name}
        </h3>
        {tier.description && (
          <p
            className="mt-1 text-sm text-muted-foreground"
            style={{ fontSize: `calc(0.875rem * ${textScale})` }}
          >
            {tier.description}
          </p>
        )}
      </div>

      {/* Price Display */}
      <div className="mb-6">
        {isNumericPrice ? (
          <div className="flex items-baseline gap-1">
            <span
              className="text-4xl font-bold"
              style={{
                color: textColor,
                fontSize: `calc(2.5rem * ${textScale})`,
              }}
            >
              {currencySymbol}
              {displayPrice}
            </span>
            {showPeriod && (
              <span className="text-muted-foreground">{getPeriodLabel()}</span>
            )}
          </div>
        ) : (
          <div
            className="text-3xl font-bold"
            style={{
              color: textColor,
              fontSize: `calc(1.875rem * ${textScale})`,
            }}
          >
            {displayPrice}
          </div>
        )}

        {/* Original Price (strikethrough) */}
        {tier.originalPrice && (
          <div className="mt-1 text-sm text-muted-foreground line-through">
            {currencySymbol}
            {tier.originalPrice}
          </div>
        )}

        {/* Annual Savings */}
        {isToggleMode && selectedPeriod === "annual" && tier.annualSavings && (
          <div className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {tier.annualSavings}
          </div>
        )}
      </div>

      {/* Features List */}
      <ul className="mb-6 flex-1 space-y-1">
        {tier.features.map((feature) => (
          <PricingFeatureItem
            key={feature.id}
            feature={feature}
            textColor={textColor}
          />
        ))}
      </ul>

      {/* CTA Button */}
      <a
        href={getSafeHref(tier.buttonUrl, basePath)}
        style={getButtonStyle()}
      >
        {tier.buttonText}
      </a>
    </div>
  );
}

// =============================================================================
// PricingTable Component (Comparison Mode)
// =============================================================================
function PricingTable({
  tiers,
  comparisonFeatures,
  currency,
  customCurrency,
  showPeriod,
  period,
  customPeriod,
  theme,
  basePath,
  cardRadius,
  popularHighlightColor,
  textColor,
  textScale,
}: {
  tiers: PricingTier[];
  comparisonFeatures?: string[];
  currency?: string;
  customCurrency?: string;
  showPeriod?: boolean;
  period?: string;
  customPeriod?: string;
  theme: ThemeData;
  basePath: string;
  cardRadius: string;
  popularHighlightColor?: string;
  textColor: string;
  textScale: number;
}) {
  const currencySymbol =
    currency === "custom" ? customCurrency || "$" : currency || "$";

  const getPeriodLabel = () => {
    if (!showPeriod) return "";
    if (period === "custom") return customPeriod || "";
    switch (period) {
      case "monthly":
        return "/mo";
      case "annual":
        return "/year";
      case "one-time":
        return "";
      default:
        return "/mo";
    }
  };

  // Build feature list from tiers if not provided
  const features =
    comparisonFeatures && comparisonFeatures.length > 0
      ? comparisonFeatures
      : tiers[0]?.features.map((f) => f.text) || [];

  const getFeatureStatus = (
    tier: PricingTier,
    featureIndex: number
  ): PricingFeatureStatus => {
    return tier.features[featureIndex]?.status || "excluded";
  };

  const getFeatureValue = (
    tier: PricingTier,
    featureIndex: number
  ): string | null => {
    const feature = tier.features[featureIndex];
    if (!feature) return null;
    // If feature text differs from header, show the value
    if (feature.text !== features[featureIndex]) {
      return feature.text;
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Header Row: Tier Names and Prices */}
        <thead>
          <tr>
            <th className="p-4 text-left" style={{ width: "200px" }}>
              <span className="sr-only">Feature</span>
            </th>
            {tiers.map((tier) => (
              <th
                key={tier.id}
                className={cn(
                  "p-4 text-center",
                  tier.isPopular && "relative"
                )}
                style={{
                  borderRadius: `${cardRadius} ${cardRadius} 0 0`,
                  backgroundColor: tier.isPopular
                    ? hexToRgba(popularHighlightColor || "#6366f1", 0.1)
                    : undefined,
                }}
              >
                {tier.isPopular && tier.popularLabel && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-white"
                    style={{
                      backgroundColor:
                        popularHighlightColor || "var(--color-primary)",
                    }}
                  >
                    {tier.popularLabel}
                  </div>
                )}
                <div
                  className="text-lg font-bold"
                  style={{
                    color: textColor,
                    fontSize: `calc(1.125rem * ${textScale})`,
                  }}
                >
                  {tier.name}
                </div>
                <div className="mt-2">
                  {/^[\d,.\s]+$/.test(tier.price) ? (
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color: textColor,
                        fontSize: `calc(1.5rem * ${textScale})`,
                      }}
                    >
                      {currencySymbol}
                      {tier.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        {getPeriodLabel()}
                      </span>
                    </span>
                  ) : (
                    <span
                      className="text-lg font-bold"
                      style={{ color: textColor }}
                    >
                      {tier.price}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Feature Rows */}
        <tbody>
          {features.map((featureName, featureIndex) => (
            <tr
              key={featureIndex}
              className="border-t border-border"
            >
              <td
                className="p-4 text-sm font-medium"
                style={{
                  color: textColor,
                  fontSize: `calc(0.875rem * ${textScale})`,
                }}
              >
                {featureName}
              </td>
              {tiers.map((tier) => {
                const status = getFeatureStatus(tier, featureIndex);
                const value = getFeatureValue(tier, featureIndex);

                return (
                  <td
                    key={tier.id}
                    className="p-4 text-center"
                    style={{
                      backgroundColor: tier.isPopular
                        ? hexToRgba(popularHighlightColor || "#6366f1", 0.05)
                        : undefined,
                    }}
                  >
                    {value ? (
                      <span
                        className="text-sm"
                        style={{
                          color: textColor,
                          fontSize: `calc(0.875rem * ${textScale})`,
                        }}
                      >
                        {value}
                      </span>
                    ) : status === "included" ? (
                      <Check className="mx-auto h-5 w-5 text-green-500" />
                    ) : status === "limited" ? (
                      <Minus className="mx-auto h-5 w-5 text-yellow-500" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-muted-foreground opacity-50" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>

        {/* CTA Row */}
        <tfoot>
          <tr className="border-t border-border">
            <td className="p-4"></td>
            {tiers.map((tier) => (
              <td
                key={tier.id}
                className="p-4 text-center"
                style={{
                  borderRadius: `0 0 ${cardRadius} ${cardRadius}`,
                  backgroundColor: tier.isPopular
                    ? hexToRgba(popularHighlightColor || "#6366f1", 0.1)
                    : undefined,
                }}
              >
                <a
                  href={getSafeHref(tier.buttonUrl, basePath)}
                  className="inline-block rounded-md px-6 py-2 text-sm font-medium transition-colors"
                  style={
                    tier.buttonVariant === "primary"
                      ? getButtonStyles(theme)
                      : tier.buttonVariant === "outline"
                        ? getOutlineButtonStyles(theme)
                        : {
                            backgroundColor: "var(--color-muted)",
                            color: "var(--color-foreground)",
                            borderRadius: theme.components.button.borderRadius,
                          }
                  }
                >
                  {tier.buttonText}
                </a>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// =============================================================================
// Main PricingBlock Component
// =============================================================================
export default function PricingBlock({
  content,
  theme,
  basePath = "",
}: PricingBlockProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "annual">(
    content.defaultPeriod || "monthly"
  );

  // Text color based on styling mode
  const textColorMode = content.textColorMode || "auto";
  // Section title/subtitle text colors (outside cards)
  const sectionTextColor =
    textColorMode === "light"
      ? "#FFFFFF"
      : textColorMode === "dark"
        ? "#1a1a1a"
        : "var(--color-foreground)";
  const subtitleColor =
    textColorMode === "light"
      ? "rgba(255,255,255,0.8)"
      : textColorMode === "dark"
        ? "#4a4a4a"
        : "var(--color-muted-foreground)";
  // Card text color - use card-foreground when showing card backgrounds
  // This ensures proper contrast regardless of card background color
  const cardTextColor =
    textColorMode === "light"
      ? "#FFFFFF"
      : textColorMode === "dark"
        ? "#1a1a1a"
        : content.showCardBackground && !content.cardBackgroundColor
          ? "var(--color-card-foreground)"
          : "var(--color-foreground)";

  // Text scale
  const textScale = textSizeScale[content.textSize || "normal"];

  // Card border radius
  const cardRadius =
    borderRadiusMap[content.cardBorderRadius || "medium"];

  // Section styling
  const sectionStyles: React.CSSProperties = {};

  if (content.enableStyling) {
    // Background image
    if (content.backgroundImage) {
      sectionStyles.backgroundImage = `url(${content.backgroundImage})`;
      sectionStyles.backgroundSize = "cover";
      sectionStyles.backgroundPosition = "center";
    }

    // Box background
    if (content.boxBackgroundColor && !content.useThemeBackground) {
      sectionStyles.backgroundColor = hexToRgba(
        content.boxBackgroundColor,
        (content.boxBackgroundOpacity || 100) / 100
      );
    }

    // Border
    if (content.showBorder) {
      sectionStyles.border = `${BORDER_WIDTHS[content.borderWidth || "medium"]} solid ${content.borderColor || "var(--color-border)"}`;
      sectionStyles.borderRadius = BORDER_RADII[content.borderRadius || "medium"];
    }
  }

  // Overlay for background image
  const hasOverlay =
    content.enableStyling &&
    content.backgroundImage &&
    (content.overlayOpacity || 0) > 0;

  return (
    <section
      className="relative px-4 py-12 md:px-6 md:py-16 lg:py-20"
      style={sectionStyles}
    >
      {/* Overlay */}
      {hasOverlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: hexToRgba(
              content.overlayColor || "#000000",
              (content.overlayOpacity || 0) / 100
            ),
          }}
        />
      )}

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <PricingHeader
          title={content.sectionTitle}
          subtitle={content.sectionSubtitle}
          titleColor={sectionTextColor}
          subtitleColor={subtitleColor}
          textScale={textScale}
        />

        {/* Toggle for Toggle Mode */}
        {content.mode === "toggle" && content.toggleLabels && (
          <PricingToggle
            labels={content.toggleLabels}
            selected={selectedPeriod}
            onChange={setSelectedPeriod}
            primaryColor="var(--color-primary)"
          />
        )}

        {/* Empty State */}
        {content.tiers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No pricing tiers configured. Add tiers in the editor.
            </p>
          </div>
        )}

        {/* Simple & Toggle Modes: Card Grid */}
        {content.tiers.length > 0 && (content.mode === "simple" || content.mode === "toggle") && (
          <div
            className={cn(
              "grid",
              columnsMap[content.columns || 3],
              gapMap[content.gap || "medium"]
            )}
          >
            {content.tiers.map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                currency={content.currency}
                customCurrency={content.customCurrency}
                period={content.period}
                customPeriod={content.customPeriod}
                showPeriod={content.showPeriod}
                isToggleMode={content.mode === "toggle"}
                selectedPeriod={selectedPeriod}
                theme={theme}
                basePath={basePath}
                cardRadius={cardRadius}
                showCardBackground={content.showCardBackground}
                cardBackgroundColor={content.cardBackgroundColor}
                popularHighlightColor={content.popularHighlightColor}
                textColor={cardTextColor}
                textScale={textScale}
              />
            ))}
          </div>
        )}

        {/* Comparison Mode: Feature Table */}
        {content.tiers.length > 0 && content.mode === "comparison" && (
          <PricingTable
            tiers={content.tiers}
            comparisonFeatures={content.comparisonFeatures}
            currency={content.currency}
            customCurrency={content.customCurrency}
            showPeriod={content.showPeriod}
            period={content.period}
            customPeriod={content.customPeriod}
            theme={theme}
            basePath={basePath}
            cardRadius={cardRadius}
            popularHighlightColor={content.popularHighlightColor}
            textColor={cardTextColor}
            textScale={textScale}
          />
        )}
      </div>
    </section>
  );
}
