/**
 * useInvoice
 *
 * Fetches the (mock) invoice document for an order and exposes a download
 * action that writes a printable HTML file to the user's machine.
 */

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { services } from "@/services/factory";
import { downloadInvoiceAsHtml } from "@/utils/invoice";

const checkoutService = services.checkout;

export function useInvoice(orderId?: string) {
  const query = useQuery({
    queryKey: ["invoice", orderId],
    queryFn: () => checkoutService.getInvoice(orderId as string),
    enabled: Boolean(orderId),
  });

  const download = useCallback(() => {
    if (query.data) downloadInvoiceAsHtml(query.data);
  }, [query.data]);

  return { ...query, download };
}