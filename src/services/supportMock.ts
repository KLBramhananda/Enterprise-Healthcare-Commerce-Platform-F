/**
 * Mock Support Service
 *
 * In-memory mock implementation of ISupportService.
 * Pre-seeded with healthcare commerce support data.
 * To switch to ERPNext, replace with ErpNextSupportService.
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
  SupportStats,
  SupportActivity,
  HelpSearchResult,
  ChatMessage,
} from "@/types/support";
import { ServiceError } from "./authService";
import type { ISupportService } from "./supportService";

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/* ── Seeded FAQ Data ── */

const MOCK_FAQS: FAQItem[] = [
  { id: "faq-001", question: "How do I place an order?", answer: "To place an order, browse our catalog, add items to your cart, and proceed to checkout. You can upload a prescription for prescription medicines during checkout. Select your delivery address, choose a delivery option, and complete payment.", category: "ordering", tags: ["order", "checkout", "buy"], helpful: 245, notHelpful: 8, featured: true },
  { id: "faq-002", question: "Can I modify or cancel my order after placing it?", answer: "You can cancel an order before it enters the 'Processing' stage. Go to My Orders, select the order, and click 'Cancel Order'. Once the order is being prepared, modifications are not possible. For any assistance, contact our support team.", category: "ordering", tags: ["cancel", "modify", "order"], helpful: 189, notHelpful: 12, featured: true },
  { id: "faq-003", question: "What payment methods are accepted?", answer: "We accept UPI, credit/debit cards, net banking, popular wallets, and Cash on Delivery (COD) for eligible pin codes. All online payments are secured with 256-bit SSL encryption.", category: "payments", tags: ["payment", "upi", "card", "cod"], helpful: 312, notHelpful: 5, featured: true },
  { id: "faq-004", question: "How do I upload a prescription?", answer: "Prescription medicines require a valid prescription. During checkout, you'll be prompted to upload a photo or PDF of your prescription. You can also upload prescriptions from your account dashboard under 'Prescriptions'. Our pharmacist will verify the prescription before dispatching medicines.", category: "prescriptions", tags: ["prescription", "upload", "rx"], helpful: 278, notHelpful: 15, featured: true },
  { id: "faq-005", question: "How long does delivery take?", answer: "Standard delivery takes 2-5 business days depending on your location. Express delivery (where available) delivers within 24-48 hours. You can check estimated delivery time at checkout after entering your pin code.", category: "delivery", tags: ["delivery", "shipping", "time"], helpful: 402, notHelpful: 22, featured: true },
  { id: "faq-006", question: "How can I track my order?", answer: "Once your order is shipped, you'll receive a tracking link via SMS and email. You can also track your order from My Orders > Order Detail page, which shows real-time status updates.", category: "delivery", tags: ["track", "order", "status"], helpful: 356, notHelpful: 10, featured: false },
  { id: "faq-007", question: "What is your return policy?", answer: "We offer hassle-free returns within 14 days of delivery for most products. Certain items like medicines, perishable goods, and personal care products are not eligible for return. Visit our Returns & Refunds page for complete details.", category: "returns", tags: ["return", "refund", "policy"], helpful: 267, notHelpful: 18, featured: true },
  { id: "faq-008", question: "How do I initiate a return?", answer: "Go to My Orders, select the order containing the item you want to return, and click 'Return Request'. Select the item(s), choose a reason, and submit. Our team will review and schedule a pickup within 2-3 business days.", category: "returns", tags: ["return", "initiate", "process"], helpful: 198, notHelpful: 7, featured: false },
  { id: "faq-009", question: "How long does a refund take?", answer: "Refunds are processed within 5-7 business days after we receive the returned item. The amount is credited to your original payment method. For UPI and wallet payments, refunds may appear within 24-48 hours.", category: "payments", tags: ["refund", "time", "payment"], helpful: 334, notHelpful: 14, featured: false },
  { id: "faq-010", question: "How do I update my profile information?", answer: "Go to Account Settings from your profile dashboard. You can update your full name, phone number, and communication preferences. Email changes require verification.", category: "account", tags: ["profile", "account", "update"], helpful: 145, notHelpful: 3, featured: false },
  { id: "faq-011", question: "How do I add or manage addresses?", answer: "Navigate to My Addresses from your account dashboard. You can add new addresses, edit existing ones, set a default address, or delete unused addresses. We support up to 5 saved addresses.", category: "account", tags: ["address", "manage", "default"], helpful: 167, notHelpful: 5, featured: false },
  { id: "faq-012", question: "Are the medicines genuine?", answer: "Yes, all medicines are sourced directly from licensed manufacturers and authorized distributors. We are a licensed pharmacy and follow strict quality control protocols. Every medicine goes through verification before dispatch.", category: "healthcare", tags: ["genuine", "quality", "authentic"], helpful: 489, notHelpful: 6, featured: true },
  { id: "faq-013", question: "Can I consult a doctor through KeeMeds?", answer: "Yes, we offer doctor consultation services. You can book a consultation from our Services section. Consultations are available for general health, dermatology, and specific health concerns.", category: "healthcare", tags: ["doctor", "consultation", "telehealth"], helpful: 223, notHelpful: 11, featured: false },
  { id: "faq-014", question: "How do I use a coupon code?", answer: "At checkout, look for the 'Promo Code' field. Enter your coupon code and click Apply. The discount will be reflected in your order summary. Only one coupon can be applied per order.", category: "payments", tags: ["coupon", "promo", "discount"], helpful: 278, notHelpful: 9, featured: false },
  { id: "faq-015", question: "What should I do if I receive a damaged product?", answer: "If you receive a damaged or wrong product, please contact us within 48 hours of delivery. Go to My Orders, select the order, and raise a return request mentioning the issue. Attach photos if possible. We'll arrange an immediate replacement or refund.", category: "returns", tags: ["damaged", "wrong", "complaint"], helpful: 201, notHelpful: 4, featured: false },
  { id: "faq-016", question: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page. Enter your registered email address, and we'll send a one-time password (OTP). Verify the OTP and set a new password. Password must be at least 8 characters with uppercase and numbers.", category: "account", tags: ["password", "reset", "forgot"], helpful: 189, notHelpful: 7, featured: false },
  { id: "faq-017", question: "Is my personal data secure?", answer: "Yes, we take data security seriously. All personal and payment information is encrypted with 256-bit SSL. We never share your health data with third parties without your explicit consent. Read our Privacy Policy for complete details.", category: "technical", tags: ["security", "privacy", "data"], helpful: 156, notHelpful: 2, featured: false },
  { id: "faq-018", question: "How do I earn and redeem loyalty points?", answer: "You earn loyalty points on every purchase (1 point per ₹10 spent). Points are credited after order delivery. Redeem points at checkout — 100 points = ₹10 discount. Check your loyalty balance from the Account Dashboard.", category: "account", tags: ["loyalty", "points", "redeem"], helpful: 234, notHelpful: 8, featured: false },
  { id: "faq-019", question: "What are the lab test booking options?", answer: "We partner with accredited laboratories for home sample collection. Browse available tests in the Lab Tests category, select a test, choose a time slot, and our phlebotomist will visit your home for sample collection. Results are delivered digitally.", category: "healthcare", tags: ["lab", "test", "booking"], helpful: 178, notHelpful: 13, featured: false },
  { id: "faq-020", question: "How do I contact technical support?", answer: "For technical issues (app crashes, payment failures, login problems), call our tech support line at 1-800-123-4567 (24/7) or email tech@keemeds.com. You can also raise a ticket from the Help Center for tracked support.", category: "technical", tags: ["technical", "support", "contact"], helpful: 145, notHelpful: 6, featured: false },
  { id: "faq-021", question: "Can I schedule recurring medicine orders?", answer: "Yes, our subscription feature allows you to set up recurring orders for regular medicines. Choose the frequency (weekly, monthly, quarterly) and we'll automatically process and deliver your medicines on schedule.", category: "ordering", tags: ["subscription", "recurring", "auto-order"], helpful: 167, notHelpful: 11, featured: false },
  { id: "faq-022", question: "What is express delivery?", answer: "Express delivery ensures your order arrives within 24-48 hours. This service is available in select metro areas and major cities. A nominal express delivery fee applies. Check availability at checkout by entering your pin code.", category: "delivery", tags: ["express", "fast", "delivery"], helpful: 289, notHelpful: 14, featured: false },
  { id: "faq-023", question: "How do I earn referral credits?", answer: "Share your unique referral code with friends. When they sign up and complete their first order, both of you receive ₹100 credit. You can track your referrals and earnings from the Refer & Earn section in your account.", category: "account", tags: ["referral", "credit", "invite"], helpful: 198, notHelpful: 5, featured: false },
  { id: "faq-024", question: "What happens if my payment fails?", answer: "If a payment fails, no amount is deducted. If a deduction occurs, it is automatically reversed within 3-5 business days. You can retry the payment or choose a different payment method. Contact support if the issue persists.", category: "payments", tags: ["payment", "fail", "refund"], helpful: 267, notHelpful: 8, featured: false },
  { id: "faq-025", question: "How do I become a KeeMeds member?", answer: "KeeMeds Membership is automatically assigned based on your annual spending. Silver (₹5,000+), Gold (₹15,000+), Platinum (₹30,000+). Members enjoy exclusive discounts, free delivery, priority support, and early access to sales.", category: "account", tags: ["membership", "tier", "benefits"], helpful: 212, notHelpful: 10, featured: false },
];

/* ── Seeded Ticket Data ── */

const MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-1001", subject: "Order not received after 7 days", description: "I placed order ORD-1001 7 days ago but haven't received it yet. The tracking shows 'in transit' for 5 days.",
    status: "open", priority: "high", category: "delivery", orderId: "ORD-1001",
    messages: [
      { id: "msg-001", ticketId: "TKT-1001", sender: "customer", senderName: "Bramha", message: "I placed order ORD-1001 7 days ago but haven't received it yet. The tracking shows 'in transit' for 5 days.", attachments: [], createdAt: daysAgo(2) },
      { id: "msg-002", ticketId: "TKT-1001", sender: "support", senderName: "Priya (Support)", message: "Hello Bramha, I understand your concern. Let me check the shipment status with our logistics partner. I'll update you within 24 hours.", attachments: [], createdAt: daysAgo(2) },
    ],
    attachments: [], createdAt: daysAgo(2), updatedAt: daysAgo(2),
  },
  {
    id: "TKT-1002", subject: "Wrong medicine delivered", description: "I received a different medicine than what I ordered. The packing slip shows my order but the strip inside is different.",
    status: "in_progress", priority: "urgent", category: "order_issue", orderId: "ORD-0998",
    messages: [
      { id: "msg-003", ticketId: "TKT-1002", sender: "customer", senderName: "Bramha", message: "I received a different medicine than what I ordered. The packing slip shows my order but the strip inside is different.", attachments: [], createdAt: daysAgo(3) },
      { id: "msg-004", ticketId: "TKT-1002", sender: "support", senderName: "Rahul (Pharmacy)", message: "This is concerning. Please share a photo of the medicine strip and packing slip. We'll arrange an immediate replacement.", attachments: [], createdAt: daysAgo(3) },
      { id: "msg-005", ticketId: "TKT-1002", sender: "customer", senderName: "Bramha", message: "I've attached the photos as requested.", attachments: [{ id: "att-001", name: "medicine-photo.jpg", type: "image/jpeg", size: 245000, url: "#" }], createdAt: daysAgo(3) },
      { id: "msg-006", ticketId: "TKT-1002", sender: "support", senderName: "Rahul (Pharmacy)", message: "Thank you for the photos. We've confirmed the discrepancy. A replacement has been dispatched via express delivery and will arrive tomorrow. Please return the wrong item using the prepaid label attached.", attachments: [{ id: "att-002", name: "return-label.pdf", type: "application/pdf", size: 45000, url: "#" }], createdAt: daysAgo(2) },
    ],
    attachments: [], createdAt: daysAgo(3), updatedAt: daysAgo(2),
  },
  {
    id: "TKT-1003", subject: "Refund not received for returned items", description: "I returned items from order ORD-0995 two weeks ago. The return was picked up but I haven't received the refund yet.",
    status: "waiting_customer", priority: "medium", category: "payment", orderId: "ORD-0995",
    messages: [
      { id: "msg-007", ticketId: "TKT-1003", sender: "customer", senderName: "Bramha", message: "I returned items from order ORD-0995 two weeks ago. The return was picked up but I haven't received the refund yet.", attachments: [], createdAt: daysAgo(5) },
      { id: "msg-008", ticketId: "TKT-1003", sender: "support", senderName: "Anita (Finance)", message: "Hello Bramha, I've checked your return (RET-0095). The returned items were received at our warehouse on the expected date. Could you confirm which payment method you used for this order? This will help us trace the refund.", attachments: [], createdAt: daysAgo(4) },
    ],
    attachments: [], createdAt: daysAgo(5), updatedAt: daysAgo(4),
  },
  {
    id: "TKT-1004", subject: "Cannot upload prescription", description: "The prescription upload feature is not working. I keep getting a file format error even though I'm uploading a JPG file.",
    status: "resolved", priority: "medium", category: "technical",
    messages: [
      { id: "msg-009", ticketId: "TKT-1004", sender: "customer", senderName: "Bramha", message: "The prescription upload feature is not working. I keep getting a file format error even though I'm uploading a JPG file.", attachments: [], createdAt: daysAgo(7) },
      { id: "msg-010", ticketId: "TKT-1004", sender: "support", senderName: "Kiran (Tech)", message: "This was a known issue with file size validation. We've deployed a fix. Please clear your browser cache and try again. The upload should work now.", attachments: [], createdAt: daysAgo(6) },
      { id: "msg-011", ticketId: "TKT-1004", sender: "customer", senderName: "Bramha", message: "It's working now. Thank you!", attachments: [], createdAt: daysAgo(6) },
      { id: "msg-012", ticketId: "TKT-1004", sender: "system", senderName: "System", message: "Ticket marked as resolved.", attachments: [], createdAt: daysAgo(6) },
    ],
    attachments: [], createdAt: daysAgo(7), updatedAt: daysAgo(6), resolvedAt: daysAgo(6),
  },
  {
    id: "TKT-1005", subject: "Request for bulk order discount", description: "I need to order medicines for my elderly parents regularly. Do you offer any bulk order discounts or subscription plans?",
    status: "closed", priority: "low", category: "other",
    messages: [
      { id: "msg-013", ticketId: "TKT-1005", sender: "customer", senderName: "Bramha", message: "I need to order medicines for my elderly parents regularly. Do you offer any bulk order discounts or subscription plans?", attachments: [], createdAt: daysAgo(10) },
      { id: "msg-014", ticketId: "TKT-1005", sender: "support", senderName: "Priya (Support)", message: "Yes! We offer recurring subscription plans with up to 15% discount. You can set up weekly, monthly, or quarterly deliveries. Visit the Subscription section in your account or let me know the medicines and I'll set it up for you.", attachments: [], createdAt: daysAgo(10) },
      { id: "msg-015", ticketId: "TKT-1005", sender: "customer", senderName: "Bramha", message: "That's great, I'll check it out.", attachments: [], createdAt: daysAgo(9) },
      { id: "msg-016", ticketId: "TKT-1005", sender: "system", senderName: "System", message: "Ticket closed. Thank you for contacting KeeMeds support.", attachments: [], createdAt: daysAgo(9) },
    ],
    attachments: [], createdAt: daysAgo(10), updatedAt: daysAgo(9),
  },
];

