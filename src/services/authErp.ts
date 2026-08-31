/**
 * ERPNext Auth Service
 *
 * Session-based authentication implementation for ERPNext/Frappe backend.
 * Uses cookie-based sessions (sid cookie) rather than JWT Bearer tokens.
 *
 * Auth flow:
 *   1. Login: POST form-encoded credentials → ERPNext sets session cookie
 *   2. Requests: browser sends sid cookie automatically (withCredentials: true)
 *   3. Session check: GET /api/method/frappe.auth.get_logged_user
 *   4. Logout: GET /api/method/logout → ERPNext clears session cookie
 *
 * CSRF tokens are managed separately by csrfManager.ts and injected
 * by the HTTP client interceptor for state-changing requests.
 */

import { apiClient } from "@/api/client";
import { userMapper, type ErpNextUserDto } from "@/mappers/userMapper";
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOTPPayload,
  ResetPasswordPayload,
  AuthResponse,
  User,
} from "@/types/auth";
import type { IAuthService, ServiceError } from "./authService";

/** ERPNext RPC endpoints for auth operations. */
const ERP_AUTH = {
  LOGIN: "login",
  LOGOUT: "logout",
  GET_USER: "frappe.auth.get_logged_user",
  GET_SESSION_USER: "frappe.auth.get_logged_user",
} as const;

/** ERPNext login response shape. */
interface ErpNextLoginResponse {
  message: string;
  home_page?: string;
  full_name?: string;
}

/** ERPNext current-user response shape. */
interface ErpNextCurrentUserResponse {
  message: string;
}

/** ERPNext error response shape. */
interface ErpNextErrorResponse {
  message: string;
  _server_messages?: string[];
  exc_type?: string;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const obj = data as ErpNextErrorResponse;
  return obj.message ?? fallback;
}

export class ErpNextAuthService implements IAuthService {
  readonly name = "ErpNextAuthService";

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append("usr", payload.email);
    formData.append("pwd", payload.password);

    try {
      const response = await apiClient.post<ErpNextLoginResponse>(
        ERP_AUTH.LOGIN,
        formData.toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      if (response.data.message === "Logged In") {
        const user = await this.fetchCurrentUser();
        return {
          user,
          tokens: {
            accessToken: "session",
            refreshToken: undefined,
          },
        };
      }

      throw {
        message: response.data.message ?? "Login failed",
        status: 401,
      } as ServiceError;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as ServiceError).message === "string" &&
        "status" in error
      ) {
        throw error;
      }

      const axiosError = error as {
        response?: { data?: ErpNextErrorResponse; status?: number };
      };
      const status = axiosError.response?.status;
      const backendMsg = extractErrorMessage(
        axiosError.response?.data,
        "Invalid credentials. Please try again.",
      );

      const svcErr = new Error(backendMsg) as ServiceError;
      svcErr.code = status === 401 ? "INVALID_CREDENTIALS" : "LOGIN_FAILED";
      svcErr.status = status;
      throw svcErr;
    }
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    void payload;
    const svcErr = new Error(
      "Registration is managed by the ERPNext backend. Please use the portal.",
    ) as ServiceError;
    svcErr.code = "NOT_IMPLEMENTED";
    svcErr.status = 501;
    throw svcErr;
  }

  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string }> {
    void payload;
    const svcErr = new Error(
      "Password reset is managed by the ERPNext backend.",
    ) as ServiceError;
    svcErr.code = "NOT_IMPLEMENTED";
    svcErr.status = 501;
    throw svcErr;
  }

  async verifyOTP(
    payload: VerifyOTPPayload,
  ): Promise<{ message: string; token: string }> {
    void payload;
    const svcErr = new Error(
      "OTP verification is managed by the ERPNext backend.",
    ) as ServiceError;
    svcErr.code = "NOT_IMPLEMENTED";
    svcErr.status = 501;
    throw svcErr;
  }

  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> {
    void payload;
    const svcErr = new Error(
      "Password reset is managed by the ERPNext backend.",
    ) as ServiceError;
    svcErr.code = "NOT_IMPLEMENTED";
    svcErr.status = 501;
    throw svcErr;
  }

  async getCurrentUser(): Promise<User> {
    return this.fetchCurrentUser();
  }

  async logout(): Promise<void> {
    try {
      await apiClient.get(ERP_AUTH.LOGOUT);
    } catch {
      // Logout should succeed even if the request fails (clear local state)
    }
  }

  /* ── Internal helpers ── */

  private async fetchCurrentUser(): Promise<User> {
    const response = await apiClient.get<ErpNextCurrentUserResponse>(
      ERP_AUTH.GET_USER,
    );
    const erpUser = response.data.message as unknown as ErpNextUserDto;
    return userMapper.toDomain(erpUser);
  }
}
