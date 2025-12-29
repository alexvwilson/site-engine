"use client";

import {
  Layout,
  Type,
  Image,
  Grid3X3,
  Sparkles,
  MousePointerClick,
  Quote,
  Mail,
  PanelTop,
  PanelBottom,
  Newspaper,
  LayoutGrid,
} from "lucide-react";
import type { BlockType } from "@/lib/drizzle/schema/sections";
import { cn } from "@/lib/utils";

interface BlockIconProps {
  blockType: BlockType;
  className?: string;
}

const iconMap: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  header: PanelTop,
  hero: Layout,
  text: Type,
  image: Image,
  gallery: Grid3X3,
  features: Sparkles,
  cta: MousePointerClick,
  testimonials: Quote,
  contact: Mail,
  footer: PanelBottom,
  blog_featured: Newspaper,
  blog_grid: LayoutGrid,
};

export function BlockIcon({ blockType, className }: BlockIconProps) {
  const Icon = iconMap[blockType] ?? Layout;
  return <Icon className={cn("h-4 w-4", className)} />;
}
