import { Headphones, Pill, Stethoscope, Monitor, Mail, Phone, ExternalLink } from "lucide-react";
import { Card, CardBody } from "@/components/ui";
import type { SupportChannelInfo } from "@/types/support";

const CHANNEL_ICONS: Record<string, typeof Headphones> = {
  Headphones, Pill, Stethoscope, Monitor, Mail, Phone,
};

const CHANNEL_COLORS: Record<string, string> = {
  customer_care: "bg-brand-50 text-brand-600",
  pharmacy: "bg-info-50 text-info-600",
  healthcare: "bg-success-50 text-success-600",
  technical: "bg-warning-50 text-warning-600",
  email: "bg-purple-50 text-purple-600",
  phone: "bg-pink-50 text-pink-600",
};

export default function ContactChannelCard({ channel }: { channel: SupportChannelInfo }) {
  const Icon = CHANNEL_ICONS[channel.icon] ?? Headphones;
  const colorClass = CHANNEL_COLORS[channel.id] ?? "bg-surface-100 text-surface-600";

  return (
    <Card interactive>
      <CardBody>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
            <Icon size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-surface-900">{channel.name}</h3>
            <p className="mt-1 text-xs text-surface-500">{channel.description}</p>
            <div className="mt-3 space-y-1.5">
              {channel.phone && (
                <a href={`tel:${channel.phone.replace(/\D/g, "")}`} className="flex items-center gap-1.5 text-xs text-surface-600 hover:text-brand-600">
                  <Phone size={12} /> {channel.phone}
                </a>
              )}
              {channel.email && (
                <a href={`mailto:${channel.email}`} className="flex items-center gap-1.5 text-xs text-surface-600 hover:text-brand-600">
                  <Mail size={12} /> {channel.email}
                </a>
              )}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-surface-400">
              <span>{channel.hours}</span>
              <span className="flex items-center gap-1"><ExternalLink size={10} /> {channel.responseTime}</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
