/**
 * Mock Auth Service
 *
 * Simulates all IAuthService operations with in-memory storage and artificial delays.
 * Used for UI development before ERPNext backend integration.
 * Replace with ErpNextAuthService in services/index.ts when backend is ready.
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
import type { IAuthService } from "./authService";
import { ServiceError } from "./authService";

const mockUsers = new Map<string, User & { password: string }>();

function delay(ms?: number): Promise<void> {
  const duration = ms ?? 500 + Math.random() * 1000;
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function generateId(): string {
  return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function generateToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
}

function toAuthResponse(user: User): AuthResponse {
  return {
    user,
    tokens: { accessToken: generateToken(), refreshToken: generateToken() },
  };
}

export class MockAuthService implements IAuthService {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await delay();

    const user = Array.from(mockUsers.values()).find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (!user || user.password !== payload.password) {
      throw new ServiceError(
        "Invalid email or password. Please try again.",
        "INVALID_CREDENTIALS",
        401,
      );
    }

    return toAuthResponse(user);
  }

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await delay();

    const exists = Array.from(mockUsers.values()).some(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (exists) {
      throw new ServiceError(
        "An account with this email already exists.",
        "EMAIL_EXISTS",
        409,
      );
    }

    const user: User & { password: string } = {
      id: generateId(),
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone,
      isVerified: false,
      createdAt: new Date().toISOString(),
      password: payload.password,
    };

    mockUsers.set(user.id, user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _unused, ...publicUser } = user;
    return toAuthResponse(publicUser);
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    await delay();

    const exists = Array.from(mockUsers.values()).some(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (!exists) {
      throw new ServiceError(
        "No account found with this email address.",
        "EMAIL_NOT_FOUND",
        404,
      );
    }

    return { message: "Password reset code sent to your email." };
  }

  async verifyOTP(payload: VerifyOTPPayload): Promise<{ message: string; token: string }> {
    await delay();

    if (payload.code.length !== 6 || !/^\d{6}$/.test(payload.code)) {
      throw new ServiceError(
        "Invalid verification code. Please enter a 6-digit code.",
        "INVALID_OTP",
        400,
      );
    }

    return { message: "OTP verified successfully.", token: generateToken() };
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    await delay();

    if (!payload.token) {
      throw new ServiceError(
        "Invalid or expired reset token.",
        "INVALID_TOKEN",
        400,
      );
    }

    return { message: "Password reset successfully." };
  }

  async getCurrentUser(): Promise<User> {
    await delay(200);

    throw new ServiceError(
      "Session expired. Please log in again.",
      "SESSION_EXPIRED",
      401,
    );
  }

  async logout(): Promise<void> {
    await delay(200);
  }
}
