/**
 * Home
 *
 * Commerce homepage composing all storefront sections.
 * Entry point for the KeeMeds B2C customer application.
 * All section content is sourced from the homepage service layer.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import {
  HeroBanner,
  PromoSection,
  CategoryGrid,
  OffersSection,
  FeaturedMedicines,
  PrescriptionUploadCta,
  PopularLabTests,
  HealthConcerns,
  TopBrands,
  DoctorConsultationBanner,
  ServicesSection,
  TestimonialsSection,
  AppDownloadBanner,
  DiscoveryRecommendations,
} from "./home";

export default function Home() {
  usePageTitle("Home", "Your Trusted Healthcare Partner");

  return (
    <div>
      <HeroBanner />
      <PromoSection />
      <CategoryGrid />
      <OffersSection />
      <FeaturedMedicines />
      <DiscoveryRecommendations />
      <PrescriptionUploadCta />
      <PopularLabTests />
      <HealthConcerns />
      <TopBrands />
      <DoctorConsultationBanner />
      <ServicesSection />
      <TestimonialsSection />
      <AppDownloadBanner />
    </div>
  );
}
