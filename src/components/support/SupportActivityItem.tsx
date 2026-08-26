import { Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import type { SupportActivity } from "@/types/support";

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

const ACTIVITY_ICONS: Record<string, string> = {
  ticket_created: "bg-blue-50 text-blue-600",
  ticket_updated: "bg-warning-50 text-warning-600",
  ticket_resolved: "bg-success-50 text-success-600",
  return_initiated: "bg-purple-50 text-purple-600",
  refund_processed: "bg-success-50 text-success-600",
};

export default function SupportActivityItem({ activity }: { activity: SupportActivity }) {
  const colorClass = ACTIVITY_ICONS[activity.type] ?? "bg-surface-100 text-surface-600";
  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colorClass)}>
        <Clock size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-700">{activity.description}</p>
        <p className="mt-0.5 text-xs text-surface-400">{formatRelativeTime(activity.timestamp)}</p>
      </div>
    </div>
  );
}
