import { useState } from "react";
import { ChevronDown, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/utils/cn";
import type { FAQItem } from "@/types/support";
import { useSubmitFAQFeedback } from "@/hooks/support";

export default function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [voted, setVoted] = useState<"helpful" | "not_helpful" | null>(null);
  const feedback = useSubmitFAQFeedback();

  const handleVote = (helpful: boolean) => {
    if (voted) return;
    setVoted(helpful ? "helpful" : "not_helpful");
    feedback.mutate({ id: item.id, helpful });
  };

  return (
    <div className={cn("rounded-xl border transition-colors", isOpen ? "border-brand-200 bg-brand-50/30" : "border-surface-200 bg-surface-0")}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <span className="flex-1 text-sm font-semibold text-surface-900">{item.question}</span>
        <ChevronDown size={18} className={cn("shrink-0 text-surface-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          <p className="text-sm leading-relaxed text-surface-600">{item.answer}</p>
          <div className="mt-4 flex items-center gap-3 border-t border-surface-100 pt-3">
            <span className="text-xs text-surface-400">Was this helpful?</span>
            <button type="button" onClick={() => handleVote(true)} disabled={!!voted} className={cn("flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors", voted === "helpful" ? "bg-success-50 text-success-600" : "text-surface-500 hover:bg-surface-100 disabled:opacity-50")}>
              <ThumbsUp size={12} /> Yes ({item.helpful})
            </button>
            <button type="button" onClick={() => handleVote(false)} disabled={!!voted} className={cn("flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors", voted === "not_helpful" ? "bg-danger-50 text-danger-600" : "text-surface-500 hover:bg-surface-100 disabled:opacity-50")}>
              <ThumbsDown size={12} /> No ({item.notHelpful})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
