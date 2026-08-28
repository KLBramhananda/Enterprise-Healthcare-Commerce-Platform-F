import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Container, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import HelpSearchBar from "@/components/support/HelpSearchBar";
import FAQCategoryTabs from "@/components/support/FAQCategoryTabs";
import FAQAccordion from "@/components/support/FAQAccordion";
import { useFAQs } from "@/hooks/support";
import type { FAQCategory } from "@/types/support";

export default function FAQPage() {
  usePageTitle("FAQ");
  const [searchParams] = useSearchParams();
  const prefilterQuery = searchParams.get("q") ?? "";
  const [activeCategory, setActiveCategory] = useState<FAQCategory | "all">("all");
  const { data: allFaqs = [], isLoading } = useFAQs();

  const counts: Record<string, number> = { all: allFaqs.length };
  allFaqs.forEach((f) => { counts[f.category] = (counts[f.category] || 0) + 1; });

  const filtered = allFaqs.filter((faq) => {
    if (activeCategory !== "all" && faq.category !== activeCategory) return false;
    if (prefilterQuery) {
      const q = prefilterQuery.toLowerCase();
      return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Help Center", path: "/help" }, { label: "FAQ" }]} />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">Frequently Asked Questions</h1>
          <p className="mt-1 text-sm text-surface-500">Browse common questions and answers.</p>
        </header>

        <div className="mt-6">
          <HelpSearchBar placeholder="Search FAQs..." />
        </div>

        <div className="mt-6">
          <FAQCategoryTabs active={activeCategory} onChange={setActiveCategory} counts={counts} />
        </div>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-surface-400">Loading FAQs...</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No FAQs found" description="Try a different category or search term." />
          ) : (
            filtered.map((faq) => <FAQAccordion key={faq.id} item={faq} />)
          )}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-surface-500">Still have questions?</p>
          <Link to="/help/contact" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline">
            <MessageCircle size={15} /> Contact our support team
          </Link>
        </div>
      </Container>
    </div>
  );
}
