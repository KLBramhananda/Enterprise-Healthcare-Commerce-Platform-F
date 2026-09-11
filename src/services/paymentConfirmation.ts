/**
 * ERPNext Payment Confirmation Service (LIVE_API mode)
 *
 * Client for the live KeeMeds Commerce payment-confirmation endpoints
 * (keemeds_commerce.api.payment). This is the frontend half of "the existing
 * payment APIs": it drives the backend from gateway-success to an ERP-confirmed
 * Paid order.
 *
 *   - create_payment   → create (or replay) a gateway-ready session for the
 *                        Draft Sales Order (returns the signature + amount the
 *                        backend expects back on verify).
 *   - verify_payment   → validate ownership/amount/signature and complete the
 *                        payment (submits the Sales Order + creates/submits a
 *                        Payment Entry, marks payment_status = Paid).
 *   - fail_payment     → best-effort failure record (keeps the SO Draft).
 *   - status           → reconcile the authoritative paid/failed state when
 *                        create/verify collide with a concurrent callback.
 *
 * The service only ever reflects ERPNext truth: it never assumes a locally
 * "succeeded" gateway is sufficient. A payment is Paid only when the backend
 * confirms it.
 */

import { apiClient, getErrorMessage } from "@/api/client";
import { ApiError, fromAxiosError } from "@/api/errors";
import { API_ROUTES } from "@/config/api";
import { ServiceError } from "./authService";
import type {
  ErpPaymentCompletionDTO,
  ErpPaymentMessage,
  ErpPaymentSessionDTO,
  ErpPaymentStatusDTO,
} from "@/types/erpnextPayment";

/** Timeout override preventing payment confirmation from hanging. */
const PAYMENT_CONFIRM_TIMEOUT = 30_000;

export interface IPaymentConfirmationService {
  /** Create (or replay) a gateway-ready payment session for a Draft Sales Order. */
  createPaymentSession(input: {
    salesOrder: string;
    shippingAddressName?: string;
    billingAddressName?: string;
  }): Promise<ErpPaymentSessionDTO>;
  /** Verify the gateway response and complete the payment (ERP becomes Paid). */
  verifyPayment(input: {
    salesOrder?: string;
    session?: string;
    amount: number;
    signature: string;
    method?: string;
  }): Promise<ErpPaymentCompletionDTO>;
  /** Record a failure so the Draft Sales Order stays retryable. */
  reportFailure(input: {
    salesOrder?: string;
    session?: string;
    reason?: string;
  }): Promise<ErpPaymentStatusDTO>;
  /** Reconcile the authoritative payment status (Paid / Failed / Pending / …). */
  getPaymentStatus(input: {
    salesOrder?: string;
    session?: string;
  }): Promise<ErpPaymentStatusDTO>;
}

/** Normalize request failures into ServiceError instances. */
function normalizeError(error: unknown, fallback: string): never {
  if (error instanceof ServiceError) throw error;
  const apiErr = error instanceof ApiError ? error : fromAxiosError(error);
  const status = apiErr.status;

  if (status === 401 || status === 403) {
    throw new ServiceError(
      "Your session has expired. Please sign in again.",
      "SESSION_EXPIRED",
      status,
    );
  }
  // Frappe surfaces validation failures (already paid, invalid signature,
  // amount mismatch, foreign order, …) as 417/422/404.
  if (status === 417 || status === 422 || status === 404 || apiErr.category === "validationError") {
    throw new ServiceError(apiErr.message || fallback, "VALIDATION_ERROR", status);
  }
  throw new ServiceError(apiErr.message || fallback, "PAYMENT_ERROR", status);
}

/** Read + unpack the success_response envelope into the data payload. */
async function unpackPayment<T>(
  promise: Promise<{ data: { message: ErpPaymentMessage<T> | undefined } }>,
): Promise<T> {
  const response = await promise;
  const message = response.data?.message;
  if (!message || message.success === false) {
    throw new ApiError({ message: "Invalid response from payment API", category: "unknown" });
  }
  return message.data;
}

export class ErpNextPaymentConfirmationService implements IPaymentConfirmationService {
  readonly name = "ErpNextPaymentConfirmationService";

  async createPaymentSession(input: {
    salesOrder: string;
    shippingAddressName?: string;
    billingAddressName?: string;
  }): Promise<ErpPaymentSessionDTO> {
    try {
      return await unpackPayment<ErpPaymentSessionDTO>(
        apiClient.post<{ message: ErpPaymentMessage<ErpPaymentSessionDTO> }>(
          API_ROUTES.PAYMENT.CREATE,
          {
            sales_order: input.salesOrder,
            shipping_address_name: input.shippingAddressName,
            billing_address_name: input.billingAddressName,
          },
          { timeout: PAYMENT_CONFIRM_TIMEOUT },
        ),
      );
    } catch (error) {
      throw normalizeError(error, "We couldn't start your payment confirmation. Please try again.");
    }
  }

  async verifyPayment(input: {
    salesOrder?: string;
    session?: string;
    amount: number;
    signature: string;
    method?: string;
  }): Promise<ErpPaymentCompletionDTO> {
    try {
      return await unpackPayment<ErpPaymentCompletionDTO>(
        apiClient.post<{ message: ErpPaymentMessage<ErpPaymentCompletionDTO> }>(
          API_ROUTES.PAYMENT.VERIFY,
          {
            sales_order: input.salesOrder,
            session: input.session,
            amount: input.amount,
            signature: input.signature,
            method: input.method,
          },
          { timeout: PAYMENT_CONFIRM_TIMEOUT },
        ),
      );
    } catch (error) {
      throw normalizeError(error, "We couldn't confirm your payment. Please try again.");
    }
  }

  async reportFailure(input: {
    salesOrder?: string;
    session?: string;
    reason?: string;
  }): Promise<ErpPaymentStatusDTO> {
    try {
      return await unpackPayment<ErpPaymentStatusDTO>(
        apiClient.post<{ message: ErpPaymentMessage<ErpPaymentStatusDTO> }>(
          API_ROUTES.PAYMENT.FAIL,
          {
            sales_order: input.salesOrder,
            session: input.session,
            reason: input.reason,
          },
          { timeout: PAYMENT_CONFIRM_TIMEOUT },
        ),
      );
    } catch (error) {
      throw normalizeError(error, "We couldn't record the payment failure. Please try again.");
    }
  }

  async getPaymentStatus(input: {
    salesOrder?: string;
    session?: string;
  }): Promise<ErpPaymentStatusDTO> {
    const param = input.salesOrder
      ? API_ROUTES.PAYMENT.STATUS(input.salesOrder)
      : input.session
        ? API_ROUTES.PAYMENT.STATUS_BY_SESSION(input.session)
        : API_ROUTES.PAYMENT.STATUS("");
    try {
      return await unpackPayment<ErpPaymentStatusDTO>(
        apiClient.get<{ message: ErpPaymentMessage<ErpPaymentStatusDTO> }>(
          param,
          { timeout: PAYMENT_CONFIRM_TIMEOUT },
        ),
      );
    } catch (error) {
      throw normalizeError(error, "We couldn't fetch the payment status. Please try again.");
    }
  }
}

/** Human-friendly message for a finalize/confirmation failure. */
export function paymentConfirmationMessage(error: unknown, fallback: string): string {
  return getErrorMessage(error, fallback);
}