/* ── Seeded Support Channels ── */

const MOCK_CHANNELS: SupportChannelInfo[] = [
  { id: "customer_care", name: "Customer Care", description: "General inquiries, order issues, account help, and feedback.", icon: "Headphones", phone: "1-800-123-4567", email: "support@keemeds.com", hours: "24/7", responseTime: "Immediate (phone), Within 2 hours (email)" },
  { id: "pharmacy", name: "Pharmacy Support", description: "Medicine queries, prescription verification, drug interactions, and pharmacist consultation.", icon: "Pill", phone: "1-800-123-4568", email: "pharmacy@keemeds.com", hours: "8 AM - 10 PM IST", responseTime: "Within 1 hour" },
  { id: "healthcare", name: "Healthcare Services", description: "Lab tests, doctor consultations, health devices, and wellness services.", icon: "Stethoscope", phone: "1-800-123-4569", email: "healthcare@keemeds.com", hours: "8 AM - 8 PM IST", responseTime: "Within 4 hours" },
  { id: "technical", name: "Technical Support", description: "App issues, website bugs, payment failures, and login problems.", icon: "Monitor", phone: "1-800-123-4570", email: "tech@keemeds.com", hours: "24/7", responseTime: "Within 30 minutes" },
  { id: "email", name: "Email Support", description: "Detailed inquiries that require documentation or written follow-up.", icon: "Mail", email: "help@keemeds.com", hours: "24/7 (response during business hours)", responseTime: "Within 12 hours" },
  { id: "phone", name: "Phone Support", description: "Direct phone support for urgent matters and complex issues.", icon: "Phone", phone: "1-800-123-4567", hours: "8 AM - 10 PM IST", responseTime: "Immediate" },
];

