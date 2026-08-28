/**
 * AppRouter
 *
 * Application routing with progressive authentication model.
 *
 * Route groups:
 * - GuestRoute + AuthLayout: login, register, forgot-password, etc.
 *   Only accessible to unauthenticated users.
 * - Public (CommerceLayout): homepage, product catalog, product details, search, services,
 *   articles, offers, and informational pages. Accessible to everyone.
 * - ProtectedRoute + CommerceLayout: checkout, wishlist, orders, addresses,
 *   prescriptions, profile, notifications, loyalty. Requires authentication.
 *
 * Route pages are code-split via React.lazy so each chunk loads on demand.
 */

import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { CommerceLayout, AuthLayout } from "@/layouts";
import { ScrollToTop } from "@/components/layout";
import { ProtectedRoute, GuestRoute } from "./guards";

const Home = lazy(() => import("@/pages/Home"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const CatalogPage = lazy(() => import("@/pages/catalog/CatalogPage"));
const CategoriesPage = lazy(() => import("@/pages/catalog/CategoriesPage"));
const ProductDetailsPage = lazy(() => import("@/pages/product/ProductDetailsPage"));
const SearchResultsPage = lazy(() => import("@/pages/search/SearchResultsPage"));
const BrandsPage = lazy(() => import("@/pages/discovery/BrandsPage"));
const BrandDetailPage = lazy(() => import("@/pages/discovery/BrandDetailPage"));
const CollectionsPage = lazy(() => import("@/pages/discovery/CollectionsPage"));
const CollectionDetailPage = lazy(() => import("@/pages/discovery/CollectionDetailPage"));
const HealthConcernsPage = lazy(() => import("@/pages/discovery/HealthConcernsPage"));
const HealthConcernPage = lazy(() => import("@/pages/discovery/HealthConcernPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const VerifyOTPPage = lazy(() => import("@/pages/auth/VerifyOTPPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const PaymentProcessingPage = lazy(() => import("@/pages/payment/PaymentProcessingPage"));
const OrderConfirmationPage = lazy(() => import("@/pages/OrderConfirmationPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const AddressesPage = lazy(() => import("@/pages/AddressesPage"));
const PrescriptionsPage = lazy(() => import("@/pages/PrescriptionsPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const OffersPage = lazy(() => import("@/pages/engagement/OffersPage"));
const CouponsPage = lazy(() => import("@/pages/engagement/CouponsPage"));
const LoyaltyPage = lazy(() => import("@/pages/engagement/LoyaltyPage"));
const ReferralPage = lazy(() => import("@/pages/engagement/ReferralPage"));
const MembershipPage = lazy(() => import("@/pages/engagement/MembershipPage"));
const AccountDashboardPage = lazy(() => import("@/pages/account/AccountDashboardPage"));
const OrderDetailPage = lazy(() => import("@/pages/account/OrderDetailPage"));
const AccountSettingsPage = lazy(() => import("@/pages/account/AccountSettingsPage"));
const HelpCenterPage = lazy(() => import("@/pages/support/HelpCenterPage"));
const FAQPage = lazy(() => import("@/pages/support/FAQPage"));
const ContactPage = lazy(() => import("@/pages/support/ContactPage"));
const ReturnsRefundsPage = lazy(() => import("@/pages/support/ReturnsRefundsPage"));
const LiveChatPage = lazy(() => import("@/pages/support/LiveChatPage"));
const TicketListPage = lazy(() => import("@/pages/support/TicketListPage"));
const TicketDetailPage = lazy(() => import("@/pages/support/TicketDetailPage"));
const CreateTicketPage = lazy(() => import("@/pages/support/CreateTicketPage"));
const SupportDashboardPage = lazy(() => import("@/pages/support/SupportDashboardPage"));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <span className="text-sm font-medium text-surface-500">Loading...</span>
    </div>
  );
}

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
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
            <Route path="/checkout/payment/:orderId" element={<PaymentProcessingPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/orders/:orderId/confirmation" element={<OrderConfirmationPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/profile" element={<AccountDashboardPage />} />
            <Route path="/settings" element={<AccountSettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/coupons" element={<CouponsPage />} />
            <Route path="/rewards" element={<LoyaltyPage />} />
            <Route path="/referral" element={<ReferralPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/help/tickets" element={<TicketListPage />} />
            <Route path="/help/tickets/new" element={<CreateTicketPage />} />
            <Route path="/help/tickets/:ticketId" element={<TicketDetailPage />} />
            <Route path="/support" element={<SupportDashboardPage />} />
          </Route>
        </Route>

        {/* ─── Public routes (no authentication required) ─── */}
        <Route element={<CommerceLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:slug" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/brands/:slug" element={<BrandDetailPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collections/:slug" element={<CollectionDetailPage />} />
          <Route path="/health-concerns" element={<HealthConcernsPage />} />
          <Route path="/health-concerns/:slug" element={<HealthConcernPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/help/faq" element={<FAQPage />} />
          <Route path="/help/contact" element={<ContactPage />} />
          <Route path="/help/returns" element={<ReturnsRefundsPage />} />
          <Route path="/help/chat" element={<LiveChatPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        </Routes>
      </Suspense>
    </>
  );
}