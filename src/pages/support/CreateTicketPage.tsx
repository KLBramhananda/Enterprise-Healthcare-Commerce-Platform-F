import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Container, Button, Input, Textarea, Select } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import { useToast } from "@/providers/ToastProvider";
import { useCreateTicket } from "@/hooks/support";
import type { TicketPriority, TicketCategory } from "@/types/support";

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "order_issue", label: "Order Issue" },
  { value: "delivery", label: "Delivery" },
  { value: "payment", label: "Payment" },
  { value: "prescription", label: "Prescription" },
  { value: "product", label: "Product" },
  { value: "account", label: "Account" },
  { value: "technical", label: "Technical" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function CreateTicketPage() {
  usePageTitle("Raise a Ticket");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillOrderId = searchParams.get("orderId") ?? "";
  const createTicket = useCreateTicket();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    subject: "",
    description: "",
    category: "order_issue" as TicketCategory,
    priority: "medium" as TicketPriority,
    orderId: prefillOrderId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate(form, {
      onSuccess: (ticket) => {
        addToast(`Your ticket ${ticket.id} has been created.`, "success");
        navigate(`/help/tickets/${ticket.id}`);
      },
      onError: () => addToast("Failed to create ticket. Please try again.", "error"),
    });
  };

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb
          items={[
            { label: "Home", path: "/" },
            { label: "Help Center", path: "/help" },
            { label: "My Tickets", path: "/help/tickets" },
            { label: "Raise a Ticket" },
          ]}
        />

        <div className="mt-4">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-brand-600">
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">Raise a Ticket</h1>
          <p className="mt-1 text-sm text-surface-500">Describe your issue and we'll get back to you.</p>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
          <div>
            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-surface-700">Subject</label>
            <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of your issue" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-surface-700">Category</label>
              <Select id="category" options={CATEGORY_OPTIONS} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })} />
            </div>
            <div>
              <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-surface-700">Priority</label>
              <Select id="priority" options={PRIORITY_OPTIONS} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })} />
            </div>
          </div>
          <div>
            <label htmlFor="orderId" className="mb-1.5 block text-sm font-medium text-surface-700">Related Order ID <span className="text-surface-400">(optional)</span></label>
            <Input id="orderId" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} placeholder="e.g. ORD-20240101" />
          </div>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-surface-700">Description</label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Describe your issue in detail..." required />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={createTicket.isPending}><Send size={16} className="mr-1.5 inline" />{createTicket.isPending ? "Submitting..." : "Submit Ticket"}</Button>
          </div>
        </form>
      </Container>
    </div>
  );
}
