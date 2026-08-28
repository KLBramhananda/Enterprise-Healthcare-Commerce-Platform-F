import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Send } from "lucide-react";
import { Container, Button, Input, Textarea, Select } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import { useToast } from "@/providers/ToastProvider";
import { useCreateTicket } from "@/hooks/support";
import { ticketSchema } from "@/hooks/support/schemas";
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

interface CreateTicketFormData {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  orderId?: string;
}

export default function CreateTicketPage() {
  usePageTitle("Raise a Ticket");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillOrderId = searchParams.get("orderId") ?? "";
  const createTicket = useCreateTicket();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(ticketSchema),
    mode: "onBlur",
    defaultValues: {
      subject: "",
      description: "",
      category: "order_issue",
      priority: "medium",
      orderId: prefillOrderId,
    },
  });

  const onSubmit = (data: CreateTicketFormData) => {
    createTicket.mutate(data, {
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-2xl space-y-5">
          <div>
            <Input id="subject" label="Subject" placeholder="Brief description of your issue" error={errors.subject?.message} {...register("subject")} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Select id="category" label="Category" options={CATEGORY_OPTIONS} error={errors.category?.message} {...register("category")} />
            </div>
            <div>
              <Select id="priority" label="Priority" options={PRIORITY_OPTIONS} error={errors.priority?.message} {...register("priority")} />
            </div>
          </div>
          <div>
            <Input id="orderId" label="Related Order ID (optional)" placeholder="e.g. ORD-20240101" error={errors.orderId?.message} {...register("orderId")} />
          </div>
          <div>
            <Textarea id="description" label="Description" rows={5} placeholder="Describe your issue in detail..." error={errors.description?.message} {...register("description")} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={createTicket.isPending}><Send size={16} className="mr-1.5 inline" />Submit Ticket</Button>
          </div>
        </form>
      </Container>
    </div>
  );
}
