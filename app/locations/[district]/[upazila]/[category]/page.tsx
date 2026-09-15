import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerSearchFilter from "@/components/WorkerSearchFilter";
import {
  ChevronRight,
  MapPin,
  Wrench,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  Sparkles,
  HelpCircle,
  Tag,
  ArrowRight,
} from "lucide-react";

type Props = {
  params: { district: string; upazila: string; category: string };
};

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toSlug(name: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getCategory(categorySlug: string) {
  const decodedSlug = decodeURIComponent(categorySlug).toLowerCase().trim();
  return prisma.category.findFirst({
    where: {
      OR: [
        { slug: decodedSlug },
        { slug: toSlug(decodedSlug) },
        { name: { equals: decodedSlug, mode: "insensitive" } },
      ],
      is_active: true,
    },
  });
}

async function getUpazilaAndDistrict(districtParam: string, upazilaParam: string) {
  const decodedDistrict = decodeURIComponent(districtParam).toLowerCase().trim();
  const decodedUpazila = decodeURIComponent(upazilaParam).toLowerCase().trim();

  const formattedDistrict = formatSlug(decodedDistrict);
  const formattedUpazila = formatSlug(decodedUpazila);

  // 1. Direct query matching upazila and district
  const dbUpazila = await prisma.upazila.findFirst({
    where: {
      OR: [
        { title_en: { equals: formattedUpazila, mode: "insensitive" } },
        { title_bn: { equals: decodedUpazila } },
        { title_bn: { contains: formattedUpazila } },
      ],
      district: {
        OR: [
          { title_en: { equals: formattedDistrict, mode: "insensitive" } },
          { title: { equals: formattedDistrict, mode: "insensitive" } },
          { title_bn: { equals: decodedDistrict } },
          { title_bn: { contains: formattedDistrict } },
        ],
      },
    },
    include: {
      district: {
        include: { division: true },
      },
    },
  });

  if (dbUpazila) return { ...dbUpazila, isCityArea: false };

  // 2. Direct query matching city_area and district
  const dbCityArea = await prisma.cityArea.findFirst({
    where: {
      OR: [
        { title_en: { equals: formattedUpazila, mode: "insensitive" } },
        { title_bn: { equals: decodedUpazila } },
        { title_bn: { contains: formattedUpazila } },
      ],
      district: {
        OR: [
          { title_en: { equals: formattedDistrict, mode: "insensitive" } },
          { title: { equals: formattedDistrict, mode: "insensitive" } },
          { title_bn: { equals: decodedDistrict } },
          { title_bn: { contains: formattedDistrict } },
        ],
      },
    },
    include: {
      district: {
        include: { division: true },
      },
    },
  });

  if (dbCityArea) return { ...dbCityArea, isCityArea: true };

  // 3. Fallback: match via toSlug on Upazilas
  const allUpazilas = await prisma.upazila.findMany({
    include: {
      district: {
        include: { division: true },
      },
    },
  });

  const matchedUpz = allUpazilas.find((u) => {
    const uSlugMatch =
      toSlug(u.title_en) === decodedUpazila ||
      toSlug(u.title_bn) === decodedUpazila;
    const dSlugMatch =
      toSlug(u.district?.title_en) === decodedDistrict ||
      toSlug(u.district?.title_bn) === decodedDistrict ||
      toSlug(u.district?.title) === decodedDistrict;
    return uSlugMatch && dSlugMatch;
  });

  if (matchedUpz) return { ...matchedUpz, isCityArea: false };

  // 4. Fallback: match via toSlug on City Areas
  const allCityAreas = await prisma.cityArea.findMany({
    include: {
      district: {
        include: { division: true },
      },
    },
  });

  const matchedCityArea = allCityAreas.find((c) => {
    const cSlugMatch =
      toSlug(c.title_en) === decodedUpazila ||
      toSlug(c.title_bn) === decodedUpazila;
    const dSlugMatch =
      toSlug(c.district?.title_en) === decodedDistrict ||
      toSlug(c.district?.title_bn) === decodedDistrict ||
      toSlug(c.district?.title) === decodedDistrict;
    return cSlugMatch && dSlugMatch;
  });

  if (matchedCityArea) return { ...matchedCityArea, isCityArea: true };

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [dbUpazila, category] = await Promise.all([
    getUpazilaAndDistrict(params.district, params.upazila),
    getCategory(params.category),
  ]);

  if (!dbUpazila || !category) {
    return {
      title: "Category Location Not Found | Sromojibi.com",
    };
  }

  const upazilaName = dbUpazila.title_en || formatSlug(params.upazila);
  const districtName = dbUpazila.district?.title_en || formatSlug(params.district);
  const upazilaNameBn = dbUpazila.title_bn || upazilaName;
  const districtNameBn = dbUpazila.district?.title_bn || districtName;
  const categoryNameBn = category.name_bn || category.name;
  const categoryNameEn = category.name;
  const areaLabelBn = dbUpazila.isCityArea ? "সিটি এলাকা" : "উপজেলা";

  const title = `${upazilaNameBn}-এ অভিজ্ঞ ${categoryNameBn} মিস্ত্রি | Hire ${categoryNameEn} in ${upazilaName}, ${districtName}`;
  const description = `${districtNameBn} জেলার ${upazilaNameBn} ${areaLabelBn}য় অভিজ্ঞ ও বিশ্বস্ত ${categoryNameBn} (${categoryNameEn}) মিস্ত্রি ও টেকনিশিয়ানদের সরাসরি ফোন নাম্বার এবং কন্টাক্ট ডিরেক্টরি। কোনো তৃতীয় পক্ষ বা কমিশন ছাড়াই সরাসরি বুকিং করুন।`;
  const canonicalUrl = `${siteUrl}/locations/${params.district}/${params.upazila}/${params.category}`;

  return {
    title,
    description,
    keywords: [
      `${categoryNameBn} ${upazilaNameBn}`,
      `${categoryNameEn} in ${upazilaName}`,
      `${categoryNameBn} ${districtNameBn}`,
      `${upazilaNameBn} মিস্ত্রি`,
      `${categoryNameEn} contact number ${upazilaName}`,
      `শ্রমজীবী ${upazilaNameBn}`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Sromojibi.com",
      locale: "bn_BD",
      type: "website",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${categoryNameBn} in ${upazilaNameBn}, ${districtNameBn}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryLocationPage({ params }: Props) {
  const [dbUpazila, category] = await Promise.all([
    getUpazilaAndDistrict(params.district, params.upazila),
    getCategory(params.category),
  ]);

  if (!dbUpazila || !category) {
    notFound();
  }

  const upazilaName = dbUpazila.title_en || formatSlug(params.upazila);
  const districtName = dbUpazila.district?.title_en || formatSlug(params.district);
  const upazilaNameBn = dbUpazila.title_bn || upazilaName;
  const districtNameBn = dbUpazila.district?.title_bn || districtName;
  const divisionNameBn = dbUpazila.district?.division?.title_bn || "";
  const categoryNameBn = category.name_bn || category.name;
  const categoryNameEn = category.name;
  const areaLabelBn = dbUpazila.isCityArea ? "সিটি এলাকা" : "উপজেলা";

  // Fetch other active categories for cross-service navigation
  const allCategories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
  });

  const divisions = await prisma.division.findMany({
    orderBy: { title_en: "asc" },
    select: { id: true, title_en: true, title_bn: true },
  });

  const locations = divisions.map((d) => ({
    id: d.id,
    name: d.title_en || d.title_bn || "",
  }));

  // 1. Query exact workers matching BOTH the location scope and this specific category
  const exactCategoryWorkers = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      workerCategories: {
        some: { fk_category_id: category.id },
      },
      OR: [
        ...(dbUpazila.isCityArea
          ? [{ fk_city_area_id: dbUpazila.id }]
          : [{ fk_upazila_id: dbUpazila.id }]),
        ...(dbUpazila.loc_district_id
          ? [
              {
                fk_district_id: dbUpazila.loc_district_id,
                coverage_scope: "ALL_DISTRICT" as const,
              },
            ]
          : []),
        { coverage_scope: "NATIONWIDE" as const },
      ],
    },
    orderBy: { created_at: "desc" },
    include: {
      workerCategories: {
        select: {
          category: { select: { icon: true, name: true, name_bn: true } },
        },
      },
      divisionRef: { select: { title_en: true, title_bn: true } },
      districtRef: { select: { title_en: true, title_bn: true, title: true } },
      upazilaRef: { select: { title_en: true, title_bn: true } },
      cityAreaRef: { select: { title_en: true, title_bn: true } },
    },
  });

  // 2. If no exact workers, query district or nationwide category workers as helpful fallbacks
  const fallbackWorkers =
    exactCategoryWorkers.length === 0
      ? await prisma.workerProfile.findMany({
          where: {
            status: "APPROVED",
            workerCategories: {
              some: { fk_category_id: category.id },
            },
          },
          take: 6,
          orderBy: { rating: "desc" },
          include: {
            workerCategories: {
              select: {
                category: { select: { icon: true, name: true, name_bn: true } },
              },
            },
            divisionRef: { select: { title_en: true, title_bn: true } },
            districtRef: { select: { title_en: true, title_bn: true, title: true } },
            upazilaRef: { select: { title_en: true, title_bn: true } },
            cityAreaRef: { select: { title_en: true, title_bn: true } },
          },
        })
      : [];

  const displayWorkers =
    exactCategoryWorkers.length > 0 ? exactCategoryWorkers : fallbackWorkers;

  const serializedWorkers = displayWorkers.map((w: any) => {
    const cats = w.workerCategories?.map((wc: any) => wc.category) || [];
    const city = w.divisionRef?.title_en || w.divisionRef?.title_bn || "Bangladesh";
    const zilla = w.districtRef?.title_en || w.districtRef?.title_bn || w.districtRef?.title || null;
    const upazila = w.cityAreaRef?.title_en || w.upazilaRef?.title_en || w.upazilaRef?.title_bn || null;
    return {
      ...w,
      city,
      zilla,
      upazila,
      rating: Number(w.rating),
      categories: cats,
      category: cats[0] ?? null,
      service_type: cats.length > 0 ? cats.map((c: any) => c.name_bn || c.name).join(", ") : categoryNameBn,
    };
  });

  // Localized Bengali FAQs specific to this category + location
  const faqs = [
    {
      question: `${upazilaNameBn} এলাকায় ${categoryNameBn} মিস্ত্রির সাথে কীভাবে যোগাযোগ করব?`,
      answer: `শ্রমজীবী ডিরেক্টরিতে ${upazilaNameBn} ও ${districtNameBn} এলাকার তালিকাভুক্ত ${categoryNameBn} মিস্ত্রিদের প্রোফাইল থেকে সরাসরি "ফোন নম্বর দেখুন" বাটনে ক্লিক করে কোনো মধ্যস্থতাকারী ছাড়াই যোগাযোগ করতে পারবেন।`,
    },
    {
      question: `${upazilaNameBn}-এ ${categoryNameBn}র কাজের পারিশ্রমিক বা রেট কত?`,
      answer: `কাজের ধরন, পরিমাপ ও জটিলতা অনুযায়ী পারিশ্রমিক আলোচনা সাপেক্ষে নির্ধারিত হয়। সরাসরি কারিগরের সাথে কথা বলে কাজের পূর্বে সঠিক বাজেট ও সময় নিশ্চিত করে নিন।`,
    },
    {
      question: `আমি কি ${upazilaNameBn} এলাকায় জরুরি প্রয়োজনে ${categoryNameBn} ডাকতে পারি?`,
      answer: `হ্যাঁ, শ্রমজীবীর তালিকাভুক্ত বেশিরভাগ স্থানীয় মিস্ত্রি দ্রুত সাড়া দিয়ে থাকেন। প্রোফাইলে সরাসরি কল করে তাদের তাৎক্ষণিক প্রাপ্যতা (availability) জেনে নিতে পারেন।`,
    },
  ];

  // Schema.org Structured Data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Locations", item: `${siteUrl}/locations` },
      { "@type": "ListItem", position: 3, name: `${districtName} District`, item: `${siteUrl}/locations/${params.district}` },
      { "@type": "ListItem", position: 4, name: `${upazilaName} ${areaLabelBn}`, item: `${siteUrl}/locations/${params.district}/${params.upazila}` },
      { "@type": "ListItem", position: 5, name: categoryNameBn, item: `${siteUrl}/locations/${params.district}/${params.upazila}/${params.category}` },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryNameEn} in ${upazilaName}, ${districtName}, Bangladesh`,
    description: `Find verified ${categoryNameEn} (${categoryNameBn}) workers, mistris, and technicians in ${upazilaName}, ${districtName}.`,
    url: `${siteUrl}/locations/${params.district}/${params.upazila}/${params.category}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: exactCategoryWorkers.length,
      itemListElement: displayWorkers.slice(0, 10).map((w: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: w.full_name,
        url: `${siteUrl}/workers/${w.slug}`,
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Schema.org Structured Data */}
      <Script
        id={`cat-loc-${params.district}-${params.upazila}-${params.category}-breadcrumb-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`cat-loc-${params.district}-${params.upazila}-${params.category}-collection-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Script
        id={`cat-loc-${params.district}-${params.upazila}-${params.category}-faq-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Breadcrumb Header */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/locations" className="hover:text-emerald-600 transition-colors">Locations</Link>
          {divisionNameBn && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600">{divisionNameBn} বিভাগ</span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/locations/${params.district}`} className="hover:text-emerald-600 transition-colors">
            {districtNameBn} জেলা
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/locations/${params.district}/${params.upazila}`} className="hover:text-emerald-600 transition-colors">
            {upazilaNameBn} {areaLabelBn}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{categoryNameBn}</span>
        </nav>

        {/* Hero Section */}
        <header className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              {categoryNameBn} ({categoryNameEn})
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {upazilaNameBn} ({upazilaName}) • {districtNameBn}
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            <span>{categoryNameEn} in {upazilaName}</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-2">
              {upazilaNameBn}-এ দক্ষ {categoryNameBn} মিস্ত্রি ও কারিগর
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {districtNameBn} জেলার {upazilaNameBn} {areaLabelBn}য় অভিজ্ঞ ও বিশ্বস্ত {categoryNameBn} খুঁজছেন? সরাসরি প্রোফাইল দেখুন, রিভিউ চেক করুন এবং কোনো ফি বা চার্জ ছাড়াই সরাসরি কথা বলুন।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {exactCategoryWorkers.length} জন কারিগর
                </div>
                <div className="text-xs text-slate-500">
                  {upazilaNameBn} এলাকায় প্রস্তুত
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">সরাসরি ফোন করুন</div>
                <div className="text-xs text-slate-500">০% কমিশন বা অতিরিক্ত ফি</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">যাচাইকৃত প্রোফাইল</div>
                <div className="text-xs text-slate-500">লোকাল অভিজ্ঞ কারিগর</div>
              </div>
            </div>
          </div>
        </header>

        {/* Other Services in this Area (Internal Cross-Linking) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {upazilaNameBn} এলাকার অন্যান্য সেবা ও মিস্ত্রি:
            </h2>
            <Link
              href={`/locations/${params.district}/${params.upazila}`}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              সব সেবা দেখুন <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {allCategories.slice(0, 10).map((cat) => {
              const isCurrent = cat.slug === category.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/locations/${params.district}/${params.upazila}/${cat.slug}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isCurrent
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                >
                  {cat.name_bn || cat.name}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Thin-Content Safeguard Alert (When 0 exact matches in upazila) */}
        {exactCategoryWorkers.length === 0 && (
          <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-base text-amber-900">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
              {upazilaNameBn} এলাকায় বর্তমানে সরাসরি কোনো {categoryNameBn} মিস্ত্রি তালিকাভুক্ত নেই
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">
              তবে আপনি {districtNameBn} জেলা বা পার্শ্ববর্তী এলাকার অভিজ্ঞ {categoryNameBn} মিস্ত্রিদের সাথে কথা বলতে পারেন। নিচে নিকটবর্তী ভেরিফাইড কারিগরদের তালিকা দেওয়া হলো।
            </p>
            <div className="pt-1">
              <Link
                href="/join-worker"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
              >
                আপনি কি {upazilaNameBn}-এ {categoryNameBn}? বিনামূল্যে প্রোফাইল খুলুন <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Search and Worker Directory List */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {upazilaNameBn}-এ {categoryNameBn} তালিকা ({displayWorkers.length} জন)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                সরাসরি ফোন করে কথা বলুন ও কাজ বুক করুন
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
              লোকেশন: {upazilaNameBn}, {districtNameBn}
            </div>
          </div>

          <WorkerSearchFilter
            initialWorkers={serializedWorkers}
            categories={allCategories.map((c) => ({
              id: c.id,
              name: c.name,
              name_bn: c.name_bn,
              slug: c.slug,
            }))}
            locations={locations}
          />
        </section>

        {/* Frequently Asked Questions */}
        <section className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> সাধারণ প্রশ্নোত্তর
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {upazilaNameBn}-এ {categoryNameBn} মিস্ত্রি সেবা সম্পর্কিত তথ্য
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between"
              >
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {faq.question}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
