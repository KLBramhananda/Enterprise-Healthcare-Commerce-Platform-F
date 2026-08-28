import { Container } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import HelpSearchBar from "@/components/support/HelpSearchBar";
import SupportQuickLinks from "@/components/support/SupportQuickLinks";
import { useFAQs } from "@/hooks/support";

export default function HelpCenterPage() {
  usePageTitle("Help Center");
  const { data: faqs = [] } = useFAQs();

  const featured = faqs.filter((f) => f.featured).slice(0, 5);

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Help Center" }]} />

        <header className="mt-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">How can we help you?</h1>
          <p className="mt-2 text-sm text-surface-500">Search our help center or browse the topics below.</p>
          <HelpSearchBar className="mx-auto mt-6 max-w-xl" autoFocus />
        </header>

        <section className="mt-10">
          <SupportQuickLinks />
        </section>

        {featured.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-surface-900">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {featured.map((faq) => (
                <div key={faq.id} className="rounded-xl border border-surface-200 bg-surface-0 px-5 py-4">
                  <h3 className="text-sm font-semibold text-surface-900">{faq.question}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-surface-500">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
