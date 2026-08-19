/**
 * HealthTips
 *
 * Featured health content section for articles, tips, and health education.
 */

import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui";

const placeholders = [
  { id: "tip-1", category: "Nutrition", title: "Essential nutrients for daily health" },
  { id: "tip-2", category: "Wellness", title: "Managing stress with simple habits" },
  { id: "tip-3", category: "Fitness", title: "Beginner guide to staying active" },
];

export default function HealthTips() {
  return (
    <section className="bg-slate-50 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Health Tips & Articles</h2>
            <p className="mt-1 text-sm text-slate-500">Expert advice for a healthier lifestyle</p>
          </div>
          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
            Read More
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((tip) => (
            <article
              key={tip.id}
              className="group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-emerald-200 hover:shadow-sm"
            >
              {/* Image Placeholder */}
              <div className="flex aspect-[16/9] items-center justify-center border-b border-slate-100 bg-slate-50">
                <BookOpen size={28} className="text-slate-300" />
              </div>

              <div className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  {tip.category}
                </span>
                <h3 className="mt-2 text-base font-semibold text-slate-900 group-hover:text-emerald-700">
                  {tip.title}
                </h3>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-600">
                  <span>Read more</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
