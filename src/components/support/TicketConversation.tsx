import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import type { TicketMessage } from "@/types/support";

function formatTimestamp(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export default function TicketConversation({ messages }: { messages: TicketMessage[] }) {
  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isCustomer = msg.sender === "customer";
        const isSystem = msg.sender === "system";

        if (isSystem) {
          return (
            <div key={msg.id} className="flex items-center justify-center gap-2 py-2">
              <div className="h-px flex-1 bg-surface-200" />
              <span className="flex items-center gap-1 text-xs text-surface-400">
                <AlertCircle size={12} /> {msg.message}
              </span>
              <div className="h-px flex-1 bg-surface-200" />
            </div>
          );
        }

        return (
          <div key={msg.id} className={cn("flex gap-3", isCustomer ? "flex-row-reverse" : "")}>
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", isCustomer ? "bg-brand-600" : "bg-surface-600")}>
              {msg.senderName?.charAt(0) ?? "S"}
            </div>
            <div className={cn("max-w-[75%] rounded-xl px-4 py-3", isCustomer ? "bg-brand-600 text-white" : "bg-surface-100 text-surface-900")}>
              <p className="text-[11px] font-semibold opacity-70">{msg.senderName}</p>
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              {msg.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {msg.attachments.map((att) => (
                    <div key={att.id} className={cn("flex items-center gap-2 rounded-lg px-2 py-1 text-xs", isCustomer ? "bg-white/10" : "bg-surface-0")}>
                      <span className="truncate">{att.name}</span>
                      <span className="shrink-0 opacity-50">{(att.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}
              <p className={cn("mt-1 text-[10px] opacity-50", isCustomer ? "text-right" : "")}>{formatTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
