/**
 * AppDownloadBanner
 *
 * Mobile app download call-to-action section.
 */

import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui";

export default function AppDownloadBanner() {
  return (
    <section className="bg-emerald-600">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 lg:px-6">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">
            <Smartphone size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Download the KeeMeds App
            </h2>
            <p className="mt-1 text-sm text-emerald-100 sm:text-base">
              Get exclusive app-only offers, track orders in real-time, and manage your health
              prescriptions on the go.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300"
            >
              App Store
            </Button>
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300"
            >
              Google Play
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
