"use client";

import { useState, useMemo } from "react";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type {
  AccordionContent,
  AccordionItem,
  CurriculumModule,
  CurriculumLesson,
} from "@/lib/section-types";
import {
  Accordion,
  AccordionContent as AccordionContentUI,
  AccordionItem as AccordionItemUI,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronDown,
  Plus,
  Minus,
  Lock,
  CheckCircle2,
  PlayCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  hexToRgba,
  BORDER_WIDTHS,
  BORDER_RADII,
  TEXT_SIZES,
} from "@/lib/styling-utils";

interface AccordionBlockProps {
  content: AccordionContent;
  theme: ThemeData;
}

// Text size scales
const textSizeScale = {
  small: TEXT_SIZES.small.scale,
  normal: TEXT_SIZES.normal.scale,
  large: TEXT_SIZES.large.scale,
};

/**
 * Custom accordion trigger that supports chevron and plus/minus icons
 */
function CustomAccordionTrigger({
  children,
  iconStyle,
  className,
}: {
  children: React.ReactNode;
  iconStyle: "chevron" | "plus-minus";
  className?: string;
}) {
  return (
    <AccordionTrigger
      className={cn(
        "group flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:no-underline [&>svg]:hidden",
        className
      )}
    >
      <span className="flex-1">{children}</span>
      {iconStyle === "chevron" ? (
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      ) : (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
          <Plus className="h-4 w-4 group-data-[state=open]:hidden" />
          <Minus className="hidden h-4 w-4 group-data-[state=open]:block" />
        </span>
      )}
    </AccordionTrigger>
  );
}

/**
 * Expand All / Collapse All toggle
 */
function ExpandAllToggle({
  isAllExpanded,
  onToggle,
  textColor,
}: {
  isAllExpanded: boolean;
  onToggle: () => void;
  textColor: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="mb-4 text-sm font-medium hover:underline"
      style={{ color: textColor }}
    >
      {isAllExpanded ? "Collapse All" : "Expand All"}
    </button>
  );
}

/**
 * Calculate total duration from lessons
 */
