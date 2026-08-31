/**
 * Mock Auth Repository
 *
 * Mock implementation of IAuthRepository. Delegates to the existing
 * MockAuthService internally. When ERPNext is connected, replace with
 * ErpNextAuthRepository that maps Frappe session responses.
 */

import type { ApiResponse } from "@/types/api";
import type { AuthResponse, RegisterPayload, User } from "@/types/auth";
import type { IAuthRepository } from "../types";

const MOCK_DELAY = 200;

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), MOCK_DELAY));
}

export class MockAuthRepository implements IAuthRepository {
  readonly name = "MockAuthRepository";

  async login(email: string): Promise<ApiResponse<AuthResponse>> {
    return delay({
      success: true,
      message: "ok",
      data: {
        user: {
          id: "mock-user-1",
          email,
          fullName: "Mock User",
          phone: "+91-9999999999",
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      },
    });
  }

  async register(data: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
    return delay({
      success: true,
      message: "ok",
      data: {
        user: {
          id: "mock-user-new",
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          isVerified: false,
          createdAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      },
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return delay({ success: true, message: "Logged out", data: undefined });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return delay({
      success: true,
      message: "ok",
      data: {
        id: "mock-user-1",
        email: "user@example.com",
        fullName: "Mock User",
        phone: "+91-9999999999",
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
    });
  }
}
