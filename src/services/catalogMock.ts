/**
 * Mock Catalog Service
 *
 * Serves a static in-memory catalog with client-side filtering, sorting,
 * and pagination that mirror the intended ERPNext API behavior.
 * Replace with ErpNextCatalogService in services/index.ts when backend is ready.
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
  Brain,
  Bone,
  Eye,
  Baby,
  Heart,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import type {
  BrandDetail,
  BrandFacet,
  BrandSummary,
  CatalogCategory,
  CatalogFilters,
  CatalogQuery,
  Collection,
  CollectionSlug,
  DiscoveryQuery,
  HealthConcern,
  PaginatedResult,
  PopularSearch,
  PriceRangeId,
  Product,
  ProductDetails,
  ProductFaq,
  ProductImage,
  ProductQuestion,
  ProductReview,
  ReviewSummary,
  SearchQuery,
  SearchResult,
  SearchSuggestion,
} from "@/types/catalog";
import type { ICatalogService } from "./catalogService";
import { ServiceError } from "./authService";

const MOCK_DELAY_MS = 300;
const DEFAULT_PAGE_SIZE = 12;

/* ── Categories (slugs match existing navigation links) ── */

const categories: CatalogCategory[] = [
  {
    id: "cat-medicines",
    slug: "medicines",
    title: "Medicines",
    description: "Prescription and over-the-counter medicines across all major therapeutic areas.",
    icon: Pill,
    color: "blue",
    productCount: 0,
  },
  {
    id: "cat-wellness",
    slug: "wellness",
    title: "Wellness",
    description: "Vitamins, supplements, and daily essentials to keep you at your best.",
    icon: Leaf,
    color: "green",
    productCount: 0,
  },
  {
    id: "cat-lab-tests",
    slug: "lab-tests",
    title: "Lab Tests",
    description: "Preventive health checkups and diagnostic panels from certified labs.",
    icon: TestTube,
    color: "purple",
    productCount: 0,
  },
  {
    id: "cat-devices",
    slug: "health-devices",
    title: "Health Devices",
    description: "Monitors, thermometers, nebulizers, and home-care medical devices.",
    icon: Stethoscope,
    color: "amber",
    productCount: 0,
  },
  {
    id: "cat-personal-care",
    slug: "personal-care",
    title: "Personal Care",
    description: "Skin, hair, oral, and feminine hygiene care for the whole family.",
    icon: User,
    color: "pink",
    productCount: 0,
  },
  {
    id: "cat-nutrition",
    slug: "nutrition",
    title: "Nutrition",
    description: "Proteins, nutrition drinks, and dietary supplements for every age.",
    icon: Apple,
    color: "orange",
    productCount: 0,
  },
  {
    id: "cat-ayurveda",
    slug: "ayurveda",
    title: "Ayurveda",
    description: "Classical and proprietary ayurvedic formulations from trusted houses.",
    icon: Flower2,
    color: "brand",
    productCount: 0,
  },
  {
    id: "cat-homeopathy",
    slug: "homeopathy",
    title: "Homeopathy",
    description: "Dilutions, biochemics, and mother tins for gentle homeopathic care.",
    icon: Droplets,
    color: "cyan",
    productCount: 0,
  },
];

/* ── Products ── */

interface ProductSeed {
  name: string;
  brandName: string;
  manufacturer: string;
  categorySlug: string;
  form: string;
  packSize: string;
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  requiresPrescription?: boolean;
  stockStatus?: Product["stockStatus"];
  isNew?: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  isLimitedOffer?: boolean;
}

