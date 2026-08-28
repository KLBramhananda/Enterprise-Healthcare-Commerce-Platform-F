/**
 * Invoice utilities (mock)
 *
 * Builds a printable HTML invoice from the Invoice document and triggers a
 * browser download. Purely frontend — a real ERPNext integration would
 * stream the PDF from the server instead.
 */

import type { Invoice } from "@/types/checkout";
import { formatCurrency } from "./formatters";

function escapeHtml(value: string | number | undefined | null): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  const discountRow = invoice.discount > 0
    ? `<tr><td class="muted">Discount</td><td class="num">-${escapeHtml(formatCurrency(invoice.discount))}</td></tr>`
    : "<tr><td class=\"muted\">Discount</td><td class=\"num\">-</td></tr>";

  const txRow = invoice.transactionId
    ? `<tr><td class="muted">Transaction ID</td><td class="num">${escapeHtml(invoice.transactionId)}</td></tr>`
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
        <div><strong>Invoice #${escapeHtml(invoice.id)}</strong></div>
        <div>Order #${escapeHtml(invoice.orderId)}</div>
        <div>Issued: ${escapeHtml(new Date(invoice.issuedAt).toLocaleString())}</div>
      </div>
    </header>

    <div class="sections">
      <div>
        <h3>Bill To</h3>
        ${escapeHtml(invoice.billingAddress.fullName)}<br/>
        ${escapeHtml(invoice.billingAddress.line1)}<br/>
        ${escapeHtml(invoice.billingAddress.city)}, ${escapeHtml(invoice.billingAddress.state)} - ${escapeHtml(invoice.billingAddress.pincode)}<br/>
        ${escapeHtml(invoice.billingAddress.phone)}
      </div>
      <div>
        <h3>Payment</h3>
        Method: ${escapeHtml(invoice.paymentMethod)}<br/>
        ${txRow}
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
      ${discountRow}
      <tr><td>Delivery</td><td class="num">${escapeHtml(formatCurrency(invoice.deliveryCharge))}</td></tr>
      <tr><td>Tax (${invoice.taxRate}%)</td><td class="num">${escapeHtml(formatCurrency(invoice.tax))}</td></tr>
      <tr><td>Grand Total</td><td class="num">${escapeHtml(formatCurrency(invoice.grandTotal))}</td></tr>
    </table>

    <footer>This is a computer-generated mock invoice for demonstration purposes. Verify all details before use.</footer>
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