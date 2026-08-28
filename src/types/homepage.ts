/**
 * Homepage Types
 *
 * Domain types for all homepage storefront content.
 * Consumed by the homepage service layer and presentational section components.
 */

import type { LucideIcon } from "lucide-react";

/* ── Hero Carousel ── */

export type HeroSlideTheme = "brand" | "blue" | "purple" | "amber";

export interface HeroSlideCta {
  label: string;
  path: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  highlight?: string;
  primaryCta: HeroSlideCta;
  secondaryCta?: HeroSlideCta;
  theme: HeroSlideTheme;
}

/* ── Categories ── */

export interface HomepageCategory {
  id: string;
  title: string;
  path: string;
  icon: LucideIcon;
  color: "brand" | "blue" | "green" | "purple" | "amber" | "pink" | "orange" | "cyan";
}

/* ── Medicines ── */

export interface Medicine {
  id: string;
  name: string;
  brandName: string;
  form: string;
  packSize: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  requiresPrescription: boolean;
}

/* ── Brands ── */

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  productCount: number;
}

/* ── Health Concerns ── */

export interface HealthConcern {
  id: string;
  title: string;
  path: string;
  icon: LucideIcon;
  color: "brand" | "blue" | "green" | "purple" | "amber" | "pink" | "orange" | "cyan";
}

/* ── Lab Tests ── */

export interface LabTest {
  id: string;
  name: string;
  parameterCount: number;
  fastingRequired: boolean;
  reportInDays: number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  popular?: boolean;
}

/* ── Offers ── */

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  terms: string;
  expiresOn: string;
  accent: "brand" | "blue" | "amber" | "pink";
}

/* ── Healthcare Services ── */

export interface HealthcareService {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: "blue" | "purple" | "emerald" | "amber";
}

/* ── Testimonials ── */

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  rating: number;
  initials: string;
}

/* ── Aggregate Content ── */

export interface HomepageContent {
  heroSlides: HeroSlide[];
  categories: HomepageCategory[];
  featuredMedicines: Medicine[];
  topBrands: Brand[];
  healthConcerns: HealthConcern[];
  labTests: LabTest[];
  offers: Offer[];
  services: HealthcareService[];
  testimonials: Testimonial[];
}
