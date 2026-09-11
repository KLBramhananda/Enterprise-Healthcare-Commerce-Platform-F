/**
 * InvoiceDownloadButton
 *
 * Triggers a printable HTML invoice download. The invoice is resolved through
 * the ERP order service (keemeds_commerce.api.orders.invoice) with a persisted
 * checkout-store fallback, so the button works on both the confirmation screen
 * and the ERP-backed order detail page. Disabled until the invoice is ready.
 */

import { Download } from "lucide-react";
import { Button } from "@/components/ui";
import { useOrderInvoice } from "@/hooks/orders";

export interface InvoiceDownloadButtonProps {
  orderId: string;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  label?: string;
  className?: string;
}

export default function InvoiceDownloadButton({
  orderId,
  variant = "secondary",
  size,
  fullWidth,
  label = "Download Invoice",
  className,
}: InvoiceDownloadButtonProps) {
  const { data: invoice, isLoading, download } = useOrderInvoice(orderId);

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      onClick={download}
      disabled={!invoice}
      loading={isLoading}
    >
      <Download size={16} className="mr-2" />
      {label}
    </Button>
  );
}
