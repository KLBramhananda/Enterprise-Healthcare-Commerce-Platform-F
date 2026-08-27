/**
 * AppDownloadBanner
 *
 * Premium mobile app download promotional section with a phone mockup
 * placeholder, marketing headline, feature highlights, store badges, and a
 * QR code placeholder. Styled with the KeeMeds brand palette and spacing
 * system via the shared design tokens.
 */

import type { ReactNode } from "react";
import {
  Apple,
  BellRing,
  PackageCheck,
  Percent,
  Play,
  Scan,
  ShieldCheck,
} from "lucide-react";
import { APP_NAME, APP_STORE_URL, GOOGLE_PLAY_URL } from "@/config/constants";
import { Container } from "@/components/ui";

const features = [
  { icon: Percent, label: "App-only discounts & coupons" },
  { icon: PackageCheck, label: "Real-time order tracking" },
  { icon: BellRing, label: "Refill & dosage reminders" },
  { icon: ShieldCheck, label: "Secure payments & prescriptions" },
];

function StoreButton({
  href,
  topLine,
  bottomLine,
  icon,
  variant,
}: {
  href: string;
  topLine: string;
  bottomLine: string;
  icon: ReactNode;
  variant: "primary" | "outline";
}) {
  const styles =
    variant === "primary"
      ? "border-transparent bg-white text-surface-900 shadow-lg hover:bg-brand-50 focus-visible:ring-white"
      : "border-white/40 bg-white/5 text-white hover:border-white hover:bg-white/10 focus-visible:ring-white";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-w-0 flex-1 items-center justify-center gap-3 rounded-xl border px-5 py-3 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700 sm:flex-none sm:px-6 ${styles}`}
    >
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[10px] uppercase tracking-wide opacity-80">{topLine}</span>
        <span className="text-base font-semibold">{bottomLine}</span>
      </span>
    </a>
  );
}

function PhoneMockup() {
  return (
    <div
      className="relative mx-auto w-full max-w-[300px]"
      aria-hidden="true"
    >
      {/* Glow */}
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-brand-400/25 blur-2xl" />

      {/* Frame */}
      <div className="mx-auto w-[240px] rounded-[2.2rem] border border-brand-300/40 bg-white/10 p-2 shadow-2xl">
        <div className="overflow-hidden rounded-[1.7rem] bg-surface-50">
          {/* Notch bar */}
          <div className="flex items-center justify-center bg-brand-700 px-4 py-2">
            <div className="h-1.5 w-16 rounded-full bg-brand-300/60" />
          </div>
          {/* Screen content placeholder */}
          <div className="space-y-4 px-4 py-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-500" />
              <div className="space-y-1.5">
                <div className="h-2 w-20 rounded-full bg-surface-200" />
                <div className="h-2 w-28 rounded-full bg-surface-200" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-3/4 rounded-lg bg-surface-200" />
              <div className="h-20 rounded-xl border border-brand-100 bg-white p-3 shadow-sm">
                <div className="h-2 w-2/3 rounded-full bg-brand-200" />
              </div>
              <div className="h-16 rounded-xl border border-surface-100 bg-white p-3 shadow-sm">
                <div className="mb-2 h-2 w-1/2 rounded-full bg-surface-200" />
                <div className="flex gap-1.5">
                  <div className="h-8 w-8 rounded-md bg-surface-100" />
                  <div className="h-8 w-8 rounded-md bg-surface-100" />
                  <div className="h-8 w-8 rounded-md bg-surface-100" />
                  <div className="h-8 w-8 rounded-md bg-surface-100" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-brand-50">
                <div className="space-y-1.5">
                  <div className="h-2 w-24 rounded-full bg-brand-300/70" />
                  <div className="h-2 w-16 rounded-full bg-brand-300/70" />
                </div>
                <div className="h-9 w-9 rounded-full bg-brand-100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div className="absolute -left-4 top-16 hidden rounded-xl bg-white px-3 py-2 shadow-lg sm:block">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-brand-600" />
          <div>
            <p className="text-[10px] font-semibold text-surface-800">Verified</p>
            <p className="text-[9px] text-surface-500">Pharmacy</p>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 bottom-14 hidden rounded-xl bg-white px-3 py-2 shadow-lg sm:block">
        <div className="flex items-center gap-2">
          <BellRing size={18} className="text-brand-600" />
          <div>
            <p className="text-[10px] font-semibold text-surface-800">Refill</p>
            <p className="text-[9px] text-surface-500">Reminders</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrPlaceholder() {
  /* Decorative 8x8 QR-style placeholder for future integration. */
  const cells = [
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  return (
    <div className="hidden flex-col items-center gap-2 sm:flex">
      <div
        className="grid h-24 w-24 grid-cols-[repeat(12,1fr)] gap-[2px] rounded-lg bg-white p-2 shadow-lg"
        role="img"
        aria-label="QR code placeholder — scanning to download the app soon"
      >
        {cells.flatMap((row, r) =>
          row.map((cell, c) => (
            <span
              key={`${r}-${c}`}
              className={
                cell === 1
                  ? "aspect-square rounded-[1px] bg-surface-900"
                  : "aspect-square rounded-[1px] bg-white"
              }
            />
          )),
        )}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-brand-100">
        <Scan size={13} aria-hidden="true" /> Scan to download
      </p>
    </div>
  );
}

export default function AppDownloadBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
      {/* Decorative accents */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          {/* Content */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-50">
              {APP_NAME} Mobile App
            </span>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              Your pharmacy, in your pocket
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-50/90 sm:text-lg lg:mx-0">
              Order medicines, book lab tests, and consult doctors on the go — all from one
              secure, trusted app. Get everything delivered to your door.
            </p>

            {/* Feature highlights */}
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {features.map((feature) => (
                <li
                  key={feature.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/40 text-brand-50">
                    <feature.icon size={18} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-white">{feature.label}</span>
                </li>
              ))}
            </ul>

            {/* Store buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start lg:gap-4">
              <StoreButton
                href={APP_STORE_URL}
                topLine="Download on the"
                bottomLine="App Store"
                icon={<Apple size={26} fill="currentColor" />}
                variant="primary"
              />
              <StoreButton
                href={GOOGLE_PLAY_URL}
                topLine="Get it on"
                bottomLine="Google Play"
                icon={<Play size={26} fill="currentColor" />}
                variant="outline"
              />
            </div>
          </div>

          {/* Visual / QR */}
          <div className="flex flex-col items-center gap-8 lg:gap-10">
            <PhoneMockup />
            <QrPlaceholder />
          </div>
        </div>
      </Container>
    </section>
  );
}
