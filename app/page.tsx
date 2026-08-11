import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import NewsletterSection from "@/components/NewsletterSection";
import HomeFaqAccordion from "@/components/HomeFaqAccordion";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const metadata: Metadata = {
  title: "Sromojibi (শ্রমজীবী) - Find Trusted Local Workers & Mistri in Bangladesh",
  description:
    "বাংলাদেশে দক্ষ ইলেকট্রিশিয়ান, প্লাম্বার, টাইলস মিস্ত্রি, রাজমিস্ত্রি, রং মিস্ত্রি ও বিশ্বস্ত টেকনিশিয়ান খুঁজুন সহজে। Discover skilled local trade workers across Bangladesh on Sromojibi directory.",
  keywords: [
    "শ্রমজীবী",
    "মিস্ত্রি বাংলাদেশ",
    "রাজমিস্ত্রি",
    "ইলেকট্রিশিয়ান ঢাকা",
    "প্লাম্বার",
    "টাইলস মিস্ত্রি",
    "রং মিস্ত্রি",
    "worker directory bangladesh",
    "mistri bangladesh",
    "rajmistri bangladesh",
    "electrician dhaka",
    "plumber bangladesh",
    "home service bangladesh",
    "local trade workers near me",
    "kajer lok directory",
    "sromojibi worker list",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Sromojibi (শ্রমজীবী) - Find Trusted Local Workers in Bangladesh",
    description:
      "বাংলাদেশে দক্ষ ইলেকট্রিশিয়ান, প্লাম্বার, টাইলস মিস্ত্রি, রাজমিস্ত্রি, রং মিস্ত্রি ও বিশ্বস্ত টেকনিশিয়ান খুঁজুন সহজে।",
    url: siteUrl,
    siteName: "Sromojibi",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sromojibi (শ্রমজীবী) - Find Trusted Local Workers in Bangladesh",
    description:
      "বাংলাদেশে দক্ষ ইলেকট্রিশিয়ান, প্লাম্বার, টাইলস মিস্ত্রি, রাজমিস্ত্রি, রং মিস্ত্রি ও বিশ্বস্ত টেকনিশিয়ান খুঁজুন সহজে।",
  },
};

const categories = [
  { name: "Rajmistri (রাজমিস্ত্রি)", icon: "🏠", slug: "rajmistri", description: "বাড়ি নির্মাণ, ইট গাথুনি ও ঢালাই কাজের কারিগর" },
  { name: "Electrician (ইলেকট্রিশিয়ান)", icon: "⚡", slug: "electrician", description: "ওয়ারিং, সার্কিট, সকেট ও লাইটিং মেরামত" },
  { name: "Plumber (প্লাম্বার)", icon: "🚰", slug: "plumber", description: "পাইপ ফিটিং, পানির পাম্প ও স্যানিটারি সমাধান" },
  { name: "Tiles Worker (টাইলস মিস্ত্রি)", icon: "🧱", slug: "tiles-worker", description: "মেঝে ও দেয়ালের আকর্ষণীয় টাইলস ফিটিং" },
  { name: "Painter (রং মিস্ত্রি)", icon: "🎨", slug: "painter", description: "ইনটেরিয়র ও এক্সটেরিয়র কালার ও পুটিং বিশেষজ্ঞ" },
  { name: "Carpenter (কাঠের মিস্ত্রি)", icon: "🔨", slug: "carpenter", description: "ফার্নিচার তৈরি, ডোর ফিটিং ও কাঠের কাজ" },
  { name: "AC Technician (এসি মিস্ত্রি)", icon: "❄️", slug: "ac-technician", description: "এসি সার্ভিসিং, গ্যাস রিফিল ও ডায়াগনোসিস" },
  { name: "CCTV Installer (সিসিটিভি টেকনিশিয়ান)", icon: "📹", slug: "cctv-installer", description: "সিকিউরিটি ক্যামেরা সেটআপ ও নেটওয়ার্কিং" },
];

