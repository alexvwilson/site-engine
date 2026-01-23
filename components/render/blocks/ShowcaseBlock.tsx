"use client";

import { useEffect, useState, useRef } from "react";
import { Download } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShowcaseContent, ShowcaseAnimationSpeed, StatItem, DownloadItem } from "@/lib/section-types";
import { FileIcon } from "@/lib/file-icons";
import { buildSectionStyles } from "@/lib/styling-utils";

// Animation duration mapping (milliseconds)
const ANIMATION_DURATIONS: Record<ShowcaseAnimationSpeed, number> = {
  fast: 1000,
  medium: 2000,
  slow: 3000,
};

/**
 * Get a Lucide icon by name
 */
function getIconByName(name: string): LucideIcon | null {
  // Convert kebab-case or snake_case to PascalCase
  const pascalName = name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const icon = icons[pascalName];
  return icon || null;
}

/**
 * Hook for counting up animation with Intersection Observer
 */
function useCountUp(
  target: number,
  speed: ShowcaseAnimationSpeed,
  shouldAnimate: boolean
): { count: number; ref: React.RefObject<HTMLDivElement | null> } {
  const [count, setCount] = useState(shouldAnimate ? 0 : target);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(target);
      return;
    }

    if (hasAnimated) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = ANIMATION_DURATIONS[speed];
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(target * eased));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [target, speed, shouldAnimate, hasAnimated]);

  return { count, ref };
}

/**
 * Individual stat card with animated counter
 */
function StatCard({
  stat,
  speed,
  animate,
  showIcon,
  textColors,
}: {
  stat: StatItem;
  speed: ShowcaseAnimationSpeed;
  animate: boolean;
  showIcon: boolean;
  textColors: { headingColor: string; textColor: string; mutedColor: string };
}) {
  const { count, ref } = useCountUp(stat.value, speed, animate);
  const Icon = showIcon && stat.icon ? getIconByName(stat.icon) : null;

  // Format number with commas
  const formattedCount = count.toLocaleString();

  return (
    <div ref={ref} className="text-center">
      {Icon && (
        <Icon
          className="mx-auto mb-3 h-10 w-10"
          style={{ color: textColors.headingColor }}
        />
      )}
      <div
        className="text-4xl font-bold md:text-5xl"
        style={{ color: textColors.headingColor }}
      >
        {stat.prefix}
        {formattedCount}
        {stat.suffix}
      </div>
      <div
        className="mt-2 text-sm md:text-base"
        style={{ color: textColors.mutedColor }}
      >
        {stat.label}
      </div>
    </div>
  );
}

/**
 * Stats mode renderer
 */
function StatsMode({
  content,
  textColors,
}: {
  content: ShowcaseContent;
  textColors: { headingColor: string; textColor: string; mutedColor: string };
}) {
  const { stats, statsLayout, animationSpeed, animateOnScroll, showStatIcons } =
    content;

  const gridCols: Record<typeof statsLayout, string> = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    auto: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  if (!stats || stats.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No stats configured. Add stats in the editor.
      </div>
    );
  }

  return (
    <div className={cn("grid gap-8 md:gap-12", gridCols[statsLayout])}>
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          stat={stat}
          speed={animationSpeed}
          animate={animateOnScroll}
          showIcon={showStatIcons}
          textColors={textColors}
        />
      ))}
    </div>
  );
}

/**
 * Download row for list layout
 */
