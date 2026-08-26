import { cn } from "@/utils/cn";
import type { FAQCategory } from "@/types/support";

const CATEGORY_LABELS: Record<FAQCategory, string> = {
  ordering: "Ordering", delivery: "Delivery", payments: "Payments", prescriptions: "Prescriptions",
  account: "Account", returns: "Returns", healthcare: "Healthcare", technical: "Technical",
};

interface FAQCategoryTabsProps {
  active: FAQCategory | "all";
  onChange: (category: FAQCategory | "all") => void;
  counts: Record<string, number>;
}

export default function FAQCategoryTabs({ active, onChange, counts }: FAQCategoryTabsProps) {
  const categories: (FAQCategory | "all")[] = ["all", "ordering", "delivery", "payments", "prescriptions", "account", "returns", "healthcare", "technical"];

  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {categories.map((cat) => {
        const isActive = active === cat;
        const count = cat === "all" ? (counts.all ?? 0) : (counts[cat] ?? 0);
        return (
          <button key={cat} type="button" onClick={() => onChange(cat)} className={cn("flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all", isActive ? "bg-brand-600 text-white shadow-sm" : "text-surface-600 hover:bg-surface-100")}>
            {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
            {count > 0 && <span className={cn("ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-semibold", isActive ? "bg-white/20 text-white" : "bg-surface-100 text-surface-600")}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
