import { Link } from "react-router-dom";
import { HelpCircle, Phone, MessageSquare, FileText } from "lucide-react";

export default function NeedHelpBanner({ orderId }: { orderId?: string }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-surface-0 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
          <HelpCircle size={20} className="text-brand-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-surface-900">Need Help?</h3>
          <p className="text-xs text-surface-500">We're here to assist you with any questions or issues.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/help/faq" className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-50">
          <HelpCircle size={13} /> FAQ
        </Link>
        <Link to="/help/contact" className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-50">
          <Phone size={13} /> Contact Support
        </Link>
        <Link to={orderId ? `/help/tickets/new?orderId=${orderId}` : "/help/tickets/new"} className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-50">
          <FileText size={13} /> Raise a Ticket
        </Link>
        <Link to="/help/chat" className="inline-flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-2 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-50">
          <MessageSquare size={13} /> Live Chat
        </Link>
      </div>
    </div>
  );
}
