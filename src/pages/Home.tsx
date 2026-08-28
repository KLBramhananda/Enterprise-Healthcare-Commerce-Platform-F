/**
 * Home
 *
 * Commerce homepage composing all storefront sections.
 * Entry point for the KeeMeds B2C customer application.
 * All section content is sourced from the homepage service layer.
 */

import { usePageTitle } from "@/hooks/layout/usePageTitle";
import { useHomepageContent } from "@/hooks/homepage/useHomepageContent";
import { Container } from "@/components/ui";
import { AlertCircle } from "lucide-react";
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
} from "./home/index";

export default function Home() {
  usePageTitle("Home", "Your Trusted Healthcare Partner");
  const { isError, refetch } = useHomepageContent();

  return (
    <div>
      {isError && (
        <Container className="pt-6">
          <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>Something went wrong loading the homepage. Please try again.</span>
              </div>
              <button
                onClick={() => refetch()}
                className="shrink-0 rounded-md bg-danger-100 px-3 py-1.5 text-sm font-medium text-danger-700 transition-colors hover:bg-danger-200"
              >
                Try again
              </button>
            </div>
          </div>
        </Container>
      )}
      {!isError && (
        <>
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
        </>
      )}
    </div>
  );
}
