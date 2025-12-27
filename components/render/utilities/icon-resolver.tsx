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
