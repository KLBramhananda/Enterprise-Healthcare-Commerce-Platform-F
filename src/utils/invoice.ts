/**
 * Invoice utilities
 *
 * Builds a printable HTML invoice from the Invoice document and triggers a
 * browser download. Purely frontend — a real ERPNext integration would
 * stream the PDF from the server instead.
 */

import type { Invoice, Order } from "@/types/checkout";
import { formatCurrency } from "./formatters";

function escapeHtml(value: string | number | undefined | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Derive the printable invoice document straight from a persisted Order. The
 * order already carries the ERP-backed totals, items, addresses and payment
 * info, so the invoice is deterministic and independent of any mock history or
 * in-memory service cache (it stays available after a browser refresh).
 */
export function buildInvoiceFromOrder(order: Order): Invoice {
  const taxRate =
    order.subtotal - order.discount > 0
      ? Math.round((order.tax / (order.subtotal - order.discount)) * 100)
      : 0;

  return {
    id: order.invoiceId || `INV-${order.id}`,
    orderId: order.id,
    issuedAt: order.payment?.paidAt ?? order.placedAt,
    seller: {
      name: "KeeMeds Commerce Pvt. Ltd.",
      address: "24 Wellness Avenue, Sector 62, Bengaluru, Karnataka 560102, India",
      gstin: "29ABSCK1234F1Z2",
      contact: "support@keemeds.in",
    },
    billingAddress: order.address,
    shippingAddress: order.address,
    customer: {
      name: order.address.fullName,
      phone: order.address.phone,
    },
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
      amount: Math.round(item.product.price * item.quantity * 100) / 100,
    })),
    subtotal: order.subtotal,
    discount: order.discount,
    promoCode: order.appliedPromo?.code,
    deliveryCharge: order.deliveryCharge,
    tax: order.tax,
    taxRate,
    platformFee: Number(order.platformFee ?? 0),
    grandTotal: order.grandTotal,
    paymentMethod: order.payment?.method ?? order.paymentMethod,
    transactionId: order.payment?.transactionId,
    paymentReference: order.payment?.transactionId,
    paymentStatus:
      order.payment?.status === "paid"
        ? "Paid"
        : order.payment?.status === "pending"
          ? "Pending"
          : String(order.status),
    orderDate: order.placedAt,
  };
}

/**
 * Overlay authoritative order-level fields onto an ERP invoice so the printed
 * document always carries the real shipping address, payment status, order
 * date, customer and payment reference even when the backend invoice payload
 * omits them. Always defers to order data for fields the ERP may leave null.
 */
export function enrichInvoiceFromOrder(invoice: Invoice, order: Order): Invoice {
  const customer =
    invoice.customer ??
    (order.address
      ? {
          name: order.address.fullName,
          phone: order.address.phone,
        }
      : undefined);
  const paymentStatus =
    order.payment?.status === "paid"
      ? "Paid"
      : order.payment?.status === "pending"
        ? "Pending"
        : invoice.paymentStatus ?? String(order.status);

  return {
    ...invoice,
    orderId: order.id,
    invoiceNumber: invoice.invoiceNumber ?? order.invoiceId ?? `INV-${order.id}`,
    issuedAt: invoice.issuedAt || order.payment?.paidAt || order.placedAt,
    orderDate: invoice.orderDate ?? order.placedAt,
    // Always use order payment data — the ERP invoice endpoint may return null
    // for payment method/transaction ID, defaulting them to "cod".
    paymentMethod: order.payment?.method ?? invoice.paymentMethod ?? order.paymentMethod,
    transactionId: order.payment?.transactionId ?? invoice.transactionId,
    paymentReference: order.payment?.transactionId ?? invoice.paymentReference,
    paymentStatus,
    // Carry the applied coupon code onto the printed document even when the ERP
    // invoice payload has no promo field (defer to the authoritative order).
    promoCode: order.appliedPromo?.code ?? invoice.promoCode,
    shippingAddress: invoice.shippingAddress ?? order.address,
    billingAddress: invoice.billingAddress ?? order.address,
    customer,
  };
}