const productSeeds: ProductSeed[] = [
  // Medicines
  { name: "Paracetamol 500mg", brandName: "Calpol", manufacturer: "GSK", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 15 tablets", price: 2.4, mrp: 3.0, rating: 4.6, reviewCount: 1284, isBestseller: true, isTrending: true },
  { name: "Amoxicillin 500mg", brandName: "Mox", manufacturer: "Cipla", categorySlug: "medicines", form: "Capsule", packSize: "Strip of 10 capsules", price: 8.15, mrp: 10.5, rating: 4.4, reviewCount: 863, requiresPrescription: true },
  { name: "Metformin 850mg", brandName: "Glycomet", manufacturer: "USV", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 20 tablets", price: 4.25, mrp: 5.6, rating: 4.3, reviewCount: 641, requiresPrescription: true },
  { name: "Pantoprazole 40mg", brandName: "Pantocid", manufacturer: "Sun Pharma", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 15 tablets", price: 6.1, mrp: 7.8, rating: 4.6, reviewCount: 1178, requiresPrescription: true },
  { name: "Cetirizine 10mg", brandName: "Zyrtec", manufacturer: "Johnson & Johnson", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 10 tablets", price: 1.85, mrp: 2.2, rating: 4.5, reviewCount: 952, stockStatus: "low_stock" },
  { name: "Azithromycin 500mg", brandName: "Azithral", manufacturer: "Alembic", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 5 tablets", price: 7.5, mrp: 9.2, rating: 4.2, reviewCount: 388, requiresPrescription: true, isNew: true },
  { name: "Ibuprofen 400mg", brandName: "Brufen", manufacturer: "Abbott", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 15 tablets", price: 3.1, mrp: 3.9, rating: 4.4, reviewCount: 720 },
  { name: "Montelukast + Levocetirizine", brandName: "Montair LC", manufacturer: "Cipla", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 10 tablets", price: 9.8, mrp: 12.4, rating: 4.5, reviewCount: 512, requiresPrescription: true, stockStatus: "out_of_stock" },
  { name: "Amlodipine 5mg", brandName: "Amlopres", manufacturer: "Cipla", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 15 tablets", price: 2.95, mrp: 3.75, rating: 4.5, reviewCount: 806, requiresPrescription: true },
  { name: "Atorvastatin 10mg", brandName: "Atorva", manufacturer: "Zydus", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 15 tablets", price: 5.45, mrp: 6.9, rating: 4.6, reviewCount: 1094, requiresPrescription: true },
  { name: "Losartan 50mg", brandName: "Repace", manufacturer: "Torrent", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 15 tablets", price: 4.85, mrp: 6.0, rating: 4.4, reviewCount: 592, requiresPrescription: true },
  { name: "Ondansetron 4mg", brandName: "Emeset", manufacturer: "Cipla", categorySlug: "medicines", form: "Tablet", packSize: "Strip of 10 tablets", price: 3.85, mrp: 4.8, rating: 4.3, reviewCount: 347, requiresPrescription: true },
  { name: "Salbutamol Inhaler 100mcg", brandName: "Asthalin HFA", manufacturer: "Cipla", categorySlug: "medicines", form: "Inhaler", packSize: "200 doses", price: 7.25, mrp: 8.6, rating: 4.6, reviewCount: 731, requiresPrescription: true, isNew: true },
  { name: "Cough Syrup Adult", brandName: "Ascoril LS", manufacturer: "Glenmark", categorySlug: "medicines", form: "Syrup", packSize: "100 ml bottle", price: 5.65, mrp: 6.75, rating: 4.2, reviewCount: 489 },

  // Wellness
  { name: "Vitamin D3 60000 IU", brandName: "Uprise-D3", manufacturer: "Alkem", categorySlug: "wellness", form: "Softgel Capsule", packSize: "Strip of 4 capsules", price: 5.99, mrp: 7.49, rating: 4.7, reviewCount: 2410, isBestseller: true },
  { name: "Omega-3 Fish Oil 1000mg", brandName: "Seven Seas", manufacturer: "Merck", categorySlug: "wellness", form: "Softgel Capsule", packSize: "Bottle of 60 capsules", price: 18.9, mrp: 24.0, rating: 4.8, reviewCount: 3205, isBestseller: true, isTrending: true },
  { name: "Multivitamin Daily", brandName: "Revital H", manufacturer: "Sun Pharma", categorySlug: "wellness", form: "Capsule", packSize: "Bottle of 30 capsules", price: 14.5, mrp: 18.0, rating: 4.3, reviewCount: 1544 },
  { name: "Vitamin B Complex", brandName: "Becosules", manufacturer: "Pfizer", categorySlug: "wellness", form: "Capsule", packSize: "Strip of 20 capsules", price: 4.6, mrp: 5.4, rating: 4.5, reviewCount: 1988 },
  { name: "Melatonin 5mg", brandName: "Sleepwell", manufacturer: "HealthKart", categorySlug: "wellness", form: "Tablet", packSize: "Strip of 10 tablets", price: 8.99, mrp: 11.99, rating: 4.1, reviewCount: 233, isNew: true },
  { name: "Calcium + Vitamin D3", brandName: "Shelcal 500", manufacturer: "Torrent", categorySlug: "wellness", form: "Tablet", packSize: "Strip of 15 tablets", price: 5.75, mrp: 6.9, rating: 4.6, reviewCount: 1671 },

  // Lab Tests
  { name: "Full Body Checkup", brandName: "KeeLabs Essential", manufacturer: "KeeLabs", categorySlug: "lab-tests", form: "Blood Test Panel", packSize: "92 parameters", price: 49.0, mrp: 122.0, rating: 4.7, reviewCount: 986, isBestseller: true, isLimitedOffer: true },
  { name: "Thyroid Profile Test", brandName: "KeeLabs Thyrocare", manufacturer: "KeeLabs", categorySlug: "lab-tests", form: "Blood Test Panel", packSize: "3 parameters", price: 12.0, mrp: 30.0, rating: 4.5, reviewCount: 654 },
  { name: "Diabetes Panel (HbA1c)", brandName: "KeeLabs Glyco", manufacturer: "KeeLabs", categorySlug: "lab-tests", form: "Blood Test Panel", packSize: "2 parameters", price: 9.5, mrp: 21.0, rating: 4.6, reviewCount: 441, isNew: true },
  { name: "Vitamin D & B12 Combo", brandName: "KeeLabs Vital", manufacturer: "KeeLabs", categorySlug: "lab-tests", form: "Blood Test Panel", packSize: "2 parameters", price: 19.0, mrp: 45.0, rating: 4.4, reviewCount: 372, isBestseller: true },
  { name: "Lipid Profile Test", brandName: "KeeLabs Lipid", manufacturer: "KeeLabs", categorySlug: "lab-tests", form: "Blood Test Panel", packSize: "8 parameters", price: 11.0, mrp: 25.0, rating: 4.5, reviewCount: 298 },

  // Health Devices
  { name: "Digital Blood Pressure Monitor", brandName: "Omron HEM-7124", manufacturer: "Omron", categorySlug: "health-devices", form: "BP Monitor", packSize: "1 unit + cuff", price: 38.99, mrp: 52.0, rating: 4.6, reviewCount: 2140, isBestseller: true, isTrending: true },
  { name: "Pulse Oximeter Fingertip", brandName: "Dr Trust", manufacturer: "Dr Trust USA", categorySlug: "health-devices", form: "Oximeter", packSize: "1 unit", price: 16.5, mrp: 29.99, rating: 4.3, reviewCount: 1876, isLimitedOffer: true },
  { name: "Infrared Thermometer", brandName: "Beurer FT 90", manufacturer: "Beurer", categorySlug: "health-devices", form: "Thermometer", packSize: "1 unit", price: 24.0, mrp: 35.0, rating: 4.4, reviewCount: 934 },
  { name: "Digital Glucometer Kit", brandName: "Accu-Chek", manufacturer: "Roche", categorySlug: "health-devices", form: "Glucometer", packSize: "Kit + 10 strips", price: 21.99, mrp: 27.5, rating: 4.5, reviewCount: 1421, stockStatus: "low_stock" },
  { name: "Compressor Nebulizer", brandName: "Omron NE-C101", manufacturer: "Omron", categorySlug: "health-devices", form: "Nebulizer", packSize: "1 unit", price: 42.0, mrp: 58.0, rating: 4.6, reviewCount: 689, isNew: true },

  // Personal Care
  { name: "Sunscreen SPF 50 Gel", brandName: "La Shield", manufacturer: "Glenmark", categorySlug: "personal-care", form: "Gel", packSize: "50 g tube", price: 13.5, mrp: 17.0, rating: 4.5, reviewCount: 1102, isBestseller: true, isTrending: true },
  { name: "Anti-Dandruff Shampoo", brandName: "Scalpe+", manufacturer: "Glenmark", categorySlug: "personal-care", form: "Shampoo", packSize: "100 ml bottle", price: 9.2, mrp: 11.5, rating: 4.3, reviewCount: 764 },
  { name: "Moisturizing Lotion", brandName: "Cetaphil", manufacturer: "Galderma", categorySlug: "personal-care", form: "Lotion", packSize: "200 ml bottle", price: 15.75, mrp: 19.5, rating: 4.7, reviewCount: 2451 },
  { name: "Baby Gentle Wipes", brandName: "Himalaya Soothing", manufacturer: "Himalaya", categorySlug: "personal-care", form: "Wipes", packSize: "Pack of 72 wipes", price: 4.85, mrp: 5.99, rating: 4.4, reviewCount: 1310 },
  { name: "Medicated Anti-Acne Gel", brandName: "Clindac A", manufacturer: "Galderma", categorySlug: "personal-care", form: "Gel", packSize: "15 g tube", price: 7.95, mrp: 9.8, rating: 4.2, reviewCount: 508, isNew: true },

  // Nutrition
  { name: "Whey Protein Chocolate", brandName: "Optimum Nutrition", manufacturer: "Glanbia", categorySlug: "nutrition", form: "Protein Powder", packSize: "2 lb jar", price: 32.0, mrp: 42.0, rating: 4.6, reviewCount: 1876, isBestseller: true, isTrending: true },
  { name: "Kids Nutrition Drink Vanilla", brandName: "PediaSure", manufacturer: "Abbott", categorySlug: "nutrition", form: "Powder", packSize: "400 g tin", price: 18.5, mrp: 22.5, rating: 4.5, reviewCount: 2233 },
  { name: "Diabetic Protein Powder", brandName: "Protinex Diabetes", manufacturer: "Danone", categorySlug: "nutrition", form: "Powder", packSize: "400 g tin", price: 16.9, mrp: 21.0, rating: 4.3, reviewCount: 887 },
  { name: "Pregnancy Nutrition Drink", brandName: "SimMom", manufacturer: "Abbott", categorySlug: "nutrition", form: "Powder", packSize: "400 g tin", price: 21.0, mrp: 26.0, rating: 4.4, reviewCount: 456, stockStatus: "low_stock" },
  { name: "Plant Protein Unflavoured", brandName: "Origyn", manufacturer: "Origyn Labs", categorySlug: "nutrition", form: "Protein Powder", packSize: "1 kg jar", price: 26.5, mrp: 34.0, rating: 4.1, reviewCount: 212, isNew: true, stockStatus: "out_of_stock" },

  // Ayurveda
  { name: "Chyawanprash Special", brandName: "Dabur", manufacturer: "Dabur", categorySlug: "ayurveda", form: "Paste", packSize: "1 kg jar", price: 9.99, mrp: 12.5, rating: 4.5, reviewCount: 2867, isBestseller: true },
  { name: "Ashwagandha Tablets", brandName: "Himalaya", manufacturer: "Himalaya", categorySlug: "ayurveda", form: "Tablet", packSize: "Bottle of 60 tablets", price: 7.25, mrp: 8.99, rating: 4.4, reviewCount: 1345 },
  { name: "Triphala Churna", brandName: "Baidyanath", manufacturer: "Baidyanath", categorySlug: "ayurveda", form: "Churna", packSize: "250 g pack", price: 4.35, mrp: 5.2, rating: 4.3, reviewCount: 678 },
  { name: "Pain Relief Oil", brandName: "Moov Ayurvedic", manufacturer: "Reckitt", categorySlug: "ayurveda", form: "Oil", packSize: "60 ml bottle", price: 6.5, mrp: 7.5, rating: 4.2, reviewCount: 943 },
  { name: "Giloy Juice Immunity", brandName: "Patanjali", manufacturer: "Patanjali", categorySlug: "ayurveda", form: "Juice", packSize: "1 L bottle", price: 5.85, mrp: 7.0, rating: 4.0, reviewCount: 512, isNew: true },

  // Homeopathy
  { name: "Arnica Montana 30C", brandName: "SBL", manufacturer: "SBL", categorySlug: "homeopathy", form: "Dilution", packSize: "30 ml vial", price: 3.45, mrp: 4.1, rating: 4.5, reviewCount: 421 },
  { name: "Calendula Ointment", brandName: "Willmar Schwabe", manufacturer: "Schwabe India", categorySlug: "homeopathy", form: "Ointment", packSize: "25 g tube", price: 4.95, mrp: 5.75, rating: 4.6, reviewCount: 389, isBestseller: true },
  { name: "Bio Combination No. 28", brandName: "Bioforce", manufacturer: "Bioforce", categorySlug: "homeopathy", form: "Tablets", packSize: "20 g bottle", price: 3.85, mrp: 4.5, rating: 4.2, reviewCount: 167 },
  { name: "Nux Vomica 200C", brandName: "Dr. Reckeweg", manufacturer: "Reckeweg", categorySlug: "homeopathy", form: "Dilution", packSize: "22 ml vial", price: 5.4, mrp: 6.3, rating: 4.4, reviewCount: 203 },
  { name: "Alfalfa Tonic General", brandName: "SBL", manufacturer: "SBL", categorySlug: "homeopathy", form: "Tonic", packSize: "115 ml bottle", price: 7.85, mrp: 9.25, rating: 4.5, reviewCount: 334, isNew: true },
];

function discountPercentOf(seed: ProductSeed): number {
  if (seed.mrp <= seed.price) return 0;
  return Math.round(((seed.mrp - seed.price) / seed.mrp) * 100);
}

const products: Product[] = productSeeds.map((seed, index) => ({
  id: `prd-${String(index + 1).padStart(3, "0")}`,
  slug: `${seed.brandName}-${seed.name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  ...seed,
  requiresPrescription: seed.requiresPrescription ?? false,
  stockStatus: seed.stockStatus ?? "in_stock",
  discountPercent: discountPercentOf(seed),
  imageUrl: undefined,
  isNew: seed.isNew,
  isBestseller: seed.isBestseller,
  isTrending: seed.isTrending,
  isLimitedOffer: seed.isLimitedOffer,
}));

// Keep declared counts consistent with the dataset.
for (const category of categories) {
  category.productCount = products.filter((p) => p.categorySlug === category.slug).length;
}

/* ── Product Details (images, content, FAQs, review summaries) ── */

const CATEGORY_COLORS: Record<string, string> = {
  medicines: "#3b82f6",
  wellness: "#10b981",
  "lab-tests": "#8b5cf6",
  "health-devices": "#f59e0b",
  "personal-care": "#ec4899",
  nutrition: "#f97316",
  ayurveda: "#059669",
  homeopathy: "#06b6d4",
};

function productImageUrl(product: Product, index: number): string {
  const bg = CATEGORY_COLORS[product.categorySlug] ?? "#64748b";
  const label = index === 0 ? product.name : index === 1 ? `${product.brandName} front` : `${product.brandName} back`;
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="${bg}" width="400" height="400" rx="12" opacity="0.12"/><text x="200" y="180" text-anchor="middle" font-family="system-ui" font-size="16" fill="%23334155">${label.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text><text x="200" y="220" text-anchor="middle" font-family="system-ui" font-size="12" fill="%2394a3b8">${product.brandName.replace(/&/g, "&amp;")}</text></svg>`)}`;
}

function generateImages(product: Product): ProductImage[] {
  return [
    { id: `${product.id}-img-0`, url: productImageUrl(product, 0), alt: `${product.name} product image`, isPrimary: true },
    { id: `${product.id}-img-1`, url: productImageUrl(product, 1), alt: `${product.brandName} packaging`, isPrimary: false },
    { id: `${product.id}-img-2`, url: productImageUrl(product, 2), alt: `${product.name} label details`, isPrimary: false },
  ];
}

/* Assign primary imageUrl to each product for card-level display */
for (const product of products) {
  product.imageUrl = productImageUrl(product, 0);
}

function generateReviewSummary(product: Product): ReviewSummary {
  const seed = product.reviewCount;
  const s = Math.sin(seed) * 10000;
  const r = (n: number) => Math.floor(Math.abs(Math.sin(s + n)) * (seed * 0.05));
  const d5 = r(1), d4 = r(2), d3 = r(3), d2 = r(4), d1 = r(5);
  const total = d1 + d2 + d3 + d4 + d5 || 1;
  return {
    averageRating: product.rating,
    totalReviews: product.reviewCount,
    distribution: {
      5: Math.round((d5 / total) * product.reviewCount),
      4: Math.round((d4 / total) * product.reviewCount),
      3: Math.round((d3 / total) * product.reviewCount),
      2: Math.round((d2 / total) * product.reviewCount),
      1: Math.round((d1 / total) * product.reviewCount),
    },
  };
}

const MEDICINE_BENEFITS: Record<string, string[]> = {
  Paracetamol: ["Effective pain relief", "Reduces fever quickly", "Gentle on the stomach"],
  Amoxicillin: ["Broad-spectrum antibiotic", "Treats bacterial infections effectively", "Well-tolerated with proper use"],
  Metformin: ["Controls blood sugar levels", "First-line treatment for type 2 diabetes", "Helps improve insulin sensitivity"],
  Pantoprazole: ["Reduces stomach acid production", "Treats acid reflux and GERD", "Heals esophageal damage"],
  Cetirizine: ["Non-drowsy allergy relief", "24-hour symptom control", "Relieves sneezing and runny nose"],
  Azithromycin: ["Once-daily dosing convenience", "Effective against respiratory infections", "Short treatment course"],
  Ibuprofen: ["Anti-inflammatory pain relief", "Reduces swelling and fever", "Works within 30 minutes"],
  Montelukast: ["Controls asthma symptoms", "Prevents exercise-induced bronchospasm", "Long-lasting allergy control"],
  Amlodipine: ["Effective blood pressure control", "Once-daily dosing", "Well-tolerated calcium channel blocker"],
  Atorvastatin: ["Lowers LDL cholesterol", "Reduces cardiovascular risk", "Stabilizes arterial plaque"],
  Losartan: ["Protects kidney function", "Effective blood pressure management", "Well-tolerated ARB"],
  Ondansetron: ["Prevents nausea and vomiting", "Useful for post-operative care", "Available in multiple forms"],
  Salbutamol: ["Rapid bronchodilation", "Relieves acute asthma attacks", "Portable rescue inhaler"],
  "Cough Syrup": ["Relieves productive cough", "Soothes throat irritation", "Dual action expectorant and bronchodilator"],
};

const GENERIC_BENEFITS: Record<string, string[]> = {
  wellness: ["Supports overall health and wellbeing", "Clinically studied formulation", "Suitable for daily use"],
  "lab-tests": ["Accurate and reliable results", "Performed by certified laboratories", "Quick turnaround time"],
  "health-devices": ["FDA/CE approved device", "Easy to use at home", "Provides accurate readings"],
  "personal-care": ["Dermatologically tested", "Gentle and effective formula", "Suitable for daily use"],
  nutrition: ["Complete nutritional support", "Great taste and easy to mix", "Trusted by health professionals"],
  ayurveda: ["Traditional herbal formulation", "No known side effects when used as directed", "Time-tested ingredients"],
  homeopathy: ["Gentle and non-toxic formula", "Suitable for all age groups", "Natural active ingredients"],
};

function getBenefits(product: Product): string[] {
  const key = Object.keys(MEDICINE_BENEFITS).find((k) => product.name.includes(k));
  if (key) return MEDICINE_BENEFITS[key];
  return GENERIC_BENEFITS[product.categorySlug] ?? ["High-quality product", "Trusted brand", "Effective formula"];
}

function getFaqs(product: Product): ProductFaq[] {
  const cat = product.categorySlug;
  const base: ProductFaq[] = [
    { question: `How should I store ${product.name}?`, answer: `Store in a cool, dry place away from direct sunlight. Keep out of reach of children.` },
    { question: `What is the shelf life of ${product.name}?`, answer: `Please check the expiry date printed on the packaging. Typically, this product has a shelf life of 24-36 months from the date of manufacture.` },
  ];
  if (product.requiresPrescription) {
    base.unshift({ question: `Is a prescription required for ${product.name}?`, answer: `Yes, this product requires a valid prescription from a registered medical practitioner. Please upload your prescription before checkout.` });
  }
  if (cat === "medicines" || cat === "wellness") {
    base.push({ question: `Can I take ${product.name} with other medications?`, answer: `Consult your healthcare provider before combining this with other medications to avoid potential interactions.` });
  }
  if (cat === "lab-tests") {
    base.push({ question: "How do I prepare for this test?", answer: "Fasting for 8-12 hours may be required. Follow the specific instructions provided at the time of booking. A trained phlebotomist will visit your location." });
  }
  if (cat === "health-devices") {
    base.push({ question: "Does this device come with a warranty?", answer: "Yes, this device comes with a 1-year manufacturer warranty covering manufacturing defects. Register your product on the manufacturer's website for warranty activation." });
  }
  return base;
}

function getDosage(product: Product): string {
  if (product.categorySlug === "lab-tests") return "N/A — diagnostic test, not a medication.";
  if (product.categorySlug === "health-devices") return "N/A — medical device. Refer to the user manual for operating instructions.";
  if (product.categorySlug === "wellness") return `Take 1 ${product.form.toLowerCase()} daily with a meal, or as directed by your healthcare professional.`;
  if (product.categorySlug === "ayurveda") return `Take as directed on the label or as advised by your Ayurvedic practitioner.`;
  if (product.categorySlug === "homeopathy") return `Dissolve 2-3 pellets under the tongue, 30 minutes before or after meals, or as directed by your homeopathic physician.`;
  return `Take as prescribed by your physician. Do not exceed the recommended dose.`;
}

function getIngredients(product: Product): string {
  const name = product.name.toLowerCase();
  const map: Record<string, string> = {
    paracetamol: "Paracetamol 500 mg",
    amoxicillin: "Amoxicillin Trihydrate 500 mg (equivalent to Amoxicillin 500 mg)",
    metformin: "Metformin Hydrochloride 850 mg",
    pantoprazole: "Pantoprazole Sodium Sesquihydrate 40 mg",
    cetirizine: "Cetirizine Dihydrochloride 10 mg",
    azithromycin: "Azithromycin Dihydrate 500 mg",
    ibuprofen: "Ibuprofen 400 mg",
    montelukast: "Montelukast Sodium 10 mg + Levocetirizine Dihydrochloride 5 mg",
    amlodipine: "Amlodipine Besylate 5 mg (equivalent to Amlodipine 5 mg)",
    atorvastatin: "Atorvastatin Calcium Trihydrate 10 mg",
    losartan: "Losartan Potassium 50 mg",
    ondansetron: "Ondansetron Hydrochloride Dihydrate 4 mg",
    salbutamol: "Salbutamol Sulphate 100 mcg per actuation",
    "cough syrup": "Ambroxol 30 mg + Terbutaline 1.25 mg + Guaifenesin 50 mg per 5 ml",
  };
  const key = Object.keys(map).find((k) => name.includes(k));
  if (key) return map[key];
  if (product.categorySlug === "wellness") return `${product.brandName} proprietary blend — see packaging for complete ingredient list.`;
  if (product.categorySlug === "ayurveda") return `Ayurvedic formulation containing ${product.brandName} herbal extract blend.`;
  if (product.categorySlug === "homeopathy") return `Homoeopathic dilution of the active ingredient as per standard pharmacopoeia.`;
  return `See product label for full ingredient information.`;
}

function getComposition(product: Product): string {
  return `Each ${product.form.toLowerCase()} contains: ${getIngredients(product)}. Other ingredients: Excipients q.s.`;
}

function getPrecautions(product: Product): string[] {
  const p = ["Keep out of reach of children."];
  if (product.requiresPrescription) p.push("Use only under medical supervision.");
  if (product.categorySlug === "medicines") {
    p.push("Do not use if you are allergic to any of the listed ingredients.");
    p.push("Consult your doctor if symptoms persist beyond the recommended duration.");
  }
  p.push("Read the label carefully before use.");
  return p;
}

function getUses(product: Product): string[] {
  const name = product.name.toLowerCase();
  const map: Record<string, string[]> = {
    paracetamol: ["Relief from headache and body ache", "Reduction of fever"],
    amoxicillin: ["Treatment of bacterial respiratory and skin infections", "Management of certain dental infections"],
    metformin: ["Control of blood sugar in type 2 diabetes", "Improved insulin sensitivity"],
    pantoprazole: ["Relief from acidity and heartburn", "Treatment of gastroesophageal reflux (GERD)"],
    cetirizine: ["Relief from allergic rhinitis", "Reduction of hives and itching"],
    azithromycin: ["Treatment of respiratory tract infections", "Management of skin and soft-tissue infections"],
    ibuprofen: ["Relief of mild to moderate pain", "Reduction of inflammation and fever"],
    montelukast: ["Control of asthma symptoms", "Prevention of exercise-induced bronchospasm"],
    amlodipine: ["Management of high blood pressure", "Relief of chronic stable angina"],
    atorvastatin: ["Lowering of LDL cholesterol", "Reduction of cardiovascular risk"],
    losartan: ["Management of hypertension", "Protection of kidney function in diabetes"],
    ondansetron: ["Prevention of nausea and vomiting", "Symptom control during chemotherapy and post-surgery"],
    salbutamol: ["Rapid relief from bronchospasm", "Management of acute asthma symptoms"],
    "cough syrup": ["Relief from productive cough", "Loosening of thick mucus and phlegm"],
  };
  const key = Object.keys(map).find((k) => name.includes(k));
  if (key) return map[key];
  if (product.categorySlug === "lab-tests") return ["Assessment of overall health", "Screening and monitoring of specific biomarkers"];
  if (product.categorySlug === "health-devices") return ["At-home health monitoring", "Supporting ongoing care management"];
  if (product.categorySlug === "wellness") return ["Daily nutritional support", "Supporting overall health and wellbeing"];
  return ["General wellness support as directed"];
}

function getSideEffects(product: Product): string[] {
  const name = product.name.toLowerCase();
  const nameKey = Object.keys({
    paracetamol: true,
    amoxicillin: true,
    metformin: true,
    pantoprazole: true,
    cetirizine: true,
    azithromycin: true,
    ibuprofen: true,
    montelukast: true,
    amlodipine: true,
    atorvastatin: true,
    losartan: true,
    ondansetron: true,
    salbutamol: true,
  }).find((k) => name.includes(k));
  if (nameKey === "paracetamol") return ["Rarely causes side effects when taken as directed", "Rare allergic skin reactions"];
  if (nameKey === "amoxicillin" || nameKey === "azithromycin") return ["Nausea or mild diarrhoea", "Rash or allergic reaction in some individuals"];
  if (nameKey === "metformin") return ["Mild gastrointestinal discomfort", "Metallic taste"];
  if (nameKey === "pantoprazole") return ["Headache or dizziness", "Abdominal discomfort"];
  if (nameKey === "cetirizine") return ["Mild drowsiness in some users", "Dry mouth"];
  if (nameKey === "ibuprofen") return ["Heartburn or stomach upset", "Dizziness in rare cases"];
  if (nameKey === "montelukast") return ["Headache", "Mild stomach upset"];
  if (nameKey === "amlodipine" || nameKey === "losartan") return ["Mild ankle swelling", "Light-headedness at the start of treatment"];
  if (nameKey === "atorvastatin") return ["Mild muscle pain", "Digestive disturbance"];
  if (nameKey === "ondansetron") return ["Headache", "Constipation"];
  if (nameKey === "salbutamol") return ["Palpitations or tremor in some patients", "Mild throat irritation"];
  if (product.categorySlug === "medicines") return ["Side effects are uncommon when used as directed", "Consult a doctor if any reaction persists"];
  if (product.categorySlug === "wellness" || product.categorySlug === "ayurveda" || product.categorySlug === "homeopathy")
    return ["Generally well tolerated", "Rare mild digestive upset in sensitive individuals"];
  return [];
}

function getWarnings(product: Product): string[] {
  const w = [product.requiresPrescription
    ? "Do not use without a valid doctor's prescription."
    : "Do not exceed the recommended dose.", "Keep out of reach of children."];
  if (product.categorySlug === "medicines") {
    w.push("Consult a doctor if symptoms persist or worsen.");
    w.push("Not recommended during pregnancy or breastfeeding unless advised by a physician.");
  }
  w.push("Do not use if allergic to any of the listed ingredients.");
  return w;
}

function getSafetyInformation(product: Product): string {
  if (product.categorySlug === "lab-tests") {
    return "This is a diagnostic service. Results should be interpreted by a qualified healthcare professional.";
  }
  return `Store below 30°C in a dry place, away from direct sunlight and moisture. ${product.requiresPrescription ? "Use strictly under medical supervision. " : ""}If you have an existing medical condition, are pregnant, or are taking other medicines, consult your healthcare provider before use.`;
}

function getStorage(product: Product): string {
  if (product.categorySlug === "lab-tests") return "N/A — sample is processed at the laboratory.";
  return "Store below 30°C in a dry place, protected from light and moisture.";
}

function getSku(product: Product): string {
  const cat = product.categorySlug.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();
  const brand = product.brandName.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase();
  const idx = product.id.replace(/\D/g, "");
  return `KM-${cat}-${brand}${idx}`;
}

function getStrength(product: Product): string {
  const match = product.name.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml|%))/i);
  if (match) return match[0].trim();
  if (product.form.toLowerCase().includes("inhaler")) return "100 mcg";
  if (product.categorySlug === "lab-tests") return "N/A";
  return "—";
}

function getAvailability(product: Product): string {
  switch (product.stockStatus) {
    case "out_of_stock":
      return "Currently unavailable";
    case "low_stock":
      return "Only a few left — order soon";
    default:
      return "In stock and ready to ship";
  }
}

const REVIEWER_NAMES = [
  "Aarav Mehta",
  "Priya Sharma",
  "Rahul Nair",
  "Sneha Iyer",
  "Vikram Singh",
  "Fatima Khan",
  "Deepak Verma",
  "Ananya Gupta",
];

const REVIEW_TITLES = [
  "Effective and fast",
  "Great value for money",
  "Works as expected",
  "Genuine product",
  "Highly recommended",
];

const REVIEW_BODIES = [
  "This product worked well for me. Genuine item delivered quickly and carefully packaged.",
  "Good quality at a fair price. Delivery was fast and the packaging was intact.",
  "Works as described. I have been using this for a while now and I am satisfied with the results.",
  "A trusted brand and a genuine product. Would definitely recommend to others.",
  "Exactly what I needed. Easy to order and delivered on time.",
];

function generateReviews(product: Product, images: ProductImage[]): ProductReview[] {
  const count = 3 + ((Math.round(Math.sin(product.reviewCount) * 10000) % 3) + 3) % 3;
  const imageUrls = images.slice(0, 2).map((img) => img.url);
  const base = new Date();
  const reviews: ProductReview[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.min(5, Math.max(3, Math.round(product.rating + ((i % 3) - 1) * 0.5)));
    reviews.push({
      id: `${product.id}-rev-${i}`,
      author: REVIEWER_NAMES[i % REVIEWER_NAMES.length],
      rating: r,
      date: new Date(base.getTime() - i * 1000 * 60 * 60 * 24 * (4 + i * 3)).toISOString(),
      title: REVIEW_TITLES[i % REVIEW_TITLES.length],
      content: REVIEW_BODIES[i % REVIEW_BODIES.length],
      verifiedPurchase: i % 3 !== 0,
      images: i % 2 === 0 ? imageUrls : [],
      helpfulCount: (i * 7 + 3) % 40,
    });
  }
  return reviews;
}

function generateQuestions(
  product: Product,
  deliveryDays: number,
  freeDelivery: boolean,
): ProductQuestion[] {
  const date = new Date();
  const qas: { question: string; answer: string }[] = [
    {
      question: `Is ${product.name} safe to use daily?`,
      answer: `Yes, when used as directed on the label${product.requiresPrescription ? " and under medical supervision" : ""}. For any concerns, please consult your healthcare provider.`,
    },
    {
      question: "How long does delivery usually take?",
      answer: `Standard delivery takes about ${deliveryDays} business day${deliveryDays > 1 ? "s" : ""}${freeDelivery ? " and is free for qualifying orders" : ""}. You can track your order anytime from your account.`,
    },
    {
      question: "Is this a genuine product?",
      answer: "Yes. All products are sourced directly from authorized distributors and manufacturers to ensure authenticity.",
    },
  ];
  return qas.map((qa, i) => ({
    id: `${product.id}-q-${i}`,
    question: qa.question,
    answer: qa.answer,
    askedBy: "Verified Customer",
    answeredBy: "KeeMeds Pharmacist",
    date: new Date(date.getTime() - i * 1000 * 60 * 60 * 24 * 2).toISOString(),
  }));
}

function generateProductDetails(product: Product): ProductDetails {
  const estimatedDeliveryDays = product.categorySlug === "lab-tests" ? 1 : 2;
  const freeDelivery = !product.requiresPrescription && product.price >= 25;
  return {
    ...product,
    description: `${product.brandName} (${product.name}) is a ${product.form.toLowerCase()} manufactured by ${product.manufacturer}. Supplied as ${product.packSize}, it is ${product.requiresPrescription ? "a prescription medication" : "an over-the-counter product"} ${product.categorySlug === "lab-tests" ? "diagnostic panel" : "suitable for use as directed"}.`,
    keyBenefits: getBenefits(product),
    uses: getUses(product),
    dosage: getDosage(product),
    sideEffects: getSideEffects(product),
    warnings: getWarnings(product),
    safetyInformation: getSafetyInformation(product),
    precautions: getPrecautions(product),
    storage: getStorage(product),
    ingredients: getIngredients(product),
    composition: getComposition(product),
    faqs: getFaqs(product),
    images: generateImages(product),
    reviewSummary: generateReviewSummary(product),
    estimatedDeliveryDays,
    returnable: !product.requiresPrescription && product.categorySlug !== "lab-tests",
    sku: getSku(product),
    strength: getStrength(product),
    availability: getAvailability(product),
    freeDelivery,
    reviews: generateReviews(product, generateImages(product)),
    questions: generateQuestions(product, estimatedDeliveryDays, freeDelivery),
  };
}

const productDetailsMap = new Map<string, ProductDetails>(
  products.map((p) => [p.id, generateProductDetails(p)]),
);

/* ── Brands (Commerce-level) ── */

const brandDetails: BrandDetail[] = [
  { id: "brd-calpol", slug: "calpol", name: "Calpol", tagline: "Trusted pain relief for the whole family", description: "Calpol is one of the most trusted names in pain and fever relief. Manufactured by GSK, Calpol products are used in millions of households worldwide for effective, gentle relief from headaches, body aches, and fevers.", logoColor: "#3b82f6", productCount: 0, categorySlugs: ["medicines"] },
  { id: "brd-cipla", slug: "cipla", name: "Cipla", tagline: "Caring for life", description: "Cipla is a leading global pharmaceutical company committed to making healthcare affordable and accessible. With a portfolio spanning over 1,500 products across 80+ therapeutic areas, Cipla serves patients in over 80 countries.", logoColor: "#059669", productCount: 0, categorySlugs: ["medicines"] },
  { id: "brd-omron", slug: "omron", name: "Omron", tagline: "Sensing & Control + Think", description: "Omron Healthcare is a global leader in home healthcare monitoring, offering blood pressure monitors, nebulizers, pain relief devices, and body composition monitors trusted by healthcare professionals worldwide.", logoColor: "#dc2626", productCount: 0, categorySlugs: ["health-devices"] },
  { id: "brd-himalaya", slug: "himalaya", name: "Himalaya", tagline: "Science-backed wellness since 1930", description: "Himalaya Wellness is a pioneering brand in herbal health and personal care. Combining Ayurveda with modern clinical research, Himalaya offers products for daily wellness, personal care, baby care, and pharmaceuticals.", logoColor: "#059669", productCount: 0, categorySlugs: ["ayurveda", "personal-care"] },
  { id: "brd-abbott", slug: "abbott", name: "Abbott", tagline: "Life. To the Fullest.", description: "Abbott is a global healthcare company dedicated to improving lives through innovative nutrition, diagnostics, medical devices, and pharmaceutical products. Trusted by health professionals in over 160 countries.", logoColor: "#2563eb", productCount: 0, categorySlugs: ["nutrition", "medicines"] },
  { id: "brd-sun-pharma", slug: "sun-pharma", name: "Sun Pharma", tagline: "Good Health Can't Wait", description: "Sun Pharmaceutical Industries is India's largest and one of the world's leading specialty generic pharmaceutical companies. Known for quality generics, specialty APIs, and OTC products.", logoColor: "#f59e0b", productCount: 0, categorySlugs: ["medicines", "wellness"] },
  { id: "brd-dabur", slug: "dabur", name: "Dabur", tagline: "Celebrate Life", description: "Dabur is one of India's oldest and most trusted FMCG companies, specializing in Ayurvedic and natural healthcare products. With over 140 years of heritage, Dabur combines tradition with modern science.", logoColor: "#dc2626", productCount: 0, categorySlugs: ["ayurveda"] },
  { id: "brd-glenmark", slug: "glenmark", name: "Glenmark", tagline: "Inspiring Hope, Improving Lives", description: "Glenmark Pharmaceuticals is a research-driven global pharmaceutical company with a focus on generics, specialty, and OTC products. Known for dermatology, respiratory, and oncology therapies.", logoColor: "#7c3aed", productCount: 0, categorySlugs: ["medicines", "personal-care"] },
  { id: "brd-seven-seas", slug: "seven-seas", name: "Seven Seas", tagline: "Helping you live healthily since 1935", description: "Seven Seas is a trusted global brand specializing in omega-3 fish oil supplements and daily multivitamins. Committed to supporting heart, brain, and joint health through science-backed formulations.", logoColor: "#0284c7", productCount: 0, categorySlugs: ["wellness"] },
  { id: "brd-sbl", slug: "sbl", name: "SBL", tagline: "World-class homeopathy", description: "SBL is India's largest homeopathic medicine manufacturer, offering a comprehensive range of dilutions, biochemics, and mother tinctures. Trusted by homeopathic practitioners for over 50 years.", logoColor: "#0891b2", productCount: 0, categorySlugs: ["homeopathy"] },
];

// Update brand product counts from the product dataset
for (const brand of brandDetails) {
  brand.productCount = products.filter(
    (p) =>
      p.brandName.toLowerCase().includes(brand.name.toLowerCase()) ||
      brand.categorySlugs.includes(p.categorySlug),
  ).length;
}

const brandSummaryList: BrandSummary[] = brandDetails.map((b) => ({
  id: b.id,
  slug: b.slug,
  name: b.name,
  tagline: b.tagline,
  logoColor: b.logoColor,
  productCount: b.productCount,
}));

const brandMap = new Map<string, BrandDetail>(
  brandDetails.map((b) => [b.slug, b]),
);

/* ── Collections ── */

const collections: Collection[] = [
  { id: "col-best-sellers", slug: "best-sellers", title: "Best Sellers", description: "Our most popular products loved by thousands of customers", accent: "brand", productCount: 0 },
  { id: "col-trending", slug: "trending", title: "Trending Now", description: "Products that are gaining momentum this week", accent: "blue", productCount: 0 },
  { id: "col-new-arrivals", slug: "new-arrivals", title: "New Arrivals", description: "Freshly added products to our catalog", accent: "purple", productCount: 0 },
  { id: "col-deals", slug: "deals-of-the-day", title: "Deals of the Day", description: "Limited-time offers on top products", accent: "amber", productCount: 0 },
  { id: "col-essentials", slug: "essentials", title: "Health Essentials", description: "Must-have products for your everyday healthcare needs", accent: "green", productCount: 0 },
  { id: "col-staff-picks", slug: "staff-picks", title: "Staff Picks", description: "Handpicked recommendations from our healthcare experts", accent: "pink", productCount: 0 },
];

const collectionMap = new Map<string, Collection>(
  collections.map((c) => [c.slug, c]),
);

function getCollectionProducts(slug: CollectionSlug): Product[] {
  switch (slug) {
    case "best-sellers":
      return [...products].filter((p) => p.isBestseller).sort((a, b) => b.reviewCount - a.reviewCount);
    case "trending":
      return [...products].filter((p) => p.isTrending || p.reviewCount > 1000).sort((a, b) => b.reviewCount - a.reviewCount);
    case "new-arrivals":
      return [...products].filter((p) => p.isNew).sort((a, b) => b.reviewCount - a.reviewCount);
    case "deals-of-the-day":
      return [...products].filter((p) => p.discountPercent >= 20).sort((a, b) => b.discountPercent - a.discountPercent);
    case "essentials":
      return [...products].filter((p) => p.isBestseller || p.reviewCount > 800).sort((a, b) => b.rating - a.rating);
    case "staff-picks":
      return [...products].filter((p) => p.rating >= 4.5).sort((a, b) => b.rating - a.rating);
    default:
      return [];
  }
}

function getBrandProducts(slug: string): Product[] {
  const brand = brandDetails.find((b) => b.slug === slug);
  if (!brand) return [];
  return products.filter(
    (p) =>
      p.brandName.toLowerCase().includes(brand.name.toLowerCase()) ||
      (brand.categorySlugs.includes(p.categorySlug) && p.manufacturer.toLowerCase() === brand.name.toLowerCase()),
  );
}

function getDiscoverySortComparator(sortBy: NonNullable<DiscoveryQuery["sortBy"]>): (a: Product, b: Product) => number {
  switch (sortBy) {
    case "popularity": return (a, b) => b.reviewCount - a.reviewCount;
    case "rating": return (a, b) => b.rating - a.rating;
    case "price_asc": return (a, b) => a.price - b.price;
    case "price_desc": return (a, b) => b.price - a.price;
    case "newest": return (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.reviewCount - a.reviewCount;
    default: return (a, b) => b.reviewCount - a.reviewCount;
  }
}

function paginateDiscovery(items: Product[], query?: DiscoveryQuery): PaginatedResult<Product> {
  const { sortBy = "popularity", page = 1, pageSize = DEFAULT_PAGE_SIZE } = query ?? {};
  const sorted = [...items].sort(getDiscoverySortComparator(sortBy));
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: sorted.slice(start, start + pageSize).map((p) => ({ ...p })),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

// Update collection product counts
for (const col of collections) {
  col.productCount = getCollectionProducts(col.slug).length;
}

/* ── Search: health concerns, popular searches, suggestion index ── */

const healthConcerns: HealthConcern[] = [
  { slug: "fever-pain", name: "Fever & Pain", description: "Relief for headaches, body aches, and fevers", icon: Thermometer, relatedCategorySlugs: ["medicines"], keywords: ["fever", "pain", "headache", "ache", "paracetamol", "ibuprofen"] },
  { slug: "diabetes", name: "Diabetes Care", description: "Blood sugar monitoring and management", icon: Droplets, relatedCategorySlugs: ["medicines", "health-devices"], keywords: ["diabetes", "blood sugar", "glucose", "metformin", "glucometer", "hba1c"] },
  { slug: "heart-health", name: "Heart Health", description: "Cardiovascular and blood pressure support", icon: Heart, relatedCategorySlugs: ["medicines"], keywords: ["heart", "blood pressure", "cholesterol", "amlodipine", "atorvastatin", "losartan", "hypertension"] },
  { slug: "allergy-cold", name: "Allergy & Cold", description: "Relief from allergies, cold, and cough", icon: ShieldCheck, relatedCategorySlugs: ["medicines"], keywords: ["allergy", "cold", "cough", "cetirizine", "azithromycin", "sneezing", "asthma", "inhaler"] },
  { slug: "digestive-health", name: "Digestive Health", description: "Gut health and acid reflux solutions", icon: Apple, relatedCategorySlugs: ["medicines", "ayurveda", "homeopathy"], keywords: ["stomach", "acid", "digestion", "pantoprazole", "nausea", "vomit"] },
  { slug: "immunity", name: "Immunity", description: "Boost your natural defenses", icon: Leaf, relatedCategorySlugs: ["wellness", "ayurveda"], keywords: ["immunity", "vitamin", "ashwagandha", "giloy", "chyawanprash", "omega", "fish oil"] },
  { slug: "bone-joint", name: "Bone & Joint Care", description: "Calcium, vitamin D, and joint supplements", icon: Bone, relatedCategorySlugs: ["wellness"], keywords: ["bone", "joint", "calcium", "vitamin d", "shelcal"] },
  { slug: "skin-care", name: "Skin Care", description: "Dermatological and personal care products", icon: User, relatedCategorySlugs: ["personal-care"], keywords: ["skin", "sunscreen", "moisturizing", "acne", "shampoo", "dandruff", "lotion"] },
  { slug: "eye-care", name: "Eye Care", description: "Vision health and eye protection", icon: Eye, relatedCategorySlugs: ["wellness", "personal-care"], keywords: ["eye", "vision"] },
  { slug: "fitness-nutrition", name: "Fitness & Nutrition", description: "Protein, supplements, and nutritional drinks", icon: Brain, relatedCategorySlugs: ["nutrition"], keywords: ["protein", "whey", "nutrition", "pediasure", "pregnancy", "diabetic protein"] },
  { slug: "womens-health", name: "Women's Health", description: "Health essentials for women", icon: Baby, relatedCategorySlugs: ["wellness", "nutrition"], keywords: ["pregnancy", "women", "baby", "prenatal"] },
  { slug: "lab-diagnostics", name: "Lab Tests & Diagnostics", description: "Health checkups and diagnostic panels", icon: TestTube, relatedCategorySlugs: ["lab-tests"], keywords: ["test", "checkup", "thyroid", "diabetes", "lipid", "vitamin d", "b12", "blood test"] },
];

const popularSearches: PopularSearch[] = [
  { text: "Paracetamol", count: 1284 },
  { text: "Vitamin D3", count: 2410 },
  { text: "Omega-3", count: 2140 },
  { text: "Blood Pressure Monitor", count: 1876 },
  { text: "Cough Syrup", count: 1102 },
  { text: "Full Body Checkup", count: 986 },
  { text: "Sunscreen SPF 50", count: 952 },
  { text: "Whey Protein", count: 876 },
];

/** Pre-computed searchable strings for each product. */
function productSearchText(p: Product): string {
  return [p.name, p.brandName, p.manufacturer, p.form, p.categorySlug, p.packSize].join(" ").toLowerCase();
}

const searchTextIndex = products.map((p) => ({ product: p, text: productSearchText(p) }));

const CATEGORY_TITLES: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.slug, c.title]),
);

/* ── Search helpers ── */

function parseSearchTerms(q: string): string[] {
  return q.toLowerCase().split(/\s+/).filter(Boolean);
}

function productMatchesQuery(_p: Product, terms: string[], text: string): boolean {
  for (const term of terms) {
    if (!text.includes(term)) return false;
  }
  return true;
}

function suggestionHighlightRanges(text: string, terms: string[]): [number, number][] {
  const ranges: [number, number][] = [];
  const lower = text.toLowerCase();
  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      ranges.push([idx, idx + term.length]);
    }
  }
  return ranges;
}

/* ── Query helpers mirroring the future server-side contract ── */

const PRICE_RANGES: Record<PriceRangeId, { min?: number; max?: number }> = {
  under_5: { max: 5 },
  "5_to_10": { min: 5, max: 10 },
  "10_to_25": { min: 10, max: 25 },
  above_25: { min: 25 },
};

function matchesFilters(product: Product, filters: CatalogFilters): boolean {
  if (
    filters.brands.length > 0 &&
    !filters.brands.some(
      (b) => b.toLowerCase() === product.brandName.toLowerCase(),
    )
  ) {
    return false;
  }

  if (filters.priceRanges.length > 0) {
    const inRange = filters.priceRanges.some((id) => {
      const range = PRICE_RANGES[id];
      if (!range) return false;
      if (range.min != null && product.price < range.min) return false;
      if (range.max != null && product.price >= range.max) return false;
      return true;
    });
    if (!inRange) return false;
  }

  if (product.discountPercent < filters.minDiscountPercent) return false;

  if (filters.prescription === "rx_only" && !product.requiresPrescription) return false;
  if (filters.prescription === "otc_only" && product.requiresPrescription) return false;

  if (filters.inStockOnly && product.stockStatus === "out_of_stock") return false;

  return true;
}

const comparators: Record<
  NonNullable<CatalogQuery["sortBy"]>,
  (a: Product, b: Product) => number
> = {
  popularity: (a, b) => b.reviewCount - a.reviewCount,
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  discount: (a, b) => b.discountPercent - a.discountPercent,
  rating: (a, b) => b.rating - a.rating,
  name_asc: (a, b) => a.name.localeCompare(b.name),
};

export class MockCatalogService implements ICatalogService {
  async getCategories(): Promise<CatalogCategory[]> {
    await delay();
    return categories.map((category) => ({ ...category }));
  }

  async getCategory(slug: string): Promise<CatalogCategory> {
    await delay();
    const category = categories.find((c) => c.slug === slug);
    if (!category) {
      throw new ServiceError("Category not found.", "NOT_FOUND", 404);
    }
    return { ...category };
  }

  async getBrandFacets(categorySlug?: string): Promise<BrandFacet[]> {
    await delay(150);

    const counts = new Map<string, number>();
    for (const product of products) {
      if (categorySlug && product.categorySlug !== categorySlug) continue;
      counts.set(product.brandName, (counts.get(product.brandName) ?? 0) + 1);
    }
    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    );
  }

  async getProducts(query: CatalogQuery = {}): Promise<PaginatedResult<Product>> {
    await delay();

    const { categorySlug, sortBy = "popularity", filters, page = 1, pageSize = DEFAULT_PAGE_SIZE } = query;

    let result = products.filter((p) => !categorySlug || p.categorySlug === categorySlug);

    if (filters) result = result.filter((p) => matchesFilters(p, filters));

    const comparator = comparators[sortBy];
    if (comparator) result = [...result].sort(comparator);

    const total = result.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
      items: result.slice(start, start + pageSize).map((p) => ({ ...p })),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  }

  async getProductDetails(id: string): Promise<ProductDetails> {
    await delay();
    const details = productDetailsMap.get(id);
    if (!details) {
      throw new ServiceError("Product not found.", "NOT_FOUND", 404);
    }
    return { ...details };
  }

  async getRelatedProducts(id: string): Promise<Product[]> {
    await delay(200);
    const source = products.find((p) => p.id === id);
    if (!source) return [];
    return products
      .filter((p) => p.categorySlug === source.categorySlug && p.id !== id)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 8)
      .map((p) => ({ ...p }));
  }

  async getFrequentlyBoughtTogether(id: string): Promise<Product[]> {
    await delay(200);
    const source = products.find((p) => p.id === id);
    if (!source) return [];
    const sameCategory = products.filter((p) => p.categorySlug === source.categorySlug && p.id !== id);
    const crossCategory = products.filter((p) => p.categorySlug !== source.categorySlug);
    const picked: Product[] = [];
    const seen = new Set<string>([id]);
    for (const pool of [sameCategory, crossCategory]) {
      const sorted = [...pool].sort((a, b) => b.reviewCount - a.reviewCount);
      for (const p of sorted) {
        if (picked.length >= 3) break;
        if (!seen.has(p.id)) {
          seen.add(p.id);
          picked.push({ ...p });
        }
      }
    }
    return picked;
  }

  async getSearchSuggestions(q: string): Promise<SearchSuggestion[]> {
    await delay(150);
    const terms = parseSearchTerms(q);
    if (terms.length === 0) return [];

    const suggestions: SearchSuggestion[] = [];
    const seen = new Set<string>();

    // 1. Product name matches (max 5)
    for (const { product, text } of searchTextIndex) {
      if (suggestions.length >= 8) break;
      if (seen.has(product.id)) continue;
      if (productMatchesQuery(product, terms, text)) {
        seen.add(product.id);
        suggestions.push({
          id: product.id,
          text: product.name,
          type: "product",
          highlightRanges: suggestionHighlightRanges(product.name, terms),
        });
      }
    }

    // 2. Brand matches (max 3)
    const seenBrands = new Set<string>();
    for (const { product } of searchTextIndex) {
      if (suggestions.length >= 11 || seenBrands.size >= 3) break;
      const brand = product.brandName;
      if (seenBrands.has(brand)) continue;
      const brandLower = brand.toLowerCase();
      if (terms.some((t) => brandLower.includes(t))) {
        seenBrands.add(brand);
        suggestions.push({
          id: `brand-${brandLower.replace(/[^a-z0-9]+/g, "-")}`,
          text: brand,
          type: "brand",
          highlightRanges: suggestionHighlightRanges(brand, terms),
        });
      }
    }

    // 3. Category matches (max 3)
    const seenCats = new Set<string>();
    for (const cat of categories) {
      if (seenCats.size >= 3) break;
      const catLower = cat.title.toLowerCase();
      if (terms.some((t) => catLower.includes(t)) && !seenCats.has(cat.slug)) {
        seenCats.add(cat.slug);
        suggestions.push({
          id: cat.slug,
          text: cat.title,
          type: "category",
          highlightRanges: suggestionHighlightRanges(cat.title, terms),
        });
      }
    }

    // 4. Health concern matches (max 3)
    const seenConcerns = new Set<string>();
    for (const concern of healthConcerns) {
      if (seenConcerns.size >= 3) break;
      const concernText = `${concern.name} ${concern.keywords.join(" ")}`.toLowerCase();
      if (terms.some((t) => concernText.includes(t)) && !seenConcerns.has(concern.slug)) {
        seenConcerns.add(concern.slug);
        suggestions.push({
          id: `concern-${concern.slug}`,
          text: concern.name,
          type: "health_concern",
          highlightRanges: suggestionHighlightRanges(concern.name, terms),
        });
      }
    }

    return suggestions;
  }

  async searchProducts(query: SearchQuery): Promise<SearchResult> {
    await delay();
    const { q, sortBy = "popularity", filters, page = 1, pageSize = DEFAULT_PAGE_SIZE } = query;
    const terms = parseSearchTerms(q);

    // Filter products matching all search terms
    let matched = terms.length > 0
      ? products.filter((p) => {
          const text = productSearchText(p);
          return productMatchesQuery(p, terms, text);
        })
      : [...products];

    // Also match health concerns → include their related category products
    if (terms.length > 0) {
      const concernProductIds = new Set<string>();
      for (const concern of healthConcerns) {
        const concernText = `${concern.name} ${concern.keywords.join(" ")}`.toLowerCase();
        if (terms.some((t) => concernText.includes(t))) {
          for (const p of products) {
            if (concern.relatedCategorySlugs.includes(p.categorySlug)) {
              concernProductIds.add(p.id);
            }
          }
        }
      }
      for (const p of products) {
        if (concernProductIds.has(p.id) && !matched.some((m) => m.id === p.id)) {
          matched.push(p);
        }
      }
    }

    if (filters) matched = matched.filter((p) => matchesFilters(p, filters));

    const comparator = comparators[sortBy];
    if (comparator) matched = [...matched].sort(comparator);

    const total = matched.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;

    // Category facets for the full result set (before pagination)
    const catCounts = new Map<string, number>();
    for (const p of matched) {
      catCounts.set(p.categorySlug, (catCounts.get(p.categorySlug) ?? 0) + 1);
    }
    const categoryFacets = Array.from(catCounts, ([slug, count]) => ({
      slug,
      title: CATEGORY_TITLES[slug] ?? slug,
      count,
    })).sort((a, b) => b.count - a.count);

    return {
      items: matched.slice(start, start + pageSize).map((p) => ({ ...p })),
      total,
      page: safePage,
      pageSize,
      totalPages,
      query: q,
      categoryFacets,
    };
  }

  async getPopularSearches(): Promise<PopularSearch[]> {
    await delay(100);
    return [...popularSearches];
  }

  async getHealthConcerns(): Promise<HealthConcern[]> {
    await delay(100);
    return healthConcerns.map((c) => ({
      ...c,
      icon: c.icon,
    }));
  }

  /* ── Discovery: Brands ── */

  async getBrands(): Promise<BrandSummary[]> {
    await delay(200);
    return brandSummaryList.map((b) => ({ ...b }));
  }

  async getBrandBySlug(slug: string): Promise<BrandDetail> {
    await delay(200);
    const brand = brandMap.get(slug);
    if (!brand) throw new ServiceError("Brand not found.", "NOT_FOUND", 404);
    return { ...brand };
  }

  async getBrandProducts(slug: string, query?: DiscoveryQuery): Promise<PaginatedResult<Product>> {
    await delay(250);
    const items = getBrandProducts(slug);
    return paginateDiscovery(items, query);
  }

  /* ── Discovery: Collections ── */

  async getCollections(): Promise<Collection[]> {
    await delay(200);
    return collections.map((c) => ({ ...c }));
  }

  async getCollectionBySlug(slug: string): Promise<Collection> {
    await delay(200);
    const col = collectionMap.get(slug);
    if (!col) throw new ServiceError("Collection not found.", "NOT_FOUND", 404);
    return { ...col };
  }

  async getCollectionProducts(slug: CollectionSlug, query?: DiscoveryQuery): Promise<PaginatedResult<Product>> {
    await delay(250);
    const items = getCollectionProducts(slug);
    return paginateDiscovery(items, query);
  }

  /* ── Discovery: Health Concerns ── */

  async getHealthConcernBySlug(slug: string): Promise<HealthConcern> {
    await delay(200);
    const concern = healthConcerns.find((c) => c.slug === slug);
    if (!concern) throw new ServiceError("Health concern not found.", "NOT_FOUND", 404);
    return { ...concern, icon: concern.icon };
  }

  async getHealthConcernProducts(slug: string, query?: DiscoveryQuery): Promise<PaginatedResult<Product>> {
    await delay(250);
    const concern = healthConcerns.find((c) => c.slug === slug);
    if (!concern) return { items: [], total: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 1 };
    const items = products.filter((p) => concern.relatedCategorySlugs.includes(p.categorySlug));
    return paginateDiscovery(items, query);
  }

  /* ── Discovery: Recommendations ── */

  async getBestSellers(limit = 12): Promise<Product[]> {
    await delay(200);
    return products
      .filter((p) => p.isBestseller)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, limit)
      .map((p) => ({ ...p }));
  }

  async getTrending(limit = 12): Promise<Product[]> {
    await delay(200);
    return products
      .filter((p) => p.isTrending || p.reviewCount > 1000)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, limit)
      .map((p) => ({ ...p }));
  }

  async getNewArrivals(limit = 12): Promise<Product[]> {
    await delay(200);
    return products
      .filter((p) => p.isNew)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, limit)
      .map((p) => ({ ...p }));
  }

  async getSimilarProducts(id: string, limit = 8): Promise<Product[]> {
    await delay(200);
    const source = products.find((p) => p.id === id);
    if (!source) return [];
    return products
      .filter(
        (p) =>
          p.id !== id &&
          (p.categorySlug === source.categorySlug ||
            p.brandName.toLowerCase().includes(source.brandName.toLowerCase().split(" ")[0])),
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
      .map((p) => ({ ...p }));
  }

  async getRecentlyViewedProductIds(): Promise<string[]> {
    try {
      const raw = localStorage.getItem("keemeds-recently-viewed");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    await delay(150);
    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p != null)
      .map((p) => ({ ...p }));
  }
}

function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
