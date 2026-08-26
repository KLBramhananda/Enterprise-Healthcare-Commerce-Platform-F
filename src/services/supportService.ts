/**
 * Support Service Interface
 *
 * The UI layer depends ONLY on this interface — never on a concrete implementation.
 * To switch to ERPNext, replace MockSupportService with ErpNextSupportService.
 */

import type {
  FAQCategory,
  FAQItem,
  TicketStatus,
  TicketFilters,
  Ticket,
  TicketFormData,
  TicketMessage,
  SupportChannelInfo,
  ContactFormData,
  ReturnPolicy,
  ReturnEligibility,
  ReturnRequest,
  ReturnRequestFormData,
  RefundPolicy,
  RefundRecord,
  ChatStatus,
  ChatSession,
  ChatMessage,
  SupportStats,
  SupportActivity,
  HelpSearchResult,
} from "@/types/support";

export interface ISupportService {
  /* ── FAQ ── */
  getFAQs(category?: FAQCategory): Promise<FAQItem[]>;
  getFeaturedFAQs(): Promise<FAQItem[]>;
  searchFAQs(query: string): Promise<FAQItem[]>;
  submitFAQFeedback(id: string, helpful: boolean): Promise<void>;

  /* ── Tickets ── */
  getTickets(filters?: TicketFilters): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket>;
  createTicket(data: TicketFormData): Promise<Ticket>;
  addTicketMessage(
    ticketId: string,
    message: string,
    attachments?: { name: string; type: string; size: number }[],
  ): Promise<TicketMessage>;
  updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void>;

  /* ── Contact ── */
  getSupportChannels(): Promise<SupportChannelInfo[]>;
  submitContactForm(data: ContactFormData): Promise<void>;

  /* ── Returns ── */
  getReturnPolicy(): Promise<ReturnPolicy>;
  checkReturnEligibility(orderId: string): Promise<ReturnEligibility>;
  submitReturnRequest(data: ReturnRequestFormData): Promise<ReturnRequest>;
  getReturnRequests(): Promise<ReturnRequest[]>;

  /* ── Refunds ── */
  getRefundPolicy(): Promise<RefundPolicy>;
  getRefundHistory(): Promise<RefundRecord[]>;

  /* ── Live Chat ── */
  getChatStatus(): Promise<ChatStatus>;
  startChatSession(): Promise<ChatSession>;
  sendChatMessage(
    sessionId: string,
    content: string,
  ): Promise<ChatMessage>;

  /* ── Dashboard ── */
  getSupportStats(): Promise<SupportStats>;
  getSupportActivity(): Promise<SupportActivity[]>;

  /* ── Help Search ── */
  searchHelp(query: string): Promise<HelpSearchResult[]>;
}
