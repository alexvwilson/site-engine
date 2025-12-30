import {
  Star,
  Zap,
  Shield,
  Heart,
  Globe,
  Rocket,
  Users,
  CheckCircle,
  Target,
  Lightbulb,
  Award,
  TrendingUp,
  Lock,
  Clock,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  Gift,
  Sparkles,
  Leaf,
  Sun,
  Moon,
  Cloud,
  Wifi,
  Database,
  Server,
  Code,
  Terminal,
  Laptop,
  Smartphone,
  Headphones,
  Camera,
  Video,
  Music,
  Image,
  FileText,
  Folder,
  Search,
  Filter,
  BarChart,
  PieChart,
  Activity,
  Gauge,
  Compass,
  Navigation,
  Map,
  Home,
  Building,
  Store,
  Briefcase,
  GraduationCap,
  BookOpen,
  PenTool,
  Palette,
  Layers,
  Layout,
  Grid,
  List,
  type LucideIcon,
} from "lucide-react";

/**
 * Map of common icon names to Lucide components.
 * Supports various naming conventions (kebab-case, camelCase, lowercase).
 */
const ICON_MAP: Record<string, LucideIcon> = {
  // Common action icons
  star: Star,
  zap: Zap,
  shield: Shield,
  heart: Heart,
  globe: Globe,
  rocket: Rocket,
  users: Users,
  check: CheckCircle,
  "check-circle": CheckCircle,
  checkcircle: CheckCircle,
  target: Target,
  lightbulb: Lightbulb,
  award: Award,
  trending: TrendingUp,
  "trending-up": TrendingUp,
  trendingup: TrendingUp,
  lock: Lock,
  clock: Clock,
  settings: Settings,
  sparkles: Sparkles,

  // Contact icons
  mail: Mail,
  email: Mail,
  phone: Phone,
  location: MapPin,
  "map-pin": MapPin,
  mappin: MapPin,
  calendar: Calendar,

  // E-commerce icons
  "credit-card": CreditCard,
  creditcard: CreditCard,
  cart: ShoppingCart,
  "shopping-cart": ShoppingCart,
  shoppingcart: ShoppingCart,
  package: Package,
  truck: Truck,
  delivery: Truck,
  gift: Gift,

  // Nature icons
  leaf: Leaf,
  sun: Sun,
  moon: Moon,
  cloud: Cloud,

  // Tech icons
  wifi: Wifi,
  database: Database,
  server: Server,
  code: Code,
  terminal: Terminal,
  laptop: Laptop,
  computer: Laptop,
  smartphone: Smartphone,
  mobile: Smartphone,
  headphones: Headphones,

  // Media icons
  camera: Camera,
  video: Video,
  music: Music,
  image: Image,
  photo: Image,
  file: FileText,
  "file-text": FileText,
  filetext: FileText,
  folder: Folder,

  // Analytics icons
  search: Search,
  filter: Filter,
  "bar-chart": BarChart,
  barchart: BarChart,
  chart: BarChart,
  "pie-chart": PieChart,
  piechart: PieChart,
  activity: Activity,
  gauge: Gauge,
  metrics: Gauge,

  // Navigation icons
  compass: Compass,
  navigation: Navigation,
  map: Map,
  home: Home,
  building: Building,
  store: Store,
  shop: Store,
  briefcase: Briefcase,
  business: Briefcase,

  // Education icons
  graduation: GraduationCap,
  "graduation-cap": GraduationCap,
  graduationcap: GraduationCap,
  book: BookOpen,
  "book-open": BookOpen,
  bookopen: BookOpen,

  // Design icons
  pen: PenTool,
  "pen-tool": PenTool,
  pentool: PenTool,
  palette: Palette,
  design: Palette,
  layers: Layers,
  layout: Layout,
  grid: Grid,
  list: List,
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

/**
 * Renders a Lucide icon by name.
 * Falls back to Star icon if the name is not recognized.
 */
export function Icon({ name, className, size = 24 }: IconProps) {
  const normalizedName = name.toLowerCase().trim().replace(/[_\s]/g, "-");
  const IconComponent = ICON_MAP[normalizedName] ?? Star;

  return <IconComponent className={className} size={size} />;
}

/**
 * Check if an icon name is valid (exists in the map).
 */
export function isValidIconName(name: string): boolean {
  const normalizedName = name.toLowerCase().trim().replace(/[_\s]/g, "-");
  return normalizedName in ICON_MAP;
}

/**
 * Get a list of all available icon names.
 */
export function getAvailableIconNames(): string[] {
  return Object.keys(ICON_MAP);
}

/**
 * Icon info for picker display
 */
export interface IconInfo {
  name: string;
  component: LucideIcon;
}

/**
 * Category grouping for icon picker
 */
export interface IconCategory {
  name: string;
  icons: IconInfo[];
}

/**
 * Categorized icons for the icon picker component.
 * Each icon appears once in its primary category.
 */
export const ICON_CATEGORIES: IconCategory[] = [
  {
    name: "Common",
    icons: [
      { name: "star", component: Star },
      { name: "zap", component: Zap },
      { name: "shield", component: Shield },
      { name: "heart", component: Heart },
      { name: "check", component: CheckCircle },
      { name: "target", component: Target },
      { name: "lightbulb", component: Lightbulb },
      { name: "award", component: Award },
      { name: "trending", component: TrendingUp },
      { name: "lock", component: Lock },
      { name: "clock", component: Clock },
      { name: "settings", component: Settings },
      { name: "sparkles", component: Sparkles },
    ],
  },
  {
    name: "Business",
    icons: [
      { name: "globe", component: Globe },
      { name: "rocket", component: Rocket },
      { name: "users", component: Users },
      { name: "briefcase", component: Briefcase },
      { name: "building", component: Building },
      { name: "store", component: Store },
    ],
  },
  {
    name: "Contact",
    icons: [
      { name: "mail", component: Mail },
      { name: "phone", component: Phone },
      { name: "location", component: MapPin },
      { name: "calendar", component: Calendar },
    ],
  },
  {
    name: "E-commerce",
    icons: [
      { name: "cart", component: ShoppingCart },
      { name: "credit-card", component: CreditCard },
      { name: "package", component: Package },
      { name: "truck", component: Truck },
      { name: "gift", component: Gift },
    ],
  },
  {
    name: "Tech",
    icons: [
      { name: "wifi", component: Wifi },
      { name: "database", component: Database },
      { name: "server", component: Server },
      { name: "code", component: Code },
      { name: "terminal", component: Terminal },
      { name: "laptop", component: Laptop },
      { name: "smartphone", component: Smartphone },
      { name: "headphones", component: Headphones },
    ],
  },
  {
    name: "Media",
    icons: [
      { name: "camera", component: Camera },
      { name: "video", component: Video },
      { name: "music", component: Music },
      { name: "image", component: Image },
      { name: "file", component: FileText },
      { name: "folder", component: Folder },
    ],
  },
  {
    name: "Analytics",
    icons: [
      { name: "search", component: Search },
      { name: "filter", component: Filter },
      { name: "chart", component: BarChart },
      { name: "pie-chart", component: PieChart },
      { name: "activity", component: Activity },
      { name: "gauge", component: Gauge },
    ],
  },
  {
    name: "Navigation",
    icons: [
      { name: "compass", component: Compass },
      { name: "navigation", component: Navigation },
      { name: "map", component: Map },
      { name: "home", component: Home },
    ],
  },
  {
    name: "Nature",
    icons: [
      { name: "leaf", component: Leaf },
      { name: "sun", component: Sun },
      { name: "moon", component: Moon },
      { name: "cloud", component: Cloud },
    ],
  },
  {
    name: "Design",
    icons: [
      { name: "pen", component: PenTool },
      { name: "palette", component: Palette },
      { name: "layers", component: Layers },
      { name: "layout", component: Layout },
      { name: "grid", component: Grid },
      { name: "list", component: List },
      { name: "graduation", component: GraduationCap },
      { name: "book", component: BookOpen },
    ],
  },
];
