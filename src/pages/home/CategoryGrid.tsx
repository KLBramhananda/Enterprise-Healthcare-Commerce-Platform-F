/**
 * CategoryGrid
 *
 * Horizontal category navigation with visual cards for quick access.
 */

import { Link } from "react-router-dom";
import { Pill, Leaf, TestTube, Stethoscope, User, Apple, Flower2, Droplets } from "lucide-react";

const categories = [
  { title: "Medicines", path: "/category/medicines", icon: Pill, color: "bg-blue-100 text-blue-600" },
  { title: "Wellness", path: "/category/wellness", icon: Leaf, color: "bg-green-100 text-green-600" },
  { title: "Lab Tests", path: "/category/lab-tests", icon: TestTube, color: "bg-purple-100 text-purple-600" },
  { title: "Health Devices", path: "/category/health-devices", icon: Stethoscope, color: "bg-amber-100 text-amber-600" },
  { title: "Personal Care", path: "/category/personal-care", icon: User, color: "bg-pink-100 text-pink-600" },
  { title: "Nutrition", path: "/category/nutrition", icon: Apple, color: "bg-orange-100 text-orange-600" },
  { title: "Ayurveda", path: "/category/ayurveda", icon: Flower2, color: "bg-emerald-100 text-emerald-600" },
  { title: "Homeopathy", path: "/category/homeopathy", icon: Droplets, color: "bg-cyan-100 text-cyan-600" },
];

export default function CategoryGrid() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Shop by Category</h2>
          <Link
            to="/categories"
            className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 sm:gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.title}
                to={category.path}
                className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-all hover:bg-slate-50 sm:p-4"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-14 sm:w-14 ${category.color}`}
                >
                  <Icon size={22} />
                </div>
                <span className="text-center text-[11px] font-medium leading-tight text-slate-700 sm:text-xs">
                  {category.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
