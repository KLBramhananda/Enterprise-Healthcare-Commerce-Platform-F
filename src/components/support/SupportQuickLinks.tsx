import { Link } from "react-router-dom";
import { HelpCircle, MessageSquare, FileText, Phone } from "lucide-react";
import { Card, CardBody } from "@/components/ui";

const QUICK_LINKS = [
  { to: "/help/faq", icon: HelpCircle, label: "FAQ", description: "Browse common questions", color: "bg-info-50 text-info-600" },
  { to: "/help/contact", icon: Phone, label: "Contact Us", description: "Reach our support team", color: "bg-brand-50 text-brand-600" },
  { to: "/help/tickets/new", icon: FileText, label: "Raise a Ticket", description: "Get tracked support", color: "bg-warning-50 text-warning-600" },
  { to: "/help/chat", icon: MessageSquare, label: "Live Chat", description: "Chat with support (coming soon)", color: "bg-purple-50 text-purple-600" },
];

export default function SupportQuickLinks() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {QUICK_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <Link key={link.to} to={link.to}>
            <Card interactive className="h-full">
              <CardBody>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-surface-900">{link.label}</h3>
                <p className="mt-0.5 text-xs text-surface-500">{link.description}</p>
              </CardBody>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
