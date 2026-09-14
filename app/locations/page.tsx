import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCached, CACHE_TTL } from "@/lib/cache";
import LocationDirectoryExplorer from "./LocationDirectoryExplorer";
import { ChevronRight, ArrowLeft } from "lucide-react";

export const revalidate = 86400; // Cache for 24 hours

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const metadata: Metadata = {
  title: "বাংলাদেশ লোকেশন ডিরেক্টরি | সব জেলা ও উপজেলার শ্রমজীবী নেটওয়ার্ক - Sromojibi",
  description:
    "বাংলাদেশের ৮টি বিভাগ, ৬৪টি জেলা ও ৫০৯টি উপজেলার স্থানীয় দক্ষ ইলেকট্রিশিয়ান, প্লাম্বার, রাজমিস্ত্রি ও কারিগরদের সাথে সরাসরি যোগাযোগ করুন।",
  alternates: {
    canonical: `${siteUrl}/locations`,
  },
  openGraph: {
    title: "বাংলাদেশ লোকেশন ডিরেক্টরি - Sromojibi",
    description:
      "বাংলাদেশের সকল বিভাগ, জেলা ও উপজেলার অভিজ্ঞ মিস্ত্রি ও কারিগরদের সাথে যোগাযোগের ডিরেক্টরি।",
    url: `${siteUrl}/locations`,
    siteName: "Sromojibi (শ্রমজীবী)",
    locale: "bn_BD",
    type: "website",
  },
};

export default async function LocationsPage() {
  // Fetch full location hierarchy with caching
  const divisions = await getCached(
    "locations:full_hierarchy_directory",
    CACHE_TTL.ONE_DAY,
    async () => {
      return await prisma.division.findMany({
        orderBy: { title_en: "asc" },
        select: {
          id: true,
          title_en: true,
          title_bn: true,
          districts: {
            orderBy: { title_en: "asc" },
            select: {
              id: true,
              title_en: true,
              title_bn: true,
              upazilas: {
                orderBy: { title_en: "asc" },
                select: {
                  id: true,
                  title_en: true,
                  title_bn: true,
                },
              },
              city_areas: {
                where: { row_status: 1 },
                orderBy: { title_en: "asc" },
                select: {
                  id: true,
                  title_en: true,
                  title_bn: true,
                },
              },
            },
          },
        },
      });
    }
  );

  const totalDistricts = divisions.reduce((acc, div) => acc + div.districts.length, 0);
  const totalUpazilas = divisions.reduce((acc, div) => {
    return acc + div.districts.reduce((dAcc, dist) => dAcc + dist.upazilas.length, 0);
  }, 0);
  const totalCityAreas = divisions.reduce((acc, div) => {
    return acc + div.districts.reduce((dAcc, dist) => dAcc + (dist.city_areas?.length || 0), 0);
  }, 0);
  const totalUnions = 4536;

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "হোম",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "লোকেশন ডিরেক্টরি",
        item: `${siteUrl}/locations`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"
        >
          <Link href="/" className="hover:text-emerald-700 transition-colors">
            হোম
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-900 font-semibold">লোকেশন ও সেবা অঞ্চল</span>
        </nav>

        {/* Header Hero Section */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            ভৌগোলিক কভারেজ ও এলাকা ভিত্তিক সেবা
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            বাংলাদেশ লোকেশন ডিরেক্টরি
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
            বাংলাদেশের ৮টি প্রশাসনিক বিভাগ, ৬৪টি জেলা, ৫০৯টি উপজেলা এবং প্রধান মেট্রোপলিটন সিটির ২৬টি এলাকার স্থানীয় দক্ষ ইলেকট্রিশিয়ান, প্লাম্বার, রাজমিস্ত্রি ও কারিগরদের সাথে সরাসরি যোগাযোগ করতে নিচের জেলা, উপজেলা বা সিটি এলাকা নির্বাচন করুন।
          </p>
        </header>

        {/* Main Interactive Location Hierarchy Explorer */}
        <LocationDirectoryExplorer
          divisions={divisions}
          totalDistricts={totalDistricts}
          totalUpazilas={totalUpazilas}
          totalCityAreas={totalCityAreas}
          totalUnions={totalUnions}
        />

        {/* Footer Navigation */}
        <footer className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <Link
            href="/workers"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল শ্রমজীবী তালিকা দেখুন</span>
          </Link>

          <Link
            href="/categories"
            className="text-emerald-700 hover:underline"
          >
            ক্যাটাগরি ভিত্তিক সেবা খুঁজুন →
          </Link>
        </footer>
      </div>
    </main>
  );
}
