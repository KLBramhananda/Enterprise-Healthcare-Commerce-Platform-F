/**
 * Home
 *
 * Commerce homepage composing all storefront sections.
 * Entry point for the KeeMeds B2C customer application.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import {
  HeroBanner,
  PromoSection,
  CategoryGrid,
  ServicesSection,
  FeaturedProducts,
  HealthTips,
  AppDownloadBanner,
} from "./home";

export default function Home() {
  usePageTitle("Home", "Your Trusted Healthcare Partner");

  return (
    <div>
      <HeroBanner />
      <PromoSection />
      <CategoryGrid />
      <FeaturedProducts />
      <ServicesSection />
      <HealthTips />
      <AppDownloadBanner />
    </div>
  );
}
