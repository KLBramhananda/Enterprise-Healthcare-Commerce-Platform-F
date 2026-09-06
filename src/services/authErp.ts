/**
 * Live Auth Service (ERPNext)
 *
 * Session-based authentication implementation backed by the KeeMeds Commerce
 * ERPNext auth endpoints (Phase 12):
 *   - POST /api/method/keemeds_commerce.api.auth.register
 *   - POST /api/method/keemeds_commerce.api.auth.login
 *   - GET  /api/method/keemeds_commerce.api.auth.me
 *   - POST /api/method/keemeds_commerce.api.auth.logout
 *
 * Authentication uses ONLY the standard ERPNext session cookie (`sid`) set by
 * the backend on login. No JWT and no localStorage tokens are used.
 *
 * Error handling:
 *   - Validation errors (e.g. missing/invalid fields) → VALIDATION_ERROR
 *   - Authentication errors (bad credentials)        → INVALID_CREDENTIALS
 *   - Session/authorization errors                   → SESSION_EXPIRED / 401/403
 *   - Network / transport errors                     → NETWORK_ERROR
 *
 * The mock implementation (MockAuthService) remains unchanged and is selected
 * through the existing VITE_DATA_SOURCE config switch in the factory.
 */

import { apiClient } from "@/api/client";
import { ApiError, fromAxiosError } from "@/api/errors";
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOTPPayload,
  ResetPasswordPayload,
  AuthResponse,
  User,
} from "@/types/auth";
import type {
  ErpAuthErrorResponse,
  ErpAuthMessage,
  ErpAuthUser,
  ErpLoginResponse,
  ErpLogoutResponse,
  ErpRegisterPayload,
} from "@/types/erpnextAuth";
import type { IAuthService } from "./authService";
import { ServiceError } from "./authService";

/** KeeMeds Commerce auth endpoint routes. */
const ERP_AUTH_ROUTES = {
  REGISTER: "keemeds_commerce.api.auth.register",
  LOGIN: "keemeds_commerce.api.auth.login",
  ME: "keemeds_commerce.api.auth.me",
  LOGOUT: "keemeds_commerce.api.auth.logout",
} as const;

/** Default created-at value (the auth endpoints do not return a timestamp). */
const DEFAULT_CREATED_AT = "";

/**
 * Map an ERPNext auth profile (register / me response) to the frontend User.
 * The `id` uses the email (the stable identity of the session user).
 */
function toUser(dto: ErpAuthUser): User {
  return {
    id: dto.email,
    email: dto.email,
    fullName: dto.full_name ?? "",
    phone: dto.mobile_no ?? "",
    isVerified: true,
    createdAt: DEFAULT_CREATED_AT,
  };
}

/** Build the session-marker tokens used by the auth store. */
function sessionTokens() {
  return { accessToken: "session" as const, refreshToken: undefined };
}

/**
 * Extract a human-readable message + error code + status from an unknown
 * auth failure. Prefers backend validation/authentication messages and maps
 * transport errors to NETWORK_ERROR.
 */
function toServiceError(error: unknown, fallback: string): ServiceError {
  // Already a ServiceError (rethrow as-is).
  if (error instanceof ServiceError) return error;

  // Normalize Axios/HTTP errors first.
  const apiErr = error instanceof ApiError ? error : fromAxiosError(error);

  // Network/cancelled transport failures.
  if (
    apiErr.category === "offline" ||
    apiErr.category === "timeout" ||
    apiErr.category === "cancelled"
  ) {
    return new ServiceError(
      "We couldn't reach the server. Please check your connection and try again.",
      "NETWORK_ERROR",
      apiErr.status,
    );
  }

  // Backend response body (Frappe validation / auth messages).
  const backend = extractBackendMessage(error);
  const status = apiErr.status;

  // Authentication / authorization failures (bad credentials, expired session).
  if (status === 401 || status === 403) {
    const isAuth = status === 401;
    return new ServiceError(
      backend ?? (isAuth
        ? "Invalid email or password. Please try again."
        : "Your session has expired. Please sign in again."),
      isAuth ? "INVALID_CREDENTIALS" : "SESSION_EXPIRED",
      status,
    );
  }

  // Validation errors (Frappe returns 417 for field validation, 422 otherwise).
  if (
    status === 417 ||
    status === 422 ||
    apiErr.category === "validationError"
  ) {
    return new ServiceError(backend ?? fallback, "VALIDATION_ERROR", status);
  }

  // Duplicate / conflict (email already registered).
  if (status === 409) {
    return new ServiceError(
      backend ?? "An account with this email already exists.",
      "EMAIL_EXISTS",
      status,
    );
  }

  return new ServiceError(backend ?? fallback, "AUTH_ERROR", status);
}