function DownloadRow({
  item,
  showFileSize,
  showFileType,
  defaultButtonText,
  textColors,
}: {
  item: DownloadItem;
  showFileSize: boolean;
  showFileType: boolean;
  defaultButtonText: string;
  textColors: { headingColor: string; textColor: string; mutedColor: string };
}) {
  const buttonText = item.buttonText || defaultButtonText;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center",
        "border-border bg-card/50"
      )}
    >
      {showFileType && (
        <div className="flex-shrink-0">
          <FileIcon type={item.fileType} size={36} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div
          className="font-medium"
          style={{ color: textColors.textColor }}
        >
          {item.title}
        </div>
        {item.description && (
          <div
            className="mt-1 text-sm"
            style={{ color: textColors.mutedColor }}
          >
            {item.description}
          </div>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        {showFileSize && item.fileSize && (
          <span
            className="text-sm"
            style={{ color: textColors.mutedColor }}
          >
            {item.fileSize}
          </span>
        )}
        <a
          href={item.fileUrl}
          target={item.openInNewWindow ? "_blank" : undefined}
          rel={item.openInNewWindow ? "noopener noreferrer" : undefined}
          download={!item.openInNewWindow ? true : undefined}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Download className="h-4 w-4" />
          {buttonText}
        </a>
      </div>
    </div>
  );
}

/**
 * Download card for grid layout
 */
function DownloadCard({
  item,
  showFileSize,
  showFileType,
  defaultButtonText,
  textColors,
}: {
  item: DownloadItem;
  showFileSize: boolean;
  showFileType: boolean;
  defaultButtonText: string;
  textColors: { headingColor: string; textColor: string; mutedColor: string };
}) {
  const buttonText = item.buttonText || defaultButtonText;

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border p-5",
        "border-border bg-card/50"
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        {showFileType && <FileIcon type={item.fileType} size={40} />}
        {showFileSize && item.fileSize && (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs",
              "bg-muted text-muted-foreground"
            )}
          >
            {item.fileSize}
          </span>
        )}
      </div>
      <div
        className="mb-1 font-medium"
        style={{ color: textColors.textColor }}
      >
        {item.title}
      </div>
      {item.description && (
        <div
          className="mb-4 flex-1 text-sm"
          style={{ color: textColors.mutedColor }}
        >
          {item.description}
        </div>
      )}
      <a
        href={item.fileUrl}
        target={item.openInNewWindow ? "_blank" : undefined}
        rel={item.openInNewWindow ? "noopener noreferrer" : undefined}
        download={!item.openInNewWindow ? true : undefined}
        className={cn(
          "mt-auto inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
          "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <Download className="h-4 w-4" />
        {buttonText}
      </a>
    </div>
  );
}

/**
 * Downloads mode renderer
 */
function DownloadsMode({
  content,
  textColors,
}: {
  content: ShowcaseContent;
  textColors: { headingColor: string; textColor: string; mutedColor: string };
}) {
  const {
    downloads,
    downloadLayout,
    downloadColumns,
    showFileSize,
    showFileType,
    defaultButtonText,
  } = content;

  if (!downloads || downloads.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No downloads configured. Add files in the editor.
      </div>
    );
  }

  if (downloadLayout === "grid") {
    const gridCols = downloadColumns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
    return (
      <div className={cn("grid gap-4", gridCols)}>
        {downloads.map((item) => (
          <DownloadCard
            key={item.id}
            item={item}
            showFileSize={showFileSize}
            showFileType={showFileType}
            defaultButtonText={defaultButtonText}
            textColors={textColors}
          />
        ))}
      </div>
    );
  }

  // List layout
  return (
    <div className="space-y-3">
      {downloads.map((item) => (
        <DownloadRow
          key={item.id}
          item={item}
          showFileSize={showFileSize}
          showFileType={showFileType}
          defaultButtonText={defaultButtonText}
          textColors={textColors}
        />
      ))}
    </div>
  );
}

/**
 * Section header component
 */
function SectionHeader({
  title,
  subtitle,
  textColors,
}: {
  title?: string;
  subtitle?: string;
  textColors: { headingColor: string; textColor: string; mutedColor: string };
}) {
  if (!title && !subtitle) return null;

  return (
    <div className="mb-8 text-center md:mb-12">
      {title && (
        <h2
          className="text-3xl font-bold md:text-4xl"
          style={{ color: textColors.headingColor }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          className="mt-2 text-lg"
          style={{ color: textColors.mutedColor }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Main ShowcaseBlock component
 */
export function ShowcaseBlock({ content }: { content: ShowcaseContent }) {
  const {
    mode,
    sectionTitle,
    sectionSubtitle,
    enableStyling,
  } = content;

  // Get styling using buildSectionStyles
  const {
    sectionStyles,
    containerStyles,
    overlayStyles,
    textColors,
  } = enableStyling
    ? buildSectionStyles(content)
    : {
        sectionStyles: {},
        containerStyles: {},
        overlayStyles: null,
        textColors: {
          headingColor: "var(--color-foreground)",
          textColor: "var(--color-foreground)",
          mutedColor: "var(--color-muted-foreground)",
        },
      };

  return (
    <section
      className="relative py-12 md:py-16"
      style={sectionStyles}
    >
      {/* Background overlay */}
      {overlayStyles && (
        <div
          className="absolute inset-0"
          style={overlayStyles}
        />
      )}

      {/* Content */}
      <div
        className={cn(
          "relative mx-auto max-w-6xl px-4",
          overlayStyles && "z-10"
        )}
        style={containerStyles}
      >
        <SectionHeader
          title={sectionTitle}
          subtitle={sectionSubtitle}
          textColors={textColors}
        />

        {mode === "stats" && (
          <StatsMode content={content} textColors={textColors} />
        )}

        {mode === "downloads" && (
          <DownloadsMode content={content} textColors={textColors} />
        )}
      </div>
    </section>
  );
}

export default ShowcaseBlock;
