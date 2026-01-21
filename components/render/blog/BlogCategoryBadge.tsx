import Link from "next/link";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "light" | "outline";

interface BlogCategoryBadgeProps {
  name: string | null;
  slug?: string | null;
  basePath?: string;
  variant?: BadgeVariant;
  linked?: boolean;
  className?: string;
}

/**
 * Shared blog category badge component
 * Used by BlogBlock (both featured and grid modes) and legacy blog blocks
 */
export function BlogCategoryBadge({
  name,
  slug,
  basePath,
  variant = "default",
  linked = true,
  className,
}: BlogCategoryBadgeProps): React.ReactElement | null {
  if (!name) {
    return null;
  }

  const variantStyles = {
    default: {
      backgroundColor: "var(--color-primary)",
      color: "var(--color-primary-foreground)",
    },
    light: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      color: "#FFFFFF",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--color-primary)",
      border: "1px solid var(--color-primary)",
    },
  };

  const badge = (
    <span
      className={cn(
        "inline-block px-3 py-1 text-xs font-medium rounded-full",
        className
      )}
      style={variantStyles[variant]}
    >
      {name}
    </span>
  );

  if (linked && slug && basePath) {
    return (
      <Link
        href={`${basePath}/blog/category/${slug}`}
        className="hover:opacity-80 transition-opacity"
      >
        {badge}
      </Link>
    );
  }

  return badge;
}
