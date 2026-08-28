import type { LucideIcon } from "lucide-react";
import {
  Pill,
  Leaf,
  TestTube,
  Stethoscope,
  User,
  Apple,
  Flower2,
  Droplets,
  Award,
  Flame,
  Sparkles,
  HeartPulse,
  Tag,
  LayoutGrid,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  path?: string;
  icon: LucideIcon;
}

export const commerceCategories: NavigationItem[] = [
  { title: "Medicines", path: "/category/medicines", icon: Pill },
  { title: "Wellness", path: "/category/wellness", icon: Leaf },
  { title: "Lab Tests", path: "/category/lab-tests", icon: TestTube },
  { title: "Health Devices", path: "/category/health-devices", icon: Stethoscope },
  { title: "Personal Care", path: "/category/personal-care", icon: User },
  { title: "Nutrition", path: "/category/nutrition", icon: Apple },
  { title: "Ayurveda", path: "/category/ayurveda", icon: Flower2 },
  { title: "Homeopathy", path: "/category/homeopathy", icon: Droplets },
];

export const discoveryLinks: NavigationItem[] = [
  { title: "Brands", path: "/brands", icon: Award },
  { title: "Best Sellers", path: "/collection/best-sellers", icon: Flame },
  { title: "New Arrivals", path: "/collection/new-arrivals", icon: Sparkles },
  { title: "Collections", path: "/collections", icon: LayoutGrid },
  { title: "Health Concerns", path: "/health-concerns", icon: HeartPulse },
  { title: "All Brands", path: "/brands", icon: Tag },
];
