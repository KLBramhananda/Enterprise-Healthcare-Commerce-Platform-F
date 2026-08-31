/**
 * CommerceFooter
 *
 * Production-ready commerce footer with a prominent newsletter band,
 * trust badges, grouped link columns, contact + social, and a clearly
 * separated legal/copyright bar. All styles reference design tokens.
 */

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Code2,
  Lock,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { APP_NAME } from "@/config/constants";
import { Container } from "@/components/ui";
import { useToast } from "@/providers/ToastProvider";

const footerLinks = {
  shop: [
    { label: "Medicines", path: "/category/medicines" },
    { label: "Wellness", path: "/category/wellness" },
    { label: "Lab Tests", path: "/category/lab-tests" },
    { label: "Health Devices", path: "/category/health-devices" },
    { label: "Offers & Coupons", path: "/offers" },
  ],
  company: [
    { label: "About Us", path: "/about" },
    { label: "Careers", path: "/careers" },
    { label: "Blog", path: "/blog" },
    { label: "Press", path: "/press" },
  ],
  services: [
    { label: "Upload Prescription", path: "/prescriptions" },
    { label: "Doctor Consultation", path: "/consultations" },
    { label: "Book a Lab Test", path: "/category/lab-tests" },
    { label: "Refer a Friend", path: "/referral" },
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

const contactChannels = [
  { icon: Mail, label: "support@keemeds.com", href: "mailto:support@keemeds.com" },
  { icon: Phone, label: "1-800-123-4567", href: "tel:+18001234567" },
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
      <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-0">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.path}>
            <Link
              to={link.path}
              className="inline-flex text-sm leading-relaxed text-surface-400 transition-colors duration-fast hover:text-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
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
      {/* Newsletter highlight band */}
      <section
        aria-label="Newsletter subscription"
        className="border-b border-surface-800 bg-surface-950/50"
      >
        <Container className="flex flex-col gap-6 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold tracking-tight text-surface-0 sm:text-2xl">
              Health tips in your inbox
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-surface-400 sm:text-base">
              Get the latest deals, health tips, and wellness content from {APP_NAME}.
              No spam — just what you need.
            </p>
          </div>
          <form
            onSubmit={handleSubscribe}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row lg:justify-end"
          >
            <label htmlFor="footer-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full min-w-0 rounded-lg border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm text-surface-100 outline-none transition-colors duration-fast placeholder:text-surface-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20"
            />
            <button
              type="submit"
              className="shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-fast hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
            >
              Subscribe
              <Send size={14} className="ml-1.5 inline-block align-[-2px]" aria-hidden="true" />
            </button>
          </form>
        </Container>
      </section>

      {/* Trust badges */}
      <div className="border-b border-surface-800">
        <Container className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-3 sm:gap-6">
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className="flex items-center justify-center gap-3 sm:justify-start"
            >
              <badge.icon size={20} className="shrink-0 text-brand-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-surface-100">{badge.title}</p>
                <p className="text-xs text-surface-500">{badge.description}</p>
              </div>
            </div>
          ))}
        </Container>
      </div>

      {/* Main columns */}
      <Container className="py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-3 lg:grid-cols-[2fr_repeat(5,minmax(0,1fr))] lg:gap-x-10 lg:gap-y-0">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Activity size={18} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="text-xl font-bold text-surface-0">{APP_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-surface-400">
              Your trusted partner for healthcare products, medicines, and wellness
              solutions. Quality you can rely on.
            </p>

            {/* Contact */}
            <h3 className="mt-7 text-xs font-semibold uppercase tracking-widest text-surface-0">
              Contact
            </h3>
            <address className="mt-3.5 space-y-2.5 not-italic">
              {contactChannels.map((channel) => (
                <a
                  key={channel.href}
                  href={channel.href}
                  className="flex items-center gap-2.5 text-sm text-surface-400 transition-colors duration-fast hover:text-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
                >
                  <channel.icon size={15} className="shrink-0 text-surface-600" aria-hidden="true" />
                  <span>{channel.label}</span>
                </a>
              ))}
              <div className="flex items-start gap-2.5 text-sm text-surface-400">
                <MapPin size={15} className="mt-0.5 shrink-0 text-surface-600" aria-hidden="true" />
                <span>123 Health Avenue, Medical District, 10001</span>
              </div>
            </address>

            {/* Social */}
            <h3 className="mt-7 text-xs font-semibold uppercase tracking-widest text-surface-0">
              Follow Us
            </h3>
            <ul className="mt-3.5 flex flex-wrap gap-2.5">
              {socialLinks.map((social) => (
                <li key={social.path}>
                  <Link
                    to={social.path}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-700 px-3 text-xs font-medium text-surface-400 transition-colors duration-fast hover:border-brand-500 hover:text-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900"
                  >
                    {social.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <FooterLinkColumn title="Shop" links={footerLinks.shop} />
          <FooterLinkColumn title="Company" links={footerLinks.company} />
          <FooterLinkColumn title="Services" links={footerLinks.services} />
          <FooterLinkColumn title="Account" links={footerLinks.account} />
          <FooterLinkColumn title="Support" links={footerLinks.support} />
        </div>
      </Container>

      {/* Legal / disclaimer */}
      <div className="border-t border-surface-800">
        <Container className="py-6">
          <p className="max-w-5xl text-[11px] leading-relaxed text-surface-500">
            Disclaimer: The information on this website is for general awareness only and is
            not a substitute for professional medical advice. Always consult a licensed
            healthcare provider before starting any medication. Medicines are dispensed
            against valid prescriptions where required.
          </p>
        </Container>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-surface-800 bg-surface-950/60">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 lg:flex-row">
          <div className="flex flex-col items-center gap-1.5 lg:items-start">
            <p className="text-xs text-surface-500">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-surface-600">
              <Code2 size={12} aria-hidden="true" />
              <span>Platform Design &amp; Engineering</span>
              <span className="text-surface-700" aria-hidden="true">
                &middot;
              </span>
              <span>Bramhananda K L</span>
            </p>
            
          </div>
          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              to="/terms"
              className="text-xs font-medium text-surface-400 transition-colors duration-fast hover:text-surface-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="text-xs font-medium text-surface-400 transition-colors duration-fast hover:text-surface-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
            >
              Privacy Policy
            </Link>
            <Link
              to="/sitemap"
              className="text-xs font-medium text-surface-400 transition-colors duration-fast hover:text-surface-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
            >
              Sitemap
            </Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
