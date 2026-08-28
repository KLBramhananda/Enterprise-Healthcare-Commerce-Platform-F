/**
 * InvoiceDownloadButton
 *
 * Fetches the mock invoice for an order and triggers a printable HTML
 * download. Disabled until the invoice document is ready.
 */

import { Download } from "lucide-react";
import { Button } from "@/components/ui";
import { useInvoice } from "@/hooks/checkout/useInvoice";

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
  const { data: invoice, isLoading, download } = useInvoice(orderId);

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