function calculateTotalDuration(modules: CurriculumModule[]): string {
  let totalMinutes = 0;

  for (const currModule of modules) {
    for (const lesson of currModule.lessons) {
      if (lesson.duration) {
        // Parse duration like "5:30" or "15 min"
        if (lesson.duration.includes(":")) {
          const [mins, secs] = lesson.duration.split(":").map(Number);
          totalMinutes += mins + (secs || 0) / 60;
        } else {
          const match = lesson.duration.match(/(\d+)/);
          if (match) {
            totalMinutes += parseInt(match[1], 10);
          }
        }
      }
    }
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Count total lessons
 */
function countTotalLessons(modules: CurriculumModule[]): number {
  return modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
}

/**
 * FAQ/Custom Accordion Renderer
 */
function FAQAccordion({
  items,
  iconStyle,
  allowMultipleOpen,
  defaultExpandFirst,
  showNumbering,
  textColor,
  titleColor,
  textScale,
}: {
  items: AccordionItem[];
  iconStyle: "chevron" | "plus-minus";
  allowMultipleOpen: boolean;
  defaultExpandFirst: boolean;
  showNumbering: boolean;
  textColor: string;
  titleColor: string;
  textScale: number;
}) {
  const defaultValue = defaultExpandFirst && items.length > 0 ? items[0].id : undefined;

  if (allowMultipleOpen) {
    const defaultValues = defaultExpandFirst && items.length > 0 ? [items[0].id] : [];
    return (
      <Accordion type="multiple" defaultValue={defaultValues} className="w-full">
        {items.map((item, index) => (
          <AccordionItemUI key={item.id} value={item.id} className="border-b">
            <CustomAccordionTrigger iconStyle={iconStyle}>
              <span
                className="flex items-center gap-2"
                style={{ color: titleColor, fontSize: `${1 * textScale}rem` }}
              >
                {showNumbering && (
                  <span className="text-primary font-semibold">{index + 1}.</span>
                )}
                {item.title}
              </span>
            </CustomAccordionTrigger>
            <AccordionContentUI>
              <div
                className="prose prose-sm max-w-none pb-2"
                style={{
                  color: textColor,
                  fontSize: `${0.875 * textScale}rem`,
                  // Override prose colors
                  ["--tw-prose-body" as string]: textColor,
                  ["--tw-prose-headings" as string]: titleColor,
                }}
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </AccordionContentUI>
          </AccordionItemUI>
        ))}
      </Accordion>
    );
  }

  return (
    <Accordion type="single" collapsible defaultValue={defaultValue} className="w-full">
      {items.map((item, index) => (
        <AccordionItemUI key={item.id} value={item.id} className="border-b">
          <CustomAccordionTrigger iconStyle={iconStyle}>
            <span
              className="flex items-center gap-2"
              style={{ color: titleColor, fontSize: `${1 * textScale}rem` }}
            >
              {showNumbering && (
                <span className="text-primary font-semibold">{index + 1}.</span>
              )}
              {item.title}
            </span>
          </CustomAccordionTrigger>
          <AccordionContentUI>
            <div
              className="prose prose-sm max-w-none pb-2"
              style={{
                color: textColor,
                fontSize: `${0.875 * textScale}rem`,
                ["--tw-prose-body" as string]: textColor,
                ["--tw-prose-headings" as string]: titleColor,
              }}
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          </AccordionContentUI>
        </AccordionItemUI>
      ))}
    </Accordion>
  );
}

/**
 * Curriculum Accordion Renderer (nested modules > lessons)
 */
function CurriculumAccordion({
  modules,
  iconStyle,
  allowMultipleOpen,
  defaultExpandFirst,
  showLessonCount,
  showTotalDuration,
  textColor,
  titleColor,
  textScale,
}: {
  modules: CurriculumModule[];
  iconStyle: "chevron" | "plus-minus";
  allowMultipleOpen: boolean;
  defaultExpandFirst: boolean;
  showLessonCount: boolean;
  showTotalDuration: boolean;
  textColor: string;
  titleColor: string;
  textScale: number;
}) {
  const defaultValue = defaultExpandFirst && modules.length > 0 ? modules[0].id : undefined;
  const defaultValues = defaultExpandFirst && modules.length > 0 ? [modules[0].id] : [];

  const renderModules = () =>
    modules.map((currModule) => (
      <AccordionItemUI
        key={currModule.id}
        value={currModule.id}
        className="rounded-lg border"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "var(--color-border)",
        }}
      >
        <CustomAccordionTrigger iconStyle={iconStyle} className="px-4">
          <div className="flex flex-col items-start gap-1">
            <span
              className="font-semibold"
              style={{ color: titleColor, fontSize: `${1 * textScale}rem` }}
            >
              {currModule.title}
            </span>
            <div
              className="flex items-center gap-3 text-sm"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              {showLessonCount && (
                <span>{currModule.lessons.length} lessons</span>
              )}
              {showTotalDuration && currModule.lessons.some((l) => l.duration) && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {calculateTotalDuration([currModule])}
                </span>
              )}
            </div>
          </div>
        </CustomAccordionTrigger>
        <AccordionContentUI className="px-4 pb-4">
          {currModule.description && (
            <p
              className="mb-3 text-sm"
              style={{ color: textColor }}
            >
              {currModule.description}
            </p>
          )}
          <ul className="space-y-1">
            {currModule.lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                textColor={textColor}
                textScale={textScale}
              />
            ))}
          </ul>
        </AccordionContentUI>
      </AccordionItemUI>
    ));

  if (allowMultipleOpen) {
    return (
      <Accordion type="multiple" defaultValue={defaultValues} className="w-full space-y-3">
        {renderModules()}
      </Accordion>
    );
  }

  return (
    <Accordion type="single" collapsible defaultValue={defaultValue} className="w-full space-y-3">
      {renderModules()}
    </Accordion>
  );
}

