/**
 * CommerceFooter
 *
 * Production-ready commerce footer with brand, links, contact, and legal sections.
 */

import { Link } from "react-router-dom";
import { Activity, Mail, Phone, MapPin } from "lucide-react";
import { APP_NAME } from "@/config/constants";

const footerLinks = {
  company: [
    { label: "About Us", path: "/about" },
    { label: "Careers", path: "/careers" },
    { label: "Blog", path: "/blog" },
    { label: "Press", path: "/press" },
  ],
  categories: [
    { label: "Medicines", path: "/category/medicines" },
    { label: "Wellness", path: "/category/wellness" },
    { label: "Lab Tests", path: "/category/lab-tests" },
    { label: "Health Devices", path: "/category/health-devices" },
  ],
  account: [
    { label: "My Orders", path: "/account/orders" },
    { label: "My Profile", path: "/account/profile" },
    { label: "Addresses", path: "/account/addresses" },
    { label: "Wallet", path: "/account/wallet" },
  ],
  policies: [
    { label: "Terms & Conditions", path: "/terms" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Return Policy", path: "/returns" },
    { label: "Shipping Policy", path: "/shipping" },
  ],
};

export default function CommerceFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Activity size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-white">{APP_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Your trusted partner for healthcare products, medicines, and wellness solutions.
              Quality you can rely on.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:support@keemeds.com"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
              >
                <Mail size={14} />
                <span>support@keemeds.com</span>
              </a>
              <a
                href="tel:+18001234567"
                className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
              >
                <Phone size={14} />
                <span>1-800-123-4567</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>123 Health Avenue, Medical District, 10001</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Categories</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.categories.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Account</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.account.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Policies</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.policies.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-slate-400 transition-colors hover:text-emerald-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row lg:px-6">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved. Developed by HG Infotech
          </p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
              Terms
            </Link>
            <Link to="/privacy" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
              Privacy
            </Link>
            <Link to="/sitemap" className="text-xs text-slate-500 transition-colors hover:text-slate-300">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
