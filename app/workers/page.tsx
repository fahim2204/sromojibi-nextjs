import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerSearchFilter from "@/components/WorkerSearchFilter";
import { ChevronRight, Briefcase, PhoneCall, ShieldCheck, MapPin } from "lucide-react";

import Script from "next/script";

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const metadata: Metadata = {
  title: "Workers Directory - Discover Local Mistris & Technicians | Sromojibi",
  description:
    "Explore Bangladesh's verified local worker directory. Discover electricians, plumbers, tiles mistris, rajmistris, painters and technicians near you on Sromojibi.",
  alternates: {
    canonical: `${siteUrl}/workers`,
  },
  openGraph: {
    title: "Workers Directory - Discover Local Mistris & Technicians | Sromojibi",
    description:
      "Explore Bangladesh's verified local worker directory. Discover electricians, plumbers, tiles mistris, rajmistris, painters and technicians near you on Sromojibi.",
    url: `${siteUrl}/workers`,
    siteName: "Sromojibi",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
        alt: "Sromojibi Workers Directory Bangladesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Workers Directory - Discover Local Mistris & Technicians | Sromojibi",
    description:
      "Explore Bangladesh's verified local worker directory. Discover electricians, plumbers, tiles mistris, rajmistris, painters and technicians near you on Sromojibi.",
    images: [`${siteUrl}/icon-512.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function WorkersDirectoryPage() {
  // 1. Fetch active categories from DB
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
  });

  // 2. Fetch divisions and districts for locations filter
  const divisions = await prisma.division.findMany({
    orderBy: { title_en: "asc" },
    include: {
      districts: {
        orderBy: { title_en: "asc" },
      },
    },
  });

  const locations = divisions.map((d) => ({
    id: d.id,
    name: d.title_en || d.title || "",
    name_bn: d.title_bn,
    slug: (d.title_en || d.title || "").toLowerCase().replace(/\s+/g, "-"),
  }));

  // 3. Fetch all approved worker profiles from DB
  const rawWorkers = await prisma.workerProfile.findMany({
    where: { status: "APPROVED" },
    orderBy: { created_at: "desc" },
    include: {
      workerCategories: {
        include: {
          category: {
            select: { id: true, name: true, name_bn: true, icon: true, slug: true },
          },
        },
      },
      divisionRef: true,
      districtRef: true,
      upazilaRef: true,
      cityAreaRef: true,
      unionRef: true,
    },
  });

  // Serialize workers with resolved names from normalized DB relations
  const serializedWorkers = rawWorkers.map((w) => {
    const workerCats = w.workerCategories.map((wc) => wc.category);
    const primaryCat = workerCats[0] || null;
    const serviceType = workerCats.length > 0
      ? workerCats.map((c) => c.name_bn || c.name).join(", ")
      : "কারিগর";

    const city = w.divisionRef?.title_bn || w.divisionRef?.title_en || "বাংলাদেশ";
    const zilla = w.districtRef?.title_bn || w.districtRef?.title_en || null;
    const upazila = w.cityAreaRef?.title_bn || w.cityAreaRef?.title_en || w.upazilaRef?.title_bn || w.upazilaRef?.title_en || null;

    return {
      id: w.id,
      full_name: w.full_name,
      slug: w.slug,
      service_type: serviceType,
      city,
      zilla,
      upazila,
      coverage_scope: w.coverage_scope,
      experience: w.experience,
      details: w.details,
      is_verified: w.is_verified,
      rating: Number(w.rating ?? 5.0),
      review_count: w.review_count,
      category: primaryCat ? { name: primaryCat.name, icon: primaryCat.icon } : null,
      categories: workerCats,
    };
  });

  // SEO Schema.org Structured Data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Workers", item: `${siteUrl}/workers` },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Workers Directory - Sromojibi",
    description: "Verified local mistris, technicians, and skilled workers across Bangladesh",
    numberOfItems: rawWorkers.length,
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Sromojibi",
    },
    itemListElement: rawWorkers.slice(0, 20).map((w, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: w.full_name,
      url: `${siteUrl}/workers/${w.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Schema.org Structured Data Scripts */}
      <Script
        id="workers-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="workers-itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Breadcrumb Header */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">মিস্ত্রি ডিরেক্টরি (Workers Directory)</span>
        </nav>

        {/* Directory Hero Header */}
        <header className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            Sromojibi Workers Directory
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            <span>Discover Skilled Local Workers</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              বাংলাদেশের দক্ষ মিস্ত্রি ও টেকনিশিয়ানদের খুঁজুন
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            সরাসরি ফোন নম্বরে যোগাযোগের মাধ্যমে আপনার এলাকার ইলেকট্রিশিয়ান, প্লাম্বার, রাজমিস্ত্রি, এসি মেকানিক ও অভিজ্ঞ কারিগরদের সাথে যুক্ত হোন। কোনো মধ্যবর্তী চার্জ বা অতিরিক্ত ফি ছাড়াই।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">সরাসরি ফোন কল</div>
                <div className="text-xs text-slate-500">সরাসরি কথা বলে রেট নির্ধারণ</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">ভেরিফাইড কারিগর</div>
                <div className="text-xs text-slate-500">প্রোফাইল যাচাইকৃত তালিকা</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-cyan-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">এলাকা ভিত্তিক সার্চ</div>
                <div className="text-xs text-slate-500">বিভাগ ও জেলা অনুযায়ী ফিল্টার</div>
              </div>
            </div>
          </div>
        </header>

        {/* Live Search, Filter & Paginated Workers Showcase */}
        <section aria-labelledby="workers-directory-heading" className="space-y-6">
          <WorkerSearchFilter
            initialWorkers={serializedWorkers}
            categories={categories}
            locations={locations}
          />
        </section>

        {/* Worker CTA Banner */}
        <section className="p-8 rounded-3xl bg-white border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">আপনি কি একজন দক্ষ কারিগর বা মিস্ত্রি?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              আজই শ্রমজীবী প্ল্যাটফর্মে আপনার ফ্রি প্রোফাইল তৈরি করুন এবং আপনার এলাকায় নতুন গ্রাহকদের সরাসরি কাজ পান।
            </p>
          </div>
          <Link
            href="/join-worker"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shrink-0 transition-all shadow-sm"
          >
            ফ্রি রেজিস্ট্রেশন করুন →
          </Link>
        </section>
      </div>
    </main>
  );
}
