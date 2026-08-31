/**
 * ERPNext Auth Repository
 *
 * Data access layer for ERPNext authentication endpoints. Maps between
 * ERPNext Frappe session responses and frontend domain types.
 *
 * This repository handles raw HTTP communication; the service layer
 * (ErpNextAuthService) uses this for data retrieval and transformation.
 */

import { apiClient } from "@/api/client";
import { userMapper, type ErpNextUserDto } from "@/mappers/userMapper";
import type { ApiResponse } from "@/types/api";
import type { AuthResponse, RegisterPayload, User } from "@/types/auth";
import type { IAuthRepository } from "../types";

/** ERPNext current-user raw response. */
interface ErpNextUserResponse {
  message: string;
}

export class ErpNextAuthRepository implements IAuthRepository {
  readonly name = "ErpNextAuthRepository";

  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<AuthResponse>> {
    const formData = new URLSearchParams();
    formData.append("usr", email);
    formData.append("pwd", password);

    await apiClient.post(
      "login",
      formData.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const user = await this.getCurrentUser();
    return {
      success: true,
      message: "Logged in",
      data: {
        user: user.data,
        tokens: { accessToken: "session" },
      },
    };
  }

  async register(
    data: RegisterPayload,
  ): Promise<ApiResponse<AuthResponse>> {
    void data;
    throw new Error("Registration is managed by the ERPNext backend.");
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await apiClient.get("logout");
    } catch {
      // Clear local state regardless
    }
    return { success: true, message: "Logged out", data: undefined };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ErpNextUserResponse>(
      "frappe.auth.get_logged_user",
    );
    const erpUser = response.data.message as unknown as ErpNextUserDto;
    const user = userMapper.toDomain(erpUser);
    return { success: true, message: "ok", data: user };
  }
}
