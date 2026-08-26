/**
 * CommerceFooter
 *
 * Production-ready commerce footer with newsletter, brand, link columns,
 * contact, social, trust badges, and legal sections.
 * All styles reference design tokens from tokens.css.
 */

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Activity, Mail, Phone, MapPin, Send, ShieldCheck, Lock, RotateCcw } from "lucide-react";
import { APP_NAME } from "@/config/constants";
import { Container } from "@/components/ui";
import { useToast } from "@/providers/ToastProvider";

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
  services: [
    { label: "Upload Prescription", path: "/prescriptions" },
    { label: "Doctor Consultation", path: "/consultations" },
    { label: "Book a Lab Test", path: "/category/lab-tests" },
    { label: "Offers & Coupons", path: "/offers" },
  ],
  account: [
    { label: "My Orders", path: "/orders" },
    { label: "My Profile", path: "/profile" },
    { label: "Addresses", path: "/addresses" },
    { label: "Wishlist", path: "/wishlist" },
  ],
  support: [
    { label: "Help Center", path: "/help" },
    { label: "FAQ", path: "/help/faq" },
    { label: "Contact Us", path: "/help/contact" },
    { label: "Returns & Refunds", path: "/help/returns" },
    { label: "My Tickets", path: "/help/tickets" },
  ],
};

const socialLinks = [
  { label: "Facebook", path: "/social/facebook" },
  { label: "Instagram", path: "/social/instagram" },
  { label: "X (Twitter)", path: "/social/twitter" },
  { label: "YouTube", path: "/social/youtube" },
];

const trustBadges = [
  { icon: ShieldCheck, title: "Licensed Pharmacy", description: "Genuine medicines only" },
  { icon: Lock, title: "Secure Payments", description: "256-bit SSL encryption" },
  { icon: RotateCcw, title: "Easy Returns", description: "Hassle-free within 14 days" },
];

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; path: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-0">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className="text-sm text-surface-400 transition-colors duration-fast hover:text-brand-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function CommerceFooter() {
  const [email, setEmail] = useState("");
  const { addToast } = useToast();

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addToast("You're subscribed! Health tips are on their way.", "success");
    setEmail("");
  };

  return (
    <footer className="bg-surface-900 text-surface-300">
      {/* Trust Badges */}
      <div className="border-b border-surface-800">
        <Container className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-3 sm:gap-8">
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className="flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left"
            >
              <badge.icon size={22} className="shrink-0 text-brand-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-surface-100">{badge.title}</p>
                <p className="text-xs text-surface-500">{badge.description}</p>
              </div>
            </div>
          ))}
        </Container>
      </div>

      {/* Main Footer Content */}
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1.4fr)_repeat(4,minmax(0,1fr))] lg:gap-8">
          {/* Brand + Newsletter + Contact */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Activity size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-surface-0">{APP_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-surface-400">
              Your trusted partner for healthcare products, medicines, and wellness solutions.
              Quality you can rely on.
            </p>

            {/* Newsletter */}
            <h3 className="mt-7 text-sm font-semibold uppercase tracking-wider text-surface-0">
              Health tips in your inbox
            </h3>
            <form onSubmit={handleSubscribe} className="mt-3 flex max-w-sm gap-2">
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full min-w-0 rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-sm text-surface-100 outline-none transition-colors duration-fast placeholder:text-surface-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
              >
                Subscribe
                <Send size={13} aria-hidden="true" />
              </button>
            </form>

            {/* Contact Info */}
            <address className="mt-6 space-y-3 not-italic">
              <a
                href="mailto:support@keemeds.com"
                className="flex items-center gap-2 text-sm text-surface-400 transition-colors duration-fast hover:text-brand-400"
              >
                <Mail size={14} aria-hidden="true" />
                <span>support@keemeds.com</span>
              </a>
              <a
                href="tel:+18001234567"
                className="flex items-center gap-2 text-sm text-surface-400 transition-colors duration-fast hover:text-brand-400"
              >
                <Phone size={14} aria-hidden="true" />
                <span>1-800-123-4567</span>
              </a>
              <div className="flex items-start gap-2 text-sm text-surface-400">
                <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>123 Health Avenue, Medical District, 10001</span>
              </div>
            </address>

            {/* Social */}
            <h3 className="mt-7 text-sm font-semibold uppercase tracking-wider text-surface-0">
              Follow Us
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <Link
                    to={social.path}
                    className="inline-flex rounded-lg border border-surface-700 px-3 py-1.5 text-xs font-medium text-surface-400 transition-colors duration-fast hover:border-brand-500 hover:text-brand-400"
                  >
                    {social.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link Columns */}
          <FooterLinkColumn title="Company" links={footerLinks.company} />
          <FooterLinkColumn title="Categories" links={footerLinks.categories} />
          <FooterLinkColumn title="Services" links={footerLinks.services} />
          <FooterLinkColumn title="Account" links={footerLinks.account} />
          <FooterLinkColumn title="Support" links={footerLinks.support} />
        </div>
      </Container>

      {/* Disclaimer */}
      <div className="border-t border-surface-800">
        <Container className="py-4">
          <p className="text-[11px] leading-relaxed text-surface-500">
            Disclaimer: The information on this website is for general awareness only and is not a
            substitute for professional medical advice. Always consult a licensed healthcare
            provider before starting any medication. Medicines dispensed against valid
            prescriptions where required.
          </p>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-800">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-surface-500">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-xs text-surface-500 transition-colors duration-fast hover:text-surface-300">
              Terms
            </Link>
            <Link to="/privacy" className="text-xs text-surface-500 transition-colors duration-fast hover:text-surface-300">
              Privacy
            </Link>
            <Link to="/sitemap" className="text-xs text-surface-500 transition-colors duration-fast hover:text-surface-300">
              Sitemap
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
