/**
 * Auth Service Interface
 *
 * Defines the contract for all authentication operations.
 * The UI layer depends ONLY on this interface — never on a concrete implementation.
 * To integrate with ERPNext, implement IAuthService and swap the export in services/index.ts.
 */

import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyOTPPayload,
  ResetPasswordPayload,
  AuthResponse,
  User,
} from "@/types/auth";

export interface IAuthService {
  login(payload: LoginPayload): Promise<AuthResponse>;
  register(payload: RegisterPayload): Promise<AuthResponse>;
  forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }>;
  verifyOTP(payload: VerifyOTPPayload): Promise<{ message: string; token: string }>;
  resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }>;
  getCurrentUser(): Promise<User>;
  logout(): Promise<void>;
}

/**
 * Structured error for auth service operations.
 * Carries a machine-readable code and optional HTTP status for consumers.
 */
export class ServiceError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = status;
  }
}
