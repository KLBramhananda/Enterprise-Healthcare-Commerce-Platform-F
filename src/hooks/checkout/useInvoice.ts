/**
 * useInvoice
 *
 * Builds the printable invoice for an order directly from the persisted order
 * record (checkout store). The storefront has no backoffice invoice endpoint,
 * so instead of relying on the mock service history or a session-only memory
 * cache the invoice is derived deterministically from the authoritative order
 * data — it survives browser refreshes and behaves identically in LIVE_API and
 * STATIC modes.
 */

import { useCallback } from "react";
import { useCheckoutStore } from "@/store/checkoutStore";
import { buildInvoiceFromOrder, downloadInvoiceAsHtml } from "@/utils/invoice";

export function useInvoice(orderId?: string) {
  const order = useCheckoutStore((s) =>
    orderId ? s.orders.find((o) => o.id === orderId) ?? null : null,
  );
  const invoice = order ? buildInvoiceFromOrder(order) : null;

  const download = useCallback(() => {
    if (invoice) downloadInvoiceAsHtml(invoice);
  }, [invoice]);

  return { data: invoice, isLoading: false, isError: false, download };
}