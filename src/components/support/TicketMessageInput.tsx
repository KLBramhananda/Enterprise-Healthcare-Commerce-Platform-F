import { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui";
import { useAddTicketMessage } from "@/hooks/support";
import { cn } from "@/utils/cn";

export default function TicketMessageInput({ ticketId }: { ticketId: string }) {
  const [message, setMessage] = useState("");
  const addMessage = useAddTicketMessage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || addMessage.isPending) return;
    addMessage.mutate({ ticketId, message: message.trim() }, { onSuccess: () => setMessage("") });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-xl border border-surface-200 bg-surface-0 p-3">
      <button type="button" className="shrink-0 rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-600" aria-label="Attach file">
        <Paperclip size={18} />
      </button>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        rows={2}
        disabled={addMessage.isPending}
        className={cn(
          "flex-1 resize-none bg-transparent text-sm text-surface-900 outline-none placeholder:text-surface-400 disabled:cursor-not-allowed disabled:text-surface-500",
        )}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
      />
      <Button type="submit" loading={addMessage.isPending} disabled={!message.trim()} className="shrink-0 px-2.5 py-2.5" aria-label="Send message">
        <Send size={16} />
      </Button>
    </form>
  );
}
