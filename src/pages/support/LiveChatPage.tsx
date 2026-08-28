import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Send, HelpCircle, Phone, FileText, Clock, Bot, User, Construction, ArrowLeft, Info } from "lucide-react";
import { Container, Card, CardBody, Badge, Button, Textarea } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks";
import { cn } from "@/utils/cn";

/* ── Mock data ── */

interface MockConversation {
  id: string;
  agentName: string;
  agentInitial: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: "active" | "waiting" | "ended";
}

interface MockMessage {
  id: string;
  sender: "user" | "agent" | "system";
  content: string;
  timestamp: string;
}

const MOCK_CONVERSATIONS: MockConversation[] = [
  { id: "conv-1", agentName: "KeeMeds Support", agentInitial: "K", lastMessage: "Your order has been dispatched and will arrive tomorrow.", timestamp: "2 min ago", unread: 0, status: "ended" },
  { id: "conv-2", agentName: "Pharmacy Team", agentInitial: "P", lastMessage: "Please upload your prescription for verification.", timestamp: "1 hr ago", unread: 2, status: "active" },
  { id: "conv-3", agentName: "Technical Support", agentInitial: "T", lastMessage: "We've resolved the payment issue. Please try again.", timestamp: "Yesterday", unread: 0, status: "ended" },
  { id: "conv-4", agentName: "Customer Care", agentInitial: "C", lastMessage: "Your refund of ₹450 has been initiated.", timestamp: "2 days ago", unread: 0, status: "ended" },
];

const MOCK_MESSAGES: MockMessage[] = [
  { id: "m1", sender: "system", content: "Welcome to KeeMeds Live Chat! An agent will be with you shortly.", timestamp: "10:00 AM" },
  { id: "m2", sender: "agent", content: "Hello! I'm Priya from the KeeMeds support team. How can I help you today?", timestamp: "10:01 AM" },
  { id: "m3", sender: "user", content: "Hi, I need help with my recent order #ORD-1004. The delivery seems delayed.", timestamp: "10:02 AM" },
  { id: "m4", sender: "agent", content: "Let me check the status of your order. One moment please.", timestamp: "10:03 AM" },
  { id: "m5", sender: "agent", content: "I can see that your order was dispatched yesterday. The estimated delivery is tomorrow by 5 PM. Would you like me to share the tracking link?", timestamp: "10:04 AM" },
  { id: "m6", sender: "user", content: "Yes please, that would be helpful. Thank you!", timestamp: "10:05 AM" },
  { id: "m7", sender: "agent", content: "Here's the tracking link: track.keemeds.com/ORD-1004\n\nYour order will arrive between 2 PM - 5 PM tomorrow. Is there anything else I can help you with?", timestamp: "10:06 AM" },
];

/* ── Typing indicator ── */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-600 text-xs font-bold text-white">
        <Bot size={14} />
      </div>
      <div className="rounded-2xl rounded-bl-md bg-surface-100 px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-surface-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-surface-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-surface-400" />
        </div>
      </div>
      <span className="text-xs text-surface-400">Agent is typing...</span>
    </div>
  );
}

/* ── Chat message bubble ── */

function ChatBubble({ message }: { message: MockMessage }) {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";

  if (isSystem) {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        <div className="h-px flex-1 bg-surface-200" />
        <span className="flex items-center gap-1 text-xs text-surface-400">
          <Info size={12} /> {message.content}
        </span>
        <div className="h-px flex-1 bg-surface-200" />
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "")}>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", isUser ? "bg-brand-600" : "bg-surface-600")}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={cn("max-w-[75%] space-y-1", isUser ? "text-right" : "")}>
        <div className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap", isUser ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-surface-100 text-surface-900")}>
          {message.content}
        </div>
        <p className={cn("text-[10px] text-surface-400", isUser ? "text-right" : "")}>{message.timestamp}</p>
      </div>
    </div>
  );
}

/* ── Conversation list item ── */

