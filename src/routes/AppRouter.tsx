/**
 * AppRouter
 *
 * Application routing with progressive authentication model.
 *
 * Route groups:
 * - GuestRoute + AuthLayout: login, register, forgot-password, etc.
 *   Only accessible to unauthenticated users.
 * - Public (CommerceLayout): homepage, product browsing, search, services,
 *   articles, offers, and informational pages. Accessible to everyone.
 * - ProtectedRoute + CommerceLayout: checkout, wishlist, orders, addresses,
 *   prescriptions, profile, notifications, loyalty. Requires authentication.
 */

import { Routes, Route } from "react-router-dom";
import { CommerceLayout, AuthLayout } from "@/layouts";
import { ProtectedRoute, GuestRoute } from "./guards";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  VerifyOTPPage,
  ResetPasswordPage,
} from "@/pages/auth";
import CheckoutPage from "@/pages/CheckoutPage";
import WishlistPage from "@/pages/WishlistPage";
import OrdersPage from "@/pages/OrdersPage";
import AddressesPage from "@/pages/AddressesPage";
import PrescriptionsPage from "@/pages/PrescriptionsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotificationsPage from "@/pages/NotificationsPage";
import LoyaltyPage from "@/pages/LoyaltyPage";

export default function AppRouter() {
  return (
    <Routes>
      {/* ─── Guest-only routes (redirect to / if already authenticated) ─── */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* ─── Protected customer routes (redirect to /auth/login if not authenticated) ─── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<CommerceLayout />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/addresses" element={<AddressesPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/rewards" element={<LoyaltyPage />} />
        </Route>
      </Route>

      {/* ─── Public routes (no authentication required) ─── */}
      <Route element={<CommerceLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
