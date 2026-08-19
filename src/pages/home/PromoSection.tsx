/**
 * PromoSection
 *
 * Promotional cards highlighting key value propositions.
 */

import { Truck, Shield, HeadphonesIcon, BadgePercent } from "lucide-react";

const promos = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "On orders above $50",
  },
  {
    icon: Shield,
    title: "100% Authentic",
    description: "Verified products only",
  },
  {
    icon: HeadphonesIcon,
    title: "Expert Support",
    description: "Licensed pharmacist advice",
  },
  {
    icon: BadgePercent,
    title: "Best Prices",
    description: "Up to 50% off on medicines",
  },
];

export default function PromoSection() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {promos.map((promo) => {
            const Icon = promo.icon;
            return (
              <div
                key={promo.title}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-emerald-200 hover:shadow-sm sm:p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 sm:h-12 sm:w-12">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{promo.title}</h3>
                  <p className="text-xs text-slate-500 sm:text-sm">{promo.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
