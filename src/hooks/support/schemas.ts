import { z } from "zod";

export const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.enum([
    "order_issue",
    "delivery",
    "payment",
    "prescription",
    "product",
    "account",
    "technical",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  orderId: z.string().optional(),
});

export type TicketFormData = z.infer<typeof ticketSchema>;

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  category: z.string().min(1, "Please select a category"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const returnRequestSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().min(1, "Please select a reason"),
  description: z.string().optional(),
});

export type ReturnRequestFormData = z.infer<typeof returnRequestSchema>;
