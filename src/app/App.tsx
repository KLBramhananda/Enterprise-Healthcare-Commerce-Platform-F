/**
 * App
 *
 * Root application component.
 * Wraps the router with all global providers and handles session
 * restoration on page reload for ERPNext session-based authentication.
 */

import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "@/routes";
import { useAuthStore } from "@/store/authStore";
import { services } from "@/services/factory";

/**
 * Session restoration wrapper.
 * On mount, if there is persisted auth state that hasn't been verified
 * (e.g. after page reload in session mode), calls the ERPNext current-user
 * endpoint to confirm the session is still valid.
 *
 * Shows a minimal loading state while verifying. If the session expired,
 * clears auth state and allows the router to redirect to login.
 */
function SessionRestore({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authMode, sessionVerified } = useAuthStore();

  const needsVerification = isAuthenticated && authMode === "session" && !sessionVerified;

  useEffect(() => {
    if (!needsVerification) return;

    services.auth
      .getCurrentUser()
      .then((user) => {
        useAuthStore
          .getState()
          .setAuth(user, { accessToken: "session" }, "session");
        useAuthStore.getState().setSessionVerified(true);
      })
      .catch(() => {
        useAuthStore.getState().clearAuth();
      });
  }, [needsVerification]);

  if (needsVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm font-medium text-surface-500">Restoring session...</span>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionRestore>
        <AppRouter />
      </SessionRestore>
    </BrowserRouter>
  );
}