/* ── Seeded Policies ── */

const MOCK_RETURN_POLICY: ReturnPolicy = {
  title: "Return Policy",
  description: "We want you to be completely satisfied with your purchase. If you're not happy with a product, most items can be returned within 14 days of delivery.",
  eligibility: [
    "Products must be unused and in original packaging",
    "Return request must be initiated within 14 days of delivery",
    "Electronics and health devices must have all accessories",
    "Items must not be damaged by the customer",
  ],
  exclusions: [
    "Medicines and prescription drugs (unless wrong item delivered)",
    "Perishable goods and personal care products (opened)",
    "Products with tampered or missing seals",
    "Gift cards and digital vouchers",
    "Customized or personalized items",
  ],
  process: [
    "Go to My Orders and select the order",
    "Click 'Return Request' and select item(s) to return",
    "Choose a reason and add description",
    "Submit the request for review",
    "Our team approves and schedules a pickup (2-3 business days)",
    "Hand over the item to our pickup partner",
    "Refund is processed within 5-7 business days after pickup",
  ],
  timeframes: [
    { label: "Return window", value: "14 days from delivery" },
    { label: "Pickup scheduling", value: "2-3 business days" },
    { label: "Refund processing", value: "5-7 business days" },
    { label: "Wallet/UPI refund", value: "24-48 hours" },
  ],
};

