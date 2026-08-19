/**
 * HeroBanner
 *
 * Primary hero section with promotional banner and call-to-action.
 */

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:px-6 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Your Health, Our Priority
            </span>
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Healthcare essentials
              <br />
              delivered to your doorstep
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-emerald-100 sm:text-lg">
              Order medicines, wellness products, and health devices with guaranteed authenticity
              and fast delivery. Licensed pharmacists, verified products.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-300"
              >
                Shop Now
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="border border-emerald-400/30 text-white hover:bg-emerald-600 hover:text-white"
              >
                Upload Prescription
              </Button>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="hidden lg:block">
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border-2 border-dashed border-emerald-400/30 bg-emerald-500/10">
              <div className="text-center">
                <p className="text-lg font-semibold text-emerald-200">Hero Image</p>
                <p className="mt-1 text-sm text-emerald-300/70">1200 x 900</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
