import Link from "next/link";
import { Metadata } from "next";
import { getCategories } from "@/services/categoryService";
import CategoryExplorer from "./CategoryExplorer";
import { ChevronRight, ArrowRight, UserPlus, Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Service Categories | কাজের ধরন অনুযায়ী কর্মী ও শ্রমজীবী ডিরেক্টরি | Sromojibi",
  description:
    "Explore worker service categories including Rajmistri, Electrician, Plumber, Day Labour, Shifting Labour, Van Puller, Painter, Carpenter, and Technicians in Bangladesh.",
  alternates: {
    canonical: "/categories",
  },
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const totalWorkers = categories.reduce((acc, c) => acc + (c._count?.workers || 0), 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
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
