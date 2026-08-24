/**
 * AppDownloadBanner
 *
 * Mobile app download CTA with store badges and feature highlights.
 * Uses Container, Banner from the design system.
 */

import { Link } from "react-router-dom";
import { Apple, Play, Smartphone, BellRing, PackageCheck, Percent } from "lucide-react";
import { Banner, BannerTitle, BannerDescription, BannerActions, Container } from "@/components/ui";

const perks = [
  { icon: Percent, label: "App-only offers" },
  { icon: PackageCheck, label: "Real-time order tracking" },
  { icon: BellRing, label: "Refill reminders" },
];

export default function AppDownloadBanner() {
  return (
    <Banner className="py-10 sm:py-12">
      <Container>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-lg">
            <Smartphone size={28} aria-hidden="true" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <BannerTitle>Download the KeeMeds App</BannerTitle>
            <BannerDescription className="text-brand-100">
              Healthcare in your pocket — order medicines, book lab tests, and consult doctors on
              the go.
            </BannerDescription>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1.5 sm:justify-start">
              {perks.map((perk) => (
                <li key={perk.label} className="flex items-center gap-1.5 text-xs text-brand-100">
                  <perk.icon size={13} aria-hidden="true" />
                  {perk.label}
                </li>
              ))}
            </ul>
          </div>
          <BannerActions className="mt-2 w-full sm:w-auto">
            <Link
              to="/app"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-6 py-2.5 text-base font-semibold text-surface-900 transition-colors duration-fast hover:bg-surface-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
            >
              <Apple size={18} aria-hidden="true" />
              App Store
            </Link>
            <Link
              to="/app"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-2.5 text-base font-semibold text-white transition-colors duration-fast hover:border-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
            >
              <Play size={18} className="fill-current" aria-hidden="true" />
              Google Play
            </Link>
          </BannerActions>
        </div>
      </Container>
    </Banner>
  );
}
