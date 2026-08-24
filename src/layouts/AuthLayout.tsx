/**
 * AuthLayout
 *
 * Centered layout shell for authentication pages.
 * No commerce header/footer — just brand identity, card, and footer text.
 */

import { Link, Outlet } from "react-router-dom";
import { Activity } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/config/constants";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4 py-12">
      {/* Brand */}
      <Link to="/" className="mb-8 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
          <Activity size={22} strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-surface-900">{APP_NAME}</span>
      </Link>

      {/* Auth Card */}
      <div className="w-full max-w-md">
        <Outlet />
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-surface-400">
        {APP_TAGLINE}
      </p>
    </div>
  );
}
