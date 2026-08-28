/**
 * Auth Types
 *
 * Domain types for the authentication module.
 * These shapes are implementation-agnostic and will remain stable
 * when swapping from mock to ERPNext backend integration.
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOTPPayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
