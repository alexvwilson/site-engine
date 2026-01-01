import type { HeadingContent } from "@/lib/section-types";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import { getHeadingStyles } from "../utilities/theme-styles";
import { cn } from "@/lib/utils";

interface HeadingBlockProps {
  content: HeadingContent;
  theme: ThemeData;
}

export function HeadingBlock({ content, theme }: HeadingBlockProps) {
  const { title, subtitle, level, alignment, textColorMode } = content;

  // Determine text color based on mode
  let textColor: string;
  switch (textColorMode) {
    case "light":
      textColor = "#FFFFFF";
      break;
    case "dark":
      textColor = "#1F2937";
      break;
    default:
      textColor = "var(--color-foreground)";
  }

  // Get heading styles from theme
  const headingLevel = `h${level}` as "h1" | "h2" | "h3";
  const headingStyle = getHeadingStyles(theme, headingLevel);

  // Alignment classes
  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[alignment];

  // Subtitle size based on heading level
  const subtitleClass = {
    1: "text-xl",
    2: "text-lg",
    3: "text-base",
  }[level];

  // Render the appropriate heading tag
  const HeadingTag = headingLevel;

  return (
    <section className={cn("pt-6 pb-2 px-4", alignmentClass)}>
      <div className="max-w-4xl mx-auto">
        <HeadingTag
          style={{
            ...headingStyle,
            color: textColor,
          }}
        >
          {title}
        </HeadingTag>
        {subtitle && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              color: textColor,
              opacity: 0.8,
            }}
            className={cn("mt-4", subtitleClass)}
          >
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
