/**
 * ServicesSection
 *
 * Healthcare services offered by KeeMeds with placeholder cards.
 */

import { FileText, TestTube, Truck, Phone } from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Upload Prescription",
    description: "Upload your prescription and get medicines delivered hassle-free",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    icon: TestTube,
    title: "Book Lab Tests",
    description: "Schedule lab tests from certified labs at discounted prices",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    icon: Truck,
    title: "Express Delivery",
    description: "Get your medicines delivered within 2 hours in your city",
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  {
    icon: Phone,
    title: "Doctor Consultation",
    description: "Consult with certified doctors online, anytime anywhere",
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-slate-50 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Our Services</h2>
          <p className="mt-1 text-sm text-slate-500">Healthcare made simple, accessible, and reliable</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.title}
                type="button"
                className={`group rounded-xl border p-6 text-left transition-all hover:shadow-md ${service.color}`}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
