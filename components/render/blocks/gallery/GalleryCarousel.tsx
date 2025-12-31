"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ThemeData } from "@/lib/drizzle/schema/theme-types";
import type { GalleryContent } from "@/lib/section-types";
import { getCardStyles } from "../../utilities/theme-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GalleryCarouselProps {
  content: GalleryContent;
  theme: ThemeData;
  onImageClick?: (index: number) => void;
}

const ASPECT_RATIO_CLASSES = {
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "3:4": "aspect-[3/4]",
  original: "aspect-video",
} as const;

const GAP_VALUES = {
  small: 8,
  medium: 16,
  large: 24,
} as const;

const VISIBLE_COUNTS = {
  2: 2,
  3: 3,
  4: 4,
  auto: 3,
} as const;

export function GalleryCarousel({
  content,
  theme,
  onImageClick,
}: GalleryCarouselProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const images = content.images;
  const aspectRatio = content.aspectRatio ?? "16:9";
  const columns = content.columns ?? "auto";
  const gap = content.gap ?? "medium";
  const autoRotate = content.autoRotate ?? false;
  const autoRotateInterval = content.autoRotateInterval ?? 5;

  const visibleCount = VISIBLE_COUNTS[columns];
  const gapValue = GAP_VALUES[gap];

  // Calculate the maximum index (can't scroll past the last set of images)
  const maxIndex = Math.max(0, images.length - visibleCount);

  const goToPrevious = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  }, [isAnimating, maxIndex]);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [isAnimating, maxIndex]);

  // Reset animation lock after transition completes
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => setIsAnimating(false), 700);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  // Auto-rotate timer
  useEffect(() => {
    if (!autoRotate || isPaused || images.length <= visibleCount) return;

    const timer = setInterval(() => {
      goToNext();
    }, autoRotateInterval * 1000);

    return () => clearInterval(timer);
  }, [autoRotate, autoRotateInterval, isPaused, goToNext, images.length, visibleCount]);

  // Keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent): void => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent): void => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 50;

    if (diff > threshold) {
      goToNext();
    } else if (diff < -threshold) {
      goToPrevious();
    }

    touchStartX.current = null;
  };

  // Calculate slide width percentage based on visible count
  const slideWidthPercent = 100 / visibleCount;

  // Calculate total gap width that needs to be distributed
  // For N visible items, there are (N-1) gaps between them
  const totalGapWidth = gapValue * (visibleCount - 1);

  // Calculate transform offset
  // Each slide moves by (slideWidth + gap), but we need to account for the gap distribution
  const getTransformX = (): string => {
    // Each item takes up slideWidthPercent% of container width
    // Plus we need to account for gaps
    const translatePercent = currentIndex * slideWidthPercent;
    const translateGap = currentIndex * gapValue;
    return `calc(-${translatePercent}% - ${translateGap}px)`;
  };

  // If fewer images than visible count, just show them all (no sliding needed)
  if (images.length <= visibleCount) {
    return (
      <div
        ref={containerRef}
        className="relative outline-none"
        tabIndex={0}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${images.length}, 1fr)`,
            gap: `${gapValue}px`,
          }}
        >
          {images.map((image, index) => (
            <figure
              key={index}
              className={cn(
                "overflow-hidden rounded-lg",
                onImageClick && "cursor-pointer"
              )}
              style={getCardStyles(theme)}
              onClick={() => onImageClick?.(index)}
            >
              <div className={cn("relative w-full", ASPECT_RATIO_CLASSES[aspectRatio])}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </div>
            </figure>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative outline-none"
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Overflow container */}
      <div className="overflow-hidden">
        {/* Sliding track */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(${getTransformX()})`,
            gap: `${gapValue}px`,
          }}
        >
          {images.map((image, index) => (
            <figure
              key={index}
              className={cn(
                "flex-shrink-0 overflow-hidden rounded-lg",
                onImageClick && "cursor-pointer"
              )}
              style={{
                ...getCardStyles(theme),
                width: `calc(${slideWidthPercent}% - ${totalGapWidth / visibleCount}px)`,
              }}
              onClick={() => onImageClick?.(index)}
            >
              <div className={cn("relative w-full", ASPECT_RATIO_CLASSES[aspectRatio])}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </div>
            </figure>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        aria-label="Next image"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === currentIndex
                ? "bg-primary"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentIndex(index);
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter & Auto-rotate indicator */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <p
          className="text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {currentIndex + 1} / {maxIndex + 1}
        </p>
        {autoRotate && (
          <span
            className="text-xs"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {isPaused ? "⏸" : "▶"}
          </span>
        )}
      </div>
    </div>
  );
}