/**
 * Individual lesson item in curriculum
 */
function LessonItem({
  lesson,
  textColor,
  textScale,
}: {
  lesson: CurriculumLesson;
  textColor: string;
  textScale: number;
}) {
  const mutedForeground = "var(--color-muted-foreground)";

  const getIcon = () => {
    if (lesson.isCompleted) {
      return <CheckCircle2 className="h-4 w-4" style={{ color: "#22c55e" }} />;
    }
    if (lesson.isLocked) {
      return <Lock className="h-4 w-4" style={{ color: mutedForeground }} />;
    }
    return <PlayCircle className="h-4 w-4" style={{ color: "var(--color-primary)" }} />;
  };

  return (
    <li
      className="flex items-center gap-3 rounded-md px-3 py-2 transition-colors"
      style={{
        opacity: lesson.isLocked ? 0.6 : 1,
      }}
    >
      {getIcon()}
      <span
        className="flex-1"
        style={{
          color: lesson.isLocked ? mutedForeground : textColor,
          fontSize: `${0.875 * textScale}rem`,
        }}
      >
        {lesson.title}
      </span>
      {lesson.duration && (
        <span
          className="text-sm"
          style={{ color: mutedForeground }}
        >
          {lesson.duration}
        </span>
      )}
    </li>
  );
}

/**
 * Main AccordionBlock Component
 */
