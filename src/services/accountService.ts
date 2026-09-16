/**
 * Account Service Interface
 *
 * Defines the contract for account management operations.
 * UI depends ONLY on this interface — swap MockAccountService
 * with ErpNextAccountService for backend integration.
 */

import type {
  AccountPreferences,
  AccountCompletionStatus,
  SecuritySettings,
  ChangePasswordPayload,
} from "@/types/account";
import type { User } from "@/types/auth";

export interface IAccountService {
  getPreferences(): Promise<AccountPreferences>;
  updatePreferences(prefs: Partial<AccountPreferences>): Promise<AccountPreferences>;
  updateProfile(data: { fullName?: string; phone?: string }): Promise<User>;
  getAccountCompletion(): Promise<AccountCompletionStatus>;
  getSecuritySettings(): Promise<SecuritySettings>;
  changePassword(data: ChangePasswordPayload): Promise<{ message: string }>;
}
