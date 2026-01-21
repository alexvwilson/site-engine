import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ImageFit } from "@/lib/section-types";
import { getImageBackgroundColor } from "@/lib/blog-utils";

interface BlogPostImageProps {
  src: string | null;
  alt: string;
  className?: string;
  linked?: boolean;
  url?: string;
  imageFit?: ImageFit;
  imageBackgroundMode?: "muted" | "primary" | "custom";
  imageBackgroundColor?: string;
}

/**
 * Shared blog post image component with fallback placeholder
 * Used by BlogBlock (both featured and grid modes) and legacy blog blocks
 */
export function BlogPostImage({
  src,
  alt,
  className,
  linked = false,
  url,
  imageFit = "cover",
  imageBackgroundMode = "muted",
  imageBackgroundColor,
}: BlogPostImageProps): React.ReactElement {
  const backgroundColor =
    imageFit === "contain"
      ? getImageBackgroundColor(imageBackgroundMode, imageBackgroundColor)
      : undefined;

  const imageContent = src ? (
    <div
      className={cn("relative rounded-lg overflow-hidden", className)}
      style={{ backgroundColor }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "transition-transform duration-300 group-hover:scale-105",
          imageFit === "cover" && "object-cover",
          imageFit === "contain" && "object-contain",
          imageFit === "fill" && "object-fill"
        )}
      />
    </div>
  ) : (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center",
        className
      )}
      style={{ backgroundColor: "var(--color-muted)" }}
    >
      <svg
        className="w-16 h-16"
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
