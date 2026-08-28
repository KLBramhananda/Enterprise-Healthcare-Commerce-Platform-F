/**
 * Support Domain Types
 *
 * Types for the customer support module: FAQ, tickets, contact,
 * returns, refunds, live chat, and support dashboard.
 * Designed to mirror the ERPNext API contract for seamless backend swap.
 */

/* ── FAQ ── */

export type FAQCategory =
  | "ordering"
  | "delivery"
  | "payments"
  | "prescriptions"
  | "account"
  | "returns"
  | "healthcare"
  | "technical";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  tags: string[];
  helpful: number;
  notHelpful: number;
  featured: boolean;
}

/* ── Support Tickets ── */

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_customer"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketCategory =
  | "order_issue"
  | "delivery"
  | "payment"
  | "prescription"
  | "product"
  | "account"
  | "technical"
  | "other";

export interface TicketAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: "customer" | "support" | "system";
  senderName: string;
  message: string;
  attachments: TicketAttachment[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  orderId?: string;
  messages: TicketMessage[];
  attachments: TicketAttachment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketFormData {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  orderId?: string;
}

export interface TicketFilters {
  status?: TicketStatus | "all";
  category?: TicketCategory | "all";
  priority?: TicketPriority | "all";
  search?: string;
}

/* ── Contact ── */

export type SupportChannel =
  | "customer_care"
  | "pharmacy"
  | "healthcare"
  | "technical"
  | "email"
  | "phone";

export interface SupportChannelInfo {
  id: SupportChannel;
  name: string;
  description: string;
  icon: string;
  phone?: string;
  email?: string;
  hours: string;
  responseTime: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

/* ── Returns ── */

export type ReturnStatus =
  | "eligible"
  | "not_eligible"
  | "initiated"
  | "pickup_scheduled"
  | "picked_up"
  | "refunded";

export interface ReturnPolicy {
  title: string;
  description: string;
  eligibility: string[];
  exclusions: string[];
  process: string[];
  timeframes: { label: string; value: string }[];
}

export interface ReturnEligibility {
  eligible: boolean;
  orderId: string;
  reason?: string;
  eligibleItems: { productId: string; productName: string }[];
  ineligibleItems?: { productId: string; productName: string; reason: string }[];
}

export interface ReturnRequestItem {
  productId: string;
  productName: string;
  reason: string;
  quantity: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  items: ReturnRequestItem[];
  status: ReturnStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnRequestFormData {
  orderId: string;
  reason: string;
  description: string;
  items: { productId: string; quantity: number }[];
}

/* ── Refunds ── */

export type RefundStatus = "pending" | "processing" | "completed" | "failed";

export interface RefundPolicy {
  title: string;
  description: string;
  methods: { name: string; timeframe: string }[];
  timeframes: { label: string; value: string }[];
}

export interface RefundRecord {
  id: string;
  returnRequestId: string;
  orderId: string;
  amount: number;
  method: string;
  status: RefundStatus;
  createdAt: string;
  completedAt?: string;
}

/* ── Live Chat ── */

export type ChatStatus = "online" | "offline" | "away";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "system";
  senderName?: string;
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  status: "active" | "ended";
  agentName?: string;
  messages: ChatMessage[];
  startedAt: string;
}

/* ── Support Dashboard ── */

export type SupportActivityType =
  | "ticket_created"
  | "ticket_updated"
  | "ticket_resolved"
  | "return_initiated"
  | "refund_processed";

export interface SupportActivity {
  id: string;
  type: SupportActivityType;
  description: string;
  timestamp: string;
  link?: string;
}

export interface SupportStats {
  openTickets: number;
  resolvedTickets: number;
  pendingReturns: number;
  pendingRefunds: number;
}

/* ── Help Search ── */

export type HelpSearchResultType = "faq" | "article" | "policy" | "ticket";

export interface HelpSearchResult {
  id: string;
  type: HelpSearchResultType;
  title: string;
  description: string;
  url: string;
  category?: string;
}
