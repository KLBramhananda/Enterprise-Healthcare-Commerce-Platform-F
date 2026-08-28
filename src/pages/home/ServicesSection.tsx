/**
 * ServicesSection
 *
 * Healthcare services grid.
 * Content is sourced from the homepage service layer.
 * Uses Container, SectionHeader, ServiceCard, Grid from the design system.
 */

import { Container, SectionHeader, ServiceCard, Grid } from "@/components/ui";
import { useHomepageContent } from "@/hooks/homepage";

export default function ServicesSection() {
  const { data, isLoading } = useHomepageContent();

  return (
    <section className="bg-surface-100 py-10 sm:py-12">
      <Container>
        <SectionHeader
          title="Our Services"
          subtitle="Healthcare made simple, accessible, and reliable"
        />

        <Grid
          cols={1}
          gap="md"
          responsive={{ sm: { cols: 2 }, lg: { cols: 4 } }}
        >
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl border border-surface-200 bg-surface-0" />
              ))
            : data?.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  icon={<service.icon size={20} className="text-inherit" aria-hidden="true" />}
                  title={service.title}
                  description={service.description}
                  color={service.color}
                />
              ))}
        </Grid>
      </Container>
    </section>
  );
}
