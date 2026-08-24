/**
 * PromoSection
 *
 * Promotional value proposition cards.
 * Uses Container, Grid, IconTile from the design system.
 */

import { Truck, Shield, HeadphonesIcon, BadgePercent } from "lucide-react";
import { Container, Grid, IconTile } from "@/components/ui";

const promos = [
  { icon: Truck, title: "Free Delivery", description: "On orders above $50", color: "brand" as const },
  { icon: Shield, title: "100% Authentic", description: "Verified products only", color: "green" as const },
  { icon: HeadphonesIcon, title: "Expert Support", description: "Licensed pharmacist advice", color: "blue" as const },
  { icon: BadgePercent, title: "Best Prices", description: "Up to 50% off on medicines", color: "amber" as const },
];

export default function PromoSection() {
  return (
    <section className="bg-surface-0 py-10 sm:py-12">
      <Container>
        <Grid
          cols={2}
          gap="md"
          responsive={{ sm: { gap: "lg" }, lg: { cols: 4 } }}
        >
          {promos.map((promo) => (
            <div
              key={promo.title}
              className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-50 p-4 transition-all duration-normal ease-smooth hover:border-brand-200 hover:shadow-sm sm:p-5"
            >
              <IconTile icon={<promo.icon size={20} />} size="sm" color={promo.color} />
              <div>
                <h3 className="text-sm font-semibold text-surface-900 sm:text-base">{promo.title}</h3>
                <p className="text-xs text-surface-500 sm:text-sm">{promo.description}</p>
              </div>
            </div>
          ))}
        </Grid>
      </Container>
    </section>
  );
}
