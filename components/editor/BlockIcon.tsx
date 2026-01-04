"use client";

import {
  Layout,
  Type,
  FileText,
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
  Code,
  Heading1,
  Share2,
  ShoppingBag,
  BookOpen,
} from "lucide-react";
import type { BlockType } from "@/lib/drizzle/schema/sections";
import { cn } from "@/lib/utils";

interface BlockIconProps {
  blockType: BlockType;
  className?: string;
}

const iconMap: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  header: PanelTop,
  heading: Heading1,
  hero: Layout,
  text: Type,
  markdown: FileText,
  image: Image,
  gallery: Grid3X3,
  features: Sparkles,
  cta: MousePointerClick,
  testimonials: Quote,
  contact: Mail,
  footer: PanelBottom,
  blog_featured: Newspaper,
  blog_grid: LayoutGrid,
  embed: Code,
  social_links: Share2,
  product_grid: ShoppingBag,
  article: BookOpen,
};

export function BlockIcon({ blockType, className }: BlockIconProps) {
  const Icon = iconMap[blockType] ?? Layout;
  return <Icon className={cn("h-4 w-4", className)} />;
}
