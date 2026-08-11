import React from "react";
import Link from "next/link";
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

export const dynamic = "force-dynamic";
export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug.toLowerCase();

  const worker = await prisma.workerProfile.findUnique({
    where: { slug },
    include: {
      category: true,
      location: true,
    },
  });

  if (!worker) {
    return {
      title: "Worker Profile Not Found | Sromojibi",
      description: "The requested worker profile could not be found in Sromojibi directory.",
    };
  }

  const title = `${worker.full_name} - ${worker.service_type} in ${worker.city} | Sromojibi (শ্রমজীবী)`;
  const description = `${worker.full_name} - ${worker.experience} অভিজ্ঞতা সম্পন্ন ${worker.service_type} (${worker.city})। সরাসরি যোগাযোগের নম্বর: ${worker.phone}। Find verified ${worker.service_type} in ${worker.city} on Sromojibi.`;

  return {
    title,
    description,
    keywords: [
      worker.full_name,
      `${worker.service_type} ${worker.city}`,
      `${worker.service_type} bangladesh`,
      "sromojibi worker profile",
      "local mistri contact",
    ],
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function WorkerProfilePage({ params }: Props) {
  const slug = params.slug.toLowerCase();

  // Fetch full worker profile details
  const worker = await prisma.workerProfile.findUnique({
    where: { slug },
    include: {
      category: true,
      location: true,
      divisionRef: true,
      districtRef: true,
      upazilaRef: true,
      unionRef: true,
      reviews: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!worker) {
    notFound();
  }

  // Fetch related/recommended approved workers (same category or city)
  const relatedWorkers = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      id: { not: worker.id },
      OR: [
        { fk_category_id: worker.fk_category_id ?? -1 },
        { service_type: { equals: worker.service_type, mode: "insensitive" } },
        { city: { equals: worker.city, mode: "insensitive" } },
      ],
    },
    take: 3,
    orderBy: { rating: "desc" },
    include: {
      category: { select: { icon: true, name: true } },
    },
  });

  // Generate Schema.org structured data for SEO (LocalBusiness / Person)
  const workerSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: worker.full_name,
    description: worker.details || `${worker.service_type} services in ${worker.city}`,
    telephone: worker.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: worker.upazila || worker.city,
      addressRegion: worker.zilla || worker.city,
      addressCountry: "BD",
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

  const ratingVal = Number(worker.rating ?? 5.0).toFixed(1);
  const iconEmoji = worker.category?.icon || "👷‍♂️";

  // Skill tags based on trade
  const skillChips = [
    worker.service_type,
    `${worker.city} কভারেজ`,
    "জরুরি হোম সার্ভিস",
    "সরাসরি ফোন সার্ভিস",
    worker.experience ? `${worker.experience} অভিজ্ঞতা` : "অভিজ্ঞ কারিগর",
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workerSchema) }}
      />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            হোম (Home)
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/workers" className="hover:text-emerald-600 transition-colors">
            মিস্ত্রি ডিরেক্টরি (Directory)
          </Link>
          {worker.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href={`/categories/${worker.category.slug}`} className="hover:text-emerald-600 transition-colors">
                {worker.category.name_bn || worker.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{worker.full_name}</span>
        </nav>

        {/* Worker Hero Profile Header Card */}
        <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Top Decorative Background Bar */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
            <div className="flex items-start sm:items-center gap-5">
              {/* Avatar Icon */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 border-2 border-emerald-300 flex items-center justify-center font-black text-3xl sm:text-4xl shadow-inner">
                  {iconEmoji}
                </div>
                {worker.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white rounded-full p-1.5 shadow-md border-2 border-white" title="Verified Worker">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Name & Basic Info */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {worker.full_name}
                  </h1>
                  {worker.is_verified ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      ভেরিফাইড মিস্ত্রি
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">
                      তালিকাভুক্ত কারিগর
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span>{worker.service_type}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">{worker.city}</span>
                </p>

                {/* Rating & Reviews summary */}
                <div className="flex items-center gap-3 pt-0.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{ratingVal} / 5.0</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    ({worker.review_count}টি কাস্টমার রিভিউ)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Tag */}
            <div className="shrink-0 flex sm:flex-col items-end gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
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
              phone={worker.phone}
              fullName={worker.full_name}
              serviceType={worker.service_type}
            />
          </div>
        </section>

        {/* Highlights Stat Cards Grid */}
        <section aria-label="Worker Stats" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>অভিজ্ঞতা (Exp.)</span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900">
              {worker.experience || "অভিজ্ঞ"}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>এলাকা (Location)</span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 truncate">
              {worker.upazila || worker.city}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Wrench className="w-4 h-4 text-cyan-600" />
              <span>সেবার ধরণ</span>
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 truncate">
              {worker.service_type}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ভেরিফিকেশন</span>
            </div>
            <p className="text-base sm:text-lg font-black text-emerald-700">
              {worker.is_verified ? "ভেরিফাইড" : "তালিকাভুক্ত"}
            </p>
          </div>
        </section>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Main Details & Reviews) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service & Skill Details Card */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>🛠️</span> সেবা ও দক্ষতার বিবরণ (Services & Specialty)
                </h2>
                <p className="text-xs text-slate-500">
                  {worker.full_name} এর প্রদানকৃত সার্ভিস ও কাজের অভিজ্ঞতা
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed font-normal">
                  {worker.details ||
                    `${worker.full_name} একজন দক্ষ ${worker.service_type}। তিনি ${worker.city} এবং আশেপাশের এলাকায় বিশ্বস্ততার সাথে বাসাবাড়ি ও অফিসের সেবা প্রদান করে আসছেন।`}
                </div>

                {/* Skill Chips */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    বিশেষ দক্ষতা সমূহ (Key Specialty)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillChips.map((chip, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold"
                      >
                        ✓ {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
              <WorkerReviewSection
                workerSlug={worker.slug}
                initialReviews={worker.reviews}
              />
            </section>
          </div>

          {/* Right Sidebar (Location, Safety Guidelines, Nearby Workers) */}
          <div className="space-y-6">
            {/* Detailed Location Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>কভারেজ এলাকা (Service Location)</span>
              </h3>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">বিভাগ (Division):</span>
                  <span className="font-bold text-slate-900">{worker.divisionRef?.title_bn || worker.city}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">জেলা (District):</span>
                  <span className="font-bold text-slate-900">{worker.districtRef?.title_bn || worker.zilla || worker.city}</span>
                </div>
                {worker.upazila && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">উপজেলা (Upazila):</span>
                    <span className="font-bold text-slate-900">{worker.upazilaRef?.title_bn || worker.upazila}</span>
                  </div>
                )}
                {worker.village && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">গ্রাম / মহল্লা:</span>
                    <span className="font-bold text-slate-900">{worker.village}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Safety & Hiring Guide Card */}
            <div className="p-6 rounded-3xl bg-emerald-950 text-white space-y-3 shadow-md relative overflow-hidden border border-emerald-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-emerald-400" />
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
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>নিকটস্থ অন্যান্য মিস্ত্রি</span>
                  <span className="text-xs text-emerald-600 font-normal">Related</span>
                </h3>
                <div className="space-y-3">
                  {relatedWorkers.map((rw) => (
                    <div
                      key={rw.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-400 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/workers/${rw.slug}`}
                            className="font-bold text-slate-900 text-xs hover:text-emerald-600 transition-colors"
                          >
                            {rw.full_name}
                          </Link>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {rw.service_type} • {rw.city}
                          </p>
                        </div>
                        <span className="text-xs text-amber-600 font-bold">
                          ★ {Number(rw.rating ?? 5.0).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold">{rw.experience}</span>
                        <a
                          href={`tel:${rw.phone}`}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all"
                        >
                          কল করুন
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Link Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/workers"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল মিস্ত্রি ডিরেক্টরিতে ফিরে যান</span>
          </Link>
          <Link
            href="/join-worker"
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            আপনিও মিস্ত্রি হিসেবে রেজিস্ট্রেশন করুন →
          </Link>
        </div>
      </div>
    </main>
  );
}
