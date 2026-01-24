import {
  Sparkles,
  Layout,
  Eye,
  Rocket,
  Shield,
  Zap,
  Globe,
  Palette,
  Code,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Allowed icons for landing page features.
 * Limited set for consistent design and easy admin selection.
 */
export const ALLOWED_FEATURE_ICONS = [
  { name: "sparkles", label: "Sparkles", icon: Sparkles },
  { name: "layout", label: "Layout", icon: Layout },
  { name: "eye", label: "Eye", icon: Eye },
  { name: "rocket", label: "Rocket", icon: Rocket },
  { name: "shield", label: "Shield", icon: Shield },
  { name: "zap", label: "Zap", icon: Zap },
  { name: "globe", label: "Globe", icon: Globe },
  { name: "palette", label: "Palette", icon: Palette },
  { name: "code", label: "Code", icon: Code },
  { name: "users", label: "Users", icon: Users },
] as const;

export type FeatureIconName = (typeof ALLOWED_FEATURE_ICONS)[number]["name"];

/**
 * Get Lucide icon component by name.
 * Falls back to Sparkles if name not found.
 */
export function getFeatureIcon(name: string): LucideIcon {
  const found = ALLOWED_FEATURE_ICONS.find((i) => i.name === name);
  return found?.icon ?? Sparkles;
}