const cities = [
  { name: "Dhaka (ঢাকা)", count: "শীঘ্রই আসছে", slug: "dhaka", popular: true },
  { name: "Chittagong (চট্টগ্রাম)", count: "শীঘ্রই আসছে", slug: "chittagong", popular: true },
  { name: "Mymensingh (ময়মনসিংহ)", count: "শীঘ্রই আসছে", slug: "mymensingh", popular: true },
  { name: "Sylhet (সিলেট)", count: "শীঘ্রই আসছে", slug: "sylhet", popular: false },
  { name: "Rajshahi (রাজশাহী)", count: "শীঘ্রই আসছে", slug: "rajshahi", popular: false },
  { name: "Khulna (খুলনা)", count: "শীঘ্রই আসছে", slug: "khulna", popular: false },
];

const faqs = [
  {
    question: "শ্রমজীবী (Sromojibi) প্ল্যাটফর্ম কি?",
    answer:
      "শ্রমজীবী হলো বাংলাদেশের সকল দক্ষ মিস্ত্রি, টেকনিশিয়ান ও কারিগরদের একটি ডিজিটাল ডিরেক্টরি প্ল্যাটফর্ম। আমাদের উদ্দেশ্য হলো আপনার আশেপাশের বিশ্বস্ত ইলেকট্রিশিয়ান, প্লাম্বার, রাজমিস্ত্রিদের সহজে খুঁজে পাওয়া নিশ্চিত করা।",
  },
  {
    question: "মিস্ত্রি বা টেকনিশিয়ানরা কীভাবে যুক্ত হবেন?",
    answer:
      "যেকোনো মিস্ত্রি বা কারিগর ফ্রী প্রোফাইল তৈরি করে তাদের নাম, যোগাযোগের ফোন নম্বর, কাজের ক্যাটাগরি এবং নিজ এলাকার বিবরণ যুক্ত করতে পারবেন।",
  },
  {
    question: "শ্রমজীবী সেবা ব্যবহার করা কি সম্পূর্ণ ফ্রি?",
    answer:
      "হ্যাঁ, আমাদের ডিরেক্টরিতে মিস্ত্রিদের তথ্য তালিকাভুক্ত করা এবং সাধারণ কাস্টমারদের নিকটস্থ টেকনিশিয়ান খোঁজা ১০০% বিনামূল্যে (Free Period)।",
  },
  {
    question: "আমি কিভাবে নিকটস্থ ভালো মিস্ত্রি বেছে নেব?",
    answer:
      "আপনার জেলা বা শহর সিলেক্ট করে প্রয়োজনীয় ক্যাটাগরি (যেমন: ইলেকট্রিশিয়ান বা প্লাম্বার) লিখে সার্চ করুন। মিস্ত্রিদের অভিজ্ঞতা ও আগের কাজ দেখে সরাসরি কল করে কথা বলুন।",
  },
];

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* FAQ Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Hero Section */}
      <section className="relative py-20 lg:py-28 px-4 border-b border-gray-200/80 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/20 via-slate-50/50 to-slate-50 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs md:text-sm font-semibold tracking-wide shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            🇧🇩 বাংলাদেশের বিশ্বস্ত মিস্ত্রি ও কর্মী ডিরেক্টরি
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            আপনার এলাকায় অভিজ্ঞ{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              মিস্ত্রি ও দক্ষ কারিগর
            </span>{" "}
            খুঁজুন সহজে
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed">
            শ্রমজীবী (Sromojibi) প্ল্যাটফর্মের মাধ্যমে আপনার আশেপাশে থাকা ইলেকট্রিশিয়ান, প্লাম্বার, টাইলস মিস্ত্রি, রাজমিস্ত্রি ও অভিজ্ঞ টেকনিশিয়ানদের সাথে সরাসরি যোগাযোগ করুন।
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join-worker"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>👷‍♂️</span> মিস্ত্রি হিসেবে যুক্ত হন (Join Free)
            </Link>
            <a
              href="#notify-section"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-semibold text-base shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>🔔</span> নতুন আপডেটে যুক্ত থাকুন (Get Notified)
            </a>
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="text-emerald-600 font-bold text-xs uppercase tracking-widest">কেন শ্রমজীবী? • The Challenge</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
            জরুরি প্রয়োজনে ভালো মিস্ত্রি খুঁজে পাওয়া এখনো কঠিন?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto pt-2">
            বাংলাদেশে প্রতিদিন লাখো দক্ষ কারিগর সেবা দিচ্ছেন, কিন্তু প্রয়োজনের মুহূর্তে পরিচিত কারও সাহায্য ছাড়া সঠিক টেকনিশিয়ান খুঁজে পাওয়া সত্যি কষ্টসাধ্য। আমরা সেই সমস্যার সমাধান এনেছি।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">খুঁজে পাওয়ার জটিলতা (Hard to Search)</h3>
              <p className="text-sm text-gray-600">জরুরি প্লাম্বিং বা ইলেকট্রিক সমস্যায় পরিচিত মিস্ত্রির ফোন নম্বর না থাকলে বিপদে পড়তে হয়।</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">ডিজিটাল প্রোফাইলের অভাব (No Online Presence)</h3>
              <p className="text-sm text-gray-600">দক্ষ ও অভিজ্ঞ কাজ জানা সত্ত্বেও অনেক মিস্ত্রির অনলাইনে কোনো পরিচিতি বা প্রোফাইল থাকে না।</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-3">📍</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">কাছের লোক খুঁজে পাওয়ার উপায় (Neighborhood Match)</h3>
              <p className="text-sm text-gray-600">আপনার মহল্লায় বা আশেপাশে ভালো কোন কারিগর আছেন তা জানতে আমাদের লোকেশন ডিরেক্টরি সহায়তা করে।</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider">
              জনপ্রিয় সেবা সমূহ • Service Directory
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">আপনার প্রয়োজনীয় মিস্ত্রি বেছে নিন</h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              ক্যাটাগরি সিলেক্ট করে বাংলাদেশের দক্ষ কারিগরদের কাজের বিবরণ ও পরিচিতি দেখুন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 shadow-sm"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cat.description}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>মিস্ত্রিদের তালিকা দেখুন</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              সবগুলো সেবা ক্যাটাগরি একসাথে দেখুন (All Categories) →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. For Workers Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-gradient-to-b from-slate-50 via-emerald-50/40 to-slate-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              দক্ষ কারিগর ও মিস্ত্রিদের জন্য • For Workers
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              আপনি কি একজন অভিজ্ঞ মিস্ত্রি বা টেকনিশিয়ান?
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              আজই শ্রমজীবী (Sromojibi) প্ল্যাটফর্মে আপনার ফ্রী প্রোফাইল খুলুন। আপনার এলাকার কাস্টমারদের কাছে নিজের কাজের অভিজ্ঞতা ও সেবার পরিচিতি ছড়িয়ে দিয়ে আয় বৃদ্ধি করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span> সম্পূর্ণ ফ্রি তালিকাভুক্তি (Free Profile)
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span> সরাসরি নতুন কাস্টমারের কল (More Reach)
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span> কাজের সম্মান ও সুনাম বৃদ্ধি (Reputation)
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span> নিজ এলাকায় দ্রুত পরিচিতি (Local Visibility)
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/join-worker"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                ফ্রি রেজিস্টার করুন (Register Free)
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gray-200/80 space-y-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <span className="text-sm font-semibold text-gray-700">প্রোফাইল প্রিভিউ (Directory Preview)</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">ফ্রি তালিকা</span>
            </div>
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="font-bold text-gray-900">ইলেকট্রিশিয়ান প্রোফাইল</div>
                  <div className="text-xs text-gray-500">ওয়ারিং, সার্কিট, সুইচবোর্ড ও হোম অ্যাপ্লায়েন্স মেরামত</div>
                  <div className="text-xs text-emerald-700 font-medium mt-1">📍 ঢাকা বিভাগ • ৫+ বছরের অভিজ্ঞতা</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
                  🏠
                </div>
                <div>
                  <div className="font-bold text-gray-900">রাজমিস্ত্রি প্রোফাইল</div>
                  <div className="text-xs text-gray-500">গাথুনি, প্লাস্টার, বিম ও ছাদ ঢালাইয়ের কাজ</div>
                  <div className="text-xs text-emerald-700 font-medium mt-1">📍 ময়মনসিংহ • ভেরিফাইড কারিগর</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. For Customers Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-white">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold uppercase tracking-wider">
              গ্রাহক ও গৃহস্থদের জন্য • For Homeowners
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">কাজের জন্য সেরা মিস্ত্রি খুঁজছেন?</h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              খুব শীঘ্রই আপনি আপনার সুনির্দিষ্ট চাহিদা অনুযায়ী এলাকাভিত্তিক টেকনিশিয়ান খুঁজে নিতে পারবেন:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 text-left space-y-2 hover:shadow-md transition-all">
              <div className="text-2xl text-emerald-600">📍</div>
              <h3 className="font-bold text-gray-900 text-base">✓ এলাকাভিত্তিক সন্ধান (Location)</h3>
              <p className="text-xs text-gray-500">আপনার নিজস্ব জেলা, থানা বা মহল্লার নিকটস্থ মিস্ত্রিদের খুঁজুন।</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 text-left space-y-2 hover:shadow-md transition-all">
              <div className="text-2xl text-teal-600">🛠️</div>
              <h3 className="font-bold text-gray-900 text-base">✓ সেবার ধরন (Service Type)</h3>
              <p className="text-xs text-gray-500">ইলেকট্রিক, প্লাম্বিং, স্যানিটারি বা টাইলসের ফিল্টার সুবিধা।</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 text-left space-y-2 hover:shadow-md transition-all">
              <div className="text-2xl text-cyan-600">⭐</div>
              <h3 className="font-bold text-gray-900 text-base">✓ কাজের অভিজ্ঞতা (Experience)</h3>
              <p className="text-xs text-gray-500">কত বছরের অভিজ্ঞতা ও কোন কাজগুলো ভালো পারেন তা জেনে নিন।</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 text-left space-y-2 hover:shadow-md transition-all">
              <div className="text-2xl text-emerald-600">💬</div>
              <h3 className="font-bold text-gray-900 text-base">✓ সৎ মতামত ও রিভিউ (Reviews)</h3>
              <p className="text-xs text-gray-500">অন্যান্য কাস্টমারদের ফিডব্যাক ও মতামত দেখে সিদ্ধান্ত নিন।</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Launch Area Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              কভারেজ এলাকা • Launch Locations
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">বাংলাদেশে আমাদের প্রথম পর্যায়ের সেবা</h2>
            <p className="text-gray-600 text-base max-w-xl mx-auto">
              বাংলাদেশের প্রধান প্রধান বিভাগীয় শহর ও অর্থনৈতিক কেন্দ্রগুলোতে সেবা বিস্তৃত করা হচ্ছে।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/locations/${city.slug}`}
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-500/50 hover:shadow-md transition-all text-center group"
              >
                <div className="text-2xl mb-2">🏙️</div>
                <div className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{city.name}</div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-emerald-700 mt-1">
                  {city.count}
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              সকল সমর্থিত এলাকা ও শহর দেখুন (All Locations) →
            </Link>
          </div>
        </div>
      </section>

      {/* Early Access Newsletter Section */}
      <NewsletterSection />

      {/* 7. FAQ Section (SEO) */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900">সাধারণ জিজ্ঞাসাবলী (Frequently Asked Questions)</h2>
            <p className="text-gray-600 text-sm">শ্রমজীবী (Sromojibi) ডিরেক্টরি প্ল্যাটফর্ম সম্পর্কে আপনার জানা তথ্যসমূহ</p>
          </div>

          <HomeFaqAccordion faqs={faqs} />
        </div>
      </section>
    </main>
  );
}