export function buildInvoiceHtml(invoice: Invoice): string {
  const rows = invoice.items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td class="num">${item.quantity}</td>
          <td class="num">${escapeHtml(formatCurrency(item.unitPrice))}</td>
          <td class="num">${escapeHtml(formatCurrency(item.amount))}</td>
        </tr>`,
    )
    .join("");

  const discountLabel = invoice.promoCode
    ? `Offer (${escapeHtml(invoice.promoCode)})`
    : "Discount";
  const discountRow = invoice.discount > 0
    ? `<tr><td class="muted">${discountLabel}</td><td class="num">-${escapeHtml(formatCurrency(invoice.discount))}</td></tr>`
    : "";
  const platformFeeRow = invoice.platformFee > 0
    ? `<tr><td>Platform Fee</td><td class="num">${escapeHtml(formatCurrency(invoice.platformFee))}</td></tr>`
    : "";

  const fmtDate = (value?: string): string =>
    value ? new Date(value).toLocaleDateString() : "—";

  const customerRow = invoice.customer?.email
    ? `<div class="muted">${escapeHtml(invoice.customer.name)} · ${escapeHtml(invoice.customer.email)}</div>`
    : "";

  const shipToSection = invoice.shippingAddress
    ? `
      <div>
        <h3>Ship To</h3>
        ${escapeHtml(invoice.shippingAddress.fullName)}<br/>
        ${escapeHtml(invoice.shippingAddress.line1)}<br/>
        ${escapeHtml(invoice.shippingAddress.city)}, ${escapeHtml(invoice.shippingAddress.state)} - ${escapeHtml(invoice.shippingAddress.pincode)}<br/>
        ${escapeHtml(invoice.shippingAddress.phone)}
      </div>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(invoice.id)}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; margin: 0; padding: 32px; }
  .invoice { max-width: 760px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0a6c66; padding-bottom: 20px; }
  h1 { color: #0a6c66; font-size: 22px; margin: 0; }
  .brand { font-size: 14px; color: #6b7280; margin-top: 2px; }
  .meta { text-align: right; font-size: 13px; color: #374151; }
  .meta div { margin-bottom: 2px; }
  .sections { display: flex; justify-content: space-between; gap: 16px; margin: 20px 0; font-size: 13px; }
  .sections h3 { font-size: 12px; text-transform: uppercase; color: #6b7280; margin: 0 0 6px; letter-spacing: .05em; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 8px 6px; color: #374151; }
  td { padding: 8px 6px; border-bottom: 1px solid #f3f4f6; }
  td.num, th.num { text-align: right; }
  .totals { margin-top: 16px; margin-left: auto; width: 260px; }
  .totals tr td:first-child { color: #6b7280; }
  .totals tr:last-child td { font-weight: 700; border-top: 2px solid #0a6c66; color: #0a6c66; }
  .muted { color: #6b7280; }
  footer { margin-top: 28px; font-size: 11px; color: #9ca3af; text-align: center; }
  @media print { body { padding: 0; } .invoice { border: none; } }
</style>
</head>
<body>
  <div class="invoice">
    <header>
      <div>
        <h1>${escapeHtml(invoice.seller.name)}</h1>
        <div class="brand">${escapeHtml(invoice.seller.address)}</div>
        <div class="brand">GSTIN: ${escapeHtml(invoice.seller.gstin ?? "—")}</div>
      </div>
      <div class="meta">
        <div><strong>Invoice #${escapeHtml(invoice.invoiceNumber ?? invoice.id)}</strong></div>
        <div>Order #${escapeHtml(invoice.orderId)}</div>
        <div>Order date: ${escapeHtml(fmtDate(invoice.orderDate))}</div>
        <div>Issued: ${escapeHtml(fmtDate(invoice.issuedAt))}</div>
      </div>
    </header>

    <div class="sections">
      <div>
        <h3>Bill To</h3>
        ${escapeHtml(invoice.billingAddress.fullName)}<br/>
        ${escapeHtml(invoice.billingAddress.line1)}<br/>
        ${escapeHtml(invoice.billingAddress.city)}, ${escapeHtml(invoice.billingAddress.state)} - ${escapeHtml(invoice.billingAddress.pincode)}<br/>
        ${escapeHtml(invoice.billingAddress.phone)}
        ${customerRow}
      </div>
      ${shipToSection}
      <div>
        <h3>Payment</h3>
        Method: ${escapeHtml(invoice.paymentMethod)}<br/>
        Status: ${escapeHtml(invoice.paymentStatus ?? "—")}<br/>
        ${invoice.transactionId
          ? `Transaction ID: ${escapeHtml(invoice.transactionId)}<br/>`
          : ""}
        ${invoice.paymentReference && invoice.paymentReference !== invoice.transactionId
          ? `Payment Ref: ${escapeHtml(invoice.paymentReference)}`
          : ""}
      </div>
    </div>

    <table>
      <thead>
        <tr><th>Item</th><th class="num">Qty</th><th class="num">Unit Price</th><th class="num">Amount</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <table class="totals">
      <tr><td>Subtotal</td><td class="num">${escapeHtml(formatCurrency(invoice.subtotal))}</td></tr>
      <tr><td>Delivery</td><td class="num">${escapeHtml(formatCurrency(invoice.deliveryCharge))}</td></tr>
      ${discountRow}
      <tr><td>Tax (${invoice.taxRate}%)</td><td class="num">${escapeHtml(formatCurrency(invoice.tax))}</td></tr>
      ${platformFeeRow}
      <tr><td>Grand Total</td><td class="num">${escapeHtml(formatCurrency(invoice.grandTotal))}</td></tr>
    </table>

    <footer>This is a computer-generated invoice. Verify all details before use.</footer>
  </div>
</body>
</html>`;
}

export function downloadInvoiceAsHtml(invoice: Invoice): void {
  const html = buildInvoiceHtml(invoice);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `invoice-${invoice.orderId}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}