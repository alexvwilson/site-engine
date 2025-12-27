import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { FeaturesContent } from "@/lib/section-types";
import {
  getHeadingStyles,
  getBodyStyles,
  getCardStyles,
} from "../utilities/theme-styles";
import { Icon } from "../utilities/icon-resolver";

interface FeaturesBlockProps {
  content: FeaturesContent;
  theme: ThemeData;
}

export function FeaturesBlock({
  content,
  theme,
}: FeaturesBlockProps) {
  if (!content.features || content.features.length === 0) {
    return (
      <section
        className="py-16 px-6"
        style={{ backgroundColor: theme.colors.muted }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: theme.colors.mutedForeground }}>
            No features added
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-16 px-6"
      style={{ backgroundColor: theme.colors.muted }}
    >
      <div className="max-w-6xl mx-auto">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "center",
          }}
        >
          {content.features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
              style={{
                ...getCardStyles(theme),
                flex: "1 1 280px",
                maxWidth: "400px",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: theme.colors.primary }}
              >
                <Icon name={feature.icon} className="text-white" size={28} />
              </div>
              <h3
                className="mb-2"
                style={{
                  ...getHeadingStyles(theme, "h4"),
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  ...getBodyStyles(theme),
                  color: theme.colors.mutedForeground,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