const MOCK_REFUND_POLICY: RefundPolicy = {
  title: "Refund Policy",
  description: "Refunds are processed to the original payment method. Timeline depends on the payment method used.",
  methods: [
    { name: "Credit/Debit Card", timeframe: "5-7 business days" },
    { name: "Net Banking", timeframe: "5-7 business days" },
    { name: "UPI", timeframe: "24-48 hours" },
    { name: "Wallet", timeframe: "24-48 hours" },
    { name: "Cash on Delivery", timeframe: "Bank transfer: 5-7 business days" },
  ],
  timeframes: [
    { label: "Refund initiation", value: "After return pickup confirmation" },
    { label: "Wallet/UPI", value: "24-48 hours" },
    { label: "Card/Banking", value: "5-7 business days" },
    { label: "COD (bank transfer)", value: "5-7 business days" },
  ],
};

/* ── Seeded Returns & Refunds ── */

const MOCK_RETURN_REQUESTS: ReturnRequest[] = [
  { id: "RET-001", orderId: "ORD-0995", items: [{ productId: "prod-010", productName: "Vitamin D3 Supplements", reason: "Found a better alternative", quantity: 1 }], status: "refunded", createdAt: daysAgo(15), updatedAt: daysAgo(8) },
];

const MOCK_REFUND_RECORDS: RefundRecord[] = [
  { id: "REF-001", returnRequestId: "RET-001", orderId: "ORD-0995", amount: 349, method: "UPI", status: "completed", createdAt: daysAgo(8), completedAt: daysAgo(7) },
  { id: "REF-002", returnRequestId: "", orderId: "ORD-0990", amount: 1250, method: "Credit Card", status: "processing", createdAt: daysAgo(3) },
];

