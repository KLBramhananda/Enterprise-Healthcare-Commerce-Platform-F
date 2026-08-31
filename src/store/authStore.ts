/**
 * Auth Store
 *
 * Zustand store for authentication state with localStorage persistence.
 * Single source of truth for user session data across the application.
 *
 * Supports two authentication modes:
 *   - Token-based (mock): JWT/access tokens stored in `tokens`
 *   - Session-based (ERPNext): Cookie-based sessions, `tokens.accessToken`
 *     is set to "session" as a marker; actual auth is via the sid cookie
 *
 * The `authMode` flag tracks which mode is active. It is persisted so
 * session restoration on page reload knows to verify via the ERPNext
 * current-user endpoint rather than checking token expiry.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthTokens } from "@/types/auth";

export type AuthMode = "token" | "session";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Current authentication mode. "session" for ERPNext, "token" for mock. */
  authMode: AuthMode;
  /**
   * Whether the session has been verified against the backend.
   * On page reload with persisted auth, this is false until verifySession()
   * confirms the session is still valid. Prevents flash of protected content
   * before the session check completes.
   */
  sessionVerified: boolean;
  setAuth: (user: User, tokens: AuthTokens, mode?: AuthMode) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setSessionVerified: (verified: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      authMode: "token" as AuthMode,
      sessionVerified: false,

      setAuth: (user, tokens, mode = "token") =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
          authMode: mode,
          sessionVerified: mode === "token",
        }),

      clearAuth: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
          authMode: "token",
          sessionVerified: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setSessionVerified: (sessionVerified) => set({ sessionVerified }),
    }),
    {
      name: "keemeds-auth",
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        authMode: state.authMode,
        sessionVerified: state.sessionVerified,
      }),
    },
  ),
);
