/**
 * PrescriptionUploadCta
 *
 * Prescription upload call-to-action with simple three-step explainer
 * and a visual upload dropzone placeholder.
 * Uses Container from the design system.
 */

import { Link } from "react-router-dom";
import { CircleCheckBig, FileText, ShieldCheck, UploadCloud } from "lucide-react";
import { Container } from "@/components/ui";

const steps = [
  {
    title: "Upload your prescription",
    description: "Snap a photo or upload a PDF of your doctor's prescription.",
  },
  {
    title: "Pharmacist verification",
    description: "Our licensed pharmacists validate medicines and dosages.",
  },
  {
    title: "Get it delivered",
    description: "Medicines arrive at your doorstep, fast and safely packed.",
  },
];

export default function PrescriptionUploadCta() {
  return (
    <section className="bg-surface-0 py-10 sm:py-12">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Copy + Steps */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
              Hassle-free ordering
            </p>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">
              Order with a prescription in 3 easy steps
            </h2>

            <ol className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-900 sm:text-base">
                      {step.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-surface-500">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                to="/prescriptions"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 px-6 py-2.5 text-base font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <UploadCloud size={18} aria-hidden="true" />
                Upload Prescription
              </Link>
              <p className="flex items-center gap-1.5 text-xs text-surface-500">
                <ShieldCheck size={14} className="text-brand-600" aria-hidden="true" />
                Your health data stays private and encrypted
              </p>
            </div>
          </div>

          {/* Visual dropzone */}
          <div className="relative mx-auto w-full max-w-md">
            <div
              className="rounded-2xl border-2 border-dashed border-brand-300 bg-surface-0 p-8 shadow-sm"
              aria-hidden="true"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                  <FileText size={26} className="text-brand-600" />
                </div>
                <p className="mt-4 text-sm font-semibold text-surface-800">
                  Drag &amp; drop your prescription here
                </p>
                <p className="mt-1 text-xs text-surface-400">or browse files from your device</p>
                <span className="mt-4 inline-block rounded-lg bg-surface-100 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-surface-500">
                  JPG, PNG or PDF &middot; Max 10 MB
                </span>
              </div>

              <ul className="mt-6 space-y-2 border-t border-surface-100 pt-5">
                {["Valid prescription required", "Verified by licensed pharmacists", "Genuine medicines only"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-surface-500">
                      <CircleCheckBig size={13} className="shrink-0 text-brand-600" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md sm:-right-5">
              <FileText size={12} aria-hidden="true" />
              Rx Verified
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
