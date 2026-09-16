/**
 * Mock Account Service
 *
 * In-memory mock implementation of IAccountService.
 * Provides profile updates, preferences management, and account completion.
 */

import type {
  AccountPreferences,
  AccountCompletionStatus,
  SecuritySettings,
  ChangePasswordPayload,
} from "@/types/account";
import type { User } from "@/types/auth";
import type { IAccountService } from "./accountService";
import { ServiceError } from "./authService";

const mockUser: User = {
  id: "usr-001",
  email: "john.doe@example.com",
  fullName: "John Doe",
  phone: "+1-555-0123",
  isVerified: true,
  createdAt: "2024-01-15T00:00:00.000Z",
};

let mockPreferences: AccountPreferences = {
  emailNotifications: true,
  smsNotifications: true,
  promotionalEmails: false,
  language: "en",
};

/** Used only by the STATIC mock to simulate password verification. */
let mockCurrentPassword = "password123";

let mockSecurity: SecuritySettings = {
  twoFactorEnabled: false,
  lastPasswordChangedAt: undefined,
  activeSessions: [
    {
      id: "ses-current",
      device: "Chrome on macOS",
      platform: "Desktop — Safari",
      location: "Bengaluru, IN",
      lastActiveAt: new Date().toISOString(),
      isCurrent: true,
    },
    {
      id: "ses-android",
      device: "Pixel 8",
      platform: "Mobile — Android",
      location: "Mumbai, IN",
      lastActiveAt: "2025-06-02T08:15:00.000Z",
      isCurrent: false,
    },
  ],
};

function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAccountService implements IAccountService {
  async getPreferences(): Promise<AccountPreferences> {
    await delay(100);
    return { ...mockPreferences };
  }

  async updatePreferences(prefs: Partial<AccountPreferences>): Promise<AccountPreferences> {
    await delay(150);
    mockPreferences = { ...mockPreferences, ...prefs };
    return { ...mockPreferences };
  }

  async updateProfile(data: { fullName?: string; phone?: string }): Promise<User> {
    await delay(200);
    if (data.fullName) mockUser.fullName = data.fullName;
    if (data.phone) mockUser.phone = data.phone;
    return { ...mockUser };
  }

  async getAccountCompletion(): Promise<AccountCompletionStatus> {
    await delay(100);
    const hasProfile = Boolean(mockUser.fullName && mockUser.phone);
    const hasAddresses = true;
    const hasPrescriptions = false;
    const completed = [hasProfile, hasAddresses, hasPrescriptions].filter(Boolean).length;
    return {
      hasProfile,
      hasAddresses,
      hasPrescriptions,
      percentage: Math.round((completed / 3) * 100),
    };
  }

  async getSecuritySettings(): Promise<SecuritySettings> {
    await delay(150);
    return {
      ...mockSecurity,
      activeSessions: mockSecurity.activeSessions.map((s) => ({ ...s })),
    };
  }

  async changePassword(data: ChangePasswordPayload): Promise<{ message: string }> {
    await delay(250);

    if (data.currentPassword !== mockCurrentPassword) {
      throw new ServiceError(
        "Your current password is incorrect.",
        "INVALID_CREDENTIALS",
        401,
      );
    }

    mockCurrentPassword = data.newPassword;
    mockSecurity = { ...mockSecurity, lastPasswordChangedAt: new Date().toISOString() };
    return { message: "Password updated successfully." };
  }
}
