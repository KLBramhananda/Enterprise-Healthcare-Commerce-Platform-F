/**
 * Route Guards
 *
 * Provides route-level access control for progressive authentication.
 *
 * - ProtectedRoute: Requires authentication. Saves the attempted URL so the
 *   login page can redirect back after successful sign-in. Renders child routes.
 * - GuestRoute: Requires NO authentication. Redirects to "/" if already signed in.
 *   Used for login/register/forgot-password pages.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

/**
 * Wraps routes that require an authenticated session.
 * On unauthenticated access, redirects to /auth/login and persists
 * the originally requested path in location.state.returnPath.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        state={{ returnPath: location.pathname + location.search }}
        replace
      />
    );
  }

  return <Outlet />;
}

/**
 * Wraps routes that should only be accessible to guests (e.g. login, register).
 * If an authenticated user navigates here, redirect them to the storefront root.
 */
export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