/** Pull a readable message out of a Frappe error response body. */
function extractBackendMessage(error: unknown): string | null {
  const body = (error as { response?: { data?: ErpAuthErrorResponse } })?.response?.data;
  if (!body) return null;
  if (typeof body.message === "string" && body.message) return body.message;
  if (Array.isArray(body._server_messages) && body._server_messages.length > 0) {
    const raw = body._server_messages[0];
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.message) return String(parsed.message);
      } catch {
        return raw;
      }
    }
  }
  // Frappe surfaces the real validation/auth message inside `exception`
  // (e.g. "frappe.exceptions.ValidationError: An account with phone '...' already exists.").
  if (typeof body.exception === "string" && body.exception) {
    const idx = body.exception.indexOf(": ");
    if (idx !== -1) {
      return body.exception.slice(idx + 2).trim();
    }
  }
  return null;
}

export class ErpNextAuthService implements IAuthService {
  readonly name = "ErpNextAuthService";

  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ErpLoginResponse>(
        ERP_AUTH_ROUTES.LOGIN,
        { email: payload.email, password: payload.password },
      );

      const message = response.data?.message as ErpAuthMessage<null> | undefined;
      if (message?.success) {
        // Fetch the full profile via /me (standard after a session login).
        // Fall back to a minimal user from the login response if that call
        // fails, so a successful login is never reported as a failure.
        let user: User;
        try {
          user = await this.getCurrentUser();
        } catch {
          user = {
            id: payload.email,
            email: payload.email,
            fullName: response.data?.full_name ?? "",
            phone: "",
            isVerified: true,
            createdAt: "",
          };
        }
        return { user, tokens: sessionTokens() };
      }

      throw new ServiceError(
        message?.message ?? "Login failed. Please try again.",
        "INVALID_CREDENTIALS",
        response.status,
      );
    } catch (error: unknown) {
      throw toServiceError(error, "Login failed. Please try again.");
    }
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const registerPayload: ErpRegisterPayload = {
        email: payload.email,
        full_name: payload.fullName,
        mobile_no: payload.phone,
        password: payload.password,
      };

      const response = await apiClient.post<{
        message: ErpAuthMessage<ErpAuthUser>;
      }>(ERP_AUTH_ROUTES.REGISTER, registerPayload);

      const message = response.data?.message as ErpAuthMessage<ErpAuthUser> | undefined;
      if (message?.success && message.data) {
        // Registration succeeds without establishing a session; the UI routes
        // the user to the login flow after a successful register.
        return { user: toUser(message.data), tokens: sessionTokens() };
      }

      throw new ServiceError(
        message?.message ?? "Registration failed. Please try again.",
        "VALIDATION_ERROR",
        response.status,
      );
    } catch (error: unknown) {
      throw toServiceError(error, "Registration failed. Please try again.");
    }
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    void payload;
    const svcErr = new Error(
      "Password reset is managed by the ERPNext portal.",
    ) as ServiceError;
    svcErr.code = "NOT_IMPLEMENTED";
    throw svcErr;
  }

  async verifyOTP(payload: VerifyOTPPayload): Promise<{ message: string; token: string }> {
    void payload;
    const svcErr = new Error(
      "OTP verification is managed by the ERPNext portal.",
    ) as ServiceError;
    svcErr.code = "NOT_IMPLEMENTED";
    throw svcErr;
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    void payload;
    const svcErr = new Error(
      "Password reset is managed by the ERPNext portal.",
    ) as ServiceError;
    svcErr.code = "NOT_IMPLEMENTED";
    throw svcErr;
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<{
        message: ErpAuthMessage<ErpAuthUser>;
      }>(ERP_AUTH_ROUTES.ME);
      const message = response.data?.message as ErpAuthMessage<ErpAuthUser> | undefined;
      if (message?.success && message.data) {
        return toUser(message.data);
      }
      throw new ServiceError(
        "Unable to load the current user.",
        "SESSION_EXPIRED",
        response.status,
      );
    } catch (error: unknown) {
      throw toServiceError(error, "Your session has expired. Please sign in again.");
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post<ErpLogoutResponse>(ERP_AUTH_ROUTES.LOGOUT, {});
    } catch {
      // Logout should still succeed locally even if the remote call fails.
    }
  }
}
