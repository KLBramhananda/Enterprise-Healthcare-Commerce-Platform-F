import { Container } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import ContactChannelCard from "@/components/support/ContactChannelCard";
import { useSupportChannels } from "@/hooks/support";

export default function ContactPage() {
  usePageTitle("Contact Us");
  const { data: channels = [], isLoading } = useSupportChannels();

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Help Center", path: "/help" }, { label: "Contact Us" }]} />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">Contact Us</h1>
          <p className="mt-1 text-sm text-surface-500">Choose the best way to reach our support team.</p>
        </header>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-surface-400">Loading contact options...</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((ch) => <ContactChannelCard key={ch.id} channel={ch} />)}
          </div>
        )}
      </Container>
    </div>
  );
}
