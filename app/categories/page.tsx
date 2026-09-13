import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";
import { getCategories } from "@/services/categoryService";
import CategoryExplorer from "./CategoryExplorer";
import { ChevronRight, ArrowRight, UserPlus, Users } from "lucide-react";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const metadata: Metadata = {
  title: "Service Categories - Local Mistris & Technicians | Sromojibi",
  description:
    "Explore verified worker categories including Rajmistri, Electrician, Plumber, Day Labour, Van Puller, and Technicians across Bangladesh with direct contact.",
  alternates: {
    canonical: `${siteUrl}/categories`,
  },
  openGraph: {
    title: "Service Categories - Local Mistris & Technicians | Sromojibi",
    description:
      "Explore verified worker categories including Rajmistri, Electrician, Plumber, Day Labour, Van Puller, and Technicians across Bangladesh with direct contact.",
    url: `${siteUrl}/categories`,
    siteName: "Sromojibi",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        alt: "Sromojibi Service Categories Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Service Categories - Local Mistris & Technicians | Sromojibi",
    description:
      "Explore verified worker categories including Rajmistri, Electrician, Plumber, Day Labour, Van Puller, and Technicians across Bangladesh with direct contact.",
    images: [`${siteUrl}/icon-512.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const totalWorkers = categories.reduce((acc, c) => acc + (c._count?.workers || 0), 0);

  // SEO Schema.org Structured Data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${siteUrl}/categories`,
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Service Categories - Sromojibi",
    description: "Verified trade and worker categories in Bangladesh on Sromojibi directory network",
    numberOfItems: categories.length,
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Sromojibi",
    },
    itemListElement: categories.map((cat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cat.name_bn ? `${cat.name} (${cat.name_bn})` : cat.name,
      url: `${siteUrl}/categories/${cat.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Structured Data Scripts for Google Search Engine Optimization */}
      <Script
        id="categories-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="categories-itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            হোম
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 font-semibold">ক্যাটাগরি তালিকা</span>
        </nav>

        {/* Directory Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              সার্ভিস ও পেশা ক্যাটাগরি ডিরেক্টরি
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              কাজের ধরন অনুযায়ী দক্ষ মিস্ত্রি, দিনমজুর, ভ্যান চালক ও সকল পেশার শ্রমজীবী খুঁজুন। সরাসরি যোগাযোগ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/workers"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>সকল কর্মী ({totalWorkers})</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
            <Link
              href="/join-worker"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>কর্মী হিসেবে যুক্ত হোন</span>
            </Link>
          </div>
        </div>

        {/* Interactive Category Search & Grid */}
        <CategoryExplorer categories={categories} />

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Sromojibi • ভেরিফাইড বাংলাদেশি শ্রমজীবী ও কর্মী ডিরেক্টরি নেটওয়ার্ক</span>
          <Link
            href="/workers"
            className="font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1"
          >
            <span>সকল কর্মীদের তালিকা দেখুন</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </main>
  );
}
