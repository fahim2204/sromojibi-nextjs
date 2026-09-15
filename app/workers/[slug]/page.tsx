import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerProfileActions from "@/components/WorkerProfileActions";
import WorkerReviewSection from "@/components/WorkerReviewSection";
import {
  ChevronRight,
  MapPin,
  Award,
  ShieldCheck,
  Star,
  UserCheck,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
} from "lucide-react";

type Props = {
  params: { slug: string };
};

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug.toLowerCase();

  const worker = await prisma.workerProfile.findUnique({
    where: { slug },
    include: {
      workerCategories: {
        include: {
          category: { select: { name: true, name_bn: true } },
        },
      },
      divisionRef: true,
      districtRef: true,
      upazilaRef: true,
      cityAreaRef: true,
    },
  });

  if (!worker) {
    return {
      title: "Worker Profile Not Found | Sromojibi",
      description: "The requested worker profile could not be found in Sromojibi directory.",
    };
  }

  const categories = worker.workerCategories.map((wc) => wc.category);
  const serviceType = categories[0]?.name_bn || categories[0]?.name || "দক্ষ মিস্ত্রি";
  const city = worker.districtRef?.title_bn || worker.divisionRef?.title_bn || worker.districtRef?.title_en || worker.divisionRef?.title_en || "বাংলাদেশ";

  const title = `${worker.full_name} - ${serviceType} in ${city} | Sromojibi (শ্রমজীবী)`;
  const description = `${worker.full_name} - ${worker.experience} বছর অভিজ্ঞতা সম্পন্ন ${serviceType} (${city})। সরাসরি ফোন কলে যোগাযোগ করুন ও নির্ভরযোগ্য সেবা গ্রহণ করুন শ্রমজীবী প্ল্যাটফর্মে।`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/workers/${worker.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/workers/${worker.slug}`,
      siteName: "Sromojibi",
      locale: "bn_BD",
      type: "profile",
      images: [
        {
          url: worker.avatar_url || `${siteUrl}/icon-512.png`,
          width: 512,
          height: 512,
          alt: `${worker.full_name} - ${serviceType} in ${city}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [worker.avatar_url || `${siteUrl}/icon-512.png`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function WorkerProfilePage({ params }: Props) {
  const slug = params.slug.toLowerCase();

  // Fetch full worker profile details
  const worker = await prisma.workerProfile.findUnique({
    where: { slug },
    include: {
      workerCategories: {
        include: {
          category: true,
        },
      },
      divisionRef: true,
      districtRef: true,
      upazilaRef: true,
      cityAreaRef: true,
      unionRef: true,
      reviews: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!worker) {
    notFound();
  }

  const categories = worker.workerCategories.map((wc) => wc.category);
  const primaryCategory = categories[0] || null;
  const serviceType = primaryCategory?.name_bn || primaryCategory?.name || "কারিগর";

  const city = worker.divisionRef?.title_bn || worker.divisionRef?.title_en || "বাংলাদেশ";
  const zilla = worker.districtRef?.title_bn || worker.districtRef?.title_en || null;
  const upazila = worker.cityAreaRef?.title_bn || worker.cityAreaRef?.title_en || worker.upazilaRef?.title_bn || worker.upazilaRef?.title_en || null;
  const union = worker.unionRef?.title_bn || worker.unionRef?.title_en || null;
  const locationDisplay = upazila || zilla || city;

  // Fetch related/recommended approved workers (same category or district/division)
  const catIds = categories.map((c) => c.id);
  const relatedWorkersRaw = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      id: { not: worker.id },
      OR: [
        ...(catIds.length > 0 ? [{ workerCategories: { some: { fk_category_id: { in: catIds } } } }] : []),
        ...(worker.fk_district_id ? [{ fk_district_id: worker.fk_district_id }] : []),
        ...(worker.fk_division_id ? [{ fk_division_id: worker.fk_division_id }] : []),
      ],
    },
    take: 3,
    orderBy: { rating: "desc" },
    include: {
      workerCategories: {
        include: {
          category: true,
        },
      },
      divisionRef: true,
      districtRef: true,
      upazilaRef: true,
      cityAreaRef: true,
    },
  });

  const relatedWorkers = relatedWorkersRaw.map((rw) => {
    const rwCats = rw.workerCategories.map((wc) => wc.category);
    const rwPrimary = rwCats[0];
    return {
      ...rw,
      service_type: rwPrimary?.name_bn || rwPrimary?.name || "মিস্ত্রি",
      city: rw.districtRef?.title_bn || rw.divisionRef?.title_bn || "বাংলাদেশ",
      experienceDisplay: `${rw.experience} বছর অভিজ্ঞতা`,
    };
  });

  // Generate Schema.org structured data for SEO (LocalBusiness / Person)
  const workerSkills = categories.map((c) => c.name_bn || c.name);
  const areasServedList = Array.from(
    new Set(
      [locationDisplay, zilla, city, "Bangladesh"].filter(
        (loc): loc is string => Boolean(loc)
      )
    )
  );

  const workerSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/workers/${worker.slug}/#worker`,
    name: worker.full_name,
    description: worker.details || `${serviceType} services in ${city}`,
    url: `${siteUrl}/workers/${worker.slug}`,
    image: worker.avatar_url || `${siteUrl}/icon-512.png`,
    priceRange: "৳৳ (Negotiable / আলোচনা সাপেক্ষে)",
    currenciesAccepted: "BDT",
    paymentAccepted: "Cash, bKash, Nagad, Mobile Banking",
    knowsAbout: workerSkills,
    areaServed: areasServedList.map((loc) => ({
      "@type": "AdministrativeArea",
      name: loc,
    })),
    address: {
      "@type": "PostalAddress",
      addressLocality: locationDisplay || undefined,
      addressRegion: zilla || city || undefined,
      addressCountry: "BD",
    },
    parentOrganization: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Sromojibi",
    },
    aggregateRating:
      worker.review_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(worker.rating ?? 5.0).toFixed(1),
            reviewCount: worker.review_count,
            bestRating: "5",
            worstRating: "1",
          }
        : undefined,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Workers", item: `${siteUrl}/workers` },
      { "@type": "ListItem", position: 3, name: worker.full_name, item: `${siteUrl}/workers/${worker.slug}` },
    ],
  };

  const ratingVal = Number(worker.rating ?? 5.0).toFixed(1);
  const iconEmoji = primaryCategory?.icon || "👷‍♂️";

  // Skill tags based on trade
  const skillChips = [
    serviceType,
    ...categories.slice(1).map((c) => c.name_bn || c.name),
    `${city} কভারেজ`,
    "জরুরি হোম সার্ভিস",
    "সরাসরি ফোন সার্ভিস",
    `${worker.experience} বছর অভিজ্ঞতা`,
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pt-5 pb-24 sm:py-10 px-3.5 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      {/* Schema.org Structured Data */}
      <Script
        id={`worker-${worker.slug}-breadcrumb-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id={`worker-${worker.slug}-localbusiness-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workerSchema) }}
      />

      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            হোম (Home)
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link href="/workers" className="hover:text-emerald-600 transition-colors">
            মিস্ত্রি ডিরেক্টরি
          </Link>
          {primaryCategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link
                href={`/categories/${primaryCategory.slug}`}
                className="hover:text-emerald-600 transition-colors truncate max-w-[120px] sm:max-w-none"
              >
                {primaryCategory.name_bn || primaryCategory.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-bold truncate max-w-[140px] sm:max-w-none">
            {worker.full_name}
          </span>
        </nav>

        {/* Worker Hero Profile Header Card */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-sm sm:shadow-md p-4 sm:p-8 space-y-5 sm:space-y-6">
          {/* Top Decorative Background Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 sm:h-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pt-1 sm:pt-2">
            <div className="flex items-start gap-3.5 sm:gap-5 w-full sm:w-auto">
              {/* Avatar Icon */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 border-2 border-emerald-300 flex items-center justify-center font-black text-2xl sm:text-4xl shadow-inner">
                  {iconEmoji}
                </div>
                {worker.is_verified && (
                  <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 bg-emerald-600 text-white rounded-full p-1 sm:p-1.5 shadow-md border-2 border-white" title="Verified Worker">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>

              {/* Name & Basic Info */}
              <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight break-words">
                    {worker.full_name}
                  </h1>
                  {worker.is_verified ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] sm:text-xs font-bold flex items-center gap-1 shrink-0">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      ভেরিফাইড মিস্ত্রি
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] sm:text-xs font-semibold shrink-0">
                      তালিকাভুক্ত কারিগর
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-emerald-600 flex flex-wrap items-center gap-1 sm:gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{serviceType}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">{locationDisplay}</span>
                </p>

                {/* Rating & Reviews summary */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5">
                  <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{ratingVal} / 5.0</span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    ({worker.review_count}টি কাস্টমার রিভিউ)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Tag */}
            <div className="shrink-0 flex items-center sm:items-end justify-between w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-transparent">
              <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                সেবায় প্রস্তুত (Available)
              </span>
            </div>
          </div>

          {/* Action Buttons Component */}
          <div className="pt-2 border-t border-slate-100">
            <WorkerProfileActions
              workerId={worker.id}
              workerSlug={worker.slug}
              fullName={worker.full_name}
              serviceType={serviceType}
            />
          </div>
        </section>

        {/* Highlights Stat Cards Grid */}
        <section aria-label="Worker Stats" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs font-semibold">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">অভিজ্ঞতা (Exp.)</span>
            </div>
            <p className="text-sm sm:text-lg font-black text-slate-900">
              {worker.experience} বছর
            </p>
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs font-semibold">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="truncate">এলাকা (Location)</span>
            </div>
            <p className="text-sm sm:text-lg font-black text-slate-900 truncate" title={locationDisplay}>
              {locationDisplay}
            </p>
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs font-semibold">
              <Wrench className="w-4 h-4 text-cyan-600 shrink-0" />
              <span className="truncate">সেবার ধরণ</span>
            </div>
            <p className="text-sm sm:text-lg font-black text-slate-900 truncate" title={serviceType}>
              {serviceType}
            </p>
          </div>

          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">ভেরিফিকেশন</span>
            </div>
            <p className="text-sm sm:text-lg font-black text-emerald-700 truncate">
              {worker.is_verified ? "ভেরিফাইড" : "তালিকাভুক্ত"}
            </p>
          </div>
        </section>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column (Main Details & Reviews) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Service & Skill Details Card */}
            <section className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs sm:shadow-sm space-y-4 sm:space-y-6">
              <div className="space-y-1 sm:space-y-2 border-b border-slate-100 pb-3 sm:pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>🛠️</span> সেবা ও দক্ষতার বিবরণ (Services & Specialty)
                </h2>
                <p className="text-xs text-slate-500">
                  {worker.full_name} এর প্রদানকৃত সার্ভিস ও কাজের অভিজ্ঞতা
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {worker.details ||
                    `${worker.full_name} একজন দক্ষ ${serviceType}। তিনি ${locationDisplay} এবং আশেপাশের এলাকায় বিশ্বস্ততার সাথে বাসাবাড়ি ও অফিসের সেবা প্রদান করে আসছেন।`}
                </div>

                {/* Skill Chips */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    বিশেষ দক্ষতা সমূহ (Key Specialty)
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {skillChips.map((chip, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] sm:text-xs font-semibold"
                      >
                        ✓ {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs sm:shadow-sm">
              <WorkerReviewSection
                workerSlug={worker.slug}
                initialReviews={worker.reviews}
              />
            </section>
          </div>

          {/* Right Sidebar (Location, Safety Guidelines, Nearby Workers) */}
          <div className="space-y-4 sm:space-y-6">
            {/* Detailed Location Card */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs sm:shadow-sm space-y-3.5 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2.5 sm:pb-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>কভারেজ এলাকা (Service Location)</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">বিভাগ (Division):</span>
                  <span className="font-bold text-slate-900">{city}</span>
                </div>
                {zilla && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">জেলা (District):</span>
                    <span className="font-bold text-slate-900">{zilla}</span>
                  </div>
                )}
                {upazila && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">উপজেলা / এলাকা:</span>
                    <span className="font-bold text-slate-900">{upazila}</span>
                  </div>
                )}
                {union && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">ইউনিয়ন / ওয়ার্ড:</span>
                    <span className="font-bold text-slate-900">{union}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Safety & Hiring Guide Card */}
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-emerald-950 text-white space-y-3 shadow-sm relative overflow-hidden border border-emerald-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>নিরাপত্তা পরামর্শ • Safety Tip</span>
              </div>
              <h4 className="font-extrabold text-sm text-white">কাজ করানোর আগে লক্ষণীয়:</h4>
              <ul className="text-xs text-emerald-200/90 space-y-2 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>কাজ শুরু করার আগে মজুরি বা চার্জ কথা বলে নির্ধারণ করে নিন।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>জরুরি বা বড় কাজের ক্ষেত্রে কাজের সময়সীমা ও মালামাল তালিকা বুঝে নিন।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>কাজ শেষ হলে সততার সাথে আপনার অভিজ্ঞতা ও রিভিউ প্ল্যাটফর্মে শেয়ার করুন।</span>
                </li>
              </ul>
            </div>

            {/* Related Workers Box */}
            {relatedWorkers.length > 0 && (
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-xs sm:shadow-sm space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center justify-between">
                  <span>নিকটস্থ অন্যান্য মিস্ত্রি</span>
                  <span className="text-xs text-emerald-600 font-normal">Related</span>
                </h3>
                <div className="space-y-2.5 sm:space-y-3">
                  {relatedWorkers.map((rw) => (
                    <div
                      key={rw.id}
                      className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/workers/${rw.slug}`}
                            className="font-bold text-slate-900 text-xs hover:text-emerald-600 transition-colors block truncate"
                          >
                            {rw.full_name}
                          </Link>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {rw.service_type} • {rw.city}
                          </p>
                        </div>
                        <span className="text-xs text-amber-600 font-bold shrink-0">
                          ★ {Number(rw.rating ?? 5.0).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold">{rw.experienceDisplay}</span>
                        <Link
                          href={`/workers/${rw.slug}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shrink-0"
                        >
                          প্রোফাইল দেখুন
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Link Footer */}
        <div className="pt-4 sm:pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <Link
            href="/workers"
            className="inline-flex items-center gap-2 font-bold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>সকল মিস্ত্রি ডিরেক্টরিতে ফিরে যান</span>
          </Link>
          <Link
            href="/join-worker"
            className="font-bold text-emerald-600 hover:underline"
          >
            আপনিও মিস্ত্রি হিসেবে রেজিস্ট্রেশন করুন →
          </Link>
        </div>
      </div>
    </main>
  );
}