function ConversationItem({ conversation, isActive, onClick }: { conversation: MockConversation; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
        isActive ? "bg-brand-50 ring-1 ring-brand-200" : "hover:bg-surface-50"
      )}
    >
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", conversation.status === "active" ? "bg-success-600" : "bg-surface-500")}>
        {conversation.agentInitial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-surface-900 truncate">{conversation.agentName}</span>
          <span className="shrink-0 text-[10px] text-surface-400">{conversation.timestamp}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-surface-500">{conversation.lastMessage}</p>
          {conversation.unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ── Main page ── */

export default function LiveChatPage() {
  usePageTitle("Live Chat");

  const [selectedConvId, setSelectedConvId] = useState<string>(MOCK_CONVERSATIONS[0].id);
  const [showMobileList, setShowMobileList] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const selectedConv = MOCK_CONVERSATIONS.find((c) => c.id === selectedConvId);

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Help Center", path: "/help" }, { label: "Live Chat" }]} />

        <header className="mt-4 border-b border-surface-200 pb-5">
          <h1 className="text-xl font-bold tracking-tight text-surface-900 sm:text-2xl">Live Chat</h1>
          <p className="mt-1 text-sm text-surface-500">Chat with our support team in real-time.</p>
        </header>

        {/* Coming Soon Banner */}
        <div className="mt-6 rounded-xl border border-warning-200 bg-warning-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-100">
              <Construction size={20} className="text-warning-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-warning-800">Live Chat Coming Soon</h2>
              <p className="mt-1 text-xs text-warning-700">
                Our real-time chat feature is currently under development. The preview below shows how it will work.
                In the meantime, reach us through our other support channels.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/help/contact" className="inline-flex items-center gap-1.5 rounded-lg bg-warning-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-warning-700">
                  <Phone size={12} /> Contact Support
                </Link>
                <Link to="/help/tickets/new" className="inline-flex items-center gap-1.5 rounded-lg border border-warning-300 bg-white px-3 py-1.5 text-xs font-medium text-warning-700 transition-colors hover:bg-warning-50">
                  <FileText size={12} /> Raise a Ticket
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface Preview */}
        <div className="mt-6 overflow-hidden rounded-xl border border-surface-200 bg-surface-0" style={{ height: "min(520px, 70vh)" }}>
          <div className="flex h-full">
            {/* Sidebar: Conversation List */}
            <div className={cn("flex h-full flex-col border-r border-surface-200", showMobileList ? "w-full sm:w-80" : "hidden sm:flex sm:w-80")}>
              <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-brand-600" />
                  <h3 className="text-sm font-bold text-surface-900">Conversations</h3>
                </div>
                <Badge variant="default">{MOCK_CONVERSATIONS.length}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {MOCK_CONVERSATIONS.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === selectedConvId}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setShowMobileList(false);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Main: Chat Area */}
            <div className={cn("flex h-full flex-1 flex-col", !showMobileList ? "flex" : "hidden sm:flex")}>
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-surface-100 px-4 py-3">
                <button
                  type="button"
                  className="sm:hidden"
                  onClick={() => setShowMobileList(true)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} className="text-surface-500 hover:text-surface-700" />
                </button>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-600 text-xs font-bold text-white">
                  {selectedConv?.agentInitial ?? "K"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-surface-900">{selectedConv?.agentName ?? "KeeMeds Support"}</p>
                  <p className="text-[11px] text-surface-400">
                    {selectedConv?.status === "active" ? (
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success-500" /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clock size={10} /> Last active {selectedConv?.timestamp}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {MOCK_MESSAGES.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                <TypingIndicator />
              </div>

              {/* Input */}
              <div className="border-t border-surface-100 px-4 py-3">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    rows={1}
                    className="min-h-[40px] max-h-[100px] flex-1 resize-none text-sm"
                    aria-label="Type a message"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </Button>
                </div>
                <p className="mt-2 flex items-center gap-1 text-[10px] text-surface-400">
                  <Construction size={10} /> Live chat is not yet available. This is a preview of the upcoming feature.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Other Support Channels */}
        <div className="mt-8">
          <h3 className="mb-4 text-sm font-bold text-surface-900">Other ways to get help</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { to: "/help/faq", icon: HelpCircle, label: "FAQ", description: "Browse common questions", color: "bg-info-50 text-info-600" },
              { to: "/help/contact", icon: Phone, label: "Contact Us", description: "Phone, email, or chat", color: "bg-brand-50 text-brand-600" },
              { to: "/help/tickets/new", icon: FileText, label: "Raise a Ticket", description: "Get tracked support", color: "bg-warning-50 text-warning-600" },
            ].map((ch) => {
              const Icon = ch.icon;
              return (
                <Link key={ch.to} to={ch.to}>
                  <Card interactive className="h-full">
                    <CardBody>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ch.color}`}>
                        <Icon size={20} />
                      </div>
                      <h4 className="mt-3 text-sm font-semibold text-surface-900">{ch.label}</h4>
                      <p className="mt-0.5 text-xs text-surface-500">{ch.description}</p>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </div>
  );
}