/* ── Seeded Stats & Activity ── */

const MOCK_STATS: SupportStats = { openTickets: 2, resolvedTickets: 1, pendingReturns: 0, pendingRefunds: 1 };

const MOCK_ACTIVITY: SupportActivity[] = [
  { id: "act-001", type: "ticket_created", description: "You raised a ticket: 'Order not received after 7 days'", timestamp: daysAgo(2), link: "/help/tickets/TKT-1001" },
  { id: "act-002", type: "ticket_updated", description: "Support responded to ticket TKT-1002", timestamp: daysAgo(2), link: "/help/tickets/TKT-1002" },
  { id: "act-003", type: "ticket_resolved", description: "Ticket 'Cannot upload prescription' has been resolved", timestamp: daysAgo(6), link: "/help/tickets/TKT-1004" },
  { id: "act-004", type: "refund_processed", description: "Refund of ₹349 credited to your UPI for order ORD-0995", timestamp: daysAgo(7) },
];

/* ── Mock Service Implementation ── */

export class MockSupportService implements ISupportService {
  private faqs: FAQItem[] = [...MOCK_FAQS];
  private tickets: Ticket[] = [...MOCK_TICKETS];
  private returnRequests: ReturnRequest[] = [...MOCK_RETURN_REQUESTS];

