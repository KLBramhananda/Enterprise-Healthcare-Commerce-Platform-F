/**
 * DoctorConsultationBanner
 *
 * Doctor consultation promotion banner with benefits and CTA.
 * Uses Container, Button from the design system.
 */

import { Link } from "react-router-dom";
import { CircleCheckBig, Stethoscope, Video, MessageSquare, PhoneCall } from "lucide-react";
import { Container } from "@/components/ui";

const highlights = [
  { icon: Video, label: "Video consultations" },
  { icon: MessageSquare, label: "Chat with doctors" },
  { icon: PhoneCall, label: "24x7 availability" },
];

export default function DoctorConsultationBanner() {
  return (
    <section className="bg-surface-0 py-10 sm:py-12">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-surface-900 shadow-lg">
          {/* Decorative glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[auto_1fr_auto] lg:gap-12">
            <div className="hidden h-24 w-24 items-center justify-center rounded-2xl bg-brand-500/15 ring-1 ring-brand-400/30 lg:flex">
              <Stethoscope size={44} className="text-brand-400" aria-hidden="true" />
            </div>

            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                Consult Online
              </p>
              <h2 className="mt-1.5 text-xl font-bold text-white sm:text-2xl">
                Not sure what you need? Talk to a certified doctor.
              </h2>
              <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
                {highlights.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-1.5 text-sm text-surface-300"
                  >
                    <CircleCheckBig size={14} className="text-brand-400" aria-hidden="true" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center lg:flex-col">
              <Link
                to="/consultations"
                className="inline-flex w-full items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-base font-semibold text-surface-950 transition-colors duration-fast hover:bg-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900 sm:w-auto"
              >
                Book Consultation
              </Link>
              <p className="text-xs text-surface-400">Starting at just $5</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
