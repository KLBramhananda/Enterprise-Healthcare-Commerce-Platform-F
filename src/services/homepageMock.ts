/**
 * Mock Homepage Service
 *
 * Returns static storefront content for the commerce homepage.
 * Used for UI development before ERPNext backend integration.
 * Replace with ErpNextHomepageService in services/index.ts when backend is ready.
 */

import {
  Pill,
  Leaf,
  TestTube,
  Stethoscope,
  User,
  Apple,
  Flower2,
  Droplets,
  HeartPulse,
  Brain,
  Bone,
  Eye,
  Baby,
  Thermometer,
  ShieldCheck,
  Activity,
  FileText,
  TestTubes,
  Truck,
  PhoneCall,
} from "lucide-react";
import type { HomepageContent } from "@/types/homepage";
import type { IHomepageService } from "./homepageService";

const MOCK_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const homepageContent: HomepageContent = {
  /* ── Hero Carousel ── */
  heroSlides: [
    {
      id: "slide-medicines",
      eyebrow: "Your Health, Our Priority",
      title: "Healthcare essentials delivered to your doorstep",
      description:
        "Order medicines, wellness products, and health devices with guaranteed authenticity, licensed pharmacists, and fast delivery.",
      highlight: "doorstep",
      primaryCta: { label: "Shop Medicines", path: "/category/medicines" },
      secondaryCta: { label: "Upload Prescription", path: "/prescriptions" },
      theme: "brand",
    },
    {
      id: "slide-lab-tests",
      eyebrow: "Certified Labs",
      title: "Lab tests at up to 60% off",
      description:
        "Book health checkups and diagnostic tests from certified labs. Free home sample collection and digital reports.",
      highlight: "60% off",
      primaryCta: { label: "Book a Lab Test", path: "/category/lab-tests" },
      secondaryCta: { label: "View Packages", path: "/category/lab-tests" },
      theme: "blue",
    },
    {
      id: "slide-doctor",
      eyebrow: "Consult Online",
      title: "Talk to a doctor in minutes",
      description:
        "Connect with certified doctors anytime through video or chat consultations. No queues, no waiting rooms.",
      highlight: "in minutes",
      primaryCta: { label: "Consult Now", path: "/consultations" },
      theme: "purple",
    },
    {
      id: "slide-offers",
      eyebrow: "Limited Time",
      title: "Save big on wellness bestsellers",
      description:
        "Stock up on vitamins, supplements, and daily essentials with exclusive launch offers across all categories.",
      highlight: "bestsellers",
      primaryCta: { label: "Explore Offers", path: "/offers" },
      secondaryCta: { label: "Shop Wellness", path: "/category/wellness" },
      theme: "amber",
    },
  ],

  /* ── Featured Categories ── */
  categories: [
    { id: "cat-medicines", title: "Medicines", path: "/category/medicines", icon: Pill, color: "blue" },
    { id: "cat-wellness", title: "Wellness", path: "/category/wellness", icon: Leaf, color: "green" },
    { id: "cat-lab-tests", title: "Lab Tests", path: "/category/lab-tests", icon: TestTube, color: "purple" },
    { id: "cat-devices", title: "Health Devices", path: "/category/health-devices", icon: Stethoscope, color: "amber" },
    { id: "cat-personal-care", title: "Personal Care", path: "/category/personal-care", icon: User, color: "pink" },
    { id: "cat-nutrition", title: "Nutrition", path: "/category/nutrition", icon: Apple, color: "orange" },
    { id: "cat-ayurveda", title: "Ayurveda", path: "/category/ayurveda", icon: Flower2, color: "brand" },
    { id: "cat-homeopathy", title: "Homeopathy", path: "/category/homeopathy", icon: Droplets, color: "cyan" },
  ],

  /* ── Featured Medicines ── */
  featuredMedicines: [
    {
      id: "med-1",
      name: "Paracetamol 500mg",
      brandName: "Calpol",
      form: "Tablet",
      packSize: "Strip of 15",
      price: 2.4,
      originalPrice: 3.0,
      discountPercent: 20,
      rating: 4.6,
      reviewCount: 1284,
      requiresPrescription: false,
    },
    {
      id: "med-2",
      name: "Amoxicillin 500mg",
      brandName: "Mox",
      form: "Capsule",
      packSize: "Strip of 10",
      price: 8.15,
      originalPrice: 10.5,
      discountPercent: 22,
      rating: 4.4,
      reviewCount: 863,
      requiresPrescription: true,
    },
    {
      id: "med-3",
      name: "Vitamin D3 60000 IU",
      brandName: "Uprise-D3",
      form: "Softgel Capsule",
      packSize: "Strip of 4",
      price: 5.99,
      originalPrice: 7.49,
      discountPercent: 20,
      rating: 4.7,
      reviewCount: 2410,
      requiresPrescription: false,
    },
    {
      id: "med-4",
      name: "Cetirizine 10mg",
      brandName: "Zyrtec",
      form: "Tablet",
      packSize: "Strip of 10",
      price: 1.85,
      rating: 4.5,
      reviewCount: 952,
      requiresPrescription: false,
    },
    {
      id: "med-5",
      name: "Metformin 850mg",
      brandName: "Glycomet",
      form: "Tablet",
      packSize: "Strip of 20",
      price: 4.25,
      originalPrice: 5.6,
      discountPercent: 24,
      rating: 4.3,
      reviewCount: 641,
      requiresPrescription: true,
    },
    {
      id: "med-6",
      name: "Pantoprazole 40mg",
      brandName: "Pantocid",
      form: "Tablet",
      packSize: "Strip of 15",
      price: 6.1,
      originalPrice: 7.8,
      discountPercent: 22,
      rating: 4.6,
      reviewCount: 1178,
      requiresPrescription: true,
    },
    {
      id: "med-7",
      name: "Omega-3 Fish Oil 1000mg",
      brandName: "Seven Seas",
      form: "Softgel Capsule",
      packSize: "Bottle of 60",
      price: 18.9,
      originalPrice: 24.0,
      discountPercent: 21,
      rating: 4.8,
      reviewCount: 3205,
      requiresPrescription: false,
    },
    {
      id: "med-8",
      name: "ORS Electrolyte Powder",
      brandName: "Electral",
      form: "Powder Sachet",
      packSize: "Pack of 5",
      price: 2.75,
      rating: 4.5,
      reviewCount: 507,
      requiresPrescription: false,
    },
  ],

  /* ── Top Brands ── */
  topBrands: [
    { id: "brand-cipla", name: "Cipla", tagline: "Trusted since 1935", productCount: 1240 },
    { id: "brand-sun", name: "Sun Pharma", tagline: "Healing starts here", productCount: 1580 },
    { id: "brand-himalaya", name: "Himalaya", tagline: "Nature's care", productCount: 420 },
    { id: "brand-abbott", name: "Abbott", tagline: "Life-changing tech", productCount: 890 },
    { id: "brand-dabur", name: "Dabur", tagline: "Ayurvedic heritage", productCount: 650 },
    { id: "brand-gsk", name: "GSK", tagline: "Science led health", productCount: 730 },
    { id: "brand-bayer", name: "Bayer", tagline: "Health for all", productCount: 510 },
    { id: "brand-zydus", name: "Zydus", tagline: "Wellness for everyone", productCount: 980 },
  ],

  /* ── Health Concerns ── */
  healthConcerns: [
    { id: "concern-diabetes", title: "Diabetes Care", path: "/concern/diabetes-care", icon: HeartPulse, color: "pink" },
    { id: "concern-cardiac", title: "Cardiac Care", path: "/concern/cardiac-care", icon: Activity, color: "pink" },
    { id: "concern-stomach", title: "Stomach Care", path: "/concern/stomach-care", icon: Thermometer, color: "amber" },
    { id: "concern-bone", title: "Bone & Joint", path: "/concern/bone-joint", icon: Bone, color: "orange" },
    { id: "concern-mental", title: "Mental Wellness", path: "/concern/mental-wellness", icon: Brain, color: "purple" },
    { id: "concern-eye", title: "Eye Care", path: "/concern/eye-care", icon: Eye, color: "cyan" },
    { id: "concern-mother", title: "Mother & Baby", path: "/concern/mother-baby", icon: Baby, color: "green" },
    { id: "concern-immunity", title: "Immunity Boosters", path: "/concern/immunity", icon: ShieldCheck, color: "brand" },
  ],

  /* ── Popular Lab Tests ── */
  labTests: [
    {
      id: "lab-full-body",
      name: "Full Body Checkup",
      parameterCount: 92,
      fastingRequired: true,
      reportInDays: 1,
      price: 49.0,
      originalPrice: 122.0,
      discountPercent: 60,
      popular: true,
    },
    {
      id: "lab-thyroid",
      name: "Thyroid Profile Test",
      parameterCount: 3,
      fastingRequired: false,
      reportInDays: 1,
      price: 12.0,
      originalPrice: 30.0,
      discountPercent: 60,
      popular: true,
    },
    {
      id: "lab-diabetes",
      name: "Diabetes Panel (HbA1c + Sugar)",
      parameterCount: 2,
      fastingRequired: true,
      reportInDays: 1,
      price: 9.5,
      originalPrice: 21.0,
      discountPercent: 55,
    },
    {
      id: "lab-vitamin",
      name: "Vitamin D & B12 Combo",
      parameterCount: 2,
      fastingRequired: false,
      reportInDays: 2,
      price: 19.0,
      originalPrice: 45.0,
      discountPercent: 58,
      popular: true,
    },
  ],

  /* ── Offers & Promotions ── */
  offers: [
    {
      id: "offer-health20",
      code: "HEALTH20",
      title: "20% off your first order",
      description: "New to KeeMeds? Enjoy 20% off on medicines and wellness products.",
      terms: "Max discount $10. Valid once per customer.",
      expiresOn: "2026-12-31",
      accent: "brand",
    },
    {
      id: "offer-labsaver",
      code: "LABSAVER",
      title: "Flat $15 off lab tests",
      description: "Book any health checkup above $30 and save instantly.",
      terms: "Applicable on select packages. Home collection included.",
      expiresOn: "2026-10-31",
      accent: "blue",
    },
    {
      id: "offer-monthly",
      code: "MONTHLY10",
      title: "10% off every refill",
      description: "Subscribe to monthly refills of chronic medication and keep saving.",
      terms: "Auto-applied on subscription orders.",
      expiresOn: "2026-09-30",
      accent: "amber",
    },
  ],

  /* ── Healthcare Services ── */
  services: [
    {
      id: "svc-prescription",
      title: "Upload Prescription",
      description: "Upload your prescription and get medicines delivered hassle-free",
      icon: FileText,
      color: "blue",
    },
    {
      id: "svc-lab-tests",
      title: "Book Lab Tests",
      description: "Schedule lab tests from certified labs at discounted prices",
      icon: TestTubes,
      color: "purple",
    },
    {
      id: "svc-delivery",
      title: "Express Delivery",
      description: "Get your medicines delivered within 2 hours in your city",
      icon: Truck,
      color: "emerald",
    },
    {
      id: "svc-doctor",
      title: "Doctor Consultation",
      description: "Consult with certified doctors online, anytime anywhere",
      icon: PhoneCall,
      color: "amber",
    },
  ],

  /* ── Testimonials ── */
  testimonials: [
    {
      id: "testimonial-1",
      quote:
        "Ordered my father's diabetes medication at midnight and it arrived before breakfast the next day. KeeMeds has become our family's pharmacy.",
      authorName: "Sarah Mitchell",
      authorRole: "Verified Customer",
      rating: 5,
      initials: "SM",
    },
    {
      id: "testimonial-2",
      quote:
        "The prescription upload flow is brilliant — their pharmacist called to confirm dosage before dispatch. That level of care builds real trust.",
      authorName: "David Okafor",
      authorRole: "Verified Customer",
      rating: 5,
      initials: "DO",
    },
    {
      id: "testimonial-3",
      quote:
        "Booked a full body checkup at nearly half the lab price. Free home sample collection and reports arrived the same evening.",
      authorName: "Priya Raman",
      authorRole: "Verified Customer",
      rating: 4,
      initials: "PR",
    },
  ],
};

export class MockHomepageService implements IHomepageService {
  async getHomepageContent(): Promise<HomepageContent> {
    await delay(MOCK_DELAY_MS);
    return homepageContent;
  }
}