  async getFAQs(category?: FAQCategory): Promise<FAQItem[]> {
    await delay(150);
    let result = [...this.faqs];
    if (category) result = result.filter((f) => f.category === category);
    return result;
  }

  async getFeaturedFAQs(): Promise<FAQItem[]> {
    await delay(150);
    return this.faqs.filter((f) => f.featured).slice(0, 6);
  }

  async searchFAQs(query: string): Promise<FAQItem[]> {
    await delay(100);
    const q = query.toLowerCase();
    return this.faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.tags.some((t) => t.includes(q)),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async submitFAQFeedback(_id: string, _helpful: boolean): Promise<void> {
    await delay(100);
  }

  async getTickets(filters?: TicketFilters): Promise<Ticket[]> {
    await delay(200);
    let result = this.tickets.map((t) => ({ ...t, messages: [...t.messages] }));
    if (filters?.status && filters.status !== "all") result = result.filter((t) => t.status === filters.status);
    if (filters?.category && filters.category !== "all") result = result.filter((t) => t.category === filters.category);
    if (filters?.priority && filters.priority !== "all") result = result.filter((t) => t.priority === filters.priority);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((t) => t.subject.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getTicket(id: string): Promise<Ticket> {
    await delay(150);
    const ticket = this.tickets.find((t) => t.id === id);
    if (!ticket) throw new ServiceError("Ticket not found", "TICKET_NOT_FOUND", 404);
    return { ...ticket, messages: [...ticket.messages] };
  }

  async createTicket(data: TicketFormData): Promise<Ticket> {
    await delay(300);
    const id = `TKT-${1000 + this.tickets.length + 1}`;
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id, subject: data.subject, description: data.description,
      status: "open", priority: data.priority, category: data.category,
      orderId: data.orderId,
      messages: [{ id: generateId(), ticketId: id, sender: "customer", senderName: "Bramha", message: data.description, attachments: [], createdAt: now }],
      attachments: [], createdAt: now, updatedAt: now,
    };
    this.tickets.unshift(ticket);
    return ticket;
  }

  async addTicketMessage(ticketId: string, message: string, attachments?: { name: string; type: string; size: number }[]): Promise<TicketMessage> {
    await delay(200);
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new ServiceError("Ticket not found", "TICKET_NOT_FOUND", 404);
    const msg: TicketMessage = {
      id: generateId(), ticketId, sender: "customer", senderName: "Bramha", message,
      attachments: (attachments ?? []).map((a) => ({ ...a, id: generateId(), url: "#" })),
      createdAt: new Date().toISOString(),
    };
    ticket.messages.push(msg);
    ticket.updatedAt = msg.createdAt;
    return msg;
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
    await delay(150);
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new ServiceError("Ticket not found", "TICKET_NOT_FOUND", 404);
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    if (status === "resolved") ticket.resolvedAt = ticket.updatedAt;
  }

  async getSupportChannels(): Promise<SupportChannelInfo[]> {
    await delay(150);
    return [...MOCK_CHANNELS];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async submitContactForm(_data: ContactFormData): Promise<void> {
    await delay(400);
  }

  async getReturnPolicy(): Promise<ReturnPolicy> {
    await delay(150);
    return { ...MOCK_RETURN_POLICY, eligibility: [...MOCK_RETURN_POLICY.eligibility], exclusions: [...MOCK_RETURN_POLICY.exclusions], process: [...MOCK_RETURN_POLICY.process], timeframes: [...MOCK_RETURN_POLICY.timeframes] };
  }

  async checkReturnEligibility(orderId: string): Promise<ReturnEligibility> {
    await delay(200);
    if (orderId === "ORD-1001") {
      return { eligible: true, orderId, eligibleItems: [{ productId: "prod-001", productName: "Paracetamol 500mg" }, { productId: "prod-002", productName: "Vitamin C 1000mg" }] };
    }
    return { eligible: false, orderId, reason: "Order was delivered more than 14 days ago", eligibleItems: [], ineligibleItems: [{ productId: "prod-003", productName: "Ibuprofen 400mg", reason: "Return window expired" }] };
  }

  async submitReturnRequest(data: ReturnRequestFormData): Promise<ReturnRequest> {
    await delay(300);
    const req: ReturnRequest = {
      id: `RET-${String(this.returnRequests.length + 1).padStart(3, "0")}`,
      orderId: data.orderId,
      items: data.items.map((i) => ({ ...i, productName: "Product", reason: data.reason })),
      status: "initiated", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    this.returnRequests.unshift(req);
    return req;
  }

  async getReturnRequests(): Promise<ReturnRequest[]> {
    await delay(150);
    return [...this.returnRequests];
  }

  async getRefundPolicy(): Promise<RefundPolicy> {
    await delay(150);
    return { ...MOCK_REFUND_POLICY, methods: [...MOCK_REFUND_POLICY.methods], timeframes: [...MOCK_REFUND_POLICY.timeframes] };
  }

  async getRefundHistory(): Promise<RefundRecord[]> {
    await delay(150);
    return [...MOCK_REFUND_RECORDS];
  }

  async getChatStatus(): Promise<ChatStatus> {
    await delay(100);
    return "online";
  }

  async startChatSession(): Promise<ChatSession> {
    await delay(300);
    return {
      id: generateId(), status: "active", agentName: "KeeMeds Support",
      messages: [
        { id: generateId(), sender: "system", content: "Welcome to KeeMeds Live Chat! An agent will be with you shortly.", timestamp: new Date().toISOString() },
        { id: generateId(), sender: "agent", senderName: "KeeMeds Support", content: "Hello! How can I help you today?", timestamp: new Date().toISOString() },
      ],
      startedAt: new Date().toISOString(),
    };
  }

  async sendChatMessage(_sessionId: string, content: string): Promise<ChatMessage> {
    await delay(200);
    return { id: generateId(), sender: "user", content, timestamp: new Date().toISOString() };
  }

  async getSupportStats(): Promise<SupportStats> {
    await delay(150);
    return { ...MOCK_STATS };
  }

  async getSupportActivity(): Promise<SupportActivity[]> {
    await delay(150);
    return [...MOCK_ACTIVITY];
  }

  async searchHelp(query: string): Promise<HelpSearchResult[]> {
    await delay(200);
    const q = query.toLowerCase();
    const results: HelpSearchResult[] = [];
    for (const faq of this.faqs) {
      if (faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)) {
        results.push({ id: faq.id, type: "faq", title: faq.question, description: faq.answer.slice(0, 120) + "...", url: `/help/faq?q=${encodeURIComponent(faq.question)}`, category: faq.category });
      }
    }
    const policies: { title: string; url: string; desc: string }[] = [
      { title: "Return Policy", url: "/help/returns", desc: "Learn about our hassle-free return process, eligibility, and timeframes." },
      { title: "Refund Policy", url: "/help/returns", desc: "Understand refund timelines for different payment methods." },
      { title: "Contact Us", url: "/help/contact", desc: "Reach our support team via phone, email, or live chat." },
    ];
    for (const p of policies) {
      if (p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
        results.push({ id: p.url, type: "policy", title: p.title, description: p.desc, url: p.url });
      }
    }
    return results.slice(0, 10);
  }
}