export function AccordionBlock({ content, theme: _theme }: AccordionBlockProps) {
  const {
    mode,
    sectionTitle,
    sectionSubtitle,
    iconStyle,
    allowMultipleOpen,
    showExpandAll,
    defaultExpandFirst,
    // FAQ mode
    faqItems,
    showNumbering,
    // Curriculum mode
    modules,
    showLessonCount,
    showTotalDuration,
    // Custom mode
    customItems,
    // Styling
    enableStyling,
    textColorMode,
    showBorder,
    borderWidth,
    borderRadius,
    borderColor,
    boxBackgroundColor,
    boxBackgroundOpacity,
    useThemeBackground,
    backgroundImage,
    overlayColor,
    overlayOpacity,
    textSize,
  } = content;

  // Get items based on mode
  const items = mode === "faq" ? faqItems : mode === "custom" ? customItems : [];
  const allItemIds = mode === "curriculum"
    ? modules.map((m) => m.id)
    : items.map((i) => i.id);

  // Expand all state
  const [expandedItems, setExpandedItems] = useState<string[]>(
    defaultExpandFirst && allItemIds.length > 0 ? [allItemIds[0]] : []
  );
  const isAllExpanded = expandedItems.length === allItemIds.length;

  const handleExpandAllToggle = () => {
    if (isAllExpanded) {
      setExpandedItems([]);
    } else {
      setExpandedItems(allItemIds);
    }
  };

  // Text scale
  const textScale = textSizeScale[textSize || "normal"];

  // Determine colors based on styling mode
  const titleColor = enableStyling
    ? textColorMode === "light"
      ? "#ffffff"
      : textColorMode === "dark"
        ? "#1f2937"
        : "var(--color-foreground)"
    : "var(--color-foreground)";

  const textColor = enableStyling
    ? textColorMode === "light"
      ? "rgba(255,255,255,0.9)"
      : textColorMode === "dark"
        ? "#4b5563"
        : "var(--color-muted-foreground)"
    : "var(--color-muted-foreground)";

  const subtitleColor = enableStyling
    ? textColorMode === "light"
      ? "rgba(255,255,255,0.8)"
      : textColorMode === "dark"
        ? "#6b7280"
        : "var(--color-muted-foreground)"
    : "var(--color-muted-foreground)";

  // Build section styles
  const sectionStyles: React.CSSProperties = {};

  if (enableStyling) {
    // Background image with overlay
    if (backgroundImage) {
      sectionStyles.backgroundImage = `linear-gradient(${hexToRgba(overlayColor || "#000000", (overlayOpacity || 0) / 100)}, ${hexToRgba(overlayColor || "#000000", (overlayOpacity || 0) / 100)}), url(${backgroundImage})`;
      sectionStyles.backgroundSize = "cover";
      sectionStyles.backgroundPosition = "center";
    }
  }

  // Build content wrapper styles
  const wrapperStyles: React.CSSProperties = {};

  if (enableStyling) {
    // Border
    if (showBorder) {
      wrapperStyles.border = `${BORDER_WIDTHS[borderWidth || "medium"]} solid ${borderColor || "var(--color-border)"}`;
      wrapperStyles.borderRadius = BORDER_RADII[borderRadius || "medium"];
    }

    // Box background
    if (boxBackgroundColor || useThemeBackground) {
      if (useThemeBackground) {
        wrapperStyles.backgroundColor = "var(--color-background)";
      } else if (boxBackgroundColor) {
        wrapperStyles.backgroundColor = hexToRgba(
          boxBackgroundColor,
          (boxBackgroundOpacity || 100) / 100
        );
      }
    }

    if (showBorder || boxBackgroundColor || useThemeBackground) {
      wrapperStyles.padding = "1.5rem";
    }
  }

  // Curriculum summary for subtitle
  const curriculumSummary = useMemo(() => {
    if (mode !== "curriculum" || modules.length === 0) return null;
    const totalLessons = countTotalLessons(modules);
    const totalDuration = calculateTotalDuration(modules);
    return `${modules.length} modules · ${totalLessons} lessons${totalDuration !== "0m" ? ` · ${totalDuration}` : ""}`;
  }, [mode, modules]);

  return (
    <section className="py-12 px-4" style={sectionStyles}>
      <div className="mx-auto max-w-3xl" style={wrapperStyles}>
        {/* Section Header */}
        {(sectionTitle || sectionSubtitle) && (
          <div className="mb-8 text-center">
            {sectionTitle && (
              <h2
                className="text-3xl font-bold tracking-tight"
                style={{
                  color: titleColor,
                  fontSize: `${1.875 * textScale}rem`,
                }}
              >
                {sectionTitle}
              </h2>
            )}
            {(sectionSubtitle || (mode === "curriculum" && curriculumSummary)) && (
              <p
                className="mt-2"
                style={{
                  color: subtitleColor,
                  fontSize: `${1 * textScale}rem`,
                }}
              >
                {sectionSubtitle || curriculumSummary}
              </p>
            )}
          </div>
        )}

        {/* Expand All Toggle */}
        {showExpandAll && allItemIds.length > 1 && (
          <div className="mb-4 flex justify-end">
            <ExpandAllToggle
              isAllExpanded={isAllExpanded}
              onToggle={handleExpandAllToggle}
              textColor={titleColor}
            />
          </div>
        )}

        {/* Mode-specific rendering */}
        {mode === "curriculum" ? (
          <CurriculumAccordion
            modules={modules}
            iconStyle={iconStyle}
            allowMultipleOpen={allowMultipleOpen}
            defaultExpandFirst={defaultExpandFirst}
            showLessonCount={showLessonCount}
            showTotalDuration={showTotalDuration}
            textColor={textColor}
            titleColor={titleColor}
            textScale={textScale}
          />
        ) : (
          <FAQAccordion
            items={items}
            iconStyle={iconStyle}
            allowMultipleOpen={allowMultipleOpen}
            defaultExpandFirst={defaultExpandFirst}
            showNumbering={mode === "faq" ? showNumbering : false}
            textColor={textColor}
            titleColor={titleColor}
            textScale={textScale}
          />
        )}
      </div>
    </section>
  );
}
